import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { recoverAtomicDirectory, replaceDirectoryAtomically } from './atomic-directory';
import {
  createPublicRuntimeEntry,
  createPublicTypeEntry,
  createRuntimeModule
} from './package-entry';

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distRoot = resolve(repoRoot, 'dist');
const stagingRoot = resolve(repoRoot, 'dist.__staging__');
const backupRoot = resolve(repoRoot, 'dist.__previous__');
const runtimeModuleNames = ['brand-assets', 'credit-assets', 'preferences', 'shortcuts', 'split-pane', 'tokens'] as const;
const atomicPaths = { backupRoot, stagingRoot, targetRoot: distRoot };

for (const path of [distRoot, stagingRoot, backupRoot]) {
  assertInsideRepo(path);
}

await recoverAtomicDirectory(atomicPaths);
await mkdir(stagingRoot, { recursive: true });

try {
  await buildPackage(stagingRoot);
  assertCompletedPackage(stagingRoot);
  await replaceDirectoryAtomically(atomicPaths);
} catch (error) {
  await rm(stagingRoot, { force: true, recursive: true });
  throw error;
}

async function buildPackage(outputRoot: string): Promise<void> {
  await cp(resolve(repoRoot, 'src/lib'), outputRoot, { recursive: true });
  await cp(resolve(repoRoot, 'src/styles'), resolve(outputRoot, 'styles'), { recursive: true });
  await cp(resolve(repoRoot, 'tokens'), resolve(outputRoot, 'tokens'), { recursive: true });
  await cp(resolve(repoRoot, 'schemas'), resolve(outputRoot, 'schemas'), { recursive: true });
  await cp(resolve(repoRoot, 'share.js'), resolve(outputRoot, 'share.js'));
  await cp(resolve(repoRoot, 'share.d.ts'), resolve(outputRoot, 'share.d.ts'));

  const publicEntrySource = await readFile(resolve(repoRoot, 'src/lib/index.ts'), 'utf8');

  /**
   * mf:anchor zdp.design-system.package-entry-generation
   * purpose: Locate generation of package runtime and type entrypoints from the public barrel.
   * search: package build, dist index, public entry, runtime module, type entry
   * invariant: A complete staging tree preserves every exported declaration before it replaces dist.
   * risk: config
   */
  await writeFile(resolve(outputRoot, 'index.js'), createPublicRuntimeEntry(publicEntrySource));
  await writeFile(resolve(outputRoot, 'index.d.ts'), createPublicTypeEntry(publicEntrySource));

  for (const moduleName of runtimeModuleNames) {
    const source = await readFile(resolve(repoRoot, `src/lib/${moduleName}.ts`), 'utf8');
    await writeFile(
      resolve(outputRoot, `${moduleName}.js`),
      createRuntimeModule(source, `src/lib/${moduleName}.ts`)
    );
  }
}

function assertCompletedPackage(outputRoot: string): void {
  const requiredPaths = [
    'index.js',
    'index.d.ts',
    'styles/index.css',
    'styles/components.css',
    'styles/tokens.css',
    'tokens/zdp.tokens.json',
    'schemas/design-tokens.schema.json',
    ...runtimeModuleNames.map((moduleName) => `${moduleName}.js`)
  ];

  for (const relativePath of requiredPaths) {
    if (!existsSync(resolve(outputRoot, relativePath))) {
      throw new Error(`Package staging output is incomplete: ${relativePath}`);
    }
  }
}

function assertInsideRepo(path: string): void {
  const normalizedRepo = repoRoot.endsWith(sep) ? repoRoot : `${repoRoot}${sep}`;

  if (path !== repoRoot && !path.startsWith(normalizedRepo)) {
    throw new Error(`Refusing to write outside repository: ${path}`);
  }

  if (![distRoot, stagingRoot, backupRoot].includes(path) && basename(path).startsWith('dist.')) {
    throw new Error(`Unexpected package output path: ${path}`);
  }
}

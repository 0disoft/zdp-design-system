/* llmnav/1 module
id=zdp.design.package.build
role=Assemble and validate a complete package staging tree before publishing it locally.
owns=package assembly|runtime and type entry generation
excludes=npm publication|token value design
search=package entrypoints|패키지 진입점|타입 진입점
invariant=The staging tree must contain all required public files before replacing the package output.
stability=architecture
*/

import { existsSync, readdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { cp, mkdir, readFile, rm } from 'node:fs/promises';
import { basename, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withAtomicDirectory } from './atomic-directory';
import {
  type PublicComponentExport,
  writePublicComponentStyleEntries
} from './component-style-entries';
import { publicRuntimeModuleNames } from './public-surface';

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distRoot = resolve(repoRoot, 'dist');
const stagingRoot = resolve(repoRoot, 'dist.__staging__');
const backupRoot = resolve(repoRoot, 'dist.__previous__');
const atomicPaths = { backupRoot, stagingRoot, targetRoot: distRoot };

for (const path of [distRoot, stagingRoot, backupRoot]) {
  assertInsideRepo(path);
}

await withAtomicDirectory(atomicPaths, async (transaction) => {
  await transaction.recover();
  await mkdir(stagingRoot, { recursive: true });

  try {
    const publicComponents = await buildPackage(stagingRoot);
    assertCompletedPackage(stagingRoot, publicComponents);
    await transaction.replace();
  } catch (error) {
    await rm(stagingRoot, { force: true, recursive: true });
    throw error;
  }
});

async function buildPackage(outputRoot: string): Promise<readonly PublicComponentExport[]> {
  /**
   * mf:anchor zdp.design-system.package-entry-generation
   * purpose: Compile runtime modules, Svelte components and declarations before atomic promotion.
   * search: package build, dist index, public entry, component CSS entry, type entry
   * invariant: Compiler output and generated component CSS must be complete before replacing dist.
   * risk: config
   */
  const compiler = spawn(process.execPath, [
    'run', '--bun', 'svelte-package',
    '--input', 'src/lib', '--output', outputRoot, '--tsconfig', 'tsconfig.package.json'
  ], { cwd: repoRoot, stdio: 'inherit' });
  const status = await new Promise<number | null>((resolveStatus, reject) => {
    compiler.once('error', reject);
    compiler.once('close', resolveStatus);
  });
  if (status !== 0) throw new Error('Svelte package compilation failed; previous dist was preserved.');
  await cp(resolve(repoRoot, 'src/styles'), resolve(outputRoot, 'styles'), {
    recursive: true,
    filter: (source) => source !== resolve(repoRoot, 'src/styles/component-utilities.css')
  });
  await cp(resolve(repoRoot, 'tokens'), resolve(outputRoot, 'tokens'), { recursive: true });
  await cp(resolve(repoRoot, 'schemas'), resolve(outputRoot, 'schemas'), { recursive: true });

  const publicEntrySource = await readFile(resolve(repoRoot, 'src/lib/index.ts'), 'utf8');
  const publicComponents = await writePublicComponentStyleEntries({
    componentDirectory: resolve(repoRoot, 'src/lib/components'),
    outputDirectory: resolve(outputRoot, 'styles/components'),
    publicEntrySource
  });

  return publicComponents;
}

function assertCompletedPackage(
  outputRoot: string,
  publicComponents: readonly PublicComponentExport[]
): void {
  for (const file of readdirSync(outputRoot, { recursive: true })) {
    if (typeof file === 'string' && /\.(?:[cm]?ts|tsx)$/.test(file) && !/\.d\.[cm]?ts$/.test(file)) {
      throw new Error(`Package output must not contain raw TypeScript: ${file}`);
    }
  }
  const requiredPaths = [
    'index.js',
    'index.d.ts',
    'styles/index.css',
    'styles/foundation.css',
    'styles/components.css',
    'styles/tokens.css',
    ...publicComponents.map((component) => `styles/components/${component.name}.css`),
    ...publicComponents.map((component) => `components/${component.name}.svelte.d.ts`),
    'tokens/zdp.tokens.json',
    'schemas/design-tokens.schema.json',
    ...publicRuntimeModuleNames.flatMap((moduleName) => [`${moduleName}.js`, `${moduleName}.d.ts`])
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

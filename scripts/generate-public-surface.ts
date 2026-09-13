import { readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  expectedPackageExports,
  publicAssetSourcePaths,
  publicComponentSourcePaths,
  publicModuleSourcePaths,
  renderPublicBarrel,
  renderPublicSurfaceDocumentation
} from './public-surface';

interface PackageJson {
  readonly [key: string]: unknown;
  readonly exports?: unknown;
}

interface GeneratedOutput {
  readonly path: string;
  readonly content: string;
  readonly label: string;
}

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const packagePath = resolve(repoRoot, 'package.json');
const checkOnly = process.argv.includes('--check');
const packageSource = await readFile(packagePath, 'utf8');
const packageJson = parsePackageJson(packageSource);
const manifestSourcePaths = [
  ...publicComponentSourcePaths,
  ...publicModuleSourcePaths,
  ...publicAssetSourcePaths
] as const;
const outputs: readonly GeneratedOutput[] = [
  {
    path: resolve(repoRoot, 'src/lib/index.ts'),
    content: renderPublicBarrel(),
    label: 'src/lib/index.ts'
  },
  {
    path: resolve(repoRoot, 'docs/PUBLIC_SURFACE.md'),
    content: renderPublicSurfaceDocumentation(),
    label: 'docs/PUBLIC_SURFACE.md'
  },
  {
    path: packagePath,
    content: renderPackageJson(packageJson),
    label: 'package.json exports'
  }
];

await assertManifestSources();

if (checkOnly) {
  const results = await Promise.all(outputs.map((output) => assertSynced(output)));

  if (results.includes(false)) {
    process.exit(1);
  }
} else {
  for (const { path, content } of outputs) {
    await writeFile(path, content);
  }
}

async function assertManifestSources(): Promise<void> {
  const failures: string[] = [];

  for (const relativePath of manifestSourcePaths) {
    const fullPath = resolve(repoRoot, relativePath);

    try {
      const metadata = await stat(fullPath);

      if (!metadata.isFile()) {
        failures.push(`${relativePath} is not a file.`);
      }
    } catch (error) {
      if (isNodeError(error) && error.code === 'ENOENT') {
        failures.push(`${relativePath} does not exist.`);
        continue;
      }

      throw error;
    }
  }

  if (failures.length > 0) {
    throw new Error(`Public surface manifest contains invalid source paths:\n- ${failures.join('\n- ')}`);
  }
}

function parsePackageJson(source: string): PackageJson {
  const parsed: unknown = JSON.parse(source);

  if (!isRecord(parsed)) {
    throw new Error('package.json must contain a JSON object.');
  }

  return parsed;
}

function renderPackageJson(packageJson: PackageJson): string {
  return `${JSON.stringify({ ...packageJson, exports: expectedPackageExports }, null, 2)}\n`;
}

async function assertSynced(output: GeneratedOutput): Promise<boolean> {
  let current: string;

  try {
    current = await readFile(output.path, 'utf8');
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      console.error(`${output.label} is missing. Run \`bun run surface:generate\`.`);
      return false;
    }

    throw error;
  }

  if (current === output.content) {
    return true;
  }

  console.error(`${output.label} is out of sync with scripts/public-surface.ts. Run \`bun run surface:generate\`.`);
  return false;
}

function isRecord(value: unknown): value is PackageJson {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

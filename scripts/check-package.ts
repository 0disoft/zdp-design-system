import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { compile, type Warning } from 'svelte/compiler';

interface PackageJson {
  readonly version?: string;
  readonly exports?: Record<string, unknown>;
  readonly files?: readonly string[];
  readonly sideEffects?: readonly string[];
  readonly scripts?: Record<string, string>;
}

const root = process.cwd();
const packagePath = join(root, 'package.json');
const componentPaths = [
  'src/lib/components/Badge.svelte',
  'src/lib/components/Breadcrumb.svelte',
  'src/lib/components/Button.svelte',
  'src/lib/components/Callout.svelte',
  'src/lib/components/Checkbox.svelte',
  'src/lib/components/Dialog.svelte',
  'src/lib/components/ErrorText.svelte',
  'src/lib/components/Field.svelte',
  'src/lib/components/HelpText.svelte',
  'src/lib/components/IconButton.svelte',
  'src/lib/components/Input.svelte',
  'src/lib/components/Label.svelte',
  'src/lib/components/Radio.svelte',
  'src/lib/components/Select.svelte',
  'src/lib/components/Surface.svelte',
  'src/lib/components/Switch.svelte',
  'src/lib/components/Tabs.svelte',
  'src/lib/components/Textarea.svelte',
  'stories/DesignSystemOverview.svelte'
] as const;
const expectedRootExport = './src/lib/index.ts';
const expectedSubpathExports = {
  './styles.css': './src/styles/index.css',
  './locale-fonts.css': './src/styles/locale-fonts.css',
  './tokens': './tokens/zdp.tokens.json'
} as const;
const expectedPackageFiles = ['src/', 'tokens/', 'docs/', 'README.md', 'CHANGELOG.md'] as const;
const expectedSideEffects = [
  './src/styles/index.css',
  './src/styles/locale-fonts.css',
  './src/styles/tokens.css',
  './src/styles/components.css'
] as const;
const expectedScripts = {
  'consumer:check': 'bun scripts/check-consumer-contract.ts',
  'package:check': 'bun scripts/check-package.ts'
} as const;
const failures: string[] = [];

const packageJson = await readPackageJson(packagePath);

checkPackageScripts(packageJson);
checkPackageExports(packageJson);
checkPackageFiles(packageJson);
checkPackageSideEffects(packageJson);
await checkSvelteCompilation();

if (failures.length > 0) {
  throw new Error(`Package check failed:\n- ${failures.join('\n- ')}`);
}

function checkPackageScripts(packageJson: PackageJson): void {
  for (const [scriptName, expectedCommand] of Object.entries(expectedScripts)) {
    if (packageJson.scripts?.[scriptName] !== expectedCommand) {
      failures.push(`package.json scripts.${scriptName} must be ${expectedCommand}.`);
    }
  }

  if (!packageJson.scripts?.check?.includes('bun scripts/check-package.ts')) {
    failures.push('package.json check script must include package artifact validation.');
  }

  if (!packageJson.scripts?.check?.includes('bun scripts/check-consumer-contract.ts')) {
    failures.push('package.json check script must include consumer contract validation.');
  }
}

function checkPackageExports(packageJson: PackageJson): void {
  const rootExport = packageJson.exports?.['.'];

  if (!isRecord(rootExport)) {
    failures.push('package.json exports["."] must be an object.');
    return;
  }

  for (const condition of ['svelte', 'types', 'default'] as const) {
    if (rootExport[condition] !== expectedRootExport) {
      failures.push(`package.json exports["."].${condition} must be ${expectedRootExport}.`);
    }
  }

  for (const [subpath, expectedPath] of Object.entries(expectedSubpathExports)) {
    if (packageJson.exports?.[subpath] !== expectedPath) {
      failures.push(`package.json exports["${subpath}"] must be ${expectedPath}.`);
      continue;
    }

    assertExistingExportTarget(expectedPath);
  }

  assertExistingExportTarget(expectedRootExport);
}

function checkPackageFiles(packageJson: PackageJson): void {
  if (!Array.isArray(packageJson.files)) {
    failures.push('package.json files must be an array.');
    return;
  }

  for (const expectedPath of expectedPackageFiles) {
    if (!packageJson.files.includes(expectedPath)) {
      failures.push(`package.json files must include ${expectedPath}.`);
    }
  }

  for (const exportTarget of [expectedRootExport, ...Object.values(expectedSubpathExports)]) {
    if (!isCoveredByPackageFiles(packageJson.files, exportTarget)) {
      failures.push(`package.json files does not include export target ${exportTarget}.`);
    }
  }
}

function checkPackageSideEffects(packageJson: PackageJson): void {
  if (!Array.isArray(packageJson.sideEffects)) {
    failures.push('package.json sideEffects must be an array.');
    return;
  }

  for (const expectedPath of expectedSideEffects) {
    if (!packageJson.sideEffects.includes(expectedPath)) {
      failures.push(`package.json sideEffects must include ${expectedPath}.`);
    }

    assertExistingExportTarget(expectedPath);
  }
}

async function checkSvelteCompilation(): Promise<void> {
  for (const relativePath of componentPaths) {
    const fullPath = join(root, relativePath);
    const source = await readFile(fullPath, 'utf8');
    const warnings: Warning[] = [];

    compile(source, {
      css: 'external',
      dev: true,
      filename: relativePath,
      generate: 'client',
      warningFilter(warning) {
        warnings.push(warning);
        return false;
      }
    });

    if (warnings.length > 0) {
      for (const warning of warnings) {
        failures.push(`${relativePath} has Svelte warning ${warning.code}: ${warning.message}`);
      }
    }
  }
}

async function readPackageJson(path: string): Promise<PackageJson> {
  const parsed: unknown = JSON.parse(await readFile(path, 'utf8'));

  if (!isRecord(parsed)) {
    throw new Error('package.json must be a JSON object.');
  }

  return {
    version: typeof parsed.version === 'string' ? parsed.version : undefined,
    exports: isRecord(parsed.exports) ? parsed.exports : undefined,
    files: isStringArray(parsed.files) ? parsed.files : undefined,
    sideEffects: isStringArray(parsed.sideEffects) ? parsed.sideEffects : undefined,
    scripts: isStringRecord(parsed.scripts) ? parsed.scripts : undefined
  };
}

function assertExistingExportTarget(packagePath: string): void {
  const normalizedPath = normalizePackagePath(packagePath);

  if (!existsSync(join(root, normalizedPath))) {
    failures.push(`Package target ${packagePath} does not exist.`);
  }
}

function isCoveredByPackageFiles(files: readonly string[], packagePath: string): boolean {
  const normalizedPath = normalizePackagePath(packagePath);

  return files.some((entry) => {
    const normalizedEntry = normalizePackagePath(entry);

    if (entry.endsWith('/')) {
      return normalizedPath.startsWith(`${normalizedEntry}/`);
    }

    return normalizedPath === normalizedEntry;
  });
}

function normalizePackagePath(value: string): string {
  return relative(root, join(root, value.replace(/^\.\//, ''))).replaceAll('\\', '/');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === 'string');
}

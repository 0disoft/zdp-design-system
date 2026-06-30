import { existsSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

interface PackageJson {
  readonly name?: string;
  readonly version?: string;
  readonly private?: boolean;
  readonly license?: string;
  readonly type?: string;
  readonly description?: string;
  readonly exports?: Record<string, unknown>;
  readonly files?: readonly string[];
  readonly sideEffects?: readonly string[];
  readonly scripts?: Record<string, string>;
  readonly dependencies?: Record<string, string>;
  readonly peerDependencies?: Record<string, string>;
  readonly publishConfig?: Record<string, unknown>;
}

const root = process.cwd();
const packageJson = await readPackageJson(join(root, 'package.json'));
const failures: string[] = [];

const allowedPackageFiles = [
  'dist/',
  'docs/',
  'README.md',
  'LICENSE',
  'CHANGELOG.md',
  'SECURITY.md',
  'THIRD_PARTY_NOTICES.md'
] as const;
const requiredPackagedFiles = [
  'README.md',
  'LICENSE',
  'CHANGELOG.md',
  'SECURITY.md',
  'THIRD_PARTY_NOTICES.md',
  'docs/CONSUMER_CONTRACT.md',
  'docs/EXTERNAL_UI_ADOPTION.md',
  'docs/INTERACTIVE_PRIMITIVE_AUDIT.md',
  'dist/index.js',
  'dist/index.d.ts',
  'dist/share.js',
  'dist/share.d.ts',
  'dist/styles/index.css',
  'dist/styles/components.css',
  'dist/styles/tokens.css',
  'dist/styles/brand-fonts.css',
  'dist/styles/expressive-fonts.css',
  'dist/styles/locale-fonts.css',
  'dist/tokens/zdp.tokens.json',
  'dist/schemas/design-tokens.schema.json'
] as const;
const blockedPackageFileEntries = [
  'src/',
  'stories/',
  'fixtures/',
  'preview/',
  'storybook-static/',
  'tmp/',
  'node_modules/',
  '.github/'
] as const;
const semverPattern = /^\d+\.\d+\.\d+$/;

checkPackageMetadata();
checkPackageFilesWhitelist();
checkRequiredPackagedFilesExist();
checkExports();
checkRuntimeDependencyBoundary();
checkPublishScripts();

if (failures.length > 0) {
  throw new Error(`Publish readiness check failed:\n- ${failures.join('\n- ')}`);
}

console.log('Publish readiness check passed.');

function checkPackageMetadata(): void {
  if (packageJson.name !== 'zdp-design-system') {
    failures.push('package.json name must be zdp-design-system.');
  }

  if (typeof packageJson.version !== 'string' || !semverPattern.test(packageJson.version)) {
    failures.push('package.json version must be an x.y.z semver string.');
  }

  if (packageJson.private !== false) {
    failures.push('package.json private must be false before npm release work.');
  }

  if (packageJson.license !== 'MIT') {
    failures.push('package.json license must be MIT.');
  }

  if (packageJson.type !== 'module') {
    failures.push('package.json type must stay module.');
  }

  if (typeof packageJson.description !== 'string' || packageJson.description.trim().length === 0) {
    failures.push('package.json description must be present for npm package metadata.');
  }

  if (packageJson.publishConfig?.access === 'restricted') {
    failures.push('package.json publishConfig.access must not be restricted for a public package.');
  }
}

function checkPackageFilesWhitelist(): void {
  if (!Array.isArray(packageJson.files)) {
    failures.push('package.json files must be an explicit whitelist.');
    return;
  }

  for (const expectedEntry of allowedPackageFiles) {
    if (!packageJson.files.includes(expectedEntry)) {
      failures.push(`package.json files must include ${expectedEntry}.`);
    }
  }

  for (const entry of packageJson.files) {
    if (!allowedPackageFiles.includes(entry as (typeof allowedPackageFiles)[number])) {
      failures.push(`package.json files must not include unreviewed entry ${entry}.`);
    }
  }

  for (const blockedEntry of blockedPackageFileEntries) {
    if (packageJson.files.includes(blockedEntry)) {
      failures.push(`package.json files must not include ${blockedEntry}.`);
    }
  }
}

function checkRequiredPackagedFilesExist(): void {
  for (const filePath of requiredPackagedFiles) {
    assertExistingFile(filePath);
  }
}

function checkExports(): void {
  const rootExport = packageJson.exports?.['.'];
  const shareExport = packageJson.exports?.['./share'];

  if (!isRecord(rootExport)) {
    failures.push('package.json exports["."] must be an object.');
    return;
  }

  for (const [condition, expectedPath] of Object.entries({
    svelte: './dist/index.js',
    import: './dist/index.js',
    default: './dist/index.js',
    types: './dist/index.d.ts'
  })) {
    if (rootExport[condition] !== expectedPath) {
      failures.push(`package.json exports["."].${condition} must be ${expectedPath}.`);
    }

    assertExistingFile(expectedPath);
    assertPackageFileCovered(expectedPath);
  }

  for (const [condition, target] of Object.entries(rootExport)) {
    if (typeof target === 'string' && target.endsWith('.ts') && !target.endsWith('.d.ts')) {
      failures.push(`package.json exports["."].${condition} must not point at raw TypeScript source.`);
    }
  }

  if (!isRecord(shareExport)) {
    failures.push('package.json exports["./share"] must be an object.');
  } else {
    for (const expectedPath of ['./dist/share.js', './dist/share.d.ts'] as const) {
      assertExistingFile(expectedPath);
      assertPackageFileCovered(expectedPath);
    }
  }

  for (const expectedPath of [
    './dist/styles/index.css',
    './dist/styles/brand-fonts.css',
    './dist/styles/expressive-fonts.css',
    './dist/styles/locale-fonts.css',
    './dist/tokens/zdp.tokens.json'
  ] as const) {
    assertExistingFile(expectedPath);
    assertPackageFileCovered(expectedPath);
  }
}

function checkRuntimeDependencyBoundary(): void {
  if (packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0) {
    failures.push('package.json dependencies must stay empty unless a runtime dependency is intentionally adopted.');
  }

  if (packageJson.peerDependencies?.svelte !== '^5.56.0') {
    failures.push('package.json peerDependencies.svelte must stay ^5.56.0.');
  }
}

function checkPublishScripts(): void {
  if (packageJson.scripts?.['publish:check'] !== 'bun scripts/check-publish-readiness.ts') {
    failures.push('package.json scripts.publish:check must run the publish readiness checker.');
  }

  if (!packageJson.scripts?.check?.includes('bun run publish:check')) {
    failures.push('package.json check script must include publish readiness validation.');
  }

  for (const blockedScriptName of ['prepublish', 'prepublishOnly', 'postpublish']) {
    if (packageJson.scripts?.[blockedScriptName]) {
      failures.push(`package.json scripts.${blockedScriptName} must not automate npm release side effects.`);
    }
  }
}

function assertExistingFile(packagePath: string): void {
  const normalizedPath = normalizePackagePath(packagePath);
  const absolutePath = join(root, normalizedPath);

  if (!existsSync(absolutePath)) {
    failures.push(`Required publish file ${packagePath} does not exist.`);
    return;
  }

  if (!statSync(absolutePath).isFile()) {
    failures.push(`Required publish file ${packagePath} must be a file.`);
  }

  if (extname(normalizedPath) === '.map') {
    failures.push(`Required publish file ${packagePath} must not be a source map.`);
  }
}

function assertPackageFileCovered(packagePath: string): void {
  if (!packageJson.files || !isCoveredByPackageFiles(packageJson.files, packagePath)) {
    failures.push(`package.json files does not cover ${packagePath}.`);
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

async function readPackageJson(path: string): Promise<PackageJson> {
  const parsed: unknown = JSON.parse(await readFile(path, 'utf8'));

  if (!isRecord(parsed)) {
    throw new Error('package.json must be a JSON object.');
  }

  return {
    name: readOptionalString(parsed.name),
    version: readOptionalString(parsed.version),
    private: typeof parsed.private === 'boolean' ? parsed.private : undefined,
    license: readOptionalString(parsed.license),
    type: readOptionalString(parsed.type),
    description: readOptionalString(parsed.description),
    exports: isRecord(parsed.exports) ? parsed.exports : undefined,
    files: isStringArray(parsed.files) ? parsed.files : undefined,
    sideEffects: isStringArray(parsed.sideEffects) ? parsed.sideEffects : undefined,
    scripts: isStringRecord(parsed.scripts) ? parsed.scripts : undefined,
    dependencies: isStringRecord(parsed.dependencies) ? parsed.dependencies : undefined,
    peerDependencies: isStringRecord(parsed.peerDependencies) ? parsed.peerDependencies : undefined,
    publishConfig: isRecord(parsed.publishConfig) ? parsed.publishConfig : undefined
  };
}

function normalizePackagePath(value: string): string {
  return relative(root, join(root, value.replace(/^\.\//, ''))).replaceAll('\\', '/');
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
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

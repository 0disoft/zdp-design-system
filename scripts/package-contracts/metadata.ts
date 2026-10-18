import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  expectedPackageExportTargets,
  expectedPackageExports,
  validatePackageExports
} from '../package-exports';
import type { PackageCheckContext, PackageJson } from './context';

export function createMetadataChecks(context: PackageCheckContext) {
const { root, failures, expectedPackageFiles, expectedDistArtifactFiles, runtimeArtifactPaths, expectedSideEffects, expectedScripts } = context;

function checkPackageScripts(packageJson: PackageJson): void {
  for (const [scriptName, expectedCommand] of Object.entries(expectedScripts)) {
    if (packageJson.scripts?.[scriptName] !== expectedCommand) {
      failures.push(`package.json scripts.${scriptName} must be ${expectedCommand}.`);
    }
  }

  if (!packageJson.scripts?.check?.includes('bun run package:check')) {
    failures.push('package.json check script must include package artifact validation.');
  }

  if (!packageJson.scripts?.check?.includes('bun run publish:check')) {
    failures.push('package.json check script must include publish-readiness validation.');
  }

  if (!packageJson.scripts?.check?.includes('bun run consumer:check')) {
    failures.push('package.json check script must include consumer contract validation.');
  }

  if (!packageJson.scripts?.check?.includes('bun run share-icons:check')) {
    failures.push('package.json check script must include share icon brand validation.');
  }

  if (!packageJson.scripts?.check?.includes('bun run brand-assets:check')) {
    failures.push('package.json check script must validate the public brand asset contract.');
  }

  if (!packageJson.scripts?.check?.includes('bun run credit-assets:check')) {
    failures.push('package.json check script must validate the public credit asset contract.');
  }

  if (!packageJson.scripts?.check?.includes('bun run package:build')) {
    failures.push('package.json check script must build the dist package before package validation.');
  }

  if (!packageJson.scripts?.check?.includes('bun run type:check')) {
    failures.push('package.json check script must include Svelte type validation.');
  }

  if (!packageJson.scripts?.check?.includes('bun run fixtures:check')) {
    failures.push('package.json check script must build the consumer fixture against dist exports.');
  }
}

function checkRuntimeArtifactImports(): void {
  const nodeExecutable = process.platform === 'win32' ? 'node.exe' : 'node';

  for (const relativePath of runtimeArtifactPaths) {
    const moduleUrl = pathToFileURL(join(root, relativePath)).href;
    const result = spawnSync(
      nodeExecutable,
      ['--input-type=module', '--eval', `await import(${JSON.stringify(moduleUrl)})`],
      {
        cwd: root,
        encoding: 'utf8',
        shell: false
      }
    );

    if (result.error) {
      failures.push(`${relativePath} could not start the Node runtime import check: ${result.error.message}`);
      continue;
    }

    if (result.status !== 0) {
      const detail = (result.stderr || result.stdout || 'unknown import failure').trim();
      failures.push(`${relativePath} must be importable by Node: ${detail}`);
    }
  }
}

async function checkStrictTypeScriptContract(): Promise<void> {
  const parsed: unknown = JSON.parse(await readFile(join(root, 'tsconfig.json'), 'utf8'));
  const compilerOptions = isRecord(parsed) && isRecord(parsed.compilerOptions)
    ? parsed.compilerOptions
    : null;

  for (const option of ['strict', 'noUncheckedIndexedAccess', 'exactOptionalPropertyTypes'] as const) {
    if (compilerOptions?.[option] !== true) {
      failures.push(`tsconfig.json compilerOptions.${option} must remain true.`);
    }
  }
}

function checkPackageLicense(packageJson: PackageJson): void {
  if (packageJson.license !== 'MIT') {
    failures.push('package.json license must be MIT for public repository redistribution readiness.');
  }
}

function checkPackageExports(packageJson: PackageJson): void {
  failures.push(...validatePackageExports(packageJson.exports));

  for (const exportTarget of expectedPackageExportTargets) {
    assertExistingExportTarget(exportTarget);
  }
}

function checkPackageExportsValidatorSelfTest(): void {
  const invalidTypes = validatePackageExports({
    ...expectedPackageExports,
    './brand-assets': { import: './dist/brand-assets.js', types: './dist/brand-assets.ts' }
  });
  if (!invalidTypes.some(message => message.includes('types must point to a generated .d.ts')) ||
      !invalidTypes.some(message => message.includes('types condition before runtime conditions'))) {
    failures.push('Package exports validation must reject raw TypeScript types and incorrect condition order.');
  }
  const invalidExports = {
    ...expectedPackageExports,
    './internal': './src/private.ts'
  };
  const actualFailures = validatePackageExports(invalidExports);
  const expectedFailures = [
    'package.json exports["./internal"] is not an intended public export.',
    'package.json exports["./internal"] target ./src/private.ts must resolve under ./dist/**.'
  ];

  if (JSON.stringify(actualFailures) !== JSON.stringify(expectedFailures)) {
    failures.push(
      `Package exports validator negative self-test returned ${JSON.stringify(actualFailures)} instead of ${JSON.stringify(expectedFailures)}.`
    );
  }
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

  for (const exportTarget of expectedPackageExportTargets) {
    if (!isCoveredByPackageFiles(packageJson.files, exportTarget)) {
      failures.push(`package.json files does not include export target ${exportTarget}.`);
    }
  }
}

function checkPackageArtifactFiles(packageJson: PackageJson): void {
  if (!Array.isArray(packageJson.files)) {
    return;
  }

  for (const artifactPath of expectedDistArtifactFiles) {
    assertExistingExportTarget(artifactPath);

    if (!isCoveredByPackageFiles(packageJson.files, artifactPath)) {
      failures.push(`package.json files does not include package artifact ${artifactPath}.`);
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

return { checkPackageScripts, checkRuntimeArtifactImports, checkStrictTypeScriptContract, checkPackageLicense, checkPackageExports, checkPackageExportsValidatorSelfTest, checkPackageFiles, checkPackageArtifactFiles, checkPackageSideEffects };
}

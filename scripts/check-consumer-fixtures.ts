import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { build } from 'vite';
import { cp, mkdir, mkdtemp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { basename, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const fixtureRoot = resolve(repoRoot, 'fixtures/consumer-svelte-vite');
const fixtureSourceRoot = resolve(fixtureRoot, 'src');
const temporaryRoot = resolve(repoRoot, 'tmp');
const sourceExtensions = new Set(['.svelte', '.ts', '.js', '.css']);

interface BuildOutput {
  readonly output: readonly BuildOutputItem[];
}

interface BuildOutputItem {
  readonly type: string;
  readonly code?: string;
  readonly source?: string | Uint8Array;
}

interface PackageManifest {
  readonly name: string;
  readonly version: string;
}

await checkConsumerFixtureTokenUsage(fixtureSourceRoot);
await checkPackedConsumerFixture();

console.log('Consumer fixture check passed.');

async function checkPackedConsumerFixture(): Promise<void> {
  await mkdir(temporaryRoot, { recursive: true });
  const packedRoot = await mkdtemp(resolve(temporaryRoot, 'consumer-packed-'));

  try {
    const tarball = await packCurrentPackage(packedRoot);
    await installPackedPackage(packedRoot, tarball);
    await assertInstalledPackageSurface(packedRoot);

    const fullFixtureRoot = resolve(packedRoot, 'full');
    await copyFullConsumerFixture(fullFixtureRoot);
    await checkPackedConsumerTypes(fullFixtureRoot);
    await checkFullConsumerBuild(fullFixtureRoot);
    await checkSingleComponentTreeShaking(packedRoot);
  } finally {
    await rm(packedRoot, { recursive: true, force: true });
  }
}

async function packCurrentPackage(packedRoot: string): Promise<string> {
  const artifactRoot = resolve(packedRoot, 'artifacts');
  await mkdir(artifactRoot, { recursive: true });

  const npmExecutable = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const stdout = runCommand(
    npmExecutable,
    ['pack', '--json', '--pack-destination', artifactRoot],
    repoRoot,
    'npm pack'
  );
  const parsed: unknown = JSON.parse(stdout);
  assert.ok(Array.isArray(parsed) && parsed.length === 1, 'npm pack must return exactly one package result.');
  const result: unknown = parsed[0];
  assert.ok(isRecord(result), 'npm pack result must be an object.');
  const filename = result.filename;
  assert.ok(typeof filename === 'string', 'npm pack must return a tarball filename.');
  assert.equal(basename(filename), filename, 'npm pack returned an unsafe tarball filename.');

  return resolve(artifactRoot, filename);
}

async function installPackedPackage(packedRoot: string, tarball: string): Promise<void> {
  await writeFile(
    resolve(packedRoot, 'package.json'),
    `${JSON.stringify({ name: 'zdp-packed-consumer-fixture', private: true, type: 'module' }, null, 2)}\n`,
    'utf8'
  );

  const npmExecutable = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  runCommand(
    npmExecutable,
    [
      'install',
      '--offline',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      '--no-package-lock',
      '--legacy-peer-deps',
      tarball
    ],
    packedRoot,
    'offline packed-package install'
  );
}

async function assertInstalledPackageSurface(packedRoot: string): Promise<void> {
  const sourceManifest = parsePackageManifest(await readFile(resolve(repoRoot, 'package.json'), 'utf8'));
  const installedRoot = resolve(packedRoot, 'node_modules/zdp-design-system');
  const installedManifest = parsePackageManifest(await readFile(resolve(installedRoot, 'package.json'), 'utf8'));

  assert.equal(installedManifest.name, sourceManifest.name, 'Installed package name changed after npm pack.');
  assert.equal(installedManifest.version, sourceManifest.version, 'Installed package version changed after npm pack.');

  await assertPathMissing(resolve(installedRoot, 'src'), 'Packed consumer install must not expose package src/.');
}

async function copyFullConsumerFixture(fullFixtureRoot: string): Promise<void> {
  await mkdir(fullFixtureRoot, { recursive: true });
  await cp(resolve(fixtureRoot, 'index.html'), resolve(fullFixtureRoot, 'index.html'));
  await cp(fixtureSourceRoot, resolve(fullFixtureRoot, 'src'), { recursive: true });
  await writeFile(
    resolve(fullFixtureRoot, 'tsconfig.json'),
    `${JSON.stringify({
      extends: normalizePath(resolve(repoRoot, 'node_modules/@tsconfig/svelte/tsconfig.json')),
      compilerOptions: {
        allowJs: true,
        checkJs: false,
        isolatedModules: true,
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        moduleResolution: 'bundler',
        noEmit: true,
        resolveJsonModule: true,
        strict: true,
        types: ['svelte']
      },
      include: ['src/**/*.svelte', 'src/**/*.ts']
    }, null, 2)}\n`,
    'utf8'
  );
}

async function checkPackedConsumerTypes(fullFixtureRoot: string): Promise<void> {
  const svelteCheckExecutable = resolve(
    repoRoot,
    process.platform === 'win32' ? 'node_modules/.bin/svelte-check.exe' : 'node_modules/.bin/svelte-check'
  );
  runCommand(
    svelteCheckExecutable,
    ['--tsconfig', resolve(fullFixtureRoot, 'tsconfig.json')],
    fullFixtureRoot,
    'packed consumer svelte-check'
  );
}

async function checkFullConsumerBuild(fullFixtureRoot: string): Promise<void> {
  const result = await build({
    build: {
      rollupOptions: {
        input: resolve(fullFixtureRoot, 'index.html')
      },
      write: false
    },
    configFile: false,
    logLevel: 'silent',
    plugins: [svelte()],
    root: fullFixtureRoot
  });
  const outputText = collectBuildOutputText(result);

  for (const requiredMarker of ['zdp-button', 'zdp-card', 'zdp-tooltip']) {
    if (!outputText.includes(requiredMarker)) {
      throw new Error(`Packed consumer bundle is missing public component marker: ${requiredMarker}.`);
    }
  }
}

async function checkSingleComponentTreeShaking(packedRoot: string): Promise<void> {
  const singleComponentFixtureRoot = resolve(packedRoot, 'single');
  await mkdir(resolve(singleComponentFixtureRoot, 'src'), { recursive: true });

  await writeFile(
    resolve(singleComponentFixtureRoot, 'index.html'),
    '<div id="app"></div><script type="module" src="/src/main.ts"></script>\n'
  );
  await writeFile(
    resolve(singleComponentFixtureRoot, 'src/main.ts'),
    [
      "import { mount } from 'svelte';",
      "import { Button } from 'zdp-design-system';",
      '',
      'const target = document.getElementById(\'app\');',
      '',
      'if (!target) {',
      "  throw new Error('Missing app target.');",
      '}',
      '',
      'mount(Button, {',
      '  target,',
      '  props: {',
      "    children: () => 'Single Button'",
      '  }',
      '});',
      ''
    ].join('\n')
  );

  const result = await build({
    build: {
      rollupOptions: {
        input: resolve(singleComponentFixtureRoot, 'index.html')
      },
      write: false
    },
    configFile: false,
    logLevel: 'silent',
    plugins: [svelte()],
    root: singleComponentFixtureRoot
  });

  const outputText = collectBuildOutputText(result);

  if (!outputText.includes('zdp-button')) {
    throw new Error('Single-component consumer bundle must include Button output.');
  }

  for (const forbiddenMarker of [
    'zdp-tooltip',
    'zdp-dialog',
    'zdp-inline-code',
    'zdp-combobox',
    'zdp-menu',
    'zdp-popover',
    'zdp-term-sheet',
    'zdp-table'
  ]) {
    if (outputText.includes(forbiddenMarker)) {
      throw new Error(
        `Single-component consumer bundle pulled unused barrel export marker: ${forbiddenMarker}.`
      );
    }
  }
}

function runCommand(executable: string, args: readonly string[], cwd: string, label: string): string {
  const result = spawnSync(executable, args, {
    cwd,
    encoding: 'utf8',
    shell: false,
    windowsHide: true
  });
  assert.equal(result.error, undefined, `${label} failed to start: ${result.error?.message ?? 'unknown error'}`);
  assert.equal(result.status, 0, `${label} failed:\n${result.stderr || result.stdout}`);

  return result.stdout;
}

function parsePackageManifest(source: string): PackageManifest {
  const parsed: unknown = JSON.parse(source);
  assert.ok(isRecord(parsed), 'Package manifest must be an object.');
  const name = parsed.name;
  const version = parsed.version;
  assert.ok(typeof name === 'string', 'Package manifest must include a name.');
  assert.ok(typeof version === 'string', 'Package manifest must include a version.');

  return { name, version };
}

async function assertPathMissing(path: string, message: string): Promise<void> {
  try {
    await stat(path);
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return;
    }

    throw error;
  }

  throw new Error(message);
}

function isNodeError(value: unknown): value is NodeJS.ErrnoException {
  return value instanceof Error && 'code' in value;
}

function collectBuildOutputText(result: Awaited<ReturnType<typeof build>>): string {
  const outputs = normalizeBuildOutputs(result);
  const parts: string[] = [];

  for (const output of outputs) {
    for (const item of output.output) {
      if (item.type === 'chunk') {
        parts.push(item.code);
        continue;
      }

      if (typeof item.source === 'string') {
        parts.push(item.source);
      }
    }
  }

  return parts.join('\n');
}

function normalizeBuildOutputs(result: unknown): readonly BuildOutput[] {
  if (Array.isArray(result)) {
    return result.map(assertBuildOutput);
  }

  return [assertBuildOutput(result)];
}

function assertBuildOutput(value: unknown): BuildOutput {
  if (isBuildOutput(value)) {
    return value;
  }

  throw new Error('Expected Vite build output, but the build returned no Rollup output.');
}

function isBuildOutput(value: unknown): value is BuildOutput {
  return isRecord(value) && Array.isArray(value.output);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function checkConsumerFixtureTokenUsage(sourceRoot: string): Promise<void> {
  const sourceFiles = await listSourceFiles(sourceRoot);
  const failures: string[] = [];

  for (const sourceFile of sourceFiles) {
    const source = await readFile(sourceFile, 'utf8');
    const relativePath = normalizePath(relative(repoRoot, sourceFile));

    collectConsumerTokenFailures(relativePath, source, failures);
  }

  if (failures.length > 0) {
    throw new Error(`Consumer fixture token contract failed:\n- ${failures.join('\n- ')}`);
  }
}

async function listSourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listSourceFiles(entryPath)));
      continue;
    }

    if (entry.isFile() && sourceExtensions.has(getExtension(entry.name))) {
      files.push(entryPath);
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
}

function collectConsumerTokenFailures(
  relativePath: string,
  source: string,
  failures: string[]
): void {
  const checks: readonly {
    readonly pattern: RegExp;
    readonly message: string;
  }[] = [
    {
      pattern: /#[\da-fA-F]{3,8}\b|(?:rgb|rgba|hsl|hsla|oklch|lab|lch|color)\(/,
      message: 'must use ZDP color tokens instead of raw color literals.'
    },
    {
      pattern: /z-index:\s*-?\d+\s*;?/,
      message: 'must use named --zdp-layer-* tokens instead of raw z-index numbers.'
    },
    {
      pattern: /\b100v[hw]\b/,
      message: 'must use --zdp-viewport-* tokens instead of raw 100vh/100vw sizing.'
    },
    {
      pattern: /(?<![\w-])-?\d*\.?\d+px\b/,
      message: 'must use ZDP spacing, sizing, border, or viewport tokens instead of raw px values.'
    }
  ];

  for (const check of checks) {
    if (check.pattern.test(source)) {
      failures.push(`${relativePath} ${check.message}`);
    }
  }
}

function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}

function getExtension(fileName: string): string {
  const index = fileName.lastIndexOf('.');

  if (index === -1) {
    return '';
  }

  return fileName.slice(index);
}

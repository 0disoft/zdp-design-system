import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { build, createServer } from 'vite';
import { cp, mkdir, mkdtemp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { basename, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const fixtureRoot = resolve(repoRoot, 'fixtures/consumer-svelte-vite');
const fixtureSourceRoot = resolve(fixtureRoot, 'src');
const temporaryRoot = resolve(repoRoot, 'tmp');
const packedModalBrowserCheckPath = resolve(repoRoot, 'scripts/browser/check-packed-consumer-hydration.mjs');
const packedFrameworkNeutralBrowserCheckPath = resolve(
  repoRoot,
  'scripts/browser/check-packed-framework-neutral-dev.mjs'
);
const sourceExtensions = new Set(['.svelte', '.ts', '.js', '.css']);
const packedModalKinds = ['dialog', 'sheet', 'term-sheet'] as const;
type PackedModalKind = (typeof packedModalKinds)[number];

const packedModalAccessibleNames: Record<PackedModalKind, string> = {
  dialog: 'Packed hydration dialog',
  sheet: 'Packed hydration sheet',
  'term-sheet': 'Packed hydration term sheet'
};

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
    await checkPackedFrameworkNeutralViteDev(packedRoot);
    await checkPackedConsumerSsrHydration(packedRoot);

    const fullFixtureRoot = resolve(packedRoot, 'full');
    await copyFullConsumerFixture(fullFixtureRoot);
    await checkPackedConsumerTypes(fullFixtureRoot);
    await checkFullConsumerBuild(fullFixtureRoot);
    await checkSingleComponentTreeShaking(packedRoot);
  } finally {
    await rm(packedRoot, { recursive: true, force: true });
  }
}

async function checkPackedFrameworkNeutralViteDev(packedRoot: string): Promise<void> {
  const fixtureRoot = resolve(packedRoot, 'framework-neutral-dev');
  await mkdir(fixtureRoot, { recursive: true });
  await writeFile(
    resolve(fixtureRoot, 'index.html'),
    '<link rel="icon" href="data:," /><div id="app"></div><script type="module" src="/main.js"></script>\n',
    'utf8'
  );
  await writeFile(resolve(fixtureRoot, 'main.js'), createFrameworkNeutralDevSource(), 'utf8');

  const server = await createServer({
    cacheDir: resolve(packedRoot, 'vite-framework-neutral-cache'),
    configFile: false,
    logLevel: 'silent',
    root: fixtureRoot,
    server: {
      hmr: false,
      host: '127.0.0.1',
      port: 0,
      strictPort: false
    }
  });

  try {
    await server.listen();
    const address = server.httpServer?.address();
    assert.ok(address && typeof address === 'object', 'Framework-neutral Vite fixture must expose an address.');
    await runPackedFrameworkNeutralBrowserCheck(address.port);
  } finally {
    await server.close();
  }
}

function createFrameworkNeutralDevSource(): string {
  return `import {
  clampZdpSplitPaneSize,
  createZdpSplitPaneController,
  createZdpSplitPaneSizePersistence
} from 'zdp-design-system/split-pane';

const target = document.querySelector('#app');

if (!(target instanceof HTMLElement)) {
  throw new Error('Framework-neutral fixture root was not found.');
}

target.innerHTML = '<div data-split-pane><nav data-primary></nav><div data-separator></div><main data-secondary></main></div>';

const root = target.querySelector('[data-split-pane]');
const primary = target.querySelector('[data-primary]');
const separator = target.querySelector('[data-separator]');
const secondary = target.querySelector('[data-secondary]');

if (
  !(root instanceof HTMLElement) ||
  !(primary instanceof HTMLElement) ||
  !(separator instanceof HTMLElement) ||
  !(secondary instanceof HTMLElement)
) {
  throw new Error('Framework-neutral split pane elements were not created.');
}

const persistence = createZdpSplitPaneSizePersistence({ key: 'packed-framework-neutral-dev' });
persistence.save(312);
const controller = createZdpSplitPaneController(
  { root, primary, separator, secondary },
  { size: persistence.load(), minSize: 220, maxSize: 480, secondaryMinSize: 320 }
);

window.__zdpFrameworkNeutralDevResult = {
  clampedSize: clampZdpSplitPaneSize(999, { minSize: 220, maxSize: 480 }),
  currentSize: controller.getSize(),
  orientation: separator.getAttribute('aria-orientation'),
  role: separator.getAttribute('role'),
  storedSize: persistence.load()
};

controller.destroy();
persistence.clear();
`;
}

async function runPackedFrameworkNeutralBrowserCheck(port: number): Promise<void> {
  const nodeExecutable = process.platform === 'win32' ? 'node.exe' : 'node';

  await new Promise<void>((resolvePromise, rejectPromise) => {
    const child = spawn(nodeExecutable, [packedFrameworkNeutralBrowserCheckPath, String(port)], {
      cwd: repoRoot,
      shell: false,
      stdio: ['ignore', 'inherit', 'inherit'],
      windowsHide: true
    });

    child.once('error', (error) => {
      rejectPromise(
        new Error(`Packed framework-neutral Vite browser check failed to start: ${error.message}`, { cause: error })
      );
    });
    child.once('close', (code, signal) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(
        new Error(
          `Packed framework-neutral Vite browser check failed with ${
            signal ? `signal ${signal}` : `exit code ${String(code)}`
          }.`
        )
      );
    });
  });
}

async function checkPackedConsumerSsrHydration(packedRoot: string): Promise<void> {
  const fixtureRoot = resolve(packedRoot, 'ssr-hydration');
  await mkdir(fixtureRoot, { recursive: true });
  await writeFile(resolve(fixtureRoot, 'App.svelte'), createPackedModalFixtureSource(), 'utf8');
  await writeFile(resolve(fixtureRoot, 'hydrate.js'), createPackedModalHydrationSource(), 'utf8');

  const renderedBodies = new Map<string, string>();
  const server = await createServer({
    appType: 'custom',
    cacheDir: resolve(packedRoot, 'vite-ssr-hydration-cache'),
    configFile: false,
    logLevel: 'silent',
    optimizeDeps: {
      noDiscovery: true
    },
    plugins: [
      svelte(),
      {
        name: 'zdp-packed-consumer-ssr-hydration',
        configureServer(vite) {
          vite.middlewares.use(async (request, response, next) => {
            const pathname = request.url?.split('?')[0] ?? '/';
            const kind = parsePackedModalPath(pathname);

            if (kind === null) {
              next();
              return;
            }

            try {
              const html = await vite.transformIndexHtml(
                request.url ?? pathname,
                createPackedModalHydrationHtml(renderedBodies.get(kind) ?? '', kind)
              );
              response.statusCode = 200;
              response.setHeader('Content-Type', 'text/html; charset=utf-8');
              response.end(html);
            } catch (error) {
              next(error);
            }
          });
        }
      }
    ],
    root: fixtureRoot,
    server: {
      hmr: false,
      host: '127.0.0.1',
      port: 0,
      strictPort: false
    }
  });

  try {
    await server.listen();
    const address = server.httpServer?.address();
    assert.ok(address && typeof address === 'object', 'Packed SSR fixture server must expose an address.');

    const { render } = await server.ssrLoadModule('svelte/server');
    const fixtureModule = await server.ssrLoadModule('/App.svelte');

    for (const kind of packedModalKinds) {
      const body = render(fixtureModule.default, { props: { kind } }).body;
      assert.ok(body.includes(packedModalAccessibleNames[kind]), `${kind} packed SSR output is missing its name.`);
      assert.equal(
        body.includes('data-zdp-modal-layer-active'),
        false,
        `${kind} packed SSR output must not serialize browser-only modal activation.`
      );
      renderedBodies.set(kind, body);
    }

    await runPackedModalBrowserCheck(address.port);
  } finally {
    await server.close();
  }
}

function parsePackedModalPath(pathname: string): PackedModalKind | null {
  const kind = pathname.startsWith('/modal/') ? pathname.slice('/modal/'.length) : '';
  return packedModalKinds.find((candidate) => candidate === kind) ?? null;
}

function createPackedModalFixtureSource(): string {
  return `<script lang="ts">
  import { Dialog, Sheet, TermSheet } from 'zdp-design-system';

  export let kind: 'dialog' | 'sheet' | 'term-sheet';

  let open = true;
  const term = {
    id: 'packed-hydration-term',
    label: 'Packed hydration term sheet',
    short: 'Term content rendered from the installed package.'
  };
</script>

<section data-testid="packed-modal-background" aria-label="Packed modal background">
  <button type="button">Background action</button>
</section>

{#if kind === 'dialog'}
  <Dialog
    bind:open
    labelledBy="packed-hydration-dialog-title"
    closeLabel="Close packed hydration dialog"
    onClose={() => (open = false)}
  >
    <svelte:fragment slot="title">
      <h2 id="packed-hydration-dialog-title">Packed hydration dialog</h2>
    </svelte:fragment>
    <p>Dialog content rendered from the installed package.</p>
  </Dialog>
{:else if kind === 'sheet'}
  <Sheet
    bind:open
    labelledBy="packed-hydration-sheet-title"
    closeLabel="Close packed hydration sheet"
    onClose={() => (open = false)}
  >
    <svelte:fragment slot="title">
      <h2 id="packed-hydration-sheet-title">Packed hydration sheet</h2>
    </svelte:fragment>
    <p>Sheet content rendered from the installed package.</p>
  </Sheet>
{:else}
  <TermSheet bind:open {term} closeLabel="Close packed hydration term sheet" onClose={() => (open = false)} />
{/if}

<output data-testid="packed-modal-open-state">{open ? 'open' : 'closed'}</output>
`;
}

function createPackedModalHydrationSource(): string {
  return `import { hydrate, tick } from 'svelte';
import App from './App.svelte';

const target = document.querySelector('#app');
const kind = window.__zdpPackedModalKind;

try {
  if (!(target instanceof HTMLElement)) {
    throw new Error('Packed modal hydration root was not found.');
  }

  if (kind !== 'dialog' && kind !== 'sheet' && kind !== 'term-sheet') {
    throw new Error(\`Unknown packed modal kind: \${String(kind)}\`);
  }

  hydrate(App, { props: { kind }, target });
  await tick();
  await new Promise((resolve) => requestAnimationFrame(resolve));

  const background = target.querySelector('[data-testid="packed-modal-background"]');
  const layer = target.querySelector('[data-zdp-modal-layer-root]');
  window.__zdpPackedModalResult = {
    backgroundInert: background?.hasAttribute('inert') ?? false,
    bodyOverflow: document.body.style.overflow,
    layerActive: layer?.getAttribute('data-zdp-modal-layer-active') ?? null,
    layerCount: document.documentElement.getAttribute('data-zdp-modal-layer-count'),
    layerLevel: layer?.getAttribute('data-zdp-modal-layer-level') ?? null
  };
} catch (error) {
  window.__zdpPackedModalError = error instanceof Error ? error.message : String(error);
}
`;
}

function createPackedModalHydrationHtml(body: string, kind: PackedModalKind): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="data:," />
    <title>${kind} packed SSR hydration check</title>
  </head>
  <body>
    <main id="app">${body}</main>
    <script>
      window.__zdpPackedModalKind = ${JSON.stringify(kind)};
      const root = document.querySelector('#app');
      const background = root.querySelector('[data-testid="packed-modal-background"]');
      const layer = root.querySelector('[data-zdp-modal-layer-root]');
      window.__zdpPackedModalBefore = {
        backgroundInert: background.hasAttribute('inert'),
        bodyOverflow: document.body.style.overflow,
        layerActive: layer?.getAttribute('data-zdp-modal-layer-active') ?? null,
        layerCount: document.documentElement.getAttribute('data-zdp-modal-layer-count'),
        layerLevel: layer?.getAttribute('data-zdp-modal-layer-level') ?? null
      };
    </script>
    <script type="module" src="/hydrate.js"></script>
  </body>
</html>`;
}

async function runPackedModalBrowserCheck(port: number): Promise<void> {
  const nodeExecutable = process.platform === 'win32' ? 'node.exe' : 'node';

  await new Promise<void>((resolvePromise, rejectPromise) => {
    const child = spawn(nodeExecutable, [packedModalBrowserCheckPath, String(port)], {
      cwd: repoRoot,
      shell: false,
      stdio: ['ignore', 'inherit', 'inherit'],
      windowsHide: true
    });

    child.once('error', (error) => {
      rejectPromise(new Error(`Packed modal Node browser check failed to start: ${error.message}`, { cause: error }));
    });
    child.once('close', (code, signal) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(
        new Error(
          `Packed modal Node browser check failed with ${
            signal ? `signal ${signal}` : `exit code ${String(code)}`
          }.`
        )
      );
    });
  });
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
  const svelteTsconfigPath = normalizePath(
    relative(fullFixtureRoot, resolve(repoRoot, 'node_modules/@tsconfig/svelte/tsconfig.json'))
  );
  await writeFile(
    resolve(fullFixtureRoot, 'tsconfig.json'),
    `${JSON.stringify({
      extends: svelteTsconfigPath,
      compilerOptions: {
        allowJs: true,
        checkJs: false,
        isolatedModules: true,
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        moduleResolution: 'bundler',
        noEmit: true,
        resolveJsonModule: true,
        strict: true,
        types: ['svelte', 'vite/client']
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

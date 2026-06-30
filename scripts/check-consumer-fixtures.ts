import { build } from 'vite';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const fixtureRoot = resolve(repoRoot, 'fixtures/consumer-svelte-vite');
const fixtureSourceRoot = resolve(fixtureRoot, 'src');
const singleComponentFixtureRoot = resolve(repoRoot, 'tmp/consumer-single-button-fixture');
const singleComponentOutDir = resolve(repoRoot, 'tmp/consumer-single-button');
const sourceExtensions = new Set(['.svelte', '.ts', '.js', '.css']);

interface BuildOutput {
  readonly output: readonly BuildOutputItem[];
}

interface BuildOutputItem {
  readonly type: string;
  readonly code?: string;
  readonly source?: string | Uint8Array;
}

await checkConsumerFixtureTokenUsage(fixtureSourceRoot);

await build({
  configFile: resolve(fixtureRoot, 'vite.config.ts'),
  logLevel: 'silent',
  root: fixtureRoot
});

await checkSingleComponentTreeShaking();

console.log('Consumer fixture check passed.');

async function checkSingleComponentTreeShaking(): Promise<void> {
  await rm(singleComponentFixtureRoot, { recursive: true, force: true });
  await rm(singleComponentOutDir, { recursive: true, force: true });

  try {
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
        emptyOutDir: true,
        outDir: singleComponentOutDir,
        rollupOptions: {
          input: resolve(singleComponentFixtureRoot, 'index.html')
        },
        write: false
      },
      logLevel: 'silent',
      plugins: [svelte()],
      resolve: {
        alias: [
          {
            find: /^zdp-design-system$/,
            replacement: resolve(repoRoot, 'dist/index.js')
          }
        ]
      },
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
  } finally {
    await rm(singleComponentFixtureRoot, { recursive: true, force: true });
    await rm(singleComponentOutDir, { recursive: true, force: true });
  }
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

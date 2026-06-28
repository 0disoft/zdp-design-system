import { build } from 'vite';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const fixtureRoot = resolve(repoRoot, 'fixtures/consumer-svelte-vite');
const singleComponentFixtureRoot = resolve(repoRoot, 'tmp/consumer-single-button-fixture');
const singleComponentOutDir = resolve(repoRoot, 'tmp/consumer-single-button');

interface BuildOutput {
  readonly output: readonly BuildOutputItem[];
}

interface BuildOutputItem {
  readonly type: string;
  readonly code?: string;
  readonly source?: string | Uint8Array;
}

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

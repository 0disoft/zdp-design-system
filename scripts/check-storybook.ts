import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { assertNoDecorativeEffects, assertNoOverRoundedUsage } from './style-contract';

interface PackageJson {
  readonly scripts?: Record<string, string>;
  readonly devDependencies?: Record<string, string>;
  readonly exports?: Record<string, unknown>;
  readonly sideEffects?: readonly unknown[];
}

const root = process.cwd();
const packagePath = join(root, 'package.json');
const mainPath = join(root, '.storybook', 'main.ts');
const previewPath = join(root, '.storybook', 'preview.ts');
const storyPath = join(root, 'stories', 'DesignSystemOverview.stories.ts');
const componentPath = join(root, 'stories', 'DesignSystemOverview.svelte');
const buttonPath = join(root, 'src', 'lib', 'components', 'Button.svelte');
const iconButtonPath = join(root, 'src', 'lib', 'components', 'IconButton.svelte');
const surfacePath = join(root, 'src', 'lib', 'components', 'Surface.svelte');
const failures: string[] = [];

const [packageJson, main, preview, story, component, button, iconButton, surface] =
  await Promise.all([
    readPackageJson(packagePath),
    readFile(mainPath, 'utf8'),
    readFile(previewPath, 'utf8'),
    readFile(storyPath, 'utf8'),
    readFile(componentPath, 'utf8'),
    readFile(buttonPath, 'utf8'),
    readFile(iconButtonPath, 'utf8'),
    readFile(surfacePath, 'utf8')
  ]);

for (const [scriptName, expectedCommand] of Object.entries({
  dev: 'storybook dev -p 6006',
  build: 'storybook build',
  storybook: 'bun run dev',
  'storybook:build': 'bun run build',
  'storybook:check': 'bun scripts/check-storybook.ts'
})) {
  if (packageJson.scripts?.[scriptName] !== expectedCommand) {
    failures.push(`Missing package script ${scriptName}.`);
  }
}

if (!packageJson.scripts?.check?.includes('bun scripts/check-storybook.ts')) {
  failures.push('Package check script must include Storybook contract validation.');
}

if (packageJson.exports?.['./locale-fonts.css'] !== './src/styles/locale-fonts.css') {
  failures.push('Package must expose ./locale-fonts.css for optional locale font loading.');
}

if (!packageJson.sideEffects?.includes('./src/styles/locale-fonts.css')) {
  failures.push('Package sideEffects must keep ./src/styles/locale-fonts.css.');
}

for (const dependencyName of ['@storybook/svelte-vite', 'storybook', 'svelte', 'vite']) {
  if (!packageJson.devDependencies?.[dependencyName]) {
    failures.push(`Missing devDependency ${dependencyName}.`);
  }
}

if (!packageJson.devDependencies?.['@sveltejs/vite-plugin-svelte']) {
  failures.push('Missing devDependency @sveltejs/vite-plugin-svelte.');
}

for (const requiredText of [
  "import { svelte } from '@sveltejs/vite-plugin-svelte'",
  "import type { StorybookConfig } from '@storybook/svelte-vite'",
  "'../stories/**/*.stories.@(js|ts|svelte)'",
  "name: '@storybook/svelte-vite'",
  'docgen: false',
  'async viteFinal(config)',
  'svelte()'
]) {
  if (!main.includes(requiredText)) {
    failures.push(`Storybook main config is missing ${requiredText}.`);
  }
}

if (!preview.includes("import '../src/styles/index.css';")) {
  failures.push('Storybook preview must import the shared style entry.');
}

for (const requiredText of [
  "title: 'Design System/Overview'",
  'DesignSystemOverview',
  "layout: 'fullscreen'"
]) {
  if (!story.includes(requiredText)) {
    failures.push(`Story definition is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  '../src/lib/components/Button.svelte',
  '../src/lib/components/IconButton.svelte',
  '../src/lib/components/Surface.svelte',
  'data-zdp-theme="light"',
  'data-zdp-theme="dark"',
  'Pretendard-first multiscript text',
  'lang="zh"',
  'lang="hi"',
  'swatch__paint--primary',
  'swatch__paint--success',
  'swatch__paint--warning',
  'swatch__paint--danger',
  'Foundation tokens',
  '--zdp-type-body-size',
  '--zdp-type-body-small-size',
  '--zdp-type-caption-size',
  '--zdp-type-data-size',
  '--zdp-control-radius',
  '--zdp-control-border-width',
  '--zdp-control-focus-outline-width',
  '--zdp-i18n-overflow-wrap',
  'Search Design System',
  '출시 노트 보기',
  '업데이트 보기',
  '자세히 보기'
]) {
  if (!component.includes(requiredText)) {
    failures.push(`Storybook overview is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  'font-family: var(--zdp-font-family-sans)',
  'font-weight: var(--zdp-font-weight-medium)',
  'border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong)',
  'background: var(--zdp-color-accent-primary)',
  '.zdp-button--primary:hover:not(:disabled)',
  '.zdp-button--secondary:hover:not(:disabled)',
  '.zdp-button--danger:hover:not(:disabled)',
  'background: var(--zdp-color-surface-raised)',
  '.zdp-button--primary:active:not(:disabled)',
  'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
  'border-color: var(--zdp-color-focus-line)'
]) {
  if (!button.includes(requiredText)) {
    failures.push(`Button component is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  '.zdp-icon-button--solid:active:not(:disabled)',
  '.zdp-icon-button--solid:hover:not(:disabled)',
  '.zdp-icon-button--ghost:hover:not(:disabled)',
  'border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong)',
  'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
  'border-color: var(--zdp-color-focus-line)',
  'align-items: center',
  'justify-content: center',
  'line-height: 1'
]) {
  if (!iconButton.includes(requiredText)) {
    failures.push(`IconButton component is missing centered glyph style ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'Button component', button);
assertNoDecorativeEffects(failures, 'IconButton component', iconButton);
assertNoDecorativeEffects(failures, 'Surface component', surface);
assertNoDecorativeEffects(failures, 'Storybook overview', component);
assertNoOverRoundedUsage(failures, 'Button component', button);
assertNoOverRoundedUsage(failures, 'IconButton component', iconButton);
assertNoOverRoundedUsage(failures, 'Surface component', surface);
assertNoOverRoundedUsage(failures, 'Storybook overview', component);

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(failure);
  }

  process.exitCode = 1;
}

async function readPackageJson(path: string): Promise<PackageJson> {
  const parsed: unknown = JSON.parse(await readFile(path, 'utf8'));

  if (!isRecord(parsed)) {
    throw new Error('package.json must be a JSON object.');
  }

  return {
    scripts: readOptionalStringRecord(parsed.scripts, 'scripts'),
    devDependencies: readOptionalStringRecord(parsed.devDependencies, 'devDependencies'),
    exports: isRecord(parsed.exports) ? parsed.exports : undefined,
    sideEffects: Array.isArray(parsed.sideEffects) ? parsed.sideEffects : undefined
  };
}

function readOptionalStringRecord(
  value: unknown,
  path: string
): Record<string, string> | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!isRecord(value)) {
    throw new Error(`package.json field ${path} must be an object.`);
  }

  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry !== 'string' || entry.trim().length === 0) {
      throw new Error(`package.json field ${path}.${key} must be a non-empty string.`);
    }
  }

  return value as Record<string, string>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

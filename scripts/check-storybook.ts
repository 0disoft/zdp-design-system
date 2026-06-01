import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

interface PackageJson {
  readonly scripts?: Record<string, string>;
  readonly devDependencies?: Record<string, string>;
}

const root = process.cwd();
const packagePath = join(root, 'package.json');
const mainPath = join(root, '.storybook', 'main.ts');
const previewPath = join(root, '.storybook', 'preview.ts');
const storyPath = join(root, 'stories', 'DesignSystemOverview.stories.ts');
const componentPath = join(root, 'stories', 'DesignSystemOverview.svelte');
const failures: string[] = [];

const [packageJson, main, preview, story, component] = await Promise.all([
  readPackageJson(packagePath),
  readFile(mainPath, 'utf8'),
  readFile(previewPath, 'utf8'),
  readFile(storyPath, 'utf8'),
  readFile(componentPath, 'utf8')
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
  'swatch__paint--primary',
  'swatch__paint--success',
  'swatch__paint--warning',
  'swatch__paint--danger'
]) {
  if (!component.includes(requiredText)) {
    failures.push(`Storybook overview is missing ${requiredText}.`);
  }
}

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
    devDependencies: readOptionalStringRecord(parsed.devDependencies, 'devDependencies')
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

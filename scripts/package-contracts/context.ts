import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';

export interface PackageJson {
  readonly version?: string;
  readonly license?: string;
  readonly exports?: Record<string, unknown>;
  readonly files?: readonly string[];
  readonly sideEffects?: readonly string[];
  readonly scripts?: Record<string, string>;
}

export async function loadPackageContext() {
const root = process.cwd();

if (existsSync(join(root, 'dist/styles/component-utilities.css'))) {
  throw new Error('CSS utilities must be embedded in components.css instead of shipping their authoring file.');
}

const packagePath = join(root, 'package.json');

const publicComponentPaths = await readPublicComponentPaths();

const storyPaths = [
  'stories/BrandAssets.svelte',
  'stories/CreditAssets.svelte',
  'stories/Buttons.svelte',
  'stories/ButtonPlayground.svelte',
  'stories/DataDisplay.svelte',
  'stories/DesignSystemOverview.svelte',
  'stories/overview/LightOverview.svelte',
  'stories/overview/DarkOverview.svelte',
  'stories/Feedback.svelte',
  'stories/Forms.svelte',
  'stories/Interaction.svelte',
  'stories/InteractionProbe.svelte',
  'stories/Layout.svelte',
  'stories/Navigation.svelte',
  'stories/ThemeLocaleStress.svelte'
] as const;

const componentPaths = [...publicComponentPaths, ...storyPaths];

const defaultLocaleSourcePaths = [
  'src/lib/preferences.ts',
  ...publicComponentPaths
];

const expectedPackageFiles = [
  'dist/',
  'docs/',
  'README.md',
  'LICENSE',
  'CHANGELOG.md',
  'SECURITY.md',
  'THIRD_PARTY_NOTICES.md'
] as const;

const expectedDistArtifactFiles = [
  './dist/brand-assets.js',
  './dist/brand-assets.ts',
  './dist/credit-assets.js',
  './dist/credit-assets.ts',
  './dist/schemas/design-tokens.schema.json'
] as const;

const runtimeArtifactPaths = [
  'dist/brand-assets.js',
  'dist/credit-assets.js',
  'dist/preferences.js',
  'dist/share.js',
  'dist/shortcuts.js',
  'dist/split-pane.js',
  'dist/tokens.js'
] as const;

const expectedSideEffects = [
  './dist/styles/index.css',
  './dist/styles/brand-fonts.css',
  './dist/styles/expressive-fonts.css',
  './dist/styles/locale-fonts.css',
  './dist/styles/tokens.css',
  './dist/styles/components.css'
] as const;

const expectedScripts = {
  'brand-assets:generate': 'bun scripts/generate-brand-assets.ts',
  'brand-assets:check': 'bun scripts/check-brand-assets.ts',
  'credit-assets:check': 'bun scripts/check-credit-assets.ts',
  'consumer:check': 'bun scripts/check-consumer-contract.ts',
  'share-icons:generate': 'bun scripts/generate-share.ts',
  'share-icons:check': 'bun scripts/generate-share.ts --check && bun scripts/check-share-icons.ts',
  'tokens:generate': 'bun scripts/generate-tokens.ts',
  'tokens:check': 'bun scripts/generate-tokens.ts --check && bun scripts/check-tokens.ts',
  'styles:generate': 'bun scripts/generate-component-styles.ts',
  'styles:check': 'bun scripts/generate-component-styles.ts --check',
  'preview:check': 'bun run styles:check && bun scripts/check-preview.ts',
  'granular-css:check': 'bun scripts/check-granular-css.ts',
  'a11y:check': 'bun scripts/check-storybook-a11y.ts',
  'a11y:runtime:check': 'node scripts/check-storybook-runtime-a11y.mjs',
  'ssr:hydration:check': 'node scripts/check-ssr-hydration.mjs',
  'type:check': 'svelte-check --tsconfig ./tsconfig.json',
  'package:build': 'bun run styles:check && bun scripts/generate-tokens.ts && bun scripts/generate-share.ts && bun scripts/build-package.ts',
  'package:build:check': 'bun scripts/check-package-build.ts',
  'package:check': 'bun run package:build:check && bun run granular-css:check && bun scripts/check-package.ts',
  'publish:check': 'bun scripts/check-publish-readiness.ts',
  'fixtures:check': 'bun scripts/check-consumer-fixtures.ts'
} as const;

const failures: string[] = [];
async function readPublicComponentPaths(): Promise<readonly string[]> {
  const publicEntryPath = 'src/lib/index.ts';
  const source = await readFile(join(root, publicEntryPath), 'utf8');
  const matches = [
    ...source.matchAll(/export \{ default as [A-Za-z0-9_]+ \} from '\.\/components\/([^']+\.svelte)';/g)
  ];
  const paths = matches.map((match) => `src/lib/components/${match[1]}`);
  const uniquePaths = [...new Set(paths)].sort((a, b) => a.localeCompare(b));

  if (uniquePaths.length === 0) {
    throw new Error(`${publicEntryPath} must export at least one public Svelte component.`);
  }

  if (uniquePaths.length !== paths.length) {
    throw new Error(`${publicEntryPath} must not export the same Svelte component path more than once.`);
  }

  return uniquePaths;
}

async function readPackageJson(path: string): Promise<PackageJson> {
  const parsed: unknown = JSON.parse(await readFile(path, 'utf8'));

  if (!isRecord(parsed)) {
    throw new Error('package.json must be a JSON object.');
  }

  return {
    ...(typeof parsed.version === 'string' ? { version: parsed.version } : {}),
    ...(typeof parsed.license === 'string' ? { license: parsed.license } : {}),
    ...(isRecord(parsed.exports) ? { exports: parsed.exports } : {}),
    ...(isStringArray(parsed.files) ? { files: parsed.files } : {}),
    ...(isStringArray(parsed.sideEffects) ? { sideEffects: parsed.sideEffects } : {}),
    ...(isStringRecord(parsed.scripts) ? { scripts: parsed.scripts } : {})
  };
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
const packageJson = await readPackageJson(packagePath);
return { packageJson, root, failures, componentPaths, defaultLocaleSourcePaths, expectedPackageFiles, expectedDistArtifactFiles, runtimeArtifactPaths, expectedSideEffects, expectedScripts };
}

export type PackageCheckContext = Awaited<ReturnType<typeof loadPackageContext>>;

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readdir, readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import {
  createComponentStyleEntry,
  readPublicComponentExports,
  unwrapSvelteGlobalSelectors
} from './component-style-entries';

interface PackageJson {
  readonly exports?: Record<string, unknown>;
  readonly sideEffects?: readonly unknown[];
  readonly scripts?: Record<string, string>;
}

const root = process.cwd();
const publicEntryPath = resolve(root, 'src/lib/index.ts');
const componentSourceRoot = resolve(root, 'src/lib/components');
const componentStyleRoot = resolve(root, 'dist/styles/components');
const foundationSourcePath = resolve(root, 'src/styles/foundation.css');
const foundationDistPath = resolve(root, 'dist/styles/foundation.css');
const packagePath = resolve(root, 'package.json');
const require = createRequire(import.meta.url);

const publicEntrySource = await readFile(publicEntryPath, 'utf8');
const components = readPublicComponentExports(publicEntrySource);
const expectedStyleFiles = components.map((component) => `${component.name}.css`);
const actualStyleFiles = (await readdir(componentStyleRoot, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith('.css'))
  .map((entry) => entry.name)
  .sort(compareStrings);

assert.deepEqual(
  actualStyleFiles,
  [...expectedStyleFiles].sort(compareStrings),
  'Generated component CSS entries must exactly match the public Svelte component barrel.'
);

for (const component of components) {
  const source = await readFile(resolve(componentSourceRoot, component.fileName), 'utf8');
  const expectedCss = createComponentStyleEntry(component, source);
  const actualCss = await readFile(resolve(componentStyleRoot, `${component.name}.css`), 'utf8');

  assert.equal(
    actualCss,
    expectedCss,
    `${component.name}.css must be regenerated from ${component.fileName}.`
  );
  assert.equal(
    unwrapSvelteGlobalSelectors(actualCss),
    actualCss,
    `${component.name}.css contains Svelte-only CSS.`
  );
  assert.doesNotMatch(actualCss, /<style\b/i, `${component.name}.css contains component markup.`);
  assert.doesNotMatch(actualCss, /@import\b/i, `${component.name}.css must not duplicate foundation CSS.`);
}

const foundationSource = await readFile(foundationSourcePath, 'utf8');
const foundationDist = await readFile(foundationDistPath, 'utf8');
assert.equal(foundationDist, foundationSource, 'Published foundation.css must match its source entry.');
assert.match(foundationDist, /^@import ["']\.\/tokens\.css["'];/m);
assert.doesNotMatch(foundationDist, /@import\s+(?:url\()?\s*["']?(?:https?:)?\/\//i);
assert.match(foundationDist, /@media \(forced-colors: active\)/);
assert.match(foundationDist, /\[class\^=['"]zdp-['"]\][\s\S]*:focus-visible/);
assert.match(foundationDist, /aria-disabled=['"]true['"]/);
assert.match(foundationDist, /aria-selected=['"]true['"]/);
assert.doesNotMatch(foundationDist, /\.zdp-button\b/);

const buttonCss = await readFile(resolve(componentStyleRoot, 'Button.css'), 'utf8');
assert.match(buttonCss, /\.zdp-button\b/);
for (const unrelatedSelector of ['.zdp-dialog', '.zdp-tooltip', '.zdp-table']) {
  assert.equal(
    buttonCss.includes(unrelatedSelector),
    false,
    `Button.css must not pull unrelated selector ${unrelatedSelector}.`
  );
}

const fieldCss = await readFile(resolve(componentStyleRoot, 'Field.css'), 'utf8');
assert.match(fieldCss, /\.zdp-field\[data-disabled=["']true["']\] \.zdp-input:not\(:disabled\)/);

const packageJson = await readPackageJson(packagePath);
assert.equal(
  packageJson.exports?.['./foundation.css'],
  './dist/styles/foundation.css',
  'package.json must export foundation.css.'
);
assert.equal(
  packageJson.exports?.['./components/*.css'],
  './dist/styles/components/*.css',
  'package.json must export generated component CSS entries.'
);
assert.ok(
  packageJson.sideEffects?.includes('./dist/styles/foundation.css'),
  'foundation.css must remain visible to bundlers as a side effect.'
);
assert.ok(
  packageJson.sideEffects?.includes('./dist/styles/components/*.css'),
  'Generated component CSS must remain visible to bundlers as side effects.'
);
assert.equal(
  packageJson.scripts?.['granular-css:check'],
  'bun scripts/check-granular-css.ts',
  'package.json granular-css:check must run this contract.'
);
assert.ok(
  packageJson.scripts?.['package:check']?.includes('bun run granular-css:check'),
  'The package check must validate granular CSS after building dist.'
);

assertSelfReference(
  'zdp-design-system/foundation.css',
  'dist/styles/foundation.css'
);
assertSelfReference(
  'zdp-design-system/components/Button.css',
  'dist/styles/components/Button.css'
);

console.log(`Granular CSS check passed for foundation.css and ${components.length} component entries.`);

function assertSelfReference(specifier: string, expectedRelativePath: string): void {
  const resolvedPath = require.resolve(specifier);
  const actualRelativePath = normalizePath(relative(root, resolvedPath));
  assert.equal(actualRelativePath, expectedRelativePath, `${specifier} resolved to an unexpected file.`);
}

async function readPackageJson(path: string): Promise<PackageJson> {
  const parsed: unknown = JSON.parse(await readFile(path, 'utf8'));
  assert.ok(isRecord(parsed), 'package.json must be an object.');

  return {
    ...(isRecord(parsed.exports) ? { exports: parsed.exports } : {}),
    ...(Array.isArray(parsed.sideEffects) ? { sideEffects: parsed.sideEffects } : {}),
    ...(isStringRecord(parsed.scripts) ? { scripts: parsed.scripts } : {})
  };
}

function compareStrings(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function normalizePath(path: string): string {
  return path.replaceAll('\\', '/');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === 'string');
}

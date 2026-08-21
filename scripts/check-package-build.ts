import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { recoverAtomicDirectory, replaceDirectoryAtomically } from './atomic-directory';
import {
  createComponentStyleEntry,
  readPublicComponentExports,
  unwrapSvelteGlobalSelectors
} from './component-style-entries';
import { createPublicRuntimeEntry, createPublicTypeEntry } from './package-entry';

const fixtureRoot = await mkdtemp(join(tmpdir(), 'zdp-package-build-'));
const targetRoot = join(fixtureRoot, 'dist');
const stagingRoot = join(fixtureRoot, 'dist.__staging__');
const backupRoot = join(fixtureRoot, 'dist.__previous__');
const atomicPaths = { backupRoot, stagingRoot, targetRoot };

try {
  await mkdir(targetRoot);
  await writeFile(join(targetRoot, 'marker.txt'), 'previous');
  await mkdir(stagingRoot);
  await writeFile(join(stagingRoot, 'marker.txt'), 'candidate');

  await assert.rejects(
    replaceDirectoryAtomically({
      ...atomicPaths,
      beforePromote: async () => {
        throw new Error('intentional promotion failure');
      }
    }),
    /intentional promotion failure/
  );
  assert.equal(
    await readFile(join(targetRoot, 'marker.txt'), 'utf8'),
    'previous',
    'A failed promotion must restore the previously complete package.'
  );

  await rm(stagingRoot, { force: true, recursive: true });
  await mkdir(stagingRoot);
  await writeFile(join(stagingRoot, 'marker.txt'), 'candidate');
  await replaceDirectoryAtomically(atomicPaths);
  assert.equal(await readFile(join(targetRoot, 'marker.txt'), 'utf8'), 'candidate');
  assert.equal(existsSync(backupRoot), false, 'A completed promotion must remove its backup.');

  await rm(targetRoot, { force: true, recursive: true });
  await mkdir(backupRoot);
  await writeFile(join(backupRoot, 'marker.txt'), 'recoverable');
  await mkdir(stagingRoot);
  await writeFile(join(stagingRoot, 'partial.txt'), 'partial');
  await recoverAtomicDirectory(atomicPaths);
  assert.equal(await readFile(join(targetRoot, 'marker.txt'), 'utf8'), 'recoverable');
  assert.equal(existsSync(stagingRoot), false, 'Recovery must discard an incomplete staging tree.');

  const entrySource = `
export { default as Field } from './components/Field.svelte';
export { default as Button } from './components/Button.svelte';
export interface DirectInterface { readonly id: string; }
export type DirectAlias = 'ready';
export const directValue = 1;
const internalValue = 2;
`;
  const typeEntry = createPublicTypeEntry(entrySource);
  const runtimeEntry = createPublicRuntimeEntry(entrySource);
  assert.match(typeEntry, /export interface DirectInterface/);
  assert.match(typeEntry, /export type DirectAlias/);
  assert.match(typeEntry, /export const directValue/);
  assert.doesNotMatch(typeEntry, /internalValue/);
  assert.match(runtimeEntry, /export const directValue = 1/);
  assert.doesNotMatch(runtimeEntry, /DirectInterface|DirectAlias|internalValue/);

  const publicComponents = readPublicComponentExports(entrySource);
  assert.deepEqual(publicComponents, [
    { name: 'Button', fileName: 'Button.svelte' },
    { name: 'Field', fileName: 'Field.svelte' }
  ]);

  const componentCss = createComponentStyleEntry(
    publicComponents[0]!,
    `<style>
      :global([data-zdp-theme="dark"]) .zdp-button { color: white; }
      .zdp-button :global(svg) { display: block; }
      .zdp-button :global(:where(span:not(.muted), strong)) { margin: 0; }
    </style>`
  );
  assert.match(componentCss, /\[data-zdp-theme="dark"\] \.zdp-button/);
  assert.match(componentCss, /\.zdp-button svg/);
  assert.match(componentCss, /\.zdp-button :where\(span:not\(\.muted\), strong\)/);
  assert.doesNotMatch(componentCss, /:global/);
  assert.throws(
    () => unwrapSvelteGlobalSelectors('.zdp-button :global(svg'),
    /Unbalanced :global/
  );
  assert.throws(
    () => readPublicComponentExports("export { default as Action } from './components/Button.svelte';"),
    /must match its Svelte file name/
  );
} finally {
  await rm(fixtureRoot, { force: true, recursive: true });
}

console.log('Package build atomicity and entry generation check passed.');

import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { recoverAtomicDirectory, replaceDirectoryAtomically } from './atomic-directory';
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
} finally {
  await rm(fixtureRoot, { force: true, recursive: true });
}

console.log('Package build atomicity and entry generation check passed.');

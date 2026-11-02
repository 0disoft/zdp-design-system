import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, open, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { releaseArtifactLockName, withReleaseArtifactWorkspace } from './release-artifact-workspace';

function gate() {
  let resolve!: () => void;
  const promise = new Promise<void>(yes => { resolve = yes; });
  return { promise, resolve };
}

async function fixture(run: (output: string) => Promise<void>) {
  const output = await mkdtemp(join(tmpdir(), 'zdp-artifact-owner-test-'));
  try { await run(output); }
  finally { await rm(output, { force: true, recursive: true }); }
}

function lockProbe(failure?: { write?: Error; close?: Error }) {
  let closes = 0;
  return {
    closes: () => closes,
    async openLock(path: string) {
      const handle = await open(path, 'wx');
      return {
        async writeFile(content: string) {
          if (failure?.write) throw failure.write;
          await handle.writeFile(content);
        },
        async close() {
          closes++;
          await handle.close();
          if (failure?.close) throw failure.close;
        }
      };
    }
  };
}

test('success closes the real handle, removes staging and lock, and preserves the return value', async () => fixture(async output => {
  const probe = lockProbe();
  let staging = '';
  const result = await withReleaseArtifactWorkspace(output, async path => {
    staging = path;
    assert.equal(existsSync(path), true);
    assert.equal(existsSync(join(output, releaseArtifactLockName)), true);
    await writeFile(join(path, 'temporary'), 'staged');
    return 42;
  }, probe);
  assert.equal(result, 42);
  assert.equal(probe.closes(), 1);
  assert.equal(existsSync(dirname(staging)), false);
  assert.equal(existsSync(join(output, releaseArtifactLockName)), false);
  await withReleaseArtifactWorkspace(output, async () => {});
}));

for (const failure of [new Error('pack failed'), new DOMException('cancelled', 'AbortError')]) {
  test(`${failure.name} during artifact generation releases all owned resources`, async () => fixture(async output => {
    const probe = lockProbe();
    let staging = '';
    await assert.rejects(withReleaseArtifactWorkspace(output, async path => {
      staging = path;
      throw failure;
    }, probe), error => error === failure);
    assert.equal(probe.closes(), 1);
    assert.equal(existsSync(dirname(staging)), false);
    assert.equal(existsSync(join(output, releaseArtifactLockName)), false);
  }));
}

test('staging creation failure cannot leak the already-created temporary root or lock', async () => fixture(async output => {
  const probe = lockProbe();
  const failure = new Error('staging mkdir failed');
  let staging = '';
  let called = false;
  await assert.rejects(withReleaseArtifactWorkspace(output, async () => { called = true; }, {
    openLock: probe.openLock,
    createStaging: async path => { staging = path; throw failure; }
  }), error => error === failure);
  assert.equal(called, false);
  assert.equal(existsSync(dirname(staging)), false);
  assert.equal(existsSync(join(output, releaseArtifactLockName)), false);
  assert.equal(probe.closes(), 1);
}));

for (const stage of ['write', 'close'] as const) {
  test(`lock ${stage} failure still attempts complete cleanup`, async () => fixture(async output => {
    const failure = new Error(`${stage} failed`);
    const probe = lockProbe({ [stage]: failure });
    let staging = '';
    await assert.rejects(withReleaseArtifactWorkspace(output, async path => { staging = path; }, probe), error => error === failure);
    assert.equal(probe.closes(), 1);
    assert.equal(existsSync(join(output, releaseArtifactLockName)), false);
    if (staging) assert.equal(existsSync(dirname(staging)), false);
    await withReleaseArtifactWorkspace(output, async () => {});
  }));
}

test('concurrent callers and a separate process cannot overwrite the active output', async () => fixture(async output => {
  const entered = gate();
  const release = gate();
  const manifest = join(output, 'release-artifact.json');
  await writeFile(manifest, 'previous');
  const owner = withReleaseArtifactWorkspace(output, async () => {
    entered.resolve();
    await release.promise;
    await writeFile(manifest, 'complete');
  });
  try {
    await entered.promise;
    await assert.rejects(withReleaseArtifactWorkspace(output, async () => {
      await writeFile(manifest, 'corrupted');
    }), /output already locked/);
    const contender = spawnSync(process.execPath, ['--eval', `
      import { withReleaseArtifactWorkspace } from ${JSON.stringify(new URL('./release-artifact-workspace.ts', import.meta.url).href)};
      import { writeFile } from 'node:fs/promises';
      await withReleaseArtifactWorkspace(${JSON.stringify(output)}, async () => {
        await writeFile(${JSON.stringify(manifest)}, 'corrupted');
      });
    `], { encoding: 'utf8', timeout: 10_000, windowsHide: true });
    assert.ifError(contender.error);
    assert.notEqual(contender.status, 0);
    assert.match(contender.stderr, /output already locked/);
    assert.equal(await readFile(manifest, 'utf8'), 'previous');
    assert.equal(existsSync(join(output, releaseArtifactLockName)), true, 'A rejected contender must not remove the owner lock.');
    release.resolve();
    await owner;
    assert.equal(await readFile(manifest, 'utf8'), 'complete');
    assert.equal(existsSync(join(output, releaseArtifactLockName)), false);
  } finally {
    release.resolve();
    await owner;
  }
}));

test('different output directories do not block each other', async () => fixture(async first => fixture(async second => {
  await withReleaseArtifactWorkspace(first, async () => {
    const result = await withReleaseArtifactWorkspace(second, async () => 'independent');
    assert.equal(result, 'independent');
  });
})));

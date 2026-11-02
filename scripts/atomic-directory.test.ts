import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { withAtomicDirectory, type AtomicDirectoryPaths } from './atomic-directory';

function gate() {
  let resolve!: () => void;
  const promise = new Promise<void>(yes => { resolve = yes; });
  return { promise, resolve };
}

async function flush() {
  for (let turn = 0; turn < 12; turn++) await Promise.resolve();
}

function lockFixture(failures: { write?: Error; close?: Error } = {}) {
  let locked = false;
  const events: string[] = [];
  const io = {
    async openLock() {
      if (locked) throw Object.assign(new Error('already locked'), { code: 'EEXIST' });
      locked = true;
      events.push('open');
      return {
        async writeFile() { events.push('write'); if (failures.write) throw failures.write; },
        async close() { events.push('close'); if (failures.close) throw failures.close; }
      };
    },
    async removeLock() { events.push('remove'); locked = false; }
  };
  return { io, events, locked: () => locked };
}

async function fixture(run: (paths: AtomicDirectoryPaths) => Promise<void>) {
  const root = await mkdtemp(join(tmpdir(), 'zdp-atomic-lifetime-'));
  const paths = { targetRoot: join(root, 'dist'), stagingRoot: join(root, 'staging'), backupRoot: join(root, 'backup') };
  try {
    await mkdir(paths.targetRoot);
    await mkdir(paths.stagingRoot);
    await writeFile(join(paths.targetRoot, 'marker'), 'previous');
    await writeFile(join(paths.stagingRoot, 'marker'), 'candidate');
    await run(paths);
  } finally {
    await rm(root, { force: true, recursive: true });
  }
}

test('returning early keeps ownership until the outstanding promotion completes', async () => fixture(async paths => {
  const entered = gate();
  const release = gate();
  const lock = lockFixture();
  let finished = false;
  let promotion!: Promise<void>;
  const owner = withAtomicDirectory(paths, async transaction => {
    promotion = transaction.replace(async () => { entered.resolve(); await release.promise; });
    await entered.promise;
    return 42;
  }, lock.io);
  const outcome = owner.then(value => { finished = true; return value; });
  try {
    await entered.promise;
    await flush();
    assert.equal(finished, false);
    assert.equal(lock.locked(), true);
    assert.deepEqual(lock.events, ['open', 'write']);
    await assert.rejects(withAtomicDirectory(paths, transaction => transaction.recover(), lock.io), /already locked/);
    assert.equal(await readFile(join(paths.stagingRoot, 'marker'), 'utf8'), 'candidate');
    release.resolve();
    assert.equal(await outcome, 42);
    assert.equal(await readFile(join(paths.targetRoot, 'marker'), 'utf8'), 'candidate');
    assert.deepEqual(lock.events, ['open', 'write', 'close', 'remove']);
  } finally {
    release.resolve();
    await Promise.allSettled([outcome, promotion]);
  }
}));

test('callback cancellation waits for rollback before releasing the lock', async () => fixture(async paths => {
  const entered = gate();
  const release = gate();
  const lock = lockFixture();
  const cancellation = new DOMException('cancelled', 'AbortError');
  let finished = false;
  let promotion!: Promise<void>;
  const owner = withAtomicDirectory(paths, async transaction => {
    promotion = transaction.replace(async () => {
      entered.resolve();
      await release.promise;
      throw new Error('promotion failed');
    });
    await entered.promise;
    throw cancellation;
  }, lock.io);
  const outcome = owner.then(() => { finished = true; return null; }, error => { finished = true; return error; });
  try {
    await entered.promise;
    await flush();
    assert.equal(finished, false);
    assert.deepEqual(lock.events, ['open', 'write']);
    release.resolve();
    assert.equal(await outcome, cancellation);
    assert.equal(await readFile(join(paths.targetRoot, 'marker'), 'utf8'), 'previous');
    assert.deepEqual(lock.events, ['open', 'write', 'close', 'remove']);
  } finally {
    release.resolve();
    await Promise.allSettled([outcome, promotion]);
  }
}));

test('overlapping recovery and replacement on one transaction fail before touching staging', async () => fixture(async paths => {
  const lock = lockFixture();
  const entered = gate();
  const release = gate();
  await withAtomicDirectory(paths, async transaction => {
    const promotion = transaction.replace(async () => { entered.resolve(); await release.promise; });
    try {
      await entered.promise;
      await assert.rejects(transaction.recover(), /operation in progress/);
      await assert.rejects(transaction.replace(), /operation in progress/);
      assert.equal(await readFile(join(paths.stagingRoot, 'marker'), 'utf8'), 'candidate');
    } finally {
      release.resolve();
      await promotion;
    }
  }, lock.io);
  assert.equal(await readFile(join(paths.targetRoot, 'marker'), 'utf8'), 'candidate');
}));

test('a sequential recovery and replacement still share one ownership lifetime', async () => fixture(async paths => {
  const lock = lockFixture();
  let retained!: Parameters<Parameters<typeof withAtomicDirectory>[1]>[0];
  await withAtomicDirectory(paths, async transaction => {
    retained = transaction;
    await transaction.recover();
    await mkdir(paths.stagingRoot);
    await writeFile(join(paths.stagingRoot, 'marker'), 'rebuilt');
    await transaction.replace();
  }, lock.io);
  assert.equal(await readFile(join(paths.targetRoot, 'marker'), 'utf8'), 'rebuilt');
  await assert.rejects(retained.recover(), /already closed/);
  assert.deepEqual(lock.events, ['open', 'write', 'close', 'remove']);
}));

test('lock metadata write failure still closes the handle and removes the lock', async () => {
  const failure = new Error('disk full');
  const lock = lockFixture({ write: failure });
  let called = false;
  await assert.rejects(withAtomicDirectory({ targetRoot: 'unused', stagingRoot: 'unused', backupRoot: 'unused' },
    async () => { called = true; }, lock.io), error => error === failure);
  assert.equal(called, false);
  assert.deepEqual(lock.events, ['open', 'write', 'close', 'remove']);
});

test('close failure cannot skip lock removal', async () => {
  const failure = new Error('close failed');
  const lock = lockFixture({ close: failure });
  await assert.rejects(withAtomicDirectory({ targetRoot: 'unused', stagingRoot: 'unused', backupRoot: 'unused' },
    async () => {}, lock.io), error => error === failure);
  assert.deepEqual(lock.events, ['open', 'write', 'close', 'remove']);
  assert.equal(lock.locked(), false);
});

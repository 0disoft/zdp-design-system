import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createZdpCodeCopyController, type ZdpCodeCopyState } from '../src/lib/code-copy.js';

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

async function flush() {
  for (let turn = 0; turn < 6; turn++) await Promise.resolve();
}

function fixture(environment: NonNullable<Parameters<typeof createZdpCodeCopyController>[1]> = {}) {
  let now = 0;
  let nextId = 0;
  const timers = new Map<number, { at: number; callback: () => void }>();
  const writes: string[] = [];
  const requests: ReturnType<typeof deferred>[] = [];
  let snapshot: { state: ZdpCodeCopyState; progress: boolean } = { state: 'idle', progress: false };
  const history: typeof snapshot[] = [];
  const controller = createZdpCodeCopyController((state, progress) => {
    snapshot = { state, progress };
    history.push(snapshot);
  }, {
    schedule: (callback, delayMs) => {
      const id = ++nextId;
      timers.set(id, { at: now + delayMs, callback });
      return () => { timers.delete(id); };
    },
    writeText: text => {
      writes.push(text);
      const request = deferred();
      requests.push(request);
      return request.promise;
    },
    ...environment
  });
  return {
    controller, writes, requests, timers, history, snapshot: () => snapshot,
    async advance(ms: number) {
      const target = now + ms;
      for (;;) {
        const entry = [...timers].sort((a, b) => a[1].at - b[1].at).find(([, timer]) => timer.at <= target);
        if (!entry) break;
        now = entry[1].at;
        timers.delete(entry[0]);
        entry[1].callback();
        await flush();
      }
      now = target;
      await flush();
    }
  };
}

for (const elapsed of [149, 150, 151]) {
  test(`progress at ${elapsed}ms respects the 150ms boundary`, async () => {
    const f = fixture();
    const pending = f.controller.copy('code');
    await f.advance(elapsed);
    assert.deepEqual(f.snapshot(), { state: 'copying', progress: elapsed >= 150 });
    f.controller.destroy();
    await pending;
    assert.equal(f.timers.size, 0);
  });
}

for (const elapsed of [9999, 10_000, 10_001]) {
  test(`unresolved copy at ${elapsed}ms respects the 10s deadline`, async () => {
    const f = fixture();
    const pending = f.controller.copy('code');
    await f.advance(elapsed);
    assert.equal(f.snapshot().state, elapsed >= 10_000 ? 'failed' : 'copying');
    f.controller.destroy();
    await pending;
    assert.equal(f.timers.size, 0);
  });
}

for (const elapsed of [2199, 2200, 2201]) {
  test(`success feedback at ${elapsed}ms respects the 2.2s boundary`, async () => {
    const f = fixture({ writeText: async () => {} });
    await f.controller.copy('code');
    assert.deepEqual(f.snapshot(), { state: 'copied', progress: false });
    await f.advance(elapsed);
    assert.equal(f.snapshot().state, elapsed >= 2200 ? 'idle' : 'copied');
    f.controller.destroy();
  });
}

test('fast completion never flashes progress or retains the deadline timer', async () => {
  const f = fixture({ writeText: async () => {} });
  await f.controller.copy('code');
  assert.equal(f.history.some(value => value.progress), false);
  assert.equal(f.timers.size, 1);
  await f.advance(10_000);
  assert.equal(f.snapshot().state, 'idle');
  assert.equal(f.timers.size, 0);
  f.controller.destroy();
});

test('timeout allows retry and late success cannot overwrite the new request', async () => {
  const f = fixture();
  const first = f.controller.copy('old');
  await f.controller.copy('duplicate');
  assert.deepEqual(f.writes, ['old']);
  await f.advance(10_000);
  await first;
  const retry = f.controller.copy('new');
  f.requests[0]!.resolve();
  await flush();
  assert.equal(f.snapshot().state, 'copying');
  f.requests[1]!.resolve();
  await retry;
  assert.equal(f.snapshot().state, 'copied');
  assert.deepEqual(f.writes, ['old', 'new']);
  f.controller.destroy();
});

test('replacing code cancels the wait and ignores a late rejection', async () => {
  const f = fixture();
  const pending = f.controller.copy('old');
  f.controller.reset();
  await pending;
  const historyLength = f.history.length;
  f.requests[0]!.reject(new Error('late rejection'));
  await flush();
  assert.equal(f.history.length, historyLength);
  assert.deepEqual(f.snapshot(), { state: 'idle', progress: false });
  assert.equal(f.timers.size, 0);
  f.controller.destroy();
});

test('pre-aborted signal prevents clipboard writes and timers', async () => {
  const f = fixture({ signal: AbortSignal.abort() });
  await f.controller.copy('code');
  assert.equal(f.writes.length, 0);
  assert.equal(f.timers.size, 0);
  f.controller.destroy();
});

test('abort releases a pending copy immediately and rejects future work', async () => {
  const abort = new AbortController();
  let receivedSignal: AbortSignal | undefined;
  const request = deferred();
  const f = fixture({ signal: abort.signal, writeText: (_text, signal) => {
    receivedSignal = signal;
    return request.promise;
  } });
  const pending = f.controller.copy('code');
  await f.advance(150);
  abort.abort();
  await pending;
  assert.equal(receivedSignal, abort.signal);
  assert.deepEqual(f.snapshot(), { state: 'idle', progress: false });
  assert.equal(f.timers.size, 0);
  const historyLength = f.history.length;
  request.resolve();
  await f.controller.copy('new');
  await flush();
  assert.equal(f.history.length, historyLength);
  f.controller.destroy();
});

for (const synchronous of [true, false]) {
  test(`${synchronous ? 'synchronous exception' : 'rejected promise'} fails without leaving progress active`, async () => {
    const failure = new Error('clipboard denied');
    const f = fixture({ writeText: () => {
      if (synchronous) throw failure;
      return Promise.reject(failure);
    } });
    await f.controller.copy('code');
    assert.deepEqual(f.snapshot(), { state: 'failed', progress: false });
    await f.advance(2200);
    assert.equal(f.snapshot().state, 'idle');
    assert.equal(f.timers.size, 0);
    f.controller.destroy();
  });
}

test('destroy settles pending work and late completion cannot schedule feedback', async () => {
  const f = fixture();
  const pending = f.controller.copy('code');
  f.controller.destroy();
  await pending;
  const historyLength = f.history.length;
  f.controller.destroy();
  f.requests[0]!.resolve();
  await f.controller.copy('new');
  await flush();
  assert.equal(f.history.length, historyLength);
  assert.equal(f.timers.size, 0);
  assert.deepEqual(f.writes, ['code']);
});

test('empty text does not start clipboard work', async () => {
  const f = fixture();
  await f.controller.copy('');
  assert.equal(f.writes.length, 0);
  assert.equal(f.timers.size, 0);
  f.controller.destroy();
});

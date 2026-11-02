import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { computePosition } from '@floating-ui/dom';
import { positionZdpFloatingPanel } from '../src/lib/floating-position.js';

type Environment = NonNullable<Parameters<typeof positionZdpFloatingPanel>[2]>;
type Result = Awaited<ReturnType<typeof computePosition>>;
type Configuration = NonNullable<Parameters<typeof computePosition>[2]>;
const result = (x = 12, y = 24): Result => ({ x, y, placement: 'bottom-start', strategy: 'fixed', middlewareData: {} });
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };

function deferred() {
  let resolve!: (value: Result) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<Result>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function fixture(overrides: Environment = {}) {
  const values = new Map([['left', '7px']]);
  const attributes = new Map([['data-side', 'top']]);
  const panel = {
    isConnected: true,
    style: {
      getPropertyValue: (name: string) => values.get(name) ?? '',
      setProperty: (name: string, value: string) => { values.set(name, value); },
      removeProperty: (name: string) => { values.delete(name); }
    },
    getAttribute: (name: string) => attributes.get(name) ?? null,
    setAttribute: (name: string, value: string) => { attributes.set(name, value); },
    removeAttribute: (name: string) => { attributes.delete(name); },
    dataset: {
      set side(value: string) { attributes.set('data-side', value); },
      set align(value: string) { attributes.set('data-align', value); }
    }
  } as unknown as HTMLElement;
  const options = { anchor: {} as HTMLElement, gapSource: {} as HTMLElement, prefix: 'menu' as const, matchAnchorWidth: true,
    onPosition: () => { positioned++; } };
  let refresh = () => {};
  let stops = 0;
  let starts = 0;
  let positioned = 0;
  const configurations: Configuration[] = [];
  const environment: Environment = {
    getGap: () => 8,
    getBoundaries: () => [],
    autoUpdate: (_anchor, _panel, update) => { starts++; refresh = update; update(); return () => { stops++; }; },
    computePosition: async (_anchor, _panel, configuration) => {
      configurations.push(configuration!);
      return result();
    },
    ...overrides
  };
  return { panel, options, environment, values, attributes, configurations,
    start: () => positionZdpFloatingPanel(panel, options, environment),
    refresh: () => refresh(), counts: () => ({ starts, stops, positioned }) };
}

test('default two-argument call with no anchor keeps the action signature and performs no DOM I/O', () => {
  const f = fixture();
  const action = positionZdpFloatingPanel(f.panel, { ...f.options, anchor: null });
  action.update({ ...f.options, anchor: null });
  action.destroy();
  assert.deepEqual([...f.values], [['left', '7px']]);
});

for (const gap of [-0.001, 0, 0.001, NaN, Infinity]) {
  test(`gap ${gap} uses finite nonnegative offset and collision padding`, async () => {
    const f = fixture({ getGap: () => gap });
    const action = f.start();
    await flush();
    const middleware = f.configurations[0]!.middleware!;
    const distance = middleware.find(item => item && item.name === 'offset');
    const flip = middleware.find(item => item && item.name === 'flip');
    assert.ok(distance && flip);
    const expected = Number.isFinite(gap) ? Math.max(0, gap) : 0;
    assert.equal(distance.options, expected);
    assert.equal(flip.options.padding, expected);
    assert.equal(f.values.get('left'), '12px');
    action.destroy();
  });
}

for (const available of [-0.001, 0, 0.001, 99.999, 100, 100.001, NaN, Infinity]) {
  test(`available width ${available} respects zero and anchor-width boundaries`, async () => {
    const f = fixture();
    const action = f.start();
    await flush();
    const sizing = f.configurations[0]!.middleware!.find(item => item && item.name === 'size');
    assert.ok(sizing);
    const apply = sizing.options.apply as (value: {
      availableWidth: number; availableHeight: number; rects: { reference: { width: number } };
    }) => void;
    apply({ availableWidth: available, availableHeight: available, rects: { reference: { width: 100 } } });
    const expected = Number.isFinite(available) ? Math.max(0, available) : 0;
    assert.equal(f.values.get('--zdp-menu-available-width'), `${expected}px`);
    assert.equal(f.values.get('--zdp-menu-available-height'), `${expected}px`);
    assert.equal(f.values.get('--zdp-menu-panel-width'), `${Math.min(100, expected)}px`);
    apply({ availableWidth: 100, availableHeight: 100, rects: { reference: { width: NaN } } });
    assert.equal(f.values.get('--zdp-menu-anchor-width'), '0px');
    assert.equal(f.values.get('--zdp-menu-panel-width'), '0px');
    action.destroy();
    apply({ availableWidth: 42, availableHeight: 42, rects: { reference: { width: 42 } } });
    assert.equal(f.values.has('--zdp-menu-panel-width'), false);
  });
}

test('pre-aborted signal skips all observation and measurement even on update', () => {
  const f = fixture({ signal: AbortSignal.abort() });
  const action = f.start();
  action.update(f.options);
  action.destroy();
  assert.deepEqual(f.counts(), { starts: 0, stops: 0, positioned: 0 });
  assert.deepEqual([...f.values], [['left', '7px']]);
});

test('abort during calculation restores fallback once and ignores the late result', async () => {
  const pending = deferred();
  const controller = new AbortController();
  const f = fixture({ signal: controller.signal, computePosition: () => pending.promise });
  const action = f.start();
  controller.abort();
  pending.resolve(result());
  await flush();
  action.update(f.options);
  action.destroy();
  assert.deepEqual(f.counts(), { starts: 1, stops: 1, positioned: 0 });
  assert.deepEqual([...f.values], [['left', '7px']]);
  assert.deepEqual([...f.attributes], [['data-side', 'top']]);
});

test('synchronous cancellation while observation starts still stops its returned subscription', () => {
  const controller = new AbortController();
  let stopped = 0;
  const f = fixture({ signal: controller.signal, autoUpdate: () => {
    controller.abort();
    return () => { stopped++; };
  } });
  const action = f.start();
  action.destroy();
  assert.equal(stopped, 1);
  assert.deepEqual([...f.values], [['left', '7px']]);
});

test('obsolete rejection cannot stop a newer successful position', async () => {
  const pending = deferred();
  let calls = 0;
  const f = fixture({ computePosition: () => ++calls === 1 ? pending.promise : Promise.resolve(result(-0.001, 0)) });
  const action = f.start();
  f.refresh();
  await flush();
  pending.reject(new Error('obsolete layout'));
  await flush();
  assert.equal(f.values.get('left'), '-0.001px');
  assert.equal(f.values.get('top'), '0px');
  assert.deepEqual(f.counts(), { starts: 1, stops: 0, positioned: 1 });
  action.destroy();
});

test('current calculation failure restores fallback and update can retry', async () => {
  let calls = 0;
  const f = fixture({ computePosition: () => ++calls === 1 ? Promise.reject(new Error('layout unavailable')) : Promise.resolve(result()) });
  const action = f.start();
  await flush();
  assert.deepEqual([...f.values], [['left', '7px']]);
  assert.deepEqual(f.counts(), { starts: 1, stops: 1, positioned: 0 });
  action.update(f.options);
  await flush();
  assert.equal(f.values.get('left'), '12px');
  action.destroy();
});

for (const [x, y] of [[NaN, 1], [1, Infinity], [-Infinity, 1]]) {
  test(`invalid coordinates (${x}, ${y}) restore fallback without announcing positioning`, async () => {
    const f = fixture({ computePosition: async () => result(x, y) });
    const action = f.start();
    await flush();
    assert.deepEqual([...f.values], [['left', '7px']]);
    assert.deepEqual(f.counts(), { starts: 1, stops: 1, positioned: 0 });
    action.destroy();
  });
}

test('observation setup exception restores mutations before propagating', () => {
  const failure = new Error('observer unavailable');
  const f = fixture({ autoUpdate: () => { throw failure; } });
  assert.throws(f.start, error => error === failure);
  assert.deepEqual([...f.values], [['left', '7px']]);
  assert.deepEqual([...f.attributes], [['data-side', 'top']]);
});

test('destroy is terminal and preserves styles changed by the consumer', async () => {
  const f = fixture();
  const action = f.start();
  await flush();
  f.values.set('left', '99px');
  action.destroy();
  action.destroy();
  action.update(f.options);
  f.refresh();
  await flush();
  assert.deepEqual([...f.values], [['left', '99px']]);
  assert.deepEqual(f.counts(), { starts: 1, stops: 1, positioned: 1 });
});

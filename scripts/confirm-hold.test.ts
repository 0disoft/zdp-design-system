import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeConfirmHoldDuration, scheduleConfirmHold } from '../src/lib/confirm-hold';

function fixture(duration = 600, signal?: AbortSignal) {
  let time = 0;
  let confirmations = 0;
  const tasks: { callback: () => void; delay: number; cancelled: boolean }[] = [];
  const cancel = scheduleConfirmHold(duration, () => confirmations++, {
    now: () => time,
    schedule: (callback, delay) => {
      const task = { callback, delay, cancelled: false };
      tasks.push(task);
      return () => { task.cancelled = true; };
    },
    ...(signal ? { signal } : {})
  });
  return { tasks, cancel, at(value: number) { time = value; }, count: () => confirmations };
}

test('duration policy preserves minimum, default and timer-safe maximum boundaries', () => {
  for (const [input, expected] of [
    [599, 600], [600, 600], [601, 601], [NaN, 2000], [Infinity, 2000], [-Infinity, 2000],
    [2_147_483_646, 2_147_483_646], [2_147_483_647, 2_147_483_647], [2_147_483_648, 2_147_483_647]
  ]) assert.equal(normalizeConfirmHoldDuration(input!), expected);
});

for (const elapsed of [599, 600, 601]) {
  test(`hold at ${elapsed}ms confirms only at or after the 600ms deadline`, () => {
    const f = fixture();
    f.at(elapsed);
    f.tasks[0]!.callback();
    assert.equal(f.count(), elapsed < 600 ? 0 : 1);
    if (elapsed < 600) {
      assert.equal(f.tasks[1]!.delay, 1);
      f.at(600);
      f.tasks[1]!.callback();
      assert.equal(f.count(), 1);
    }
    f.cancel();
  });
}

test('fractional duration cannot confirm early when a timer truncates the delay', () => {
  const f = fixture(600.5);
  assert.equal(f.tasks[0]!.delay, 601);
  f.at(600);
  f.tasks[0]!.callback();
  assert.equal(f.count(), 0);
  assert.equal(f.tasks[1]!.delay, 1);
  f.at(600.5);
  f.tasks[1]!.callback();
  assert.equal(f.count(), 1);
});

test('repeated and late callbacks after completion or cancellation cannot confirm again', () => {
  const f = fixture();
  f.at(600);
  f.tasks[0]!.callback();
  f.tasks[0]!.callback();
  assert.equal(f.count(), 1);
  const cancelled = fixture();
  cancelled.cancel();
  cancelled.at(1000);
  cancelled.tasks[0]!.callback();
  assert.equal(cancelled.count(), 0);
  assert.ok(cancelled.tasks.every(task => task.cancelled));
});

test('pre-abort schedules nothing; in-flight abort cancels even rearmed work', () => {
  const pre = fixture(600, AbortSignal.abort());
  assert.equal(pre.tasks.length, 0);
  const controller = new AbortController();
  const f = fixture(600, controller.signal);
  f.at(599);
  f.tasks[0]!.callback();
  controller.abort(new Error('stop hold'));
  assert.equal(f.tasks[1]!.cancelled, true);
  f.at(600);
  f.tasks[1]!.callback();
  assert.equal(f.count(), 0);
});

test('abort during clock initialization cannot leave a live timer', () => {
  const controller = new AbortController();
  scheduleConfirmHold(600, () => assert.fail('must not confirm'), {
    signal: controller.signal,
    now: () => { controller.abort(); return 0; },
    schedule: () => assert.fail('must not schedule')
  });
});

test('timer overflow is clamped before scheduling without a real wait', () => {
  const f = fixture(Number.MAX_VALUE);
  assert.equal(f.tasks[0]!.delay, 2_147_483_647);
  f.at(2_147_483_646);
  f.tasks[0]!.callback();
  assert.equal(f.count(), 0);
  f.at(2_147_483_647);
  f.tasks[1]!.callback();
  assert.equal(f.count(), 1);
});

test('failure to rearm an early timer cancels the hold and keeps the exact error', () => {
  const failure = new Error('scheduler stopped');
  let wake = () => {};
  let calls = 0;
  let cancelled = false;
  scheduleConfirmHold(600, () => assert.fail('must not confirm'), {
    now: () => 0,
    schedule: callback => {
      if (++calls > 1) throw failure;
      wake = callback;
      return () => { cancelled = true; };
    }
  });
  assert.throws(wake, error => error === failure);
  assert.equal(cancelled, true);
  assert.doesNotThrow(wake);
});

test('invalid or regressing clocks fail closed and cancel pending work', () => {
  assert.throws(() => scheduleConfirmHold(600, () => assert.fail('must not confirm'), { now: () => NaN }), RangeError);
  for (const time of [-1, NaN, Infinity]) {
    const f = fixture();
    f.at(time);
    assert.throws(() => f.tasks[0]!.callback(), RangeError);
    f.at(600);
    f.tasks[0]!.callback();
    assert.equal(f.count(), 0);
    assert.equal(f.tasks[0]!.cancelled, true);
  }
});

test('scheduler and confirmation exceptions preserve the original error and release abort subscriptions', () => {
  const failure = new Error('provider failed');
  const controller = new AbortController();
  let added = 0;
  let removed = 0;
  const add = controller.signal.addEventListener.bind(controller.signal);
  const remove = controller.signal.removeEventListener.bind(controller.signal);
  controller.signal.addEventListener = (...args: Parameters<AbortSignal['addEventListener']>) => { added++; return add(...args); };
  controller.signal.removeEventListener = (...args: Parameters<AbortSignal['removeEventListener']>) => { removed++; return remove(...args); };
  assert.throws(() => scheduleConfirmHold(600, () => {}, {
    signal: controller.signal, now: () => 0, schedule: () => { throw failure; }
  }), error => error === failure);
  assert.equal(added, removed);
  let time = 0;
  let wake = () => {};
  let cancelled = false;
  scheduleConfirmHold(600, () => { throw failure; }, {
    signal: controller.signal, now: () => time,
    schedule: callback => { wake = callback; return () => { cancelled = true; }; }
  });
  time = 600;
  assert.throws(wake, error => error === failure);
  assert.equal(cancelled, true);
  assert.equal(added, removed);
  assert.doesNotThrow(wake);
});

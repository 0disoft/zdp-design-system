import assert from 'node:assert/strict';
import { test } from 'node:test';
import { reconcileOpenIds } from '../src/lib/accordion-state';
import type { ZdpAccordionItem, ZdpAccordionMode } from '../src/lib/disclosure';

const item = (id: string, open = true, disabled = false): ZdpAccordionItem => Object.freeze({ id, title: id, content: '', open, disabled });

test('preserves retained order, removes unavailable items and appends new defaults once', () => {
  const items = Object.freeze([item('new'), item('b'), item('disabled', true, true), item('a'), item('closed', false), item('new')]);
  const open = Object.freeze(['b', 'removed', 'a', 'b', 'disabled']);
  const previous = Object.freeze(['a', 'b', 'removed', 'disabled']);
  assert.deepEqual(reconcileOpenIds(items, 'multiple', open, previous), ['b', 'a', 'new']);
  assert.deepEqual(open, ['b', 'removed', 'a', 'b', 'disabled']);
  assert.deepEqual(previous, ['a', 'b', 'removed', 'disabled']);
});

test('does not reopen known items that the user closed', () => {
  assert.deepEqual(reconcileOpenIds([item('known'), item('new')], 'multiple', [], ['known']), ['new']);
});

test('single mode prefers the first retained choice, then the first new default', () => {
  const items = [item('new-a'), item('new-b'), item('old')];
  assert.deepEqual(reconcileOpenIds(items, 'single', ['old'], ['old']), ['old']);
  assert.deepEqual(reconcileOpenIds(items, 'single', [], ['old']), ['new-a']);
});

test('empty and fully disabled inputs have no open choices', () => {
  assert.deepEqual(reconcileOpenIds([], 'multiple', ['gone'], ['gone']), []);
  assert.deepEqual(reconcileOpenIds([item('disabled', true, true)], 'single', ['disabled'], []), []);
});

test('matches the previous ordering and duplicate policy across mixed lists and modes', () => {
  function previousImplementation(items: readonly ZdpAccordionItem[], mode: ZdpAccordionMode, open: readonly string[], previous: readonly string[]) {
    const enabled = new Set(items.filter(entry => !entry.disabled).map(entry => entry.id));
    const retained = open.filter(id => enabled.has(id));
    const added = items.filter(entry => entry.open && !entry.disabled && !previous.includes(entry.id)).map(entry => entry.id);
    const result = [...new Set([...retained, ...added])];
    return mode === 'single' ? result.slice(0, 1) : result;
  }
  for (let variant = 0; variant < 100; variant++) {
    const items = Array.from({ length: 30 }, (_, i) => item(`id-${(i * 7 + variant) % 23}`, (i + variant) % 3 !== 0, (i + variant) % 5 === 0));
    const open = Array.from({ length: 25 }, (_, i) => `id-${(i * 3 + variant) % 27}`);
    const previous = Array.from({ length: 20 }, (_, i) => `id-${(i + variant) % 27}`);
    for (const mode of ['single', 'multiple'] as const) {
      assert.deepEqual(reconcileOpenIds(items, mode, open, previous), previousImplementation(items, mode, open, previous));
    }
  }
});

test('a large previous list is indexed once rather than searched once per item', () => {
  const size = 10_000;
  let reads = 0;
  const previous = new Proxy(Array.from({ length: size }, (_, i) => `id-${i}`), {
    get(target, key, receiver) {
      if (typeof key === 'string' && /^\d+$/.test(key)) reads++;
      return Reflect.get(target, key, receiver);
    }
  });
  const items = Array.from({ length: size }, (_, i) => item(`id-${i}`));
  assert.deepEqual(reconcileOpenIds(items, 'multiple', [], previous), []);
  assert.ok(reads <= size * 2, `previous IDs were read ${reads} times for ${size} items`);
});

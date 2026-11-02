import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveComboboxNavigation } from '../src/lib/combobox-navigation';
import type { ZdpComboboxOption } from '../src/lib/combobox';

const option = (id: string, value = id): ZdpComboboxOption => Object.freeze({ id, value, label: id });
const candidates = Object.freeze([option('a'), option('b'), option('c')]);

for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End'] as const) {
  test(`${key} handles empty and single-option lists without changing input`, () => {
    for (const open of [false, true]) {
      assert.equal(resolveComboboxNavigation(key, open, '', Object.freeze([]), null), null);
      assert.equal(resolveComboboxNavigation(key, open, '', Object.freeze([option('only')]), 'absent'), 'only');
    }
  });
}

test('opening arrows prefer the selected value and use directional endpoints when absent', () => {
  for (const key of ['ArrowDown', 'ArrowUp'] as const) {
    assert.equal(resolveComboboxNavigation(key, false, 'b', candidates, null), 'b');
  }
  assert.equal(resolveComboboxNavigation('ArrowDown', false, 'absent', candidates, 'b'), 'a');
  assert.equal(resolveComboboxNavigation('ArrowUp', false, 'absent', candidates, 'b'), 'c');
});

test('open arrows wrap in both directions, retaining the existing missing-active fallback', () => {
  for (const [active, down, up] of [['a', 'b', 'c'], ['b', 'c', 'a'], ['c', 'a', 'b'], [null, 'b', 'c'], ['missing', 'b', 'c']] as const) {
    assert.equal(resolveComboboxNavigation('ArrowDown', true, '', candidates, active), down);
    assert.equal(resolveComboboxNavigation('ArrowUp', true, '', candidates, active), up);
  }
});

test('Home and End retain list order and duplicate matching remains first-match', () => {
  const duplicates = Object.freeze([option('first', 'shared'), option('second', 'shared'), option('first', 'other')]);
  assert.equal(resolveComboboxNavigation('Home', true, '', candidates, 'b'), 'a');
  assert.equal(resolveComboboxNavigation('End', true, '', candidates, 'b'), 'c');
  assert.equal(resolveComboboxNavigation('ArrowDown', false, 'shared', duplicates, null), 'first');
  assert.equal(resolveComboboxNavigation('ArrowDown', true, '', duplicates, 'first'), 'second');
  assert.deepEqual(duplicates.map(item => item.value), ['shared', 'shared', 'other']);
});

test('navigation matches the previous implementation over ordered lists and opening states', () => {
  for (let length = 0; length <= 20; length++) {
    const list = Object.freeze(Array.from({ length }, (_, i) => option(`item-${i}`, `value-${i % 4}`)));
    for (const active of [null, 'missing', 'item-0', `item-${length - 1}`]) {
      for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End'] as const) {
        for (const open of [false, true]) {
          let expected: string | null;
          if (key === 'Home') expected = list[0]?.id ?? null;
          else if (key === 'End') expected = list[list.length - 1]?.id ?? null;
          else if (!open) expected = list.find(item => item.value === 'value-2')?.id ??
            (key === 'ArrowDown' ? list[0]?.id : list[list.length - 1]?.id) ?? null;
          else if (!list.length) expected = null;
          else {
            const index = Math.max(0, list.findIndex(item => item.id === active));
            const next = key === 'ArrowUp' ? (index - 1 + list.length) % list.length : (index + 1) % list.length;
            expected = list[next]?.id ?? active;
          }
          assert.equal(resolveComboboxNavigation(key, open, 'value-2', list, active), expected);
        }
      }
    }
  }
});

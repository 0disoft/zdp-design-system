import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ZDP_SPLIT_PANE_DEFAULTS,
  normalizeZdpSplitPaneBounds,
  resolveZdpSplitPaneLayout
} from '../src/lib/split-pane-layout.js';
import { clampZdpSplitPaneSize, type ZdpSplitPaneControllerOptions } from '../src/lib/split-pane.js';

test('default projection keeps existing geometry and keyboard policy', () => {
  assert.deepEqual(resolveZdpSplitPaneLayout(280, Object.freeze({})), {
    ...ZDP_SPLIT_PANE_DEFAULTS,
    effectiveMaxSize: 480,
    renderedSize: 280,
    constrained: false
  });
  assert.ok(Object.isFrozen(ZDP_SPLIT_PANE_DEFAULTS));
});

for (const [requested, expected] of [
  [219.49, 220], [219.5, 220], [220.49, 220], [220.5, 221],
  [479.49, 479], [479.5, 480], [480.51, 480], [NaN, 280], [Infinity, 280], [-Infinity, 280]
]) {
  test(`requested size ${requested} retains rounding, clamping, and nonfinite fallback`, () => {
    const options = Object.freeze({});
    assert.equal(resolveZdpSplitPaneLayout(requested!, options).renderedSize, expected);
    assert.equal(clampZdpSplitPaneSize(requested!, options), expected);
  });
}

for (const [container, expectedSize, constrained] of [
  [319.999, 220, true], [320, 220, false], [320.999, 220, false], [321, 221, false]
] as const) {
  test(`container ${container}px retains the minimum-plus-secondary threshold`, () => {
    const layout = resolveZdpSplitPaneLayout(400, Object.freeze({ secondaryMinSize: 100 }), container);
    assert.equal(layout.renderedSize, expectedSize);
    assert.equal(layout.effectiveMaxSize, expectedSize);
    assert.equal(layout.constrained, constrained);
  });
}

test('contradictory bounds and zero-size controls preserve existing normalization', () => {
  const options = Object.freeze({ minSize: 500, maxSize: 100, defaultSize: NaN,
    handleSize: 0, keyboardStep: -1, largeKeyboardStep: 0.49 });
  const layout = resolveZdpSplitPaneLayout(NaN, options);
  assert.deepEqual(normalizeZdpSplitPaneBounds(options), { minSize: 500, maxSize: 500, defaultSize: 500 });
  assert.equal(layout.renderedSize, 500);
  assert.equal(layout.handleSize, 1);
  assert.equal(layout.keyboardStep, 1);
  assert.equal(layout.largeKeyboardStep, 1);
});

test('unknown container dimensions keep the same unbounded projection as server rendering', () => {
  const options = Object.freeze({ secondaryMinSize: 100, defaultSize: 300 });
  for (const container of [NaN, Infinity, -Infinity]) {
    const layout = resolveZdpSplitPaneLayout(600, options, container);
    assert.equal(layout.renderedSize, 480);
    assert.equal(layout.effectiveMaxSize, 480);
    assert.equal(layout.constrained, false);
  }
});

test('frozen caller input is reusable and changing a result cannot alter another projection', () => {
  const options: Readonly<ZdpSplitPaneControllerOptions> = Object.freeze({
    minSize: 80, maxSize: 400, defaultSize: 180, secondaryMinSize: 120,
    handleSize: 16, keyboardStep: 4, largeKeyboardStep: 20
  });
  const before = { ...options };
  const first = resolveZdpSplitPaneLayout(300, options, 320);
  assert.equal(first.renderedSize, 200);
  first.minSize = 999;
  first.renderedSize = 999;
  const second = resolveZdpSplitPaneLayout(300, options, 320);
  assert.equal(second.minSize, 80);
  assert.equal(second.renderedSize, 200);
  assert.deepEqual(options, before);
  assert.equal(ZDP_SPLIT_PANE_DEFAULTS.minSize, 220);
});

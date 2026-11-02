import type { ZdpSplitPaneControllerOptions, ZdpSplitPaneSizeBounds } from './split-pane.js';

/** Shared geometry policy for server rendering, persistence, and interaction. */
export const ZDP_SPLIT_PANE_DEFAULTS = Object.freeze({
  defaultSize: 280,
  minSize: 220,
  maxSize: 480,
  secondaryMinSize: 0,
  handleSize: 24,
  keyboardStep: 8,
  largeKeyboardStep: 32
});

export function normalizeZdpSplitPaneSize(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.round(value as number)) : fallback;
}

export function normalizeZdpSplitPaneBounds(bounds: Readonly<ZdpSplitPaneSizeBounds>): Required<ZdpSplitPaneSizeBounds> {
  const minSize = normalizeZdpSplitPaneSize(bounds.minSize, ZDP_SPLIT_PANE_DEFAULTS.minSize);
  const maxSize = Math.max(minSize, normalizeZdpSplitPaneSize(bounds.maxSize, ZDP_SPLIT_PANE_DEFAULTS.maxSize));
  const defaultSize = Math.min(maxSize, Math.max(minSize, normalizeZdpSplitPaneSize(bounds.defaultSize, ZDP_SPLIT_PANE_DEFAULTS.defaultSize)));
  return { defaultSize, minSize, maxSize };
}

/** Pure projection: caller options and controller state are never modified. */
export function resolveZdpSplitPaneLayout(
  requestedSize: number,
  options: Readonly<ZdpSplitPaneControllerOptions>,
  containerSize = Number.POSITIVE_INFINITY
) {
  const bounds = normalizeZdpSplitPaneBounds(options);
  const secondaryMinSize = normalizeZdpSplitPaneSize(options.secondaryMinSize, ZDP_SPLIT_PANE_DEFAULTS.secondaryMinSize);
  const containerMaximum = Number.isFinite(containerSize)
    ? Math.max(bounds.minSize, Math.floor(containerSize - secondaryMinSize))
    : bounds.maxSize;
  const effectiveMaxSize = Math.min(bounds.maxSize, containerMaximum);
  const candidate = Number.isFinite(requestedSize) ? Math.round(requestedSize) : bounds.defaultSize;
  return {
    ...bounds,
    effectiveMaxSize,
    secondaryMinSize,
    handleSize: Math.max(1, normalizeZdpSplitPaneSize(options.handleSize, ZDP_SPLIT_PANE_DEFAULTS.handleSize)),
    keyboardStep: Math.max(1, normalizeZdpSplitPaneSize(options.keyboardStep, ZDP_SPLIT_PANE_DEFAULTS.keyboardStep)),
    largeKeyboardStep: Math.max(1, normalizeZdpSplitPaneSize(options.largeKeyboardStep, ZDP_SPLIT_PANE_DEFAULTS.largeKeyboardStep)),
    constrained: Number.isFinite(containerSize) && containerSize < bounds.minSize + secondaryMinSize,
    renderedSize: Math.min(effectiveMaxSize, Math.max(bounds.minSize, candidate))
  };
}

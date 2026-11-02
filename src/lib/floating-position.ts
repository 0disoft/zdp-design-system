import { autoUpdate, computePosition, flip, offset, shift, size, type Placement } from '@floating-ui/dom';
import { getZdpFloatingBoundaries } from './floating-boundary.js';

interface FloatingOptions {
  anchor: HTMLElement | null;
  gapSource: HTMLElement | null;
  placement?: Placement;
  prefix: 'combobox' | 'tooltip' | 'popover' | 'menu';
  matchAnchorWidth?: boolean;
  onPosition?: () => void;
}

interface FloatingEnvironment {
  computePosition: typeof computePosition;
  autoUpdate: typeof autoUpdate;
  getGap: (source: HTMLElement) => number;
  getBoundaries: typeof getZdpFloatingBoundaries;
  signal?: AbortSignal;
}

/** Positions inline overlays; interaction and focus remain owned by each component. */
export function positionZdpFloatingPanel(
  panel: HTMLElement,
  initial: FloatingOptions,
  environment: Partial<FloatingEnvironment> = {}
) {
  const {
    computePosition: compute = computePosition,
    autoUpdate: observe = autoUpdate,
    getGap = source => Number.parseFloat(source.ownerDocument.defaultView?.getComputedStyle(source).columnGap ?? ''),
    getBoundaries = getZdpFloatingBoundaries,
    signal
  } = environment;
  let cleanup = () => {};
  let destroyed = false;
  const nonnegative = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0;

  function start(options: FloatingOptions): void {
    cleanup();
    const { anchor, gapSource, prefix } = options;
    if (destroyed || signal?.aborted || !anchor || !gapSource) return;
    let disposed = false;
    let revision = 0;
    let stop = () => {};
    const original = new Map<string, string>();
    const applied = new Map<string, string>();
    const previousSide = panel.getAttribute('data-side');
    const previousAlign = panel.getAttribute('data-align');
    const previousPositioned = panel.getAttribute('data-zdp-positioned');
    function style(name: string, value: string): void {
      if (!original.has(name)) original.set(name, panel.style.getPropertyValue(name));
      if (panel.style.getPropertyValue(name) !== value) panel.style.setProperty(name, value);
      applied.set(name, panel.style.getPropertyValue(name));
    }
    style('position', 'fixed');
    style('right', 'auto');
    style('bottom', 'auto');
    style('left', '0px');
    style('top', '0px');
    style('transform', 'none');
    panel.setAttribute('data-zdp-positioned', '');

    // Install teardown before observation: it may start a calculation immediately.
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      signal?.removeEventListener('abort', dispose);
      stop();
      for (const [name, value] of original) {
        if (panel.style.getPropertyValue(name) !== applied.get(name)) continue;
        if (value) panel.style.setProperty(name, value); else panel.style.removeProperty(name);
      }
      if (previousSide === null) panel.removeAttribute('data-side'); else panel.setAttribute('data-side', previousSide);
      if (previousAlign === null) panel.removeAttribute('data-align'); else panel.setAttribute('data-align', previousAlign);
      if (previousPositioned === null) panel.removeAttribute('data-zdp-positioned');
      else panel.setAttribute('data-zdp-positioned', previousPositioned);
    };
    cleanup = dispose;
    signal?.addEventListener('abort', dispose, { once: true });

    const update = async () => {
      if (disposed || !panel.isConnected) return;
      const current = ++revision;
      const valid = () => !disposed && current === revision && panel.isConnected;
      let result: Awaited<ReturnType<typeof computePosition>>;
      try {
        const gap = nonnegative(getGap(gapSource));
        const overflow = { boundary: getBoundaries(anchor), padding: gap };
        result = await compute(anchor, panel, {
          placement: options.placement ?? 'bottom-start',
          strategy: 'fixed',
          middleware: [
            offset(gap),
            flip(overflow),
            shift(overflow),
            size({ ...overflow, apply({ availableWidth, availableHeight, rects }) {
              if (!valid()) return;
              style(`--zdp-${prefix}-available-width`, `${nonnegative(availableWidth)}px`);
              style(`--zdp-${prefix}-available-height`, `${nonnegative(availableHeight)}px`);
              style(`--zdp-${prefix}-anchor-width`, `${nonnegative(rects.reference.width)}px`);
              if (options.matchAnchorWidth) {
                style(`--zdp-${prefix}-panel-width`, `${Math.min(nonnegative(rects.reference.width), nonnegative(availableWidth))}px`);
              }
            } })
          ]
        });
      } catch {
        // Restore the CSS fallback instead of leaving a failed panel at (0, 0).
        // An obsolete rejection must never dispose a newer calculation.
        if (valid()) dispose();
        return;
      }
      if (!valid()) return;
      if (!Number.isFinite(result.x) || !Number.isFinite(result.y)) {
        dispose();
        return;
      }
      style('left', `${result.x}px`);
      style('top', `${result.y}px`);
      panel.dataset.side = result.placement.split('-')[0];
      panel.dataset.align = result.placement.split('-')[1] ?? 'center';
      options.onPosition?.();
    };
    try {
      const stopObserving = observe(anchor, panel, () => { void update(); });
      // Cancellation can happen synchronously while observation starts.
      if (disposed) stopObserving(); else stop = stopObserving;
    } catch (error) {
      dispose();
      throw error;
    }
  }

  start(initial);
  return { update: start, destroy: () => { destroyed = true; cleanup(); } };
}

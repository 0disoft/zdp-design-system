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

/** Positions inline overlays; interaction and focus remain owned by each component. */
export function positionZdpFloatingPanel(panel: HTMLElement, initial: FloatingOptions) {
  let cleanup = () => {};

  function start(options: FloatingOptions): void {
    cleanup();
    const { anchor, gapSource, prefix } = options;
    if (!anchor || !gapSource) return;
    let disposed = false;
    let revision = 0;
    const view = anchor.ownerDocument.defaultView;
    const original = new Map<string, string>();
    const applied = new Map<string, string>();
    const previousSide = panel.getAttribute('data-side');
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

    const update = async () => {
      const current = ++revision;
      const gap = Number.parseFloat(view?.getComputedStyle(gapSource).columnGap ?? '') || 0;
      const overflow = { boundary: getZdpFloatingBoundaries(anchor), padding: gap };
      const valid = () => !disposed && current === revision && panel.isConnected;
      const result = await computePosition(anchor, panel, {
        placement: options.placement ?? 'bottom-start',
        strategy: 'fixed',
        middleware: [
          offset(gap),
          flip(overflow),
          shift(overflow),
          size({ ...overflow, apply({ availableWidth, availableHeight, rects }) {
            if (!valid()) return;
            style(`--zdp-${prefix}-available-width`, `${Math.max(0, availableWidth)}px`);
            style(`--zdp-${prefix}-available-height`, `${Math.max(0, availableHeight)}px`);
            style(`--zdp-${prefix}-anchor-width`, `${rects.reference.width}px`);
            if (options.matchAnchorWidth) {
              style(`--zdp-${prefix}-panel-width`, `${Math.max(0, Math.min(rects.reference.width, availableWidth))}px`);
            }
          } })
        ]
      });
      if (!valid()) return;
      style('left', `${result.x}px`);
      style('top', `${result.y}px`);
      panel.dataset.side = result.placement.split('-')[0];
      options.onPosition?.();
    };
    const stop = autoUpdate(anchor, panel, () => { void update(); });
    cleanup = () => {
      disposed = true;
      stop();
      for (const [name, value] of original) {
        if (panel.style.getPropertyValue(name) !== applied.get(name)) continue;
        if (value) panel.style.setProperty(name, value); else panel.style.removeProperty(name);
      }
      if (previousSide === null) panel.removeAttribute('data-side'); else panel.setAttribute('data-side', previousSide);
      if (previousPositioned === null) panel.removeAttribute('data-zdp-positioned');
      else panel.setAttribute('data-zdp-positioned', previousPositioned);
    };
  }

  start(initial);
  return { update: start, destroy: () => cleanup() };
}

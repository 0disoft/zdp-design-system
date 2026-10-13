import { autoUpdate, computePosition, flip, offset, shift, size } from '@floating-ui/dom';

interface FloatingOptions {
  anchor: HTMLElement | null;
  gapSource: HTMLElement | null;
  onPosition: () => void;
}

/** Internal positioning only; selection, focus and dismissal stay in Combobox. */
export function positionZdpComboboxPanel(panel: HTMLElement, initial: FloatingOptions) {
  let cleanup = () => {};
  function start({ anchor, gapSource, onPosition }: FloatingOptions) {
    cleanup();
    if (!anchor || !gapSource) return;
    let disposed = false;
    let revision = 0;
    const view = anchor.ownerDocument.defaultView;
    const update = async () => {
      const current = ++revision;
      const gap = Number.parseFloat(view?.getComputedStyle(gapSource).columnGap ?? '') || 0;
      const result = await computePosition(anchor, panel, {
        placement: 'bottom-start',
        strategy: 'fixed',
        middleware: [
          offset(gap),
          flip({ padding: gap }),
          shift({ padding: gap }),
          size({ padding: gap, apply({ availableWidth, availableHeight, rects }) {
            if (disposed || current !== revision) return;
            panel.style.setProperty('--zdp-combobox-panel-width', `${Math.max(0, Math.min(rects.reference.width, availableWidth))}px`);
            panel.style.setProperty('--zdp-combobox-available-height', `${Math.max(0, availableHeight)}px`);
          } })
        ]
      });
      if (disposed || current !== revision || !panel.isConnected) return;
      panel.style.left = `${result.x}px`;
      panel.style.top = `${result.y}px`;
      panel.style.transform = 'none';
      panel.dataset.side = result.placement.split('-')[0];
      panel.dataset.zdpPositioned = '';
      onPosition();
    };
    const stop = autoUpdate(anchor, panel, () => { void update(); });
    cleanup = () => { disposed = true; stop(); };
  }
  start(initial);
  return { update: start, destroy: () => cleanup() };
}

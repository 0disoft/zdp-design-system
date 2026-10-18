import { tick } from 'svelte';
import { createZdpFocusableCache, getZdpActiveElement } from './focusable.js';
import type { ZdpModalLayerHandle } from './modal-layer.js';

interface ModalFocusOptions {
  getOpen(): boolean;
  getPanel(): HTMLElement | null;
  getLayer(): HTMLElement | null;
  modalLayer: ZdpModalLayerHandle;
}

/** Owns pending focus transitions and Tab containment for each modal instance. */
export function createZdpModalFocus(options: ModalFocusOptions) {
  const cache = createZdpFocusableCache(options.getPanel);
  let knownOpen = false;
  let transition = 0;
  let destroyed = false;

  async function focusOpenedPanel(currentTransition: number): Promise<void> {
    const ownerDocument = options.getLayer()?.ownerDocument ?? (
      typeof document === 'undefined' ? null : document
    );
    if (ownerDocument === null) return;

    options.modalLayer.setFocusReturnTarget(getZdpActiveElement(ownerDocument));
    await tick();

    // A close, reopen, or unmount invalidates the pending focus operation.
    if (destroyed || currentTransition !== transition || !options.getOpen()) return;
    const panel = options.getPanel();
    if (panel?.isConnected) (cache.get()[0] ?? panel).focus();
  }

  function sync(): void {
    const open = options.getOpen();
    if (destroyed || open === knownOpen) return;
    knownOpen = open;
    const currentTransition = ++transition;
    if (open) {
      void focusOpenedPanel(currentTransition);
    } else {
      const target = options.modalLayer.takeFocusReturnTarget();
      if (target?.isConnected) target.focus();
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || event.defaultPrevented || !options.getOpen()) return;
    const panel = options.getPanel();
    if (panel === null) return;
    const elements = cache.get();
    const first = elements.at(0);
    const last = elements.at(-1);
    if (first === undefined || last === undefined) {
      event.preventDefault();
      panel.focus();
      return;
    }
    const active = getZdpActiveElement(panel.ownerDocument);
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function destroy(): void {
    destroyed = true;
    transition += 1;
    cache.destroy();
  }

  return { sync, handleKeydown, destroy };
}

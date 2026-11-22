import { tick } from 'svelte';
import { createZdpDismissLayer } from './dismiss-layer.js';
import { collectZdpTabbableElements, getZdpActiveElement } from './focusable.js';
import { createZdpModalLayer, type ZdpModalLayerHandle } from './modal-layer.js';

interface ModalFocusOptions {
  getOpen(): boolean;
  getPanel(): HTMLElement | null;
  getLayer(): HTMLElement | null;
  modalLayer: ZdpModalLayerHandle;
}

/** Owns pending focus transitions and Tab containment for each modal instance. */
export function createZdpModalFocus(options: ModalFocusOptions) {
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
    if (panel?.isConnected) (collectZdpTabbableElements(panel)[0] ?? panel).focus();
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
    const elements = collectZdpTabbableElements(panel);
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
  }

  return { sync, handleKeydown, destroy };
}

interface ModalLifecycleOptions extends Omit<ModalFocusOptions, 'modalLayer'> {
  getCloseOnEscape(): boolean;
  getCloseOnBackdrop(): boolean;
  requestClose(): void;
}

export function createZdpModalLifecycle(options: ModalLifecycleOptions) {
  const modalLayer = createZdpModalLayer();
  const dismissLayer = createZdpDismissLayer();
  const focus = createZdpModalFocus({ ...options, modalLayer });

  function syncLayers(): void {
    modalLayer.setActive(options.getOpen(), options.getLayer());
    dismissLayer.setActive(options.getOpen(), options.getLayer(), {
      closeOnEscape: options.getCloseOnEscape(),
      closeOnOutside: false,
      onEscape: options.requestClose
    });
  }

  function handleBackdropClick(): void {
    if (options.getCloseOnBackdrop()) options.requestClose();
  }

  function handleBackdropPointerDown(event: PointerEvent): void {
    event.preventDefault();
  }

  function destroy(): void {
    focus.destroy();
    modalLayer.destroy();
    dismissLayer.destroy();
  }

  return {
    syncLayers,
    syncFocus: focus.sync,
    handleKeydown: focus.handleKeydown,
    handleBackdropClick,
    handleBackdropPointerDown,
    destroy
  };
}

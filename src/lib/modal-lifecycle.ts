import { createZdpDismissLayer } from './dismiss-layer.js';
import { createZdpModalFocus } from './modal-focus.js';
import { createZdpModalLayer } from './modal-layer.js';

interface ModalLifecycleOptions {
  getOpen(): boolean;
  getPanel(): HTMLElement | null;
  getLayer(): HTMLElement | null;
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

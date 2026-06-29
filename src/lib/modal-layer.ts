export const zdpModalLayerRootAttribute = 'data-zdp-modal-layer-root';
export const zdpModalLayerActiveAttribute = 'data-zdp-modal-layer-active';
export const zdpModalLayerLevelAttribute = 'data-zdp-modal-layer-level';

export interface ZdpModalLayerHandle {
  setActive(active: boolean, root?: HTMLElement | null): void;
  destroy(): void;
}

let nextLayerId = 1;
const activeLayerIds: number[] = [];
let previousBodyOverflow: string | null = null;

/**
 * mf:anchor zdp.design-system.modal-layer-state
 * purpose: Locate shared modal layer state for dialog, sheet, and term sheet surfaces.
 * search: modal layer, scroll lock, active layer, dialog, sheet, focus trap
 * invariant: Layer activation restores document overflow after the final active layer closes.
 * risk: state
 */
export function createZdpModalLayer(): ZdpModalLayerHandle {
  const layerId = nextLayerId;
  nextLayerId += 1;

  let active = false;
  let currentRoot: HTMLElement | null = null;

  function setActive(nextActive: boolean, root: HTMLElement | null = currentRoot): void {
    if (root !== currentRoot) {
      clearRootAttributes();
      currentRoot = root;
    }

    if (nextActive && !active) {
      active = true;
      activeLayerIds.push(layerId);
    } else if (!nextActive && active) {
      active = false;
      removeActiveLayer(layerId);
    }

    syncRootAttributes();
    syncDocumentState();
  }

  function destroy(): void {
    if (active) {
      active = false;
      removeActiveLayer(layerId);
    }

    clearRootAttributes();
    syncDocumentState();
  }

  function syncRootAttributes(): void {
    if (currentRoot === null) {
      return;
    }

    currentRoot.setAttribute(zdpModalLayerRootAttribute, '');

    if (!active) {
      currentRoot.removeAttribute(zdpModalLayerActiveAttribute);
      currentRoot.removeAttribute(zdpModalLayerLevelAttribute);
      return;
    }

    currentRoot.setAttribute(zdpModalLayerActiveAttribute, 'true');
    currentRoot.setAttribute(zdpModalLayerLevelAttribute, String(activeLayerIds.indexOf(layerId) + 1));
  }

  function clearRootAttributes(): void {
    currentRoot?.removeAttribute(zdpModalLayerRootAttribute);
    currentRoot?.removeAttribute(zdpModalLayerActiveAttribute);
    currentRoot?.removeAttribute(zdpModalLayerLevelAttribute);
  }

  return { destroy, setActive };
}

function removeActiveLayer(layerId: number): void {
  const index = activeLayerIds.lastIndexOf(layerId);

  if (index >= 0) {
    activeLayerIds.splice(index, 1);
  }
}

function syncDocumentState(): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const body = document.body;

  if (activeLayerIds.length > 0) {
    root.setAttribute('data-zdp-modal-layer-count', String(activeLayerIds.length));

    if (previousBodyOverflow === null) {
      previousBodyOverflow = body.style.overflow;
      body.style.overflow = 'hidden';
    }

    return;
  }

  root.removeAttribute('data-zdp-modal-layer-count');

  if (previousBodyOverflow !== null) {
    body.style.overflow = previousBodyOverflow;
    previousBodyOverflow = null;
  }
}

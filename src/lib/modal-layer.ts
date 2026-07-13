export const zdpModalLayerRootAttribute = 'data-zdp-modal-layer-root';
export const zdpModalLayerActiveAttribute = 'data-zdp-modal-layer-active';
export const zdpModalLayerLevelAttribute = 'data-zdp-modal-layer-level';
const zdpModalLayerOffsetProperty = '--zdp-modal-layer-offset';

export interface ZdpModalLayerHandle {
  setActive(active: boolean, root?: HTMLElement | null): void;
  setFocusReturnTarget(target: HTMLElement | null): void;
  takeFocusReturnTarget(): HTMLElement | null;
  destroy(): void;
}

interface ZdpModalLayerState {
  active: boolean;
  focusReturnTarget: HTMLElement | null;
  id: number;
  restoreFocusAfterDeactivate: boolean;
  root: HTMLElement | null;
}

let nextLayerId = 1;
const layers = new Set<ZdpModalLayerState>();
const activeLayerIds: number[] = [];
const managedInertElements = new Map<HTMLElement, boolean>();
let previousBodyOverflow: string | null = null;

/**
 * mf:anchor zdp.design-system.modal-layer-state
 * purpose: Locate shared modal layer state for dialog, sheet, and term sheet surfaces.
 * search: modal layer, scroll lock, active layer, dialog, sheet, focus trap
 * invariant: Layer activation restores document overflow and pre-existing inert state after the final active layer closes.
 * risk: state
 */
export function createZdpModalLayer(): ZdpModalLayerHandle {
  const state: ZdpModalLayerState = {
    active: false,
    focusReturnTarget: null,
    id: nextLayerId,
    restoreFocusAfterDeactivate: false,
    root: null
  };
  nextLayerId += 1;
  layers.add(state);

  function setActive(nextActive: boolean, root: HTMLElement | null = state.root): void {
    if (root !== state.root) {
      clearRootAttributes(state.root);
      state.root = root;
    }

    if (nextActive && !state.active) {
      state.active = true;
      state.restoreFocusAfterDeactivate = false;
      activeLayerIds.push(state.id);
    } else if (!nextActive && state.active) {
      state.restoreFocusAfterDeactivate = activeLayerIds.at(-1) === state.id;
      preserveFocusReturnForHigherLayers(state);
      state.active = false;
      removeActiveLayer(state.id);
    }

    syncAllRootAttributes();
    syncDocumentIsolation();
    syncDocumentState();
  }

  function setFocusReturnTarget(target: HTMLElement | null): void {
    state.focusReturnTarget = target;
  }

  function takeFocusReturnTarget(): HTMLElement | null {
    const target = state.restoreFocusAfterDeactivate ? state.focusReturnTarget : null;
    state.restoreFocusAfterDeactivate = false;
    state.focusReturnTarget = null;
    return target;
  }

  function destroy(): void {
    if (state.active) {
      preserveFocusReturnForHigherLayers(state);
      state.active = false;
      removeActiveLayer(state.id);
    }

    clearRootAttributes(state.root);
    layers.delete(state);
    syncAllRootAttributes();
    syncDocumentIsolation();
    syncDocumentState();
  }

  return { destroy, setActive, setFocusReturnTarget, takeFocusReturnTarget };
}

function preserveFocusReturnForHigherLayers(closingLayer: ZdpModalLayerState): void {
  const closingIndex = activeLayerIds.indexOf(closingLayer.id);

  if (closingIndex < 0 || closingLayer.root === null) {
    return;
  }

  for (const layer of layers) {
    const layerIndex = activeLayerIds.indexOf(layer.id);

    if (
      layerIndex > closingIndex &&
      layer.focusReturnTarget !== null &&
      closingLayer.root.contains(layer.focusReturnTarget)
    ) {
      layer.focusReturnTarget = closingLayer.focusReturnTarget;
    }
  }
}

function syncAllRootAttributes(): void {
  for (const layer of layers) {
    syncRootAttributes(layer);
  }
}

function syncRootAttributes(layer: ZdpModalLayerState): void {
  if (layer.root === null) {
    return;
  }

  layer.root.setAttribute(zdpModalLayerRootAttribute, '');

  if (!layer.active) {
    layer.root.removeAttribute(zdpModalLayerActiveAttribute);
    layer.root.removeAttribute(zdpModalLayerLevelAttribute);
    layer.root.style.removeProperty(zdpModalLayerOffsetProperty);
    return;
  }

  const level = activeLayerIds.indexOf(layer.id) + 1;
  layer.root.setAttribute(zdpModalLayerActiveAttribute, 'true');
  layer.root.setAttribute(zdpModalLayerLevelAttribute, String(level));
  layer.root.style.setProperty(zdpModalLayerOffsetProperty, String(level * 2));
}

function clearRootAttributes(root: HTMLElement | null): void {
  root?.removeAttribute(zdpModalLayerRootAttribute);
  root?.removeAttribute(zdpModalLayerActiveAttribute);
  root?.removeAttribute(zdpModalLayerLevelAttribute);
  root?.style.removeProperty(zdpModalLayerOffsetProperty);
}

function removeActiveLayer(layerId: number): void {
  const index = activeLayerIds.lastIndexOf(layerId);

  if (index >= 0) {
    activeLayerIds.splice(index, 1);
  }
}

function syncDocumentIsolation(): void {
  if (typeof document === 'undefined') {
    return;
  }

  restoreManagedInertElements();

  const topLayerId = activeLayerIds.at(-1);
  const topLayer = Array.from(layers).find((layer) => layer.id === topLayerId);
  let activeBranch = topLayer?.root ?? null;

  while (activeBranch !== null && activeBranch !== document.body) {
    const parent = activeBranch.parentElement;

    if (parent === null) {
      return;
    }

    for (const sibling of parent.children) {
      if (sibling === activeBranch || !(sibling instanceof HTMLElement)) {
        continue;
      }

      managedInertElements.set(sibling, sibling.hasAttribute('inert'));
      sibling.setAttribute('inert', '');
    }

    activeBranch = parent;
  }
}

function restoreManagedInertElements(): void {
  for (const [element, wasInert] of managedInertElements) {
    if (wasInert) {
      element.setAttribute('inert', '');
    } else {
      element.removeAttribute('inert');
    }
  }

  managedInertElements.clear();
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

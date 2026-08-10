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
  documentState: ZdpModalLayerDocumentState | null;
  focusReturnTarget: HTMLElement | null;
  id: number;
  restoreFocusAfterDeactivate: boolean;
  root: HTMLElement | null;
}

interface ZdpModalLayerDocumentState {
  activeLayerIds: number[];
  document: Document;
  layers: Set<ZdpModalLayerState>;
  managedBodyOverflow: ManagedInlineStyle | null;
  managedBodyPaddingInlineEnd: ManagedInlineStyle | null;
  managedInertElements: Set<HTMLElement>;
}

interface ManagedInlineStyle {
  appliedPriority: string;
  appliedValue: string;
  element: HTMLElement;
  previousPriority: string;
  previousValue: string;
  property: string;
}

let nextLayerId = 1;
const documentStates = new WeakMap<Document, ZdpModalLayerDocumentState>();

const serverModalLayerHandle: ZdpModalLayerHandle = {
  destroy(): void {},
  setActive(): void {},
  setFocusReturnTarget(): void {},
  takeFocusReturnTarget(): HTMLElement | null {
    return null;
  }
};

/**
 * mf:anchor zdp.design-system.modal-layer-state
 * purpose: Locate shared modal layer state for dialog, sheet, and term sheet surfaces.
 * search: modal layer, scroll lock, active layer, dialog, sheet, focus trap
 * invariant: Layer activation restores only the document styles and inert attributes that ZDP still owns after the final active layer closes.
 * risk: state
 */
export function createZdpModalLayer(): ZdpModalLayerHandle {
  if (typeof document === 'undefined') {
    return serverModalLayerHandle;
  }

  const state: ZdpModalLayerState = {
    active: false,
    documentState: null,
    focusReturnTarget: null,
    id: nextLayerId,
    restoreFocusAfterDeactivate: false,
    root: null
  };
  nextLayerId += 1;

  function setActive(nextActive: boolean, root: HTMLElement | null = state.root): void {
    if (root !== state.root) {
      bindLayerRoot(state, root);
    }

    const documentState = state.documentState;
    if (documentState === null || (nextActive && state.root === null)) {
      return;
    }

    if (nextActive && !state.active) {
      state.active = true;
      state.restoreFocusAfterDeactivate = false;
      documentState.activeLayerIds.push(state.id);
    } else if (!nextActive && state.active) {
      state.restoreFocusAfterDeactivate = documentState.activeLayerIds.at(-1) === state.id;
      preserveFocusReturnForHigherLayers(state);
      state.active = false;
      removeActiveLayer(documentState, state.id);
    }

    syncDocument(documentState);
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
    const documentState = state.documentState;
    const focusReturnTarget = state.active && documentState?.activeLayerIds.at(-1) === state.id
      ? state.focusReturnTarget
      : null;

    if (state.active && documentState !== null) {
      preserveFocusReturnForHigherLayers(state);
      state.active = false;
      removeActiveLayer(documentState, state.id);
    }

    state.focusReturnTarget = null;
    clearRootAttributes(state.root);
    state.root = null;
    state.documentState = null;
    if (documentState !== null) {
      documentState.layers.delete(state);
      syncDocument(documentState);
    }
    restoreFocusAfterDestroy(focusReturnTarget);
  }

  return { destroy, setActive, setFocusReturnTarget, takeFocusReturnTarget };
}

function getDocumentState(document: Document): ZdpModalLayerDocumentState {
  const existingState = documentStates.get(document);

  if (existingState !== undefined) {
    return existingState;
  }

  const state: ZdpModalLayerDocumentState = {
    activeLayerIds: [],
    document,
    layers: new Set(),
    managedBodyOverflow: null,
    managedBodyPaddingInlineEnd: null,
    managedInertElements: new Set()
  };
  documentStates.set(document, state);
  return state;
}

function bindLayerRoot(state: ZdpModalLayerState, root: HTMLElement | null): void {
  const previousDocumentState = state.documentState;
  const nextDocumentState = root === null ? previousDocumentState : getDocumentState(root.ownerDocument);

  clearRootAttributes(state.root);

  if (nextDocumentState !== previousDocumentState) {
    const wasActive = state.active;

    if (previousDocumentState !== null) {
      removeActiveLayer(previousDocumentState, state.id);
      previousDocumentState.layers.delete(state);
      state.active = false;
      syncDocument(previousDocumentState);
    }

    state.documentState = nextDocumentState;
    nextDocumentState?.layers.add(state);

    if (wasActive && nextDocumentState !== null && root !== null) {
      state.active = true;
      nextDocumentState.activeLayerIds.push(state.id);
    }
  } else if (nextDocumentState !== null) {
    nextDocumentState.layers.add(state);
  }

  state.root = root;
}

function syncDocument(state: ZdpModalLayerDocumentState): void {
  syncAllRootAttributes(state);
  syncDocumentIsolation(state);
  syncDocumentState(state);
}

function restoreFocusAfterDestroy(target: HTMLElement | null): void {
  if (target?.isConnected) {
    target.focus();
  }
}

function preserveFocusReturnForHigherLayers(closingLayer: ZdpModalLayerState): void {
  const documentState = closingLayer.documentState;

  if (documentState === null) {
    return;
  }

  const closingIndex = documentState.activeLayerIds.indexOf(closingLayer.id);

  if (closingIndex < 0 || closingLayer.root === null) {
    return;
  }

  for (const layer of documentState.layers) {
    const layerIndex = documentState.activeLayerIds.indexOf(layer.id);

    if (
      layerIndex > closingIndex &&
      layer.focusReturnTarget !== null &&
      closingLayer.root.contains(layer.focusReturnTarget)
    ) {
      layer.focusReturnTarget = closingLayer.focusReturnTarget;
    }
  }
}

function syncAllRootAttributes(state: ZdpModalLayerDocumentState): void {
  for (const layer of state.layers) {
    syncRootAttributes(state, layer);
  }
}

function syncRootAttributes(state: ZdpModalLayerDocumentState, layer: ZdpModalLayerState): void {
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

  const level = state.activeLayerIds.indexOf(layer.id) + 1;
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

function removeActiveLayer(state: ZdpModalLayerDocumentState, layerId: number): void {
  const index = state.activeLayerIds.lastIndexOf(layerId);

  if (index >= 0) {
    state.activeLayerIds.splice(index, 1);
  }
}

function syncDocumentIsolation(state: ZdpModalLayerDocumentState): void {
  const { document } = state;
  const topLayerId = state.activeLayerIds.at(-1);
  const topLayer = Array.from(state.layers).find((layer) => layer.id === topLayerId);
  let activeBranch = topLayer?.root ?? null;
  const nextInertElements = new Set<HTMLElement>();

  while (activeBranch !== null && activeBranch !== document.body) {
    const parentNode = activeBranch.parentNode;
    const parent = isDocumentHTMLElement(document, parentNode) || isDocumentShadowRoot(document, parentNode)
      ? parentNode
      : null;

    if (parent === null) {
      return;
    }

    for (const sibling of parent.children) {
      if (sibling === activeBranch || !isDocumentHTMLElement(document, sibling)) {
        continue;
      }

      nextInertElements.add(sibling);
    }

    activeBranch = isDocumentShadowRoot(document, parent)
      ? isDocumentHTMLElement(document, parent.host)
        ? parent.host
        : null
      : parent;
  }

  for (const element of state.managedInertElements) {
    if (nextInertElements.has(element)) {
      continue;
    }

    if (element.hasAttribute('inert')) {
      element.removeAttribute('inert');
    }
    state.managedInertElements.delete(element);
  }

  for (const element of nextInertElements) {
    if (element.hasAttribute('inert') || state.managedInertElements.has(element)) {
      continue;
    }

    element.setAttribute('inert', '');
    state.managedInertElements.add(element);
  }
}

function restoreManagedInertElements(state: ZdpModalLayerDocumentState): void {
  for (const element of state.managedInertElements) {
    if (element.hasAttribute('inert')) {
      element.removeAttribute('inert');
    }
  }

  state.managedInertElements.clear();
}

function syncDocumentState(state: ZdpModalLayerDocumentState): void {
  const { document } = state;
  const root = document.documentElement;
  const body = document.body;

  if (state.activeLayerIds.length > 0) {
    root.setAttribute('data-zdp-modal-layer-count', String(state.activeLayerIds.length));

    if (state.managedBodyOverflow === null) {
      state.managedBodyOverflow = applyInlineStyle(body, 'overflow', 'hidden');

      const view = document.defaultView;
      const scrollbarWidth = Math.max(0, (view?.innerWidth ?? root.clientWidth) - root.clientWidth);
      if (scrollbarWidth > 0) {
        const currentPadding = Number.parseFloat(view?.getComputedStyle(body).paddingInlineEnd ?? '') || 0;
        state.managedBodyPaddingInlineEnd = applyInlineStyle(
          body,
          'padding-inline-end',
          `${currentPadding + scrollbarWidth}px`
        );
      }
    }

    return;
  }

  root.removeAttribute('data-zdp-modal-layer-count');

  restoreManagedInertElements(state);
  restoreInlineStyle(state.managedBodyPaddingInlineEnd);
  restoreInlineStyle(state.managedBodyOverflow);
  state.managedBodyPaddingInlineEnd = null;
  state.managedBodyOverflow = null;
}

function isDocumentHTMLElement(document: Document, value: unknown): value is HTMLElement {
  const HTMLElementConstructor = document.defaultView?.HTMLElement;
  return HTMLElementConstructor !== undefined && value instanceof HTMLElementConstructor;
}

function isDocumentShadowRoot(document: Document, value: unknown): value is ShadowRoot {
  const ShadowRootConstructor = document.defaultView?.ShadowRoot;
  return ShadowRootConstructor !== undefined && value instanceof ShadowRootConstructor;
}

function applyInlineStyle(element: HTMLElement, property: string, value: string): ManagedInlineStyle {
  const previousValue = element.style.getPropertyValue(property);
  const previousPriority = element.style.getPropertyPriority(property);
  element.style.setProperty(property, value);

  return {
    appliedPriority: element.style.getPropertyPriority(property),
    appliedValue: element.style.getPropertyValue(property),
    element,
    previousPriority,
    previousValue,
    property
  };
}

function restoreInlineStyle(managedStyle: ManagedInlineStyle | null): void {
  if (
    managedStyle === null ||
    managedStyle.element.style.getPropertyValue(managedStyle.property) !== managedStyle.appliedValue ||
    managedStyle.element.style.getPropertyPriority(managedStyle.property) !== managedStyle.appliedPriority
  ) {
    return;
  }

  if (managedStyle.previousValue === '') {
    managedStyle.element.style.removeProperty(managedStyle.property);
    return;
  }

  managedStyle.element.style.setProperty(
    managedStyle.property,
    managedStyle.previousValue,
    managedStyle.previousPriority
  );
}

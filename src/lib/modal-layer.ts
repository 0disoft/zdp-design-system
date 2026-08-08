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

interface ManagedInlineStyle {
  appliedPriority: string;
  appliedValue: string;
  element: HTMLElement;
  previousPriority: string;
  previousValue: string;
  property: string;
}

let nextLayerId = 1;
const layers = new Set<ZdpModalLayerState>();
const activeLayerIds: number[] = [];
const managedInertElements = new Set<HTMLElement>();
let previousBodyOverflow: string | null = null;
let managedBodyOverflow: ManagedInlineStyle | null = null;
let managedBodyPaddingInlineEnd: ManagedInlineStyle | null = null;

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
    const focusReturnTarget = state.active && activeLayerIds.at(-1) === state.id
      ? state.focusReturnTarget
      : null;

    if (state.active) {
      preserveFocusReturnForHigherLayers(state);
      state.active = false;
      removeActiveLayer(state.id);
    }

    state.focusReturnTarget = null;
    clearRootAttributes(state.root);
    layers.delete(state);
    syncAllRootAttributes();
    syncDocumentIsolation();
    syncDocumentState();
    restoreFocusAfterDestroy(focusReturnTarget);
  }

  return { destroy, setActive, setFocusReturnTarget, takeFocusReturnTarget };
}

function restoreFocusAfterDestroy(target: HTMLElement | null): void {
  if (target?.isConnected) {
    target.focus();
  }
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

  const topLayerId = activeLayerIds.at(-1);
  const topLayer = Array.from(layers).find((layer) => layer.id === topLayerId);
  let activeBranch = topLayer?.root ?? null;
  const nextInertElements = new Set<HTMLElement>();

  while (activeBranch !== null && activeBranch !== document.body) {
    const parentNode = activeBranch.parentNode;
    const parent = parentNode instanceof HTMLElement || parentNode instanceof ShadowRoot
      ? parentNode
      : null;

    if (parent === null) {
      return;
    }

    for (const sibling of parent.children) {
      if (sibling === activeBranch || !(sibling instanceof HTMLElement)) {
        continue;
      }

      nextInertElements.add(sibling);
    }

    activeBranch = parent instanceof ShadowRoot
      ? parent.host instanceof HTMLElement
        ? parent.host
        : null
      : parent;
  }

  for (const element of managedInertElements) {
    if (nextInertElements.has(element)) {
      continue;
    }

    if (element.hasAttribute('inert')) {
      element.removeAttribute('inert');
    }
    managedInertElements.delete(element);
  }

  for (const element of nextInertElements) {
    if (element.hasAttribute('inert') || managedInertElements.has(element)) {
      continue;
    }

    element.setAttribute('inert', '');
    managedInertElements.add(element);
  }
}

function restoreManagedInertElements(): void {
  for (const element of managedInertElements) {
    if (element.hasAttribute('inert')) {
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

    if (managedBodyOverflow === null) {
      previousBodyOverflow = body.style.overflow;
      managedBodyOverflow = applyInlineStyle(body, 'overflow', 'hidden');

      const scrollbarWidth = Math.max(0, window.innerWidth - root.clientWidth);
      if (scrollbarWidth > 0) {
        const currentPadding = Number.parseFloat(window.getComputedStyle(body).paddingInlineEnd) || 0;
        managedBodyPaddingInlineEnd = applyInlineStyle(
          body,
          'padding-inline-end',
          `${currentPadding + scrollbarWidth}px`
        );
      }
    }

    return;
  }

  root.removeAttribute('data-zdp-modal-layer-count');

  restoreManagedInertElements();
  restoreInlineStyle(managedBodyPaddingInlineEnd);
  restoreInlineStyle(managedBodyOverflow);
  managedBodyPaddingInlineEnd = null;
  managedBodyOverflow = null;
  previousBodyOverflow = null;
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

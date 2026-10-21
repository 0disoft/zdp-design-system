/* llmnav/1 module
id=zdp.design.overlay.dismiss
role=Coordinate Escape and outside-click dismissal across active overlay layers in each document.
owns=overlay dismissal ordering|document listener lifecycle
excludes=focus restoration|overlay rendering
search=overlay dismissal|Escape layer|outside click
invariant=Escape targets only the top active layer while outside clicks respect outside-dismiss eligibility.
stability=contract
*/

export interface ZdpDismissLayerOptions {
  closeOnEscape?: boolean;
  closeOnOutside?: boolean;
  ignoreOutside?: boolean;
  onEscape?: (event: KeyboardEvent) => void;
  onOutsideClick?: (event: MouseEvent) => void;
  onOutsidePointerDown?: (event: PointerEvent) => void;
}

export interface ZdpDismissLayerHandle {
  setActive(active: boolean, root: HTMLElement | null, options?: ZdpDismissLayerOptions): void;
  destroy(): void;
}

interface ZdpDismissLayerEntry {
  root: HTMLElement;
  options: ZdpDismissLayerOptions;
}

interface ZdpDismissDocumentState {
  document: Document;
  layers: ZdpDismissLayerEntry[];
  pendingPointerClick: { pointerId: number; target: EventTarget | null } | null;
  handleClick: (event: MouseEvent) => void;
  handlePointerDown: (event: PointerEvent) => void;
  handleKeydown: (event: KeyboardEvent) => void;
}

const documentStates = new WeakMap<Document, ZdpDismissDocumentState>();

export function createZdpDismissLayer(): ZdpDismissLayerHandle {
  let entry: ZdpDismissLayerEntry | null = null;
  let state: ZdpDismissDocumentState | null = null;

  function setActive(
    active: boolean,
    root: HTMLElement | null,
    options: ZdpDismissLayerOptions = {}
  ): void {
    if (!active || root === null) {
      unregister();
      return;
    }

    const nextState = getDocumentState(root.ownerDocument);

    if (entry !== null && state === nextState && entry.root === root) {
      entry.options = options;
      return;
    }

    unregister();
    entry = { root, options };
    state = nextState;
    state.layers.push(entry);
    syncDocumentListeners(state);
  }

  function unregister(): void {
    if (entry === null || state === null) {
      return;
    }

    const index = state.layers.lastIndexOf(entry);
    if (index >= 0) {
      state.layers.splice(index, 1);
    }

    syncDocumentListeners(state);
    entry = null;
    state = null;
  }

  return { destroy: unregister, setActive };
}

function getDocumentState(document: Document): ZdpDismissDocumentState {
  const existing = documentStates.get(document);
  if (existing) {
    return existing;
  }

  const state: ZdpDismissDocumentState = {
    document,
    layers: [],
    pendingPointerClick: null,
    handleClick: (event) => {
      const pending = state.pendingPointerClick;
      state.pendingPointerClick = null;
      // Keep the click available to its target, but do not dismiss a second layer.
      if (pending && event.detail > 0 && (
        'pointerId' in event
          ? event.pointerId === pending.pointerId
          : event.composedPath()[0] === pending.target
      )) {
        return;
      }
      dismissOutside(state, event);
    },
    handlePointerDown: (event) => {
      state.pendingPointerClick = null;
      const layer = findTopOutsideLayer(state.layers);
      if (layer?.options.onOutsidePointerDown && layer.options.closeOnOutside !== false && !event.composedPath().includes(layer.root)) {
        state.pendingPointerClick = { pointerId: event.pointerId, target: event.composedPath()[0] ?? null };
        layer.options.onOutsidePointerDown(event);
      }
    },
    handleKeydown: (event) => dismissEscape(state, event)
  };
  documentStates.set(document, state);
  return state;
}

function syncDocumentListeners(state: ZdpDismissDocumentState): void {
  const active = state.layers.length > 0;
  state.document.removeEventListener('click', state.handleClick, true);
  state.document.removeEventListener('pointerdown', state.handlePointerDown, true);
  state.document.removeEventListener('keydown', state.handleKeydown, true);

  if (active) {
    state.document.addEventListener('click', state.handleClick, true);
    state.document.addEventListener('pointerdown', state.handlePointerDown, true);
    state.document.addEventListener('keydown', state.handleKeydown, true);
  } else {
    state.pendingPointerClick = null;
  }
}

function dismissOutside(state: ZdpDismissDocumentState, event: MouseEvent): void {
  const topLayer = findTopOutsideLayer(state.layers);
  if (!topLayer || event.composedPath().includes(topLayer.root) || topLayer.options.closeOnOutside === false) {
    return;
  }

  topLayer.options.onOutsideClick?.(event);
}

function findTopOutsideLayer(layers: readonly ZdpDismissLayerEntry[]): ZdpDismissLayerEntry | undefined {
  for (let index = layers.length - 1; index >= 0; index -= 1) {
    const layer = layers[index];
    if (layer?.options.ignoreOutside !== true) {
      return layer;
    }
  }

  return undefined;
}

function dismissEscape(state: ZdpDismissDocumentState, event: KeyboardEvent): void {
  if (event.key !== 'Escape' || event.isComposing || event.keyCode === 229) {
    return;
  }

  const topLayer = state.layers.at(-1);
  if (!topLayer || topLayer.options.closeOnEscape === false) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  topLayer.options.onEscape?.(event);
}

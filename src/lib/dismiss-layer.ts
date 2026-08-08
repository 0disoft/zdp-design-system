export interface ZdpDismissLayerOptions {
  closeOnEscape?: boolean;
  closeOnOutside?: boolean;
  onEscape?: (event: KeyboardEvent) => void;
  onOutsideClick?: (event: MouseEvent) => void;
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
  handleClick: (event: MouseEvent) => void;
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
    handleClick: (event) => dismissOutside(state, event),
    handleKeydown: (event) => dismissEscape(state, event)
  };
  documentStates.set(document, state);
  return state;
}

function syncDocumentListeners(state: ZdpDismissDocumentState): void {
  const active = state.layers.length > 0;
  state.document.removeEventListener('click', state.handleClick, true);
  state.document.removeEventListener('keydown', state.handleKeydown, true);

  if (active) {
    state.document.addEventListener('click', state.handleClick, true);
    state.document.addEventListener('keydown', state.handleKeydown, true);
  }
}

function dismissOutside(state: ZdpDismissDocumentState, event: MouseEvent): void {
  const topLayer = state.layers.at(-1);
  if (!topLayer || event.composedPath().includes(topLayer.root) || topLayer.options.closeOnOutside === false) {
    return;
  }

  topLayer.options.onOutsideClick?.(event);
}

function dismissEscape(state: ZdpDismissDocumentState, event: KeyboardEvent): void {
  if (event.key !== 'Escape') {
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

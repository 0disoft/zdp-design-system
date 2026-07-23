export type ZdpSplitPaneOrientation = 'vertical' | 'horizontal';

export type ZdpSplitPaneResizeEvent = PointerEvent | KeyboardEvent | MouseEvent;

export interface ZdpSplitPaneSizeBounds {
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
}

export interface ZdpSplitPaneSizePersistenceOptions extends ZdpSplitPaneSizeBounds {
  key: string;
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null;
}

export interface ZdpSplitPaneSizePersistence {
  readonly key: string;
  load(): number;
  save(size: number): boolean;
  clear(): boolean;
}

export interface ZdpSplitPaneControllerElements {
  root: HTMLElement;
  primary: HTMLElement;
  separator: HTMLElement;
  secondary?: HTMLElement | null;
}

export interface ZdpSplitPaneControllerOptions extends ZdpSplitPaneSizeBounds {
  size?: number;
  secondaryMinSize?: number;
  handleSize?: number;
  keyboardStep?: number;
  largeKeyboardStep?: number;
  orientation?: ZdpSplitPaneOrientation;
  ariaLabel?: string;
  disabled?: boolean;
  getValueText?: ((size: number) => string) | null;
  onResize?: ((size: number, event: ZdpSplitPaneResizeEvent) => void) | null;
  onResizeCommit?: ((size: number, event: ZdpSplitPaneResizeEvent) => void) | null;
}

export interface ZdpSplitPaneController {
  getSize(): number;
  update(options: Partial<ZdpSplitPaneControllerOptions>): void;
  destroy(): void;
}

interface ZdpDragSelectionState {
  count: number;
  classWasPresent: boolean;
}

interface ZdpSplitPaneControllerSnapshot {
  rootAttributes: Map<string, string | null>;
  primaryAttributes: Map<string, string | null>;
  separatorAttributes: Map<string, string | null>;
  secondaryAttributes: Map<string, string | null> | null;
  rootClasses: Map<string, boolean>;
  primaryClasses: Map<string, boolean>;
  separatorClasses: Map<string, boolean>;
  secondaryClasses: Map<string, boolean> | null;
  rootStyles: Map<string, { value: string; priority: string }>;
}

const ZDP_SPLIT_PANE_STORAGE_PREFIX = 'zdp:split-pane-size:v1:';
const ZDP_SPLIT_PANE_ROOT_ATTRIBUTES = [
  'data-zdp-resizable-split-pane',
  'data-zdp-resizable-split-pane-orientation',
  'data-zdp-resizable-split-pane-constrained'
] as const;
const ZDP_SPLIT_PANE_PRIMARY_ATTRIBUTES = ['id', 'data-zdp-split-pane-primary'] as const;
const ZDP_SPLIT_PANE_SEPARATOR_ATTRIBUTES = [
  'role',
  'aria-label',
  'aria-controls',
  'aria-orientation',
  'aria-valuemin',
  'aria-valuemax',
  'aria-valuenow',
  'aria-valuetext',
  'aria-disabled',
  'tabindex',
  'data-zdp-split-pane-separator'
] as const;
const ZDP_SPLIT_PANE_SECONDARY_ATTRIBUTES = ['data-zdp-split-pane-secondary'] as const;
const ZDP_SPLIT_PANE_ROOT_CLASSES = [
  'zdp-resizable-split-pane',
  'zdp-resizable-split-pane--vertical',
  'zdp-resizable-split-pane--horizontal',
  'zdp-resizable-split-pane--dragging'
] as const;
const ZDP_SPLIT_PANE_PRIMARY_CLASSES = ['zdp-resizable-split-pane__primary'] as const;
const ZDP_SPLIT_PANE_SEPARATOR_CLASSES = ['zdp-resizable-split-pane__separator'] as const;
const ZDP_SPLIT_PANE_SECONDARY_CLASSES = ['zdp-resizable-split-pane__secondary'] as const;
const ZDP_SPLIT_PANE_ROOT_STYLES = [
  '--zdp-resizable-split-pane-size',
  '--zdp-resizable-split-pane-handle-size'
] as const;
const dragSelectionStates = new WeakMap<Document, ZdpDragSelectionState>();
let splitPanePrimaryId = 0;

export function clampZdpSplitPaneSize(size: number, bounds: ZdpSplitPaneSizeBounds = {}): number {
  const { defaultSize, minSize, maxSize } = normalizeBounds(bounds);
  const candidate = Number.isFinite(size) ? Math.round(size) : defaultSize;
  return Math.min(maxSize, Math.max(minSize, candidate));
}

export function createZdpSplitPaneSizePersistence(
  options: ZdpSplitPaneSizePersistenceOptions
): ZdpSplitPaneSizePersistence {
  const storageKey = createStorageKey(options.key);
  const bounds = normalizeBounds(options);

  function resolveStorage(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null {
    if (options.storage !== undefined) {
      return options.storage;
    }

    if (typeof window === 'undefined') {
      return null;
    }

    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }

  return {
    key: storageKey,
    load(): number {
      const storage = resolveStorage();

      if (!storage) {
        return bounds.defaultSize;
      }

      try {
        const storedValue = storage.getItem(storageKey);
        const parsedValue = storedValue === null || storedValue.trim() === '' ? Number.NaN : Number(storedValue);
        return Number.isFinite(parsedValue)
          ? clampZdpSplitPaneSize(parsedValue, bounds)
          : bounds.defaultSize;
      } catch {
        return bounds.defaultSize;
      }
    },
    save(size: number): boolean {
      const storage = resolveStorage();

      if (!storage) {
        return false;
      }

      try {
        storage.setItem(storageKey, String(clampZdpSplitPaneSize(size, bounds)));
        return true;
      } catch {
        return false;
      }
    },
    clear(): boolean {
      const storage = resolveStorage();

      if (!storage) {
        return false;
      }

      try {
        storage.removeItem(storageKey);
        return true;
      } catch {
        return false;
      }
    }
  };
}

export function createZdpSplitPaneController(
  elements: ZdpSplitPaneControllerElements,
  initialOptions: ZdpSplitPaneControllerOptions = {}
): ZdpSplitPaneController {
  const { root, primary, separator, secondary = null } = elements;

  if (root.ownerDocument !== primary.ownerDocument || root.ownerDocument !== separator.ownerDocument) {
    throw new TypeError('Split pane controller elements must belong to the same document.');
  }

  if (secondary && root.ownerDocument !== secondary.ownerDocument) {
    throw new TypeError('Split pane controller elements must belong to the same document.');
  }

  const snapshot = captureControllerSnapshot(root, primary, separator, secondary);
  let options: ZdpSplitPaneControllerOptions = { ...initialOptions };
  let requestedSize = normalizeSize(initialOptions.size, normalizeSize(initialOptions.defaultSize, 280));
  let containerSize = Number.POSITIVE_INFINITY;
  let activePointerId: number | null = null;
  let pointerStartCoordinate = 0;
  let pointerStartSize = 0;
  let pointerMoved = false;
  let dragging = false;
  let destroyed = false;
  let endDragSelection: (() => void) | null = null;

  if (primary.id.trim().length === 0) {
    splitPanePrimaryId += 1;
    primary.id = `zdp-split-pane-primary-${splitPanePrimaryId}`;
  }

  separator.addEventListener('pointerdown', handlePointerDown);
  separator.addEventListener('pointermove', handlePointerMove);
  separator.addEventListener('pointerup', handlePointerUp);
  separator.addEventListener('pointercancel', handlePointerCancel);
  separator.addEventListener('lostpointercapture', handleLostPointerCapture);
  separator.addEventListener('keydown', handleKeydown);
  separator.addEventListener('dblclick', handleDoubleClick);

  const ResizeObserverConstructor = root.ownerDocument.defaultView?.ResizeObserver;
  const resizeObserver = ResizeObserverConstructor
    ? new ResizeObserverConstructor(() => {
        measureContainer();
        render();
      })
    : null;

  measureContainer();
  render();
  resizeObserver?.observe(root);

  return {
    getSize(): number {
      return getRenderedSize();
    },
    update(nextOptions: Partial<ZdpSplitPaneControllerOptions>): void {
      if (destroyed) {
        return;
      }

      if (Object.prototype.hasOwnProperty.call(nextOptions, 'size') && nextOptions.size !== undefined) {
        requestedSize = normalizeSize(nextOptions.size, getDefaultSize());
      }

      options = { ...options, ...nextOptions };

      if (isDisabled() && dragging) {
        finishPointerInteraction();
      }

      measureContainer();
      render();
    },
    destroy(): void {
      if (destroyed) {
        return;
      }

      destroyed = true;
      finishPointerInteraction();
      resizeObserver?.disconnect();
      separator.removeEventListener('pointerdown', handlePointerDown);
      separator.removeEventListener('pointermove', handlePointerMove);
      separator.removeEventListener('pointerup', handlePointerUp);
      separator.removeEventListener('pointercancel', handlePointerCancel);
      separator.removeEventListener('lostpointercapture', handleLostPointerCapture);
      separator.removeEventListener('keydown', handleKeydown);
      separator.removeEventListener('dblclick', handleDoubleClick);
      restoreControllerSnapshot(root, primary, separator, secondary, snapshot);
    }
  };

  function getDefaultSize(): number {
    return normalizeBounds(options).defaultSize;
  }

  function getOrientation(): ZdpSplitPaneOrientation {
    return options.orientation === 'horizontal' ? 'horizontal' : 'vertical';
  }

  function isDisabled(): boolean {
    return options.disabled === true;
  }

  function getNormalizedValues(): {
    defaultSize: number;
    minSize: number;
    maxSize: number;
    effectiveMaxSize: number;
    secondaryMinSize: number;
    handleSize: number;
    keyboardStep: number;
    largeKeyboardStep: number;
    constrained: boolean;
  } {
    const { defaultSize, minSize, maxSize } = normalizeBounds(options);
    const secondaryMinSize = normalizeSize(options.secondaryMinSize, 0);
    const handleSize = Math.max(1, normalizeSize(options.handleSize, 24));
    const keyboardStep = Math.max(1, normalizeSize(options.keyboardStep, 8));
    const largeKeyboardStep = Math.max(1, normalizeSize(options.largeKeyboardStep, 32));
    const containerMaximum = Number.isFinite(containerSize)
      ? Math.max(minSize, Math.floor(containerSize - secondaryMinSize))
      : maxSize;
    const effectiveMaxSize = Math.min(maxSize, containerMaximum);
    const constrained = Number.isFinite(containerSize) && containerSize < minSize + secondaryMinSize;

    return {
      defaultSize,
      minSize,
      maxSize,
      effectiveMaxSize,
      secondaryMinSize,
      handleSize,
      keyboardStep,
      largeKeyboardStep,
      constrained
    };
  }

  function getRenderedSize(): number {
    const { defaultSize, minSize, effectiveMaxSize } = getNormalizedValues();
    return clampZdpSplitPaneSize(requestedSize, {
      defaultSize,
      minSize,
      maxSize: effectiveMaxSize
    });
  }

  function measureContainer(): void {
    const bounds = root.getBoundingClientRect();
    containerSize = getOrientation() === 'vertical' ? bounds.width : bounds.height;

    if (containerSize <= 0) {
      containerSize = Number.POSITIVE_INFINITY;
    }
  }

  function render(): void {
    const orientation = getOrientation();
    const values = getNormalizedValues();
    const renderedSize = getRenderedSize();
    const valueText = options.getValueText?.(renderedSize) ?? `${renderedSize} pixels`;

    root.classList.add('zdp-resizable-split-pane');
    root.classList.toggle('zdp-resizable-split-pane--vertical', orientation === 'vertical');
    root.classList.toggle('zdp-resizable-split-pane--horizontal', orientation === 'horizontal');
    root.classList.toggle('zdp-resizable-split-pane--dragging', dragging);
    root.setAttribute('data-zdp-resizable-split-pane', '');
    root.setAttribute('data-zdp-resizable-split-pane-orientation', orientation);
    toggleAttributeValue(root, 'data-zdp-resizable-split-pane-constrained', values.constrained ? 'true' : null);
    root.style.setProperty('--zdp-resizable-split-pane-size', `${renderedSize}px`);
    root.style.setProperty('--zdp-resizable-split-pane-handle-size', `${values.handleSize}px`);

    primary.classList.add('zdp-resizable-split-pane__primary');
    primary.setAttribute('data-zdp-split-pane-primary', '');

    separator.classList.add('zdp-resizable-split-pane__separator');
    separator.setAttribute('data-zdp-split-pane-separator', '');
    separator.setAttribute('role', 'separator');
    separator.setAttribute('aria-label', options.ariaLabel?.trim() || 'Resize primary panel');
    separator.setAttribute('aria-controls', primary.id);
    separator.setAttribute('aria-orientation', orientation);
    separator.setAttribute('aria-valuemin', String(values.minSize));
    separator.setAttribute('aria-valuemax', String(values.effectiveMaxSize));
    separator.setAttribute('aria-valuenow', String(renderedSize));
    separator.setAttribute('aria-valuetext', valueText);
    separator.setAttribute('tabindex', isDisabled() ? '-1' : '0');
    toggleAttributeValue(separator, 'aria-disabled', isDisabled() ? 'true' : null);

    if (secondary) {
      secondary.classList.add('zdp-resizable-split-pane__secondary');
      secondary.setAttribute('data-zdp-split-pane-secondary', '');
    }
  }

  function setSize(nextSize: number, event: ZdpSplitPaneResizeEvent, commit: boolean): void {
    const previousSize = getRenderedSize();
    const { defaultSize, minSize, effectiveMaxSize } = getNormalizedValues();
    const nextRenderedSize = clampZdpSplitPaneSize(nextSize, {
      defaultSize,
      minSize,
      maxSize: effectiveMaxSize
    });

    requestedSize = nextRenderedSize;
    render();

    if (nextRenderedSize === previousSize) {
      return;
    }

    options.onResize?.(nextRenderedSize, event);

    if (commit) {
      options.onResizeCommit?.(nextRenderedSize, event);
    }
  }

  function pointerCoordinate(event: PointerEvent): number {
    return getOrientation() === 'vertical' ? event.clientX : event.clientY;
  }

  function primaryAxisPosition(event: PointerEvent): number {
    const bounds = root.getBoundingClientRect();

    if (getOrientation() === 'horizontal') {
      return event.clientY - bounds.top;
    }

    return isRtl() ? bounds.right - event.clientX : event.clientX - bounds.left;
  }

  function isRtl(): boolean {
    return root.ownerDocument.defaultView?.getComputedStyle(root).direction === 'rtl';
  }

  function handlePointerDown(event: PointerEvent): void {
    if (isDisabled() || event.button !== 0 || event.isPrimary === false) {
      return;
    }

    event.preventDefault();
    activePointerId = event.pointerId;
    pointerStartCoordinate = pointerCoordinate(event);
    pointerStartSize = getRenderedSize();
    pointerMoved = false;
    dragging = true;
    render();

    try {
      separator.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture may be unavailable for synthetic events; document-level state still cleans up.
    }

    endDragSelection = beginZdpDragSelection(separator.ownerDocument);
  }

  function handlePointerMove(event: PointerEvent): void {
    if (!dragging || event.pointerId !== activePointerId) {
      return;
    }

    event.preventDefault();
    pointerMoved = pointerMoved || Math.abs(pointerCoordinate(event) - pointerStartCoordinate) >= 3;

    if (pointerMoved) {
      setSize(primaryAxisPosition(event), event, false);
    }
  }

  function handlePointerUp(event: PointerEvent): void {
    if (!dragging || event.pointerId !== activePointerId) {
      return;
    }

    if (pointerMoved) {
      const committedSize = getRenderedSize();
      finishPointerInteraction();
      options.onResizeCommit?.(committedSize, event);
      return;
    }

    const { keyboardStep } = getNormalizedValues();
    const direction = primaryAxisPosition(event) < getRenderedSize() ? -1 : 1;
    finishPointerInteraction();
    setSize(pointerStartSize + direction * keyboardStep, event, true);
  }

  function handlePointerCancel(event: PointerEvent): void {
    if (event.pointerId === activePointerId) {
      finishPointerInteraction();
    }
  }

  function handleLostPointerCapture(event: PointerEvent): void {
    if (dragging && event.pointerId === activePointerId) {
      const committedSize = getRenderedSize();
      finishPointerInteraction();
      options.onResizeCommit?.(committedSize, event);
    }
  }

  function finishPointerInteraction(): void {
    const pointerId = activePointerId;
    dragging = false;
    activePointerId = null;
    pointerMoved = false;
    endDragSelection?.();
    endDragSelection = null;
    root.classList.remove('zdp-resizable-split-pane--dragging');

    if (pointerId !== null) {
      try {
        if (separator.hasPointerCapture(pointerId)) {
          separator.releasePointerCapture(pointerId);
        }
      } catch {
        // The pointer may already have been released by the browser.
      }
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (isDisabled()) {
      return;
    }

    const { minSize, effectiveMaxSize, keyboardStep, largeKeyboardStep } = getNormalizedValues();
    const step = event.shiftKey ? largeKeyboardStep : keyboardStep;
    let nextSize: number | null = null;

    if (event.key === 'Home') {
      nextSize = minSize;
    } else if (event.key === 'End') {
      nextSize = effectiveMaxSize;
    } else if (event.key === 'PageUp') {
      nextSize = getRenderedSize() - largeKeyboardStep;
    } else if (event.key === 'PageDown') {
      nextSize = getRenderedSize() + largeKeyboardStep;
    } else if (getOrientation() === 'horizontal' && event.key === 'ArrowUp') {
      nextSize = getRenderedSize() - step;
    } else if (getOrientation() === 'horizontal' && event.key === 'ArrowDown') {
      nextSize = getRenderedSize() + step;
    } else if (getOrientation() === 'vertical' && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      const increase = isRtl() ? event.key === 'ArrowLeft' : event.key === 'ArrowRight';
      nextSize = getRenderedSize() + (increase ? step : -step);
    }

    if (nextSize === null) {
      return;
    }

    event.preventDefault();
    setSize(nextSize, event, true);
  }

  function handleDoubleClick(event: MouseEvent): void {
    if (isDisabled()) {
      return;
    }

    setSize(getDefaultSize(), event, true);
    event.preventDefault();
  }
}

function beginZdpDragSelection(document: Document): () => void {
  const root = document.documentElement;
  const existingState = dragSelectionStates.get(document);
  const state = existingState ?? {
    count: 0,
    classWasPresent: root.classList.contains('zdp-user-select-dragging')
  };
  state.count += 1;
  dragSelectionStates.set(document, state);
  root.classList.add('zdp-user-select-dragging');

  let active = true;

  return (): void => {
    if (!active) {
      return;
    }

    active = false;
    const currentState = dragSelectionStates.get(document);

    if (!currentState) {
      return;
    }

    currentState.count -= 1;

    if (currentState.count > 0) {
      return;
    }

    dragSelectionStates.delete(document);

    if (!currentState.classWasPresent) {
      root.classList.remove('zdp-user-select-dragging');
    }
  };
}

function normalizeBounds(bounds: ZdpSplitPaneSizeBounds): Required<ZdpSplitPaneSizeBounds> {
  const minSize = normalizeSize(bounds.minSize, 220);
  const maxSize = Math.max(minSize, normalizeSize(bounds.maxSize, 480));
  const defaultSize = Math.min(maxSize, Math.max(minSize, normalizeSize(bounds.defaultSize, 280)));

  return { defaultSize, minSize, maxSize };
}

function normalizeSize(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.round(value as number)) : fallback;
}

function createStorageKey(key: string): string {
  const normalizedKey = key.trim();

  if (normalizedKey.length === 0) {
    throw new TypeError('Split pane persistence requires a non-empty key.');
  }

  return `${ZDP_SPLIT_PANE_STORAGE_PREFIX}${normalizedKey}`;
}

function toggleAttributeValue(element: HTMLElement, name: string, value: string | null): void {
  if (value === null) {
    element.removeAttribute(name);
    return;
  }

  element.setAttribute(name, value);
}

function captureControllerSnapshot(
  root: HTMLElement,
  primary: HTMLElement,
  separator: HTMLElement,
  secondary: HTMLElement | null
): ZdpSplitPaneControllerSnapshot {
  return {
    rootAttributes: captureAttributes(root, ZDP_SPLIT_PANE_ROOT_ATTRIBUTES),
    primaryAttributes: captureAttributes(primary, ZDP_SPLIT_PANE_PRIMARY_ATTRIBUTES),
    separatorAttributes: captureAttributes(separator, ZDP_SPLIT_PANE_SEPARATOR_ATTRIBUTES),
    secondaryAttributes: secondary ? captureAttributes(secondary, ZDP_SPLIT_PANE_SECONDARY_ATTRIBUTES) : null,
    rootClasses: captureClasses(root, ZDP_SPLIT_PANE_ROOT_CLASSES),
    primaryClasses: captureClasses(primary, ZDP_SPLIT_PANE_PRIMARY_CLASSES),
    separatorClasses: captureClasses(separator, ZDP_SPLIT_PANE_SEPARATOR_CLASSES),
    secondaryClasses: secondary ? captureClasses(secondary, ZDP_SPLIT_PANE_SECONDARY_CLASSES) : null,
    rootStyles: captureStyles(root, ZDP_SPLIT_PANE_ROOT_STYLES)
  };
}

function restoreControllerSnapshot(
  root: HTMLElement,
  primary: HTMLElement,
  separator: HTMLElement,
  secondary: HTMLElement | null,
  snapshot: ZdpSplitPaneControllerSnapshot
): void {
  restoreAttributes(root, snapshot.rootAttributes);
  restoreAttributes(primary, snapshot.primaryAttributes);
  restoreAttributes(separator, snapshot.separatorAttributes);
  restoreClasses(root, snapshot.rootClasses);
  restoreClasses(primary, snapshot.primaryClasses);
  restoreClasses(separator, snapshot.separatorClasses);
  restoreStyles(root, snapshot.rootStyles);

  if (secondary && snapshot.secondaryAttributes && snapshot.secondaryClasses) {
    restoreAttributes(secondary, snapshot.secondaryAttributes);
    restoreClasses(secondary, snapshot.secondaryClasses);
  }
}

function captureAttributes(element: HTMLElement, names: readonly string[]): Map<string, string | null> {
  return new Map(names.map((name) => [name, element.getAttribute(name)]));
}

function restoreAttributes(element: HTMLElement, attributes: Map<string, string | null>): void {
  for (const [name, value] of attributes) {
    toggleAttributeValue(element, name, value);
  }
}

function captureClasses(element: HTMLElement, names: readonly string[]): Map<string, boolean> {
  return new Map(names.map((name) => [name, element.classList.contains(name)]));
}

function restoreClasses(element: HTMLElement, classes: Map<string, boolean>): void {
  for (const [name, present] of classes) {
    element.classList.toggle(name, present);
  }
}

function captureStyles(
  element: HTMLElement,
  names: readonly string[]
): Map<string, { value: string; priority: string }> {
  return new Map(
    names.map((name) => [
      name,
      {
        value: element.style.getPropertyValue(name),
        priority: element.style.getPropertyPriority(name)
      }
    ])
  );
}

function restoreStyles(
  element: HTMLElement,
  styles: Map<string, { value: string; priority: string }>
): void {
  for (const [name, { value, priority }] of styles) {
    if (value.length === 0) {
      element.style.removeProperty(name);
    } else {
      element.style.setProperty(name, value, priority);
    }
  }
}

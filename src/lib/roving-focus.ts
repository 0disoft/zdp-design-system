export type ZdpRovingFocusOrientation = 'horizontal' | 'vertical';
export type ZdpRovingFocusKey =
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'ArrowUp'
  | 'End'
  | 'Home';

export interface ZdpRovingFocusOptions {
  container: HTMLElement;
  event: KeyboardEvent;
  fallbackElement?: HTMLElement | null;
  orientation: ZdpRovingFocusOrientation;
  selector: string;
}

export interface ZdpRovingFocusResult {
  element: HTMLElement;
  index: number;
}

export function moveZdpRovingFocus(options: ZdpRovingFocusOptions): ZdpRovingFocusResult | null {
  const { container, event, fallbackElement = null, orientation, selector } = options;
  if (!isOrientationKey(event.key, orientation)) {
    return null;
  }

  const document = container.ownerDocument;
  const HTMLElementConstructor = document.defaultView?.HTMLElement;
  const elements = Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => element.ownerDocument === document
  );
  if (elements.length === 0) {
    return null;
  }

  const eventTarget = HTMLElementConstructor !== undefined && event.target instanceof HTMLElementConstructor
    ? event.target
    : null;
  const currentElement = eventTarget !== null && elements.includes(eventTarget)
    ? eventTarget
    : fallbackElement !== null && elements.includes(fallbackElement)
      ? fallbackElement
      : elements[0] ?? null;
  const currentIndex = Math.max(0, currentElement === null ? 0 : elements.indexOf(currentElement));
  const nextIndex = resolveRovingFocusIndex(
    event.key,
    currentIndex,
    elements.length,
    orientation === 'horizontal' && resolveDirection(container) === 'rtl'
  );
  const element = elements[nextIndex];

  if (element === undefined) {
    return null;
  }

  event.preventDefault();
  element.focus();
  return { element, index: nextIndex };
}

function isOrientationKey(key: string, orientation: ZdpRovingFocusOrientation): key is ZdpRovingFocusKey {
  return key === 'Home' || key === 'End' || (
    orientation === 'horizontal'
      ? key === 'ArrowLeft' || key === 'ArrowRight'
      : key === 'ArrowUp' || key === 'ArrowDown'
  );
}

function resolveRovingFocusIndex(
  key: ZdpRovingFocusKey,
  currentIndex: number,
  length: number,
  rtl: boolean
): number {
  if (key === 'Home') {
    return 0;
  }
  if (key === 'End') {
    return length - 1;
  }

  const movesBackward = key === 'ArrowUp' || key === 'ArrowLeft';
  const step = (movesBackward ? -1 : 1) * (rtl ? -1 : 1);
  return (currentIndex + step + length) % length;
}

function resolveDirection(container: HTMLElement): 'ltr' | 'rtl' {
  return container.ownerDocument.defaultView?.getComputedStyle(container).direction === 'rtl'
    ? 'rtl'
    : 'ltr';
}

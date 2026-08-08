export const zdpFocusableSelector = [
  'a[href]',
  'area[href]',
  'button',
  'input',
  'select',
  'textarea',
  'iframe',
  'object',
  'embed',
  'details > summary:first-of-type',
  '[contenteditable="true"]',
  '[tabindex]'
].join(', ');

export function isZdpFocusableElement(element: HTMLElement): boolean {
  if (element.tabIndex < 0) {
    return false;
  }

  if (element.matches(':disabled, [hidden], [aria-hidden="true"]')) {
    return false;
  }

  if (element.closest('[hidden], [aria-hidden="true"], [inert]') !== null) {
    return false;
  }

  const style = window.getComputedStyle(element);

  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }

  return element.getClientRects().length > 0;
}

export interface ZdpFocusableCache {
  destroy(): void;
  get(): HTMLElement[];
  invalidate(): void;
}

export function createZdpFocusableCache(getRoot: () => HTMLElement | null): ZdpFocusableCache {
  let cachedElements: HTMLElement[] | null = null;
  let observedHeight: number | null = null;
  let observedRoot: HTMLElement | null = null;
  let observedWidth: number | null = null;
  const mutationObserver = typeof MutationObserver === 'undefined'
    ? null
    : new MutationObserver(invalidate);
  const resizeObserver = typeof ResizeObserver === 'undefined'
    ? null
    : new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry === undefined) {
          return;
        }

        const { height, width } = entry.contentRect;
        if (observedHeight !== null && observedWidth !== null && (height !== observedHeight || width !== observedWidth)) {
          invalidate();
        }
        observedHeight = height;
        observedWidth = width;
      });

  function invalidate(): void {
    cachedElements = null;
  }

  function observe(root: HTMLElement | null): void {
    if (root === observedRoot) {
      return;
    }

    mutationObserver?.disconnect();
    resizeObserver?.disconnect();
    observedRoot = root;
    observedHeight = null;
    observedWidth = null;
    invalidate();

    if (root === null) {
      return;
    }

    mutationObserver?.observe(root, {
      attributeFilter: [
        'aria-hidden',
        'class',
        'contenteditable',
        'disabled',
        'hidden',
        'href',
        'inert',
        'open',
        'style',
        'tabindex'
      ],
      attributes: true,
      childList: true,
      subtree: true
    });
    resizeObserver?.observe(root);
  }

  function get(): HTMLElement[] {
    const root = getRoot();
    observe(root);

    if (root === null) {
      return [];
    }

    if (cachedElements === null) {
      cachedElements = Array.from(root.querySelectorAll<HTMLElement>(zdpFocusableSelector)).filter(
        isZdpFocusableElement
      );
    }

    return cachedElements;
  }

  function destroy(): void {
    mutationObserver?.disconnect();
    resizeObserver?.disconnect();
    observedRoot = null;
    observedHeight = null;
    observedWidth = null;
    cachedElements = null;
  }

  return { destroy, get, invalidate };
}

export function getZdpActiveElement(root: Document | ShadowRoot = document): HTMLElement | null {
  let activeElement = root.activeElement;

  while (activeElement instanceof HTMLElement && activeElement.shadowRoot?.activeElement) {
    activeElement = activeElement.shadowRoot.activeElement;
  }

  return activeElement instanceof HTMLElement ? activeElement : null;
}

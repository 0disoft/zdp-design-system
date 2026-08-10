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
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]'
].join(', ');

export function isZdpFocusableElement(element: HTMLElement): boolean {
  if (element.tabIndex < 0 && !isImplicitContentEditableTabStop(element)) {
    return false;
  }

  if (element.matches(':disabled, [hidden], [aria-hidden="true"]')) {
    return false;
  }

  if (element.closest('[hidden], [aria-hidden="true"], [inert]') !== null) {
    return false;
  }

  const view = element.ownerDocument.defaultView;
  const style = view?.getComputedStyle(element);

  if (style === undefined || style.display === 'none' || style.visibility === 'hidden') {
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
      const candidates = Array.from(root.querySelectorAll<HTMLElement>(zdpFocusableSelector))
        .filter(isZdpFocusableElement);
      cachedElements = sortZdpTabbableElements(candidates.filter((element) => (
        !isRadioInput(element) || isRadioGroupTabStop(element, candidates)
      )));
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

  while (isZdpHtmlElement(activeElement) && activeElement.shadowRoot?.activeElement) {
    activeElement = activeElement.shadowRoot.activeElement;
  }

  return isZdpHtmlElement(activeElement) ? activeElement : null;
}

function isImplicitContentEditableTabStop(element: HTMLElement): boolean {
  if (!element.isContentEditable || element.hasAttribute('tabindex')) {
    return false;
  }

  return element.parentElement?.closest('[contenteditable]:not([contenteditable="false"])') === null;
}

function isRadioInput(element: HTMLElement): element is HTMLInputElement {
  return element.tagName === 'INPUT' && (element as HTMLInputElement).type === 'radio';
}

function isRadioGroupTabStop(radio: HTMLInputElement, candidates: readonly HTMLElement[]): boolean {
  if (radio.name === '') {
    return true;
  }

  const group = candidates.filter((candidate): candidate is HTMLInputElement => (
    isRadioInput(candidate) &&
    candidate.name === radio.name &&
    candidate.form === radio.form &&
    candidate.getRootNode() === radio.getRootNode()
  ));
  const checkedRadio = group.find((candidate) => candidate.checked);

  return checkedRadio === undefined ? group[0] === radio : checkedRadio === radio;
}

function sortZdpTabbableElements(elements: readonly HTMLElement[]): HTMLElement[] {
  return elements
    .map((element, documentOrder) => ({
      documentOrder,
      element,
      tabIndex: Math.max(0, element.tabIndex)
    }))
    .sort((left, right) => {
      const leftPositive = left.tabIndex > 0;
      const rightPositive = right.tabIndex > 0;

      if (leftPositive !== rightPositive) {
        return leftPositive ? -1 : 1;
      }

      if (leftPositive && left.tabIndex !== right.tabIndex) {
        return left.tabIndex - right.tabIndex;
      }

      return left.documentOrder - right.documentOrder;
    })
    .map(({ element }) => element);
}

function isZdpHtmlElement(element: Element | null): element is HTMLElement {
  if (element === null) {
    return false;
  }

  const view = element.ownerDocument.defaultView;
  return view === null
    ? element.namespaceURI === 'http://www.w3.org/1999/xhtml'
    : element instanceof view.HTMLElement;
}

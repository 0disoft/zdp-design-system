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

  // closest() stops at a shadow boundary; inspect each composed ancestor too.
  let ancestor: Element | null = element;
  while (ancestor !== null) {
    if (ancestor.matches('[hidden], [aria-hidden="true"], [inert]')) {
      return false;
    }
    const tree = ancestor.getRootNode();
    ancestor = ancestor.assignedSlot ?? ancestor.parentElement ?? (
      tree.nodeType === 11 ? (tree as ShadowRoot).host ?? null : null
    );
  }

  const view = element.ownerDocument.defaultView;
  const style = view?.getComputedStyle(element);

  if (style === undefined || style.display === 'none' || (style.visibility === 'hidden' || style.visibility === 'collapse')) {
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
  let observedShadowRoots = new Set<ShadowRoot>();
  let observedHeight: number | null = null;
  let observedRoot: HTMLElement | null = null;
  let observedViewportSignature: string | null = null;
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
    observedShadowRoots.clear();
    observedViewportSignature = null;
    observedHeight = null;
    observedWidth = null;
    invalidate();

    if (root === null) {
      return;
    }

    observeTree(root);
    resizeObserver?.observe(root);
  }

  function observeTree(root: HTMLElement | ShadowRoot): void {
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
        'slot',
        'name',
        'tabindex',
        'type'
      ],
      attributes: true,
      childList: true,
      subtree: true
    });
  }

  function get(): HTMLElement[] {
    const root = getRoot();
    observe(root);

    if (root === null) {
      return [];
    }

    // A consumer can change controls and move focus in the same task, before
    // the observer callback runs. Consume queued changes before using the cache.
    if (mutationObserver !== null && mutationObserver.takeRecords().length > 0) {
      invalidate();
    }

    // Media queries may change before a resize event is delivered, without
    // changing the panel dimensions. Validate viewport state when using the cache.
    const view = root.ownerDocument.defaultView;
    const viewportSignature = view === null ? null : [
      view.innerWidth, view.innerHeight, view.devicePixelRatio,
      view.visualViewport?.width, view.visualViewport?.height
    ].join(':');
    if (viewportSignature !== observedViewportSignature) {
      observedViewportSignature = viewportSignature;
      invalidate();
    }

    // Discover roots on each lookup: attaching a shadow root emits no mutation.
    const shadowRoots = new Set<ShadowRoot>();
    const candidatesInTree = collectComposedCandidates(root, shadowRoots);
    if (shadowRoots.size !== observedShadowRoots.size || [...shadowRoots].some((tree) => !observedShadowRoots.has(tree))) {
      mutationObserver?.disconnect();
      observeTree(root);
      for (const tree of shadowRoots) observeTree(tree);
      observedShadowRoots = shadowRoots;
      invalidate();
    }
    if (cachedElements === null) {
      cachedElements = candidatesInTree.filter(isZdpFocusableElement);
    }

    // Radio selection and group ownership can change without DOM mutations or events.
    const candidates = cachedElements;
    return sortZdpTabbableElements(candidates.filter((element) => (
      !isRadioInput(element) || isRadioGroupTabStop(element, candidates)
    )));
  }

  function destroy(): void {
    mutationObserver?.disconnect();
    resizeObserver?.disconnect();
    observedRoot = null;
    observedShadowRoots.clear();
    observedViewportSignature = null;
    observedHeight = null;
    observedWidth = null;
    cachedElements = null;
  }

  return { destroy, get, invalidate };
}

function collectComposedCandidates(root: HTMLElement, shadowRoots: Set<ShadowRoot>): HTMLElement[] {
  const candidates: HTMLElement[] = [];
  const visited = new Set<Element>();
  function visit(element: Element): void {
    if (visited.has(element)) return;
    visited.add(element);
    if (isZdpHtmlElement(element) && element.matches(zdpFocusableSelector)) {
      candidates.push(element);
    }
    if (element.shadowRoot !== null) {
      // An explicit negative host tabindex excludes its entire shadow focus scope.
      if (isZdpHtmlElement(element) && element.hasAttribute('tabindex') && element.tabIndex < 0) return;
      shadowRoots.add(element.shadowRoot);
      for (const child of element.shadowRoot.children) visit(child);
    } else if (element.tagName === 'SLOT') {
      const slot = element as HTMLSlotElement;
      const children = slot.assignedNodes().length > 0 ? slot.assignedElements({ flatten: true }) : slot.children;
      for (const child of children) visit(child);
    } else {
      for (const child of element.children) visit(child);
    }
  }
  for (const child of root.children) visit(child);
  return candidates;
}

/** Whether rendering should preserve focus deliberately moved away from a control. */
export function hasZdpFocusMoved(root: HTMLElement, previous: HTMLElement): boolean {
  const document = root.ownerDocument;
  const focused = getZdpActiveElement(document);
  if (focused === null || focused === previous || focused === document.body || focused === document.documentElement) return false;
  const tree = root.getRootNode();
  // Removing a focused shadow descendant can leave its non-tabbable host active.
  return !(tree.nodeType === 11 && focused === (tree as ShadowRoot).host &&
    (tree as ShadowRoot).activeElement === null && focused.tabIndex < 0);
}

export function getZdpActiveElement(root: Document | ShadowRoot = document): HTMLElement | null {
  let activeElement = root.activeElement;

  while (isZdpHtmlElement(activeElement)) {
    // A modal may capture focus before its iframe root is bound. Follow the
    // document's focused frame just as we follow a focused shadow host.
    const nestedActiveElement: Element | null | undefined = activeElement.shadowRoot?.activeElement ?? (
      activeElement.tagName === 'IFRAME'
        ? (activeElement as HTMLIFrameElement).contentDocument?.activeElement
        : null
    );
    if (!nestedActiveElement) break;
    activeElement = nestedActiveElement;
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
  // Adoption changes ownerDocument but preserves the element's original realm.
  return element !== null &&
    element.namespaceURI === 'http://www.w3.org/1999/xhtml' &&
    typeof (element as HTMLElement).focus === 'function';
}

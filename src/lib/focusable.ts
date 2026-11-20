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

/** Read the current tab order, including CSS changes outside the panel's DOM. */
export function collectZdpTabbableElements(root: HTMLElement): HTMLElement[] {
  const eligible = collectComposedCandidates(root).filter(isZdpFocusableElement);
  return sortZdpTabbableElements(filterRadioGroupTabStops(eligible));
}

function collectComposedCandidates(root: HTMLElement): HTMLElement[] {
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

function filterRadioGroupTabStops(candidates: readonly HTMLElement[]): HTMLElement[] {
  type Group = { tabStop: HTMLInputElement; checked: boolean };
  const groups = new Map<Node, Map<HTMLFormElement | null, Map<string, Group>>>();
  const tabStops = new Set<HTMLElement>();
  // Rebuild on every lookup: checked and form ownership can change silently.
  for (const element of candidates) {
    if (!isRadioInput(element)) {
      tabStops.add(element);
      continue;
    }
    const name = element.name;
    if (name === '') {
      tabStops.add(element);
      continue;
    }
    const tree = element.getRootNode();
    let forms = groups.get(tree);
    if (forms === undefined) {
      forms = new Map();
      groups.set(tree, forms);
    }
    const form = element.form;
    let names = forms.get(form);
    if (names === undefined) {
      names = new Map();
      forms.set(form, names);
    }
    const group = names.get(name);
    if (group === undefined) {
      names.set(name, { tabStop: element, checked: element.checked });
      tabStops.add(element);
    } else if (!group.checked && element.checked) {
      tabStops.delete(group.tabStop);
      tabStops.add(element);
      group.tabStop = element;
      group.checked = true;
    }
  }
  // Preserve candidate order, including ties in the later tabindex sort.
  return candidates.filter((element) => tabStops.has(element));
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

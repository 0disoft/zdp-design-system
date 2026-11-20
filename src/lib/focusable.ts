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

  if (typeof element.checkVisibility === 'function') {
    // Skipped content can retain client rects, including inside closed details.
    return element.checkVisibility({ visibilityProperty: true, checkVisibilityCSS: true });
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
  const { scope, eligible } = collectFocusScopes(root);
  const tabStops = resolveRadioGroupTabStops(eligible);
  const ordered: HTMLElement[] = [];
  appendFocusScope(scope, tabStops, ordered);
  return ordered;
}

interface FocusScopeEntry {
  target: HTMLElement | null;
  priority: number;
  children: FocusScopeEntry[] | null;
}

function collectFocusScopes(root: HTMLElement) {
  const scope: FocusScopeEntry[] = [];
  const eligible: HTMLElement[] = [];
  const visited = new Set<Element>();
  function visit(element: Element, currentScope: FocusScopeEntry[]): void {
    if (visited.has(element)) return;
    visited.add(element);

    const html = isZdpHtmlElement(element) ? element : null;
    const slot = html?.tagName === 'SLOT' ? html as HTMLSlotElement : null;
    const scopedChildren = element.shadowRoot?.children ?? (
      slot ? (slot.assignedNodes().length > 0 ? slot.assignedElements() : slot.children) : null
    );
    if (scopedChildren && html?.hasAttribute('tabindex') && html.tabIndex < 0) return;

    const target = html?.matches(zdpFocusableSelector) && isZdpFocusableElement(html) ? html : null;
    if (target) eligible.push(target);

    const children: FocusScopeEntry[] | null = scopedChildren ? [] : null;
    if (target || children) {
      const tabIndex = html?.tabIndex ?? 0;
      currentScope.push({ target, priority: tabIndex > 0 ? tabIndex : Infinity, children });
    }
    for (const child of scopedChildren ?? element.children) visit(child, children ?? currentScope);
  }
  for (const child of root.children) visit(child, scope);
  return { scope, eligible };
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

function resolveRadioGroupTabStops(candidates: readonly HTMLElement[]): Set<HTMLElement> {
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
  return tabStops;
}

function appendFocusScope(
  scope: readonly FocusScopeEntry[],
  tabStops: ReadonlySet<HTMLElement>,
  ordered: HTMLElement[]
): void {
  // Positive tabindex sorts within its own scope. Equal priority keeps DOM order.
  const entries = scope.filter(({ target, children }) => children || (target && tabStops.has(target)));
  entries.sort((left, right) => left.priority === right.priority ? 0 : left.priority - right.priority);
  for (const { target, children } of entries) {
    if (target && tabStops.has(target)) ordered.push(target);
    if (children) appendFocusScope(children, tabStops, ordered);
  }
}

function isZdpHtmlElement(element: Element | null): element is HTMLElement {
  // Adoption changes ownerDocument but preserves the element's original realm.
  return element !== null &&
    element.namespaceURI === 'http://www.w3.org/1999/xhtml' &&
    typeof (element as HTMLElement).focus === 'function';
}

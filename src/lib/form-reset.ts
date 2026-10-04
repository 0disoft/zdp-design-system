type FormControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

interface FormResetOptions<Control extends FormControl> {
  initialValue?: string;
  initialChecked?: boolean;
  onReset: (control: Control) => void;
}

interface FormOwnershipObserver {
  observer: MutationObserver;
  callbacks: Set<() => void>;
}

const ownershipObservers = new WeakMap<Node, FormOwnershipObserver>();

/** Share one observer per tree instead of observing the page once per input. */
function observeFormOwnership(root: Node, callback: () => void): () => void {
  const view = root.nodeType === 9 ? (root as Document).defaultView : root.ownerDocument?.defaultView;
  const Observer = view?.MutationObserver;
  if (!Observer) return () => {};
  let state = ownershipObservers.get(root);
  if (!state) {
    const callbacks = new Set<() => void>();
    const observer = new Observer(() => {
      for (const refresh of [...callbacks]) refresh();
    });
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['form', 'id'] });
    state = { observer, callbacks };
    ownershipObservers.set(root, state);
  }
  const subscription = state;
  subscription.callbacks.add(callback);
  return () => {
    subscription.callbacks.delete(callback);
    if (subscription.callbacks.size === 0) {
      subscription.observer.disconnect();
      ownershipObservers.delete(root);
    }
  };
}

/** Preserve native defaults and synchronize bindings after an uncancelled reset. */
export function syncZdpFormReset<Control extends FormControl>(
  control: Control,
  options: FormResetOptions<Control>
): { destroy: () => void } {
  function restoreDefaults(): void {
    if (options.initialChecked !== undefined && 'defaultChecked' in control) {
      const checked = control.checked;
      control.defaultChecked = options.initialChecked;
      control.checked = checked;
    }
    if (options.initialValue !== undefined) {
      if ('options' in control) {
        const selectedIndex = control.selectedIndex;
        for (const option of control.options) {
          option.defaultSelected = option.value === options.initialValue;
        }
        control.selectedIndex = selectedIndex;
      } else {
        const value = control.value;
        control.defaultValue = options.initialValue;
        control.value = value;
      }
    }
  }

  let active = true;
  restoreDefaults();
  // Hydration may remove SSR value/checked attributes later in this turn.
  queueMicrotask(() => { if (active) restoreDefaults(); });
  const timers = new Set<ReturnType<typeof setTimeout>>();
  // A listener on the form travels with it across shadow roots and documents.
  const roots = new Set<EventTarget>();
  let observedTree: Node | null = null;
  let stopObserving = () => {};
  const handledResets = new WeakSet<Event>();
  const handleReset = (event: Event): void => {
    // Shadow-root dispatch clears event.target after the listeners finish.
    const form = control.form;
    if (event.target !== form || form === null || handledResets.has(event)) return;
    handledResets.add(event);
    // Options can arrive or be replaced after mount. Set their defaults before
    // the native reset algorithm runs, while preserving a cancelled reset's value.
    if ('options' in control) restoreDefaults();
    // A task waits for native restoration and later listeners that cancel reset.
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (active && control.isConnected && !event.defaultPrevented && control.form === form) {
        options.onReset(control);
      }
    }, 0);
    timers.add(timer);
  };
  function refreshOwnership(): void {
    if (!active) return;
    const tree = control.getRootNode();
    const nextRoots = new Set<EventTarget>([
      control.ownerDocument, tree, ...(control.form ? [control.form] : [])
    ]);
    for (const root of roots) {
      if (!nextRoots.has(root)) {
        root.removeEventListener('reset', handleReset, true);
        roots.delete(root);
      }
    }
    for (const root of nextRoots) {
      if (!roots.has(root)) {
        root.addEventListener('reset', handleReset, true);
        roots.add(root);
      }
    }
    if (tree !== observedTree) {
      stopObserving();
      observedTree = tree;
      stopObserving = observeFormOwnership(tree, refreshOwnership);
    }
  }
  refreshOwnership();

  return {
    destroy() {
      active = false;
      stopObserving();
      for (const timer of timers) clearTimeout(timer);
      timers.clear();
      for (const root of roots) root.removeEventListener('reset', handleReset, true);
    }
  };
}

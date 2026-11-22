type FormControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

interface FormResetOptions<Control extends FormControl> {
  initialValue?: string | undefined;
  initialChecked?: boolean;
  onReset: (control: Control) => void;
}

interface FormOwnershipObserver {
  observer: MutationObserver;
  controls: Map<Element, Set<() => void>>;
  formIdsByControl: Map<Element, string>;
  controlsByFormId: Map<string, Set<Element>>;
}

const ownershipObservers = new WeakMap<Node, FormOwnershipObserver>();

interface TreeResetSubscription {
  order: number;
  callback: (event: Event) => void;
}

interface TreeResetState {
  controls: Map<Element, Set<TreeResetSubscription>>;
  listener: (event: Event) => void;
  nextOrder: number;
}

const treeResetStates = new WeakMap<EventTarget, TreeResetState>();

function dispatchTreeReset(controls: TreeResetState['controls'], event: Event): void {
  const target = event.target as HTMLFormElement | null;
  if (target?.localName !== 'form' || target.namespaceURI !== 'http://www.w3.org/1999/xhtml') return;
  // Use the native getter because a named form control can shadow "elements".
  const elements = Object.getOwnPropertyDescriptor(HTMLFormElement.prototype, 'elements')?.get
    ?.call(target) as HTMLFormControlsCollection | undefined;
  if (!elements) return;
  const subscriptions: TreeResetSubscription[] = [];
  for (const element of elements) {
    const registered = controls.get(element);
    if (registered) subscriptions.push(...registered);
  }
  subscriptions.sort((left, right) => left.order - right.order);
  for (const subscription of subscriptions) subscription.callback(event);
}

function subscribeTreeReset(root: EventTarget, control: FormControl, callback: (event: Event) => void): () => void {
  let state = treeResetStates.get(root);
  if (!state) {
    const controls: TreeResetState['controls'] = new Map();
    const listener = (event: Event) => dispatchTreeReset(controls, event);
    state = { controls, listener, nextOrder: 0 };
    treeResetStates.set(root, state);
    root.addEventListener('reset', listener, true);
  }
  const { controls, listener } = state;
  const subscriptions = controls.get(control) ?? new Set<TreeResetSubscription>();
  const subscription = { order: state.nextOrder++, callback };
  subscriptions.add(subscription);
  controls.set(control, subscriptions);
  return () => {
    subscriptions.delete(subscription);
    if (subscriptions.size === 0) controls.delete(control);
    if (controls.size === 0) {
      root.removeEventListener('reset', listener, true);
      treeResetStates.delete(root);
    }
  };
}

interface FormResetBatch {
  timer: ReturnType<typeof setTimeout>;
  callbacks: Set<() => void>;
}

const resetBatches = new WeakMap<Event, FormResetBatch>();

/** Wait for native reset once per event, while keeping each control cancellable. */
function afterFormReset(event: Event, callback: () => void): () => void {
  let batch = resetBatches.get(event);
  if (!batch) {
    const callbacks = new Set<() => void>();
    const timer = setTimeout(() => {
      resetBatches.delete(event);
      for (const run of callbacks) {
        try {
          run();
        } catch (error) {
          // Separate timers previously isolated callback failures. Preserve that
          // isolation and report the original error without skipping other inputs.
          queueMicrotask(() => { throw error; });
        }
      }
      callbacks.clear();
    }, 0);
    batch = { timer, callbacks };
    resetBatches.set(event, batch);
  }
  const pending = batch;
  pending.callbacks.add(callback);
  return () => {
    pending.callbacks.delete(callback);
    if (pending.callbacks.size === 0 && resetBatches.get(event) === pending) {
      clearTimeout(pending.timer);
      resetBatches.delete(event);
    }
  };
}

const formControlSelector = 'input, textarea, select';

function indexFormReference(state: FormOwnershipObserver, control: Element, id: string | null): void {
  const { formIdsByControl, controlsByFormId } = state;
  const previousId = formIdsByControl.get(control);
  if (previousId === id) return;
  if (previousId !== undefined) {
    const previousControls = controlsByFormId.get(previousId);
    previousControls?.delete(control);
    if (previousControls?.size === 0) controlsByFormId.delete(previousId);
    formIdsByControl.delete(control);
  }
  if (!id) return;
  const referencingControls = controlsByFormId.get(id) ?? new Set<Element>();
  referencingControls.add(control);
  controlsByFormId.set(id, referencingControls);
  formIdsByControl.set(control, id);
}

function refreshChangedOwnership(
  state: FormOwnershipObserver,
  records: readonly MutationRecord[]
): void {
  const { controls, controlsByFormId } = state;
  const changed = new Set<Element>();
  const changedIds = new Set<string>();
  const watchIds = controlsByFormId.size > 0;
  const selector = watchIds ? `${formControlSelector}, [id]` : formControlSelector;

  function markId(element: Element): void {
    if (!watchIds) return;
    // Named form controls can shadow properties and methods on the form.
    const id = Element.prototype.getAttribute.call(element, 'id');
    if (id) changedIds.add(id);
  }

  function mark(element: Element): void {
    if (controls.has(element)) changed.add(element);
    markId(element);
  }

  for (const record of records) {
    if (record.type === 'attributes') {
      const target = record.target as Element;
      if (record.attributeName === 'id') {
        if (!watchIds) continue;
        if (record.oldValue) changedIds.add(record.oldValue);
        markId(target);
      } else if (controls.has(target)) {
        changed.add(target);
      }
      continue;
    }
    for (const nodes of [record.addedNodes, record.removedNodes]) {
      for (const node of nodes) {
        if (node.nodeType !== 1) continue;
        const element = node as Element;
        mark(element);
        for (const candidate of element.querySelectorAll(selector)) mark(candidate);
      }
    }
  }
  // An earlier element with the same ID can shadow the referenced form.
  for (const id of changedIds) {
    for (const control of controlsByFormId.get(id) ?? []) changed.add(control);
  }
  for (const control of changed) {
    indexFormReference(state, control, control.getAttribute('form'));
    for (const refresh of controls.get(control) ?? []) refresh();
  }

}

/** Share one observer per tree instead of observing the page once per input. */
function observeFormOwnership(root: Node, control: FormControl, callback: () => void): () => void {
  const view = root.nodeType === 9 ? (root as Document).defaultView : root.ownerDocument?.defaultView;
  const Observer = view?.MutationObserver;
  if (!Observer) return () => {};
  let state = ownershipObservers.get(root);
  if (!state) {
    const controls: FormOwnershipObserver['controls'] = new Map();
    const observer = new Observer((records) => {
      refreshChangedOwnership(subscription, records);
    });
    const subscription = { observer, controls, formIdsByControl: new Map(), controlsByFormId: new Map() };
    observer.observe(root, { childList: true, subtree: true, attributeOldValue: true, attributeFilter: ['form', 'id'] });
    state = subscription;
    ownershipObservers.set(root, state);
  }
  const subscription = state;
  const { observer, controls } = subscription;
  const callbacks = controls.get(control) ?? new Set<() => void>();
  callbacks.add(callback);
  controls.set(control, callbacks);
  indexFormReference(subscription, control, control.getAttribute('form'));
  return () => {
    callbacks.delete(callback);
    if (callbacks.size === 0) {
      controls.delete(control);
      indexFormReference(subscription, control, null);
    }
    if (controls.size === 0) {
      observer.disconnect();
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
        let matched = false;
        for (const option of control.options) {
          option.defaultSelected = !matched && option.value === options.initialValue;
          matched ||= option.defaultSelected;
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
  const pendingResets = new Set<() => void>();
  const treeSubscriptions = new Map<EventTarget, () => void>();
  // A listener on the form travels with it across shadow roots and documents.
  let listenedForm: HTMLFormElement | null = null;
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
    const cancel = afterFormReset(event, () => {
      pendingResets.delete(cancel);
      if (active && control.isConnected && !event.defaultPrevented && control.form === form) {
        options.onReset(control);
      }
    });
    pendingResets.add(cancel);
  };
  function refreshOwnership(): void {
    if (!active) return;
    const tree = control.getRootNode();
    const form = control.form;
    const nextRoots = new Set<EventTarget>([control.ownerDocument, tree]);
    for (const [root, unsubscribe] of treeSubscriptions) {
      if (!nextRoots.has(root)) {
        unsubscribe();
        treeSubscriptions.delete(root);
      }
    }
    for (const root of nextRoots) {
      if (!treeSubscriptions.has(root)) {
        treeSubscriptions.set(root, subscribeTreeReset(root, control, handleReset));
      }
    }
    if (form !== listenedForm) {
      listenedForm?.removeEventListener('reset', handleReset, true);
      listenedForm = form;
      listenedForm?.addEventListener('reset', handleReset, true);
    }
    if (tree !== observedTree) {
      stopObserving();
      observedTree = tree;
      stopObserving = observeFormOwnership(tree, control, refreshOwnership);
    }
  }
  refreshOwnership();

  return {
    destroy() {
      active = false;
      stopObserving();
      for (const cancel of pendingResets) cancel();
      pendingResets.clear();
      for (const unsubscribe of treeSubscriptions.values()) unsubscribe();
      treeSubscriptions.clear();
      listenedForm?.removeEventListener('reset', handleReset, true);
      listenedForm = null;
    }
  };
}

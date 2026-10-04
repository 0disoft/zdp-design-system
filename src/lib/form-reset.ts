type FormControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

interface FormResetOptions<Control extends FormControl> {
  initialValue?: string;
  initialChecked?: boolean;
  onReset: (control: Control) => void;
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
  const roots = new Set<EventTarget>([control.ownerDocument, control.getRootNode()]);
  const handleReset = (event: Event): void => {
    // Shadow-root dispatch clears event.target after the listeners finish.
    const form = control.form;
    if (event.target !== form || form === null) return;
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
  for (const root of roots) root.addEventListener('reset', handleReset, true);

  return {
    destroy() {
      active = false;
      for (const timer of timers) clearTimeout(timer);
      timers.clear();
      for (const root of roots) root.removeEventListener('reset', handleReset, true);
    }
  };
}

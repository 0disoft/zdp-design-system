export type ZdpShortcutIntent =
  | 'search'
  | 'help'
  | 'escape'
  | 'open'
  | 'submit'
  | 'create'
  | 'edit'
  | 'filter'
  | 'next'
  | 'previous'
  | 'goHome'
  | 'goSettings';

export type ZdpShortcutRisk = 'safe' | 'confirm' | 'reserved';

export interface ZdpShortcutRecommendation {
  readonly intent: ZdpShortcutIntent;
  readonly keys: readonly string[];
  readonly risk: ZdpShortcutRisk;
  readonly scope: 'global' | 'focused-list' | 'focused-form' | 'sequence';
}

export interface ZdpShortcutGuardOptions {
  readonly allowTextEntryTarget?: boolean;
  readonly allowBrowserReservedShortcut?: boolean;
}

const textEntrySelector = [
  'input',
  'textarea',
  'select',
  '[contenteditable=""]',
  '[contenteditable="true"]',
  '[role="textbox"]',
  '[role="searchbox"]',
  '[role="combobox"]',
  '[role="spinbutton"]'
].join(',');

const reservedModifierKeys = new Set([
  'a',
  'c',
  'f',
  'l',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'v',
  'w',
  'x',
  'y',
  'z'
]);

const reservedFunctionKeys = new Set(['F5', 'F11', 'F12']);

export const zdpShortcutRecommendations = [
  { intent: 'search', keys: ['/'], risk: 'safe', scope: 'global' },
  { intent: 'help', keys: ['?'], risk: 'safe', scope: 'global' },
  { intent: 'escape', keys: ['Esc'], risk: 'safe', scope: 'global' },
  { intent: 'open', keys: ['Enter'], risk: 'safe', scope: 'focused-list' },
  { intent: 'previous', keys: ['ArrowUp'], risk: 'safe', scope: 'focused-list' },
  { intent: 'next', keys: ['ArrowDown'], risk: 'safe', scope: 'focused-list' },
  { intent: 'submit', keys: ['Mod', 'Enter'], risk: 'safe', scope: 'focused-form' },
  { intent: 'create', keys: ['N'], risk: 'safe', scope: 'global' },
  { intent: 'edit', keys: ['E'], risk: 'safe', scope: 'global' },
  { intent: 'filter', keys: ['F'], risk: 'safe', scope: 'global' },
  { intent: 'goHome', keys: ['G', 'H'], risk: 'safe', scope: 'sequence' },
  { intent: 'goSettings', keys: ['G', 'S'], risk: 'safe', scope: 'sequence' }
] as const satisfies readonly ZdpShortcutRecommendation[];

export const zdpShortcutReservedExamples = [
  'Ctrl+S',
  'Ctrl+P',
  'Ctrl+F',
  'Ctrl+R',
  'Ctrl+L',
  'Ctrl+T',
  'Ctrl+W',
  'Ctrl+A',
  'Ctrl+C',
  'Ctrl+V',
  'Ctrl+X',
  'Ctrl+Z',
  'Ctrl+Y',
  'Cmd+S',
  'Cmd+P',
  'Cmd+F',
  'Cmd+R',
  'Cmd+L',
  'Cmd+T',
  'Cmd+W',
  'Cmd+Q',
  'Alt+ArrowLeft',
  'Alt+ArrowRight',
  'F5',
  'F11',
  'F12',
  'Space',
  'Backspace'
] as const;

/**
 * mf:anchor zdp.design-system.shortcut-guard
 * purpose: Locate consumer-facing shortcut guard helpers for text entry, IME, and browser-reserved keys.
 * search: shortcut guard, IME, browser reserved shortcut, text entry, command palette
 * invariant: Visible shortcut hints stay separate from consumer-owned keydown dispatch.
 * risk: state
 */
export function isZdpTextEntryTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  return target.closest(textEntrySelector) !== null;
}

export function isZdpBrowserReservedShortcut(event: KeyboardEvent): boolean {
  if (reservedFunctionKeys.has(event.key)) {
    return true;
  }

  if (!event.ctrlKey && !event.metaKey && !event.altKey) {
    return event.key === ' ' || event.key === 'Spacebar' || event.key === 'Backspace';
  }

  if (event.altKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
    return true;
  }

  if (event.ctrlKey || event.metaKey) {
    return reservedModifierKeys.has(event.key.toLowerCase());
  }

  return false;
}

export function shouldZdpIgnoreShortcutEvent(
  event: KeyboardEvent,
  options: ZdpShortcutGuardOptions = {}
): boolean {
  if (event.defaultPrevented || event.isComposing || event.keyCode === 229) {
    return true;
  }

  if (!options.allowTextEntryTarget && isZdpTextEntryTarget(event.target)) {
    return true;
  }

  if (!options.allowBrowserReservedShortcut && isZdpBrowserReservedShortcut(event)) {
    return true;
  }

  return false;
}

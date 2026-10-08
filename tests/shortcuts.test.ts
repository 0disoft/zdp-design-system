import { expect, test } from 'bun:test';
import { shouldZdpIgnoreShortcutEvent } from '../src/lib/shortcuts';

test('ignores AltGraph character entry even when consumers allow reserved shortcuts', () => {
  const event = { key: '/', ctrlKey: true, altKey: true, metaKey: false,
    defaultPrevented: false, isComposing: false, keyCode: 0,
    getModifierState: (key: string) => key === 'AltGraph', composedPath: () => []
  } as unknown as KeyboardEvent;
  expect(shouldZdpIgnoreShortcutEvent(event)).toBe(true);
  expect(shouldZdpIgnoreShortcutEvent(event, { allowTextEntryTarget: true, allowBrowserReservedShortcut: true })).toBe(true);
  expect(shouldZdpIgnoreShortcutEvent({ ...event, getModifierState: () => false } as KeyboardEvent)).toBe(false);
});

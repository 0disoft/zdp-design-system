import type { ZdpComboboxOption } from './combobox.js';

type NavigationKey = 'ArrowDown' | 'ArrowUp';

/** Candidates are already enabled and ordered by the caller. Never modify them. */
export function resolveComboboxNavigation(
  key: NavigationKey,
  wasOpen: boolean,
  value: string,
  candidates: readonly ZdpComboboxOption[],
  activeId: string | null
): string | null {
  if (candidates.length === 0) return null;
  if (!wasOpen) {
    const selected = candidates.find(option => option.value === value);
    if (selected) return selected.id;
    return (key === 'ArrowUp' ? candidates[candidates.length - 1] : candidates[0])!.id;
  }
  const currentIndex = candidates.findIndex(option => option.id === activeId);
  if (currentIndex < 0) return (key === 'ArrowUp' ? candidates[candidates.length - 1] : candidates[0])!.id;
  const nextIndex = key === 'ArrowUp'
    ? (currentIndex - 1 + candidates.length) % candidates.length
    : (currentIndex + 1) % candidates.length;
  return candidates[nextIndex]?.id ?? activeId;
}

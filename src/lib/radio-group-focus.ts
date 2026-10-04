import { tick } from 'svelte';
import { getZdpActiveElement } from './focusable';

/** Capture before a render can remove or disable the focused radio. */
export function recoverZdpRadioGroupFocus(group: HTMLElement | null): void {
  if (group === null) return;
  const previous = getZdpActiveElement(group.ownerDocument);
  if (previous === null || !group.contains(previous) || previous.getAttribute('role') !== 'radio') return;
  void restoreFocus(group, previous);
}

async function restoreFocus(group: HTMLElement, previous: HTMLElement): Promise<void> {
  await tick();
  if (!group.isConnected) return;
  const document = group.ownerDocument;
  const focused = getZdpActiveElement(document);
  // Respect a consumer's deliberate focus move during the update.
  if (focused !== null && focused !== previous && focused !== document.body && focused !== document.documentElement) return;
  const target = previous.isConnected && group.contains(previous) && !previous.matches(':disabled')
    ? previous
    : group.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]:not(:disabled)') ?? group;
  if (focused !== target) target.focus();
}

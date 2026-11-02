import type { ZdpAccordionItem, ZdpAccordionMode } from './disclosure.js';

/** Retain user choices first, then add defaults only for newly introduced items. */
export function reconcileOpenIds(
  sourceItems: readonly ZdpAccordionItem[],
  currentMode: ZdpAccordionMode,
  currentOpenIds: readonly string[],
  previousItemIds: readonly string[]
): readonly string[] {
  const enabledIds = new Set(sourceItems.filter((item) => !item.disabled).map((item) => item.id));
  const previousIds = new Set(previousItemIds);
  const retainedOpenIds = currentOpenIds.filter((id) => enabledIds.has(id));
  const newDefaultOpenIds = sourceItems
    .filter((item) => item.open && !item.disabled && !previousIds.has(item.id))
    .map((item) => item.id);
  const reconciledOpenIds = [...new Set([...retainedOpenIds, ...newDefaultOpenIds])];

  return currentMode === 'single' ? reconciledOpenIds.slice(0, 1) : reconciledOpenIds;
}

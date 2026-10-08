<script lang="ts">
  import { untrack } from 'svelte';
  import Disclosure from './Disclosure.svelte';
  import type {
    ZdpAccordionItem,
    ZdpAccordionMode,
    ZdpDisclosureHeadingLevel
  } from '../disclosure';

  interface Props {
    items?: readonly ZdpAccordionItem[];
    mode?: ZdpAccordionMode;
    ariaLabel?: string;
    headingLevel?: ZdpDisclosureHeadingLevel | null;
    onOpenChange?: ((item: ZdpAccordionItem, open: boolean, openIds: readonly string[]) => void) | null;
  }

  const componentId = $props.id();
  let {
    items = [],
    mode = 'multiple',
    ariaLabel = 'Collapsed sections',
    headingLevel = 3,
    onOpenChange = null
  }: Props = $props();

  let openIds = $state<readonly string[]>(untrack(() => normalizeInitialOpenIds(items, mode)));
  let knownItemIds = $state<readonly string[]>(untrack(() => items.map((item) => item.id)));
  let itemStateSignature = $state(untrack(() => stateSignature(items, mode)));

  const nextItemStateSignature = $derived(stateSignature(items, mode));
  $effect.pre(() => {
    if (nextItemStateSignature === itemStateSignature) return;
    openIds = reconcileOpenIds(items, mode, openIds, knownItemIds);
    knownItemIds = items.map((item) => item.id);
    itemStateSignature = nextItemStateSignature;
  });

  function stateSignature(items: readonly ZdpAccordionItem[], mode: ZdpAccordionMode): string {
    return JSON.stringify([mode, items.map((item) => [item.id, item.open === true, item.disabled === true])]);
  }

  function normalizeInitialOpenIds(
    sourceItems: readonly ZdpAccordionItem[],
    currentMode: ZdpAccordionMode
  ): readonly string[] {
    const initialOpenIds = sourceItems.filter((item) => item.open && !item.disabled).map((item) => item.id);

    return currentMode === 'single' ? initialOpenIds.slice(0, 1) : initialOpenIds;
  }

  function reconcileOpenIds(
    sourceItems: readonly ZdpAccordionItem[],
    currentMode: ZdpAccordionMode,
    currentOpenIds: readonly string[],
    previousItemIds: readonly string[]
  ): readonly string[] {
    const enabledIds = new Set(sourceItems.filter((item) => !item.disabled).map((item) => item.id));
    const retainedOpenIds = currentOpenIds.filter((id) => enabledIds.has(id));
    const newDefaultOpenIds = sourceItems
      .filter((item) => item.open && !item.disabled && !previousItemIds.includes(item.id))
      .map((item) => item.id);
    const reconciledOpenIds = [...new Set([...retainedOpenIds, ...newDefaultOpenIds])];

    return currentMode === 'single' ? reconciledOpenIds.slice(0, 1) : reconciledOpenIds;
  }

  function isItemOpen(id: string): boolean {
    return openIds.includes(id);
  }

  function handleItemOpenChange(item: ZdpAccordionItem, nextOpen: boolean): void {
    if (item.disabled) {
      return;
    }

    const nextOpenIds = resolveNextOpenIds(item.id, nextOpen);
    openIds = nextOpenIds;
    onOpenChange?.(item, nextOpen, nextOpenIds);
  }

  function resolveNextOpenIds(itemId: string, nextOpen: boolean): readonly string[] {
    if (mode === 'single') {
      return nextOpen ? [itemId] : [];
    }

    if (nextOpen) {
      return openIds.includes(itemId) ? openIds : [...openIds, itemId];
    }

    return openIds.filter((id) => id !== itemId);
  }
</script>

<div class="zdp-accordion" role="list" aria-label={ariaLabel}>
  {#each items as item (item.id)}
    <div class="zdp-accordion__item" role="listitem">
      <Disclosure
        id={`zdp-accordion-${componentId}-${item.id}`}
        title={item.title}
        open={isItemOpen(item.id)}
        disabled={item.disabled ?? false}
        {headingLevel}
        onOpenChange={(nextOpen) => handleItemOpenChange(item, nextOpen)}
      >
        <p>{item.content}</p>
      </Disclosure>
    </div>
  {/each}
</div>

<style>
  .zdp-accordion {
    color: var(--zdp-color-ink-normal);
    display: grid;
    font-family: var(--zdp-font-family-sans);
    gap: var(--zdp-space-2);
    min-width: 0;
  }

  .zdp-accordion__item {
    min-width: 0;
  }
</style>

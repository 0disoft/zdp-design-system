<script lang="ts">
  import Disclosure from './Disclosure.svelte';
  import type {
    ZdpAccordionItem,
    ZdpAccordionMode,
    ZdpDisclosureHeadingLevel
  } from '../disclosure';

  export let items: readonly ZdpAccordionItem[] = [];
  export let mode: ZdpAccordionMode = 'multiple';
  export let ariaLabel = '접힌 목록';
  export let headingLevel: ZdpDisclosureHeadingLevel | null = 3;
  export let onOpenChange:
    | ((
        item: ZdpAccordionItem,
        open: boolean,
        openIds: readonly string[]
      ) => void)
    | null = null;

  let openIds: readonly string[] = [];
  let itemOpenSignature = '';

  $: nextItemOpenSignature = `${mode}|${items
    .map((item) => `${item.id}:${item.open === true}:${item.disabled === true}`)
    .join('|')}`;
  $: if (nextItemOpenSignature !== itemOpenSignature) {
    openIds = normalizeInitialOpenIds(items, mode);
    itemOpenSignature = nextItemOpenSignature;
  }

  function normalizeInitialOpenIds(
    sourceItems: readonly ZdpAccordionItem[],
    currentMode: ZdpAccordionMode
  ): readonly string[] {
    const initialOpenIds = sourceItems.filter((item) => item.open && !item.disabled).map((item) => item.id);

    return currentMode === 'single' ? initialOpenIds.slice(0, 1) : initialOpenIds;
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
        id={item.id}
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

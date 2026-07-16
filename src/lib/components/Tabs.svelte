<script lang="ts">
  import { toZdpDomId } from '../dom-id';

  interface TabItem {
    readonly id: string;
    readonly label: string;
    readonly disabled?: boolean;
  }

  interface Props {
    items?: readonly TabItem[];
    selectedId?: string | null;
    ariaLabel?: string;
    idPrefix?: string | null;
  }

  const componentId = $props.id();
  const fallbackIdPrefix = `zdp-tabs-${componentId}`;
  let {
    items = [],
    selectedId = $bindable(null),
    ariaLabel = 'Tabs',
    idPrefix = null
  }: Props = $props();

  const selectedItem = $derived(
    items.find((item) => item.id === selectedId && !item.disabled) ??
    items.find((item) => !item.disabled) ??
    null
  );
  const activeId = $derived(selectedItem?.id ?? '');

  function selectTab(item: TabItem): void {
    if (item.disabled) {
      return;
    }

    selectedId = item.id;
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      return;
    }

    const target = event.currentTarget as HTMLElement;
    const tabs = Array.from(target.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'));

    if (tabs.length === 0) {
      return;
    }

    event.preventDefault();

    const currentIndex = Math.max(
      0,
      tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true')
    );
    const nextIndex = getNextIndex(event.key, currentIndex, tabs.length);
    const nextTab = tabs[nextIndex];

    nextTab.focus();
    nextTab.click();
  }

  function getNextIndex(key: string, currentIndex: number, length: number): number {
    if (key === 'Home') {
      return 0;
    }

    if (key === 'End') {
      return length - 1;
    }

    if (key === 'ArrowLeft') {
      return (currentIndex - 1 + length) % length;
    }

    return (currentIndex + 1) % length;
  }

  const resolvedIdPrefix = $derived(toDomId(idPrefix ?? fallbackIdPrefix));

  function tabId(id: string): string {
    return `${resolvedIdPrefix}-tab-${toDomId(id)}`;
  }

  function panelId(id: string): string {
    return `${resolvedIdPrefix}-panel-${toDomId(id)}`;
  }

  function toDomId(id: string): string {
    return toZdpDomId(id, 'item');
  }
</script>

<div class="zdp-tabs">
  <div
    class="zdp-tabs__list"
    role="tablist"
    aria-label={ariaLabel}
    tabindex="-1"
    onkeydown={handleKeydown}
  >
    {#each items as item}
      <button
        class={`zdp-tabs__tab ${item.id === activeId ? 'zdp-tabs__tab--active' : ''}`}
        id={tabId(item.id)}
        type="button"
        role="tab"
        aria-selected={item.id === activeId}
        aria-controls={panelId(item.id)}
        tabindex={item.id === activeId ? 0 : -1}
        disabled={item.disabled}
        onclick={() => selectTab(item)}
      >
        {item.label}
      </button>
    {/each}
  </div>

  {#each items as item (item.id)}
    <div
      class="zdp-tabs__panel"
      id={panelId(item.id)}
      role="tabpanel"
      aria-labelledby={tabId(item.id)}
      tabindex={item.id === activeId ? 0 : undefined}
      hidden={item.id !== activeId}
    >
      {#if item.id === activeId && selectedItem}
        <!-- svelte-ignore slot_element_deprecated legacy let: slot contract remains public -->
        <slot selectedId={selectedItem.id} selectedItem={selectedItem} />
      {/if}
    </div>
  {/each}
</div>

<style>
  .zdp-tabs {
    display: grid;
    gap: var(--zdp-space-3);
    min-width: 0;
  }

  .zdp-tabs__list {
    align-items: center;
    border-bottom: 1px solid var(--zdp-color-line-subtle);
    display: flex;
    flex-wrap: wrap;
    gap: var(--zdp-space-1);
    min-width: 0;
  }

  .zdp-tabs__tab {
    align-items: center;
    background: transparent;
    border: 0;
    border-bottom: var(--zdp-control-border-width) solid transparent;
    border-radius: var(--zdp-control-radius) var(--zdp-control-radius) 0 0;
    color: var(--zdp-color-ink-muted);
    cursor: pointer;
    display: inline-flex;
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-control-size);
    font-weight: var(--zdp-font-weight-medium);
    justify-content: center;
    line-height: var(--zdp-type-control-line-height);
    min-height: var(--zdp-control-height-md);
    padding: 0 var(--zdp-space-3);
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-tabs__tab:hover:not(:disabled) {
    background: var(--zdp-color-surface-raised);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-tabs__tab--active {
    border-bottom-color: var(--zdp-color-accent-primary-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-tabs__tab:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-tabs__tab:disabled {
    cursor: not-allowed;
    opacity: 0.56;
  }

  .zdp-tabs__panel {
    background: var(--zdp-color-surface-panel);
    border: 1px solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    color: var(--zdp-color-ink-normal);
    display: grid;
    gap: var(--zdp-space-2);
    min-width: 0;
    padding: var(--zdp-space-4);
  }

  .zdp-tabs__panel[hidden] {
    display: none;
  }

  .zdp-tabs__panel:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }
</style>

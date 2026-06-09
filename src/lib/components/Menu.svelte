<script lang="ts" context="module">
  let nextMenuInstanceId = 0;
</script>

<script lang="ts">
  import { tick } from 'svelte';
  import type { ZdpMenuItem } from '../menu.ts';

  export let items: readonly ZdpMenuItem[] = [];
  export let open = false;
  export let triggerLabel = '메뉴';
  export let idPrefix: string | null = null;
  export let placement: 'top' | 'right' | 'bottom' | 'left' = 'bottom';
  export let align: 'start' | 'center' | 'end' = 'end';
  export let onOpenChange: ((open: boolean) => void) | null = null;
  export let onSelect: ((event: MouseEvent, item: ZdpMenuItem) => void) | null = null;

  const fallbackIdPrefix = `zdp-menu-${++nextMenuInstanceId}`;

  let rootElement: HTMLElement | null = null;
  let triggerElement: HTMLButtonElement | null = null;
  let panelElement: HTMLElement | null = null;
  let previousFocusElement: HTMLElement | null = null;
  let knownOpenState = false;
  let restoreFocusAfterClose = false;
  let focusIntent: 'first' | 'last' | 'current' = 'first';
  let activeItemId = '';

  $: enabledItems = items.filter((item) => !item.disabled);
  $: resolvedIdPrefix = toDomId(idPrefix ?? fallbackIdPrefix);
  $: triggerId = `${resolvedIdPrefix}-trigger`;
  $: panelId = `${resolvedIdPrefix}-panel`;
  $: activeItemId = resolveActiveItemId(activeItemId, enabledItems);

  $: if (open !== knownOpenState) {
    knownOpenState = open;

    if (open) {
      void handleMenuOpened();
    } else if (restoreFocusAfterClose) {
      restorePreviousFocus();
      restoreFocusAfterClose = false;
    }
  }

  function setOpen(nextOpen: boolean): void {
    if (open === nextOpen) {
      return;
    }

    open = nextOpen;
    onOpenChange?.(nextOpen);
  }

  function openMenu(nextFocusIntent: 'first' | 'last' | 'current' = 'first'): void {
    focusIntent = nextFocusIntent;
    setOpen(true);
  }

  function closeMenu(restoreFocus = true): void {
    restoreFocusAfterClose = restoreFocus;
    setOpen(false);
  }

  function handleTriggerClick(): void {
    if (open) {
      closeMenu(false);
      return;
    }

    openMenu('first');
  }

  function handleTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openMenu('first');
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu('last');
    }
  }

  async function handleMenuOpened(): Promise<void> {
    if (typeof document === 'undefined') {
      return;
    }

    const activeElement = document.activeElement;
    previousFocusElement = activeElement instanceof HTMLElement ? activeElement : triggerElement;

    if (focusIntent === 'first') {
      activeItemId = enabledItems[0]?.id ?? '';
    } else if (focusIntent === 'last') {
      activeItemId = enabledItems[enabledItems.length - 1]?.id ?? '';
    }

    await tick();

    focusActiveItem();
  }

  function restorePreviousFocus(): void {
    if (typeof document === 'undefined') {
      return;
    }

    const focusTarget = previousFocusElement ?? triggerElement;

    if (focusTarget !== null && document.contains(focusTarget)) {
      focusTarget.focus();
    }

    previousFocusElement = null;
  }

  function handleDocumentClick(event: MouseEvent): void {
    if (!open || rootElement?.contains(event.target as Node)) {
      return;
    }

    closeMenu(false);
  }

  function handlePanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key === 'Tab') {
      closeMenu(false);
      return;
    }

    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      return;
    }

    event.preventDefault();
    moveActiveItem(event.key);
  }

  function handleItemClick(event: MouseEvent, item: ZdpMenuItem): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    item.onclick?.(event, item);
    onSelect?.(event, item);
    closeMenu(!item.href);
  }

  function moveActiveItem(key: string): void {
    if (enabledItems.length === 0) {
      return;
    }

    const currentIndex = Math.max(
      0,
      enabledItems.findIndex((item) => item.id === activeItemId)
    );
    const nextIndex = getNextIndex(key, currentIndex, enabledItems.length);
    activeItemId = enabledItems[nextIndex]?.id ?? activeItemId;
    focusActiveItem();
  }

  function getNextIndex(key: string, currentIndex: number, length: number): number {
    if (key === 'Home') {
      return 0;
    }

    if (key === 'End') {
      return length - 1;
    }

    if (key === 'ArrowUp') {
      return (currentIndex - 1 + length) % length;
    }

    return (currentIndex + 1) % length;
  }

  function focusActiveItem(): void {
    const nextItem = Array.from(panelElement?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []).find(
      (element) => element.dataset.menuItemId === activeItemId
    );

    nextItem?.focus();
  }

  function resolveActiveItemId(currentId: string, availableItems: readonly ZdpMenuItem[]): string {
    if (availableItems.some((item) => item.id === currentId)) {
      return currentId;
    }

    return availableItems[0]?.id ?? '';
  }

  function resolvedRel(item: ZdpMenuItem): string | undefined {
    if (item.rel) {
      return item.rel;
    }

    return item.target === '_blank' ? 'noopener noreferrer' : undefined;
  }

  function toDomId(id: string): string {
    return id.trim().replace(/[^a-zA-Z0-9_-]+/g, '-') || 'menu';
  }
</script>

<svelte:document onclick={handleDocumentClick} />

<span
  class={`zdp-menu zdp-menu--${placement} zdp-menu--align-${align}`}
  data-open={open ? 'true' : 'false'}
  bind:this={rootElement}
>
  <button
    class="zdp-menu__trigger"
    id={triggerId}
    type="button"
    aria-label={triggerLabel}
    aria-haspopup="menu"
    aria-expanded={open}
    aria-controls={open ? panelId : undefined}
    bind:this={triggerElement}
    onclick={handleTriggerClick}
    onkeydown={handleTriggerKeydown}
  >
    <span class="zdp-menu__trigger-label">
      <slot name="trigger">{triggerLabel}</slot>
    </span>
    <span class="zdp-menu__trigger-mark" aria-hidden="true"></span>
  </button>

  {#if open}
    <div
      class="zdp-menu__panel"
      id={panelId}
      role="menu"
      aria-labelledby={triggerId}
      tabindex="-1"
      bind:this={panelElement}
      onkeydown={handlePanelKeydown}
    >
      {#each items as item (item.id)}
        {#if item.separatorBefore}
          <span class="zdp-menu__separator" role="separator" aria-hidden="true"></span>
        {/if}

        {#if item.href}
          <a
            class={`zdp-menu__item ${item.tone === 'danger' ? 'zdp-menu__item--danger' : ''}`}
            href={item.disabled ? undefined : item.href}
            target={item.target ?? undefined}
            rel={resolvedRel(item)}
            role="menuitem"
            aria-label={item.ariaLabel ?? undefined}
            aria-disabled={item.disabled ? 'true' : undefined}
            tabindex={item.id === activeItemId && !item.disabled ? 0 : -1}
            data-menu-item-id={item.id}
            onclick={(event) => handleItemClick(event, item)}
            onmouseenter={() => {
              if (!item.disabled) activeItemId = item.id;
            }}
          >
            {item.label}
          </a>
        {:else}
          <button
            class={`zdp-menu__item ${item.tone === 'danger' ? 'zdp-menu__item--danger' : ''}`}
            type="button"
            role="menuitem"
            aria-label={item.ariaLabel ?? undefined}
            disabled={item.disabled}
            tabindex={item.id === activeItemId && !item.disabled ? 0 : -1}
            data-menu-item-id={item.id}
            onclick={(event) => handleItemClick(event, item)}
            onmouseenter={() => {
              if (!item.disabled) activeItemId = item.id;
            }}
          >
            {item.label}
          </button>
        {/if}
      {/each}
    </div>
  {/if}
</span>

<style>
  .zdp-menu {
    align-self: start;
    display: inline-flex;
    justify-self: start;
    min-width: 0;
    position: relative;
    vertical-align: middle;
  }

  .zdp-menu__trigger {
    align-items: center;
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    color: var(--zdp-color-ink-normal);
    cursor: pointer;
    display: inline-flex;
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-control-size);
    font-weight: var(--zdp-font-weight-medium);
    gap: var(--zdp-space-2);
    justify-content: center;
    line-height: var(--zdp-type-control-line-height);
    min-height: var(--zdp-control-height-md);
    min-inline-size: 12rem;
    min-width: 12rem;
    padding: 0 var(--zdp-space-3);
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-menu__trigger:hover {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-menu__trigger:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-menu__trigger-label {
    min-width: 0;
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
  }

  .zdp-menu__trigger-mark {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
    justify-content: center;
    line-height: 1;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-menu__trigger-mark::before {
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid currentColor;
    content: '';
    display: inline-block;
    height: 0;
    width: 0;
  }

  .zdp-menu__panel {
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong);
    border-radius: var(--zdp-control-radius);
    color: var(--zdp-color-ink-normal);
    display: grid;
    font-family: var(--zdp-font-family-sans);
    gap: var(--zdp-space-1);
    inline-size: max-content;
    max-block-size: min(24rem, calc(100vh - var(--zdp-space-8)));
    max-inline-size: min(18rem, calc(100vw - var(--zdp-space-6)));
    min-inline-size: 12rem;
    overflow: auto;
    padding: var(--zdp-space-1);
    position: absolute;
    z-index: 40;
  }

  .zdp-menu__panel:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-menu__item {
    align-items: center;
    background: transparent;
    border: var(--zdp-control-border-width) solid transparent;
    border-radius: var(--zdp-control-radius);
    color: var(--zdp-color-ink-normal);
    cursor: pointer;
    display: flex;
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-control-size);
    gap: var(--zdp-space-2);
    line-height: var(--zdp-type-control-line-height);
    min-height: var(--zdp-control-height-sm);
    min-width: 0;
    padding: var(--zdp-space-1) var(--zdp-space-2);
    text-align: left;
    text-decoration-line: none;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-menu__item:hover:not(:disabled):not([aria-disabled="true"]),
  .zdp-menu__item:focus-visible {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-strong);
    outline: 0;
  }

  .zdp-menu__item--danger {
    color: var(--zdp-color-accent-danger);
  }

  .zdp-menu__item:disabled,
  .zdp-menu__item[aria-disabled="true"] {
    cursor: not-allowed;
    opacity: 0.56;
  }

  .zdp-menu__separator {
    border-block-start: 1px solid var(--zdp-color-line-subtle);
    display: block;
    margin: var(--zdp-space-1) 0;
  }

  .zdp-menu--top .zdp-menu__panel {
    bottom: calc(100% + var(--zdp-space-2));
  }

  .zdp-menu--right .zdp-menu__panel {
    left: calc(100% + var(--zdp-space-2));
    top: 0;
  }

  .zdp-menu--bottom .zdp-menu__panel {
    top: calc(100% + var(--zdp-space-2));
  }

  .zdp-menu--left .zdp-menu__panel {
    right: calc(100% + var(--zdp-space-2));
    top: 0;
  }

  .zdp-menu--align-start .zdp-menu__panel {
    left: 0;
  }

  .zdp-menu--align-center .zdp-menu__panel {
    left: 50%;
    translate: -50% 0;
  }

  .zdp-menu--align-end .zdp-menu__panel {
    right: 0;
  }

  .zdp-menu--right.zdp-menu--align-end .zdp-menu__panel,
  .zdp-menu--left.zdp-menu--align-end .zdp-menu__panel {
    bottom: 0;
    top: auto;
  }

  .zdp-menu--right.zdp-menu--align-center .zdp-menu__panel,
  .zdp-menu--left.zdp-menu--align-center .zdp-menu__panel {
    top: 50%;
    translate: 0 -50%;
  }

  .zdp-menu--bottom .zdp-menu__panel,
  .zdp-menu--top .zdp-menu__panel {
    inline-size: 100%;
  }
</style>

<!-- llmnav/1 module
id=zdp.design.menu.interaction
role=Render an accessible action menu with keyboard opening, enabled-item navigation, dismissal, and focus return.
owns=menu interaction state|menu item activation
excludes=authorization decisions|routing decisions
search=menu keyboard|menu dismissal|menu trigger
invariant=Disabled items do not participate in menu navigation or activation.
rel=workflow>zdp.design.focus.roving
rel=workflow>zdp.design.overlay.dismiss
stability=contract
-->

<script lang="ts">
  import { flushSync, onDestroy, tick } from 'svelte';
  import { DropdownMenu } from 'bits-ui';
  import { createZdpDismissLayer } from '../dismiss-layer';
  import { toZdpDomId } from '../dom-id';
  import { getZdpActiveElement } from '../focusable';
  import type { ZdpMenuItem } from '../menu';

  type Placement = 'top' | 'right' | 'bottom' | 'left';
  type Alignment = 'start' | 'center' | 'end';

  interface Props {
    items?: readonly ZdpMenuItem[];
    open?: boolean;
    triggerLabel?: string;
    idPrefix?: string | null;
    placement?: Placement;
    align?: Alignment;
    onOpenChange?: ((open: boolean) => void) | null;
    onSelect?: ((event: MouseEvent, item: ZdpMenuItem) => void) | null;
  }

  const componentId = $props.id();
  const fallbackIdPrefix = `zdp-menu-${componentId}`;
  let {
    items = [],
    open = $bindable(false),
    triggerLabel = 'Menu',
    idPrefix = null,
    placement = 'bottom',
    align = 'end',
    onOpenChange = null,
    onSelect = null
  }: Props = $props();

  let rootElement = $state<HTMLElement | null>(null);
  let triggerElement = $state<HTMLButtonElement | null>(null);
  let panelElement = $state<HTMLElement | null>(null);
  let previousFocusElement = $state<HTMLElement | null>(null);
  let knownOpenState = $state(false);
  let restoreFocusAfterClose = $state(false);
  let focusIntent = $state<'first' | 'last' | 'current'>('first');
  let activeItemId = $state('');
  let floatingGap = $state(0);
  let floatingDirection = $state<'ltr' | 'rtl'>('ltr');
  const dismissLayer = createZdpDismissLayer();

  const enabledItems = $derived(items.filter((item) => !item.disabled));
  const resolvedIdPrefix = $derived(toDomId(idPrefix ?? fallbackIdPrefix));
  const triggerId = $derived(`${resolvedIdPrefix}-trigger`);
  const panelId = $derived(`${resolvedIdPrefix}-panel`);

  $effect(() => {
    if (!open || !triggerElement) return;
    const style = triggerElement.ownerDocument.defaultView?.getComputedStyle(triggerElement);
    if (!style) return;
    // Read resolved pixels, so rem-based ZDP spacing remains the source of truth.
    floatingGap = Number.parseFloat(style.columnGap) || 0;
    floatingDirection = style.direction === 'rtl' ? 'rtl' : 'ltr';
  });

  $effect(() => {
    const panel = panelElement;
    const view = panel?.ownerDocument.defaultView;
    if (!open || !panel || !view) return;
    // Floating sizing can shorten the panel after the initial focus move.
    // Keep the current item visible without changing focus during a resize.
    const observer = new view.ResizeObserver(() => {
      const focused = getZdpActiveElement(panel.ownerDocument);
      if (focused && panel.contains(focused) && focused.getAttribute('role') === 'menuitem') {
        scrollItemIntoPanel(focused, panel);
      }
    });
    observer.observe(panel);
    return () => observer.disconnect();
  });

  $effect.pre(() => {
    activeItemId = resolveActiveItemId(activeItemId, enabledItems);
    const panel = panelElement;
    const focused = panel ? getZdpActiveElement(panel.ownerDocument) : null;
    if (open && panel && focused && panel.contains(focused) &&
      (focused === panel || !enabledItems.some((item) => item.id === focused.dataset.menuItemId))) {
      void recoverMenuFocus(panel, focused);
    }
  });

  $effect.pre(() => {
    dismissLayer.setActive(open, rootElement, {
      onEscape: () => closeMenu(),
      onOutsideClick: () => closeMenu(false)
    });
  });

  onDestroy(() => dismissLayer.destroy());

  $effect(() => {
    if (open === knownOpenState) {
      return;
    }

    knownOpenState = open;
    if (open) {
      void handleMenuOpened();
    } else if (restoreFocusAfterClose) {
      restorePreviousFocus();
      restoreFocusAfterClose = false;
    }
  });

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

  function handleFocusOut(event: FocusEvent): void {
    const target = event.relatedTarget;
    if (target && panelElement && !panelElement.contains(target as Node)) {
      // Dispose the Bits focus scope before the next focusin event so an
      // external consumer focus move is preserved instead of trapped.
      flushSync(() => closeMenu(false));
    }
  }

  function handleOutsidePointer(event: PointerEvent): void {
    if (event.composedPath().includes(triggerElement as EventTarget)) {
      event.preventDefault();
      return;
    }
    restoreFocusAfterClose = false;
  }

  function handleTriggerClick(): void {
    if (open) {
      closeMenu(false);
      return;
    }

    openMenu('first');
  }

  function handleTriggerKeydown(event: KeyboardEvent): void {
    if (event.isComposing || event.keyCode === 229) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
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

    const activeElement = getZdpActiveElement(rootElement?.ownerDocument ?? document);
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

    if (focusTarget?.isConnected) {
      focusTarget.focus();
    }

    previousFocusElement = null;
  }

  function handlePanelKeydown(event: KeyboardEvent, handleBitsKeydown: unknown): void {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Tab') {
      closeMenu(false);
      return;
    }

    if (event.isComposing || event.keyCode === 229) return;
    if (typeof handleBitsKeydown === 'function') handleBitsKeydown(event);
  }

  function handleTabExit(event: KeyboardEvent): void {
    if (event.isComposing || event.keyCode === 229) {
      event.stopImmediatePropagation();
      return;
    }
    if (event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey) return;
    // Preserve native document tab order instead of Bits' modal Tab loop.
    event.stopImmediatePropagation();
    flushSync(() => closeMenu(false));
    triggerElement?.focus();
  }

  function handleItemClick(event: MouseEvent, item: ZdpMenuItem): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    item.onclick?.(event, item);
    onSelect?.(event, item);
    closeMenu(!item.href || event.defaultPrevented || item.target === '_blank');
  }

  function focusActiveItem(): void {
    const nextItem = Array.from(panelElement?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []).find(
      (element) => element.dataset.menuItemId === activeItemId
    );

    (nextItem ?? panelElement)?.focus({ preventScroll: true });
    if (nextItem && panelElement) scrollItemIntoPanel(nextItem, panelElement);
  }

  function scrollItemIntoPanel(item: HTMLElement, panel: HTMLElement): void {
    const itemRect = item.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    if (itemRect.top < panelRect.top) panel.scrollTop -= panelRect.top - itemRect.top;
    else if (itemRect.bottom > panelRect.bottom) panel.scrollTop += itemRect.bottom - panelRect.bottom;
  }

  async function recoverMenuFocus(panel: HTMLElement, previous: HTMLElement): Promise<void> {
    await tick();
    if (!open || panelElement !== panel || !panel.isConnected) return;
    const document = panel.ownerDocument;
    const focused = getZdpActiveElement(document);
    // A removed or disabled control may leave focus on the document. Do not
    // override a consumer moving focus to another control during this update.
    if (focused !== previous && focused !== document.body && focused !== document.documentElement) return;
    focusActiveItem();
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
    return toZdpDomId(id, fallbackIdPrefix);
  }
</script>

<DropdownMenu.Root bind:open dir={floatingDirection} onOpenChange={(nextOpen) => onOpenChange?.(nextOpen)}>
<span
  class={`zdp-menu zdp-menu--${placement} zdp-menu--align-${align}`}
  data-open={open ? 'true' : 'false'}
  bind:this={rootElement}
>
  <DropdownMenu.Trigger id={triggerId} bind:ref={triggerElement}>
  {#snippet child({ props })}
  <button
    {...props}
    class="zdp-menu__trigger"
    id={triggerId}
    type="button"
    aria-label={triggerLabel}
    aria-haspopup="menu"
    aria-expanded={open}
    aria-controls={open ? panelId : undefined}
    bind:this={triggerElement}
    onclick={handleTriggerClick}
    onpointerdown={() => {}}
    onpointerup={() => {}}
    onkeydown={handleTriggerKeydown}
  >
    <span class="zdp-menu__trigger-label">
      <!-- svelte-ignore slot_element_deprecated legacy named slot contract remains public -->
      <slot name="trigger">{triggerLabel}</slot>
    </span>
    <span class="zdp-menu__trigger-mark" aria-hidden="true"></span>
  </button>
  {/snippet}
  </DropdownMenu.Trigger>

  {#if open}
    <DropdownMenu.Content
      id={panelId}
      side={placement}
      {align}
      sideOffset={floatingGap}
      collisionPadding={floatingGap}
      avoidCollisions={true}
      sticky="always"
      strategy="fixed"
      dir={floatingDirection}
      style="--zdp-menu-available-width:var(--bits-dropdown-menu-content-available-width);--zdp-menu-available-height:var(--bits-dropdown-menu-content-available-height);--zdp-menu-anchor-width:var(--bits-dropdown-menu-anchor-width);"
      bind:ref={panelElement}
      loop={true}
      trapFocus={false}
      preventScroll={false}
      escapeKeydownBehavior="ignore"
      interactOutsideBehavior="close"
      onInteractOutside={handleOutsidePointer}
      onOpenAutoFocus={(event) => event.preventDefault()}
      onCloseAutoFocus={(event) => event.preventDefault()}
      onFocusOutside={(event) => event.preventDefault()}
    >
    {#snippet child({ props, wrapperProps })}
    <div {...wrapperProps} class="zdp-menu__positioner">
    <div
      {...props}
      class="zdp-menu__panel"
      data-zdp-positioned
      id={panelId}
      role="menu"
      aria-labelledby={triggerId}
      tabindex="-1"
      bind:this={panelElement}
      onkeydown={(event) => handlePanelKeydown(event, props.onkeydown)}
      onkeydowncapture={handleTabExit}
      onfocusout={handleFocusOut}
    >
      {#each items as item (item.id)}
        {#if item.separatorBefore}
          <span class="zdp-menu__separator" role="separator" aria-hidden="true"></span>
        {/if}

        <DropdownMenu.Item disabled={item.disabled ?? false} textValue={item.label} closeOnSelect={false}>
        {#snippet child({ props: itemProps })}
        {#if item.href}
          <a
            {...itemProps}
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
            onfocus={() => {
              if (!item.disabled) activeItemId = item.id;
            }}
          >
            {item.label}
          </a>
        {:else}
          <button
            {...itemProps}
            class={`zdp-menu__item ${item.tone === 'danger' ? 'zdp-menu__item--danger' : ''}`}
            type="button"
            role="menuitem"
            aria-label={item.ariaLabel ?? undefined}
            disabled={item.disabled}
            tabindex={item.id === activeItemId && !item.disabled ? 0 : -1}
            data-menu-item-id={item.id}
            onclick={(event) => handleItemClick(event, item)}
            onfocus={() => {
              if (!item.disabled) activeItemId = item.id;
            }}
          >
            {item.label}
          </button>
        {/if}
        {/snippet}
        </DropdownMenu.Item>
      {/each}
    </div>
    </div>
    {/snippet}
    </DropdownMenu.Content>
  {/if}
</span>
</DropdownMenu.Root>

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
    background: var(--zdp-color-surface-raised);
    border: var(--zdp-control-border-width) solid transparent;
    border-radius: var(--zdp-control-radius);
    color: var(--zdp-color-ink-normal);
    cursor: pointer;
    display: inline-flex;
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-control-size);
    font-weight: var(--zdp-font-weight-medium);
    gap: var(--zdp-space-2);
    justify-content: space-between;
    line-height: var(--zdp-type-control-line-height);
    min-height: var(--zdp-control-height-md);
    min-inline-size: 12rem;
    min-width: 12rem;
    padding: 0 var(--zdp-control-padding-md);
    padding-inline-end: calc(var(--zdp-control-padding-md) - var(--zdp-control-border-width));
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-menu__trigger:hover {
    background: var(--zdp-color-accent-primary-soft);
    border-color: transparent;
    color: var(--zdp-color-ink-strong);
  }

  .zdp-menu__trigger:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-menu__trigger-label {
    flex: 1 1 auto;
    min-width: 0;
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
  }

  .zdp-menu__trigger-mark {
    align-items: center;
    color: var(--zdp-color-ink-muted);
    display: inline-flex;
    flex: 0 0 auto;
    justify-content: center;
    line-height: 1;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-menu__trigger-mark::before {
    background-color: currentColor;
    block-size: var(--zdp-control-indicator-size);
    content: '';
    display: inline-block;
    inline-size: var(--zdp-control-indicator-size);
    mask-image: var(--zdp-control-indicator-mask);
    mask-position: center;
    mask-repeat: no-repeat;
    mask-size: contain;
    -webkit-mask-image: var(--zdp-control-indicator-mask);
    -webkit-mask-position: center;
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-size: contain;
  }

  .zdp-menu__panel {
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid transparent;
    border-radius: var(--zdp-control-radius);
    color: var(--zdp-color-ink-normal);
    display: grid;
    font-family: var(--zdp-font-family-sans);
    gap: var(--zdp-space-1);
    inline-size: max-content;
    max-block-size: min(24rem, calc(var(--zdp-viewport-block) - var(--zdp-space-8)));
    max-inline-size: min(18rem, calc(var(--zdp-viewport-inline) - var(--zdp-space-6)));
    min-inline-size: 12rem;
    overflow: auto;
    padding: var(--zdp-space-1);
    position: absolute;
    z-index: var(--zdp-layer-floating);
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
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
    text-align: start;
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
    background: var(--zdp-color-accent-primary-soft);
    border-color: transparent;
    color: var(--zdp-color-ink-strong);
    outline: 0;
  }

  .zdp-menu__item--danger {
    color: var(--zdp-color-accent-danger);
  }

  .zdp-menu__item:disabled,
  .zdp-menu__item[aria-disabled="true"] {
    cursor: not-allowed;
    opacity: var(--zdp-control-disabled-opacity);
  }

  .zdp-menu__separator {
    border-block-start: 1px solid var(--zdp-color-line-subtle);
    display: block;
    margin: var(--zdp-space-1) 0;
  }

  @media (forced-colors: active) {
    .zdp-menu__trigger,
    .zdp-menu__panel,
    .zdp-menu__item {
      border-color: ButtonText;
    }

    .zdp-menu__trigger-mark::before {
      background-color: currentColor;
      color: ButtonText;
      forced-color-adjust: none;
    }
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

  .zdp-menu__positioner {
    z-index: var(--zdp-layer-floating);
  }

  .zdp-menu .zdp-menu__panel[data-zdp-positioned] {
    box-sizing: border-box;
    bottom: auto;
    inline-size: max-content;
    left: auto;
    max-block-size: min(24rem, var(--zdp-menu-available-height, calc(var(--zdp-viewport-block) - var(--zdp-space-8))));
    max-inline-size: min(18rem, var(--zdp-menu-available-width, calc(var(--zdp-viewport-inline) - var(--zdp-space-6))));
    min-inline-size: min(12rem, var(--zdp-menu-available-width, calc(var(--zdp-viewport-inline) - var(--zdp-space-6))));
    position: static;
    right: auto;
    top: auto;
    translate: none;
  }

  .zdp-menu--bottom .zdp-menu__panel[data-zdp-positioned],
  .zdp-menu--top .zdp-menu__panel[data-zdp-positioned] {
    inline-size: var(--zdp-menu-anchor-width, 100%);
  }
</style>

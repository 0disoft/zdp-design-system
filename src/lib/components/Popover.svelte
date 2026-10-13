<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import { Popover as BitsPopover } from 'bits-ui';
  import { createZdpDismissLayer } from '../dismiss-layer';
  import { toZdpDomId } from '../dom-id';
  import { getZdpActiveElement, hasZdpFocusMoved } from '../focusable';

  type Placement = 'top' | 'right' | 'bottom' | 'left';
  type Alignment = 'start' | 'center' | 'end';
  type PopoverRole = 'dialog' | 'group' | null;

  interface Props {
    open?: boolean;
    idPrefix?: string | null;
    placement?: Placement;
    align?: Alignment;
    labelledBy?: string | null;
    describedBy?: string | null;
    role?: PopoverRole;
    closeOnEscape?: boolean;
    closeOnOutside?: boolean;
    onOpenChange?: ((open: boolean) => void) | null;
  }

  const componentId = $props.id();
  const fallbackIdPrefix = `zdp-popover-${componentId}`;
  let {
    open = $bindable(false),
    idPrefix = null,
    placement = 'bottom',
    align = 'start',
    labelledBy = null,
    describedBy = null,
    role = 'dialog',
    closeOnEscape = true,
    closeOnOutside = true,
    onOpenChange = null
  }: Props = $props();

  let rootElement = $state<HTMLElement | null>(null);
  let triggerElement = $state<HTMLElement | null>(null);
  let floatingGap = $state(0);
  let floatingDirection = $state<'ltr' | 'rtl'>('ltr');
  let previousFocusElement = $state<HTMLElement | null>(null);
  let knownOpenState = $state(false);
  let restoreFocusAfterClose = $state<boolean | null>(null);
  const dismissLayer = createZdpDismissLayer();

  const resolvedIdPrefix = $derived(toDomId(idPrefix ?? fallbackIdPrefix));
  const triggerId = $derived(`${resolvedIdPrefix}-trigger`);
  const panelId = $derived(`${resolvedIdPrefix}-panel`);

  $effect(() => {
    if (!open || !triggerElement) return;
    const style = triggerElement.ownerDocument.defaultView?.getComputedStyle(triggerElement);
    if (!style) return;
    // Resolve rem-based spacing through CSS, as in Menu.
    floatingGap = Number.parseFloat(style.columnGap) || 0;
    floatingDirection = style.direction === 'rtl' ? 'rtl' : 'ltr';
  });

  $effect.pre(() => {
    const document = open ? rootElement?.ownerDocument : null;
    if (!document) return;
    // Bits 2 consumes Escape even with behavior="ignore". Subscribe before
    // its content mounts so IME and opt-out events reach the editor unchanged.
    const preserveEscape = (event: KeyboardEvent): void => {
      if (open && event.key === 'Escape' &&
        (event.isComposing || event.keyCode === 229 || !closeOnEscape)) {
        event.stopImmediatePropagation();
      }
    };
    document.addEventListener('keydown', preserveEscape);
    return () => document.removeEventListener('keydown', preserveEscape);
  });

  $effect(() => {
    if (open === knownOpenState) {
      return;
    }

    knownOpenState = open;
    if (open) {
      restoreFocusAfterClose = null;
      capturePreviousFocus();
    } else {
      if (restoreFocusAfterClose === true) restorePreviousFocus();
      restoreFocusAfterClose = null;
    }
  });

  $effect.pre(() => {
    const root = rootElement;
    if (open || restoreFocusAfterClose !== null || !root) return;
    const focused = getZdpActiveElement(root.getRootNode() as Document | ShadowRoot);
    const panel = root.querySelector('.zdp-popover__panel');
    if (focused && panel?.contains(focused)) {
      void restoreExternallyClosedFocus(root, focused, previousFocusElement);
    }
  });

  async function restoreExternallyClosedFocus(
    root: HTMLElement, previous: HTMLElement, returnTarget: HTMLElement | null
  ): Promise<void> {
    await tick();
    if (open || rootElement !== root || !root.isConnected) return;
    if (hasZdpFocusMoved(root, previous)) return;
    if (returnTarget?.isConnected) returnTarget.focus();
  }

  $effect.pre(() => {
    dismissLayer.setActive(open, rootElement, {
      closeOnEscape,
      closeOnOutside,
      onEscape: () => close(),
      onOutsideClick: () => close(false)
    });
  });

  onDestroy(() => dismissLayer.destroy());

  function setOpen(nextOpen: boolean): void {
    if (open === nextOpen) {
      return;
    }

    open = nextOpen;
    onOpenChange?.(nextOpen);
  }

  function toggle(): void {
    if (open) {
      close(false);
      return;
    }

    setOpen(true);
  }

  function close(restoreFocus = true): void {
    if (!open) return;
    restoreFocusAfterClose = restoreFocus;
    setOpen(false);
  }

  function capturePreviousFocus(): void {
    if (typeof document === 'undefined') {
      return;
    }

    previousFocusElement = getZdpActiveElement(rootElement?.ownerDocument ?? document);
  }

  function restorePreviousFocus(): void {
    if (typeof document === 'undefined') {
      return;
    }

    if (previousFocusElement?.isConnected) {
      previousFocusElement.focus();
    }

    previousFocusElement = null;
  }

  function toDomId(id: string): string {
    return toZdpDomId(id, fallbackIdPrefix);
  }
</script>

<BitsPopover.Root bind:open onOpenChange={(nextOpen) => onOpenChange?.(nextOpen)}>
<span
  class={`zdp-popover zdp-popover--${placement} zdp-popover--align-${align}`}
  data-open={open ? 'true' : 'false'}
  bind:this={rootElement}
>
  <span class="zdp-popover__trigger" id={triggerId} bind:this={triggerElement}>
    <!-- svelte-ignore slot_element_deprecated legacy named slot contract remains public -->
    <slot name="trigger" open={open} toggle={toggle} close={close} panelId={panelId} triggerId={triggerId} />
  </span>
  {#if open}
    <!-- ZDP owns shared dismissal ordering and custom slotted triggers. -->
    <BitsPopover.Content
      id={panelId}
      customAnchor={triggerElement}
      side={placement}
      {align}
      sideOffset={floatingGap}
      collisionPadding={floatingGap}
      avoidCollisions={true}
      sticky="always"
      strategy="fixed"
      dir={floatingDirection}
      style="--zdp-popover-available-width:var(--bits-popover-content-available-width);--zdp-popover-available-height:var(--bits-popover-content-available-height);"
      trapFocus={false}
      preventScroll={false}
      escapeKeydownBehavior="ignore"
      interactOutsideBehavior="ignore"
      onOpenAutoFocus={(event) => event.preventDefault()}
      onCloseAutoFocus={(event) => event.preventDefault()}
      onFocusOutside={(event) => event.preventDefault()}
    >
    {#snippet child({ props, wrapperProps })}
    <div {...wrapperProps} class="zdp-popover__positioner">
    <div
      {...props}
      class="zdp-popover__panel"
      data-zdp-positioned
      id={panelId}
      role={role ?? undefined}
      aria-labelledby={labelledBy ?? triggerId}
      aria-describedby={describedBy ?? undefined}
      tabindex="-1"
      onkeydown={() => { /* Keep native Tab order instead of Bits' panel loop. */ }}
    >
      <!-- svelte-ignore slot_element_deprecated legacy default slot contract remains public -->
      <slot open={open} close={close} panelId={panelId} triggerId={triggerId} />
    </div>
    </div>
    {/snippet}
    </BitsPopover.Content>
  {/if}
</span>
</BitsPopover.Root>

<style>
  .zdp-popover {
    display: inline-flex;
    min-width: 0;
    position: relative;
    vertical-align: middle;
  }

  .zdp-popover__trigger {
    display: inline-flex;
    column-gap: var(--zdp-space-2);
    min-width: 0;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-popover__panel {
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong);
    border-radius: var(--zdp-control-radius);
    color: var(--zdp-color-ink-normal);
    display: grid;
    font-family: var(--zdp-font-family-sans);
    gap: var(--zdp-space-3);
    inline-size: max-content;
    max-block-size: min(24rem, calc(var(--zdp-viewport-block) - var(--zdp-space-8)));
    max-inline-size: min(22rem, calc(var(--zdp-viewport-inline) - var(--zdp-space-6)));
    min-inline-size: 12rem;
    overflow: auto;
    padding: var(--zdp-space-3);
    position: absolute;
    z-index: var(--zdp-layer-floating);
  }

  .zdp-popover__panel:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-popover--top .zdp-popover__panel {
    bottom: calc(100% + var(--zdp-space-2));
  }

  .zdp-popover--right .zdp-popover__panel {
    left: calc(100% + var(--zdp-space-2));
    top: 0;
  }

  .zdp-popover--bottom .zdp-popover__panel {
    top: calc(100% + var(--zdp-space-2));
  }

  .zdp-popover--left .zdp-popover__panel {
    right: calc(100% + var(--zdp-space-2));
    top: 0;
  }

  .zdp-popover--top.zdp-popover--align-start .zdp-popover__panel,
  .zdp-popover--bottom.zdp-popover--align-start .zdp-popover__panel {
    left: 0;
  }

  .zdp-popover--top.zdp-popover--align-center .zdp-popover__panel,
  .zdp-popover--bottom.zdp-popover--align-center .zdp-popover__panel {
    left: 50%;
    translate: -50% 0;
  }

  .zdp-popover--top.zdp-popover--align-end .zdp-popover__panel,
  .zdp-popover--bottom.zdp-popover--align-end .zdp-popover__panel {
    right: 0;
  }

  .zdp-popover--right.zdp-popover--align-end .zdp-popover__panel,
  .zdp-popover--left.zdp-popover--align-end .zdp-popover__panel {
    bottom: 0;
    top: auto;
  }

  .zdp-popover--right.zdp-popover--align-center .zdp-popover__panel,
  .zdp-popover--left.zdp-popover--align-center .zdp-popover__panel {
    top: 50%;
    translate: 0 -50%;
  }

  .zdp-popover__positioner {
    z-index: var(--zdp-layer-floating);
  }

  .zdp-popover .zdp-popover__panel[data-zdp-positioned] {
    box-sizing: border-box;
    bottom: auto;
    left: auto;
    max-block-size: min(24rem, var(--zdp-popover-available-height, calc(var(--zdp-viewport-block) - var(--zdp-space-8))));
    max-inline-size: min(22rem, var(--zdp-popover-available-width, calc(var(--zdp-viewport-inline) - var(--zdp-space-6))));
    min-inline-size: min(12rem, var(--zdp-popover-available-width, calc(var(--zdp-viewport-inline) - var(--zdp-space-6))));
    position: static;
    right: auto;
    top: auto;
    translate: none;
  }
</style>

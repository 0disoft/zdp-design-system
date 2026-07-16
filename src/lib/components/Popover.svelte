<script lang="ts">
  import { toZdpDomId } from '../dom-id';
  import { getZdpActiveElement } from '../focusable';

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
  let previousFocusElement = $state<HTMLElement | null>(null);
  let knownOpenState = $state(false);
  let restoreFocusAfterClose = $state(false);

  const resolvedIdPrefix = $derived(toDomId(idPrefix ?? fallbackIdPrefix));
  const triggerId = $derived(`${resolvedIdPrefix}-trigger`);
  const panelId = $derived(`${resolvedIdPrefix}-panel`);

  $effect(() => {
    if (open === knownOpenState) {
      return;
    }

    knownOpenState = open;
    if (open) {
      capturePreviousFocus();
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

  function toggle(): void {
    if (open) {
      close(false);
      return;
    }

    setOpen(true);
  }

  function close(restoreFocus = true): void {
    restoreFocusAfterClose = restoreFocus;
    setOpen(false);
  }

  function capturePreviousFocus(): void {
    if (typeof document === 'undefined') {
      return;
    }

    const activeElement = getZdpActiveElement();
    previousFocusElement = activeElement instanceof HTMLElement ? activeElement : null;
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

  function handleDocumentClick(event: MouseEvent): void {
    if (!open || !closeOnOutside || (rootElement !== null && event.composedPath().includes(rootElement))) {
      return;
    }

    close(false);
  }

  function handleDocumentKeydown(event: KeyboardEvent): void {
    if (open && event.key === 'Escape' && closeOnEscape) {
      event.preventDefault();
      close();
    }
  }

  function toDomId(id: string): string {
    return toZdpDomId(id, 'popover');
  }
</script>

<svelte:document onclick={handleDocumentClick} onkeydown={handleDocumentKeydown} />

<span
  class={`zdp-popover zdp-popover--${placement} zdp-popover--align-${align}`}
  data-open={open ? 'true' : 'false'}
  bind:this={rootElement}
>
  <span class="zdp-popover__trigger" id={triggerId}>
    <!-- svelte-ignore slot_element_deprecated legacy named slot contract remains public -->
    <slot name="trigger" open={open} toggle={toggle} close={close} panelId={panelId} triggerId={triggerId} />
  </span>
  {#if open}
    <div
      class="zdp-popover__panel"
      id={panelId}
      role={role ?? undefined}
      aria-labelledby={labelledBy ?? triggerId}
      aria-describedby={describedBy ?? undefined}
      tabindex="-1"
    >
      <!-- svelte-ignore slot_element_deprecated legacy default slot contract remains public -->
      <slot open={open} close={close} panelId={panelId} triggerId={triggerId} />
    </div>
  {/if}
</span>

<style>
  .zdp-popover {
    display: inline-flex;
    min-width: 0;
    position: relative;
    vertical-align: middle;
  }

  .zdp-popover__trigger {
    display: inline-flex;
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

  .zdp-popover--align-start .zdp-popover__panel {
    left: 0;
  }

  .zdp-popover--align-center .zdp-popover__panel {
    left: 50%;
    translate: -50% 0;
  }

  .zdp-popover--align-end .zdp-popover__panel {
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
</style>

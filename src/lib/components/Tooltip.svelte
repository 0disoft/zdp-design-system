<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { positionZdpFloatingPanel } from '../floating-position.js';
  import { createZdpDismissLayer } from '../dismiss-layer.js';
  import { getZdpActiveElement } from '../focusable.js';

  type Placement = 'top' | 'right' | 'bottom' | 'left';

  interface Props {
    text: string;
    placement?: Placement;
    id?: string | null;
    disabled?: boolean;
  }

  const componentId = $props.id();
  const fallbackId = `zdp-tooltip-${componentId}`;
  let { text, placement = 'top', id = null, disabled = false }: Props = $props();

  let rootElement = $state<HTMLElement | null>(null);
  let contentElement = $state<HTMLElement | null>(null);
  let dismissed = $state(false);
  let pointerInside = $state(false);
  let focusInside = $state(false);
  let pointerLeaveTimer: ReturnType<typeof setTimeout> | null = null;
  let focusSyncQueued = false;
  const dismissLayer = createZdpDismissLayer();

  const tooltipId = $derived(id ?? fallbackId);
  const hasContent = $derived(text.trim().length > 0);
  const describedBy = $derived(disabled || !hasContent ? null : tooltipId);
  const visible = $derived(!disabled && hasContent && !dismissed && (pointerInside || focusInside));

  $effect(() => {
    if (!visible || !rootElement || !contentElement) return;
    const positioning = positionZdpFloatingPanel(contentElement, {
      anchor: rootElement, gapSource: rootElement, prefix: 'tooltip', placement: `${placement}-start`
    });
    return () => positioning.destroy();
  });

  $effect.pre(() => {
    dismissLayer.setActive(visible, rootElement, {
      closeOnOutside: false,
      ignoreOutside: true,
      onEscape: () => (dismissed = true)
    });
  });

  onDestroy(() => {
    clearPointerLeaveTimer();
    dismissLayer.destroy();
  });

  onMount(() => {
    const root = rootElement;

    if (!root) {
      return;
    }

    root.addEventListener('mouseenter', handleMouseenter);
    root.addEventListener('mouseleave', handleMouseleave);
    root.addEventListener('focusin', handleFocusin);
    root.addEventListener('focusout', handleFocusout);
    scheduleFocusSync();

    return () => {
      root.removeEventListener('mouseenter', handleMouseenter);
      root.removeEventListener('mouseleave', handleMouseleave);
      root.removeEventListener('focusin', handleFocusin);
      root.removeEventListener('focusout', handleFocusout);
    };
  });

  function handleMouseenter(): void {
    clearPointerLeaveTimer();
    pointerInside = true;
    dismissed = false;
  }

  function handleMouseleave(): void {
    clearPointerLeaveTimer();
    // Keep the label available while crossing the gap to its content.
    pointerLeaveTimer = setTimeout(() => {
      pointerLeaveTimer = null;
      pointerInside = false;
      if (!focusInside) dismissed = false;
    }, 200);
  }

  function clearPointerLeaveTimer(): void {
    if (pointerLeaveTimer !== null) {
      clearTimeout(pointerLeaveTimer);
      pointerLeaveTimer = null;
    }
  }

  function handleFocusin(): void {
    scheduleFocusSync();
  }

  function handleFocusout(): void {
    scheduleFocusSync();
  }

  function scheduleFocusSync(): void {
    if (focusSyncQueued) return;
    focusSyncQueued = true;
    const root = rootElement;
    // Focus events can fire synchronously while Svelte replaces slot content.
    queueMicrotask(() => {
      focusSyncQueued = false;
      if (!root || rootElement !== root || !root.isConnected) return;
      const focused = getZdpActiveElement(root.getRootNode() as Document | ShadowRoot);
      focusInside = focused !== null && root.contains(focused);
      if (!pointerInside) dismissed = false;
    });
  }
</script>

<span
  class={`zdp-tooltip zdp-tooltip--${placement}`}
  data-disabled={disabled ? 'true' : undefined}
  data-dismissed={dismissed ? 'true' : undefined}
  data-visible={visible ? 'true' : 'false'}
  bind:this={rootElement}
>
  <span class="zdp-tooltip__trigger">
    <!-- svelte-ignore slot_element_deprecated legacy default slot contract remains public -->
    <slot describedBy={describedBy} />
  </span>
  {#if !disabled && hasContent}
    <span
      id={tooltipId}
      class="zdp-tooltip__content"
      role="tooltip"
      bind:this={contentElement}
    >
      {text}
    </span>
  {/if}
</span>

<style>
  .zdp-tooltip {
    column-gap: var(--zdp-space-2);
    display: inline-flex;
    min-width: 0;
    position: relative;
    vertical-align: middle;
  }

  .zdp-tooltip__trigger {
    display: inline-flex;
    min-width: 0;
  }

  .zdp-tooltip__content {
    display: none;
    background: var(--zdp-color-ink-strong);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong);
    border-radius: var(--zdp-control-radius);
    bottom: var(--zdp-tooltip-bottom, auto);
    color: var(--zdp-color-surface-panel);
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-caption-size);
    left: var(--zdp-tooltip-left, auto);
    line-height: var(--zdp-type-caption-line-height);
    opacity: 0;
    padding: var(--zdp-space-1) var(--zdp-space-2);
    pointer-events: none;
    position: absolute;
    right: var(--zdp-tooltip-right, auto);
    top: var(--zdp-tooltip-top, auto);
    transform: var(--zdp-tooltip-transform, none);
    -webkit-user-select: none;
    user-select: none;
    box-sizing: border-box;
    width: max-content;
    max-inline-size: min(22rem, var(--zdp-tooltip-available-width, calc(var(--zdp-viewport-inline) - var(--zdp-space-4))));
    max-block-size: var(--zdp-tooltip-available-height, none);
    overflow: auto;
    overflow-wrap: anywhere;
    white-space: normal;
    z-index: var(--zdp-layer-floating);
  }

  .zdp-tooltip--top {
    --zdp-tooltip-bottom: calc(100% + var(--zdp-space-2));
    --zdp-tooltip-left: 0;
    --zdp-tooltip-right: auto;
    --zdp-tooltip-top: auto;
    --zdp-tooltip-transform: none;
  }

  .zdp-tooltip--top .zdp-tooltip__content {
    bottom: var(--zdp-tooltip-bottom);
    left: var(--zdp-tooltip-left);
  }

  .zdp-tooltip--right {
    --zdp-tooltip-bottom: auto;
    --zdp-tooltip-left: calc(100% + var(--zdp-space-2));
    --zdp-tooltip-right: auto;
    --zdp-tooltip-top: 0;
    --zdp-tooltip-transform: none;
  }

  .zdp-tooltip--right .zdp-tooltip__content {
    left: var(--zdp-tooltip-left);
    top: var(--zdp-tooltip-top);
  }

  .zdp-tooltip--bottom {
    --zdp-tooltip-bottom: auto;
    --zdp-tooltip-left: 0;
    --zdp-tooltip-right: auto;
    --zdp-tooltip-top: calc(100% + var(--zdp-space-2));
    --zdp-tooltip-transform: none;
  }

  .zdp-tooltip--bottom .zdp-tooltip__content {
    left: var(--zdp-tooltip-left);
    top: var(--zdp-tooltip-top);
  }

  .zdp-tooltip--left {
    --zdp-tooltip-bottom: auto;
    --zdp-tooltip-left: auto;
    --zdp-tooltip-right: calc(100% + var(--zdp-space-2));
    --zdp-tooltip-top: 0;
    --zdp-tooltip-transform: none;
  }

  .zdp-tooltip--left .zdp-tooltip__content {
    right: var(--zdp-tooltip-right);
    top: var(--zdp-tooltip-top);
  }

  .zdp-tooltip:hover .zdp-tooltip__content,
  .zdp-tooltip:focus-within .zdp-tooltip__content,
  .zdp-tooltip[data-visible="true"] .zdp-tooltip__content {
    display: block;
    opacity: 1;
    pointer-events: auto;
  }

  .zdp-tooltip[data-dismissed="true"] .zdp-tooltip__content {
    display: none;
    opacity: 0;
    pointer-events: none;
  }

  .zdp-tooltip[data-disabled="true"] {
    cursor: default;
  }
</style>

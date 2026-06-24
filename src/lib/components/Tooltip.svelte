<script context="module" lang="ts">
  let tooltipIdCounter = 0;
</script>

<script lang="ts">
  import { onMount } from 'svelte';

  export let text: string;
  export let placement: 'top' | 'right' | 'bottom' | 'left' = 'top';
  export let id: string | null = null;
  export let disabled = false;

  let rootElement: HTMLElement | null = null;
  const fallbackId = `zdp-tooltip-${++tooltipIdCounter}`;

  let dismissed = false;
  let pointerInside = false;

  $: tooltipId = id ?? fallbackId;
  $: describedBy = disabled ? null : tooltipId;

  onMount(() => {
    const root = rootElement;

    if (!root) {
      return;
    }

    root.addEventListener('mouseenter', handleMouseenter);
    root.addEventListener('mouseleave', handleMouseleave);
    root.addEventListener('focusin', handleFocusin);
    root.addEventListener('focusout', handleFocusout);
    root.addEventListener('keydown', handleKeydown);

    return () => {
      root.removeEventListener('mouseenter', handleMouseenter);
      root.removeEventListener('mouseleave', handleMouseleave);
      root.removeEventListener('focusin', handleFocusin);
      root.removeEventListener('focusout', handleFocusout);
      root.removeEventListener('keydown', handleKeydown);
    };
  });

  function handleMouseenter(): void {
    pointerInside = true;
    dismissed = false;
  }

  function handleMouseleave(): void {
    pointerInside = false;
    dismissed = false;
  }

  function handleFocusin(): void {
    if (!pointerInside) {
      dismissed = false;
    }
  }

  function handleFocusout(): void {
    if (!pointerInside) {
      dismissed = false;
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || disabled) {
      return;
    }

    dismissed = true;

    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }
</script>

<span
  class={`zdp-tooltip zdp-tooltip--${placement}`}
  data-disabled={disabled ? 'true' : undefined}
  data-dismissed={dismissed ? 'true' : undefined}
  bind:this={rootElement}
>
  <span class="zdp-tooltip__trigger">
    <slot describedBy={describedBy} />
  </span>
  {#if !disabled}
    <span
      id={tooltipId}
      class="zdp-tooltip__content"
      role="tooltip"
    >
      {text}
    </span>
  {/if}
</span>

<style>
  .zdp-tooltip {
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
    white-space: nowrap;
    z-index: 30;
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
  .zdp-tooltip:focus-within .zdp-tooltip__content {
    opacity: 1;
  }

  .zdp-tooltip[data-dismissed="true"] .zdp-tooltip__content {
    opacity: 0;
  }

  .zdp-tooltip[data-disabled="true"] {
    cursor: default;
  }
</style>

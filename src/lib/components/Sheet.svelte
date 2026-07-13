<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import { isZdpFocusableElement, zdpFocusableSelector } from '../focusable';
  import { createZdpModalLayer } from '../modal-layer';
  import type { ZdpSheetPlacement, ZdpSheetSize } from '../sheet';

  export let open = false;
  export let id: string | null = null;
  export let labelledBy: string;
  export let describedBy: string | null = null;
  export let placement: ZdpSheetPlacement = 'right';
  export let size: ZdpSheetSize = 'md';
  export let closeLabel = 'Close';
  export let closeOnEscape = true;
  export let closeOnBackdrop = true;
  export let onClose: (() => void) | null = null;

  let layerElement: HTMLDivElement | null = null;
  let panelElement: HTMLDivElement | null = null;
  let previousFocusElement: HTMLElement | null = null;
  let wasOpen = false;
  const modalLayer = createZdpModalLayer();

  $: {
    modalLayer.setActive(open, layerElement);

    if (open && !wasOpen) {
      wasOpen = true;
      void handleSheetOpened();
    } else if (!open && wasOpen) {
      wasOpen = false;
      restorePreviousFocus();
    }
  }

  onDestroy(() => {
    modalLayer.destroy();
  });

  async function handleSheetOpened(): Promise<void> {
    if (typeof document !== 'undefined') {
      const activeElement = document.activeElement;
      previousFocusElement = activeElement instanceof HTMLElement ? activeElement : null;
      modalLayer.setFocusReturnTarget(previousFocusElement);
    }

    await tick();

    const firstFocusableElement = getFocusableElements()[0];
    (firstFocusableElement ?? panelElement)?.focus();
  }

  function requestClose(): void {
    open = false;
    onClose?.();
  }

  function restorePreviousFocus(): void {
    const focusReturnTarget = modalLayer.takeFocusReturnTarget();

    if (focusReturnTarget !== null && document.contains(focusReturnTarget)) {
      focusReturnTarget.focus();
    }

    previousFocusElement = null;
  }

  function handleBackdropClick(): void {
    if (closeOnBackdrop) {
      requestClose();
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && closeOnEscape) {
      event.preventDefault();
      requestClose();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusableElements = getFocusableElements();

    if (focusableElements.length === 0) {
      event.preventDefault();
      panelElement?.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  function getFocusableElements(): HTMLElement[] {
    if (panelElement === null) {
      return [];
    }

    return Array.from(panelElement.querySelectorAll<HTMLElement>(zdpFocusableSelector)).filter(isZdpFocusableElement);
  }
</script>

{#if open}
  <div class="zdp-sheet-layer" bind:this={layerElement}>
    <button
      class="zdp-sheet__backdrop"
      type="button"
      aria-label={closeLabel}
      tabindex="-1"
      onclick={handleBackdropClick}
    ></button>
    <div
      class={`zdp-sheet zdp-sheet--${placement} zdp-sheet--${size}`}
      id={id ?? undefined}
      bind:this={panelElement}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy ?? undefined}
      data-zdp-sheet-placement={placement}
      data-zdp-sheet-size={size}
      data-zdp-sheet-surface="sheet"
      tabindex="-1"
      onkeydown={handleKeydown}
    >
      <header class="zdp-sheet__header">
        <div class="zdp-sheet__title">
          <slot name="title" />
        </div>
        <button class="zdp-sheet__close" type="button" aria-label={closeLabel} onclick={requestClose}>
          <span aria-hidden="true">×</span>
        </button>
      </header>
      <div class="zdp-sheet__body">
        <slot />
      </div>
      <div class="zdp-sheet__footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
{/if}

<style>
  .zdp-sheet-layer {
    inset: 0;
    position: fixed;
    z-index: calc(var(--zdp-layer-dialog) + var(--zdp-modal-layer-offset, 0));
  }

  .zdp-sheet__backdrop {
    background: var(--zdp-color-backdrop-sheet);
    border: 0;
    cursor: pointer;
    inset: 0;
    margin: 0;
    padding: 0;
    position: fixed;
    z-index: var(--zdp-layer-sheet);
  }

  .zdp-sheet {
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong);
    box-sizing: border-box;
    color: var(--zdp-color-ink-normal);
    display: grid;
    font-family: var(--zdp-font-family-sans);
    gap: var(--zdp-space-4);
    max-block-size: calc(var(--zdp-viewport-block) - var(--zdp-space-6) - var(--zdp-viewport-safe-block-start) - var(--zdp-viewport-safe-block-end));
    min-width: 0;
    overflow: auto;
    padding-block: var(--zdp-space-5) max(var(--zdp-space-5), var(--zdp-viewport-safe-block-end));
    padding-inline: max(var(--zdp-space-5), var(--zdp-viewport-safe-inline-start)) max(var(--zdp-space-5), var(--zdp-viewport-safe-inline-end));
    position: fixed;
    z-index: calc(var(--zdp-layer-sheet) + 1);
  }

  .zdp-sheet--right,
  .zdp-sheet--left {
    block-size: calc(var(--zdp-viewport-block) - var(--zdp-space-6) - var(--zdp-viewport-safe-block-start) - var(--zdp-viewport-safe-block-end));
    border-radius: var(--zdp-control-radius);
    inset-block: max(var(--zdp-space-3), var(--zdp-viewport-safe-block-start)) max(var(--zdp-space-3), var(--zdp-viewport-safe-block-end));
  }

  .zdp-sheet--right {
    inset-inline-end: max(var(--zdp-space-3), var(--zdp-viewport-safe-inline-end));
  }

  .zdp-sheet--left {
    inset-inline-start: max(var(--zdp-space-3), var(--zdp-viewport-safe-inline-start));
  }

  .zdp-sheet--bottom {
    border-end-end-radius: 0;
    border-end-start-radius: 0;
    border-radius: var(--zdp-control-radius) var(--zdp-control-radius) 0 0;
    inset-block-end: 0;
    inset-inline: 0;
    max-block-size: min(34rem, calc(var(--zdp-viewport-block) - var(--zdp-space-6) - var(--zdp-viewport-safe-block-start) - var(--zdp-viewport-safe-block-end)));
  }

  .zdp-sheet--sm {
    inline-size: min(24rem, calc(var(--zdp-viewport-inline) - var(--zdp-space-6) - var(--zdp-viewport-safe-inline-start) - var(--zdp-viewport-safe-inline-end)));
  }

  .zdp-sheet--md {
    inline-size: min(30rem, calc(var(--zdp-viewport-inline) - var(--zdp-space-6) - var(--zdp-viewport-safe-inline-start) - var(--zdp-viewport-safe-inline-end)));
  }

  .zdp-sheet--lg {
    inline-size: min(38rem, calc(var(--zdp-viewport-inline) - var(--zdp-space-6) - var(--zdp-viewport-safe-inline-start) - var(--zdp-viewport-safe-inline-end)));
  }

  .zdp-sheet--bottom.zdp-sheet--sm,
  .zdp-sheet--bottom.zdp-sheet--md,
  .zdp-sheet--bottom.zdp-sheet--lg {
    inline-size: auto;
  }

  .zdp-sheet--bottom.zdp-sheet--lg {
    max-block-size: min(42rem, calc(var(--zdp-viewport-block) - var(--zdp-space-6) - var(--zdp-viewport-safe-block-start) - var(--zdp-viewport-safe-block-end)));
  }

  .zdp-sheet:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-sheet__header {
    align-items: start;
    display: grid;
    gap: var(--zdp-space-3);
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .zdp-sheet__title {
    color: var(--zdp-color-ink-strong);
    display: grid;
    gap: var(--zdp-space-1);
    min-width: 0;
  }

  .zdp-sheet__title :global(*) {
    margin: 0;
  }

  .zdp-sheet__body {
    color: var(--zdp-color-ink-normal);
    display: grid;
    gap: var(--zdp-space-3);
    line-height: var(--zdp-type-body-line-height);
    min-width: 0;
  }

  .zdp-sheet__body :global(*) {
    margin-bottom: 0;
    margin-top: 0;
  }

  .zdp-sheet__footer {
    align-items: center;
    border-block-start: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    display: flex;
    flex-wrap: wrap;
    gap: var(--zdp-space-3);
    justify-content: end;
    min-width: 0;
    padding-block-start: var(--zdp-space-3);
  }

  .zdp-sheet__close {
    align-items: center;
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong);
    border-radius: var(--zdp-control-radius);
    color: var(--zdp-color-ink-normal);
    cursor: pointer;
    display: inline-flex;
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-control-size);
    height: var(--zdp-control-icon-sm);
    justify-content: center;
    line-height: 1;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    -webkit-user-select: none;
    user-select: none;
    width: var(--zdp-control-icon-sm);
  }

  .zdp-sheet__close:hover:not(:disabled) {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-sheet__close:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  @media (max-width: 720px) {
    .zdp-sheet,
    .zdp-sheet--right,
    .zdp-sheet--left {
      block-size: auto;
      border-end-end-radius: 0;
      border-end-start-radius: 0;
      border-radius: var(--zdp-control-radius) var(--zdp-control-radius) 0 0;
      inline-size: auto;
      inset-block: auto 0;
      inset-inline: 0;
      max-block-size: min(34rem, calc(var(--zdp-viewport-block) - var(--zdp-space-6) - var(--zdp-viewport-safe-block-start) - var(--zdp-viewport-safe-block-end)));
      padding-block: var(--zdp-space-4) max(var(--zdp-space-4), var(--zdp-viewport-safe-block-end));
      padding-inline: max(var(--zdp-space-4), var(--zdp-viewport-safe-inline-start)) max(var(--zdp-space-4), var(--zdp-viewport-safe-inline-end));
    }
  }
</style>

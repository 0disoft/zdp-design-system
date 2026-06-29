<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import { isZdpFocusableElement, zdpFocusableSelector } from '../focusable';
  import { createZdpModalLayer } from '../modal-layer';

  export let open = false;
  export let id: string | null = null;
  export let labelledBy: string;
  export let describedBy: string | null = null;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let closeLabel = 'Close';
  export let closeOnEscape = true;
  export let closeOnBackdrop = true;
  export let onClose: (() => void) | null = null;

  let panelElement: HTMLElement | null = null;
  let layerElement: HTMLElement | null = null;
  let previousFocusElement: HTMLElement | null = null;
  let knownOpenState = false;
  const modalLayer = createZdpModalLayer();

  $: modalLayer.setActive(open, layerElement);

  onDestroy(() => {
    modalLayer.destroy();
  });

  $: if (open !== knownOpenState) {
    knownOpenState = open;

    if (open) {
      void handleDialogOpened();
    } else {
      restorePreviousFocus();
    }
  }

  async function handleDialogOpened(): Promise<void> {
    if (typeof document === 'undefined') {
      return;
    }

    const activeElement = document.activeElement;
    previousFocusElement = activeElement instanceof HTMLElement ? activeElement : null;

    await tick();

    const firstElement = getFocusableElements()[0] ?? panelElement;
    firstElement?.focus();
  }

  function restorePreviousFocus(): void {
    if (typeof document === 'undefined') {
      return;
    }

    if (previousFocusElement !== null && document.contains(previousFocusElement)) {
      previousFocusElement.focus();
    }

    previousFocusElement = null;
  }

  function requestClose(): void {
    open = false;
    onClose?.();
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

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  function getFocusableElements(): HTMLElement[] {
    if (panelElement === null) {
      return [];
    }

    return Array.from(panelElement.querySelectorAll<HTMLElement>(zdpFocusableSelector)).filter(
      isZdpFocusableElement
    );
  }
</script>

{#if open}
  <div class="zdp-dialog" bind:this={layerElement}>
    <button
      class="zdp-dialog__backdrop"
      type="button"
      aria-label={closeLabel}
      tabindex="-1"
      onclick={handleBackdropClick}
    ></button>
    <div
      class={`zdp-dialog__panel zdp-dialog__panel--${size}`}
      id={id ?? undefined}
      bind:this={panelElement}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy ?? undefined}
      tabindex="-1"
      onkeydown={handleKeydown}
    >
      <header class="zdp-dialog__header">
        <div class="zdp-dialog__title">
          <slot name="title" />
        </div>
        <button class="zdp-dialog__close" type="button" aria-label={closeLabel} onclick={requestClose}>
          <span aria-hidden="true">×</span>
        </button>
      </header>
      <div class="zdp-dialog__body">
        <slot />
      </div>
      <div class="zdp-dialog__footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
{/if}

<style>
  .zdp-dialog {
    align-items: center;
    box-sizing: border-box;
    display: grid;
    inset: 0;
    justify-items: center;
    padding-block: max(var(--zdp-space-4), var(--zdp-viewport-safe-block-start)) max(var(--zdp-space-4), var(--zdp-viewport-safe-block-end));
    padding-inline: max(var(--zdp-space-4), var(--zdp-viewport-safe-inline-start)) max(var(--zdp-space-4), var(--zdp-viewport-safe-inline-end));
    position: fixed;
    z-index: var(--zdp-layer-dialog);
  }

  .zdp-dialog__backdrop {
    background: rgb(47 36 24 / 0.42);
    border: 0;
    cursor: pointer;
    inset: 0;
    margin: 0;
    padding: 0;
    position: fixed;
  }

  :global([data-zdp-theme="dark"]) .zdp-dialog__backdrop {
    background: rgb(10 8 5 / 0.72);
  }

  .zdp-dialog__panel {
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-normal);
    display: grid;
    gap: var(--zdp-space-4);
    max-height: min(42rem, calc(var(--zdp-viewport-block) - var(--zdp-space-8)));
    min-width: 0;
    overflow: auto;
    padding: var(--zdp-space-5);
    position: relative;
    width: min(100%, 34rem);
  }

  .zdp-dialog__panel--sm {
    width: min(100%, 26rem);
  }

  .zdp-dialog__panel--md {
    width: min(100%, 34rem);
  }

  .zdp-dialog__panel--lg {
    width: min(100%, 46rem);
  }

  .zdp-dialog__panel:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-dialog__header {
    align-items: start;
    display: grid;
    gap: var(--zdp-space-3);
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .zdp-dialog__title {
    color: var(--zdp-color-ink-strong);
    display: grid;
    gap: var(--zdp-space-1);
    min-width: 0;
  }

  .zdp-dialog__title :global(*) {
    margin: 0;
  }

  .zdp-dialog__body {
    color: var(--zdp-color-ink-normal);
    display: grid;
    gap: var(--zdp-space-3);
    line-height: var(--zdp-type-body-line-height);
    min-width: 0;
  }

  .zdp-dialog__body :global(*) {
    margin-bottom: 0;
    margin-top: 0;
  }

  .zdp-dialog__footer {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--zdp-space-3);
    justify-content: end;
    min-width: 0;
  }

  .zdp-dialog__close {
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

  .zdp-dialog__close:hover:not(:disabled) {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-dialog__close:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  @media (max-width: 520px) {
    .zdp-dialog {
      align-items: end;
      padding-block: max(var(--zdp-space-3), var(--zdp-viewport-safe-block-start)) max(var(--zdp-space-3), var(--zdp-viewport-safe-block-end));
      padding-inline: max(var(--zdp-space-3), var(--zdp-viewport-safe-inline-start)) max(var(--zdp-space-3), var(--zdp-viewport-safe-inline-end));
    }

    .zdp-dialog__panel {
      max-height: calc(var(--zdp-viewport-block) - var(--zdp-space-6));
      padding: var(--zdp-space-4);
    }
  }
</style>

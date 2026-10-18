<script lang="ts">
  import { onDestroy } from 'svelte';
  import { createZdpModalFocus } from '../modal-focus.js';
  import { createZdpDismissLayer } from '../dismiss-layer.js';
  import { createZdpModalLayer } from '../modal-layer.js';

  interface Props {
    open?: boolean;
    id?: string | null;
    labelledBy: string;
    describedBy?: string | null;
    size?: 'sm' | 'md' | 'lg';
    closeLabel?: string;
    closeOnEscape?: boolean;
    closeOnBackdrop?: boolean;
    onClose?: (() => void) | null;
  }

  let {
    open = $bindable(false),
    id = $bindable(null),
    labelledBy = $bindable(),
    describedBy = $bindable(null),
    size = $bindable('md'),
    closeLabel = $bindable('Close'),
    closeOnEscape = $bindable(true),
    closeOnBackdrop = $bindable(true),
    onClose = $bindable(null)
  }: Props = $props();

  let panelElement: HTMLElement | null = $state(null);
  let layerElement: HTMLElement | null = $state(null);
  const modalLayer = createZdpModalLayer();
  const dismissLayer = createZdpDismissLayer();
  const modalFocus = createZdpModalFocus({
    getOpen: () => open,
    getPanel: () => panelElement,
    getLayer: () => layerElement,
    modalLayer
  });

  onDestroy(() => {
    modalFocus.destroy();
    modalLayer.destroy();
    dismissLayer.destroy();
  });

  function requestClose(): void {
    open = false;
    onClose?.();
  }

  function handleBackdropClick(): void {
    if (closeOnBackdrop) {
      requestClose();
    }
  }

  function handleBackdropPointerDown(event: PointerEvent): void {
    event.preventDefault();
  }

  $effect.pre(() => {
    modalLayer.setActive(open, layerElement);
    dismissLayer.setActive(open, layerElement, {
      closeOnEscape,
      closeOnOutside: false,
      onEscape: requestClose
    });
  });

  $effect(() => modalFocus.sync());
</script>

{#if open}
  <div class="zdp-dialog" bind:this={layerElement}>
    {#if closeOnBackdrop}
      <button
        class="zdp-dialog__backdrop"
        type="button"
        aria-label={closeLabel}
        tabindex="-1"
        onpointerdown={handleBackdropPointerDown}
        onclick={handleBackdropClick}
      ></button>
    {:else}
      <div
        class="zdp-dialog__backdrop"
        aria-hidden="true"
        onpointerdown={handleBackdropPointerDown}
      ></div>
    {/if}
    <div
      class={`zdp-dialog__panel zdp-dialog__panel--${size}`}
      id={id ?? undefined}
      bind:this={panelElement}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy ?? undefined}
      tabindex="-1"
      onkeydown={modalFocus.handleKeydown}
    >
      <header class="zdp-dialog__header">
        <div class="zdp-dialog__title">
          <!-- svelte-ignore slot_element_deprecated public slot compatibility -->
          <slot name="title" />
        </div>
        <button class="zdp-dialog__close" type="button" aria-label={closeLabel} onclick={requestClose}>
          <span aria-hidden="true">×</span>
        </button>
      </header>
      <div class="zdp-dialog__body">
        <!-- svelte-ignore slot_element_deprecated public slot compatibility -->
        <slot />
      </div>
      <div class="zdp-dialog__footer">
        <!-- svelte-ignore slot_element_deprecated public slot compatibility -->
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
    z-index: calc(var(--zdp-layer-dialog) + var(--zdp-modal-layer-offset, 0));
  }

  .zdp-dialog__backdrop {
    background: var(--zdp-color-backdrop-dialog);
    border: 0;
    cursor: pointer;
    inset: 0;
    margin: 0;
    padding: 0;
    position: fixed;
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

  .zdp-dialog__close:where(:hover:not(:disabled)) {
    background: var(--zdp-color-interaction-hover);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-dialog__close:where(:active:not(:disabled)) {
    background: var(--zdp-color-interaction-pressed);
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

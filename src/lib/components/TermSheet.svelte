<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import { getZdpActiveElement, isZdpFocusableElement, zdpFocusableSelector } from '../focusable';
  import { createZdpModalLayer } from '../modal-layer';
  import type { ZdpTermSheetPlacement, ZdpTermSheetTerm } from '../term';

  interface Props {
    open?: boolean;
    id?: string;
    term?: ZdpTermSheetTerm | null;
    placement?: ZdpTermSheetPlacement;
    closeLabel?: string;
    eyebrow?: string;
    detailLabel?: string;
    relatedLabel?: string;
    exampleLabel?: string;
    closeOnEscape?: boolean;
    closeOnBackdrop?: boolean;
    onClose?: (() => void) | null;
    onRelatedTerm?: ((termId: string) => void) | null;
  }

  const componentId = $props.id();
  const fallbackId = `zdp-term-sheet-${componentId}`;
  let {
    open = $bindable(false),
    id = fallbackId,
    term = null,
    placement = 'right',
    closeLabel = 'Close',
    eyebrow = 'Term',
    detailLabel = 'View details',
    relatedLabel = 'Related terms',
    exampleLabel = 'Example',
    closeOnEscape = true,
    closeOnBackdrop = true,
    onClose = null,
    onRelatedTerm = null
  }: Props = $props();

  let panelElement = $state<HTMLElement | null>(null);
  let layerElement = $state<HTMLElement | null>(null);
  let previousFocusElement = $state<HTMLElement | null>(null);
  let knownOpenState = $state(false);
  const modalLayer = createZdpModalLayer();

  $effect.pre(() => {
    modalLayer.setActive(open && term !== null, layerElement);
  });

  onDestroy(() => {
    modalLayer.destroy();
  });

  const titleId = $derived(`${id}-title`);
  const descriptionId = $derived(`${id}-description`);
  const resolvedPlacement = $derived(placement);

  $effect(() => {
    if (open === knownOpenState) {
      return;
    }

    knownOpenState = open;
    if (open) {
      void handleSheetOpened();
    } else {
      restorePreviousFocus();
    }
  });

  async function handleSheetOpened(): Promise<void> {
    if (typeof document === 'undefined') {
      return;
    }

    previousFocusElement = getZdpActiveElement();
    modalLayer.setFocusReturnTarget(previousFocusElement);

    await tick();

    const firstElement = getFocusableElements()[0] ?? panelElement;
    firstElement?.focus();
  }

  function restorePreviousFocus(): void {
    if (typeof document === 'undefined') {
      return;
    }

    const focusReturnTarget = modalLayer.takeFocusReturnTarget();

    if (focusReturnTarget?.isConnected) {
      focusReturnTarget.focus();
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

  function handleBackdropPointerDown(event: PointerEvent): void {
    event.preventDefault();
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

    const activeElement = getZdpActiveElement();

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && activeElement === lastElement) {
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

{#if open && term !== null}
  <div class="zdp-term-layer" bind:this={layerElement}>
    {#if closeOnBackdrop}
      <button
        class="zdp-term-sheet__backdrop"
        type="button"
        aria-label={closeLabel}
        tabindex="-1"
        onpointerdown={handleBackdropPointerDown}
        onclick={handleBackdropClick}
      ></button>
    {:else}
      <div
        class="zdp-term-sheet__backdrop"
        aria-hidden="true"
        onpointerdown={handleBackdropPointerDown}
      ></div>
    {/if}
    <div
      class={`zdp-term-sheet zdp-term-sheet--${resolvedPlacement}`}
      id={id}
      bind:this={panelElement}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      tabindex="-1"
      data-term-id={term.id}
      data-zdp-ad-exclude="true"
      data-zdp-term-id={term.id}
      data-zdp-term-placement={resolvedPlacement}
      data-zdp-term-surface="sheet"
      onkeydown={handleKeydown}
    >
      <header class="zdp-term-sheet__header">
        <div class="zdp-term-sheet__heading">
          <p class="zdp-term-sheet__eyebrow">{eyebrow}</p>
          <h2 id={titleId} class="zdp-term-sheet__title">{term.label}</h2>
        </div>
        <button class="zdp-term-sheet__close" type="button" aria-label={closeLabel} onclick={requestClose}>
          <span aria-hidden="true">×</span>
        </button>
      </header>

      <div class="zdp-term-sheet__body">
        <p id={descriptionId} class="zdp-term-sheet__short">{term.short}</p>

        {#if term.long}
          <p>{term.long}</p>
        {/if}

        {#if term.example}
          <section class="zdp-term-sheet__section" aria-label={exampleLabel}>
            <h3>{exampleLabel}</h3>
            <p>{term.example}</p>
          </section>
        {/if}

        {#if term.relatedTerms && term.relatedTerms.length > 0}
          <section class="zdp-term-sheet__section" aria-label={relatedLabel}>
            <h3>{relatedLabel}</h3>
            <div class="zdp-term-sheet__related">
              {#each term.relatedTerms as relatedTerm}
                <button
                  class="zdp-term-sheet__related-button"
                  type="button"
                  data-term-id={relatedTerm.id}
                  data-zdp-term-id={relatedTerm.id}
                  onclick={() => onRelatedTerm?.(relatedTerm.id)}
                >
                  {relatedTerm.label}
                </button>
              {/each}
            </div>
          </section>
        {/if}
      </div>

      {#if term.canonicalPath}
        <footer class="zdp-term-sheet__footer">
          <a class="zdp-term-sheet__detail-link" href={term.canonicalPath}>{detailLabel}</a>
        </footer>
      {/if}
    </div>
  </div>
{/if}

<style>
  .zdp-term-layer {
    inset: 0;
    position: fixed;
    z-index: calc(var(--zdp-layer-dialog) + var(--zdp-modal-layer-offset, 0));
  }

  .zdp-term-sheet {
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong);
    box-sizing: border-box;
    color: var(--zdp-color-ink-normal);
    display: grid;
    font-family: var(--zdp-font-family-sans);
    gap: var(--zdp-space-4);
    max-block-size: calc(var(--zdp-viewport-block) - var(--zdp-space-6) - var(--zdp-viewport-safe-block-start) - var(--zdp-viewport-safe-block-end));
    overflow: auto;
    padding-block: var(--zdp-space-5) max(var(--zdp-space-5), var(--zdp-viewport-safe-block-end));
    padding-inline: max(var(--zdp-space-5), var(--zdp-viewport-safe-inline-start)) max(var(--zdp-space-5), var(--zdp-viewport-safe-inline-end));
    position: fixed;
    z-index: calc(var(--zdp-layer-term-sheet) + 1);
  }

  .zdp-term-sheet__backdrop {
    background: var(--zdp-color-backdrop-term-sheet);
    border: 0;
    cursor: pointer;
    inset: 0;
    margin: 0;
    padding: 0;
    position: fixed;
    z-index: var(--zdp-layer-term-sheet);
  }

  .zdp-term-sheet--right {
    block-size: calc(var(--zdp-viewport-block) - var(--zdp-space-6) - var(--zdp-viewport-safe-block-start) - var(--zdp-viewport-safe-block-end));
    border-radius: var(--zdp-control-radius);
    inline-size: min(28rem, calc(var(--zdp-viewport-inline) - var(--zdp-space-6) - var(--zdp-viewport-safe-inline-start) - var(--zdp-viewport-safe-inline-end)));
    inset-block: max(var(--zdp-space-3), var(--zdp-viewport-safe-block-start)) max(var(--zdp-space-3), var(--zdp-viewport-safe-block-end));
    inset-inline-end: max(var(--zdp-space-3), var(--zdp-viewport-safe-inline-end));
  }

  .zdp-term-sheet--bottom {
    border-end-end-radius: 0;
    border-end-start-radius: 0;
    border-radius: var(--zdp-control-radius) var(--zdp-control-radius) 0 0;
    inset-block-end: 0;
    inset-inline: 0;
    max-block-size: min(34rem, calc(var(--zdp-viewport-block) - var(--zdp-space-6) - var(--zdp-viewport-safe-block-start) - var(--zdp-viewport-safe-block-end)));
  }

  .zdp-term-sheet:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-term-sheet__header {
    align-items: start;
    display: grid;
    gap: var(--zdp-space-3);
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .zdp-term-sheet__heading {
    display: grid;
    gap: var(--zdp-space-1);
    min-width: 0;
  }

  .zdp-term-sheet__eyebrow {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-caption-size);
    line-height: var(--zdp-type-caption-line-height);
    margin: 0;
  }

  .zdp-term-sheet__title {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-title-size);
    line-height: var(--zdp-type-title-line-height);
    margin: 0;
    overflow-wrap: anywhere;
  }

  .zdp-term-sheet__close {
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
    -webkit-user-select: none;
    user-select: none;
    width: var(--zdp-control-icon-sm);
  }

  .zdp-term-sheet__close:focus-visible,
  .zdp-term-sheet__related-button:focus-visible,
  .zdp-term-sheet__detail-link:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-term-sheet__body {
    display: grid;
    gap: var(--zdp-space-3);
    line-height: var(--zdp-type-body-line-height);
    min-width: 0;
  }

  .zdp-term-sheet__body p,
  .zdp-term-sheet__section h3 {
    margin: 0;
  }

  .zdp-term-sheet__short {
    color: var(--zdp-color-ink-strong);
    font-weight: var(--zdp-font-weight-semibold);
  }

  .zdp-term-sheet__section {
    display: grid;
    gap: var(--zdp-space-2);
  }

  .zdp-term-sheet__section h3 {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-control-size);
    line-height: var(--zdp-type-control-line-height);
  }

  .zdp-term-sheet__related {
    display: flex;
    flex-wrap: wrap;
    gap: var(--zdp-space-2);
  }

  .zdp-term-sheet__related-button {
    background: var(--zdp-color-surface-raised);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-normal);
    border-radius: var(--zdp-control-radius);
    color: var(--zdp-color-ink-normal);
    cursor: pointer;
    font: inherit;
    min-height: var(--zdp-control-height-sm);
    padding: 0 var(--zdp-space-2);
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-term-sheet__footer {
    border-block-start: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    padding-block-start: var(--zdp-space-3);
  }

  .zdp-term-sheet__detail-link {
    color: var(--zdp-color-ink-strong);
    font-weight: var(--zdp-font-weight-semibold);
    text-decoration: underline;
    text-underline-offset: 0.16em;
  }

  @media (max-width: 720px) {
    .zdp-term-sheet,
    .zdp-term-sheet--right {
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

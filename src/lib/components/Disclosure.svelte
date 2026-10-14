<script lang="ts">
  import { tick } from 'svelte';
  import { getZdpActiveElement, hasZdpFocusMoved } from '../focusable';
  import { toZdpDomId } from '../dom-id';
  import type { ZdpDisclosureHeadingLevel } from '../disclosure';

  interface Props {
    open?: boolean;
    disabled?: boolean;
    id?: string | null;
    title?: string;
    headingLevel?: ZdpDisclosureHeadingLevel | null;
    onOpenChange?: ((open: boolean) => void) | null;
  }

  const componentId = $props.id();
  const fallbackId = `zdp-disclosure-${componentId}`;
  let {
    open = $bindable(false),
    disabled = false,
    id = null,
    title = 'View details',
    headingLevel = null,
    onOpenChange = null
  }: Props = $props();

  const resolvedId = $derived(toDomId(id ?? fallbackId));
  const triggerId = $derived(`${resolvedId}-trigger`);
  const panelId = $derived(`${resolvedId}-panel`);

  let rootElement = $state<HTMLElement | null>(null);
  let panelElement = $state<HTMLElement | null>(null);

  $effect.pre(() => {
    const root = rootElement;
    const panel = panelElement;
    if (open || !root || !panel) return;
    const focused = getZdpActiveElement(root.getRootNode() as Document | ShadowRoot);
    if (focused && panel.contains(focused)) {
      void restoreCollapsedFocus(root, focused);
    }
  });

  async function restoreCollapsedFocus(root: HTMLElement, previous: HTMLElement): Promise<void> {
    await tick();
    if (open || rootElement !== root || !root.isConnected) return;
    if (hasZdpFocusMoved(root, previous)) return;
    (root.querySelector<HTMLElement>('.zdp-disclosure__trigger:not(:disabled)') ?? root).focus();
  }

  function setOpen(nextOpen: boolean): void {
    if (disabled || open === nextOpen) {
      return;
    }

    open = nextOpen;
    onOpenChange?.(nextOpen);
  }

  function handleToggle(): void {
    setOpen(!open);
  }

  function toDomId(value: string): string {
    return toZdpDomId(value, fallbackId);
  }
</script>

<div class="zdp-disclosure" bind:this={rootElement} tabindex="-1" data-open={open ? 'true' : 'false'} data-disabled={disabled ? 'true' : undefined}>
  {#if headingLevel}
    <div class="zdp-disclosure__heading" role="heading" aria-level={headingLevel}>
      <button
        class="zdp-disclosure__trigger"
        id={triggerId}
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        disabled={disabled}
        onclick={handleToggle}
      >
        <span class="zdp-disclosure__title">
          <!-- svelte-ignore slot_element_deprecated legacy named slot contract remains public -->
          <slot name="title">{title}</slot>
        </span>
        <span class="zdp-disclosure__mark" aria-hidden="true"></span>
      </button>
    </div>
  {:else}
    <button
      class="zdp-disclosure__trigger"
      id={triggerId}
      type="button"
      aria-expanded={open}
      aria-controls={open ? panelId : undefined}
      disabled={disabled}
      onclick={handleToggle}
    >
      <span class="zdp-disclosure__title">
        <!-- svelte-ignore slot_element_deprecated legacy named slot contract remains public -->
        <slot name="title">{title}</slot>
      </span>
      <span class="zdp-disclosure__mark" aria-hidden="true"></span>
    </button>
  {/if}

  {#if open}
    <div class="zdp-disclosure__panel" bind:this={panelElement} id={panelId} role="group" aria-labelledby={triggerId}>
      <!-- svelte-ignore slot_element_deprecated legacy default slot contract remains public -->
      <slot />
    </div>
  {/if}
</div>

<style>
  .zdp-disclosure {
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-normal);
    display: grid;
    font-family: var(--zdp-font-family-sans);
    min-width: 0;
  }

  .zdp-disclosure__heading {
    margin: 0;
    min-width: 0;
  }

  .zdp-disclosure__trigger {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-normal);
    cursor: pointer;
    display: grid;
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-control-size);
    font-weight: var(--zdp-font-weight-medium);
    gap: var(--zdp-space-2);
    grid-template-columns: minmax(0, 1fr) auto;
    line-height: var(--zdp-type-control-line-height);
    min-block-size: var(--zdp-control-height-md);
    min-width: 0;
    padding: var(--zdp-space-2) var(--zdp-control-padding-md);
    padding-inline-end: calc(var(--zdp-control-padding-md) - var(--zdp-control-border-width));
    text-align: start;
    transition:
      background-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    -webkit-user-select: none;
    user-select: none;
    width: 100%;
  }

  .zdp-disclosure__trigger:where(:hover:not(:disabled)) {
    background: var(--zdp-color-interaction-hover);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-disclosure__trigger:where(:active:not(:disabled)) {
    background: var(--zdp-color-interaction-pressed);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-disclosure__trigger:focus-visible {
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-disclosure__trigger:disabled {
    cursor: not-allowed;
    opacity: var(--zdp-control-disabled-opacity);
  }

  .zdp-disclosure__title {
    min-width: 0;
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
  }

  .zdp-disclosure__mark {
    align-items: center;
    color: var(--zdp-color-ink-muted);
    display: inline-flex;
    flex: 0 0 auto;
    justify-content: center;
    line-height: 1;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-disclosure__mark::before {
    background-color: currentColor;
    block-size: var(--zdp-control-indicator-size);
    content: '';
    display: inline-block;
    inline-size: var(--zdp-control-indicator-size);
    mask-image: var(--zdp-control-indicator-mask);
    mask-position: center;
    mask-repeat: no-repeat;
    mask-size: contain;
    transition: rotate var(--zdp-motion-fast) ease;
    -webkit-mask-image: var(--zdp-control-indicator-mask);
    -webkit-mask-position: center;
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-size: contain;
  }

  .zdp-disclosure[data-open="true"] .zdp-disclosure__mark::before {
    rotate: 180deg;
  }

  .zdp-disclosure__panel {
    border-block-start: 1px solid var(--zdp-color-line-subtle);
    color: var(--zdp-color-ink-normal);
    display: grid;
    gap: var(--zdp-space-2);
    line-height: var(--zdp-type-body-line-height);
    min-width: 0;
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
    padding: var(--zdp-space-3);
  }

  .zdp-disclosure__panel :global(*) {
    margin-block: 0;
  }

  @media (forced-colors: active) {
    .zdp-disclosure__mark::before {
      background-color: currentColor;
      color: ButtonText;
      forced-color-adjust: none;
    }
  }
</style>

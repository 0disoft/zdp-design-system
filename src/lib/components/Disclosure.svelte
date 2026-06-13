<script lang="ts" context="module">
  let nextDisclosureInstanceId = 0;
</script>

<script lang="ts">
  import type { ZdpDisclosureHeadingLevel } from '../disclosure';

  export let open = false;
  export let disabled = false;
  export let id: string | null = null;
  export let title = '자세히 보기';
  export let headingLevel: ZdpDisclosureHeadingLevel | null = null;
  export let onOpenChange: ((open: boolean) => void) | null = null;

  const fallbackId = `zdp-disclosure-${++nextDisclosureInstanceId}`;

  $: resolvedId = toDomId(id ?? fallbackId);
  $: triggerId = `${resolvedId}-trigger`;
  $: panelId = `${resolvedId}-panel`;

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
    return value.trim().replace(/[^a-zA-Z0-9_-]+/g, '-') || 'disclosure';
  }
</script>

<div class="zdp-disclosure" data-open={open ? 'true' : 'false'} data-disabled={disabled ? 'true' : undefined}>
  {#if headingLevel}
    <div class="zdp-disclosure__heading" role="heading" aria-level={headingLevel}>
      <button
        class="zdp-disclosure__trigger"
        id={triggerId}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        disabled={disabled}
        onclick={handleToggle}
      >
        <span class="zdp-disclosure__title">
          <slot name="title">{title}</slot>
        </span>
        <span class="zdp-disclosure__mark" aria-hidden="true">{open ? '-' : '+'}</span>
      </button>
    </div>
  {:else}
    <button
      class="zdp-disclosure__trigger"
      id={triggerId}
      type="button"
      aria-expanded={open}
      aria-controls={panelId}
      disabled={disabled}
      onclick={handleToggle}
    >
      <span class="zdp-disclosure__title">
        <slot name="title">{title}</slot>
      </span>
      <span class="zdp-disclosure__mark" aria-hidden="true">{open ? '-' : '+'}</span>
    </button>
  {/if}

  {#if open}
    <div class="zdp-disclosure__panel" id={panelId} role="group" aria-labelledby={triggerId}>
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
    gap: var(--zdp-space-3);
    grid-template-columns: minmax(0, 1fr) auto;
    line-height: var(--zdp-type-control-line-height);
    min-block-size: var(--zdp-control-height-md);
    min-width: 0;
    padding: var(--zdp-space-2) var(--zdp-space-3);
    text-align: left;
    transition:
      background-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    -webkit-user-select: none;
    user-select: none;
    width: 100%;
  }

  .zdp-disclosure__trigger:hover:not(:disabled) {
    background: var(--zdp-color-surface-raised);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-disclosure__trigger:focus-visible {
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-disclosure__trigger:disabled {
    cursor: not-allowed;
    opacity: 0.56;
  }

  .zdp-disclosure__title {
    min-width: 0;
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
  }

  .zdp-disclosure__mark {
    align-items: center;
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-muted);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: var(--zdp-type-caption-size);
    inline-size: var(--zdp-control-glyph-md);
    justify-content: center;
    line-height: 1;
    min-block-size: var(--zdp-control-glyph-md);
    -webkit-user-select: none;
    user-select: none;
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
</style>

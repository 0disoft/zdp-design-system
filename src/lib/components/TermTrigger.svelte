<script lang="ts">
  export let termId: string;
  export let controls: string | null = null;
  export let expanded = false;
  export let disabled = false;
  export let ariaLabel: string | null = null;
  export let onopen: ((termId: string) => void) | null = null;

  $: resolvedControls = controls !== null && expanded ? controls : null;

  function handleClick(): void {
    if (disabled) {
      return;
    }

    onopen?.(termId);
  }
</script>

<button
  class="zdp-term-trigger"
  type="button"
  data-term-id={termId}
  aria-label={ariaLabel ?? undefined}
  aria-controls={resolvedControls ?? undefined}
  aria-expanded={controls === null ? undefined : expanded}
  aria-haspopup="dialog"
  disabled={disabled}
  onclick={handleClick}
>
  <slot />
</button>

<style>
  .zdp-term-trigger {
    align-items: baseline;
    appearance: none;
    background: var(--zdp-color-accent-primary-soft);
    border: 0;
    border-radius: var(--zdp-radius-sm);
    color: inherit;
    cursor: pointer;
    display: inline;
    font: inherit;
    font-weight: var(--zdp-font-weight-medium);
    line-height: inherit;
    margin: 0;
    padding: 0 0.2rem;
    text-align: inherit;
    text-decoration: none;
    transition: color var(--zdp-motion-fast) ease;
  }

  .zdp-term-trigger:hover:not(:disabled) {
    color: var(--zdp-color-ink-strong);
  }

  .zdp-term-trigger:focus-visible {
    background: var(--zdp-color-focus-surface);
    color: var(--zdp-color-focus-text);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-term-trigger:disabled {
    cursor: not-allowed;
    opacity: 0.58;
  }
</style>

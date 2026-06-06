<script lang="ts">
  export let termId: string;
  export let controls: string | null = null;
  export let expanded = false;
  export let disabled = false;
  export let ariaLabel: string | null = null;
  export let onopen: ((termId: string) => void) | null = null;

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
  aria-controls={controls ?? undefined}
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
    background: transparent;
    border: 0;
    border-block-end: var(--zdp-control-border-width) solid var(--zdp-color-focus-line);
    border-radius: 0;
    color: inherit;
    cursor: pointer;
    display: inline;
    font: inherit;
    line-height: inherit;
    margin: 0;
    padding: 0;
    text-align: inherit;
    text-decoration: none;
    text-underline-offset: 0.14em;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-term-trigger:hover:not(:disabled) {
    color: var(--zdp-color-ink-strong);
  }

  .zdp-term-trigger:focus-visible {
    border-radius: var(--zdp-radius-sm);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-term-trigger:disabled {
    cursor: not-allowed;
    opacity: 0.58;
  }
</style>

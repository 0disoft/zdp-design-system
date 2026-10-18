<script lang="ts">
  interface Props {
    termId: string;
    controls?: string | null;
    expanded?: boolean;
    disabled?: boolean;
    ariaLabel?: string | null;
    onopen?: ((termId: string) => void) | null;
  }

  let {
    termId = $bindable(),
    controls = $bindable(null),
    expanded = $bindable(false),
    disabled = $bindable(false),
    ariaLabel = $bindable(null),
    onopen = $bindable(null)
  }: Props = $props();

  let resolvedControls = $derived(controls !== null && expanded ? controls : null);

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
  <!-- svelte-ignore slot_element_deprecated public slot compatibility --><slot />
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

  .zdp-term-trigger:where(:hover:not(:disabled)) {
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

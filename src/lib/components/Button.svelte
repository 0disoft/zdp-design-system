<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'danger' = 'primary';
  export let size: 'sm' | 'md' = 'md';
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let disabled = false;
</script>

<button
  class={`zdp-button zdp-button--${variant} zdp-button--${size}`}
  {type}
  {disabled}
  aria-disabled={disabled}
>
  <slot />
</button>

<style>
  .zdp-button {
    align-items: center;
    border: 1px solid transparent;
    border-radius: var(--zdp-radius-md);
    cursor: pointer;
    display: inline-flex;
    font-family: var(--zdp-font-family-sans);
    font-weight: var(--zdp-font-weight-semibold);
    gap: var(--zdp-space-2);
    justify-content: center;
    line-height: var(--zdp-font-line-height-tight);
    min-height: 2.25rem;
    text-decoration: none;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      box-shadow var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    white-space: nowrap;
  }

  .zdp-button--sm {
    font-size: var(--zdp-font-size-sm);
    padding: var(--zdp-space-2) var(--zdp-space-3);
  }

  .zdp-button--md {
    font-size: var(--zdp-font-size-md);
    padding: var(--zdp-space-3) var(--zdp-space-4);
  }

  .zdp-button--primary {
    background: var(--zdp-color-accent-primary);
    color: var(--zdp-color-ink-inverse);
  }

  .zdp-button--primary:hover:not(:disabled) {
    background: var(--zdp-color-accent-primary-strong);
  }

  .zdp-button--secondary {
    background: var(--zdp-color-surface-panel);
    border-color: var(--zdp-color-line-subtle);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-button--secondary:hover:not(:disabled) {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
  }

  .zdp-button--danger {
    background: var(--zdp-color-accent-danger);
    color: var(--zdp-color-ink-inverse);
  }

  .zdp-button:focus-visible {
    box-shadow: var(--zdp-shadow-focus);
    outline: none;
  }

  .zdp-button:disabled {
    cursor: not-allowed;
    opacity: 0.56;
  }
</style>

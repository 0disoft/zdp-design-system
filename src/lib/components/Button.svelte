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
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong);
    border-radius: var(--zdp-control-radius);
    cursor: pointer;
    display: inline-flex;
    font-family: var(--zdp-font-family-sans);
    font-weight: var(--zdp-font-weight-medium);
    gap: var(--zdp-space-2);
    justify-content: center;
    font-size: var(--zdp-type-control-size);
    line-height: var(--zdp-type-control-line-height);
    min-height: var(--zdp-control-height-md);
    text-decoration: none;
    text-align: center;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
  }

  .zdp-button--sm {
    font-size: var(--zdp-font-size-sm);
    min-height: var(--zdp-control-height-sm);
    padding: 0 var(--zdp-space-3);
  }

  .zdp-button--md {
    font-size: var(--zdp-type-control-size);
    min-height: var(--zdp-control-height-md);
    padding: 0 var(--zdp-space-4);
  }

  .zdp-button--primary {
    background: var(--zdp-color-accent-primary);
    border-color: var(--zdp-color-accent-primary-strong);
    color: var(--zdp-color-ink-inverse);
  }

  .zdp-button--primary:hover:not(:disabled) {
    background: var(--zdp-color-accent-primary-strong);
    border-color: var(--zdp-color-accent-primary-strong);
  }

  .zdp-button--primary:active:not(:disabled) {
    background: var(--zdp-color-accent-primary-strong);
    border-color: var(--zdp-color-accent-primary-strong);
  }

  .zdp-button--secondary {
    background: var(--zdp-color-surface-panel);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-button--secondary:hover:not(:disabled) {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-button--secondary:active:not(:disabled) {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
  }

  :global([data-zdp-theme="dark"]) .zdp-button--secondary {
    background: var(--zdp-color-surface-panel);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-muted);
  }

  :global([data-zdp-theme="dark"]) .zdp-button--secondary:hover:not(:disabled) {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-button--danger {
    background: var(--zdp-color-surface-panel);
    border-color: var(--zdp-color-accent-danger);
    color: var(--zdp-color-accent-danger);
  }

  :global([data-zdp-theme="dark"]) .zdp-button--danger {
    background: transparent;
    border-color: var(--zdp-color-accent-danger);
    color: var(--zdp-color-accent-danger);
  }

  .zdp-button--danger:hover:not(:disabled) {
    background: var(--zdp-color-surface-raised);
  }

  :global([data-zdp-theme="dark"]) .zdp-button--danger:hover:not(:disabled) {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-accent-danger);
    color: var(--zdp-color-accent-danger);
  }

  .zdp-button--danger:active:not(:disabled) {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-accent-danger);
    color: var(--zdp-color-accent-danger);
  }

  .zdp-button:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-button:disabled {
    cursor: not-allowed;
    opacity: 0.56;
  }

</style>

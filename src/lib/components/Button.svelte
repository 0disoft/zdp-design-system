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
    border: 1px solid var(--zdp-color-line-strong);
    border-radius: var(--zdp-radius-md);
    box-shadow: var(--zdp-shadow-sm);
    cursor: pointer;
    display: inline-flex;
    font-family: var(--zdp-font-family-serif);
    font-weight: var(--zdp-font-weight-semibold);
    gap: var(--zdp-space-2);
    justify-content: center;
    line-height: var(--zdp-font-line-height-tight);
    min-height: 2.75rem;
    text-decoration: none;
    text-align: center;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      box-shadow var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease,
      transform var(--zdp-motion-fast) ease;
  }

  .zdp-button--sm {
    font-size: var(--zdp-font-size-sm);
    min-height: 2.25rem;
    padding: 0 var(--zdp-space-3);
  }

  .zdp-button--md {
    font-size: var(--zdp-font-size-md);
    min-height: 2.75rem;
    padding: 0 var(--zdp-space-4);
  }

  .zdp-button--primary {
    background: linear-gradient(
      180deg,
      var(--zdp-color-accent-primary),
      var(--zdp-color-accent-primary-strong)
    );
    border-color: var(--zdp-color-accent-primary-strong);
    color: var(--zdp-color-ink-inverse);
  }

  .zdp-button--primary:hover:not(:disabled) {
    box-shadow: var(--zdp-shadow-md);
    transform: translateY(-1px);
  }

  .zdp-button--secondary {
    background: linear-gradient(180deg, var(--zdp-color-surface-panel), var(--zdp-color-surface-raised));
    border-color: var(--zdp-color-line-subtle);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-button--secondary:hover:not(:disabled) {
    border-color: var(--zdp-color-line-strong);
    box-shadow: var(--zdp-shadow-md);
    transform: translateY(-1px);
  }

  :global([data-zdp-theme="dark"]) .zdp-button--secondary {
    background: var(--zdp-color-surface-panel);
    border-color: var(--zdp-color-line-subtle);
    box-shadow: none;
    color: var(--zdp-color-ink-muted);
  }

  :global([data-zdp-theme="dark"]) .zdp-button--secondary:hover:not(:disabled) {
    background: var(--zdp-color-surface-raised);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-button--danger {
    background: linear-gradient(180deg, var(--zdp-color-accent-danger), var(--zdp-color-surface-inverse));
    border-color: var(--zdp-color-accent-danger);
    color: var(--zdp-color-ink-inverse);
  }

  :global([data-zdp-theme="dark"]) .zdp-button--danger {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-accent-danger);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-button--danger:hover:not(:disabled) {
    box-shadow: var(--zdp-shadow-md);
    transform: translateY(-1px);
  }

  .zdp-button:focus-visible {
    box-shadow: var(--zdp-shadow-focus);
    outline: none;
  }

  .zdp-button:disabled {
    cursor: not-allowed;
    opacity: 0.56;
    transform: none;
  }
</style>

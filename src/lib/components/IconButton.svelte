<script lang="ts">
  export let ariaLabel: string;
  export let title: string | null = null;
  export let variant: 'ghost' | 'solid' = 'ghost';
  export let size: 'sm' | 'md' = 'md';
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let disabled = false;
</script>

<button
  class={`zdp-icon-button zdp-icon-button--${variant} zdp-icon-button--${size}`}
  aria-label={ariaLabel}
  title={title ?? ariaLabel}
  {type}
  {disabled}
>
  <span class="zdp-icon-button__glyph" aria-hidden="true">
    <slot />
  </span>
</button>

<style>
  .zdp-icon-button {
    align-items: center;
    border: 1px solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-radius-md);
    box-shadow: var(--zdp-shadow-sm);
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      box-shadow var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
  }

  .zdp-icon-button--sm {
    height: 2.25rem;
    width: 2.25rem;
  }

  .zdp-icon-button--md {
    height: 2.75rem;
    width: 2.75rem;
  }

  .zdp-icon-button--ghost {
    background: var(--zdp-color-surface-panel);
    color: var(--zdp-color-ink-normal);
  }

  .zdp-icon-button--ghost:hover:not(:disabled) {
    background: var(--zdp-color-surface-raised);
    color: var(--zdp-color-ink-strong);
  }

  :global([data-zdp-theme="dark"]) .zdp-icon-button--ghost {
    background: var(--zdp-color-surface-panel);
    border-color: var(--zdp-color-line-subtle);
    box-shadow: none;
    color: var(--zdp-color-ink-muted);
  }

  :global([data-zdp-theme="dark"]) .zdp-icon-button--ghost:hover:not(:disabled) {
    background: var(--zdp-color-surface-raised);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-icon-button--solid {
    background: linear-gradient(
      180deg,
      var(--zdp-color-accent-primary),
      var(--zdp-color-accent-primary-strong)
    );
    border-color: var(--zdp-color-accent-primary-strong);
    color: var(--zdp-color-ink-inverse);
  }

  .zdp-icon-button:focus-visible {
    box-shadow: var(--zdp-shadow-focus);
    outline: none;
  }

  .zdp-icon-button:disabled {
    cursor: not-allowed;
    opacity: 0.56;
  }

  .zdp-icon-button__glyph {
    display: inline-flex;
    height: 1.25rem;
    width: 1.25rem;
  }

  .zdp-icon-button__glyph :global(svg) {
    height: 100%;
    width: 100%;
  }
</style>

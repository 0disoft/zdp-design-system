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
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong);
    border-radius: var(--zdp-control-radius);
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
  }

  .zdp-icon-button--sm {
    height: var(--zdp-control-icon-sm);
    width: var(--zdp-control-icon-sm);
  }

  .zdp-icon-button--md {
    height: var(--zdp-control-icon-md);
    width: var(--zdp-control-icon-md);
  }

  .zdp-icon-button--ghost {
    background: var(--zdp-color-surface-panel);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-normal);
  }

  .zdp-icon-button--ghost:hover:not(:disabled) {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-strong);
  }

  :global([data-zdp-theme="dark"]) .zdp-icon-button--ghost {
    background: var(--zdp-color-surface-panel);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-muted);
  }

  :global([data-zdp-theme="dark"]) .zdp-icon-button--ghost:hover:not(:disabled) {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-icon-button--ghost:active:not(:disabled) {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-icon-button--solid {
    background: var(--zdp-color-accent-primary);
    border-color: var(--zdp-color-accent-primary-strong);
    color: var(--zdp-color-ink-inverse);
  }

  .zdp-icon-button--solid:hover:not(:disabled) {
    background: var(--zdp-color-accent-primary-strong);
    border-color: var(--zdp-color-accent-primary-strong);
  }

  .zdp-icon-button--solid:active:not(:disabled) {
    background: var(--zdp-color-accent-primary-strong);
    border-color: var(--zdp-color-accent-primary-strong);
  }

  .zdp-icon-button:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-icon-button:disabled {
    cursor: not-allowed;
    opacity: 0.56;
  }

  .zdp-icon-button__glyph {
    align-items: center;
    display: inline-flex;
    height: 1.25rem;
    justify-content: center;
    line-height: 1;
    width: 1.25rem;
  }

  .zdp-icon-button__glyph :global(svg) {
    height: 100%;
    width: 100%;
  }
</style>

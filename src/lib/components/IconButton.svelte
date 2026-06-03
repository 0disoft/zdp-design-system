<script lang="ts">
  export let ariaLabel: string;
  export let title: string | null = null;
  export let variant: 'ghost' | 'solid' = 'ghost';
  export let size: 'sm' | 'md' = 'md';
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let disabled = false;
  export let id: string | null = null;
  export let name: string | null = null;
  export let value: string | null = null;
  export let form: string | null = null;
  export let ariaControls: string | null = null;
  export let ariaDescribedBy: string | null = null;
  export let ariaExpanded: boolean | null = null;
  export let ariaPressed: boolean | null = null;
  export let onclick: ((event: MouseEvent) => void) | null = null;
</script>

<button
  class={`zdp-icon-button zdp-icon-button--${variant} zdp-icon-button--${size}`}
  {id}
  {name}
  {value}
  {form}
  aria-label={ariaLabel}
  title={title ?? ariaLabel}
  {type}
  {disabled}
  aria-controls={ariaControls ?? undefined}
  aria-describedby={ariaDescribedBy ?? undefined}
  aria-expanded={ariaExpanded ?? undefined}
  aria-pressed={ariaPressed ?? undefined}
  onclick={onclick ?? undefined}
>
  <span class={`zdp-icon zdp-icon--${size} zdp-icon-button__glyph`} aria-hidden="true">
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
    font-family: var(--zdp-font-family-sans);
    font-weight: var(--zdp-font-weight-regular);
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

  .zdp-icon,
  .zdp-icon-button__glyph {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
    justify-content: center;
    line-height: 1;
    text-align: center;
  }

  .zdp-icon--sm {
    font-size: var(--zdp-control-glyph-sm);
    height: var(--zdp-control-glyph-sm);
    width: var(--zdp-control-glyph-sm);
  }

  .zdp-icon--md {
    font-size: var(--zdp-control-glyph-md);
    height: var(--zdp-control-glyph-md);
    width: var(--zdp-control-glyph-md);
  }

  .zdp-icon :global(svg),
  .zdp-icon-button__glyph :global(svg) {
    display: block;
    flex: 0 0 auto;
    height: 100%;
    width: 100%;
  }
</style>

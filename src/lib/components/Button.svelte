<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'danger' | 'text' = 'primary';
  export let size: 'sm' | 'md' = 'md';
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let disabled = false;
  export let id: string | null = null;
  export let name: string | null = null;
  export let value: string | null = null;
  export let form: string | null = null;
  export let ariaLabel: string | null = null;
  export let ariaControls: string | null = null;
  export let ariaDescribedBy: string | null = null;
  export let ariaExpanded: boolean | null = null;
  export let ariaPressed: boolean | null = null;
  export let ariaKeyShortcuts: string | null = null;
  export let onclick: ((event: MouseEvent) => void) | null = null;
</script>

<button
  class={`zdp-button zdp-button--${variant} zdp-button--${size}`}
  {id}
  {name}
  {value}
  {form}
  {type}
  {disabled}
  aria-disabled={disabled}
  aria-label={ariaLabel ?? undefined}
  aria-controls={ariaControls ?? undefined}
  aria-describedby={ariaDescribedBy ?? undefined}
  aria-expanded={ariaExpanded ?? undefined}
  aria-pressed={ariaPressed ?? undefined}
  aria-keyshortcuts={ariaKeyShortcuts ?? undefined}
  onclick={onclick ?? undefined}
>
  <slot />
</button>

<style>
  .zdp-button {
    align-items: center;
    border: var(--zdp-control-border-width) solid transparent;
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
    -webkit-user-select: none;
    user-select: none;
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
    border-color: transparent;
    color: var(--zdp-color-ink-strong);
  }

  .zdp-button--primary:hover:not(:disabled) {
    background: var(--zdp-color-accent-primary-strong);
    border-color: transparent;
  }

  .zdp-button--primary:active:not(:disabled) {
    background: var(--zdp-color-accent-primary-strong);
    border-color: transparent;
  }

  :global([data-zdp-theme="dark"]) .zdp-button--primary {
    color: var(--zdp-color-ink-inverse);
  }

  .zdp-button--secondary {
    background: var(--zdp-color-surface-raised);
    border-color: transparent;
    color: var(--zdp-color-ink-strong);
  }

  .zdp-button--secondary:hover:not(:disabled) {
    background: var(--zdp-color-surface-panel);
    border-color: transparent;
    color: var(--zdp-color-ink-strong);
  }

  .zdp-button--secondary:active:not(:disabled) {
    background: var(--zdp-color-surface-panel);
    border-color: transparent;
  }

  :global([data-zdp-theme="dark"]) .zdp-button--secondary {
    background: var(--zdp-color-surface-raised);
    border-color: transparent;
    color: var(--zdp-color-ink-muted);
  }

  :global([data-zdp-theme="dark"]) .zdp-button--secondary:hover:not(:disabled) {
    background: var(--zdp-color-surface-panel);
    border-color: transparent;
    color: var(--zdp-color-ink-strong);
  }

  .zdp-button--danger {
    background: var(--zdp-color-accent-danger);
    border-color: transparent;
    color: var(--zdp-color-ink-inverse);
  }

  :global([data-zdp-theme="dark"]) .zdp-button--danger {
    background: var(--zdp-color-accent-danger);
    border-color: transparent;
    color: var(--zdp-color-ink-inverse);
  }

  .zdp-button--danger:hover:not(:disabled) {
    background: var(--zdp-color-surface-panel);
  }

  :global([data-zdp-theme="dark"]) .zdp-button--danger:hover:not(:disabled) {
    background: var(--zdp-color-surface-panel);
    border-color: transparent;
    color: var(--zdp-color-accent-danger);
  }

  .zdp-button--danger:active:not(:disabled) {
    background: var(--zdp-color-surface-panel);
    border-color: transparent;
    color: var(--zdp-color-accent-danger);
  }

  .zdp-button--text {
    background: transparent;
    border-color: transparent;
    border-radius: var(--zdp-radius-none);
    color: var(--zdp-color-ink-strong);
    padding-inline: var(--zdp-space-2);
    position: relative;
  }

  .zdp-button--text::after {
    background: var(--zdp-color-line-strong);
    border-radius: var(--zdp-radius-sm);
    content: '';
    inset-block-end: var(--zdp-space-1);
    inset-inline: var(--zdp-space-2);
    min-block-size: var(--zdp-control-border-width);
    pointer-events: none;
    position: absolute;
    transition:
      background-color var(--zdp-motion-fast) ease,
      transform var(--zdp-motion-fast) ease;
  }

  .zdp-button--text:hover:not(:disabled),
  .zdp-button--text:active:not(:disabled) {
    background: transparent;
    border-color: transparent;
    color: var(--zdp-color-ink-strong);
  }

  .zdp-button--text:hover:not(:disabled)::after,
  .zdp-button--text:active:not(:disabled)::after {
    background: var(--zdp-color-accent-primary-strong);
    min-block-size: var(--zdp-control-focus-underline-width);
    transform: scaleX(1.08);
  }

  .zdp-button:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-button--text:focus-visible {
    border-color: transparent;
  }

  .zdp-button--text:focus-visible::after {
    background: var(--zdp-color-focus-line);
    min-block-size: var(--zdp-control-focus-underline-width);
  }

  .zdp-button:disabled {
    cursor: not-allowed;
    opacity: 0.56;
  }

  @media (forced-colors: active) {
    .zdp-button:not(.zdp-button--text) {
      border-color: ButtonText;
    }

    .zdp-button--text::after {
      background: ButtonText;
    }
  }

</style>

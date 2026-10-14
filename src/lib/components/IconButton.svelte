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
  export let ariaKeyShortcuts: string | null = null;
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
  aria-keyshortcuts={ariaKeyShortcuts ?? undefined}
  onclick={onclick ?? undefined}
>
  <span class={`zdp-icon zdp-icon--${size} zdp-icon-button__glyph`} aria-hidden="true">
    <slot />
  </span>
</button>

<style>
  .zdp-icon-button {
    align-items: center;
    border: var(--zdp-control-border-width) solid transparent;
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    cursor: pointer;
    display: inline-flex;
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-control-size);
    font-weight: var(--zdp-font-weight-regular);
    justify-content: center;
    line-height: var(--zdp-type-control-line-height);
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    -webkit-user-select: none;
    user-select: none;
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
    background: transparent;
    border-color: transparent;
    color: var(--zdp-color-ink-normal);
  }

  .zdp-icon-button--ghost:where(:hover:not(:disabled)) {
    background: var(--zdp-color-interaction-hover);
    border-color: transparent;
    color: var(--zdp-color-ink-strong);
  }

  .zdp-icon-button--ghost:where(:active:not(:disabled)) {
    background: var(--zdp-color-interaction-pressed);
    border-color: transparent;
    color: var(--zdp-color-ink-strong);
  }

  .zdp-icon-button--solid {
    background: var(--zdp-color-surface-inverse);
    border-color: transparent;
    color: var(--zdp-color-ink-inverse);
  }

  .zdp-icon-button--solid:where(:hover:not(:disabled)) {
    background: color-mix(in oklch, var(--zdp-color-surface-inverse) 94%, var(--zdp-color-ink-inverse));
    border-color: transparent;
    color: var(--zdp-color-ink-inverse);
  }

  .zdp-icon-button--solid:where(:active:not(:disabled)) {
    background: color-mix(in oklch, var(--zdp-color-surface-inverse) 88%, var(--zdp-color-ink-inverse));
    border-color: transparent;
    color: var(--zdp-color-ink-inverse);
  }

  .zdp-icon-button:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-icon-button:disabled {
    cursor: not-allowed;
    opacity: var(--zdp-control-disabled-opacity);
  }

  @media (forced-colors: active) {
    .zdp-icon-button {
      border-color: ButtonText;
    }
  }

  .zdp-icon,
  .zdp-icon-button__glyph {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
    justify-content: center;
    line-height: 1;
    text-align: center;
    -webkit-user-select: none;
    user-select: none;
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

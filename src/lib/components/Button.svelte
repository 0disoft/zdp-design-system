<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'danger' | 'text' = 'primary';
  export let size: 'sm' | 'md' = 'md';
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let disabled = false;
  export let loading: boolean | undefined = undefined;
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

  let clickLatch = false;

  function releaseClickLatch() {
    clickLatch = false;
  }

  function handleClick(event: MouseEvent) {
    if (disabled || loading === true || clickLatch) {
      event.preventDefault();
      return;
    }

    if (loading !== undefined) {
      clickLatch = true;
      queueMicrotask(releaseClickLatch);
    }

    onclick?.(event);
  }
</script>

<button
  class={`zdp-button zdp-button--${variant} zdp-button--${size}`}
  {id}
  {name}
  {value}
  {form}
  {type}
  disabled={disabled || loading === true}
  aria-disabled={disabled || loading === true}
  aria-busy={loading === true ? 'true' : undefined}
  data-loading={loading === undefined ? undefined : loading ? 'true' : 'false'}
  data-disabled={disabled ? 'true' : undefined}
  aria-label={ariaLabel ?? undefined}
  aria-controls={ariaControls ?? undefined}
  aria-describedby={ariaDescribedBy ?? undefined}
  aria-expanded={ariaExpanded ?? undefined}
  aria-pressed={ariaPressed ?? undefined}
  aria-keyshortcuts={ariaKeyShortcuts ?? undefined}
  onclick={handleClick}
>
  {#if loading !== undefined}
    <span class="zdp-button__spinner" aria-hidden="true"></span>
  {/if}
  <slot />
</button>

<style>
  .zdp-button {
    align-items: center;
    border: var(--zdp-control-border-width) solid transparent;
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
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
    padding: 0 var(--zdp-control-padding-sm);
  }

  .zdp-button--md {
    font-size: var(--zdp-type-control-size);
    min-height: var(--zdp-control-height-md);
    padding: 0 var(--zdp-control-padding-md);
  }

  .zdp-button--primary {
    background: var(--zdp-color-surface-inverse);
    border-color: transparent;
    color: var(--zdp-color-ink-inverse);
  }

  .zdp-button--primary:where(:hover:not(:disabled)) {
    background: color-mix(in oklch, var(--zdp-color-surface-inverse) 94%, var(--zdp-color-ink-inverse));
    border-color: transparent;
    color: var(--zdp-color-ink-inverse);
  }

  .zdp-button--primary:where(:active:not(:disabled)) {
    background: color-mix(in oklch, var(--zdp-color-surface-inverse) 88%, var(--zdp-color-ink-inverse));
    border-color: transparent;
    color: var(--zdp-color-ink-inverse);
  }

  .zdp-button--secondary {
    background: var(--zdp-color-surface-panel);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-button--secondary:where(:hover:not(:disabled)) {
    background: var(--zdp-color-interaction-hover);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-button--secondary:where(:active:not(:disabled)) {
    background: var(--zdp-color-interaction-pressed);
    border-color: var(--zdp-color-line-strong);
  }

  .zdp-button--danger {
    background: var(--zdp-color-accent-danger);
    border-color: transparent;
    color: var(--zdp-color-ink-inverse);
  }

  .zdp-button--danger:where(:hover:not(:disabled)) {
    background: var(--zdp-color-accent-danger);
    background: color-mix(in oklch, var(--zdp-color-accent-danger) 90%, var(--zdp-color-surface-inverse));
    border-color: transparent;
    color: var(--zdp-color-ink-inverse);
  }

  .zdp-button--danger:where(:active:not(:disabled)) {
    background: var(--zdp-color-accent-danger);
    background: color-mix(in oklch, var(--zdp-color-accent-danger) 82%, var(--zdp-color-surface-inverse));
    border-color: transparent;
    color: var(--zdp-color-ink-inverse);
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
    min-block-size: 2px;
    pointer-events: none;
    position: absolute;
    transition:
      background-color var(--zdp-motion-fast) ease,
      transform var(--zdp-motion-fast) ease;
  }

  .zdp-button--text:where(:hover:not(:disabled)),
  .zdp-button--text:where(:active:not(:disabled)) {
    background: transparent;
    border-color: transparent;
    color: var(--zdp-color-ink-strong);
  }

  .zdp-button--text:where(:hover:not(:disabled))::after,
  .zdp-button--text:where(:active:not(:disabled))::after {
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
    opacity: var(--zdp-control-disabled-opacity);
  }

  .zdp-button__spinner {
    block-size: var(--zdp-control-glyph-sm);
    border: 2px solid var(--zdp-color-line-subtle);
    border-block-start-color: currentColor;
    border-inline-end-color: currentColor;
    border-radius: 50%;
    box-sizing: border-box;
    display: none;
    flex: 0 0 auto;
    inline-size: var(--zdp-control-glyph-sm);
  }

  .zdp-button[data-loading="true"] .zdp-button__spinner {
    animation: zdp-button-loading-rotate 1s linear infinite;
    display: block;
  }

  .zdp-button[data-loading="true"]:not([data-disabled="true"]) {
    cursor: progress;
    opacity: 1;
  }

  @keyframes zdp-button-loading-rotate {
    to {
      transform: rotate(1turn);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .zdp-button[data-loading="true"] .zdp-button__spinner {
      animation: none;
    }
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

<script lang="ts">
  export let as: 'article' | 'div' | 'section' = 'article';
  export let tone: 'panel' | 'raised' | 'outline' = 'panel';
  export let padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  export let hover = false;
  export let id: string | null = null;
  export let ariaLabel: string | null = null;
  export let ariaLabelledBy: string | null = null;

  $: role = as === 'div' ? 'region' : undefined;
</script>

<svelte:element
  this={as}
  class={`zdp-card zdp-card--${tone} zdp-card--padding-${padding} ${hover ? 'zdp-card--hover' : ''}`}
  {id}
  role={role}
  aria-label={ariaLabel ?? undefined}
  aria-labelledby={ariaLabelledBy ?? undefined}
>
  {#if $$slots.header}
    <div class="zdp-card__header">
      <slot name="header" />
    </div>
  {/if}

  {#if $$slots.body || $$slots.default}
    <div class="zdp-card__body">
      <slot name="body" />
      <slot />
    </div>
  {/if}

  {#if $$slots.footer}
    <div class="zdp-card__footer">
      <slot name="footer" />
    </div>
  {/if}

  {#if $$slots.actions}
    <div class="zdp-card__actions">
      <slot name="actions" />
    </div>
  {/if}
</svelte:element>

<style>
  .zdp-card {
    border: 1px solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-radius-lg);
    box-sizing: border-box;
    color: var(--zdp-color-ink-normal);
    display: grid;
    font-family: var(--zdp-font-family-sans);
    gap: var(--zdp-space-4);
    min-width: 0;
  }

  .zdp-card--panel {
    background: var(--zdp-color-surface-panel);
  }

  .zdp-card--raised {
    background: var(--zdp-color-surface-raised);
  }

  .zdp-card--outline {
    background: transparent;
  }

  .zdp-card--padding-none {
    padding: 0;
  }

  .zdp-card--padding-sm {
    padding: var(--zdp-space-3);
  }

  .zdp-card--padding-md {
    padding: var(--zdp-space-4);
  }

  .zdp-card--padding-lg {
    padding: var(--zdp-space-6);
  }

  .zdp-card--hover {
    cursor: pointer;
    transition: border-color var(--zdp-motion-fast) ease;
  }

  .zdp-card--hover:hover {
    border-color: var(--zdp-color-line-strong);
  }

  .zdp-card--hover:focus-visible {
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-line);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-card__header {
    display: grid;
    gap: var(--zdp-space-2);
    min-width: 0;
  }

  .zdp-card__body {
    display: grid;
    gap: var(--zdp-space-2);
    min-width: 0;
  }

  .zdp-card__body :global(*) {
    margin-block: 0;
  }

  .zdp-card__body :global(:where(h1, h2, h3, h4, h5, h6)) {
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-display);
    font-size: var(--zdp-type-title-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-title-line-height);
  }

  .zdp-card__body :global(p) {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-body-small-size);
    line-height: var(--zdp-type-body-small-line-height);
  }

  .zdp-card__footer {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-caption-size);
    line-height: var(--zdp-type-caption-line-height);
    min-width: 0;
  }

  .zdp-card__actions {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--zdp-space-2);
    min-width: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .zdp-card--hover {
      transition: none;
    }
  }
</style>

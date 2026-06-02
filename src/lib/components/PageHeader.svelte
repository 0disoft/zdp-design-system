<script lang="ts">
  export let as: 'header' | 'div' = 'header';
  export let align: 'start' | 'center' = 'start';
  export let id: string | null = null;
  export let labelledBy: string | null = null;
</script>

<svelte:element
  this={as}
  class={`zdp-page-header zdp-page-header--align-${align}`}
  {id}
  aria-labelledby={labelledBy ?? undefined}
>
  <div class="zdp-page-header__body">
    <slot name="eyebrow" />
    <div class="zdp-page-header__title">
      <slot />
    </div>
    <div class="zdp-page-header__summary">
      <slot name="summary" />
    </div>
  </div>
  <div class="zdp-page-header__actions">
    <slot name="actions" />
  </div>
</svelte:element>

<style>
  .zdp-page-header {
    align-items: start;
    display: grid;
    gap: var(--zdp-space-4);
    grid-template-columns: minmax(0, 1fr) auto;
    min-width: 0;
  }

  .zdp-page-header--align-center {
    align-items: center;
  }

  .zdp-page-header__body {
    display: grid;
    gap: var(--zdp-space-2);
    min-width: 0;
  }

  .zdp-page-header__title {
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-display);
    line-height: var(--zdp-type-title-line-height);
    min-width: 0;
  }

  .zdp-page-header__title :global(:where(h1, h2, h3)) {
    color: inherit;
    font: inherit;
    margin: 0;
  }

  .zdp-page-header__summary {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-body-size);
    line-height: var(--zdp-type-body-line-height);
    max-inline-size: 42rem;
    min-width: 0;
  }

  .zdp-page-header__summary :global(:where(p)) {
    margin: 0;
  }

  .zdp-page-header__actions {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--zdp-space-2);
    justify-content: flex-end;
    min-width: 0;
  }

  @media (max-width: 48rem) {
    .zdp-page-header {
      grid-template-columns: 1fr;
    }

    .zdp-page-header__actions {
      justify-content: flex-start;
    }
  }
</style>

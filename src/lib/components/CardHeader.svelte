<script lang="ts">
  export let as: 'h2' | 'h3' | 'h4' | 'h5' | 'div' = 'h3';
  export let id: string | null = null;
</script>

<div class="zdp-card-header">
  <svelte:element this={as} class="zdp-card-header__title" {id}>
    <slot />
  </svelte:element>
  {#if $$slots.subtitle}
    <p class="zdp-card-header__subtitle">
      <slot name="subtitle" />
    </p>
  {/if}
  {#if $$slots.badge}
    <span class="zdp-card-header__badge">
      <slot name="badge" />
    </span>
  {/if}
</div>

<style>
  .zdp-card-header {
    align-items: start;
    display: grid;
    gap: var(--zdp-space-1);
    grid-template-columns: 1fr auto;
    min-width: 0;
  }

  .zdp-card-header__title {
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-display);
    font-size: var(--zdp-type-title-size);
    font-weight: var(--zdp-font-weight-medium);
    grid-column: 1 / -1;
    line-height: var(--zdp-type-title-line-height);
    margin: 0;
    min-width: 0;
  }

  .zdp-card-header__subtitle {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-body-small-size);
    grid-column: 1 / -1;
    line-height: var(--zdp-type-body-small-line-height);
    margin: 0;
    min-width: 0;
  }

  .zdp-card-header__badge {
    align-self: center;
    grid-column: 2;
    grid-row: 1;
    justify-self: end;
    min-width: 0;
  }
</style>

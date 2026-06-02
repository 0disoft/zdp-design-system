<script lang="ts">
  export let columns: 'one' | 'two' = 'one';
  export let density: 'default' | 'compact' = 'default';
  export let labelledBy: string | null = null;
</script>

<dl
  class={`zdp-key-value zdp-key-value--columns-${columns} zdp-key-value--density-${density}`}
  aria-labelledby={labelledBy ?? undefined}
>
  <slot />
</dl>

<style>
  .zdp-key-value {
    border: 1px solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    color: var(--zdp-color-ink-normal);
    display: grid;
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-body-small-size);
    line-height: var(--zdp-type-body-small-line-height);
    margin: 0;
    min-width: 0;
  }

  .zdp-key-value :global(dt),
  .zdp-key-value :global(dd) {
    border-block-start: 1px solid var(--zdp-color-line-subtle);
    margin: 0;
    min-width: 0;
    padding: var(--zdp-space-3) var(--zdp-space-4);
  }

  .zdp-key-value :global(dt:first-child),
  .zdp-key-value :global(dt:first-child + dd) {
    border-block-start: 0;
  }

  .zdp-key-value :global(dt) {
    color: var(--zdp-color-ink-muted);
    font-weight: var(--zdp-font-weight-medium);
  }

  .zdp-key-value :global(dd) {
    color: var(--zdp-color-ink-strong);
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
  }

  .zdp-key-value--columns-two {
    grid-template-columns: minmax(10rem, 0.42fr) minmax(0, 1fr);
  }

  .zdp-key-value--columns-one {
    grid-template-columns: 1fr;
  }

  .zdp-key-value--density-compact :global(dt),
  .zdp-key-value--density-compact :global(dd) {
    padding: var(--zdp-space-2) var(--zdp-space-3);
  }

  @media (max-width: 42rem) {
    .zdp-key-value--columns-two {
      grid-template-columns: 1fr;
    }

    .zdp-key-value--columns-two :global(dd) {
      border-block-start: 0;
      padding-block-start: 0;
    }
  }
</style>

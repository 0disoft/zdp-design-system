<script lang="ts">
  export let caption: string | null = null;
  export let captionMode: 'visible' | 'hidden' = 'visible';
  export let density: 'default' | 'compact' = 'default';
  export let labelledBy: string | null = null;
</script>

<div class="zdp-table-wrap">
  <table
    class={`zdp-table zdp-table--density-${density}`}
    aria-labelledby={labelledBy ?? undefined}
  >
    {#if caption}
      <caption class={`zdp-table__caption zdp-table__caption--${captionMode}`}>
        {caption}
      </caption>
    {/if}
    <slot />
  </table>
</div>

<style>
  .zdp-table-wrap {
    border: 1px solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    max-width: 100%;
    overflow-x: auto;
  }

  .zdp-table {
    border-collapse: collapse;
    color: var(--zdp-color-ink-normal);
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-body-small-size);
    inline-size: 100%;
    line-height: var(--zdp-type-body-small-line-height);
    min-inline-size: 36rem;
  }

  .zdp-table__caption {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-label-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-label-line-height);
    padding: var(--zdp-space-3) var(--zdp-space-4);
    text-align: start;
  }

  .zdp-table__caption--hidden {
    border: 0;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }

  .zdp-table :global(th),
  .zdp-table :global(td) {
    border-block-start: 1px solid var(--zdp-color-line-subtle);
    padding: var(--zdp-space-3) var(--zdp-space-4);
    text-align: start;
    vertical-align: top;
  }

  .zdp-table :global(th) {
    color: var(--zdp-color-ink-strong);
    font-weight: var(--zdp-font-weight-medium);
  }

  .zdp-table :global(thead th) {
    background: var(--zdp-color-surface-raised);
  }

  .zdp-table--density-compact :global(th),
  .zdp-table--density-compact :global(td) {
    padding: var(--zdp-space-2) var(--zdp-space-3);
  }
</style>

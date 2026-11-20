<script lang="ts">
  interface Props {
    caption?: string | null;
    captionMode?: 'visible' | 'hidden';
    density?: 'default' | 'compact';
    labelledBy?: string | null;
  }

  let {
    caption = $bindable(null),
    captionMode = $bindable('visible'),
    density = $bindable('default'),
    labelledBy = $bindable(null)
  }: Props = $props();

  let wrapper: HTMLDivElement;
  let table: HTMLTableElement;
  let hasMoreColumns = $state(false);

  function updateScrollCue(): void {
    hasMoreColumns = wrapper.scrollWidth - wrapper.clientWidth - Math.abs(wrapper.scrollLeft) > 1;
  }

  $effect(() => {
    updateScrollCue();
    const observer = new ResizeObserver(updateScrollCue);
    observer.observe(wrapper);
    observer.observe(table);
    return () => observer.disconnect();
  });
</script>

<div class="zdp-table-wrap" bind:this={wrapper} onscroll={updateScrollCue}>
  <table
    bind:this={table}
    class={`zdp-table zdp-table--density-${density}`}
    aria-labelledby={labelledBy ?? undefined}
  >
    {#if caption}
      <caption class={`zdp-table__caption zdp-table__caption--${captionMode}`}>
        {caption}
      </caption>
    {/if}
    <!-- svelte-ignore slot_element_deprecated public slot compatibility --><slot />
  </table>
  {#if hasMoreColumns}
    <span class="zdp-table__scroll-cue" aria-hidden="true"></span>
  {/if}
</div>

<style>
  .zdp-table-wrap {
    background: var(--zdp-color-surface-panel);
    border: 1px solid transparent;
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    container: zdp-table / inline-size;
    max-width: 100%;
    min-width: 0;
    overscroll-behavior-inline: contain;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-x pan-y;
  }

  .zdp-table {
    background: var(--zdp-color-surface-panel);
    border-collapse: collapse;
    color: var(--zdp-color-ink-normal);
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-body-small-size);
    inline-size: 100%;
    line-height: var(--zdp-type-body-small-line-height);
    min-inline-size: var(--zdp-table-min-inline-size, 0);
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
    background: var(--zdp-color-surface-panel);
    border-block-start: 1px solid var(--zdp-color-line-subtle);
    overflow-wrap: normal;
    padding: var(--zdp-space-3) var(--zdp-space-4);
    text-align: start;
    vertical-align: top;
    white-space: var(--zdp-table-cell-white-space, nowrap);
    word-break: normal;
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

  @container zdp-table (max-width: 36rem) {
    .zdp-table :global(th),
    .zdp-table :global(td) {
      padding-inline: var(--zdp-space-3);
      white-space: var(--zdp-table-cell-white-space, normal);
      word-break: keep-all;
    }

    .zdp-table :global(.zdp-sort-header__label) {
      overflow-wrap: normal;
    }
  }

  .zdp-table__scroll-cue {
    color: var(--zdp-color-ink-strong);
    display: block;
    inline-size: 100cqi;
    inset-inline-start: 0;
    pointer-events: none;
    position: sticky;
  }

  .zdp-table__scroll-cue::after {
    background: var(--zdp-color-interaction-hover);
    border: 1px solid transparent;
    border-radius: var(--zdp-control-radius);
    content: '›';
    display: grid;
    inline-size: var(--zdp-control-glyph-md);
    inset-block-end: var(--zdp-space-1);
    inset-inline-end: var(--zdp-space-1);
    line-height: var(--zdp-control-glyph-md);
    place-items: center;
    position: absolute;
  }

  .zdp-table__scroll-cue:dir(rtl)::after {
    content: '‹';
  }

  @media (forced-colors: active) {
    .zdp-table__scroll-cue::after {
      border-color: CanvasText;
    }
  }
</style>

<script lang="ts">
  interface Props {
    as?: 'main' | 'div';
    tone?: 'canvas' | 'panel';
    id?: string | null;
    labelledBy?: string | null;
  }

  let {
    as = $bindable('main'),
    tone = $bindable('canvas'),
    id = $bindable(null),
    labelledBy = $bindable(null)
  }: Props = $props();

  let labelledRegionRole = $derived(as === 'div' && labelledBy ? 'region' : undefined);
</script>

<svelte:element
  this={as}
  class={`zdp-page zdp-page--${tone} zdp-surface-reset`}
  {id}
  role={labelledRegionRole}
  aria-labelledby={labelledBy ?? undefined}
>
  <!-- svelte-ignore slot_element_deprecated public slot compatibility --><slot />
</svelte:element>

<style>
  .zdp-page {
    background: var(--zdp-color-surface-canvas);
    color: var(--zdp-color-ink-normal);
    display: grid;
    min-block-size: 100%;
    min-width: 0;
  }

  .zdp-page--canvas {
    background: var(--zdp-color-surface-canvas);
  }

  .zdp-page--panel {
    background: var(--zdp-color-surface-panel);
  }
</style>

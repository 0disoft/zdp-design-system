<script lang="ts">
  export let as: 'main' | 'div' = 'main';
  export let tone: 'canvas' | 'panel' = 'canvas';
  export let id: string | null = null;
  export let labelledBy: string | null = null;

  $: labelledRegionRole = as === 'div' && labelledBy ? 'region' : undefined;
</script>

<svelte:element
  this={as}
  class={`zdp-page zdp-page--${tone} zdp-surface-reset`}
  {id}
  role={labelledRegionRole}
  aria-labelledby={labelledBy ?? undefined}
>
  <slot />
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

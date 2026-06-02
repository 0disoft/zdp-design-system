<script lang="ts">
  export let as: 'section' | 'div' | 'article' = 'section';
  export let spacing: 'sm' | 'md' | 'lg' | 'xl' = 'lg';
  export let tone: 'plain' | 'panel' | 'raised' = 'plain';
  export let id: string | null = null;
  export let labelledBy: string | null = null;
</script>

<svelte:element
  this={as}
  class={`zdp-section zdp-section--spacing-${spacing} zdp-section--${tone}`}
  {id}
  aria-labelledby={labelledBy ?? undefined}
>
  <slot />
</svelte:element>

<style>
  .zdp-section {
    min-width: 0;
  }

  .zdp-section--spacing-sm {
    padding-block: var(--zdp-space-4);
  }

  .zdp-section--spacing-md {
    padding-block: var(--zdp-space-6);
  }

  .zdp-section--spacing-lg {
    padding-block: var(--zdp-space-8);
  }

  .zdp-section--spacing-xl {
    padding-block: var(--zdp-space-12);
  }

  .zdp-section--plain {
    background: transparent;
  }

  .zdp-section--panel {
    background: var(--zdp-color-surface-panel);
    border-block: 1px solid var(--zdp-color-line-subtle);
  }

  .zdp-section--raised {
    background: var(--zdp-color-surface-raised);
    border-block: 1px solid var(--zdp-color-line-subtle);
  }
</style>

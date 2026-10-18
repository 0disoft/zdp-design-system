<script lang="ts">
  interface Props {
    as?: 'section' | 'div' | 'article';
    spacing?: 'sm' | 'md' | 'lg' | 'xl';
    tone?: 'plain' | 'panel' | 'raised';
    id?: string | null;
    labelledBy?: string | null;
  }

  let {
    as = $bindable('section'),
    spacing = $bindable('lg'),
    tone = $bindable('plain'),
    id = $bindable(null),
    labelledBy = $bindable(null)
  }: Props = $props();
</script>

<svelte:element
  this={as}
  class={`zdp-section zdp-section--spacing-${spacing} zdp-section--${tone}`}
  {id}
  aria-labelledby={labelledBy ?? undefined}
>
  <!-- svelte-ignore slot_element_deprecated public slot compatibility --><slot />
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

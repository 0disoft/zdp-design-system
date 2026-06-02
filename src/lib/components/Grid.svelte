<script lang="ts">
  export let as: 'div' | 'section' | 'ul' | 'ol' = 'div';
  export let columns: 'one' | 'two' | 'three' | 'four' | 'auto' = 'auto';
  export let gap: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  export let labelledBy: string | null = null;
</script>

<svelte:element
  this={as}
  class={`zdp-grid zdp-grid--columns-${columns} zdp-grid--gap-${gap}`}
  aria-labelledby={labelledBy ?? undefined}
>
  <slot />
</svelte:element>

<style>
  .zdp-grid {
    display: grid;
    gap: var(--zdp-space-4);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
    min-width: 0;
  }

  .zdp-grid--columns-one {
    grid-template-columns: 1fr;
  }

  .zdp-grid--columns-two {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .zdp-grid--columns-three {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .zdp-grid--columns-four {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .zdp-grid--columns-auto {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
  }

  .zdp-grid--gap-sm {
    gap: var(--zdp-space-2);
  }

  .zdp-grid--gap-md {
    gap: var(--zdp-space-4);
  }

  .zdp-grid--gap-lg {
    gap: var(--zdp-space-6);
  }

  .zdp-grid--gap-xl {
    gap: var(--zdp-space-8);
  }

  @media (max-width: 64rem) {
    .zdp-grid--columns-four {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 42rem) {
    .zdp-grid--columns-two,
    .zdp-grid--columns-three,
    .zdp-grid--columns-four {
      grid-template-columns: 1fr;
    }
  }
</style>

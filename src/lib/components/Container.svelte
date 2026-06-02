<script lang="ts">
  export let as: 'div' | 'section' | 'article' | 'header' | 'footer' = 'div';
  export let size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'lg';
  export let padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  export let id: string | null = null;
  export let labelledBy: string | null = null;
</script>

<svelte:element
  this={as}
  class={`zdp-container zdp-container--${size} zdp-container--padding-${padding}`}
  {id}
  aria-labelledby={labelledBy ?? undefined}
>
  <slot />
</svelte:element>

<style>
  .zdp-container {
    inline-size: 100%;
    margin-inline: auto;
    min-width: 0;
  }

  .zdp-container--sm {
    max-inline-size: var(--zdp-breakpoint-mobile);
  }

  .zdp-container--md {
    max-inline-size: var(--zdp-breakpoint-tablet);
  }

  .zdp-container--lg {
    max-inline-size: var(--zdp-breakpoint-desktop);
  }

  .zdp-container--xl {
    max-inline-size: var(--zdp-breakpoint-wide);
  }

  .zdp-container--full {
    max-inline-size: none;
  }

  .zdp-container--padding-none {
    padding-inline: 0;
  }

  .zdp-container--padding-sm {
    padding-inline: var(--zdp-space-3);
  }

  .zdp-container--padding-md {
    padding-inline: var(--zdp-space-4);
  }

  .zdp-container--padding-lg {
    padding-inline: var(--zdp-space-6);
  }
</style>

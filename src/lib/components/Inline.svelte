<script lang="ts">
  export let as: 'div' | 'section' | 'nav' | 'header' | 'footer' = 'div';
  export let gap: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  export let align: 'stretch' | 'start' | 'center' | 'end' | 'baseline' = 'center';
  export let justify: 'start' | 'center' | 'end' | 'between' = 'start';
  export let labelledBy: string | null = null;
</script>

<svelte:element
  this={as}
  class={`zdp-inline zdp-inline--gap-${gap} zdp-inline--align-${align} zdp-inline--justify-${justify}`}
  aria-labelledby={labelledBy ?? undefined}
>
  <slot />
</svelte:element>

<style>
  .zdp-inline {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--zdp-space-3);
    justify-content: flex-start;
    min-width: 0;
  }

  .zdp-inline--gap-xs {
    gap: var(--zdp-space-1);
  }

  .zdp-inline--gap-sm {
    gap: var(--zdp-space-2);
  }

  .zdp-inline--gap-md {
    gap: var(--zdp-space-3);
  }

  .zdp-inline--gap-lg {
    gap: var(--zdp-space-4);
  }

  .zdp-inline--gap-xl {
    gap: var(--zdp-space-6);
  }

  .zdp-inline--align-stretch {
    align-items: stretch;
  }

  .zdp-inline--align-start {
    align-items: flex-start;
  }

  .zdp-inline--align-center {
    align-items: center;
  }

  .zdp-inline--align-end {
    align-items: flex-end;
  }

  .zdp-inline--align-baseline {
    align-items: baseline;
  }

  .zdp-inline--justify-start {
    justify-content: flex-start;
  }

  .zdp-inline--justify-center {
    justify-content: center;
  }

  .zdp-inline--justify-end {
    justify-content: flex-end;
  }

  .zdp-inline--justify-between {
    justify-content: space-between;
  }
</style>

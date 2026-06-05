<script lang="ts">
  export let as: 'div' | 'section' | 'article' | 'nav' | 'header' | 'footer' = 'div';
  export let gap: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  export let align: 'stretch' | 'start' | 'center' | 'end' = 'stretch';
  export let labelledBy: string | null = null;

  $: labelledGroupRole = as === 'div' && labelledBy ? 'group' : undefined;
</script>

<svelte:element
  this={as}
  class={`zdp-stack zdp-stack--gap-${gap} zdp-stack--align-${align}`}
  role={labelledGroupRole}
  aria-labelledby={labelledBy ?? undefined}
>
  <slot />
</svelte:element>

<style>
  .zdp-stack {
    align-items: stretch;
    display: grid;
    gap: var(--zdp-space-4);
    min-width: 0;
  }

  .zdp-stack--gap-xs {
    gap: var(--zdp-space-1);
  }

  .zdp-stack--gap-sm {
    gap: var(--zdp-space-2);
  }

  .zdp-stack--gap-md {
    gap: var(--zdp-space-4);
  }

  .zdp-stack--gap-lg {
    gap: var(--zdp-space-6);
  }

  .zdp-stack--gap-xl {
    gap: var(--zdp-space-8);
  }

  .zdp-stack--align-stretch {
    align-items: stretch;
  }

  .zdp-stack--align-start {
    align-items: start;
  }

  .zdp-stack--align-center {
    align-items: center;
  }

  .zdp-stack--align-end {
    align-items: end;
  }
</style>

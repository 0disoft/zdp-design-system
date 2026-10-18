<script lang="ts">
  interface Props {
    as?: 'div' | 'section' | 'article' | 'nav' | 'header' | 'footer';
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    align?: 'stretch' | 'start' | 'center' | 'end';
    labelledBy?: string | null;
  }

  let {
    as = $bindable('div'),
    gap = $bindable('md'),
    align = $bindable('stretch'),
    labelledBy = $bindable(null)
  }: Props = $props();

  let labelledGroupRole = $derived(as === 'div' && labelledBy ? 'group' : undefined);
</script>

<svelte:element
  this={as}
  class={`zdp-stack zdp-stack--gap-${gap} zdp-stack--align-${align}`}
  role={labelledGroupRole}
  aria-labelledby={labelledBy ?? undefined}
>
  <!-- svelte-ignore slot_element_deprecated public slot compatibility --><slot />
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

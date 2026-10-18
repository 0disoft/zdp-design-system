<script lang="ts">
  interface Props {
    as?: 'div' | 'section' | 'nav' | 'header' | 'footer';
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    align?: 'stretch' | 'start' | 'center' | 'end' | 'baseline';
    justify?: 'start' | 'center' | 'end' | 'between';
    labelledBy?: string | null;
  }

  let {
    as = $bindable('div'),
    gap = $bindable('md'),
    align = $bindable('center'),
    justify = $bindable('start'),
    labelledBy = $bindable(null)
  }: Props = $props();

  let labelledGroupRole = $derived(as === 'div' && labelledBy ? 'group' : undefined);
</script>

<svelte:element
  this={as}
  class={`zdp-inline zdp-inline--gap-${gap} zdp-inline--align-${align} zdp-inline--justify-${justify}`}
  role={labelledGroupRole}
  aria-labelledby={labelledBy ?? undefined}
>
  <!-- svelte-ignore slot_element_deprecated public slot compatibility --><slot />
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

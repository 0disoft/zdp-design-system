<script lang="ts">
  interface Props {
    as?: 'div' | 'section' | 'nav' | 'header' | 'footer';
    gap?: 'sm' | 'md' | 'lg';
    align?: 'start' | 'center' | 'end';
    labelledBy?: string | null;
  }

  let {
    as = $bindable('div'),
    gap = $bindable('md'),
    align = $bindable('center'),
    labelledBy = $bindable(null)
  }: Props = $props();

  let labelledGroupRole = $derived(as === 'div' && labelledBy ? 'group' : undefined);
</script>

<svelte:element
  this={as}
  class={`zdp-toolbar zdp-toolbar--gap-${gap} zdp-toolbar--align-${align}`}
  role={labelledGroupRole}
  aria-labelledby={labelledBy ?? undefined}
>
  <div class="zdp-toolbar__main">
    <!-- svelte-ignore slot_element_deprecated public slot compatibility --><slot />
  </div>
  <div class="zdp-toolbar__actions">
    <!-- svelte-ignore slot_element_deprecated public slot compatibility --><slot name="actions" />
  </div>
</svelte:element>

<style>
  .zdp-toolbar {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--zdp-space-3);
    justify-content: space-between;
    min-width: 0;
  }

  .zdp-toolbar--gap-sm {
    gap: var(--zdp-space-2);
  }

  .zdp-toolbar--gap-md {
    gap: var(--zdp-space-3);
  }

  .zdp-toolbar--gap-lg {
    gap: var(--zdp-space-4);
  }

  .zdp-toolbar--align-start {
    align-items: flex-start;
  }

  .zdp-toolbar--align-center {
    align-items: center;
  }

  .zdp-toolbar--align-end {
    align-items: flex-end;
  }

  .zdp-toolbar__main,
  .zdp-toolbar__actions {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--zdp-space-2);
    min-width: 0;
  }

  .zdp-toolbar__main {
    flex: 1 1 16rem;
  }

  .zdp-toolbar__actions {
    flex: 0 1 auto;
    justify-content: flex-end;
  }

  @media (max-width: 42rem) {
    .zdp-toolbar__main,
    .zdp-toolbar__actions {
      inline-size: 100%;
      justify-content: flex-start;
    }
  }
</style>

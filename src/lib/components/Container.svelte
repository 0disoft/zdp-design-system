<script lang="ts">
  interface Props {
    as?: 'div' | 'section' | 'article' | 'header' | 'footer';
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    gutter?: 'page' | null;
    id?: string | null;
    labelledBy?: string | null;
  }

  let {
    as = $bindable('div'),
    size = $bindable('lg'),
    padding = $bindable('md'),
    gutter = $bindable(null),
    id = $bindable(null),
    labelledBy = $bindable(null)
  }: Props = $props();

  let labelledGroupRole = $derived(as === 'div' && labelledBy ? 'group' : undefined);
  let paddingClass = $derived(gutter === 'page' ? 'zdp-container--padding-page' : `zdp-container--padding-${padding}`);
</script>

<svelte:element
  this={as}
  class={`zdp-container zdp-container--${size} ${paddingClass}`}
  {id}
  role={labelledGroupRole}
  aria-labelledby={labelledBy ?? undefined}
>
  <!-- svelte-ignore slot_element_deprecated public slot compatibility --><slot />
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

  .zdp-container--padding-page {
    padding-inline: var(--zdp-space-6);
  }
</style>

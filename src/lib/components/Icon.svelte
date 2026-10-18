<script lang="ts">
  interface Props {
    size?: 'sm' | 'md';
    label?: string | null;
  }

  let {
    size = $bindable('md'),
    label = $bindable(null)
  }: Props = $props();
</script>

<span
  class={`zdp-icon zdp-icon--${size}`}
  role={label ? 'img' : undefined}
  aria-label={label ?? undefined}
  aria-hidden={label ? undefined : 'true'}
>
  <!-- svelte-ignore slot_element_deprecated public slot compatibility --><slot />
</span>

<style>
  .zdp-icon {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
    justify-content: center;
    line-height: 1;
    text-align: center;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-icon--sm {
    font-size: var(--zdp-control-glyph-sm);
    height: var(--zdp-control-glyph-sm);
    width: var(--zdp-control-glyph-sm);
  }

  .zdp-icon--md {
    font-size: var(--zdp-control-glyph-md);
    height: var(--zdp-control-glyph-md);
    width: var(--zdp-control-glyph-md);
  }

  .zdp-icon :global(svg) {
    display: block;
    flex: 0 0 auto;
    height: 100%;
    width: 100%;
  }
</style>

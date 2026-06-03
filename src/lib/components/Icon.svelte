<script lang="ts">
  export let size: 'sm' | 'md' = 'md';
  export let label: string | null = null;
</script>

<span
  class={`zdp-icon zdp-icon--${size}`}
  role={label ? 'img' : undefined}
  aria-label={label ?? undefined}
  aria-hidden={label ? undefined : 'true'}
>
  <slot />
</span>

<style>
  .zdp-icon {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
    justify-content: center;
    line-height: 1;
    text-align: center;
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

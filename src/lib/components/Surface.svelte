<script lang="ts">
  export let tone: 'panel' | 'raised' | 'inverse' = 'panel';
  export let padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  export let labelledBy: string | null = null;
</script>

<section
  class={`zdp-surface zdp-surface--${tone} zdp-surface--padding-${padding}`}
  aria-labelledby={labelledBy ?? undefined}
>
  <slot />
</section>

<style>
  .zdp-surface {
    border: 1px solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-radius-lg);
    box-shadow: var(--zdp-shadow-sm);
    color: var(--zdp-color-ink-normal);
  }

  .zdp-surface--panel {
    background: var(--zdp-color-surface-panel);
  }

  .zdp-surface--raised {
    background: var(--zdp-color-surface-raised);
  }

  .zdp-surface--inverse {
    background: var(--zdp-color-surface-inverse);
    color: var(--zdp-color-ink-inverse);
  }

  .zdp-surface--padding-none {
    padding: 0;
  }

  .zdp-surface--padding-sm {
    padding: var(--zdp-space-3);
  }

  .zdp-surface--padding-md {
    padding: var(--zdp-space-4);
  }

  .zdp-surface--padding-lg {
    padding: var(--zdp-space-6);
  }
</style>

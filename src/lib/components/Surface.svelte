<script lang="ts">
  interface Props {
    tone?: 'panel' | 'raised' | 'inverse';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    labelledBy?: string | null;
  }

  let {
    tone = $bindable('panel'),
    padding = $bindable('md'),
    labelledBy = $bindable(null)
  }: Props = $props();
</script>

<section
  class={`zdp-surface zdp-surface--${tone} zdp-surface--padding-${padding}`}
  aria-labelledby={labelledBy ?? undefined}
>
  <!-- svelte-ignore slot_element_deprecated public slot compatibility --><slot />
</section>

<style>
  .zdp-surface {
    border: 1px solid transparent;
    border-radius: var(--zdp-radius-lg);
    box-sizing: border-box;
    color: var(--zdp-color-ink-normal);
    min-width: 0;
  }

  .zdp-surface--panel {
    background: var(--zdp-color-surface-panel);
  }

  :global([data-zdp-theme="dark"]) .zdp-surface--panel {
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
    padding: clamp(var(--zdp-space-4), 4%, var(--zdp-space-6));
  }
</style>

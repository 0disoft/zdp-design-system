<script lang="ts">
  interface Props {
    orientation?: 'horizontal' | 'vertical';
    tone?: 'subtle' | 'strong';
    decorative?: boolean;
    label?: string | null;
  }

  let {
    orientation = $bindable('horizontal'),
    tone = $bindable('subtle'),
    decorative = $bindable(true),
    label = $bindable(null)
  }: Props = $props();
</script>

<div
  class={`zdp-divider zdp-divider--${orientation} zdp-divider--${tone}`}
  role={decorative ? 'presentation' : 'separator'}
  aria-orientation={decorative ? undefined : orientation}
  aria-label={decorative ? undefined : label ?? undefined}
  aria-hidden={decorative ? 'true' : undefined}
></div>

<style>
  .zdp-divider {
    border: 0;
    box-sizing: border-box;
    min-width: 0;
  }

  .zdp-divider--horizontal {
    border-block-start: 1px solid var(--zdp-color-line-subtle);
    inline-size: 100%;
  }

  .zdp-divider--vertical {
    align-self: stretch;
    border-inline-start: 1px solid var(--zdp-color-line-subtle);
    min-block-size: var(--zdp-control-height-md);
  }

  .zdp-divider--subtle {
    border-color: var(--zdp-color-line-subtle);
  }

  .zdp-divider--strong {
    border-color: var(--zdp-color-line-strong);
  }
</style>

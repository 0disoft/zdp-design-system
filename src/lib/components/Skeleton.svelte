<script lang="ts">
  import type { ZdpSkeletonVariant } from '../progress';

  export let variant: ZdpSkeletonVariant = 'block';
  export let lines = 1;
  export let animated = true;
  export let decorative = true;
  export let ariaLabel = 'Loading content';
  export let labelledBy: string | null = null;

  $: lineCount = Math.max(1, Math.min(8, Math.floor(Number.isFinite(lines) ? lines : 1)));
  $: placeholders = Array.from({ length: variant === 'text' ? lineCount : 1 });
</script>

<div
  class={`zdp-skeleton zdp-skeleton--${variant}`}
  aria-hidden={decorative ? 'true' : undefined}
  aria-label={!decorative && !labelledBy ? ariaLabel : undefined}
  aria-labelledby={!decorative ? labelledBy ?? undefined : undefined}
  data-animated={animated ? 'true' : 'false'}
  role={decorative ? undefined : 'status'}
>
  {#each placeholders as _, index}
    <span
      class={`zdp-skeleton__line ${index === placeholders.length - 1 ? 'zdp-skeleton__line--last' : ''}`}
      aria-hidden="true"
    ></span>
  {/each}
</div>

<style>
  .zdp-skeleton {
    --zdp-skeleton-fill: var(--zdp-color-surface-raised);
    --zdp-skeleton-line: var(--zdp-color-line-subtle);

    box-sizing: border-box;
    display: grid;
    gap: var(--zdp-space-2);
    inline-size: 100%;
    max-inline-size: 100%;
    min-width: 0;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-skeleton__line {
    background: var(--zdp-skeleton-fill);
    border: var(--zdp-control-border-width) solid var(--zdp-skeleton-line);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    display: block;
    inline-size: 100%;
    min-width: 0;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-skeleton--text .zdp-skeleton__line {
    block-size: calc(var(--zdp-type-body-small-size) * var(--zdp-type-body-small-line-height));
  }

  .zdp-skeleton--text .zdp-skeleton__line--last {
    inline-size: 72%;
  }

  .zdp-skeleton--block .zdp-skeleton__line {
    block-size: min(9rem, 28vw);
  }

  .zdp-skeleton--avatar {
    inline-size: var(--zdp-control-height-md);
  }

  .zdp-skeleton--avatar .zdp-skeleton__line {
    aspect-ratio: 1;
    border-radius: 50%;
  }

  .zdp-skeleton[data-animated="false"] .zdp-skeleton__line {
    opacity: 0.72;
  }
</style>

<script lang="ts">
  export let label: string | null = null;
  export let size: 'sm' | 'md' = 'md';
  export let ariaLabel: string | null = null;
  export let title: string | null = null;
</script>

<kbd
  class={`zdp-kbd zdp-kbd--${size}`}
  aria-label={ariaLabel ?? undefined}
  title={title ?? undefined}
>
  {#if label !== null}
    {label}
  {:else}
    <slot />
  {/if}
</kbd>

<style>
  .zdp-kbd {
    background: var(--zdp-color-surface-raised);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-radius-sm);
    box-sizing: border-box;
    color: var(--zdp-color-ink-muted);
    display: inline-grid;
    font-family: ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono", monospace;
    font-weight: var(--zdp-font-weight-medium);
    line-height: 1;
    min-height: 1.45em;
    min-width: 1.45em;
    padding: 0 0.35em;
    place-items: center;
    vertical-align: middle;
    white-space: nowrap;
  }

  .zdp-kbd--sm {
    font-size: 0.78em;
  }

  .zdp-kbd--md {
    font-size: 0.86em;
  }
</style>

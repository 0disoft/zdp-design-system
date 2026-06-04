<script lang="ts">
  import Kbd from './Kbd.svelte';

  export let keys: readonly string[] = [];
  export let size: 'sm' | 'md' = 'md';
  export let ariaLabel: string | null = null;

  $: resolvedAriaLabel = ariaLabel ?? keys.join(' ');
</script>

<span class={`zdp-shortcut-hint zdp-shortcut-hint--${size}`} aria-label={resolvedAriaLabel}>
  {#each keys as key, index}
    {#if index > 0}
      <span class="zdp-shortcut-hint__separator" aria-hidden="true">+</span>
    {/if}
    <Kbd label={key} {size} />
  {/each}
</span>

<style>
  .zdp-shortcut-hint {
    align-items: center;
    color: var(--zdp-color-ink-muted);
    display: inline-flex;
    flex: 0 0 auto;
    gap: var(--zdp-space-1);
    line-height: 1;
    min-width: 0;
    white-space: nowrap;
  }

  .zdp-shortcut-hint--sm {
    font-size: var(--zdp-type-caption-size);
  }

  .zdp-shortcut-hint--md {
    font-size: var(--zdp-type-label-size);
  }

  .zdp-shortcut-hint__separator {
    color: var(--zdp-color-ink-muted);
    font-size: 0.85em;
    line-height: 1;
  }
</style>

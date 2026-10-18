<script lang="ts">
  import Kbd from './Kbd.svelte';

  interface Props {
    keys?: readonly string[];
    size?: 'sm' | 'md';
    ariaLabel?: string | null;
  }

  let {
    keys = $bindable([]),
    size = $bindable('md'),
    ariaLabel = $bindable(null)
  }: Props = $props();

  let resolvedAriaLabel = $derived(ariaLabel ?? keys.join(' '));
  let labelledGroupRole = $derived(resolvedAriaLabel ? 'group' : undefined);
</script>

<span
  class={`zdp-shortcut-hint zdp-shortcut-hint--${size}`}
  role={labelledGroupRole}
  aria-label={resolvedAriaLabel || undefined}
>
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
    -webkit-user-select: none;
    user-select: none;
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

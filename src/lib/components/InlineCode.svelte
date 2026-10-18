<script lang="ts">
  interface Props {
    text?: string | null;
    ariaLabel?: string | null;
  }

  let {
    text = $bindable(null),
    ariaLabel = $bindable(null)
  }: Props = $props();
</script>

<code class="zdp-inline-code" aria-label={ariaLabel ?? undefined}>
  {#if text !== null}
    {text}
  {:else}
    <!-- svelte-ignore slot_element_deprecated public slot compatibility --><slot />
  {/if}
</code>

<style>
  .zdp-inline-code {
    background: var(--zdp-color-surface-raised);
    border: var(--zdp-control-border-width) solid transparent;
    border-radius: var(--zdp-radius-sm);
    box-decoration-break: clone;
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-mono);
    font-size: 0.92em;
    line-height: 1.4;
    padding: 0.05em 0.36em;
    word-break: break-word;
  }
</style>

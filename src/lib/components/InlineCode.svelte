<script lang="ts">
  export let text: string | null = null;
  export let ariaLabel: string | null = null;
</script>

<code class="zdp-inline-code" aria-label={ariaLabel ?? undefined}>
  {#if text !== null}
    {text}
  {:else}
    <slot />
  {/if}
</code>

<style>
  .zdp-inline-code {
    background: var(--zdp-color-surface-raised);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
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

<script lang="ts">
  export let id: string | null = null;
</script>

<p class="zdp-help-text" id={id ?? undefined}>
  <slot />
</p>

<style>
  .zdp-help-text {
    color: var(--zdp-color-ink-muted);
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-caption-size);
    line-height: var(--zdp-type-caption-line-height);
    margin: 0;
  }
</style>

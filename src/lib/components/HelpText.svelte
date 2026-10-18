<script lang="ts">
  interface Props {
    id?: string | null;
  }

  let {
    id = $bindable(null)
  }: Props = $props();
</script>

<p class="zdp-help-text" id={id ?? undefined}>
  <!-- svelte-ignore slot_element_deprecated public slot compatibility --><slot />
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

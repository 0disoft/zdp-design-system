<script lang="ts">
  interface Props {
    id?: string | null;
    live?: 'off' | 'polite' | 'assertive';
  }

  let {
    id = $bindable(null),
    live = $bindable('polite')
  }: Props = $props();
</script>

<p class="zdp-error-text" id={id ?? undefined} aria-live={live === 'off' ? undefined : live}>
  <!-- svelte-ignore slot_element_deprecated public slot compatibility --><slot />
</p>

<style>
  .zdp-error-text {
    color: var(--zdp-color-accent-danger);
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-caption-size);
    line-height: var(--zdp-type-caption-line-height);
    margin: 0;
  }
</style>

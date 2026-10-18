<svelte:options runes={true} />

<script lang="ts">
  // Emit TypeScript declarations even though this component has no props.
</script>

<span class="zdp-visually-hidden">
  <!-- svelte-ignore slot_element_deprecated public slot compatibility --><slot />
</span>

<style>
  .zdp-visually-hidden {
    border: 0;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }
</style>

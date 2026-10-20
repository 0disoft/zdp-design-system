<script lang="ts">
  import ResizableSplitPane from '../../../src/lib/components/ResizableSplitPane.svelte';
  let defaultSize = $state(64);
  let explicitSize = $state(80);
</script>

<section data-testid="split-defaults-fixture" aria-label="Split pane default sizes">
  <div style="width:320px;height:160px;">
    <ResizableSplitPane id="omitted-size-split" orientation="horizontal" minSize={32} maxSize={96}
      {defaultSize} ariaLabel="Default size panel" />
  </div>
  <div style="width:320px;height:160px;">
    <ResizableSplitPane id="explicit-size-split" orientation="horizontal" minSize={32} maxSize={96}
      {defaultSize} bind:size={explicitSize} ariaLabel="Explicit size panel" />
  </div>
  <button type="button" onclick={() => defaultSize = 48}>Change default to 48</button>
  <button type="button" onclick={() => defaultSize = 64}>Restore default to 64</button>
  <output data-testid="explicit-split-size">{explicitSize}</output>
</section>

<style>
  section :global(.zdp-resizable-split-pane) { height: 100%; }
</style>

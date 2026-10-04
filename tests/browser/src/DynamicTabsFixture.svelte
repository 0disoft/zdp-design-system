<script lang="ts">
  import Tabs from '../../../src/lib/components/Tabs.svelte';
  const a = { id: 'a', label: 'Dynamic A' };
  const b = { id: 'b', label: 'Dynamic B' };
  const c = { id: 'c', label: 'Dynamic C' };
  let items = $state([a, b, c]);
  let selectedId = $state('b');
  let outside = $state<HTMLButtonElement>();
</script>

<section data-testid="dynamic-tabs">
  <Tabs {items} bind:selectedId let:selectedItem><p>{selectedItem.label} panel</p></Tabs>
  <button type="button" data-testid="tabs-move-to-end" onclick={() => items = [c, a, b]}>Move selected tab to end</button>
  <button type="button" data-testid="tabs-move-to-start" onclick={() => items = [b, c, a]}>Move selected tab to start</button>
  <button type="button" data-testid="tabs-insert-first" onclick={() => items = [{ id: 'd', label: 'Dynamic D' }, b, c, a]}>Insert first tab</button>
  <button type="button" data-testid="tabs-reverse-in-place" onclick={() => items.reverse()}>Reverse tabs in place</button>
  <button type="button" data-testid="tabs-update-external-focus" onclick={() => { items = [a, b, c]; queueMicrotask(() => outside?.focus()); }}>Update tabs and move focus</button>
  <button type="button" data-testid="tabs-outside-focus" bind:this={outside}>Outside tab control</button>
</section>

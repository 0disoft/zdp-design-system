<script lang="ts">
  import Tabs from '../../../src/lib/components/Tabs.svelte';
  const initialItems = [{ id: 'a', label: 'Panel A' }, { id: 'b', label: 'Panel B' }];
  let items = $state<{ id: string; label: string; disabled?: boolean }[]>(initialItems);
  let selectedId = $state<string | null>('a');
  let outside: HTMLButtonElement;
</script>

<section data-testid="tab-panel-focus">
  <Tabs {items} bind:selectedId let:selectedItem>
    <input aria-label="Tab panel editor" value={selectedItem.label} />
  </Tabs>
  <button type="button" data-testid="reset" onclick={() => { items = initialItems; selectedId = 'a'; }}>Reset panels</button>
  <button type="button" data-testid="switch" onclick={() => selectedId = 'b'}>Switch panel</button>
  <button type="button" data-testid="remove" onclick={() => items = items.filter((item) => item.id !== selectedId)}>Remove panel</button>
  <button type="button" data-testid="disable-all" onclick={() => items = items.map((item) => ({ ...item, disabled: true }))}>Disable panels</button>
  <button type="button" data-testid="reorder" onclick={() => items = [...items].reverse()}>Reorder panels</button>
  <button type="button" data-testid="switch-outside" onclick={() => { selectedId = 'b'; queueMicrotask(() => outside.focus()); }}>Switch and move focus</button>
  <button type="button" data-testid="outside" bind:this={outside}>Outside panels</button>
</section>

<script lang="ts">
  import Dialog from '../../../src/lib/components/Dialog.svelte';
  import Tooltip from '../../../src/lib/components/Tooltip.svelte';
  let open = false;
  let text = '';
</script>

<button type="button" data-testid="empty-tooltip-open" onclick={() => open = true}>Open tooltip test dialog</button>
<button type="button" data-testid="tooltip-use-text" onclick={() => text = 'Available explanation'}>Use tooltip text</button>
<button type="button" data-testid="tooltip-use-whitespace" onclick={() => text = '   '}>Use whitespace tooltip</button>
<Dialog bind:open labelledBy="empty-tooltip-dialog-title" closeLabel="Close tooltip test">
  <svelte:fragment slot="title"><h2 id="empty-tooltip-dialog-title">Empty tooltip dialog</h2></svelte:fragment>
  <Tooltip {text} let:describedBy><button type="button" data-testid="empty-tooltip-trigger" aria-describedby={describedBy ?? undefined}>Optional explanation</button></Tooltip>
</Dialog>

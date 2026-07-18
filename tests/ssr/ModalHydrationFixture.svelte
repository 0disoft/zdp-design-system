<script lang="ts">
  import Dialog from '../../src/lib/components/Dialog.svelte';
  import Sheet from '../../src/lib/components/Sheet.svelte';
  import TermSheet from '../../src/lib/components/TermSheet.svelte';
  import type { ZdpTermSheetTerm } from '../../src/lib/term';

  export let kind: 'dialog' | 'sheet' | 'term-sheet';

  let open = true;

  const term: ZdpTermSheetTerm = {
    id: 'hydration-term-sheet',
    label: 'Hydration term sheet',
    short: 'A term sheet that starts open before hydration.'
  };
</script>

<section data-testid="modal-hydration-background" aria-label="Modal hydration background">
  <button type="button">Background action</button>
</section>

{#if kind === 'dialog'}
  <Dialog
    bind:open
    labelledBy="hydration-dialog-title"
    closeLabel="Close hydration dialog"
    onClose={() => (open = false)}
  >
    <svelte:fragment slot="title">
      <h2 id="hydration-dialog-title">Hydration dialog</h2>
    </svelte:fragment>
    <p>Dialog content rendered open on the server.</p>
  </Dialog>
{:else if kind === 'sheet'}
  <Sheet
    bind:open
    labelledBy="hydration-sheet-title"
    closeLabel="Close hydration sheet"
    onClose={() => (open = false)}
  >
    <svelte:fragment slot="title">
      <h2 id="hydration-sheet-title">Hydration sheet</h2>
    </svelte:fragment>
    <p>Sheet content rendered open on the server.</p>
  </Sheet>
{:else}
  <TermSheet bind:open {term} closeLabel="Close hydration term sheet" onClose={() => (open = false)} />
{/if}

<output data-testid="modal-hydration-open-state">{open ? 'open' : 'closed'}</output>

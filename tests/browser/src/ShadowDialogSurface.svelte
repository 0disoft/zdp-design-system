<script lang="ts">
  import Dialog from '../../../src/lib/components/Dialog.svelte';
  import Sheet from '../../../src/lib/components/Sheet.svelte';
  import TermSheet from '../../../src/lib/components/TermSheet.svelte';
  import type { ZdpTermSheetTerm } from '../../../src/lib/term';

  let open = false;
  let sheetOpen = false;
  let termOpen = false;
  const shadowTerm: ZdpTermSheetTerm = {
    id: 'shadow-term',
    label: 'Shadow term',
    short: 'A term rendered inside an open shadow root.',
    canonicalPath: '#shadow-term-details'
  };
</script>

<button data-testid="shadow-dialog-trigger" type="button" onclick={() => (open = true)}>
  Open shadow dialog
</button>
<Dialog
  bind:open
  labelledBy="shadow-dialog-title"
  closeLabel="Close shadow dialog"
  onClose={() => (open = false)}
>
  <svelte:fragment slot="title">
    <h2 id="shadow-dialog-title">Shadow dialog</h2>
  </svelte:fragment>
  <p>Rendered inside an open shadow root.</p>
  <svelte:fragment slot="footer">
    <button data-testid="shadow-dialog-last-action" type="button">Review shadow dialog</button>
  </svelte:fragment>
</Dialog>

<button data-testid="shadow-sheet-trigger" type="button" onclick={() => (sheetOpen = true)}>
  Open shadow sheet
</button>
<Sheet
  bind:open={sheetOpen}
  labelledBy="shadow-sheet-title"
  closeLabel="Close shadow sheet"
  onClose={() => (sheetOpen = false)}
>
  <svelte:fragment slot="title">
    <h2 id="shadow-sheet-title">Shadow sheet</h2>
  </svelte:fragment>
  <p>Review the embedded sheet.</p>
  <svelte:fragment slot="footer">
    <button data-testid="shadow-sheet-last-action" type="button">Review shadow sheet</button>
  </svelte:fragment>
</Sheet>

<button data-testid="shadow-term-trigger" type="button" onclick={() => (termOpen = true)}>
  Open shadow term
</button>
<TermSheet
  bind:open={termOpen}
  id="shadow-term-sheet"
  term={shadowTerm}
  closeLabel="Close shadow term"
  onClose={() => (termOpen = false)}
/>

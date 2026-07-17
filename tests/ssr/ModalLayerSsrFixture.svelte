<script lang="ts">
  import Dialog from '../../src/lib/components/Dialog.svelte';
  import Sheet from '../../src/lib/components/Sheet.svelte';
  import TermSheet from '../../src/lib/components/TermSheet.svelte';
  import type { ZdpTermSheetTerm } from '../../src/lib/term';

  const term: ZdpTermSheetTerm = {
    id: 'ssr-term',
    label: 'SSR term',
    short: 'A term rendered while checking modal registry isolation.'
  };
</script>

<Dialog open labelledBy="ssr-dialog-title">
  <svelte:fragment slot="title">
    <h2 id="ssr-dialog-title">SSR dialog</h2>
  </svelte:fragment>
  <p>Dialog SSR content</p>
</Dialog>

<Sheet open labelledBy="ssr-sheet-title">
  <svelte:fragment slot="title">
    <h2 id="ssr-sheet-title">SSR sheet</h2>
  </svelte:fragment>
  <p>Sheet SSR content</p>
</Sheet>

<TermSheet open {term} />

<script lang="ts">
  import Card from '../../../src/lib/components/Card.svelte';
  import CardHeader from '../../../src/lib/components/CardHeader.svelte';
  import Combobox from '../../../src/lib/components/Combobox.svelte';
  import Dialog from '../../../src/lib/components/Dialog.svelte';
  import Sheet from '../../../src/lib/components/Sheet.svelte';
  import TermSheet from '../../../src/lib/components/TermSheet.svelte';
  import Tooltip from '../../../src/lib/components/Tooltip.svelte';
  import Tabs from '../../../src/lib/components/Tabs.svelte';
  import type { ZdpComboboxOption } from '../../../src/lib/combobox';
  import type { ZdpTermSheetTerm } from '../../../src/lib/term';

  const collidingTabItems = [
    { id: 'release notes', label: 'Release notes' },
    { id: 'release-notes', label: 'Release history' }
  ] as const;
  const ownerOptions: readonly ZdpComboboxOption[] = [
    { id: 'security', value: 'security', label: 'Security' },
    { id: 'platform', value: 'platform', label: 'Platform' }
  ];
  let ownerValue = '';
  let ownerQuery = '';
  let ownerSelectionCount = 0;
  let dialogOpen = false;
  let sheetOpen = false;
  let termSheetOpen = false;
  let nestedDialogOpen = false;
  let nestedSheetOpen = false;
  const browserTerm: ZdpTermSheetTerm = {
    id: 'browser-term',
    label: 'Browser term',
    short: 'A term used to verify the modal sheet contract.',
    canonicalPath: '#browser-term-details'
  };
</script>

<main class="zdp-surface-reset">
  <Card as="section" ariaLabelledBy="release-summary-title" hover>
    <svelte:fragment slot="header">
      <CardHeader id="release-summary-title">Release summary</CardHeader>
    </svelte:fragment>
    <p>The card groups content without pretending the whole surface is interactive.</p>
    <a data-testid="card-link" href="#release-details">Review release</a>
  </Card>

  <Card as="div" ariaLabel="Deployment status">
    <p>Ready</p>
  </Card>

  <Tooltip text="Keyboard help" id="browser-tooltip" let:describedBy>
    <button data-testid="tooltip-trigger" type="button" aria-describedby={describedBy ?? undefined}>Help</button>
  </Tooltip>

  <Tabs items={collidingTabItems} selectedId="release notes" ariaLabel="Release views" idPrefix="browser tabs">
    <p>Selected release view</p>
  </Tabs>

  <Combobox
    id="browser-combobox"
    name="owner"
    label="Owner"
    options={ownerOptions}
    bind:value={ownerValue}
    bind:query={ownerQuery}
    onValueChange={() => (ownerSelectionCount += 1)}
  />
  <output data-testid="combobox-selection-count">{ownerSelectionCount}</output>

  <button data-testid="dialog-trigger" type="button" onclick={() => (dialogOpen = true)}>Open dialog</button>
  <Dialog
    bind:open={dialogOpen}
    labelledBy="browser-dialog-title"
    closeLabel="Close dialog"
    onClose={() => (dialogOpen = false)}
  >
    <svelte:fragment slot="title">
      <h2 id="browser-dialog-title">Review changes</h2>
    </svelte:fragment>
    <p>Confirm the release changes.</p>
    <svelte:fragment slot="footer">
      <button data-testid="dialog-last-action" type="button">Confirm dialog</button>
    </svelte:fragment>
  </Dialog>

  <button data-testid="sheet-trigger" type="button" onclick={() => (sheetOpen = true)}>Open sheet</button>
  <Sheet
    bind:open={sheetOpen}
    labelledBy="browser-sheet-title"
    closeLabel="Close sheet"
    onClose={() => (sheetOpen = false)}
  >
    <svelte:fragment slot="title">
      <h2 id="browser-sheet-title">Release details</h2>
    </svelte:fragment>
    <p>Inspect the release details.</p>
    <svelte:fragment slot="footer">
      <button data-testid="sheet-last-action" type="button">Confirm sheet</button>
    </svelte:fragment>
  </Sheet>

  <button data-testid="term-sheet-trigger" type="button" onclick={() => (termSheetOpen = true)}>Open term</button>
  <TermSheet
    bind:open={termSheetOpen}
    id="browser-term-sheet"
    term={browserTerm}
    closeLabel="Close term"
    onClose={() => (termSheetOpen = false)}
  />

  <button data-testid="nested-dialog-trigger" type="button" onclick={() => (nestedDialogOpen = true)}>
    Open nested dialog
  </button>
  <Dialog
    bind:open={nestedDialogOpen}
    labelledBy="nested-dialog-title"
    closeLabel="Close nested dialog"
    onClose={() => (nestedDialogOpen = false)}
  >
    <svelte:fragment slot="title">
      <h2 id="nested-dialog-title">Nested dialog</h2>
    </svelte:fragment>
    <p>Open another modal layer.</p>
    <svelte:fragment slot="footer">
      <button data-testid="nested-sheet-trigger" type="button" onclick={() => (nestedSheetOpen = true)}>
        Open nested sheet
      </button>
    </svelte:fragment>
  </Dialog>
  <Sheet
    bind:open={nestedSheetOpen}
    labelledBy="nested-sheet-title"
    closeLabel="Close nested sheet"
    onClose={() => (nestedSheetOpen = false)}
  >
    <svelte:fragment slot="title">
      <h2 id="nested-sheet-title">Nested sheet</h2>
    </svelte:fragment>
    <p>Keep this layer active while the lower layer closes.</p>
    <svelte:fragment slot="footer">
      <button data-testid="close-underlying-dialog" type="button" onclick={() => (nestedDialogOpen = false)}>
        Close underlying dialog
      </button>
    </svelte:fragment>
  </Sheet>

  <section id="release-details" aria-label="Release details">
    <p>Keyboard navigation reached the explicit link.</p>
  </section>
</main>

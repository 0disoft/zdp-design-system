<script lang="ts">
  import Card from '../../../src/lib/components/Card.svelte';
  import CardHeader from '../../../src/lib/components/CardHeader.svelte';
  import Combobox from '../../../src/lib/components/Combobox.svelte';
  import Dialog from '../../../src/lib/components/Dialog.svelte';
  import Menu from '../../../src/lib/components/Menu.svelte';
  import Popover from '../../../src/lib/components/Popover.svelte';
  import Sheet from '../../../src/lib/components/Sheet.svelte';
  import TermSheet from '../../../src/lib/components/TermSheet.svelte';
  import Tooltip from '../../../src/lib/components/Tooltip.svelte';
  import Tabs from '../../../src/lib/components/Tabs.svelte';
  import type { ZdpComboboxOption } from '../../../src/lib/combobox';
  import type { ZdpMenuItem } from '../../../src/lib/menu';
  import type { ZdpTermSheetTerm } from '../../../src/lib/term';

  const collidingTabItems = [
    { id: 'release notes', label: 'Release notes' },
    { id: 'release-notes', label: 'Release history' }
  ] as const;
  const ownerOptions: readonly ZdpComboboxOption[] = [
    { id: 'security', value: 'security', label: 'Security' },
    { id: 'platform', value: 'platform', label: 'Platform' }
  ];
  const browserMenuItems: readonly ZdpMenuItem[] = [
    { id: 'edit', label: 'Edit release' },
    { id: 'delete', label: 'Delete release', href: '#delete-release', disabled: true },
    { id: 'archive', label: 'Archive release' }
  ];
  let ownerValue = '';
  let ownerQuery = '';
  let ownerSelectionCount = 0;
  let dialogOpen = false;
  let sheetOpen = false;
  let termSheetOpen = false;
  let nestedDialogOpen = false;
  let nestedSheetOpen = false;
  let protectedDialogOpen = false;
  let protectedSheetOpen = false;
  let protectedTermSheetOpen = false;
  let menuOpen = false;
  let menuSelection = '';
  let popoverOpen = false;
  let protectedPopoverOpen = false;
  const browserTerm: ZdpTermSheetTerm = {
    id: 'browser-term',
    label: 'Browser term',
    short: 'A term used to verify the modal sheet contract.',
    canonicalPath: '#browser-term-details'
  };
  const protectedBrowserTerm: ZdpTermSheetTerm = {
    id: 'protected-browser-term',
    label: 'Protected term',
    short: 'A term that requires an explicit close action.'
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

  <Menu
    bind:open={menuOpen}
    idPrefix="browser-menu"
    triggerLabel="Browser actions"
    items={browserMenuItems}
    onSelect={(_event, item) => (menuSelection = item.id)}
  >
    <svelte:fragment slot="trigger">Browser actions</svelte:fragment>
  </Menu>
  <output data-testid="menu-selection">{menuSelection}</output>

  <Popover bind:open={popoverOpen} idPrefix="browser-popover" let:close>
    <svelte:fragment slot="trigger" let:open let:toggle let:panelId>
      <button
        data-testid="popover-trigger"
        type="button"
        aria-controls={open ? panelId : undefined}
        aria-expanded={open}
        onclick={toggle}
      >
        Browser filters
      </button>
    </svelte:fragment>
    <p>Filter options</p>
    <button data-testid="popover-action" type="button" onclick={() => close()}>Apply filters</button>
  </Popover>

  <Popover
    bind:open={protectedPopoverOpen}
    idPrefix="protected-browser-popover"
    closeOnEscape={false}
    closeOnOutside={false}
    let:close
  >
    <svelte:fragment slot="trigger" let:open let:toggle let:panelId>
      <button
        data-testid="protected-popover-trigger"
        type="button"
        aria-controls={open ? panelId : undefined}
        aria-expanded={open}
        onclick={toggle}
      >
        Protected filters
      </button>
    </svelte:fragment>
    <p>Protected filter options</p>
    <button data-testid="protected-popover-action" type="button">Review protected filters</button>
    <button data-testid="protected-popover-close" type="button" onclick={() => close()}>Close protected filters</button>
  </Popover>

  <button data-testid="overlay-outside-target" type="button">Outside overlays</button>

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
      <button data-testid="dialog-direct-disabled" type="button" disabled>Disabled dialog action</button>
      <span hidden>
        <button data-testid="dialog-hidden-ancestor" type="button">Hidden dialog action</button>
      </span>
      <span aria-hidden="true">
        <button data-testid="dialog-aria-hidden-ancestor" type="button">Hidden dialog label</button>
      </span>
      <span inert>
        <button data-testid="dialog-inert-ancestor" type="button">Inert dialog action</button>
      </span>
      <fieldset disabled>
        <button data-testid="dialog-disabled-fieldset" type="button">Fieldset dialog action</button>
      </fieldset>
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
      <button data-testid="sheet-direct-disabled" type="button" disabled>Disabled sheet action</button>
      <span hidden>
        <button data-testid="sheet-hidden-ancestor" type="button">Hidden sheet action</button>
      </span>
      <span aria-hidden="true">
        <button data-testid="sheet-aria-hidden-ancestor" type="button">Hidden sheet label</button>
      </span>
      <span inert>
        <button data-testid="sheet-inert-ancestor" type="button">Inert sheet action</button>
      </span>
      <fieldset disabled>
        <button data-testid="sheet-disabled-fieldset" type="button">Fieldset sheet action</button>
      </fieldset>
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

  <button data-testid="protected-dialog-trigger" type="button" onclick={() => (protectedDialogOpen = true)}>
    Open protected dialog
  </button>
  <Dialog
    bind:open={protectedDialogOpen}
    labelledBy="protected-dialog-title"
    closeLabel="Close protected dialog"
    closeOnEscape={false}
    closeOnBackdrop={false}
    onClose={() => (protectedDialogOpen = false)}
  >
    <svelte:fragment slot="title">
      <h2 id="protected-dialog-title">Protected dialog</h2>
    </svelte:fragment>
    <p>Use the explicit close control.</p>
  </Dialog>

  <button data-testid="protected-sheet-trigger" type="button" onclick={() => (protectedSheetOpen = true)}>
    Open protected sheet
  </button>
  <Sheet
    bind:open={protectedSheetOpen}
    labelledBy="protected-sheet-title"
    closeLabel="Close protected sheet"
    closeOnEscape={false}
    closeOnBackdrop={false}
    onClose={() => (protectedSheetOpen = false)}
  >
    <svelte:fragment slot="title">
      <h2 id="protected-sheet-title">Protected sheet</h2>
    </svelte:fragment>
    <p>Use the explicit close control.</p>
  </Sheet>

  <button data-testid="protected-term-trigger" type="button" onclick={() => (protectedTermSheetOpen = true)}>
    Open protected term
  </button>
  <TermSheet
    bind:open={protectedTermSheetOpen}
    id="protected-term-sheet"
    term={protectedBrowserTerm}
    closeLabel="Close protected term"
    closeOnEscape={false}
    closeOnBackdrop={false}
    onClose={() => (protectedTermSheetOpen = false)}
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

  <section data-testid="preexisting-inert" inert>
    <button type="button">Unavailable fixture action</button>
  </section>

  <section id="release-details" aria-label="Release details">
    <p>Keyboard navigation reached the explicit link.</p>
  </section>
</main>

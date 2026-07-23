<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '../../../src/lib/components/Button.svelte';
  import Card from '../../../src/lib/components/Card.svelte';
  import CardHeader from '../../../src/lib/components/CardHeader.svelte';
  import Combobox from '../../../src/lib/components/Combobox.svelte';
  import ConfirmAction from '../../../src/lib/components/ConfirmAction.svelte';
  import Dialog from '../../../src/lib/components/Dialog.svelte';
  import Disclosure from '../../../src/lib/components/Disclosure.svelte';
  import Menu from '../../../src/lib/components/Menu.svelte';
  import ModalBoundaryFixture from './ModalBoundaryFixture.svelte';
  import Popover from '../../../src/lib/components/Popover.svelte';
  import ResizableSplitPane from '../../../src/lib/components/ResizableSplitPane.svelte';
  import Sheet from '../../../src/lib/components/Sheet.svelte';
  import SegmentedControl from '../../../src/lib/components/SegmentedControl.svelte';
  import ShareDock from '../../../src/lib/components/ShareDock.svelte';
  import StatusToast from '../../../src/lib/components/StatusToast.svelte';
  import TableToolbar from '../../../src/lib/components/TableToolbar.svelte';
  import TermSheet from '../../../src/lib/components/TermSheet.svelte';
  import Tooltip from '../../../src/lib/components/Tooltip.svelte';
  import Tabs from '../../../src/lib/components/Tabs.svelte';
  import Toast from '../../../src/lib/components/Toast.svelte';
  import type { ZdpComboboxOption } from '../../../src/lib/combobox';
  import type { ZdpMenuItem } from '../../../src/lib/menu';
  import type { ZdpShareDockItem } from '../../../src/lib/share';
  import type { ZdpTermSheetTerm } from '../../../src/lib/term';
  import type { ZdpStatusToastItem } from '../../../src/lib/toast';
  import {
    createZdpSplitPaneController,
    createZdpSplitPaneSizePersistence,
    type ZdpSplitPaneController
  } from '../../../src/lib/split-pane';

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
  const forcedColorItems = [
    { id: 'selected', label: 'Selected contrast' },
    { id: 'available', label: 'Available contrast' }
  ] as const;
  const collidingToastItems: readonly ZdpStatusToastItem[] = [
    { id: 'sync failed', title: 'Sync failed', message: 'Try again.' }
  ];
  const browserShareItems: readonly ZdpShareDockItem[] = [
    { id: 'copy', label: 'Copy browser link', icon: 'copy' },
    { id: 'device', label: 'Share from browser', icon: 'device' }
  ];
  let ownerValue = '';
  let ownerQuery = '';
  let ownerSelectionCount = 0;
  let requiredOwnerValue = '';
  let requiredOwnerQuery = '';
  let requiredOwnerSelectionCount = 0;
  let confirmActionDisabled = false;
  let confirmActionCount = 0;
  let shareDockPlacement: 'side' | 'rail' | 'bottom' | 'inline' = 'inline';
  let dialogOpen = false;
  let sheetOpen = false;
  let termSheetOpen = false;
  let nestedDialogOpen = false;
  let nestedSheetOpen = false;
  let protectedDialogOpen = false;
  let protectedSheetOpen = false;
  let protectedTermSheetOpen = false;
  let abruptDialogMounted = false;
  let abruptNestedDialogMounted = false;
  let abruptNestedSheetMounted = false;
  let menuOpen = false;
  let menuSelection = '';
  let popoverOpen = false;
  let splitPaneSize = 280;
  let splitPaneDirection: 'ltr' | 'rtl' = 'ltr';
  let staticSplitPaneSize = 280;
  let staticSplitPaneRoot: HTMLElement | null = null;
  let staticSplitPanePrimary: HTMLElement | null = null;
  let staticSplitPaneSeparator: HTMLElement | null = null;
  let staticSplitPaneSecondary: HTMLElement | null = null;
  let staticSplitPaneController: ZdpSplitPaneController | null = null;
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
  const splitPanePersistence = createZdpSplitPaneSizePersistence({ key: 'browser-fixture-navigation' });

  onMount(() => {
    splitPaneSize = splitPanePersistence.load();
  });

  onMount(() => {
    if (!staticSplitPaneRoot || !staticSplitPanePrimary || !staticSplitPaneSeparator || !staticSplitPaneSecondary) {
      return;
    }

    staticSplitPaneController = createZdpSplitPaneController(
      {
        root: staticSplitPaneRoot,
        primary: staticSplitPanePrimary,
        separator: staticSplitPaneSeparator,
        secondary: staticSplitPaneSecondary
      },
      {
        size: staticSplitPaneSize,
        minSize: 220,
        maxSize: 480,
        secondaryMinSize: 320,
        ariaLabel: 'Static navigation width',
        onResize: (size) => (staticSplitPaneSize = size),
        onResizeCommit: (size) => (staticSplitPaneSize = size)
      }
    );

    return () => {
      staticSplitPaneController?.destroy();
      staticSplitPaneController = null;
    };
  });

  function destroyStaticSplitPaneController(): void {
    staticSplitPaneController?.destroy();
    staticSplitPaneController = null;
  }
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

  <Disclosure id="browser-disclosure" title="Browser details">
    <p>Disclosure details</p>
  </Disclosure>

  <TableToolbar
    title="Browser results"
    summary="Two rows"
    ariaLabel="Browser table tools"
    densityItems={[]}
  >
    <svelte:fragment slot="actions">
      <Button size="sm">Export results</Button>
    </svelte:fragment>
  </TableToolbar>

  <section aria-label="Forced color controls">
    <Button>Review contrast</Button>
    <Button disabled>Unavailable contrast action</Button>
    <SegmentedControl ariaLabel="Contrast choices" items={forcedColorItems} selectedId="selected" />
  </section>

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

  <Combobox
    id="required-browser-combobox"
    name="required-owner"
    label="Required owner"
    options={ownerOptions}
    required
    selectionRequiredText="Choose an owner"
    bind:value={requiredOwnerValue}
    bind:query={requiredOwnerQuery}
    onValueChange={() => (requiredOwnerSelectionCount += 1)}
  />
  <output data-testid="required-combobox-selection-count">{requiredOwnerSelectionCount}</output>

  <ConfirmAction
    label="Confirm browser action"
    hint="Hold to confirm"
    durationMs={600}
    disabled={confirmActionDisabled}
    onconfirm={() => (confirmActionCount += 1)}
  />

  <section data-testid="split-pane-fixture" aria-label="Resizable workspace" dir={splitPaneDirection}>
    <ResizableSplitPane
      id="browser-split-pane"
      bind:size={splitPaneSize}
      minSize={220}
      maxSize={480}
      secondaryMinSize={320}
      ariaLabel="Navigation width"
      getValueText={(size) => `${size} pixels`}
      onResizeCommit={(size) => splitPanePersistence.save(size)}
    >
      {#snippet primary()}
        <nav class="browser-split-pane__primary" aria-label="Browser fixture navigation">
          <a href="#browser-split-pane-document">Overview</a>
          <a href="#browser-split-pane-document">A long navigation label that must not break the workspace</a>
        </nav>
      {/snippet}
      <article id="browser-split-pane-document" class="browser-split-pane__secondary">
        <h2>Workspace document</h2>
        <p>The document uses the remaining inline space.</p>
      </article>
    </ResizableSplitPane>
    <output data-testid="split-pane-size">{splitPaneSize}</output>
    <button data-testid="split-pane-reset-state" type="button" onclick={() => (splitPaneSize = 220)}>
      Reset fixture state
    </button>
    <button data-testid="split-pane-restore-state" type="button" onclick={() => (splitPaneSize = splitPanePersistence.load())}>
      Restore saved width
    </button>
    <button
      data-testid="split-pane-toggle-direction"
      type="button"
      onclick={() => (splitPaneDirection = splitPaneDirection === 'ltr' ? 'rtl' : 'ltr')}
    >
      Toggle direction
    </button>
  </section>

  <section data-testid="static-split-pane-fixture" aria-label="Static resizable workspace">
    <div bind:this={staticSplitPaneRoot} id="browser-static-split-pane">
      <nav bind:this={staticSplitPanePrimary} aria-label="Static browser fixture navigation">
        <a href="#browser-static-split-pane-document">Static overview</a>
      </nav>
      <div bind:this={staticSplitPaneSeparator} id="browser-static-split-pane-separator"></div>
      <article bind:this={staticSplitPaneSecondary} id="browser-static-split-pane-document">
        <h2>Static workspace document</h2>
        <p>The framework-neutral controller owns the same splitter contract.</p>
      </article>
    </div>
    <output data-testid="static-split-pane-size">{staticSplitPaneSize}</output>
    <button data-testid="static-split-pane-destroy" type="button" onclick={destroyStaticSplitPaneController}>
      Destroy static controller
    </button>
  </section>
  <button data-testid="disable-confirm-action" type="button" onclick={() => (confirmActionDisabled = true)}>
    Disable confirmation
  </button>
  <output data-testid="confirm-action-count">{confirmActionCount}</output>

  <ConfirmAction
    id="throwing-confirm-action"
    label="Confirm throwing browser action"
    hint="Hold to test callback failure"
    durationMs={600}
    onconfirm={() => {
      throw new Error('Expected ConfirmAction callback failure.');
    }}
  />

  <section data-testid="toast-live-off">
    <Toast live="off">Quiet status</Toast>
  </section>
  <section data-testid="status-toast-id-fixture">
    <StatusToast placement="inline" ariaLabel="Primary status notifications" items={collidingToastItems} />
    <StatusToast placement="inline" ariaLabel="Secondary status notifications" items={collidingToastItems} />
  </section>

  <label for="browser-share-dock-placement">Share dock placement</label>
  <select id="browser-share-dock-placement" data-testid="share-dock-placement" bind:value={shareDockPlacement}>
    <option value="side">Side</option>
    <option value="rail">Rail</option>
    <option value="bottom">Bottom</option>
    <option value="inline">Inline</option>
  </select>
  <ShareDock placement={shareDockPlacement} ariaLabel="Browser share actions" items={browserShareItems} />

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

  <button data-testid="abrupt-dialog-trigger" type="button" onclick={() => (abruptDialogMounted = true)}>
    Open removable dialog
  </button>
  {#if abruptDialogMounted}
    <Dialog open labelledBy="abrupt-dialog-title" closeLabel="Close removable dialog" onClose={() => (abruptDialogMounted = false)}>
      <svelte:fragment slot="title">
        <h2 id="abrupt-dialog-title">Removable dialog</h2>
      </svelte:fragment>
      <p>Remove this modal without its normal close transition.</p>
      <svelte:fragment slot="footer">
        <button data-testid="abrupt-dialog-unmount" type="button" onclick={() => (abruptDialogMounted = false)}>
          Remove dialog
        </button>
      </svelte:fragment>
    </Dialog>
  {/if}

  <button data-testid="abrupt-nested-trigger" type="button" onclick={() => (abruptNestedDialogMounted = true)}>
    Open removable nested dialog
  </button>
  {#if abruptNestedDialogMounted}
    <Dialog
      open
      labelledBy="abrupt-nested-dialog-title"
      closeLabel="Close removable nested dialog"
      onClose={() => (abruptNestedDialogMounted = false)}
    >
      <svelte:fragment slot="title">
        <h2 id="abrupt-nested-dialog-title">Removable nested dialog</h2>
      </svelte:fragment>
      <p>Open a removable modal above this layer.</p>
      <svelte:fragment slot="footer">
        <button data-testid="abrupt-nested-sheet-trigger" type="button" onclick={() => (abruptNestedSheetMounted = true)}>
          Open removable nested sheet
        </button>
      </svelte:fragment>
    </Dialog>
  {/if}
  {#if abruptNestedSheetMounted}
    <Sheet
      open
      labelledBy="abrupt-nested-sheet-title"
      closeLabel="Close removable nested sheet"
      onClose={() => (abruptNestedSheetMounted = false)}
    >
      <svelte:fragment slot="title">
        <h2 id="abrupt-nested-sheet-title">Removable nested sheet</h2>
      </svelte:fragment>
      <p>Remove either modal component without its normal close transition.</p>
      <svelte:fragment slot="footer">
        <button data-testid="abrupt-nested-remove-top" type="button" onclick={() => (abruptNestedSheetMounted = false)}>
          Remove top sheet
        </button>
        <button data-testid="abrupt-nested-remove-lower" type="button" onclick={() => (abruptNestedDialogMounted = false)}>
          Remove lower dialog
        </button>
      </svelte:fragment>
    </Sheet>
  {/if}

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

  <ModalBoundaryFixture />

  <section id="release-details" aria-label="Release details">
    <p>Keyboard navigation reached the explicit link.</p>
  </section>
</main>

<style>
  [data-testid='split-pane-fixture'] {
    inline-size: min(64rem, 100%);
  }

  [data-testid='static-split-pane-fixture'] {
    inline-size: min(64rem, 100%);
  }

  [data-testid='split-pane-fixture'] > :global(.zdp-resizable-split-pane) {
    block-size: 24rem;
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
  }

  [data-testid='static-split-pane-fixture'] > :global(.zdp-resizable-split-pane) {
    block-size: 24rem;
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
  }

  .browser-split-pane__primary,
  .browser-split-pane__secondary {
    box-sizing: border-box;
    padding: var(--zdp-space-4);
  }

  .browser-split-pane__primary {
    display: grid;
    gap: var(--zdp-space-3);
  }

  .browser-split-pane__primary a {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>

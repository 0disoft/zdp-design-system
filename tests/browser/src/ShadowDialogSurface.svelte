<script lang="ts">
  import Combobox from '../../../src/lib/components/Combobox.svelte';
  import Dialog from '../../../src/lib/components/Dialog.svelte';
  import Menu from '../../../src/lib/components/Menu.svelte';
  import Popover from '../../../src/lib/components/Popover.svelte';
  import Sheet from '../../../src/lib/components/Sheet.svelte';
  import TermSheet from '../../../src/lib/components/TermSheet.svelte';
  import Tooltip from '../../../src/lib/components/Tooltip.svelte';
  import type { ZdpComboboxOption } from '../../../src/lib/combobox';
  import type { ZdpMenuItem } from '../../../src/lib/menu';
  import type { ZdpTermSheetTerm } from '../../../src/lib/term';

  let open = false;
  let comboboxQuery = '';
  let comboboxValue = '';
  let menuOpen = false;
  let popoverOpen = false;
  let sheetOpen = false;
  let termOpen = false;
  const shadowComboboxOptions: readonly ZdpComboboxOption[] = [
    { id: 'platform', value: 'platform', label: 'Platform team' },
    { id: 'security', value: 'security', label: 'Security team' }
  ];
  const shadowMenuItems: readonly ZdpMenuItem[] = [
    { id: 'edit', label: 'Edit shadow release' },
    { id: 'archive', label: 'Archive shadow release' }
  ];
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

<Menu bind:open={menuOpen} idPrefix="shadow-menu" triggerLabel="Shadow actions" items={shadowMenuItems}>
  <svelte:fragment slot="trigger">Shadow actions</svelte:fragment>
</Menu>

<Popover bind:open={popoverOpen} idPrefix="shadow-popover" let:close>
  <svelte:fragment slot="trigger" let:open let:toggle let:panelId>
    <button
      data-testid="shadow-popover-trigger"
      type="button"
      aria-controls={open ? panelId : undefined}
      aria-expanded={open}
      onclick={toggle}
    >
      Shadow filters
    </button>
  </svelte:fragment>
  <p>Shadow filter options</p>
  <button data-testid="shadow-popover-action" type="button" onclick={() => close()}>Apply shadow filters</button>
</Popover>

<Tooltip id="shadow-tooltip" text="Shadow keyboard help" let:describedBy>
  <button data-testid="shadow-tooltip-trigger" type="button" aria-describedby={describedBy ?? undefined}>
    Shadow help
  </button>
</Tooltip>

<Combobox
  id="shadow-combobox"
  name="shadow-owner"
  label="Shadow owner"
  options={shadowComboboxOptions}
  bind:query={comboboxQuery}
  bind:value={comboboxValue}
/>

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

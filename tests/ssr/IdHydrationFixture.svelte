<script lang="ts">
  import Combobox from '../../src/lib/components/Combobox.svelte';
  import StatusToast from '../../src/lib/components/StatusToast.svelte';
  import Tabs from '../../src/lib/components/Tabs.svelte';
  import TermSheet from '../../src/lib/components/TermSheet.svelte';
  import type { ZdpComboboxOption } from '../../src/lib/combobox';
  import type { ZdpTermSheetTerm } from '../../src/lib/term';
  import type { ZdpStatusToastItem } from '../../src/lib/toast';

  let selectedTabId = 'overview';
  let comboboxValue = '';
  let comboboxQuery = '';
  let termSheetOpen = true;

  const tabItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'history', label: 'History' }
  ] as const;

  const comboboxOptions: readonly ZdpComboboxOption[] = [
    { id: 'alpha', label: 'Alpha', value: 'alpha' },
    { id: 'beta', label: 'Beta', value: 'beta' }
  ];

  const term: ZdpTermSheetTerm = {
    id: 'hydration-term',
    label: 'Hydration term',
    short: 'A term rendered on the server before hydration.'
  };

  const primaryItems: readonly ZdpStatusToastItem[] = [
    {
      id: 'saved-draft',
      title: 'Draft saved',
      message: 'Your changes are ready to review.'
    }
  ];

  const secondaryItems: readonly ZdpStatusToastItem[] = [
    {
      id: 'sync-complete',
      title: 'Sync complete',
      message: 'The latest changes are available.'
    }
  ];
</script>

<section data-testid="status-toast-hydration-fixture" aria-label="Status notification hydration fixture">
  <StatusToast placement="inline" items={primaryItems} />
  <StatusToast placement="inline" items={secondaryItems} />
</section>

<section data-testid="tabs-hydration-fixture" aria-label="Tabs hydration fixture">
  <Tabs items={tabItems} bind:selectedId={selectedTabId} ariaLabel="Hydration sections" let:selectedId>
    <p data-testid="tabs-slot-selection">{selectedId}</p>
  </Tabs>
  <output data-testid="tabs-bound-selection">{selectedTabId}</output>
</section>

<section data-testid="combobox-hydration-fixture" aria-label="Combobox hydration fixture">
  <Combobox
    label="Hydration choice"
    options={comboboxOptions}
    bind:value={comboboxValue}
    bind:query={comboboxQuery}
  />
  <output data-testid="combobox-bound-value">{comboboxValue}</output>
  <output data-testid="combobox-bound-query">{comboboxQuery}</output>
</section>

<TermSheet
  bind:open={termSheetOpen}
  {term}
  closeLabel="Close hydration term"
/>
<output data-testid="term-sheet-bound-open">{termSheetOpen ? 'open' : 'closed'}</output>

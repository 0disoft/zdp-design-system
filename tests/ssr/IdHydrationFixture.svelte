<script lang="ts">
  import Combobox from '../../src/lib/components/Combobox.svelte';
  import Disclosure from '../../src/lib/components/Disclosure.svelte';
  import LocaleSwitcher from '../../src/lib/components/LocaleSwitcher.svelte';
  import Menu from '../../src/lib/components/Menu.svelte';
  import Popover from '../../src/lib/components/Popover.svelte';
  import SegmentedControl from '../../src/lib/components/SegmentedControl.svelte';
  import StatusToast from '../../src/lib/components/StatusToast.svelte';
  import Tabs from '../../src/lib/components/Tabs.svelte';
  import TermSheet from '../../src/lib/components/TermSheet.svelte';
  import TextScaleControl from '../../src/lib/components/TextScaleControl.svelte';
  import Tooltip from '../../src/lib/components/Tooltip.svelte';
  import type { ZdpComboboxOption } from '../../src/lib/combobox';
  import type { ZdpMenuItem } from '../../src/lib/menu';
  import type { ZdpSegmentedControlItem } from '../../src/lib/segmented';
  import type { ZdpTermSheetTerm } from '../../src/lib/term';
  import type { ZdpStatusToastItem } from '../../src/lib/toast';
  import type { ZdpTextScale } from '../../src/lib/preferences';
  import FormResetFixture from '../browser/src/FormResetFixture.svelte';
  import AccordionInstancesFixture from '../browser/src/AccordionInstancesFixture.svelte';

  let selectedTabId = 'overview';
  let comboboxValue = '';
  let comboboxQuery = '';
  let controlledQuery = '';
  let controlledValue = 'alpha';
  let disclosureOpen = true;
  let localeValue = 'en';
  let menuOpen = false;
  let menuSelection = 'none';
  let popoverOpen = false;
  let segmentedId = 'list';
  let termSheetOpen = true;
  let textScale: ZdpTextScale = 'base';

  const tabItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'history', label: 'History' }
  ] as const;

  const comboboxOptions: readonly ZdpComboboxOption[] = [
    { id: 'alpha', label: 'Alpha', value: 'alpha' },
    { id: 'beta', label: 'Beta', value: 'beta' }
  ];

  const segmentedItems: readonly ZdpSegmentedControlItem[] = [
    { id: 'list', label: 'List' },
    { id: 'grid', label: 'Grid' }
  ];

  const menuItems: readonly ZdpMenuItem[] = [
    { id: 'review', label: 'Review' },
    { id: 'archive', label: 'Archive' }
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

<AccordionInstancesFixture />

<section data-testid="tabs-hydration-fixture" aria-label="Tabs hydration fixture">
  <Tabs items={tabItems} bind:selectedId={selectedTabId} ariaLabel="Hydration sections" let:selectedId>
    <p data-testid="tabs-slot-selection">{selectedId}</p>
  </Tabs>
  <output data-testid="tabs-bound-selection">{selectedTabId}</output>
</section>

<section data-testid="default-selection-fixture" aria-label="Default selection hydration fixture">
  <Tabs items={tabItems} ariaLabel="Default sections" let:selectedId>
    <p data-testid="default-tab-content">{selectedId}</p>
  </Tabs>
  <SegmentedControl items={segmentedItems} ariaLabel="Default view" />
  <Combobox label="Initial hydration choice" value="alpha" options={comboboxOptions} />
  <Combobox label="Edited hydration choice" value="alpha" query="Typed search" options={comboboxOptions} />
  <Combobox label="Controlled hydration query" bind:value={controlledValue} bind:query={controlledQuery} options={comboboxOptions} />
  <output data-testid="controlled-query-value">{controlledQuery}</output>
  <button type="button" onclick={() => (controlledQuery = 'Beta')}>Replace controlled query</button>
  <button type="button" onclick={() => (controlledQuery = '')}>Clear controlled query</button>
  <button type="button" onclick={() => (controlledValue = 'beta')}>Replace controlled selection</button>
  <LocaleSwitcher ariaLabel="Fallback language" options={[{ value: 'en', label: 'English', disabled: true }, { value: 'ko', label: 'Korean' }]} />
  <TextScaleControl ariaLabel="Fallback text size" options={[{ value: 'large', label: 'Large' }, { value: 'larger', label: 'Larger' }]} />
  <LocaleSwitcher ariaLabel="Unavailable language" options={[{ value: 'en', label: 'English', disabled: true }]} />
  <TextScaleControl ariaLabel="Unavailable text size" options={[{ value: 'base', label: 'Base', disabled: true }]} />
  <Combobox id="metadata-hydration-choice" label="Metadata hydration choice" value="alpha" options={[comboboxOptions[1]!]} selectedOption={comboboxOptions[0]!} required />
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

<section data-testid="disclosure-hydration-fixture" aria-label="Disclosure hydration fixture">
  <Disclosure bind:open={disclosureOpen}>
    <svelte:fragment slot="title">Hydration disclosure</svelte:fragment>
    <p>Disclosure content</p>
  </Disclosure>
  <output data-testid="disclosure-bound-open">{disclosureOpen ? 'open' : 'closed'}</output>
</section>

<section data-testid="locale-hydration-fixture" aria-label="Locale hydration fixture">
  <LocaleSwitcher bind:value={localeValue} ariaLabel="Hydration language" />
  <output data-testid="locale-bound-value">{localeValue}</output>
</section>

<section data-testid="segmented-hydration-fixture" aria-label="Segmented control hydration fixture">
  <SegmentedControl
    items={segmentedItems}
    bind:selectedId={segmentedId}
    ariaLabel="Hydration view"
  />
  <output data-testid="segmented-bound-value">{segmentedId}</output>
</section>

<section data-testid="text-scale-hydration-fixture" aria-label="Text scale hydration fixture">
  <TextScaleControl bind:value={textScale} ariaLabel="Hydration text size" />
  <output data-testid="text-scale-bound-value">{textScale}</output>
</section>

<section data-testid="menu-hydration-fixture" aria-label="Menu hydration fixture">
  <Menu
    items={menuItems}
    bind:open={menuOpen}
    triggerLabel="Hydration menu"
    onSelect={(_, item) => (menuSelection = item.id)}
  >
    <svelte:fragment slot="trigger">Hydration menu</svelte:fragment>
  </Menu>
  <output data-testid="menu-bound-open">{menuOpen ? 'open' : 'closed'}</output>
  <output data-testid="menu-selection">{menuSelection}</output>
</section>

<section data-testid="popover-hydration-fixture" aria-label="Popover hydration fixture">
  <Popover bind:open={popoverOpen} let:close>
    <svelte:fragment slot="trigger" let:open let:toggle let:panelId>
      <button
        data-testid="popover-trigger"
        type="button"
        aria-controls={open ? panelId : undefined}
        aria-expanded={open}
        onclick={toggle}
      >
        Hydration popover
      </button>
    </svelte:fragment>
    <button type="button" onclick={() => close()}>Close hydration popover</button>
  </Popover>
  <output data-testid="popover-bound-open">{popoverOpen ? 'open' : 'closed'}</output>
</section>

<section data-testid="tooltip-hydration-fixture" aria-label="Tooltip hydration fixture">
  <Tooltip text="Hydration help" let:describedBy>
    <button data-testid="tooltip-trigger" type="button" aria-describedby={describedBy ?? undefined}>
      Tooltip target
    </button>
  </Tooltip>
</section>

<FormResetFixture />

<TermSheet
  bind:open={termSheetOpen}
  {term}
  closeLabel="Close hydration term"
/>
<output data-testid="term-sheet-bound-open">{termSheetOpen ? 'open' : 'closed'}</output>

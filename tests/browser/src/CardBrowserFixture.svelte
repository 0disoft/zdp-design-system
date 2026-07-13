<script lang="ts">
  import Card from '../../../src/lib/components/Card.svelte';
  import CardHeader from '../../../src/lib/components/CardHeader.svelte';
  import Combobox from '../../../src/lib/components/Combobox.svelte';
  import Tooltip from '../../../src/lib/components/Tooltip.svelte';
  import Tabs from '../../../src/lib/components/Tabs.svelte';
  import type { ZdpComboboxOption } from '../../../src/lib/combobox';

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

  <section id="release-details" aria-label="Release details">
    <p>Keyboard navigation reached the explicit link.</p>
  </section>
</main>

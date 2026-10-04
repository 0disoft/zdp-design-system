<script lang="ts">
  import SortHeader from '../../../src/lib/components/SortHeader.svelte';
  import TableToolbar from '../../../src/lib/components/TableToolbar.svelte';
  import Table from '../../../src/lib/components/Table.svelte';
  import type { ZdpSortDirection, ZdpTableDensity, ZdpTableToolbarDensityItem } from '../../../src/lib/table-tools';

  let density: ZdpTableDensity = 'default';
  let densityItems: ZdpTableToolbarDensityItem[] = [{ id: 'default', label: 'Default' }, { id: 'compact', label: 'Compact' }];
  let changes = 0;
  let direction: ZdpSortDirection = 'none';
  let priceLabel = 'Price';
</script>

<section data-testid="table-interaction">
  <TableToolbar ariaLabel="Density tools" bind:density {densityItems} onDensityChange={() => changes += 1} />
  <Table caption="Bound density table" {density}><tbody><tr><td>Data</td></tr></tbody></Table>
  <output data-testid="bound-density">{density}</output>
  <output data-testid="density-changes">{changes}</output>
  <button type="button" data-testid="density-external-default" onclick={() => density = 'default'}>Set default density</button>
  <button type="button" data-testid="density-disable-compact" onclick={() => densityItems = densityItems.map((item) => ({ ...item, disabled: item.id === 'compact' }))}>Disable compact density</button>
</section>

<section data-testid="sort-names">
  <Table caption="Named sort columns">
    <thead><tr>
      <th><SortHeader {direction}>{priceLabel}</SortHeader></th>
      <th><SortHeader {direction}>Created date</SortHeader></th>
      <th><SortHeader {direction} label="Status" /></th>
      <th><SortHeader {direction} ariaLabel="Order by count">Count</SortHeader></th>
    </tr></thead>
    <tbody><tr><td>10</td><td>Today</td><td>Active</td><td>2</td></tr></tbody>
  </Table>
  <button type="button" data-testid="sort-use-descending" onclick={() => direction = 'descending'}>Use descending sort</button>
  <button type="button" data-testid="sort-change-label" onclick={() => priceLabel = 'Cost'}>Change column label</button>
</section>

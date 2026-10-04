<script lang="ts">
  import TableToolbar from '../../../src/lib/components/TableToolbar.svelte';
  import Table from '../../../src/lib/components/Table.svelte';
  import type { ZdpTableDensity, ZdpTableToolbarDensityItem } from '../../../src/lib/table-tools';

  let density: ZdpTableDensity = 'default';
  let densityItems: ZdpTableToolbarDensityItem[] = [{ id: 'default', label: 'Default' }, { id: 'compact', label: 'Compact' }];
  let changes = 0;
</script>

<section data-testid="table-interaction">
  <TableToolbar ariaLabel="Density tools" bind:density {densityItems} onDensityChange={() => changes += 1} />
  <Table caption="Bound density table" {density}><tbody><tr><td>Data</td></tr></tbody></Table>
  <output data-testid="bound-density">{density}</output>
  <output data-testid="density-changes">{changes}</output>
  <button type="button" data-testid="density-external-default" onclick={() => density = 'default'}>Set default density</button>
  <button type="button" data-testid="density-disable-compact" onclick={() => densityItems = densityItems.map((item) => ({ ...item, disabled: item.id === 'compact' }))}>Disable compact density</button>
</section>

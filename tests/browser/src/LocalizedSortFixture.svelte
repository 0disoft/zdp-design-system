<script lang="ts">
  import SortHeader from '../../../src/lib/components/SortHeader.svelte';
  import type { ZdpSortDirection } from '../../../src/lib/table-tools';
  let direction = $state<ZdpSortDirection>('none');
  let english = $state(false);
  let changes = $state(0);
  const korean = { ascendingLabel: '오름차순', descendingLabel: '내림차순', unsortedLabel: '정렬 안 됨' };
  const fallback = { ascendingLabel: 'Ascending', descendingLabel: 'Descending', unsortedLabel: 'Not sorted' };
  const labels = $derived(english ? fallback : korean);
</script>

<section data-testid="localized-sort">
  <SortHeader label="이름" {direction} {...labels} onSort={(_event, next) => { direction = next; changes++; }} />
  <SortHeader label="가격" {direction} {...labels} ariaLabel="가격 기준 정렬" />
  <button type="button" data-testid="locale" onclick={() => english = !english}>Change locale</button>
  <button type="button" data-testid="reset" onclick={() => direction = 'none'}>Reset sort</button>
  <output data-testid="changes">{changes}</output>
</section>

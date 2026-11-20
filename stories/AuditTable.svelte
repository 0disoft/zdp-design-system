<script lang="ts">
  import { untrack } from 'svelte';
  import Button from '../src/lib/components/Button.svelte';
  import Checkbox from '../src/lib/components/Checkbox.svelte';
  import SortHeader from '../src/lib/components/SortHeader.svelte';
  import Stack from '../src/lib/components/Stack.svelte';
  import Table from '../src/lib/components/Table.svelte';
  import TableToolbar from '../src/lib/components/TableToolbar.svelte';
  import type { ZdpSortDirection, ZdpTableDensity } from '../src/lib/table-tools.ts';

  type SortKey = 'label' | 'status';
  type Direction = Exclude<ZdpSortDirection, 'none'>;
  interface Props {
    labelledBy: string;
    theme: 'light' | 'dark';
  }

  let { labelledBy, theme }: Props = $props();
  const rows = [
    { id: 'permissions', label: '권한 분리', status: '통과', review: '분기 리뷰' },
    { id: 'logs', label: '감사 로그', status: '통과', review: '릴리스 전' },
    { id: 'secrets', label: '비밀값 보관', status: '대기', review: '운영 전' }
  ];
  const columns = [{ key: 'label', label: '항목' }, { key: 'status', label: '상태' }] as const;

  function initialState(value: Props['theme']) {
    return value === 'light'
      ? { density: 'compact', sort: { key: 'label', direction: 'ascending' }, selected: { permissions: true, logs: true } } as const
      : { density: 'default', sort: { key: 'status', direction: 'ascending' }, selected: { secrets: true } } as const;
  }

  const initial = untrack(() => initialState(theme));
  let density = $state<ZdpTableDensity>(initial.density);
  let sort = $state<{ key: SortKey; direction: Direction }>({ ...initial.sort });
  let selected = $state<Record<string, boolean>>({ ...initial.selected });
  const selectedCount = $derived(rows.filter(row => selected[row.id]).length);
  const sortedRows = $derived([...rows].sort((a, b) => {
    const diff = a[sort.key].localeCompare(b[sort.key], 'ko');
    return sort.direction === 'ascending' ? diff : -diff;
  }));

  function resetTable() {
    sort = { ...initial.sort };
    selected = { ...initial.selected };
    density = initial.density;
  }
</script>

<Stack gap="md">
  <TableToolbar
    title="점검 목록"
    summary="열 제목을 눌러 정렬하고, 체크박스로 항목을 선택하세요."
    {selectedCount}
    selectedLabel={selectedCount > 0 ? `${selectedCount}개 선택됨` : null}
    bind:density
    densityLabel="표 밀도"
    densityItems={[{ id: 'default', label: '기본' }, { id: 'compact', label: '촘촘하게' }]}
    {labelledBy}
  >
    <svelte:fragment slot="selection-actions">
      <Button variant="secondary" onclick={() => (selected = {})}>선택 해제</Button>
    </svelte:fragment>
    <svelte:fragment slot="actions">
      <Button variant="secondary" onclick={resetTable}>보기 초기화</Button>
    </svelte:fragment>
  </TableToolbar>
  <Table caption="보안 점검 목록" {labelledBy} {density}>
    <thead>
      <tr>
        {#each columns as column (column.key)}
          <th scope="col" aria-sort={sort.key === column.key ? sort.direction : undefined}>
            <SortHeader label={column.label}
              direction={sort.key === column.key ? sort.direction : 'none'}
              ascendingLabel="오름차순" descendingLabel="내림차순" unsortedLabel="정렬 안 됨"
              onSort={(_, direction) => (sort = { key: column.key, direction })} />
          </th>
        {/each}
        <th scope="col">다음 확인</th>
      </tr>
    </thead>
    <tbody>
      {#each sortedRows as row (row.id)}
        <tr>
          <th scope="row">
            <Checkbox bind:checked={() => selected[row.id] ?? false, (checked) => (selected[row.id] = checked)}>
              {row.label}
            </Checkbox>
          </th>
          <td>{row.status}</td>
          <td>{row.review}</td>
        </tr>
      {/each}
    </tbody>
  </Table>
</Stack>

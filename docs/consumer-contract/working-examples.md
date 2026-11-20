# 복사해서 실행하는 Svelte 예제

각 코드 블록은 Svelte 5의 독립 컴포넌트다. 예제는 폼 제출 결과와 화면 상태를 같은 페이지에 표시한다. 제품에서는 제출 핸들러를 실제 작업에 연결하고 서버에서도 입력을 검증한다.

## 폼과 검색 선택

`Field`는 상태의 시각적 표현을 맡는다. 동일한 `required`, `disabled`, `readonly`, `invalid` 상태를 지원하는 실제 입력에도 전달한다. 읽기 전용 값은 폼에 포함되고 비활성 입력은 제외된다. `Button`으로 제출할 때는 `type="submit"`을 명시한다.

```svelte
<script lang="ts">
  import 'zdp-design-system/tokens.css';
  import Button from 'zdp-design-system/components/Button';
  import Combobox from 'zdp-design-system/components/Combobox';
  import ErrorText from 'zdp-design-system/components/ErrorText';
  import Field from 'zdp-design-system/components/Field';
  import HelpText from 'zdp-design-system/components/HelpText';
  import Input from 'zdp-design-system/components/Input';
  import Label from 'zdp-design-system/components/Label';

  const prefix = $props.id();
  const projectId = prefix + '-project';
  const helpId = projectId + '-help';
  const errorId = projectId + '-error';
  const referenceId = prefix + '-reference';
  const archivedId = prefix + '-archived';

  let project = $state('');
  let touched = $state(false);
  let owner = $state('');
  let query = $state('');
  let result = $state('');
  let invalid = $derived(touched && project.trim().length < 2);

  const owners = [
    { id: 'platform', value: 'platform', label: '플랫폼 운영' },
    { id: 'security', value: 'security', label: '보안 검토' },
    { id: 'archive', value: 'archive', label: '보관 팀', disabled: true }
  ];
  let results = $derived(owners.filter((option) => option.label.includes(query.trim())));

  function submit(event: SubmitEvent) {
    event.preventDefault();
    touched = true;
    result = '';
    if (project.trim().length < 2) return;
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) return;
    const data = new FormData(form);
    result = `${data.get('project')} / ${data.get('owner')} / ${data.get('reference')}`;
  }
</script>

<form onsubmit={submit}>
  <Field required {invalid}>
    <Label forId={projectId}>프로젝트 이름</Label>
    <Input
      id={projectId}
      name="project"
      bind:value={project}
      required
      {invalid}
      describedBy={invalid ? [helpId, errorId] : helpId}
      errorMessageId={invalid ? errorId : null}
      onblur={() => (touched = true)}
    />
    <HelpText id={helpId}>공개 표기에 사용됩니다.</HelpText>
    {#if invalid}
      <ErrorText id={errorId}>이름을 두 글자 이상 입력하세요.</ErrorText>
    {/if}
  </Field>

  <Combobox
    name="owner"
    label="담당 팀"
    labelVisible
    required
    bind:value={owner}
    bind:query
    options={results}
    placeholder="담당 팀 검색"
    listboxLabel="담당 팀 목록"
    openLabel="담당 팀 목록 열기"
    closeLabel="담당 팀 목록 닫기"
    noResultsText="일치하는 팀이 없습니다."
    selectionRequiredText="목록에서 담당 팀을 선택하세요."
  />

  <Field readonly>
    <Label forId={referenceId}>프로젝트 ID</Label>
    <Input id={referenceId} name="reference" value="ZDP-2401" readonly />
  </Field>
  <Field disabled>
    <Label forId={archivedId}>보관 코드</Label>
    <Input id={archivedId} name="archive" value="A-1" disabled />
  </Field>
  <Button type="submit">검토 요청</Button>
  <p role="status">{result}</p>
</form>
```

Combobox의 `query`는 검색 문자열이고 폼의 `owner`에는 선택한 옵션의 `value`가 제출된다. 입력 직후에는 방향키로 항목을 활성화한 뒤 Enter를 누르거나 항목을 직접 클릭해서 선택한다. 비동기 검색에서는 별도의 선택 레코드를 유지하는 방법을 [Svelte 소비 표면](svelte.md)에서 확인한다.

## 표 정렬, 페이지 이동과 알림 닫기

정렬 상태 하나에서 헤더 방향, `th`의 `aria-sort`, 표시 행 순서를 계산한다. 클라이언트 페이지 이동에서는 `onPageChange`가 현재 페이지를 바꾸고 같은 상태로 행 범위를 계산한다. URL 기반 목록에서는 `hrefForPage`로 목적지를 만들고 로더 또는 라우터가 읽은 페이지를 `currentPage`에 전달한다.

```svelte
<script lang="ts">
  import 'zdp-design-system/tokens.css';
  import Pagination from 'zdp-design-system/components/Pagination';
  import SortHeader from 'zdp-design-system/components/SortHeader';
  import StatusToast from 'zdp-design-system/components/StatusToast';
  import Table from 'zdp-design-system/components/Table';

  const rows = [
    { id: 'access', name: '권한 분리', score: 30 },
    { id: 'audit', name: '감사 기록', score: 10 },
    { id: 'restore', name: '복구 점검', score: 40 },
    { id: 'notice', name: '사용자 통지', score: 20 }
  ];
  const pageSize = 2;

  let direction = $state<'ascending' | 'descending'>('ascending');
  let page = $state(1);
  let sorted = $derived([...rows].sort((a, b) =>
    direction === 'ascending' ? a.score - b.score : b.score - a.score
  ));
  let visible = $derived(sorted.slice((page - 1) * pageSize, page * pageSize));
  let notices = $state([
    { id: 'loaded', message: '점검 목록을 불러왔습니다.', dismissLabel: '목록 알림 닫기' },
    { id: 'updated', message: '점수를 갱신했습니다.', dismissLabel: '점수 알림 닫기' }
  ]);
</script>

<Table caption="보안 점검 목록">
  <thead>
    <tr>
      <th scope="col">항목</th>
      <th scope="col" aria-sort={direction}>
        <SortHeader
          label="점수"
          {direction}
          ascendingLabel="오름차순"
          descendingLabel="내림차순"
          onSort={(_, next) => {
            direction = next;
            page = 1;
          }}
        />
      </th>
    </tr>
  </thead>
  <tbody>
    {#each visible as row (row.id)}
      <tr>
        <th scope="row">{row.name}</th>
        <td>{row.score}</td>
      </tr>
    {/each}
  </tbody>
</Table>
<Pagination
  currentPage={page}
  totalPages={Math.ceil(rows.length / pageSize)}
  ariaLabel="점검 목록 페이지"
  previousLabel="이전"
  nextLabel="다음"
  pageLabel={(number) => `${number}페이지`}
  currentLabel={(number) => `현재 ${number}페이지`}
  onPageChange={(_, next) => (page = next)}
/>
<StatusToast
  placement="inline"
  ariaLabel="점검 알림"
  items={notices}
  onDismiss={(_, item) => (notices = notices.filter((notice) => notice.id !== item.id))}
/>
```

`onDismiss`에서 항목을 즉시 제거하면 포커스가 다음 닫기 버튼, 이전 닫기 버튼, 빈 알림 그룹 순으로 복구된다. 소비 앱이 콜백에서 다른 곳으로 포커스를 옮기면 그 위치를 유지한다.

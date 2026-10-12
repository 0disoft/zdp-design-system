# 호환용 package-root Svelte 표면

package-root import 호환 예시와 Tauri Svelte WebView 소비 범위를 담는다. 컴포넌트별 동작 계약은 `docs/consumer-contract/` 목적별 문서를 따른다.

이 절의 package-root 예시는 기존 Svelte, SvelteKit, Tauri Svelte WebView 소비처의 호환 검증용이다. 새 표면은 앞 절의 direct component subpath를 사용한다.

```svelte
<script lang="ts">
  import {
    Accordion,
    AdSlot,
    Avatar,
    Breadcrumb,
    Button,
    CodeBlock,
    Combobox,
    CommandField,
    ConfirmAction,
    Container,
    Divider,
    Dialog,
    Disclosure,
    EmptyState,
    Field,
    Grid,
    HelpText,
    Icon,
    Input,
    IdentityChip,
    Inline,
    InlineCode,
    Kbd,
    KeyValue,
    Label,
    Link,
    LocaleSwitcher,
    Menu,
    Page,
    PageHeader,
    Pagination,
    Popover,
    Progress,
    ResizableSplitPane,
    Section,
    SegmentedControl,
    ShareDock,
    Sheet,
    ShortcutHint,
    Skeleton,
    SkipLink,
    SortHeader,
    Stack,
    StatusToast,
    Spinner,
    Surface,
    Tabs,
    Table,
    TableToolbar,
    TermSheet,
    TermTrigger,
    TextScaleControl,
    ThemeToggle,
    Tooltip,
    Toast,
    Toolbar,
    VisuallyHidden
  } from 'zdp-design-system';
  import {
    createZdpSplitPaneController,
    createZdpSplitPaneSizePersistence
  } from 'zdp-design-system/split-pane';

  let dialogOpen = false;
</script>

<Page labelledBy="consumer-contract-title">
  <SkipLink href="#content">본문으로 건너뛰기</SkipLink>
  <Section spacing="lg">
    <Container size="lg" gutter="page">
      <PageHeader labelledBy="consumer-contract-title">
        <span slot="eyebrow">플랫폼</span>
        <h1 id="consumer-contract-title">디자인 시스템</h1>
        <p slot="summary">공개 화면과 작업 화면이 같은 기준 위에서 움직입니다.</p>
      </PageHeader>
    </Container>
  </Section>
  <Container as="section" id="content" size="lg" gutter="page">
    <Stack gap="md">
    <Breadcrumb
      ariaLabel="현재 위치"
      items={[
        { label: '홈 화면', href: '/' },
        { label: '플랫폼', href: '/platform' },
        { label: '디자인 시스템' }
      ]}
    />
    <Link href="/design">자세히 보기</Link>
    <IdentityChip
      label="홍길동"
      description="검토 담당"
      initials="홍"
      href="/people/hong"
    />
    <Avatar label="플랫폼 팀" initials="플" tone="primary" />
    <ShareDock
      placement="inline"
      ariaLabel="공유"
      items={[
        { id: 'copy', label: '링크 복사', icon: 'copy' },
        { id: 'telegram', label: '텔레그램', icon: 'telegram', href: '/share' },
        { id: 'x', label: 'X', icon: 'x', href: '/share' }
      ]}
    />
    <Button
      variant="secondary"
      onclick={() => (dialogOpen = true)}
      ariaControls="project-dialog"
      ariaExpanded={dialogOpen}
    >
      <Icon size="sm">+</Icon>
      <VisuallyHidden>새 항목 </VisuallyHidden>추가
    </Button>
    <Divider />
    <Disclosure title="검토 기준" open headingLevel={2}>
      <p>필요한 기준만 펼쳐서 확인합니다.</p>
    </Disclosure>
    <Accordion
      ariaLabel="접힌 안내"
      items={[
        {
          id: 'scope',
          title: '범위',
          content: '화면 흐름과 데이터 판단은 소비 앱에서 정합니다.',
          open: true
        },
        {
          id: 'owner',
          title: '소유자',
          content: '표시할 항목과 권한 판단은 제품 저장소가 연결합니다.'
        }
      ]}
    />
    <SegmentedControl
      ariaLabel="보기 방식"
      items={[
        { id: 'list', label: '목록' },
        { id: 'cards', label: '카드' },
        { id: 'summary', label: '요약' }
      ]}
      selectedId="list"
    />
    <CommandField
      label="빠른 이동"
      labelVisible
      placeholder="프로젝트, 문서, 설정 검색"
      describedBy="command-field-help"
    />
    <HelpText id="command-field-help">이 화면에서 찾을 항목을 입력하세요.</HelpText>
    <Combobox
      name="owner"
      label="담당"
      labelVisible
      placeholder="담당 팀 찾기"
      options={[
        { id: 'platform', value: 'platform', label: '플랫폼 운영' },
        { id: 'security', value: 'security', label: '보안 검토' }
      ]}
    />
    <p>배포 값은 <InlineCode text="readonly" /> 상태로 남깁니다.</p>
    <CodeBlock
      label="검토 규칙"
      language="ts"
      code={"const requiredEvidence = ['owner', 'budget', 'audit-log'];\nconst ready = requiredEvidence.every((item) => status[item] === 'ready');"}
    />
    <Divider />
    <Grid columns="two" gap="md">
      <Surface padding="lg">
        <strong>공개 표면</strong>
        <p>브랜드, 문서, 로드맵처럼 반복 확인하는 화면을 차분하게 묶습니다.</p>
      </Surface>
      <Surface padding="lg">
        <strong>작업 표면</strong>
        <p>설정, 입력, 검토 흐름은 같은 여백과 focus 규칙 위에 놓입니다.</p>
      </Surface>
    </Grid>
    <Toolbar labelledBy="consumer-contract-toolbar-title">
      <strong id="consumer-contract-toolbar-title">검토 흐름</strong>
      <svelte:fragment slot="actions">
        <Button variant="secondary">초안</Button>
        <Button>검토 요청</Button>
      </svelte:fragment>
    </Toolbar>
    <TableToolbar
      title="점검 목록"
      summary="권한과 감사 항목을 확인합니다."
      selectedCount={2}
      density="compact"
      ariaLabel="점검 목록 도구"
    >
      <svelte:fragment slot="selection-actions">
        <Button variant="secondary">선택 해제</Button>
      </svelte:fragment>
      <svelte:fragment slot="actions">
        <Button>새로 고침</Button>
      </svelte:fragment>
    </TableToolbar>
    <Table caption="보안 점검 목록" density="compact">
      <thead>
        <tr>
          <th scope="col" aria-sort="ascending">
            <SortHeader label="항목" direction="ascending" />
          </th>
          <th scope="col">
            <SortHeader label="상태" direction="none" />
          </th>
          <th scope="col">다음 확인</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">권한 분리</th>
          <td>통과</td>
          <td>분기 리뷰</td>
        </tr>
      </tbody>
    </Table>
    <Pagination
      currentPage={2}
      totalPages={8}
      ariaLabel="점검 목록 페이지"
      hrefForPage={(page) => `?page=${page}`}
    />
    <KeyValue columns="two">
      <dt>소유 저장소</dt>
      <dd>zdp-money-platform</dd>
      <dt>승격 조건</dt>
      <dd>예산, 소유자, 운영 증거 확인</dd>
    </KeyValue>
    <EmptyState labelledBy="contract-empty-title">
      <h2 id="contract-empty-title">아직 공개할 변경이 없습니다.</h2>
      <p>검토가 끝난 항목만 공개 로드맵에 올라갑니다.</p>
    </EmptyState>
    <Field required>
      <Label forId="project-name">프로젝트</Label>
      <Input id="project-name" name="project-name" describedBy="project-name-help" />
      <HelpText id="project-name-help">공개 표기에 사용됩니다.</HelpText>
    </Field>
    <Field readonly>
      <Label forId="project-id">고정 ID</Label>
      <Input id="project-id" name="project-id" value="ZDP-2401" describedBy="project-id-help" readonly />
      <HelpText id="project-id-help">이미 발급된 값은 그대로 둡니다.</HelpText>
    </Field>
    <Field invalid>
      <Label forId="project-status">상태</Label>
      <Input
        id="project-status"
        name="project-status"
        describedBy={['project-status-help', 'project-status-error']}
        errorMessageId="project-status-error"
        invalid
      />
      <HelpText id="project-status-help">현재 작업 상태를 입력하세요.</HelpText>
      <ErrorText id="project-status-error">다음 단계 전에 기준을 확인하세요.</ErrorText>
    </Field>
    <Inline gap="sm">
      <Button>저장</Button>
    </Inline>
    <Dialog
      open={dialogOpen}
      id="project-dialog"
      labelledBy="project-dialog-title"
      describedBy="project-dialog-desc"
      onClose={() => (dialogOpen = false)}
    >
      <h2 slot="title" id="project-dialog-title">변경 내용을 저장할까요?</h2>
      <p id="project-dialog-desc">저장하면 공개 표기에 바로 반영됩니다.</p>
      <svelte:fragment slot="footer">
        <Button variant="secondary" onclick={() => (dialogOpen = false)}>취소</Button>
        <Button onclick={() => (dialogOpen = false)}>저장</Button>
      </svelte:fragment>
    </Dialog>
    </Stack>
  </Container>
</Page>
```

Tauri shell은 native window, permission, update, file access 결정을 이 패키지에 넘기지 않는다.
이 패키지는 WebView 안의 UI 토큰과 컴포넌트만 담당한다.

상위 개요와 금지 경계는 [docs/CONSUMER_CONTRACT.md](../CONSUMER_CONTRACT.md)를 따른다.

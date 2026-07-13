# Consumer Contract

이 문서는 `zdp-design-system`을 다른 ZDP 저장소에서 소비할 때의 기준이다.
목표는 public web, app shell, product lab, game surface가 같은 토큰과 같은 접근성 기본값을 공유하게 만드는 것이다.
Default component text is English. 소비 앱은 화면 locale에 맞춰 user-facing label, placeholder, aria-label, empty text, toast dismissal text를 prop으로 override한다.

## 공통 원칙

- 소비 저장소는 제품 문구, 라우팅, SEO, 데이터 로딩, 인증, 결제, 권한 판단을 직접 소유한다.
- 디자인 시스템은 색상, 타입, 간격, radius, focus, i18n, control metric, shared component API만 제공한다.
- Card와 CardHeader는 비상호작용 콘텐츠 컨테이너다. `hover`는 테두리 강조만 제공하며 클릭 가능성, 손가락 커서, 키보드 focus를 암시하지 않는다. 전체 카드 이동이나 실행은 내부 Link 또는 Button으로 명시한다.
- 소비 저장소는 `zdp-design-system`의 public export만 사용하고 내부 `src/` deep import를 만들지 않는다.
- package export는 `dist/` 산출물을 통해 소비한다. root runtime entry는 `dist/index.js`, type entry는 `dist/index.d.ts`다. 원천은 `src/lib`, `src/styles`, `tokens/zdp.tokens.json`, `src/lib/share.ts`이고 `dist/`는 release 전 `bun run package:build`로 다시 만든다.
- ZDP monorepo 안의 active sibling 소비처는 unpublished local changes와 package surface를 함께 검증하기 위해 `file:../zdp-design-system`을 유지할 수 있다. 이 경우 CI는 sibling `zdp-design-system`을 checkout하고 `bun run package:build`를 먼저 실행해야 한다.
- standalone consumer, public template, external example처럼 sibling checkout을 전제로 하지 않는 표면은 npm registry package를 사용한다. 0.46.16 이상에서는 `zdp-design-system: ^0.46.16`를 기본 semver 범위로 쓰고, 재현 가능한 release proof가 필요한 곳만 exact version을 pin한다.
- `zdpTokenNames`, `share.js`, `share.d.ts`는 손으로 맞추지 않고 `tokens:generate`, `share-icons:generate` 산출물로 유지한다.
- 새 버전은 소비 저장소가 opt-in으로 채택한다. broad adoption 전에는 대표 소비처에서 시각과 build를 확인한다.
- keyboard focus, flat UI, framed control, Pretendard-first font stack은 소비처에서 임의로 낮추지 않는다.
- 브랜드 워드마크는 `font.family.brand`와 `brand-fonts.css`를 쓰되, 본문과 제품 UI heading은 Pretendard-first sans/display stack을 유지한다.
- 소비 저장소는 `zdp-design-system`을 쓰기 위해 Tailwind, UnoCSS, shadcn registry, daisyUI theme, Skeleton preset, Flowbite theme, external `cn()` helper를 알 필요가 없어야 한다.
- 외부 headless primitive가 내부 구현에 쓰이더라도 public API, CSS class, token, dist export는 ZDP 계약으로만 노출한다.

## Astro 소비 표면

Astro 정적 사이트는 전역 스타일로 기본 CSS를 먼저 불러온다.

```ts
import 'zdp-design-system/styles.css';
```

다국어 페이지가 라틴, 중국어, 데바나가리, 일본어, 태국어 웹폰트를 명시적으로 써야 하면 선택형 locale font entry를 추가한다.

```ts
import 'zdp-design-system/styles.css';
import 'zdp-design-system/locale-fonts.css';
```

`8ailors` 같은 브랜드 워드마크를 보여주는 표면은 선택형 brand font entry를 추가한다.

```ts
import 'zdp-design-system/styles.css';
import 'zdp-design-system/brand-fonts.css';
```

캠페인형 섹션 제목, 짧은 마케팅 문구, 장식적 안내처럼 표현력이 필요한 표면은 선택형 expressive font entry를 추가한다. 이 entry는 기본 UI 폰트를 바꾸지 않는다.

```ts
import 'zdp-design-system/styles.css';
import 'zdp-design-system/expressive-fonts.css';
```

페이지 루트 또는 주요 section에는 `.zdp-surface-reset`을 붙여 font, link, input, focus 기본값을 받는다.
Svelte island 없이 정적 HTML만 쓰는 곳은 스크린리더 전용 보조 텍스트에 `.zdp-visually-hidden` utility를 사용한다.
페이지 root는 `.zdp-page`, 본문 폭은 `.zdp-container`와 `.zdp-container--lg`, 섹션 간격은 `.zdp-section`과 `.zdp-section--spacing-*`, 상단 제목과 액션 흐름은 `.zdp-page-header` utility로 맞춘다.
브랜드 헤더나 로고 옆 워드마크는 `.zdp-brand-lockup`, `.zdp-brand-lockup__mark`, `.zdp-brand-wordmark` utility로 맞추되 제품 기능 제목, CTA, 표 데이터, 본문에는 브랜드 폰트를 쓰지 않는다. `lang="ko"` 같은 locale surface 안에서도 실제 워드마크 텍스트에는 `.zdp-brand-wordmark`를 직접 붙여야 하며 `.zdp-surface-reset .zdp-brand-wordmark`가 locale font override보다 뒤에서 브랜드 스택, `font-size: calc(var(--zdp-type-page-title-size) - 0.8rem)`, `font-size: calc(var(--zdp-type-page-title-compact-size) - 0.5rem)`, `font-weight: var(--zdp-font-weight-semibold)`을 유지한다.
가까운 요소의 세로 흐름은 `.zdp-stack`과 `.zdp-stack--gap-*` utility로 맞춘다.
가까운 버튼, 배지, 작은 링크 묶음의 가로 흐름은 `.zdp-inline`과 `.zdp-inline--gap-*` utility로 맞춘다.
가까운 내용 사이의 얇은 구분선은 `.zdp-divider`와 `.zdp-divider--horizontal` utility로 맞추되, section spacing은 소비처가 소유한다.
반복 카드나 요약 묶음은 `.zdp-grid`, 가까운 화면 도구와 액션 묶음은 `.zdp-toolbar` utility로 맞춘다.
CommandField는 검색, 빠른 이동, 명령 팔레트 진입처럼 짧은 keyboard affordance가 필요한 입력에 `CommandField` 또는 `.zdp-command-field-shell`, `.zdp-command-field`, `.zdp-command-field__input`, `.zdp-command-field__shortcut`, `.zdp-kbd`, `.zdp-shortcut-hint` utility로 맞춘다.
Combobox는 검색 가능한 단일 선택에 `Combobox` 또는 `.zdp-combobox`, `.zdp-combobox__control`, `.zdp-combobox__input`, `.zdp-combobox__listbox`, `.zdp-combobox__option` utility로 맞춘다. option source, filtering, async loading, command 실행, 권한 판단은 소비처가 소유한다.
AdSlot은 광고나 후원 자리의 reserved layout, accessible label, placement/state data attribute만 제공한다. `AdSlot` 또는 `.zdp-ad-slot`, `data-zdp-ad-slot`, `data-zdp-ad-placement`, `data-zdp-ad-state` utility로 자리를 예약하되 provider script, consent, slot id, ads.txt, personalized ads 판단은 소비 앱이 계속 소유한다.
문서, 보안, 아키텍처 페이지의 코드 조각은 `InlineCode`, `CodeBlock`, `.zdp-inline-code`, `.zdp-code-block`, `.zdp-code-block__copy` utility로 맞춘다.
사람, 팀, 조직의 짧은 표기는 `.zdp-avatar`, `.zdp-avatar__initials`, `.zdp-identity-chip`, `.zdp-identity-chip__label` utility로 맞추되 실제 계정 식별, 프로필 라우팅, 온라인 상태, 권한, 초대 가능 여부 판단은 소비처가 소유한다.
테마 전환 버튼은 `.zdp-theme-toggle`, `.zdp-theme-toggle__icon`, `data-zdp-theme-state` utility로 맞추되 초기 테마 결정, 사용자 저장소, 시스템 선호도, SSR/초기 paint 처리는 소비처가 소유한다.
언어 선택은 `.zdp-locale-switcher`, `.zdp-locale-switcher__item`, `data-zdp-locale-value` utility로 맞추되 실제 message catalog, URL routing, fallback locale, storage key, `<html lang>` 반영, 사용자 선호도 판단은 소비처가 소유한다.
글자 크기 선택은 `.zdp-text-scale-control`, `.zdp-text-scale-control__item`, `data-zdp-text-scale-value` utility로 맞추되 실제 문서 크기 반영, 저장소, 사용자 선호도 판단은 소비처가 소유한다.
짧은 보조 설명은 `.zdp-tooltip`, `.zdp-tooltip__trigger`, `.zdp-tooltip__content` utility로 배치하되 긴 도움말, popover, validation, tour는 소비처가 별도 흐름으로 소유한다.
접힌 안내와 반복되는 펼침 목록은 `.zdp-disclosure`, `.zdp-disclosure__trigger`, `.zdp-disclosure__panel`, `.zdp-accordion`, `.zdp-accordion__item` utility로 맞추되 실제 FAQ 문구, 설정 값, 항목 노출, 권한, 데이터 fetch 판단은 소비처가 소유한다.
보기 방식, 밀도, 기간처럼 가까운 단일 선택은 `.zdp-segmented-control`, `.zdp-segmented-control__item` utility로 맞추되 실제 필터 의미, URL state, 정렬, 데이터 로딩, 권한 판단은 소비처가 소유한다.
설정, 더보기, 필터, 계정 메뉴처럼 가까운 트리거에서 짧게 펼치는 표면은 `.zdp-popover`, `.zdp-popover__trigger`, `.zdp-popover__panel`, `.zdp-menu`, `.zdp-menu__trigger`, `.zdp-menu__panel`, `.zdp-menu__item` utility로 맞추되 항목 노출, 권한, 라우팅, 필터 의미, 계정 상태 판단은 소비처가 소유한다.
설정, 필터, 보조 흐름처럼 현재 화면 가장자리에서 확인하는 modal edge panel은 `.zdp-sheet`, `.zdp-sheet__backdrop`, `.zdp-sheet__header`, `.zdp-sheet__body`, `.zdp-sheet__footer` utility로 맞추되 저장, 권한, 데이터 fetch, 라우팅 판단은 소비처가 소유한다.
저장, 동기화, 실패 같은 짧은 상태 알림은 `.zdp-toast`, `.zdp-toast__body`, `.zdp-toast__close`, `.zdp-status-toast`, `.zdp-status-toast--inline|top-start|top-end|bottom-start|bottom-end` utility로 맞추되 알림 발생 조건, 큐 순서, 자동 닫힘 타이머, 중복 제거, 재시도 정책, 권한, 서버 상태 판단은 소비처가 소유한다.
작업 진행, 응답 대기, 콘텐츠 자리 예약은 `.zdp-progress`, `.zdp-spinner`, `.zdp-skeleton`, `.zdp-skeleton__line` utility로 맞추되 로딩 조건, 진행률 계산, 완료/실패 전환, 데이터 fetch, 재시도, 권한, 서버 상태 판단은 소비처가 소유한다.
작은 glyph는 `.zdp-icon`과 `.zdp-icon--sm|md` utility로 중앙정렬하되 의미와 라벨 문구는 소비처가 소유한다.
정렬 가능한 표 헤더와 표 주변 도구는 `.zdp-sort-header`, `.zdp-sort-header__label`, `.zdp-sort-header__mark`, `.zdp-table-toolbar`, `.zdp-table-toolbar__controls`, `.zdp-table-toolbar__actions` utility로 맞추되 `aria-sort`, 실제 정렬, 선택 행 상태, 밀도 저장, 필터, 권한 판단은 소비처가 소유한다.
목록 페이지 이동은 `.zdp-pagination`, `.zdp-pagination__list`, `.zdp-pagination__link`, `.zdp-pagination__ellipsis` utility로 맞추되 전체 개수, 현재 페이지 상태, 페이지 크기, 쿼리 라우팅, 필터, 정렬, 데이터 로딩 판단은 소비처가 소유한다.
공유 도크는 `.zdp-share-dock`, `.zdp-share-dock--side|rail|bottom|inline`, `.zdp-share-action`, `.zdp-share-icon`, `.zdp-share-action__tooltip` utility로 배치하되 URL 생성, clipboard, navigator.share, 플랫폼별 공유 링크는 소비처가 소유한다.
Svelte island 없이 Astro에서 공유 아이콘 shape만 필요하면 `zdp-design-system/share`에서 `zdpShareIcons`와 `ZdpShareIconName`을 가져온다.
플랫폼 브랜드 공유 아이콘은 Simple Icons path 기준을 유지하고 임의 outline glyph로 대체하지 않는다.
Astro 페이지는 Svelte island가 필요한 부분에서만 Svelte 컴포넌트를 가져온다.

## Svelte와 Tauri 소비 표면

Svelte, SvelteKit, Tauri Svelte WebView는 package root에서 shared component를 가져온다.

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

  let dialogOpen = false;
</script>

<Page labelledBy="consumer-contract-title">
  <SkipLink href="#content">본문으로 건너뛰기</SkipLink>
  <Section spacing="lg">
    <Container size="lg" padding="lg">
      <PageHeader labelledBy="consumer-contract-title">
        <span slot="eyebrow">플랫폼</span>
        <h1 id="consumer-contract-title">디자인 시스템</h1>
        <p slot="summary">공개 화면과 작업 화면이 같은 기준 위에서 움직입니다.</p>
      </PageHeader>
    </Container>
  </Section>
  <Container as="section" id="content" size="lg" padding="lg">
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
Breadcrumb는 page-location trail, link, separator, current-page aria 구조만 제공하며 라우팅, SEO, 인증, 결제, 권한 판단은 소비 앱이 계속 소유한다.
Button과 IconButton은 native button 위의 framed control 표면이며 `onclick`, `ariaLabel`, `ariaControls`, `ariaExpanded`, `ariaPressed`, `ariaDescribedBy`, `ariaKeyShortcuts` 같은 액션 연결 props를 전달한다. 저장, 삭제, 권한, 결제 판단은 소비 앱이 계속 소유한다.
ConfirmAction은 중요한 액션을 밀기 또는 길게 누르기로 확인하는 표면이며 `onconfirm` 콜백만 전달한다. 결제, 삭제, 권한, 환불 판단과 서버 요청은 소비 앱이 계속 소유한다.
Avatar와 IdentityChip은 사람, 팀, 조직의 visual identity, 이니셜, 이름, 보조 텍스트, 선택적 링크 표면만 제공하며 실제 계정 식별, 프로필 라우팅, 온라인 상태, 권한, 초대 가능 여부 판단은 소비 앱이 계속 소유한다.
Icon은 장식용 glyph 또는 짧은 보조 기호의 박스, 크기, 중앙정렬만 제공하며 의미, 라벨 문구, 상태 판단은 소비 앱이 계속 소유한다.
Link는 일반 텍스트 이동, hover 색상 변화, keyboard focus highlight만 제공하며 라우팅, SEO, 인증, 결제, 권한 판단은 소비 앱이 계속 소유한다. 실제 단축키가 구현된 링크만 `ariaKeyShortcuts`를 전달한다.
SkipLink는 반복 탐색을 건너뛰는 keyboard-first link 구조와 focus-visible 표시만 제공하며 target id, 페이지 레이아웃, 라우팅 판단은 소비 앱이 계속 소유한다.
VisuallyHidden은 screen-reader-only 보조 텍스트 숨김만 제공하며 라벨 문구, 번역, 권한, 데이터 판단은 소비 앱이 계속 소유한다.
ShareDock은 공유 도크의 위치, 아이콘, tooltip, focus-visible 표면만 제공하며 URL 생성, clipboard, navigator.share, 플랫폼별 공유 링크, 권한 판단은 소비 앱이 계속 소유한다. 문서 본문 옆에 붙는 sticky 공유 레일은 `rail` placement를 사용한다.
`zdpShareIcons`는 공유 아이콘 shape 데이터만 제공하며 플랫폼별 공유 URL, target, rel, 클릭 가능 여부는 소비 앱이 계속 소유한다. Telegram, LINE, WhatsApp, X, Reddit 같은 플랫폼 브랜드 glyph는 Simple Icons path 기준을 유지한다.
ThemeToggle은 light/dark 전환 버튼의 pressed 상태, glyph, 접근성 이름, focus-visible 표면만 제공하며 초기 테마 결정, storage key, system preference, SSR/초기 paint 처리는 소비 앱이 계속 소유한다.

LocaleSwitcher는 locale 선택을 위한 radiogroup, 선택 상태, focus-visible, keyboard 이동 표면만 제공한다. 실제 message catalog 로딩, URL routing, fallback locale, root `lang`, storage key, 사용자 preference 저장은 소비 앱이 계속 소유한다.

TextScaleControl은 글자 크기 선택을 위한 radiogroup, 선택 상태, focus-visible, keyboard 이동 표면만 제공한다. 실제 document root 배율, media query, storage key, locale별 글자 크기 보정, 사용자 preference 저장은 소비 앱이 계속 소유한다.
Tooltip은 짧은 보조 설명 표면만 제공하며 Escape dismiss를 유지하고, 긴 도움말, validation message, popover, tour, 권한 판단은 소비 앱이 계속 소유한다. 설명이 접근성 이름을 보강해야 할 때만 Tooltip `id`를 넘기고 trigger에 `aria-describedby`를 연결한다.
Accordion과 Disclosure는 접힌 안내, 설정 묶음, FAQ형 설명의 trigger/panel/`aria-expanded`/`aria-controls` 구조만 제공하며 실제 FAQ 문구, 설정 값, 항목 노출, 권한, 데이터 fetch 판단은 소비 앱이 계속 소유한다. Accordion은 단일 또는 복수 열린 상태를 관리하지만 항목 visibility, 필터 의미, 서버 상태 판단으로 확장하지 않는다.
SegmentedControl은 보기 방식, 밀도, 기간처럼 가까운 단일 선택의 `radiogroup`/`radio`/`aria-checked` 구조만 제공하며 실제 필터 의미, URL state, 정렬, 데이터 로딩, 권한 판단은 소비 앱이 계속 소유한다.
Popover와 Menu는 설정, 더보기, 필터, 계정 메뉴처럼 가까운 트리거에서 짧게 펼치는 표면만 제공하며 항목 노출, 권한, 라우팅, 필터 의미, 계정 상태 판단은 소비 앱이 계속 소유한다. Popover는 `closeOnEscape`와 `closeOnOutside`로 dismissal을 명시적으로 보호할 수 있고, 보호 중에도 non-modal 표면답게 outside target focus를 막지 않는다. ARIA Menu는 키보드 탈출을 보장해야 하므로 Escape/outside dismissal opt-out을 제공하지 않는다. 두 컴포넌트는 trigger focus 복귀, 실제 click target focus 보존, menu keyboard movement 같은 기본 상호작용만 유지하고 tour, validation, modal decision, floating collision engine 역할로 확장하지 않는다. 모바일 keyboard, 긴 옵션, async option, grouped option, virtualized list, collision 반복 요구는 Popover/Menu/Combobox 안에서 계속 키우지 않고 Sheet flow 또는 headless spike로 보낸다.
Sheet는 right, left, bottom edge panel로 설정, 필터, 보조 흐름을 여는 modal surface만 제공한다. Escape 닫기, backdrop 닫기, Tab 순환, scroll lock, background `inert`, 이전 focus 복귀, `role="dialog"`, `aria-modal` 구조는 Sheet 표면의 기본 동작으로 유지한다. `closeOnEscape` 또는 `closeOnBackdrop`을 끄면 해당 입력은 modal을 닫지 않는다. 비활성 backdrop은 button이나 Close action으로 노출하지 않고 접근성 트리에서 숨기며, pointer 입력 뒤에도 현재 panel focus를 유지한다. Dialog, Sheet, TermSheet가 겹치면 컴포넌트 종류별 고정 순서가 아니라 열린 순서가 실제 stacking order를 결정하고, 아래 layer가 먼저 닫혀도 위 layer의 focus, background isolation, scroll lock을 유지한다. modal manager는 활성 top layer 바깥 DOM 가지를 임시로 inert 처리하고 final close에서 원래 inert 상태를 복구한다. Drawer는 별도 컴포넌트로 복제하지 않고 Sheet placement/use case로 먼저 다룬다. 저장, 권한, 데이터 fetch, 라우팅 판단은 소비 앱이 계속 소유한다.
Sheet root는 `data-zdp-sheet-placement`, `data-zdp-sheet-size`, `data-zdp-sheet-surface="sheet"`를 남겨 QA와 소비 앱이 surface identity를 확인할 수 있게 한다.
Toast와 StatusToast는 저장, 동기화, 실패, 경고처럼 짧은 상태 알림 표면과 dismiss/action/live-region 연결만 제공하며 알림 발생 조건, 큐 순서, 자동 닫힘 타이머, 중복 제거, 재시도 정책, 권한, 서버 상태 판단은 소비 앱이 계속 소유한다. Toast와 StatusToast는 페이지 안 피드백이나 modal decision을 대체하지 않고, 오래 읽어야 하는 안내는 Callout 또는 소비 앱의 별도 흐름으로 남긴다.
Progress, Spinner, Skeleton은 작업 진행, 응답 대기, 콘텐츠 자리 예약 표면만 제공하며 로딩 조건, 진행률 계산, 완료/실패 전환, 데이터 fetch, 재시도, 권한, 서버 상태 판단은 소비 앱이 계속 소유한다. Skeleton은 최종 레이아웃 크기를 예약하는 용도로 쓰고, 실제 텍스트 의미나 빈 상태 판단은 EmptyState 또는 소비 앱의 상태 흐름에 남긴다.
Page는 shared page root, surface reset, theme tone만 제공하며 라우팅, SEO, 데이터, 권한, 제품별 visibility 판단은 소비 앱이 계속 소유한다.
Container는 페이지 폭, inline padding, centered width만 제공하며 그리드 의미, 라우팅, 데이터, 권한, 제품별 visibility 판단은 소비 앱이 계속 소유한다.
Section은 block rhythm과 optional full-width band만 제공하며 카드, 라우팅, 데이터, 권한, 제품별 visibility 판단은 소비 앱이 계속 소유한다.
PageHeader는 제목, 요약, 액션 배치만 제공하며 문구, SEO heading hierarchy, 라우팅, 데이터, 권한 판단은 소비 앱이 계속 소유한다. 일반 문서와 앱 페이지 제목은 `type.pageTitleSize`와 `type.pageTitleCompactSize` 범위에서 시작하고, 브랜드 히어로나 캠페인 표면만 소비 앱의 별도 대형 제목 예외를 둘 수 있다.
Stack은 가까운 요소의 세로 흐름, gap, align만 제공하며 페이지 그리드, 라우팅, 데이터, 권한, 제품별 visibility 판단은 소비 앱이 계속 소유한다.
Inline은 가까운 버튼, 배지, 작은 링크 묶음의 가로 흐름, gap, align, justify만 제공하며 페이지 그리드, 라우팅, 데이터, 권한, 제품별 visibility 판단은 소비 앱이 계속 소유한다.
Divider는 가까운 내용 사이의 구분선, line tone, semantic separator 역할만 제공하며 section layout, page rhythm, 라우팅, 데이터, 권한, 제품별 visibility 판단은 소비 앱이 계속 소유한다.
Grid는 반복되는 카드, 요약, 선택지 묶음의 responsive columns와 gap만 제공하며 각 항목의 의미, 데이터 로딩, 권한 판단은 소비 앱이 계속 소유한다.
Toolbar는 가까운 화면 도구와 액션 묶음의 wrapping, main/action 배치만 제공하며 저장, 삭제, 필터, 권한 판단은 소비 앱이 계속 소유한다.
CommandField는 검색 입력의 label, frame, focus-within, shortcut keycap, help/error id, `ariaKeyShortcuts`, `ariaAutocomplete`, result id 연결, 입력 keydown callback만 제공하며 검색 인덱스, 결과 정렬, command palette, 라우팅, 권한 판단은 소비 앱이 계속 소유한다. 결과 목록, keyboard dispatcher, command 실행 상태는 소비 앱이 계속 소유한다.
Combobox는 검색 가능한 단일 선택의 label, input frame, listbox, active option, disabled option skip, hidden submitted value만 제공한다. IME 조합 중 Enter와 방향키는 선택이나 이동으로 처리하지 않는다. 실제 필터링, async search, command 실행, 권한 판단은 소비 앱이 계속 소유한다. 단순 상태 선택은 native `Select`를 유지하고, 사용자가 입력으로 후보를 좁히는 단일 선택일 때만 Combobox를 쓴다.
AdSlot은 광고나 후원 자리의 reserved layout, accessible label, placement/state data attribute만 제공한다. `placement`는 `inline`, `banner`, `rail`, `between-sections` 같은 layout hint이고, `state`는 `pending`, `filled`, `empty`, `blocked` 같은 표시 상태다. provider markup은 slot으로 소비 앱이 넣고, provider script, consent, slot id, ads.txt, personalized ads 판단은 소비 앱이 계속 소유한다.
InlineCode와 CodeBlock은 문서, 보안, 아키텍처 페이지의 코드 표시, language label, horizontal overflow, 선택적 복사 버튼만 제공하며 syntax highlighting, 코드 실행, 비밀값 탐지, 보안 분류, command palette는 소비 앱이나 문서 파이프라인이 계속 소유한다. CodeBlock은 `code` prop이 있을 때만 복사 버튼을 노출하므로 slot으로 표시한 코드의 복사 문자열은 소비 앱이 명시적으로 넘긴다. 긴 코드는 기본적으로 horizontal overflow 표면에서 스크롤되고, code body는 선택 가능해야 한다.

Kbd와 ShortcutHint는 `/`, `?`, `Enter`, `Esc`, `ArrowUp`, `ArrowDown`, `Ctrl/⌘+Enter` 같은 키캡 힌트만 제공한다. 실제 keydown dispatcher, command palette, 검색 focus 이동, 단축키 안내, 선택, 닫기, 파일 이동은 소비 앱이 소유한다. `ariaKeyShortcuts`와 `aria-keyshortcuts`는 실제 단축키가 동작하는 Button, IconButton, Link, CommandField에만 붙인다. 소비 앱의 전역 단축키 dispatcher는 `shouldZdpIgnoreShortcutEvent`, `isZdpTextEntryTarget`, `isZdpBrowserReservedShortcut`, `zdpShortcutRecommendations`, `zdpShortcutReservedExamples` 같은 shortcut policy helper로 입력창, IME 조합, 브라우저 예약 조합을 먼저 걸러낸다. `input, textarea, select, contenteditable`, `role="textbox"`, `role="searchbox"` 안에서는 전역 단축키를 꺼두고, `event.isComposing` 또는 `keyCode === 229`인 한국어 조합 입력도 무시한다. `Ctrl+K`, `Ctrl+S`처럼 Chrome과 브라우저가 기본 동작으로 가져가는 조합은 소비 앱에서 실제로 가로채고 검증한 경우가 아니면 예시나 UI 힌트로 보여주지 않는다.
Table은 표 형식 정보의 native table, caption, row/column header, horizontal overflow wrapper만 제공하며 정렬, 필터, 데이터 로딩, 권한 판단은 소비 앱이 계속 소유한다. 좁은 폭에서도 header와 cell 데이터가 한 글자씩 쪼개지지 않고 table wrapper가 overflow를 소유해야 한다. Table wrapper는 header 오른쪽에 빈 gutter stripe를 만들 수 있는 상시 `scrollbar-gutter: stable`을 기본값으로 쓰지 않는다.
SortHeader와 TableToolbar는 sortable column affordance, 선택 행 액션 자리, 밀도 전환 표면만 제공하며 `aria-sort`, 실제 정렬 계산, 선택 상태, 필터, 권한, 데이터 로딩 판단은 소비 앱이 계속 소유한다. `aria-sort`는 SortHeader 버튼이 아니라 owning `th` 또는 columnheader에 둔다.
Pagination은 목록 페이지 이동의 `nav`, ordered list, link/button, ellipsis, `aria-current="page"` 구조만 제공하며 전체 개수, 현재 페이지 상태, 페이지 크기, 쿼리 라우팅, 필터, 정렬, 데이터 로딩, 권한 판단은 소비 앱이 계속 소유한다. 작은 컨테이너에서는 pagination nav가 horizontal overflow를 소유하고 페이지 버튼이 여러 줄로 무너지지 않아야 하며, 스크롤 표면 안에서도 focus outline의 위아래 edge가 잘리지 않아야 한다.
KeyValue는 용어와 값의 description list 구조와 responsive columns만 제공하며 실제 원장, 보안, 결제, 권한 판단은 소비 앱이 계속 소유한다.
EmptyState는 비어 있는 상태의 surface, 제목 연결, 액션 배치만 제공하며 비어 있는 조건, 다음 액션 가능 여부, 데이터 재시도 판단은 소비 앱이 계속 소유한다.
TermTrigger와 TermSheet는 용어 설명을 클릭으로 여는 trigger, right sheet, bottom sheet 표면만 제공한다. `.zdp-term-trigger`는 본문 안 용어를 button으로 열고, sheet가 열린 동안에만 `aria-controls`를 연결하며, `.zdp-term-sheet`는 선택된 용어의 짧은 설명, 긴 설명, 예시, 관련 용어, detail link 자리를 보여준다. `.zdp-term-trigger`는 inline interactive text라서 hover에서 글자색을 바꾸지 않고 배경만 강조하며, 좌우 최소 padding과 focus token을 유지하고, 본문 텍스트 선택을 막지 않는다. Escape 닫기, backdrop 닫기, Tab 순환, scroll lock, 이전 focus 복귀는 sheet 표면의 기본 동작으로 유지한다. glossary manifest, locale fallback, 공개 가능 여부, detail page 라우팅 판단은 소비 앱과 glossary pipeline이 계속 소유한다.
TermSheet root는 stable `term_id`를 `data-term-id`와 `data-zdp-term-id`로 남기고, `data-zdp-term-placement`와 `data-zdp-term-surface="sheet"`로 QA와 linter가 선택된 용어 surface를 확인할 수 있게 한다.
TermSheet에는 광고 slot을 넣지 않는다. TermSheet root는 `data-zdp-ad-exclude="true"`를 유지하고, 광고가 필요한 긴 설명은 소비 앱의 별도 detail page에서 다룬다.
Input, Textarea, Select는 `describedBy`에 하나 이상의 id를 연결할 수 있고 invalid 상태에서는 `errorMessageId`로 `aria-errormessage`를 연결한다. 에러 메시지 문구, 검증 조건, 제출 차단 여부는 소비 앱이 결정한다.
Switch도 `describedBy` id 배열과 `errorMessageId`를 통해 invalid 상태의 보조 설명과 에러 메시지를 native switch input에 연결한다.
Input과 Textarea의 `readonly` 상태는 제출과 포커스를 유지하는 읽기 전용 값에 사용한다. 권한 때문에 값을 바꾸면 안 되는지, 단순히 고정 식별자를 보여주는지는 소비 앱이 결정한다.
Tabs는 가까운 정보 묶음 전환을 표현하되 라우팅, 권한, 데이터 로딩 판단은 소비 앱이 계속 소유한다. 같은 페이지에 여러 Tabs가 있으면 `idPrefix`를 넘겨 tab/panel id가 충돌하지 않게 한다.
Dialog는 modal layer, backdrop, close, scroll lock, focus trap, aria 구조만 제공하며 저장, 삭제, 인증, 결제, 권한 판단은 소비 앱이 계속 소유한다.

## Flutter와 Native 소비 표면

Flutter와 native shell은 Svelte 컴포넌트를 직접 소비하지 않는다.
대신 `tokens/zdp.tokens.json`을 theme adapter 입력으로 사용한다.

- `hex`는 기본 theme fallback이다.
- `oklch`는 웹 또는 변환 가능한 렌더러에서 색 의도값으로 사용한다.
- `font.family.korean`, `font.family.latin`, `font.family.chinese`, `font.family.devanagari`, `font.family.japanese`, `font.family.thai`, `font.family.multiscript`는 locale별 fallback 순서의 source of truth다.
- `font.family.brand`는 브랜드 워드마크 전용 source of truth다. 일반 heading의 `font.family.display`와 섞지 않는다.
- `font.family.expressionScript`, `font.family.expressionInscription`, `font.family.expressionSketch`, `font.family.expressionEditorial`, `font.family.expressionSans`, `font.family.expressionKeyboard`는 opt-in 표현용 source of truth다. `expressive-fonts.css`를 import한 표면에서만 캠페인, 섹션 제목, 짧은 보조 안내, 키보드 표식에 제한해서 쓴다.
- `control.heightMd`, `control.glyphMd`, `control.choiceSize`, `control.choiceIndicatorSize`, `control.switchWidth`, `control.switchHeight`, `control.scrollbarSize`, `control.radius`, `control.borderWidth`, `control.hitTarget`은 native control size, icon glyph size, choice mark, switch track, scrollbar 두께를 맞출 때의 기준이다.
- `layer.*`는 skip link, floating overlay, toast, sheet, dialog처럼 겹침 순서가 필요한 surface의 기준이고, 소비처는 raw z-index 숫자를 직접 쌓지 않는다.
- `viewport.*`는 overlay panel clamp, safe-area inset, mobile viewport fallback의 기준이고, 소비처는 modal/sheet/dropdown에 raw `100vh`/`100vw`를 직접 쓰지 않는다.
- 소비처 fixture와 public example은 raw color literal, raw `px`, raw z-index number, raw `100vh`/`100vw`를 쓰지 않는다. `fixtures:check`는 이 위반을 shared token adoption drift로 본다.
- `color.scrollbar.track`, `color.scrollbar.thumb`, `color.scrollbar.thumbHover`는 overflow 영역의 light/dark scrollbar 색 기준이다.
- `color.selection.surface`, `color.selection.text`는 `.zdp-surface-reset` 안의 drag text selection 색 기준이다.
- `focus.surface`, `focus.text`, `focus.line`은 keyboard focus 또는 TV/desktop focus affordance의 기준색이다.
- `.zdp-user-select-control`, `.zdp-user-select-decorative`, `.zdp-user-select-dragging`은 token이 아니라 interaction utility다. 조작 부품, 장식 표면, 실제 드래그 중 상태에만 쓰고 읽는 정보의 기본 선택 가능성을 덮지 않는다.

## 소비처 적용 체크리스트

- `styles.css`를 먼저 import한다.
- 다국어 웹폰트가 필요한 경우에만 `locale-fonts.css`를 추가한다.
- 브랜드 워드마크가 필요한 경우에만 `brand-fonts.css`를 추가한다.
- 표현용 섹션이나 캠페인 문구가 필요한 경우에만 `expressive-fonts.css`를 추가한다.
- Svelte component는 package root에서만 import한다.
- Link를 쓰는 화면은 hover가 색상 변화 중심이고 focus가 sunlit gold highlight로 보이는지 확인한다.
- SkipLink를 쓰는 화면은 첫 Tab 대상에서 보이고 본문 target id로 이동하는지 확인한다.
- VisuallyHidden을 쓰는 화면은 화면에는 보이지 않지만 접근성 이름이나 설명에 포함되는지 확인한다.
- Page, Container, Section, PageHeader를 쓰는 화면은 page root, width, section rhythm, header actions만 바뀌고 라우팅, SEO, 데이터, 권한 판단이 생기지 않는지 확인한다.
- Stack을 쓰는 화면은 spacing만 바뀌고 색상, 그림자, hover, 제품별 layout 판단이 생기지 않는지 확인한다.
- Inline을 쓰는 화면은 horizontal wrapping만 바뀌고 색상, 그림자, hover, 제품별 layout 판단이 생기지 않는지 확인한다.
- Divider를 쓰는 화면은 구분선만 바뀌고 section spacing, 그림자, 배경 장식, 제품별 layout 판단이 생기지 않는지 확인한다.
- Grid를 쓰는 화면은 반복되는 카드나 요약 묶음의 columns와 gap만 바뀌고 항목 의미, 데이터 로딩, 권한 판단이 생기지 않는지 확인한다.
- Toolbar를 쓰는 화면은 가까운 도구와 액션 wrapping만 바뀌고 저장, 삭제, 필터, 권한 판단이 생기지 않는지 확인한다.
- CommandField를 쓰는 화면은 label, help/error id, Tab focus, `/` 같은 shortcut 표시가 맞고, 실제 검색/라우팅/command 실행 판단은 소비 앱에 남는지 확인한다.
- Combobox를 쓰는 화면은 combobox/listbox/option aria 구조, ArrowUp/ArrowDown/Enter/Escape 동작, IME composition 보호, disabled option skip, hidden submitted value가 맞고, 실제 필터링, async search, command 실행, 권한 판단은 소비 앱에 남는지 확인한다.
- AdSlot을 쓰는 화면은 `data-zdp-ad-slot`, placement/state attribute, reserved size가 남고, provider script, consent, slot id, ads.txt, personalized ads 판단이 소비 앱에 남는지 확인한다.
- Kbd와 ShortcutHint를 쓰는 화면은 보이는 단축키가 실제로 동작하는지 확인한다. 동작하지 않는 힌트는 제거하고, 실제 단축키가 있는 control에만 `ariaKeyShortcuts`를 붙인다.
- Avatar와 IdentityChip을 쓰는 화면은 이름, 이니셜, 보조 텍스트, 현재 링크 상태만 표면에 남고, 실제 계정 식별, 온라인 상태, 권한, 초대 가능 여부 판단은 소비 앱 상태와 맞는지 확인한다.
- Accordion과 Disclosure를 쓰는 화면은 trigger에 `aria-expanded`와 `aria-controls`가 남고, 실제 항목 노출, 권한, 데이터 fetch 판단은 소비 앱 상태와 맞는지 확인한다.
- SegmentedControl을 쓰는 화면은 `radiogroup`, `radio`, `aria-checked`가 남고, 실제 필터 의미, URL state, 정렬, 데이터 로딩, 권한 판단은 소비 앱 상태와 맞는지 확인한다.
- Table을 쓰는 화면은 caption 또는 labelledBy가 있고, `th scope="col"`과 `th scope="row"`가 필요한 곳에 남는지 확인한다.
- SortHeader와 TableToolbar를 쓰는 화면은 정렬 중인 열의 owning `th`에 `aria-sort`가 남고, 선택 행 액션과 밀도 전환이 소비 앱 상태와 맞는지 확인한다.
- TermTrigger와 TermSheet를 쓰는 화면은 클릭으로 열리고, Escape 닫기, Tab 순환, 이전 focus 복귀가 유지되는지 확인한다.
- Dialog, Sheet, TermSheet를 쓰는 화면은 열린 동안 body scroll이 잠기고 닫힌 뒤 이전 scroll 상태가 복구되는지 확인한다. focus trap은 직접 disabled control뿐 아니라 disabled fieldset 안 control, hidden·`aria-hidden`·`inert` 조상 아래 control을 순환 후보에서 제외해야 한다. `closeOnEscape=false`와 `closeOnBackdrop=false`에서는 해당 입력 뒤에도 modal과 scroll lock이 유지되고, 비활성 backdrop이 Close button으로 노출되지 않으며 panel focus를 빼앗지 않는지 확인한다. 둘 이상 겹치면 나중에 열린 layer가 실제로 위에 놓이고, 아래 layer가 먼저 닫혀도 위 layer의 focus와 scroll lock이 유지되며 마지막 layer가 닫힐 때 살아 있는 바깥 trigger로 focus가 돌아오는지 확인한다.
- Sheet를 쓰는 화면은 `data-zdp-sheet-placement`, `data-zdp-sheet-size`, `data-zdp-sheet-surface="sheet"`가 남고 Drawer 변형을 별도 컴포넌트로 복제하지 않았는지 확인한다.
- TermSheet root에는 `data-term-id`, `data-zdp-term-id`, `data-zdp-term-placement`, `data-zdp-term-surface="sheet"`가 남는지 확인한다.
- TermSheet에는 광고 slot이 없고 root에 `data-zdp-ad-exclude="true"`가 남는지 확인한다.
- Pagination을 쓰는 화면은 현재 페이지 항목에 `aria-current="page"`가 남고, URL 또는 버튼 콜백이 소비 앱의 실제 page state와 맞는지 확인한다.
- KeyValue를 쓰는 화면은 용어와 값이 `dt`와 `dd`로 남고, 값의 생성/권한/결제 판단이 컴포넌트로 들어오지 않는지 확인한다.
- EmptyState를 쓰는 화면은 제목 id가 연결되고 다음 액션 가능 여부를 소비 앱이 결정하는지 확인한다.
- Input, Textarea, Select의 invalid 상태는 help id와 error id를 모두 `aria-describedby`로 연결하고, error id를 `aria-errormessage`로도 연결하는지 확인한다.
- Input과 Textarea의 readonly 상태는 disabled처럼 흐려져 제출/복사/포커스 흐름을 끊지 않는지 확인한다.
- Breadcrumb를 쓰는 화면은 현재 페이지 항목에 `aria-current="page"`가 남는지 확인한다.
- Flutter/native adapter는 `tokens/zdp.tokens.json`의 token name을 유지한다.
- 소비처 자체 CSS에서 `box-shadow`, gradient, hover transform으로 shared component 기본값을 덮어쓰지 않는다.
- Overflow가 생기는 표, 패널, 페이지는 `.zdp-surface-reset` 범위 안에서 theme scrollbar가 보이는지 확인한다.
- 드래그로 텍스트를 선택했을 때 `.zdp-surface-reset` 범위 안에서 theme selection surface/text가 보이고 브라우저 기본 파란색이 남지 않는지 확인한다.
- Button, IconButton, MenuItem, SegmentedControl item, Pagination link, SortHeader, copy button, icon, separator, spinner, skeleton처럼 누르거나 장식인 표면만 선택되지 않는지 확인한다.
- Table cell, code body, toast message, document body, card data, identity label, 주소, 이메일, ID, 날짜, 가격, 에러 메시지는 계속 선택하고 복사할 수 있는지 확인한다.
- Drag interaction은 drag start부터 end/cancel/pointer release까지만 `.zdp-user-select-dragging`을 붙이고, 앱 root나 page/card/list/table container에 상시 `user-select: none`이 남지 않는지 확인한다.
- light/dark, keyboard focus, disabled, invalid 상태를 소비처 화면에서 확인한다.
- Theme / Locale Stress story에서 light/dark, ZDP Mobile 폭, 긴 한국어/영어/중국어/힌디어/베트남어/러시아어/말레이어/태국어 문장, focus-visible 상태가 함께 무너지지 않는지 확인한다.
- Dialog를 쓰는 화면은 Tab 순환, Escape 닫기, backdrop 닫기, 이전 focus 복귀를 확인한다.
- 새 디자인 시스템 버전은 대표 소비처 한 곳에서 build와 시각 QA를 통과한 뒤 확산한다.

## 금지 경계

- 디자인 시스템에 제품별 화면, 랜딩 문구, admin 정책, 결제 판단, 권한 판단, 개인정보 처리 로직을 넣지 않는다.
- 소비 저장소가 `zdp-design-system/src/...` 같은 내부 경로를 직접 import하지 않는다.
- 배포 package는 `bun run package:build`로 만든 `dist/` export를 쓰며, 소비자 fixture가 public import만으로 build되는지 확인한다.
- token name을 제품별 별칭으로 복사해 fork하지 않는다.
- focus 색을 브랜드 장식색, hover 색, semantic danger/success 색으로 재사용하지 않는다.
- 앱 root, page root, card, table cell, code body, document body, toast body에 `user-select: none`을 적용하지 않는다.
- 보안을 이유로 선택만 막지 않는다. 화면에 노출하면 복사 가능하다고 보고, 노출하면 안 되는 값은 렌더링하지 않는다.
- `selectstart` 차단, 우클릭 차단, 문서 전체 selection 차단으로 브라우저 기본 행동을 죽이지 않는다.

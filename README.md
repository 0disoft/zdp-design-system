# zdp-design-system

ZDP의 디자인 토큰, CSS, 아이콘, Svelte UI 컴포넌트 경계를 고정하는 저장소다.

초기 목적은 `zdp-web-public`, `zdp-web-apps`, 제품 실험, 게임 소개 화면이 각자 다른 시각 언어를 만들지 않게 막는 것이다.

## 현재 범위

- 색상, 간격, 타이포그래피, radius, elevation 같은 디자인 토큰
- 공통 CSS reset과 theme contract
- Svelte UI 컴포넌트 public surface
- 아이콘 사용 기준과 접근성 기본 규칙
- Storybook 또는 동등한 컴포넌트 검토 표면

## 시각 방향

기본 톤은 밝은 중세 유럽 마을 광장과 수채화 종이 질감이다. 토큰 값은 parchment, warm brass, muted sage, sunlit gold, umber, terracotta 계열을 쓰되, 토큰 이름은 `primary`, `surface`, `line`, `danger`처럼 역할 중심으로 유지한다.

## Foundation 계약

디자인 시스템은 각 제품의 번역, 라우팅, SEO, 페이지별 레이아웃을 소유하지 않는다. 대신 소비 표면이 깨지지 않도록 다음 공통 계약을 제공한다.
Default component text is English. 제품별 화면은 필요한 모든 user-facing label, placeholder, aria-label, empty text, toast dismissal text를 prop으로 넘겨 각 locale에 맞게 override한다.

- `type`: body, body small, page title, title, label, caption, control, data에 쓰는 기본 크기와 줄높이
- `breakpoint`: mobile, tablet, desktop, wide 기준 폭
- `layer`: behind, floating, toast, sheet, dialog, skip-link 계층 기준
- `viewport`: mobile-safe overlay clamp와 safe-area inset 기준
- `control`: 버튼, 아이콘 버튼, 입력류가 공유할 높이, radius, border width, hit target, 선택 컨트롤 전용 mark, indicator, switch, scrollbar 크기
- `focus`: 키보드 사용자가 현재 위치를 놓치지 않도록 하는 sunlit focus highlight, dark text, dark line
- `selection`: 드래그로 선택한 텍스트가 브라우저 기본 파란색 대신 theme surface와 readable text로 보이게 하는 selection 색
- `brand`: `8ailors` 워드마크 같은 브랜드 표면에만 쓰는 Playwrite AU VIC Guides 기반 폰트 스택
- `i18n`: 긴 텍스트와 CJK/영문/힌디어 혼합 문장이 UI를 밀어내지 않게 하는 wrapping 및 언어별 폰트 기본값

## 현재 제외

- 제품별 화면 구성
- 랜딩 페이지 문구
- 번역 문구, locale 라우팅, SEO hreflang/canonical
- 결제, 권한, 인증, 관리자 의사결정
- 앱 라우팅, API 호출, 데이터 저장
- 브랜드별 캠페인 실험

## 운영 문서

- `service.yaml`
- `AGENTS.md`
- `CONTRIBUTING.md`
- `CHANGELOG.md`
- `SECURITY.md`
- `docs/CONSUMER_CONTRACT.md`
- `docs/EXTERNAL_UI_ADOPTION.md`
- `docs/INTERACTIVE_PRIMITIVE_AUDIT.md`
- `THIRD_PARTY_NOTICES.md`

## 외부 UI 흡수 기준

외부 UI 라이브러리는 ZDP의 dependency source가 아니라 검증 source로 다룬다.
Bits UI와 shadcn-svelte는 Select, Combobox, Dialog, Popover, Menu, Command 같은 고난도 interactive primitive의 동작 명세와 접근성 테스트 후보로만 검토한다.
내부 구현 의존성은 허용할 수 있지만 public API, CSS token, class, DOM 노출 정책은 ZDP가 소유하고 외부 타입이나 Tailwind/shadcn 구조가 package surface로 새면 실패다.
Skeleton, Flowbite Svelte, daisyUI는 패턴 카탈로그로만 보고 core primitive에 직접 유입하지 않는다.
Motion과 SmoothUI류는 marketing recipe로 격리하고 reduced motion 대체를 갖춘다.
Tailwind Plus와 Tailwind UI 계열은 파생/재배포 리스크 때문에 ZDP package 재료로 쓰지 않는다.
외부 source를 참고, 포팅, 복사, 런타임 의존성으로 다루는 기준은 `docs/EXTERNAL_UI_ADOPTION.md`와 `THIRD_PARTY_NOTICES.md`를 따른다.
현재 고난도 primitive의 위험도와 headless dependency 후보 전환 기준은 `docs/INTERACTIVE_PRIMITIVE_AUDIT.md`를 따른다.

## Storybook 검토 기준

- Controls는 `Button`처럼 public props가 있는 컴포넌트의 라벨, 크기, 상태를 직접 바꿔보는 story에만 붙인다.
- Viewports는 ZDP Mobile, Tablet, Desktop, Wide 프리셋으로 mobile/tablet/desktop 폭을 확인한다.
- Accessibility addon은 CI 실패 게이트로 유지한다. 새 story는 a11y 위반을 남긴 채 merge하지 않는다.
- Interaction play는 `Tabs`, `Dialog`, `ConfirmAction`처럼 키보드와 상태 전이가 중요한 컴포넌트에 먼저 붙인다.
- Theme / Locale Stress story는 light/dark, ZDP Mobile 폭, 긴 한국어/영어/중국어/힌디어/베트남어/러시아어/말레이어/태국어 문장, focus-visible 상태를 한 번에 확인한다.

## 패키지 표면

웹 소비 저장소는 공통 CSS 토큰을 먼저 불러온다.

```ts
import 'zdp-design-system/styles.css';
```

10개국어 웹 표면에서 라틴/중국어/힌디어/일본어 웹폰트까지 명시 로드해야 하면 선택형 폰트 CSS를 추가로 불러온다. 한국어 Pretendard는 기본 `styles.css`에서 이미 로드한다.

```ts
import 'zdp-design-system/styles.css';
import 'zdp-design-system/locale-fonts.css';
```

브랜드 워드마크를 렌더링하는 표면은 선택형 브랜드 폰트 CSS를 추가로 불러온다. 이 entry는 body나 일반 heading을 바꾸지 않고 `font.family.brand`, `.zdp-brand-lockup`, `.zdp-brand-wordmark`에 필요한 Playwrite AU VIC Guides font face만 제공한다. 워드마크 텍스트에는 `.zdp-brand-wordmark`를 직접 붙여 locale font override가 브랜드 스택을 덮지 않게 하고, 브랜드명이 너무 가늘게 보이지 않도록 `semibold` weight와 절제된 전용 크기를 쓴다.

```ts
import 'zdp-design-system/styles.css';
import 'zdp-design-system/brand-fonts.css';
```

캠페인형 섹션 제목, 짧은 마케팅 문구, 장식적 안내처럼 표현력이 필요한 표면은 선택형 expressive font CSS를 추가로 불러온다. 이 entry는 일반 제품 UI를 바꾸지 않고 `font.family.expression*` 토큰에 필요한 Tangerine, Caesar Dressing, Google Sans, Merriweather, Fredericka the Great, Copse, Cabin, Libertinus Keyboard font face만 제공한다.

```ts
import 'zdp-design-system/styles.css';
import 'zdp-design-system/expressive-fonts.css';
```

패키지 export는 `dist/` 산출물을 가리킨다. root runtime entry는 `dist/index.js`, type entry는 `dist/index.d.ts`다. 원천은 `src/lib`, `src/styles`, `tokens/zdp.tokens.json`, `src/lib/share.ts`이고 `bun run package:build`가 소비자용 `dist/` 표면을 다시 만든다. 소비 저장소와 문서 예시는 `zdp-design-system` public export만 쓰고 내부 `src/` 경로를 직접 import하지 않는다.

ZDP monorepo 안의 active sibling 소비처는 `file:../zdp-design-system` 의존성을 유지할 수 있다. 이 방식은 release 전 변경을 같이 검증하기 위한 local workspace 계약이므로 CI에서 sibling checkout과 `bun run package:build`를 먼저 수행해야 한다. sibling checkout을 전제로 하지 않는 standalone consumer, public template, external example은 npm registry의 `zdp-design-system: ^0.46.7`를 기본으로 쓴다.

## 소비 컴포넌트 계약

- Breadcrumb는 현재 위치 탐색을 `nav`로 표현하고, 제품 라우팅 판단은 소비 앱이 한다.
- Button과 IconButton은 `onclick` 실행 표면이며 권한, 저장, 네트워크 재시도 판단을 소유하지 않는다.
- Card와 CardHeader는 비상호작용 콘텐츠 컨테이너다. `hover`는 테두리 강조만 제공하며 클릭 가능성, 손가락 커서, 키보드 focus를 암시하지 않는다. 전체 카드 이동이나 실행은 내부 Link 또는 Button으로 명시한다.
- 단축키 표기는 `ariaKeyShortcuts`와 실제 keydown 처리를 분리한다. Chrome과 브라우저가 기본 동작으로 가져가는 조합은 제품 단축키로 덮어쓰지 않는다. 소비 앱의 전역 단축키 dispatcher는 `shouldZdpIgnoreShortcutEvent`, `isZdpTextEntryTarget`, `isZdpBrowserReservedShortcut`, `zdpShortcutRecommendations` 같은 shortcut policy helper로 입력창, IME 조합, 브라우저 예약 조합을 먼저 걸러낸다.
- ConfirmAction은 중요한 액션 앞의 확인 흐름만 제공하고, 실제 삭제나 권한 검사는 소비 앱이 한다.
- Avatar와 IdentityChip은 사람, 팀, 계정의 짧은 식별 표면이다.
- CommandField는 검색 입력 primitive이며 shortcut keycap, `ariaKeyShortcuts`, `ariaAutocomplete`, result id 연결, 입력 keydown callback은 제공하되 실제 검색 로직, 결과 목록, command palette 실행은 소비 앱이 소유한다.
- Combobox는 검색 가능한 단일 선택 입력의 frame, listbox, keyboard navigation, disabled option skip, hidden submitted value만 제공한다. 실제 필터링, async search, command 실행, 권한 판단은 소비 앱이 계속 소유한다.
- AdSlot은 광고나 후원 자리의 reserved layout, accessible label, placement/state data attribute만 제공한다. provider script, consent, slot id, ads.txt, personalized ads 판단은 소비 앱이 계속 소유한다.
- InlineCode와 CodeBlock은 문서, 보안, 아키텍처 화면의 코드 표면이다.
- Icon은 장식용 glyph 기본값을 갖고, 의미 있는 아이콘은 소비 컴포넌트가 접근성 이름을 제공한다.
- Link는 일반 텍스트 링크이며 버튼처럼 보이는 destructive action으로 쓰지 않는다.
- ShareDock은 공유 도크와 아이콘 shape를 제공하고 URL 조립과 플랫폼 정책은 소비 앱이 정한다.
- Kbd와 ShortcutHint는 입력 힌트를 표시할 뿐, 단축키 실행을 등록하지 않는다. 화면에 보이는 힌트는 `/`, `?`, `Esc`, `Enter`, `ArrowUp/ArrowDown`, `Ctrl/⌘+Enter`처럼 자주 쓰고 맥락이 분명한 키만 남긴다. `ariaKeyShortcuts`는 실제 단축키가 소비 앱에서 구현된 control이나 CommandField에만 붙인다.
- LocaleSwitcher는 언어 선택 표면과 keyboard 이동만 제공하고 실제 message catalog, 라우팅, fallback locale, 저장소, `<html lang>` 반영은 소비 앱이 정한다.
- ThemeToggle은 light/dark 전환 버튼의 pressed 상태와 glyph만 제공하고 초기 테마, 저장소, 시스템 선호도 판단은 소비 앱이 정한다.
- TextScaleControl은 읽기 배율 선택 표면과 keyboard 이동만 제공하고 실제 문서 크기 반영, 저장소, 사용자 선호도 판단은 소비 앱이 정한다.
- Tooltip은 짧은 보조 설명만 맡고, Escape dismiss를 유지하며, 긴 안내나 상태 설명은 Popover, Disclosure, 문서 본문으로 보낸다.
- Accordion과 Disclosure는 접힌 안내와 점진적 정보 공개를 담당한다.
- SegmentedControl은 보기 방식이나 단일 모드 전환을 표현한다.
- SortHeader와 TableToolbar는 sortable column affordance, 선택 행 액션, 밀도 조절 같은 표 주변 도구를 맡는다.
- Popover와 Menu는 설정, 더보기, 필터, 계정 메뉴 표면을 제공하지만 메뉴 항목 권한 판단은 소비 앱이 한다.
- Sheet는 설정, 필터, 보조 흐름을 right, left, bottom edge panel로 열고, 저장, 권한, 데이터 fetch, 라우팅 판단은 소비 앱이 한다.
- Pagination은 목록 페이지 이동을 표현하고 데이터 범위 계산은 소비 앱이 한다.
- Progress, Spinner, Skeleton은 작업 진행, 대기, 자리 예약 상태를 보여주며 실제 작업 큐를 소유하지 않는다.
- Toast와 StatusToast는 저장, 동기화, 연결 같은 짧은 상태 피드백을 제공한다.
- `.zdp-combobox`, `.zdp-combobox__control`, `.zdp-combobox__input`, `.zdp-combobox__listbox`, `.zdp-combobox__option`은 검색 가능한 단일 선택의 정적 표면만 제공하고 option source, filtering, async loading은 소비처가 소유한다.
- Text selection의 기본값은 선택 가능이다. 조작 컴포넌트와 장식 요소만 선택을 막고, 드래그 중에는 `zdp-user-select-dragging` 같은 임시 상태로 제한한다.
- SkipLink는 키보드 반복 탐색을 줄이는 첫 번째 탈출구다.
- VisuallyHidden은 스크린리더에 필요한 텍스트를 시각적으로 숨길 때만 쓴다.
- Table, KeyValue, EmptyState는 업무 데이터, 용어-값, 비어 있는 상태를 표현한다.
- TermTrigger와 TermSheet는 용어 설명을 click-open sheet로 연결하며, TermTrigger는 sheet가 열린 동안에만 `aria-controls`를 연결한다. TermTrigger는 본문 안 의미 있는 단어이므로 hover에서 글자색을 바꾸지 않고 배경만 살짝 강조하며, 좌우 최소 padding과 focus token을 유지하고, 텍스트 선택을 막지 않는다. TermSheet root에는 stable `term_id`와 `data-zdp-ad-exclude`를 남긴다. TermSheet에는 광고 slot을 넣지 않는다.
- Dialog는 모달 레이어이며 닫기, scroll lock, focus trap, `describedBy`에 id 배열, `errorMessageId`로 `aria-errormessage` 연결을 명확히 한다.
- Checkbox와 Switch는 native input에 invalid 상태를 노출하고, Radio는 native radio role 제약 때문에 wrapper invalid styling과 `describedBy` 연결을 유지한다. Switch는 `describedBy` id 배열과 `errorMessageId`로 에러 설명을 연결한다.
- Page, Container, Section, PageHeader는 페이지 폭, 섹션 rhythm, 제목 구조를 정리한다.
- Flutter는 Svelte 컴포넌트를 직접 쓰지 않고 `tokens/zdp.tokens.json`과 필요한 platform adapter를 통해 시각 토큰만 소비한다.

Svelte 또는 Tauri(Svelte) 표면은 컴포넌트를 직접 가져온다.

```svelte
<script lang="ts">
  import {
    Accordion,
    AdSlot,
    Avatar,
    Badge,
    Breadcrumb,
    Button,
    Callout,
    Checkbox,
    CodeBlock,
    Combobox,
    CommandField,
    ConfirmAction,
    Container,
    Dialog,
    Disclosure,
    Divider,
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
    SkipLink,
    SegmentedControl,
    Skeleton,
    Stack,
    SortHeader,
    StatusToast,
    Spinner,
    Section,
    ShareDock,
    Sheet,
    ShortcutHint,
    Surface,
    Switch,
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

<Page labelledBy="design-system-title">
  <SkipLink href="#content">본문으로 건너뛰기</SkipLink>
  <Section spacing="lg">
    <Container size="lg" padding="lg">
      <PageHeader labelledBy="design-system-title">
        <span slot="eyebrow">플랫폼</span>
        <h1 id="design-system-title">디자인 시스템</h1>
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
    <Badge tone="success">정상</Badge>
    <IdentityChip
      label="홍길동"
      description="검토 담당"
      initials="홍"
      href="/people/hong"
    />
    <Avatar label="플랫폼 팀" initials="플" tone="primary" />
    <Link href="/design">자세히 보기</Link>
    <ShareDock
      placement="inline"
      ariaLabel="공유"
      items={[
        { id: 'copy', label: '링크 복사', icon: 'copy' },
        { id: 'telegram', label: '텔레그램', icon: 'telegram', href: '/share' },
        { id: 'x', label: 'X', icon: 'x', href: '/share' }
      ]}
    />
    <Callout tone="info" semanticRole="note">
      <strong>다음 단계가 준비됐습니다.</strong>
      <p>필요한 입력을 확인한 뒤 저장하면 변경 내역에 남습니다.</p>
    </Callout>
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
    <Toolbar labelledBy="design-system-toolbar-title">
      <strong id="design-system-toolbar-title">검토 흐름</strong>
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
    <EmptyState labelledBy="empty-roadmap-title">
      <h2 id="empty-roadmap-title">아직 공개할 변경이 없습니다.</h2>
      <p>검토가 끝난 항목만 공개 로드맵에 올라갑니다.</p>
      <svelte:fragment slot="actions">
        <Button variant="secondary">초안 보기</Button>
      </svelte:fragment>
    </EmptyState>
    <Tabs
      idPrefix="project-tabs"
      ariaLabel="프로젝트 섹션"
      items={[
        { id: 'overview', label: '개요' },
        { id: 'history', label: '기록' }
      ]}
      selectedId="overview"
      let:selectedId
    >
      <p>{selectedId === 'history' ? '변경 기록입니다.' : '프로젝트 개요입니다.'}</p>
    </Tabs>
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
    <Checkbox name="release-updates" checked>업데이트 받기</Checkbox>
    <Switch name="autosave" checked>자동 저장</Switch>
    <Inline gap="sm">
      <Button onclick={() => (dialogOpen = true)} ariaControls="project-dialog" ariaExpanded={dialogOpen}>저장</Button>
      <Button variant="secondary">
        <Icon size="sm">+</Icon>
        <VisuallyHidden>새 항목 </VisuallyHidden>추가
      </Button>
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

Astro는 `styles.css`를 전역으로 불러오고, Svelte island가 필요한 부분에서 Svelte 컴포넌트를 소비한다. Flutter는 `tokens/zdp.tokens.json`을 Dart theme adapter 입력으로 쓴다.

정적 HTML 소비처에서 쓸 수 있는 주요 utility class:

| 용도 | utility |
|---|---|
| 페이지 폭, 섹션 리듬, 헤더 | `.zdp-page` `.zdp-container` `.zdp-section` `.zdp-page-header` |
| 세로 흐름 | `.zdp-stack` `.zdp-stack--gap-*` |
| 가로 흐름 | `.zdp-inline` `.zdp-inline--gap-*` |
| 구분선 | `.zdp-divider` `.zdp-divider--horizontal` |
| 카드 그리드, 액션 묶음 | `.zdp-grid` `.zdp-toolbar` |
| 검색 / 명령 팔레트 입력 | `.zdp-command-field-shell` `.zdp-command-field` `.zdp-kbd` `.zdp-shortcut-hint` |
| 사람 / 팀 표기 | `.zdp-avatar` `.zdp-identity-chip` |
| 테마 전환 | `.zdp-theme-toggle` `.zdp-theme-toggle__icon` |
| 언어 선택 | `.zdp-locale-switcher` `.zdp-locale-switcher__item` |
| 글자 크기 선택 | `.zdp-text-scale-control` `.zdp-text-scale-control__item` |
| 보조 설명 | `.zdp-tooltip` `.zdp-tooltip__trigger` `.zdp-tooltip__content` |
| 접힌 안내 | `.zdp-disclosure` `.zdp-accordion` |
| 단일 선택 | `.zdp-segmented-control` |
| 팝오버 / 메뉴 | `.zdp-popover` `.zdp-menu` |
| 시트 / 드로어 | `.zdp-sheet` |
| 상태 알림 | `.zdp-toast` `.zdp-status-toast` |
| 로딩 / 진행 | `.zdp-progress` `.zdp-spinner` `.zdp-skeleton` |
| 광고 / 후원 자리 | `.zdp-ad-slot` `.zdp-ad-slot--inline|banner|rail|between-sections` |
| 아이콘 | `.zdp-icon` `.zdp-icon--sm|md` |
| 표 | `.zdp-table-wrap` `.zdp-table` `.zdp-sort-header` `.zdp-table-toolbar` |
| 페이지네이션 | `.zdp-pagination` |
| 용어/값 목록, 빈 상태 | `.zdp-key-value` `.zdp-empty-state` |
| 용어 설명 | `.zdp-term-trigger` `.zdp-term-sheet` |
| 공유 도크 | `.zdp-share-dock` `.zdp-share-action` `.zdp-share-icon` |
| 코드 | `.zdp-inline-code` `.zdp-code-block` |

Svelte island 없이 공유 아이콘 shape만 필요한 Astro 표면은 `zdp-design-system/share`에서 `zdpShareIcons`와 `ZdpShareIconName`을 가져온다. 플랫폼 브랜드 아이콘은 Simple Icons path를 유지하고 임의 outline glyph로 대체하지 않는다.

소비처별 적용 순서와 금지 경계는 `docs/CONSUMER_CONTRACT.md`를 따른다. 내부 `src/` 경로 직접 import 금지.

## Storybook

디자인 피드백은 Storybook을 기준 표면으로 본다.

```bash
bun install
bun run dev
```

Storybook은 Svelte/Vite 기반이다.

- `Design System/Overview` — light/dark 테마, 색상, 타이포그래피, 버튼, 아이콘 버튼, form, surface 상태
- `Design System/Components/*` — 컴포넌트별 상태 확인 (Button, Data Display, Form Controls, Navigation, Feedback, Interaction)
- `Design System/QA/Theme Locale Stress` — 긴 다국어 문장, 좁은 모바일 폭, focus-visible 상태를 한 번에 확인하는 QA 표면

`bun run storybook`과 `bun run storybook:build`는 `bun run dev` / `bun run build`의 별칭이다.
정적 HTML이 필요하면 `preview/index.html`을 브라우저에서 바로 열면 된다.

## 정적 미리보기

가벼운 확인은 로컬 정적 페이지에서 볼 수 있다.

```text
preview/index.html
```

이 페이지는 `src/styles/index.css`를 직접 불러와 light/dark 테마, 색상, 타이포그래피, 버튼, 아이콘 버튼, form, surface 상태를 보여준다. 별도 개발 서버 없이 브라우저에서 열 수 있다.

## 토큰 원칙

- 토큰 이름은 제품명이나 캠페인명이 아니라 역할을 기준으로 둔다.
- 색상, 간격, radius, typography, responsive, control, focus, selection, i18n, shadow, motion은 `tokens/zdp.tokens.json`이 원천이다.
- 색상 토큰은 `hex` fallback과 `oklch` 의도값을 함께 가진다.
- `src/styles/tokens.css`는 웹과 Tauri WebView가 쓰는 CSS 변수 표면이다.
- CSS는 hex를 먼저 선언하고 OKLCH 지원 브라우저에서만 `@supports`로 덮어쓴다.
- `styles.css`는 Pretendard Variable dynamic subset을 로드하고, sans/display stack은 `"Pretendard Variable", Pretendard`를 최우선으로 둔다.
- `brand-fonts.css`는 선택형 public export이며 `font.family.brand`와 `.zdp-brand-wordmark`가 쓰는 Playwrite AU VIC Guides를 로드한다. 일반 문서 제목, 제품 UI heading, 표, 본문에는 `brand` stack을 쓰지 않는다.
- `expressive-fonts.css`는 선택형 public export이며 `font.family.expressionScript`, `font.family.expressionInscription`, `font.family.expressionSketch`, `font.family.expressionEditorial`, `font.family.expressionSans`, `font.family.expressionKeyboard`가 쓰는 표현용 Google Fonts를 로드한다. 기본 앱 UI, 표, 긴 본문, 일반 Tooltip에는 자동 적용하지 않는다.
- `locale-fonts.css`는 선택형 public export이며 Manrope, Noto Sans SC, Noto Sans Devanagari, Noto Sans JP, Noto Sans Thai 웹폰트를 로드한다. 모든 소비 앱이 반드시 가져갈 필요는 없다.
- `:lang(en|es|fr|vi|ru|id|ms)`는 Manrope/Inter 라틴 스택, `:lang(ko)`는 Pretendard 한국어 스택, `:lang(zh)`는 Noto Sans SC/시스템 중국어 스택, `:lang(hi)`는 Noto Sans Devanagari/시스템 데바나가리 스택, `:lang(ja)`는 Noto Sans JP/시스템 일본어 스택, `:lang(th)`는 Noto Sans Thai/시스템 태국어 스택으로 덮어쓴다.
- Flutter, native shell, 문서 생성기는 JSON 토큰의 hex 값을 기본 입력으로 쓰고 필요할 때 OKLCH를 별도 변환한다.

## Flat UI 계약

그림자, 그라데이션, 반짝임, 이동형 hover 장식을 쓰지 않는다. 깊이는 `surface` 색상 단계, 1px framed border, 타이포그래피, 여백으로 만든다.

**Shadow / Gradient**
- `shadow.focus`, `shadow.sm`, `shadow.md`는 `none`이다.
- core 토큰에 `gradient` 그룹을 만들지 않는다.

**Hover / Active**
- 버튼 hover/active는 배경색, 테두리색, 글자색만 바꾼다. 위치 이동·빛 반사 없음.
- Secondary Button과 ghost IconButton의 resting border는 `line-subtle`, hover/active는 `line-strong`.
- Focus는 `focus.surface` outline + `focus.line` border로 표시한다.

**Radius**
- controls (Button, Input 등): `0.375rem`
- 카드, 패널 등 큰 surface: `0.5rem` 상한. pill 형태 기본 금지.

**User select**
- 버튼, 아이콘, 페이지네이션 컨트롤, separator처럼 조작·장식 목적인 표면만 선택 막기.
- 카드 텍스트, 표 셀, 코드, toast 문장, 문서 본문, ID, 이메일, 날짜, 가격은 선택 가능 유지.
- 앱 root나 큰 컨테이너에 `user-select: none` 걸지 않는다. 보안 이유로 선택만 막는 것도 금지.
- drag surface는 drag start~end까지만 `.zdp-user-select-dragging`을 붙인다.

**색상**
- `success`, `warning`, `danger`는 상태 의미 기준. 모두 parchment/brass/umber 계열에서 채도를 낮춰 튀지 않게 유지.
- `focus.surface/text/line`은 접근성 기능색. 브랜드 장식색·hover 색으로 재사용 금지.
- `selection.surface/text`는 드래그 선택 전용. focus, hover, selected control과 이름 섞지 않기.

**폰트**
- 브랜드 워드마크(`font.family.brand`)는 로고·헤더 워드마크에만. 제품 UI heading·CTA에 쓰지 않는다.
- Expressive 폰트는 짧은 캠페인 문구나 장식 표면에만. 긴 본문, 표, form label에 쓰지 않는다.
- Button 라벨은 `medium` weight.

**Line height**
- 본문 기본 `1.6`. compact control과 섞지 않는다.

컴포넌트별 세부 경계 규칙은 `CONTRIBUTING.md`를 따른다.

## 검증

```bash
bun run tokens:check
```

`tokens:check`는 토큰 JSON, CSS 변수, public component export가 함께 맞는지 확인한다.
`tokens:generate`는 `tokens/zdp.tokens.json`에서 `zdpTokenNames`를 다시 만든다.
`share-icons:generate`는 `src/lib/share.ts`에서 소비자용 `share.js`와 `share.d.ts`를 다시 만든다.
색상 토큰은 JSON의 `hex`와 `oklch` 값이 CSS fallback 및 OKLCH override에 모두 존재해야 통과한다.
`preview:check`는 정적 미리보기 페이지가 공통 스타일 entry와 핵심 토큰/컴포넌트 표면을 참조하는지 확인한다.
`storybook:check`는 Storybook 설정, scripts, devDependencies, overview story가 함께 유지되는지 확인한다.
`a11y:check`는 Storybook Accessibility addon이 `error` 게이트로 유지되는지 확인한다.
`package:build`는 `dist/` package surface를 생성한다.
`package:check`는 package export, files, sideEffects, Svelte 컴포넌트 compile 결과가 함께 맞는지 확인한다.
`publish:check`는 npm publish 전 package metadata, export target, files whitelist, generated dist entry, public docs, license, third-party notice가 함께 맞는지 확인한다.
`release:check`는 `v<package version>` 태그가 전체 package 검증, GitHub Actions OIDC 기반 npm trusted publishing과 provenance, exact-version registry 확인, 같은 태그의 GitHub Release 생성으로 이어지는 workflow 계약을 확인한다. 첫 release 전에 npm package 설정의 Trusted Publisher를 `0disoft/zdp-design-system`과 `publish-npm.yml`에 연결해야 하며 장기 publish token은 사용하지 않는다.
Main package CI와 release workflow의 외부 Action은 reviewed full commit SHA만 실행한다. Main CI token은 `contents: read`로 제한하고 checkout credential persistence를 끈다.
`fixtures:check`는 소비자 Svelte/Vite fixture가 public package export만으로 build되는지 확인하고, fixture source가 raw color, px, z-index number, raw `100vh`/`100vw` 대신 shared token을 쓰는지 검사한다.
`preview:check`와 `storybook:check`는 shared CSS, Svelte 컴포넌트, Storybook, 정적 preview에 장식성 그림자, 그라데이션, 반짝임 pseudo-element, hover 이동 효과, 과한 pill radius가 다시 들어오지 않는지도 확인한다.

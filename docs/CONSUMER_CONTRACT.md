# Consumer Contract

이 문서는 `zdp-design-system`을 다른 ZDP 저장소에서 소비할 때의 기준이다.
목표는 public web, app shell, product lab, game surface가 같은 토큰과 같은 접근성 기본값을 공유하게 만드는 것이다.

## 공통 원칙

- 소비 저장소는 제품 문구, 라우팅, SEO, 데이터 로딩, 인증, 결제, 권한 판단을 직접 소유한다.
- 디자인 시스템은 색상, 타입, 간격, radius, focus, i18n, control metric, shared component API만 제공한다.
- 소비 저장소는 `zdp-design-system`의 public export만 사용하고 내부 `src/` deep import를 만들지 않는다.
- 새 버전은 소비 저장소가 opt-in으로 채택한다. broad adoption 전에는 대표 소비처에서 시각과 build를 확인한다.
- keyboard focus, flat UI, framed control, Pretendard-first font stack은 소비처에서 임의로 낮추지 않는다.

## Astro 소비 표면

Astro 정적 사이트는 전역 스타일로 기본 CSS를 먼저 불러온다.

```ts
import 'zdp-design-system/styles.css';
```

다국어 페이지가 라틴, 중국어, 데바나가리, 일본어 웹폰트를 명시적으로 써야 하면 선택형 locale font entry를 추가한다.

```ts
import 'zdp-design-system/styles.css';
import 'zdp-design-system/locale-fonts.css';
```

페이지 루트 또는 주요 section에는 `.zdp-surface-reset`을 붙여 font, link, input, focus 기본값을 받는다.
Svelte island 없이 정적 HTML만 쓰는 곳은 스크린리더 전용 보조 텍스트에 `.zdp-visually-hidden` utility를 사용한다.
페이지 root는 `.zdp-page`, 본문 폭은 `.zdp-container`와 `.zdp-container--lg`, 섹션 간격은 `.zdp-section`과 `.zdp-section--spacing-*`, 상단 제목과 액션 흐름은 `.zdp-page-header` utility로 맞춘다.
가까운 요소의 세로 흐름은 `.zdp-stack`과 `.zdp-stack--gap-*` utility로 맞춘다.
가까운 버튼, 배지, 작은 링크 묶음의 가로 흐름은 `.zdp-inline`과 `.zdp-inline--gap-*` utility로 맞춘다.
가까운 내용 사이의 얇은 구분선은 `.zdp-divider`와 `.zdp-divider--horizontal` utility로 맞추되, section spacing은 소비처가 소유한다.
반복 카드나 요약 묶음은 `.zdp-grid`, 가까운 화면 도구와 액션 묶음은 `.zdp-toolbar` utility로 맞춘다.
CommandField는 검색, 빠른 이동, 명령 팔레트 진입처럼 짧은 keyboard affordance가 필요한 입력에 `.zdp-command-field`, `.zdp-command-field__input`, `.zdp-kbd`, `.zdp-shortcut-hint` utility로 맞춘다.
작은 glyph는 `.zdp-icon`과 `.zdp-icon--sm|md` utility로 중앙정렬하되 의미와 라벨 문구는 소비처가 소유한다.
공유 도크는 `.zdp-share-dock`, `.zdp-share-dock--side|rail|bottom|inline`, `.zdp-share-action`, `.zdp-share-icon`, `.zdp-share-action__tooltip` utility로 배치하되 URL 생성, clipboard, navigator.share, 플랫폼별 공유 링크는 소비처가 소유한다.
Svelte island 없이 Astro에서 공유 아이콘 shape만 필요하면 `zdp-design-system/share`에서 `zdpShareIcons`와 `ZdpShareIconName`을 가져온다.
플랫폼 브랜드 공유 아이콘은 Simple Icons path 기준을 유지하고 임의 outline glyph로 대체하지 않는다.
Astro 페이지는 Svelte island가 필요한 부분에서만 Svelte 컴포넌트를 가져온다.

## Svelte와 Tauri 소비 표면

Svelte, SvelteKit, Tauri Svelte WebView는 package root에서 shared component를 가져온다.

```svelte
<script lang="ts">
  import {
    Breadcrumb,
    Button,
    ConfirmAction,
    Container,
    Divider,
    Dialog,
    EmptyState,
    Field,
    Grid,
    HelpText,
    Icon,
    Input,
    Inline,
    Kbd,
    KeyValue,
    Label,
    Link,
    Page,
    PageHeader,
    Section,
    ShareDock,
    ShortcutHint,
    SkipLink,
    Stack,
    Surface,
    Tabs,
    Table,
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
    <Table caption="보안 점검 목록" density="compact">
      <thead>
        <tr>
          <th scope="col">항목</th>
          <th scope="col">상태</th>
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
Button과 IconButton은 native button 위의 framed control 표면이며 `onclick`, `ariaControls`, `ariaExpanded`, `ariaPressed`, `ariaDescribedBy`, `ariaKeyShortcuts` 같은 액션 연결 props를 전달한다. 저장, 삭제, 권한, 결제 판단은 소비 앱이 계속 소유한다.
ConfirmAction은 중요한 액션을 밀기 또는 길게 누르기로 확인하는 표면이며 `onconfirm` 콜백만 전달한다. 결제, 삭제, 권한, 환불 판단과 서버 요청은 소비 앱이 계속 소유한다.
Icon은 장식용 glyph 또는 짧은 보조 기호의 박스, 크기, 중앙정렬만 제공하며 의미, 라벨 문구, 상태 판단은 소비 앱이 계속 소유한다.
Link는 일반 텍스트 이동, hover 색상 변화, keyboard focus highlight만 제공하며 라우팅, SEO, 인증, 결제, 권한 판단은 소비 앱이 계속 소유한다. 실제 단축키가 구현된 링크만 `ariaKeyShortcuts`를 전달한다.
SkipLink는 반복 탐색을 건너뛰는 keyboard-first link 구조와 focus-visible 표시만 제공하며 target id, 페이지 레이아웃, 라우팅 판단은 소비 앱이 계속 소유한다.
VisuallyHidden은 screen-reader-only 보조 텍스트 숨김만 제공하며 라벨 문구, 번역, 권한, 데이터 판단은 소비 앱이 계속 소유한다.
ShareDock은 공유 도크의 위치, 아이콘, tooltip, focus-visible 표면만 제공하며 URL 생성, clipboard, navigator.share, 플랫폼별 공유 링크, 권한 판단은 소비 앱이 계속 소유한다. 문서 본문 옆에 붙는 sticky 공유 레일은 `rail` placement를 사용한다.
`zdpShareIcons`는 공유 아이콘 shape 데이터만 제공하며 플랫폼별 공유 URL, target, rel, 클릭 가능 여부는 소비 앱이 계속 소유한다. Telegram, LINE, WhatsApp, X, Reddit 같은 플랫폼 브랜드 glyph는 Simple Icons path 기준을 유지한다.
Page는 shared page root, surface reset, theme tone만 제공하며 라우팅, SEO, 데이터, 권한, 제품별 visibility 판단은 소비 앱이 계속 소유한다.
Container는 페이지 폭, inline padding, centered width만 제공하며 그리드 의미, 라우팅, 데이터, 권한, 제품별 visibility 판단은 소비 앱이 계속 소유한다.
Section은 block rhythm과 optional full-width band만 제공하며 카드, 라우팅, 데이터, 권한, 제품별 visibility 판단은 소비 앱이 계속 소유한다.
PageHeader는 제목, 요약, 액션 배치만 제공하며 문구, SEO heading hierarchy, 라우팅, 데이터, 권한 판단은 소비 앱이 계속 소유한다. 일반 문서와 앱 페이지 제목은 `type.pageTitleSize`와 `type.pageTitleCompactSize` 범위에서 시작하고, 브랜드 히어로나 캠페인 표면만 소비 앱의 별도 대형 제목 예외를 둘 수 있다.
Stack은 가까운 요소의 세로 흐름, gap, align만 제공하며 페이지 그리드, 라우팅, 데이터, 권한, 제품별 visibility 판단은 소비 앱이 계속 소유한다.
Inline은 가까운 버튼, 배지, 작은 링크 묶음의 가로 흐름, gap, align, justify만 제공하며 페이지 그리드, 라우팅, 데이터, 권한, 제품별 visibility 판단은 소비 앱이 계속 소유한다.
Divider는 가까운 내용 사이의 구분선, line tone, semantic separator 역할만 제공하며 section layout, page rhythm, 라우팅, 데이터, 권한, 제품별 visibility 판단은 소비 앱이 계속 소유한다.
Grid는 반복되는 카드, 요약, 선택지 묶음의 responsive columns와 gap만 제공하며 각 항목의 의미, 데이터 로딩, 권한 판단은 소비 앱이 계속 소유한다.
Toolbar는 가까운 화면 도구와 액션 묶음의 wrapping, main/action 배치만 제공하며 저장, 삭제, 필터, 권한 판단은 소비 앱이 계속 소유한다.
CommandField는 검색 입력의 frame, focus-within, shortcut keycap만 제공하며 검색 인덱스, 결과 정렬, 라우팅, 권한 판단은 소비 앱이 계속 소유한다.

Kbd와 ShortcutHint는 `/`, `Shift ?`, `T`, `Enter`, `Esc` 같은 키캡 힌트만 제공한다. 실제 keydown dispatcher, command palette, 검색 focus 이동, 단축키 안내, 선택, 닫기, 파일 이동은 소비 앱이 소유한다. `ariaKeyShortcuts`와 `aria-keyshortcuts`는 실제 단축키가 동작하는 Button, IconButton, Link에만 붙인다. 입력창 focus 중 `/`를 가로채지 않는 예외 처리와 브라우저/페이지 단축키 충돌 판단도 소비 앱에 남긴다. `Ctrl+K`, `Ctrl+S`처럼 Chrome과 브라우저가 기본 동작으로 가져가는 조합은 소비 앱에서 실제로 가로채고 검증한 경우가 아니면 예시나 UI 힌트로 보여주지 않는다.
Table은 표 형식 정보의 native table, caption, row/column header, horizontal overflow wrapper만 제공하며 정렬, 필터, 페이지네이션, 데이터 로딩, 권한 판단은 소비 앱이 계속 소유한다.
KeyValue는 용어와 값의 description list 구조와 responsive columns만 제공하며 실제 원장, 보안, 결제, 권한 판단은 소비 앱이 계속 소유한다.
EmptyState는 비어 있는 상태의 surface, 제목 연결, 액션 배치만 제공하며 비어 있는 조건, 다음 액션 가능 여부, 데이터 재시도 판단은 소비 앱이 계속 소유한다.
Input, Textarea, Select는 `describedBy`에 하나 이상의 id를 연결할 수 있고 invalid 상태에서는 `errorMessageId`로 `aria-errormessage`를 연결한다. 에러 메시지 문구, 검증 조건, 제출 차단 여부는 소비 앱이 결정한다.
Input과 Textarea의 `readonly` 상태는 제출과 포커스를 유지하는 읽기 전용 값에 사용한다. 권한 때문에 값을 바꾸면 안 되는지, 단순히 고정 식별자를 보여주는지는 소비 앱이 결정한다.
Tabs는 가까운 정보 묶음 전환을 표현하되 라우팅, 권한, 데이터 로딩 판단은 소비 앱이 계속 소유한다. 같은 페이지에 여러 Tabs가 있으면 `idPrefix`를 넘겨 tab/panel id가 충돌하지 않게 한다.
Dialog는 modal layer, backdrop, close, focus trap, aria 구조만 제공하며 저장, 삭제, 인증, 결제, 권한 판단은 소비 앱이 계속 소유한다.

## Flutter와 Native 소비 표면

Flutter와 native shell은 Svelte 컴포넌트를 직접 소비하지 않는다.
대신 `tokens/zdp.tokens.json`을 theme adapter 입력으로 사용한다.

- `hex`는 기본 theme fallback이다.
- `oklch`는 웹 또는 변환 가능한 렌더러에서 색 의도값으로 사용한다.
- `font.family.korean`, `font.family.latin`, `font.family.chinese`, `font.family.devanagari`, `font.family.japanese`, `font.family.multiscript`는 locale별 fallback 순서의 source of truth다.
- `control.heightMd`, `control.glyphMd`, `control.choiceSize`, `control.choiceIndicatorSize`, `control.switchWidth`, `control.switchHeight`, `control.scrollbarSize`, `control.radius`, `control.borderWidth`, `control.hitTarget`은 native control size, icon glyph size, choice mark, switch track, scrollbar 두께를 맞출 때의 기준이다.
- `color.scrollbar.track`, `color.scrollbar.thumb`, `color.scrollbar.thumbHover`는 overflow 영역의 light/dark scrollbar 색 기준이다.
- `focus.surface`, `focus.text`, `focus.line`은 keyboard focus 또는 TV/desktop focus affordance의 기준색이다.

## 소비처 적용 체크리스트

- `styles.css`를 먼저 import한다.
- 다국어 웹폰트가 필요한 경우에만 `locale-fonts.css`를 추가한다.
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
- CommandField를 쓰는 화면은 Tab과 `/` 같은 shortcut으로 focus가 이동하고, 실제 검색/라우팅 판단은 소비 앱에 남는지 확인한다.
- Kbd와 ShortcutHint를 쓰는 화면은 보이는 단축키가 실제로 동작하는지 확인한다. 동작하지 않는 힌트는 제거하고, 실제 단축키가 있는 control에만 `ariaKeyShortcuts`를 붙인다.
- Table을 쓰는 화면은 caption 또는 labelledBy가 있고, `th scope="col"`과 `th scope="row"`가 필요한 곳에 남는지 확인한다.
- KeyValue를 쓰는 화면은 용어와 값이 `dt`와 `dd`로 남고, 값의 생성/권한/결제 판단이 컴포넌트로 들어오지 않는지 확인한다.
- EmptyState를 쓰는 화면은 제목 id가 연결되고 다음 액션 가능 여부를 소비 앱이 결정하는지 확인한다.
- Input, Textarea, Select의 invalid 상태는 help id와 error id를 모두 `aria-describedby`로 연결하고, error id를 `aria-errormessage`로도 연결하는지 확인한다.
- Input과 Textarea의 readonly 상태는 disabled처럼 흐려져 제출/복사/포커스 흐름을 끊지 않는지 확인한다.
- Breadcrumb를 쓰는 화면은 현재 페이지 항목에 `aria-current="page"`가 남는지 확인한다.
- Flutter/native adapter는 `tokens/zdp.tokens.json`의 token name을 유지한다.
- 소비처 자체 CSS에서 `box-shadow`, gradient, hover transform으로 shared component 기본값을 덮어쓰지 않는다.
- Overflow가 생기는 표, 패널, 페이지는 `.zdp-surface-reset` 범위 안에서 theme scrollbar가 보이는지 확인한다.
- light/dark, keyboard focus, disabled, invalid 상태를 소비처 화면에서 확인한다.
- Dialog를 쓰는 화면은 Tab 순환, Escape 닫기, backdrop 닫기, 이전 focus 복귀를 확인한다.
- 새 디자인 시스템 버전은 대표 소비처 한 곳에서 build와 시각 QA를 통과한 뒤 확산한다.

## 금지 경계

- 디자인 시스템에 제품별 화면, 랜딩 문구, admin 정책, 결제 판단, 권한 판단, 개인정보 처리 로직을 넣지 않는다.
- 소비 저장소가 `zdp-design-system/src/...` 같은 내부 경로를 직접 import하지 않는다.
- token name을 제품별 별칭으로 복사해 fork하지 않는다.
- focus 색을 브랜드 장식색, hover 색, semantic danger/success 색으로 재사용하지 않는다.

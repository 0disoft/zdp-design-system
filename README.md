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

기본 톤은 밝은 중세 유럽 마을 광장과 수채화 종이 질감이다. 토큰 값은 parchment, dusty blue, sage green, sunlit gold, burgundy, terracotta 계열을 쓰되, 토큰 이름은 `primary`, `surface`, `line`, `danger`처럼 역할 중심으로 유지한다.

## Foundation 계약

디자인 시스템은 각 제품의 번역, 라우팅, SEO, 페이지별 레이아웃을 소유하지 않는다. 대신 소비 표면이 깨지지 않도록 다음 공통 계약을 제공한다.

- `type`: body, body small, title, label, caption, control, data에 쓰는 기본 크기와 줄높이
- `breakpoint`: mobile, tablet, desktop, wide 기준 폭
- `control`: 버튼, 아이콘 버튼, 입력류가 공유할 높이, radius, border width, hit target, 선택 컨트롤 전용 mark, indicator, switch, scrollbar 크기
- `focus`: 키보드 사용자가 현재 위치를 놓치지 않도록 하는 sunlit focus highlight, dark text, dark line
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
- `docs/CONSUMER_CONTRACT.md`

## 패키지 표면

웹 소비 저장소는 공통 CSS 토큰을 먼저 불러온다.

```ts
import 'zdp-design-system/styles.css';
```

6개국어 웹 표면에서 라틴/중국어/힌디어 웹폰트까지 명시 로드해야 하면 선택형 폰트 CSS를 추가로 불러온다. 한국어 Pretendard는 기본 `styles.css`에서 이미 로드한다.

```ts
import 'zdp-design-system/styles.css';
import 'zdp-design-system/locale-fonts.css';
```

Svelte 또는 Tauri(Svelte) 표면은 컴포넌트를 직접 가져온다.

```svelte
<script lang="ts">
  import {
    Badge,
    Breadcrumb,
    Button,
    Callout,
    Checkbox,
    ConfirmAction,
    Container,
    Dialog,
    Divider,
    EmptyState,
    Field,
    Grid,
    HelpText,
    Icon,
    Input,
    Inline,
    KeyValue,
    Label,
    Link,
    Page,
    PageHeader,
    SkipLink,
    Stack,
    Section,
    Surface,
    Switch,
    Tabs,
    Table,
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
        { label: '홈', href: '/' },
        { label: '플랫폼', href: '/platform' },
        { label: '디자인 시스템' }
      ]}
    />
    <Badge tone="success">정상</Badge>
    <Link href="/design">자세히 보기</Link>
    <Callout tone="info" semanticRole="note">
      <strong>다음 단계가 준비됐습니다.</strong>
      <p>필요한 입력을 확인한 뒤 저장하면 변경 내역에 남습니다.</p>
    </Callout>
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
    <EmptyState labelledBy="empty-roadmap-title">
      <h2 id="empty-roadmap-title">아직 공개할 변경이 없습니다.</h2>
      <p>검토가 끝난 항목만 공개 로드맵에 올라갑니다.</p>
      <svelte:fragment slot="actions">
        <Button variant="secondary">초안 보기</Button>
      </svelte:fragment>
    </EmptyState>
    <Tabs
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

Astro는 `styles.css`를 전역으로 쓰고, Svelte island가 필요한 부분에서 같은 Svelte 컴포넌트를 소비한다. Flutter는 Svelte 컴포넌트를 직접 쓰지 않고 `tokens/zdp.tokens.json`을 Dart theme adapter의 입력으로 사용한다.
정적 HTML 소비처는 `.zdp-page`, `.zdp-container`, `.zdp-section`, `.zdp-page-header` utility로 기본 페이지 폭, 섹션 리듬, 헤더 액션 배치를 맞출 수 있다. 가까운 요소의 세로 흐름은 `.zdp-stack`과 `.zdp-stack--gap-*` utility로 적용하고, `.zdp-inline`과 `.zdp-inline--gap-*` utility로 가까운 가로 흐름을 맞출 수 있다. 얇은 구분선은 `.zdp-divider`와 `.zdp-divider--horizontal` utility로 받는다. 반복 카드나 요약 묶음은 `.zdp-grid`, 가까운 화면 도구와 액션 묶음은 `.zdp-toolbar` utility로 맞춘다. 작은 glyph는 `.zdp-icon`과 `.zdp-icon--sm|md` utility로 중앙정렬한다. 표 형식 정보는 `.zdp-table-wrap`과 `.zdp-table`, 용어와 값 목록은 `.zdp-key-value`, 빈 목록이나 대기 상태는 `.zdp-empty-state` utility로 받되, 제품별 라우팅, SEO, visibility, 데이터 판단은 소비처가 정한다.

소비 저장소별 적용 순서와 금지 경계는 `docs/CONSUMER_CONTRACT.md`를 기준으로 맞춘다. Astro, Svelte, Tauri, Flutter 소비처는 public export와 token name을 유지하고 내부 `src/` deep import를 만들지 않는다.

## Storybook

디자인 피드백은 Storybook을 기준 표면으로 본다.

```bash
bun install
bun run dev
```

Storybook은 Svelte/Vite 기반이며 `Design System/Overview` story에서 light/dark 테마, 색상, 타이포그래피, 버튼, 아이콘 버튼, form, surface 상태를 함께 확인한다. 개별 피드백은 `Design System/Components/Button`, `Design System/Components/Data Display`, `Design System/Components/Form Controls`, `Design System/Components/Navigation`, `Design System/Components/Feedback`, `Design System/Components/Interaction` story에서 상태별로 좁혀 확인한다.
Workduck의 개발 서버 터미널은 `bun run dev`를, 빌드 터미널은 `bun run build`를 표준 진입점으로 사용한다. `bun run storybook`과 `bun run storybook:build`는 같은 명령을 가리키는 별칭이다.
정적 HTML이 필요할 때는 fallback으로 `preview/index.html`을 그대로 열 수 있다.

## 정적 미리보기

가벼운 확인은 로컬 정적 페이지에서 볼 수 있다.

```text
preview/index.html
```

이 페이지는 `src/styles/index.css`를 직접 불러와 light/dark 테마, 색상, 타이포그래피, 버튼, 아이콘 버튼, form, surface 상태를 보여준다. 별도 개발 서버 없이 브라우저에서 열 수 있다.

## 토큰 원칙

- 토큰 이름은 제품명이나 캠페인명이 아니라 역할을 기준으로 둔다.
- 색상, 간격, radius, typography, responsive, control, focus, i18n, shadow, motion은 `tokens/zdp.tokens.json`이 원천이다.
- 색상 토큰은 `hex` fallback과 `oklch` 의도값을 함께 가진다.
- `src/styles/tokens.css`는 웹과 Tauri WebView가 쓰는 CSS 변수 표면이다.
- CSS는 hex를 먼저 선언하고 OKLCH 지원 브라우저에서만 `@supports`로 덮어쓴다.
- `styles.css`는 Pretendard Variable dynamic subset을 로드하고, sans/display stack은 `"Pretendard Variable", Pretendard`를 최우선으로 둔다.
- `locale-fonts.css`는 선택형 public export이며 Manrope, Noto Sans SC, Noto Sans Devanagari 웹폰트를 로드한다. 모든 소비 앱이 반드시 가져갈 필요는 없다.
- `:lang(en|es|fr)`는 Manrope/Inter 라틴 스택, `:lang(ko)`는 Pretendard 한국어 스택, `:lang(zh)`는 Noto Sans SC/시스템 중국어 스택, `:lang(hi)`는 Noto Sans Devanagari/시스템 데바나가리 스택으로 덮어쓴다.
- Flutter, native shell, 문서 생성기는 JSON 토큰의 hex 값을 기본 입력으로 쓰고 필요할 때 OKLCH를 별도 변환한다.

## Flat UI 계약

기본 컴포넌트는 그림자, 그라데이션, 반짝임, 이동형 hover 장식을 쓰지 않는다. 깊이는 `surface` 색상 단계, 1px framed border, 명확한 타이포그래피, 충분한 여백으로 표현한다.

- `shadow.focus`, `shadow.sm`, `shadow.md`는 의도적으로 `none`이다.
- core 토큰에는 `gradient` 그룹을 만들지 않는다.
- 버튼 hover는 위치 이동이나 빛 반사가 아니라 배경색, 테두리색, 글자색의 짧은 상태 변화만 쓴다.
- Button과 IconButton hover는 light/dark 모두 배경색과 border 색이 함께 변한다.
- 버튼 active도 위치 이동이나 그림자 없이 배경색, 테두리색, 글자색만 바꾼다.
- focus는 그림자가 아니라 `focus.surface` outline, `focus.line` border, 링크의 하단선으로 표시한다.
- Button, IconButton, ConfirmAction, Badge, Callout, Link, SkipLink, Breadcrumb, Tabs, Grid, Toolbar, Table, KeyValue, EmptyState, Field, Label, Input, Textarea, Select, Checkbox, Radio, Switch, HelpText, ErrorText, Surface, Page, Container, Section, PageHeader, preview panel은 `0.375rem` radius를 기준으로 보고 pill 형태를 쓰지 않는다.
- Button과 IconButton은 `1px` border width를 기준으로 하는 thin framed control 방향을 유지한다.
- Icon은 장식용 glyph 또는 짧은 보조 기호의 박스, 크기, 중앙정렬만 제공하며 의미, 라벨 문구, 상태 판단은 소비 앱에 남긴다.
- Button과 IconButton은 `onclick`, `ariaControls`, `ariaExpanded`, `ariaPressed`, `ariaDescribedBy` 같은 실제 앱 액션 연결 props를 native button에 전달한다.
- ConfirmAction은 중요한 액션을 밀기 또는 길게 누르기로 확인하는 표면만 제공하고 결제, 삭제, 권한, 환불 판단은 소비 앱에 남긴다.
- Input, Textarea, Select는 Button과 같은 framed control 방향을 쓰고, help/error text는 id와 `aria-describedby`로 연결한다. 도움말과 에러가 함께 있을 때는 `describedBy`에 id 배열을 넘기고, invalid 상태에서는 `errorMessageId`로 `aria-errormessage`를 연결한다.
- Input과 Textarea의 `readonly` 상태는 제출과 포커스를 유지하는 읽기 전용 값에 사용하고, `disabled` 상태와 혼동하지 않는다.
- Checkbox, Radio, Switch는 native input을 유지하고 `checked`, `focus-visible`, `disabled`, `invalid` 상태를 토큰으로 표현한다. 선택 mark와 switch track은 버튼 hit area가 아니라 `choice`/`switch` 전용 control token을 쓴다.
- Checkbox, Radio, Switch hover는 checked 상태를 덮지 않는다. 이미 선택된 컨트롤은 hover 중에도 선택된 색과 mark 위치를 유지한다.
- Scrollbar는 얇은 track과 thumb을 `color.scrollbar.*`, `control.scrollbarSize`로 고정해 브라우저 기본 회색 UI가 shared surface 안에 노출되지 않게 한다.
- Badge와 Callout은 짧은 상태와 페이지 안 피드백을 표현하되 제품 판단 로직을 갖지 않는다.
- Link는 일반 텍스트 이동을 표현하되 라우팅, SEO, 권한, 데이터 로딩 결정을 갖지 않는다.
- SkipLink는 키보드 사용자가 반복되는 상단 탐색을 건너뛰도록 돕되 페이지 레이아웃, 라우팅, 본문 id 소유는 소비 앱에 남긴다.
- VisuallyHidden은 스크린리더 전용 보조 텍스트 숨김만 제공하며 라벨 문구, 번역, 권한, 데이터 판단은 소비 앱에 남긴다.
- Page, Container, Section, PageHeader는 페이지 폭, 섹션 리듬, 헤더 액션 배치만 제공하며 라우팅, SEO, visibility, 데이터, 권한 판단은 소비 앱에 남긴다.
- Grid는 반복되는 카드, 요약, 선택지 묶음의 responsive columns와 gap만 제공하며 각 항목의 의미, 데이터 로딩, 권한 판단은 소비 앱에 남긴다.
- Toolbar는 가까운 화면 도구와 액션 묶음의 wrapping, main/action 배치만 제공하며 저장, 삭제, 필터, 권한 판단은 소비 앱에 남긴다.
- Table은 표 형식 정보의 semantic table, caption, row/column header, overflow wrapper만 제공하며 정렬, 필터, 페이지네이션, 데이터 로딩 판단은 소비 앱에 남긴다.
- KeyValue는 용어와 값의 description list 구조만 제공하며 원장, 보안, 결제, 권한의 실제 판단은 소비 앱에 남긴다.
- EmptyState는 비어 있는 상태의 surface, 제목 연결, 액션 배치만 제공하며 어떤 상태가 비었는지와 다음 액션의 가능 여부는 소비 앱에 남긴다.
- Breadcrumb는 현재 위치를 `nav`, `ol`, `aria-current="page"`로 표현하되 라우팅, SEO, 권한, 데이터 로딩 결정을 갖지 않는다.
- Tabs는 가까운 정보 묶음 전환을 표현하되 라우팅, 권한, 데이터 로딩 결정을 갖지 않는다.
- Dialog는 모달 레이어, backdrop, 닫기, focus trap, `role="dialog"`와 `aria-modal` 구조만 제공하고 저장/삭제/권한/결제 판단은 소비 앱에 남긴다.
- 본문 텍스트의 기본 line-height는 `1.6`으로 두어 장식 대신 읽기 리듬으로 밀도를 만든다.
- `success`, `warning`, `danger`는 감성 팔레트 이름이 아니라 상태 의미를 가진 semantic color로 쓴다. 긍정/완료는 `success`, 주의/보류는 `warning`, 삭제/오류/위험은 `danger`에 묶는다.
- `focus.surface`, `focus.text`, `focus.line`은 브랜드 장식색이 아니라 접근성 기능색이다. 링크 focus는 sunlit gold 배경과 어두운 하단선, 입력류와 framed controls focus는 sunlit gold outline과 어두운 border를 쓴다.
- `bodySmall`, `caption`, `data` 타입 토큰은 대시보드, 상세 화면, 수치 표시에 필요한 작은 텍스트를 제품마다 임의 크기로 쪼개지 않게 막는다.
- Button 라벨은 bold가 아니라 `medium` weight를 사용한다.
- spacing은 `space` 토큰을 사용하고, 일반 레이아웃 구분은 선이나 장식보다 `0.5rem`, `1rem`, `1.5rem`, `2rem`, `3rem` 리듬을 우선한다.
- 예외가 필요한 hero/brand art는 제품 저장소에서 별도 검토하며 이 패키지의 Button, IconButton, Surface 기본값으로 들여오지 않는다.

## 검증

```bash
bun run tokens:check
```

`tokens:check`는 토큰 JSON, CSS 변수, public component export가 함께 맞는지 확인한다.
색상 토큰은 JSON의 `hex`와 `oklch` 값이 CSS fallback 및 OKLCH override에 모두 존재해야 통과한다.
`preview:check`는 정적 미리보기 페이지가 공통 스타일 entry와 핵심 토큰/컴포넌트 표면을 참조하는지 확인한다.
`storybook:check`는 Storybook 설정, scripts, devDependencies, overview story가 함께 유지되는지 확인한다.
`package:check`는 package export, files, sideEffects, Svelte 컴포넌트 compile 결과가 함께 맞는지 확인한다.
`preview:check`와 `storybook:check`는 shared CSS, Svelte 컴포넌트, Storybook, 정적 preview에 장식성 그림자, 그라데이션, 반짝임 pseudo-element, hover 이동 효과, 과한 pill radius가 다시 들어오지 않는지도 확인한다.

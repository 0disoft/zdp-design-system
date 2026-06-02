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

다국어 페이지가 라틴, 중국어, 데바나가리 웹폰트를 명시적으로 써야 하면 선택형 locale font entry를 추가한다.

```ts
import 'zdp-design-system/styles.css';
import 'zdp-design-system/locale-fonts.css';
```

페이지 루트 또는 주요 section에는 `.zdp-surface-reset`을 붙여 font, link, input, focus 기본값을 받는다.
Svelte island 없이 정적 HTML만 쓰는 곳은 스크린리더 전용 보조 텍스트에 `.zdp-visually-hidden` utility를 사용한다.
가까운 요소의 세로 흐름은 `.zdp-stack`과 `.zdp-stack--gap-*` utility로 맞춘다.
가까운 버튼, 배지, 작은 링크 묶음의 가로 흐름은 `.zdp-inline`과 `.zdp-inline--gap-*` utility로 맞춘다.
가까운 내용 사이의 얇은 구분선은 `.zdp-divider`와 `.zdp-divider--horizontal` utility로 맞추되, section spacing은 소비처가 소유한다.
Astro 페이지는 Svelte island가 필요한 부분에서만 Svelte 컴포넌트를 가져온다.

## Svelte와 Tauri 소비 표면

Svelte, SvelteKit, Tauri Svelte WebView는 package root에서 shared component를 가져온다.

```svelte
<script lang="ts">
  import {
    Breadcrumb,
    Button,
    Divider,
    Dialog,
    Field,
    HelpText,
    Input,
    Inline,
    Label,
    Link,
    SkipLink,
    Stack,
    Surface,
    Tabs,
    VisuallyHidden
  } from 'zdp-design-system';

  let dialogOpen = false;
</script>

<Surface>
  <SkipLink href="#content">본문으로 건너뛰기</SkipLink>
  <Stack gap="md">
    <Breadcrumb
      ariaLabel="현재 위치"
      items={[
        { label: '홈', href: '/' },
        { label: '플랫폼', href: '/platform' },
        { label: '디자인 시스템' }
      ]}
    />
    <Link href="/design">자세히 보기</Link>
    <Button
      variant="secondary"
      onclick={() => (dialogOpen = true)}
      ariaControls="project-dialog"
      ariaExpanded={dialogOpen}
    >
      <VisuallyHidden>새 항목 </VisuallyHidden>추가
    </Button>
    <Divider />
    <Field>
      <Label forId="project-name">프로젝트</Label>
      <Input id="project-name" name="project-name" describedBy="project-name-help" />
      <HelpText id="project-name-help">공개 표기에 사용됩니다.</HelpText>
    </Field>
    <Field>
      <Label forId="project-id">고정 ID</Label>
      <Input id="project-id" name="project-id" value="ZDP-2401" describedBy="project-id-help" readonly />
      <HelpText id="project-id-help">이미 발급된 값은 그대로 둡니다.</HelpText>
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
</Surface>
```

Tauri shell은 native window, permission, update, file access 결정을 이 패키지에 넘기지 않는다.
이 패키지는 WebView 안의 UI 토큰과 컴포넌트만 담당한다.
Breadcrumb는 page-location trail, link, separator, current-page aria 구조만 제공하며 라우팅, SEO, 인증, 결제, 권한 판단은 소비 앱이 계속 소유한다.
Button과 IconButton은 native button 위의 framed control 표면이며 `onclick`, `ariaControls`, `ariaExpanded`, `ariaPressed`, `ariaDescribedBy` 같은 액션 연결 props를 전달한다. 저장, 삭제, 권한, 결제 판단은 소비 앱이 계속 소유한다.
Link는 일반 텍스트 이동, hover 색상 변화, keyboard focus highlight만 제공하며 라우팅, SEO, 인증, 결제, 권한 판단은 소비 앱이 계속 소유한다.
SkipLink는 반복 탐색을 건너뛰는 keyboard-first link 구조와 focus-visible 표시만 제공하며 target id, 페이지 레이아웃, 라우팅 판단은 소비 앱이 계속 소유한다.
VisuallyHidden은 screen-reader-only 보조 텍스트 숨김만 제공하며 라벨 문구, 번역, 권한, 데이터 판단은 소비 앱이 계속 소유한다.
Stack은 가까운 요소의 세로 흐름, gap, align만 제공하며 페이지 그리드, 라우팅, 데이터, 권한, 제품별 visibility 판단은 소비 앱이 계속 소유한다.
Inline은 가까운 버튼, 배지, 작은 링크 묶음의 가로 흐름, gap, align, justify만 제공하며 페이지 그리드, 라우팅, 데이터, 권한, 제품별 visibility 판단은 소비 앱이 계속 소유한다.
Divider는 가까운 내용 사이의 구분선, line tone, semantic separator 역할만 제공하며 section layout, page rhythm, 라우팅, 데이터, 권한, 제품별 visibility 판단은 소비 앱이 계속 소유한다.
Input과 Textarea의 `readonly` 상태는 제출과 포커스를 유지하는 읽기 전용 값에 사용한다. 권한 때문에 값을 바꾸면 안 되는지, 단순히 고정 식별자를 보여주는지는 소비 앱이 결정한다.
Dialog는 modal layer, backdrop, close, focus trap, aria 구조만 제공하며 저장, 삭제, 인증, 결제, 권한 판단은 소비 앱이 계속 소유한다.

## Flutter와 Native 소비 표면

Flutter와 native shell은 Svelte 컴포넌트를 직접 소비하지 않는다.
대신 `tokens/zdp.tokens.json`을 theme adapter 입력으로 사용한다.

- `hex`는 기본 theme fallback이다.
- `oklch`는 웹 또는 변환 가능한 렌더러에서 색 의도값으로 사용한다.
- `font.family.korean`, `font.family.latin`, `font.family.chinese`, `font.family.devanagari`, `font.family.multiscript`는 locale별 fallback 순서의 source of truth다.
- `control.heightMd`, `control.radius`, `control.borderWidth`, `control.hitTarget`은 native control size를 맞출 때의 기준이다.
- `focus.surface`, `focus.text`, `focus.line`은 keyboard focus 또는 TV/desktop focus affordance의 기준색이다.

## 소비처 적용 체크리스트

- `styles.css`를 먼저 import한다.
- 다국어 웹폰트가 필요한 경우에만 `locale-fonts.css`를 추가한다.
- Svelte component는 package root에서만 import한다.
- Link를 쓰는 화면은 hover가 색상 변화 중심이고 focus가 sunlit gold highlight로 보이는지 확인한다.
- SkipLink를 쓰는 화면은 첫 Tab 대상에서 보이고 본문 target id로 이동하는지 확인한다.
- VisuallyHidden을 쓰는 화면은 화면에는 보이지 않지만 접근성 이름이나 설명에 포함되는지 확인한다.
- Stack을 쓰는 화면은 spacing만 바뀌고 색상, 그림자, hover, 제품별 layout 판단이 생기지 않는지 확인한다.
- Inline을 쓰는 화면은 horizontal wrapping만 바뀌고 색상, 그림자, hover, 제품별 layout 판단이 생기지 않는지 확인한다.
- Divider를 쓰는 화면은 구분선만 바뀌고 section spacing, 그림자, 배경 장식, 제품별 layout 판단이 생기지 않는지 확인한다.
- Input과 Textarea의 readonly 상태는 disabled처럼 흐려져 제출/복사/포커스 흐름을 끊지 않는지 확인한다.
- Breadcrumb를 쓰는 화면은 현재 페이지 항목에 `aria-current="page"`가 남는지 확인한다.
- Flutter/native adapter는 `tokens/zdp.tokens.json`의 token name을 유지한다.
- 소비처 자체 CSS에서 `box-shadow`, gradient, hover transform으로 shared component 기본값을 덮어쓰지 않는다.
- light/dark, keyboard focus, disabled, invalid 상태를 소비처 화면에서 확인한다.
- Dialog를 쓰는 화면은 Tab 순환, Escape 닫기, backdrop 닫기, 이전 focus 복귀를 확인한다.
- 새 디자인 시스템 버전은 대표 소비처 한 곳에서 build와 시각 QA를 통과한 뒤 확산한다.

## 금지 경계

- 디자인 시스템에 제품별 화면, 랜딩 문구, admin 정책, 결제 판단, 권한 판단, 개인정보 처리 로직을 넣지 않는다.
- 소비 저장소가 `zdp-design-system/src/...` 같은 내부 경로를 직접 import하지 않는다.
- token name을 제품별 별칭으로 복사해 fork하지 않는다.
- focus 색을 브랜드 장식색, hover 색, semantic danger/success 색으로 재사용하지 않는다.

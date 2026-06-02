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
Astro 페이지는 Svelte island가 필요한 부분에서만 Svelte 컴포넌트를 가져온다.

## Svelte와 Tauri 소비 표면

Svelte, SvelteKit, Tauri Svelte WebView는 package root에서 shared component를 가져온다.

```svelte
<script lang="ts">
  import { Button, Dialog, Field, Input, Label, Surface, Tabs } from 'zdp-design-system';
</script>

<Surface>
  <Field>
    <Label forId="project-name">프로젝트</Label>
    <Input id="project-name" name="project-name" />
  </Field>
  <Button>저장</Button>
  <Dialog
    open={false}
    labelledBy="project-dialog-title"
    describedBy="project-dialog-desc"
  >
    <h2 slot="title" id="project-dialog-title">변경 내용을 저장할까요?</h2>
    <p id="project-dialog-desc">저장하면 공개 표기에 바로 반영됩니다.</p>
  </Dialog>
</Surface>
```

Tauri shell은 native window, permission, update, file access 결정을 이 패키지에 넘기지 않는다.
이 패키지는 WebView 안의 UI 토큰과 컴포넌트만 담당한다.
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

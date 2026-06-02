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

- `type`: body, title, label, control에 쓰는 기본 크기와 줄높이
- `breakpoint`: mobile, tablet, desktop, wide 기준 폭
- `control`: 버튼, 아이콘 버튼, 입력류가 공유할 높이, radius, hit target
- `i18n`: 긴 텍스트와 CJK/영문 혼합 문장이 UI를 밀어내지 않게 하는 wrapping 기본값

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

## 패키지 표면

웹 소비 저장소는 공통 CSS 토큰을 먼저 불러온다.

```ts
import 'zdp-design-system/styles.css';
```

Svelte 또는 Tauri(Svelte) 표면은 컴포넌트를 직접 가져온다.

```svelte
<script lang="ts">
  import { Button, IconButton, Surface } from 'zdp-design-system';
</script>

<Surface>
  <Button>저장</Button>
  <IconButton ariaLabel="닫기">X</IconButton>
</Surface>
```

Astro는 `styles.css`를 전역으로 쓰고, Svelte island가 필요한 부분에서 같은 Svelte 컴포넌트를 소비한다. Flutter는 Svelte 컴포넌트를 직접 쓰지 않고 `tokens/zdp.tokens.json`을 Dart theme adapter의 입력으로 사용한다.

## Storybook

디자인 피드백은 Storybook을 기준 표면으로 본다.

```bash
bun install
bun run dev
```

Storybook은 Svelte/Vite 기반이며 `Design System/Overview` story에서 light/dark 테마, 색상, 타이포그래피, 버튼, 아이콘 버튼, surface 상태를 함께 확인한다.
Workduck의 개발 서버 터미널은 `bun run dev`를, 빌드 터미널은 `bun run build`를 표준 진입점으로 사용한다. `bun run storybook`과 `bun run storybook:build`는 같은 명령을 가리키는 별칭이다.
정적 HTML이 필요할 때는 fallback으로 `preview/index.html`을 그대로 열 수 있다.

## 정적 미리보기

가벼운 확인은 로컬 정적 페이지에서 볼 수 있다.

```text
preview/index.html
```

이 페이지는 `src/styles/index.css`를 직접 불러와 light/dark 테마, 색상, 타이포그래피, 버튼, 아이콘 버튼, surface 상태를 보여준다. 별도 개발 서버 없이 브라우저에서 열 수 있다.

## 토큰 원칙

- 토큰 이름은 제품명이나 캠페인명이 아니라 역할을 기준으로 둔다.
- 색상, 간격, radius, typography, responsive, control, i18n, shadow, motion은 `tokens/zdp.tokens.json`이 원천이다.
- 색상 토큰은 `hex` fallback과 `oklch` 의도값을 함께 가진다.
- `src/styles/tokens.css`는 웹과 Tauri WebView가 쓰는 CSS 변수 표면이다.
- CSS는 hex를 먼저 선언하고 OKLCH 지원 브라우저에서만 `@supports`로 덮어쓴다.
- Flutter, native shell, 문서 생성기는 JSON 토큰의 hex 값을 기본 입력으로 쓰고 필요할 때 OKLCH를 별도 변환한다.

## 검증

```bash
bun run tokens:check
```

`tokens:check`는 토큰 JSON, CSS 변수, public component export가 함께 맞는지 확인한다. Svelte 컴파일, 접근성 검사, package artifact 검증은 다음 단계에서 추가한다.
색상 토큰은 JSON의 `hex`와 `oklch` 값이 CSS fallback 및 OKLCH override에 모두 존재해야 통과한다.
`preview:check`는 정적 미리보기 페이지가 공통 스타일 entry와 핵심 토큰/컴포넌트 표면을 참조하는지 확인한다.
`storybook:check`는 Storybook 설정, scripts, devDependencies, overview story가 함께 유지되는지 확인한다.

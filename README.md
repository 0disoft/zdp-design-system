# zdp-design-system

ZDP의 디자인 토큰, CSS, 아이콘, Svelte UI 컴포넌트 경계를 고정하는 저장소다.

초기 목적은 `zdp-web-public`, `zdp-web-apps`, 제품 실험, 게임 소개 화면이 각자 다른 시각 언어를 만들지 않게 막는 것이다.

## 현재 범위

- 색상, 간격, 타이포그래피, radius, elevation 같은 디자인 토큰
- 공통 CSS reset과 theme contract
- Svelte UI 컴포넌트 public surface
- 아이콘 사용 기준과 접근성 기본 규칙
- Storybook 또는 동등한 컴포넌트 검토 표면

## 현재 제외

- 제품별 화면 구성
- 랜딩 페이지 문구
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

## 토큰 원칙

- 토큰 이름은 제품명이나 캠페인명이 아니라 역할을 기준으로 둔다.
- 색상, 간격, radius, typography, shadow, motion은 `tokens/zdp.tokens.json`이 원천이다.
- `src/styles/tokens.css`는 웹과 Tauri WebView가 쓰는 CSS 변수 표면이다.
- Flutter, native shell, 문서 생성기는 JSON 토큰을 변환해서 사용한다.

## 검증

```bash
bun run tokens:check
```

`tokens:check`는 토큰 JSON, CSS 변수, public component export가 함께 맞는지 확인한다. Svelte 컴파일, 접근성 검사, package artifact 검증은 다음 단계에서 추가한다.

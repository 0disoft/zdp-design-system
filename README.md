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
- `control`: 버튼, 아이콘 버튼, 입력류가 공유할 높이, radius, border width, hit target
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
    Button,
    Callout,
    Checkbox,
    Dialog,
    Field,
    HelpText,
    Input,
    Label,
    Surface,
    Switch,
    Tabs
  } from 'zdp-design-system';
</script>

<Surface>
  <Badge tone="success">정상</Badge>
  <Callout tone="info" semanticRole="note">
    <strong>다음 단계가 준비됐습니다.</strong>
    <p>필요한 입력을 확인한 뒤 저장하면 변경 내역에 남습니다.</p>
  </Callout>
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
  <Field>
    <Label forId="project-name">프로젝트</Label>
    <Input id="project-name" name="project-name" describedBy="project-name-help" />
    <HelpText id="project-name-help">공개 표기에 사용됩니다.</HelpText>
  </Field>
  <Checkbox name="release-updates" checked>업데이트 받기</Checkbox>
  <Switch name="autosave" checked>자동 저장</Switch>
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

Astro는 `styles.css`를 전역으로 쓰고, Svelte island가 필요한 부분에서 같은 Svelte 컴포넌트를 소비한다. Flutter는 Svelte 컴포넌트를 직접 쓰지 않고 `tokens/zdp.tokens.json`을 Dart theme adapter의 입력으로 사용한다.

소비 저장소별 적용 순서와 금지 경계는 `docs/CONSUMER_CONTRACT.md`를 기준으로 맞춘다. Astro, Svelte, Tauri, Flutter 소비처는 public export와 token name을 유지하고 내부 `src/` deep import를 만들지 않는다.

## Storybook

디자인 피드백은 Storybook을 기준 표면으로 본다.

```bash
bun install
bun run dev
```

Storybook은 Svelte/Vite 기반이며 `Design System/Overview` story에서 light/dark 테마, 색상, 타이포그래피, 버튼, 아이콘 버튼, form, surface 상태를 함께 확인한다.
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

기본 컴포넌트는 그림자, 그라데이션, 반짝임, 이동형 hover 장식을 쓰지 않는다. 깊이는 `surface` 색상 단계, 2px framed border, 명확한 타이포그래피, 충분한 여백으로 표현한다.

- `shadow.focus`, `shadow.sm`, `shadow.md`는 의도적으로 `none`이다.
- core 토큰에는 `gradient` 그룹을 만들지 않는다.
- 버튼 hover는 위치 이동이나 빛 반사가 아니라 배경색, 테두리색, 글자색의 짧은 상태 변화만 쓴다.
- Button과 IconButton hover는 light/dark 모두 배경색과 border 색이 함께 변한다.
- 버튼 active도 위치 이동이나 그림자 없이 배경색, 테두리색, 글자색만 바꾼다.
- focus는 그림자가 아니라 `focus.surface` outline, `focus.line` border, 링크의 하단선으로 표시한다.
- Button, IconButton, Badge, Callout, Tabs, Field, Label, Input, Textarea, Select, Checkbox, Radio, Switch, HelpText, ErrorText, Surface, preview panel은 `0.375rem` radius를 기준으로 보고 pill 형태를 쓰지 않는다.
- Button과 IconButton은 `2px` border width를 기준으로 하는 framed control 방향을 유지한다.
- Input, Textarea, Select는 Button과 같은 framed control 방향을 쓰고, help/error text는 id와 `aria-describedby`로 연결한다.
- Checkbox, Radio, Switch는 native input을 유지하고 `checked`, `focus-visible`, `disabled`, `invalid` 상태를 토큰으로 표현한다.
- Badge와 Callout은 짧은 상태와 페이지 안 피드백을 표현하되 제품 판단 로직을 갖지 않는다.
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

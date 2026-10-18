# Consumer Contract

Shared CSS is generated from the Svelte component `<style>` blocks in the
explicit order declared by `scripts/component-style-order.ts`; `src/styles/components.css`
is the generated output, written by `bun run styles:generate`. Shared
utility classes that do not overlap a component and the forced-colors overrides
stay in `src/styles/component-utilities.css`; the former hand-maintained
`src/styles/component-parts/*.css` fragments and the parity parser are gone, and
`bun run styles:check` rejects stale output in preview and package builds.
Public CSS import paths and cascade order remain unchanged. The utilities are
embedded in `components.css`; their authoring file is not shipped in `dist`.

Svelte Tooltip wraps long text, flips when the opposite side fits, and shifts
within the visible viewport on open, resize and scrolling. It remains inside its
parent DOM: consumers must avoid clipping overflow ancestors and keep tooltip
copy short enough to fit the viewport height. Shared CSS provides text wrapping;
collision updates require the Svelte component.

When `onDismiss` synchronously removes a focused StatusToast, focus moves to the
next dismiss control, then the previous one, or the empty stack's group. A
callback that moves focus elsewhere keeps that choice. Dismissals that do not
start with focus on the close button do not move focus.

SortHeader `ascendingLabel`, `descendingLabel`, and `unsortedLabel` localize the
current sort state in its accessible name. The visible column label remains
part of the name unless `ariaLabel` supplies a complete override. Omitting these
props preserves the existing English state labels; `aria-sort` stays on the
owning header cell.

Combobox `listboxLabel`, `openLabel`, and `closeLabel` let consuming apps supply
localized accessible names. Omitting them preserves the existing English defaults;
the package does not choose a locale or translate caller text.

이 문서는 `zdp-design-system`을 다른 ZDP 저장소에서 소비할 때의 기준이다.
목표는 public web, app shell, product lab, game surface가 같은 토큰과 같은 접근성 기본값을 공유하게 만드는 것이다.
Default component text is English. 소비 앱은 화면 locale에 맞춰 user-facing label, placeholder, aria-label, empty text, toast dismissal text를 prop으로 override한다.

이 문서는 소비 계약의 개요이자 길잡이다. 절별 상세 계약은 `docs/consumer-contract/` 아래 목적별 문서로 나눠 두었고, 아래 절 제목에서 해당 문서로 이동한다.

## 공통 원칙

- 소비 저장소는 제품 문구, 라우팅, SEO, 데이터 로딩, 인증, 결제, 권한 판단을 직접 소유한다.
- 디자인 시스템은 색상, 타입, 간격, radius, focus, i18n, control metric, shared component API만 제공한다.
- Card와 CardHeader는 비상호작용 콘텐츠 컨테이너다. panel/raised tone은 색상 단계로 깊이를 만들고, `outline`만 명시적 테두리를 사용한다. `hover`는 부드러운 표면색 변화만 제공하며 클릭 가능성, 손가락 커서, 키보드 focus를 암시하지 않는다. 전체 카드 이동이나 실행은 내부 Link 또는 Button으로 명시한다.
- 소비 저장소는 `zdp-design-system`의 public export만 사용하고 내부 `src/` deep import를 만들지 않는다.
- package export는 `dist/` 산출물을 통해 소비한다. `bun run package:build`는 `@sveltejs/package`와 `tsconfig.package.json`으로 `src/lib`를 atomic staging tree 안에서만 컴파일하고, 원본 `.ts`가 산출물에 남으면 실패한다. helper 모듈은 `.js`와 `.d.ts`, Svelte 컴포넌트는 TypeScript를 제거한 `.svelte`와 `.svelte.d.ts`를 함께 내보낸다. 모든 export leaf는 `types` 조건을 첫 번째에 두고 root는 `dist/index.d.ts`, 컴포넌트는 `dist/components/*.svelte.d.ts`, helper는 각 `dist/<module>.d.ts`로 연결하므로 bundler와 NodeNext 소비처가 같은 선언을 본다. root runtime entry는 `dist/index.js`이고 root barrel은 호환용이다. 원천은 `src/lib`, `src/styles`, `tokens/zdp.tokens.json`, `src/lib/share.ts`이고 `dist/`는 release 전 `bun run package:build`로 다시 만든다.
- ZDP monorepo 안의 active sibling 소비처는 unpublished local changes와 package surface를 함께 검증하기 위해 `file:../zdp-design-system`을 유지할 수 있다. 이 경우 CI는 sibling `zdp-design-system`을 checkout하고 `bun run package:build`를 먼저 실행해야 한다.
- standalone consumer, public template, external example처럼 sibling checkout을 전제로 하지 않는 표면은 npm registry package를 사용한다. 0.61.0 이상에서는 `zdp-design-system: ^0.65.0`를 기본 semver 범위로 쓰고, 재현 가능한 release proof가 필요한 곳만 exact version을 pin한다.
- open shadow root 안에 component를 mount하는 소비처는 document-level import에 기대지 않고 `zdp-design-system/styles.css` 내용을 해당 root 안의 `<style>` 또는 `<link rel="stylesheet">`로 직접 설치한다. stylesheet가 설치된 open root에서 Tooltip, Combobox, Menu, Popover, Dialog, Sheet, TermSheet의 documented interaction contract를 지원한다. closed shadow root는 지원하지 않는다.
- `zdpTokenNames`는 `tokens:generate` 산출물로, 저장소 root의 `share.js`와 `share.d.ts`는 `share-icons:generate` 산출물로 유지하고 손으로 맞추지 않는다. 소비자용 `dist/share.js`와 `dist/share.d.ts`는 `package:build`가 `src/lib/share.ts`를 컴파일해 만든다.
- 새 버전은 소비 저장소가 opt-in으로 채택한다. broad adoption 전에는 대표 소비처에서 시각과 build를 확인한다.
- Svelte 소비처는 `zdp-design-system/tokens.css`와 `zdp-design-system/components/ComponentName` direct subpath를 기본으로 사용해 scoped component CSS와 전역 `components.css`를 중복하지 않고 root barrel의 전체 개발 그래프를 피한다. 기존 root named export와 `styles.css`는 호환 및 framework-neutral/static utility 표면으로 유지한다.
- keyboard focus, flat UI, framed control, Noto Sans KR-first font stack은 소비처에서 임의로 낮추지 않는다.
- 브랜드 워드마크는 `font.family.brand`와 `brand-fonts.css`를 쓰되, 본문과 제품 UI heading은 Noto Sans KR-first sans/display stack을 유지한다.
- 소비 저장소는 `zdp-design-system`을 쓰기 위해 Tailwind, UnoCSS, shadcn registry, daisyUI theme, Skeleton preset, Flowbite theme, external `cn()` helper를 알 필요가 없어야 한다.
- 외부 headless primitive가 내부 구현에 쓰이더라도 public API, CSS class, token, dist export는 ZDP 계약으로만 노출한다.
- 공용 이미지 fallback은 `zdp-design-system/brand-assets` manifest와 `zdp-design-system/assets/brand/*` 파일만 사용한다. 원본 PNG 또는 내부 `src/` 경로를 import하지 않으며, 비율과 crop 규칙은 `docs/BRAND_ASSETS.md`를 따른다.
- 새 심볼 표면은 `ship-mark-simple-mono.svg`를 기본으로 사용하고, 상세형 호환·역상·inline `currentColor`·표시용 3색 요구가 있을 때만 각 명시적 variant를 선택한다. 3색 variant는 32 CSS px 미만에서 쓰지 않는다.
- 제품 헤더와 공용 앱 셸은 simple ship mark 단독 표시가 기본이다. `.zdp-brand-lockup`과 `brand-fonts.css`를 쓰는 `8ailors` 워드마크 결합형은 넓은 회사 소개·캠페인·editorial 표면의 선택 계약이며, 소비 앱이 모든 헤더에 반복 적용하지 않는다.
- Rodisoft 회사 식별이 필요한 법인·명함·회사 소개 표면은 `rodi-mark.svg`를 정본으로 사용한다. `rodi-mark-1254.png`는 SVG를 처리하지 못하는 도구의 승인된 fallback이며 제품용 ship mark를 대체하지 않는다.
- 공용 레몬과 크레딧 팩 함선은 `zdp-design-system/credit-assets` manifest와 `zdp-design-system/assets/credits/*` 파일만 사용한다. 구매·보너스·무료·보상 레몬을 색상만으로 구분하지 않고 localized text 또는 Badge를 함께 제공하며, 함선 asset ID를 가격·지급량·판매 상태의 정본으로 사용하지 않는다.

## Svelte 소비 표면

상세 계약은 [docs/consumer-contract/svelte.md](consumer-contract/svelte.md)를 따른다.

## Astro 소비 표면

상세 계약은 [docs/consumer-contract/astro.md](consumer-contract/astro.md)를 따른다.

## 호환용 package-root Svelte 표면

package-root 호환 예시는 [docs/consumer-contract/svelte-root-compatibility.md](consumer-contract/svelte-root-compatibility.md)를 따른다. 컴포넌트별 동작 계약은 목적별 문서로 나눠 두었다.

- 입력과 액션(Button, CommandField, Combobox, Input, Radio, Kbd): [components-input-and-actions.md](consumer-contract/components-input-and-actions.md)
- 이동과 선택(Breadcrumb, Link, SkipLink, Menu, Tabs, SegmentedControl, Pagination, LocaleSwitcher, ThemeToggle, TextScaleControl): [components-navigation-and-selection.md](consumer-contract/components-navigation-and-selection.md)
- 오버레이와 dialog(Popover, Sheet, TermSheet, Tooltip, Dialog): [components-overlays-and-dialogs.md](consumer-contract/components-overlays-and-dialogs.md)
- 피드백과 콘텐츠(Accordion, Toast, Progress, EmptyState, AdSlot, InlineCode): [components-feedback-and-content.md](consumer-contract/components-feedback-and-content.md)
- 레이아웃과 데이터(Page, Container, Section, Stack, Grid, Table, KeyValue, Avatar, Icon): [components-layout-and-data.md](consumer-contract/components-layout-and-data.md)
- 공유와 브랜드(ShareDock, zdpShareIcons): [components-sharing-and-brand.md](consumer-contract/components-sharing-and-brand.md)
- 데스크톱 작업 영역(ResizableSplitPane): [desktop-workspace.md](consumer-contract/desktop-workspace.md)

## Flutter와 Native 소비 표면

상세 계약은 [docs/consumer-contract/flutter-native.md](consumer-contract/flutter-native.md)를 따른다.

## 소비처 적용 체크리스트

상세 체크리스트는 [docs/consumer-contract/adoption-checklist.md](consumer-contract/adoption-checklist.md)를 따른다.

## 금지 경계

- 디자인 시스템에 제품별 화면, 랜딩 문구, admin 정책, 결제 판단, 권한 판단, 개인정보 처리 로직을 넣지 않는다.
- 소비 저장소가 `zdp-design-system/src/...` 같은 내부 경로를 직접 import하지 않는다.
- 배포 package는 `bun run package:build`로 만든 `dist/` export를 쓰며, 소비자 fixture가 public import만으로 build되는지 확인한다.
- token name을 제품별 별칭으로 복사해 fork하지 않는다.
- focus 색을 브랜드 장식색, hover 색, semantic danger/success 색으로 재사용하지 않는다.
- 앱 root, page root, card, table cell, code body, document body, toast body에 `user-select: none`을 적용하지 않는다.
- 보안을 이유로 선택만 막지 않는다. 화면에 노출하면 복사 가능하다고 보고, 노출하면 안 되는 값은 렌더링하지 않는다.
- `selectstart` 차단, 우클릭 차단, 문서 전체 selection 차단으로 브라우저 기본 행동을 죽이지 않는다.

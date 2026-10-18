# Astro 소비 표면

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
넓은 마케팅·editorial 표면에서 로고와 워드마크를 함께 쓸 때만 `.zdp-brand-lockup`, `.zdp-brand-lockup__mark`, `.zdp-brand-wordmark` utility로 맞춘다. 제품 헤더와 앱 셸은 simple ship mark 단독 표시를 기본으로 하고, 제품 기능 제목, CTA, 표 데이터, 본문에는 브랜드 폰트를 쓰지 않는다. `lang="ko"` 같은 locale surface 안에서도 실제 워드마크 텍스트에는 `.zdp-brand-wordmark`를 직접 붙여야 하며 `.zdp-surface-reset .zdp-brand-wordmark`가 locale font override보다 뒤에서 브랜드 스택, `font-size: calc(var(--zdp-type-page-title-size) - 0.8rem)`, `font-size: calc(var(--zdp-type-page-title-compact-size) - 0.5rem)`, `font-weight: var(--zdp-font-weight-semibold)`을 유지한다.
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
데스크톱 작업 영역은 `ResizableSplitPane` 또는 `zdp-design-system/split-pane`의 framework-neutral `createZdpSplitPaneController`, `.zdp-resizable-split-pane`, `.zdp-resizable-split-pane__separator`로 나누되 현재 폭과 저장 key, 모바일 전환점, Sheet 열림 상태는 소비처가 소유한다.
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
인터랙티브 Menu가 필요한 페이지는 `@astrojs/svelte`로 Svelte island을 만들고 그 안에서 `zdp-design-system`의 `Menu` 컴포넌트를 쓴다. 기본 CSS와 framework-neutral DOM controller 표면(Astro plain HTML/CSS, `zdp-design-system/split-pane`)은 Svelte나 Floating UI를 import할 수 없으므로 그 경로로는 Menu의 keyboard·focus 상호작용을 붙이지 않는다. 정적 마크업에는 `.zdp-menu`, `.zdp-menu__trigger`, `.zdp-menu__panel`, `.zdp-menu__item` utility만 쓴다.
Menu `items`의 `onclick` 같은 함수는 Astro frontmatter prop으로 직렬화할 수 없어서, 페이지가 아니라 그 island의 local Svelte wrapper 안에서 만든다. 항목 노출, 권한, 라우팅 판단은 소비처가 계속 소유한다.
packed Astro consumer fixture는 `static`, `menu`, `popover`, `combobox` 4페이지를 포함하고 기존 정적 경로를 유지한다. `menu`와 `popover` 페이지는 Svelte island 안에서 `zdp-design-system`의 `Menu`와 `Popover`를 mount하고, 공개 props, `trigger` slot과 default legacy slot, `.zdp-menu*`/`.zdp-popover*` class, token은 그대로 쓴다. 정적 HTML/CSS 경로는 기존대로 유지하고, Popover의 변경 콜백이 변경당 한 번만 호출되는지도 이 fixture에서 확인한다.

상위 개요와 금지 경계는 [docs/CONSUMER_CONTRACT.md](../CONSUMER_CONTRACT.md)를 따른다.

Menu와 Popover의 자동 배치는 Svelte island가 hydration된 뒤 동작한다. 정적 HTML/CSS 경로와 공개 export는 그대로 유지한다. Popover는 소비처가 만든 trigger slot을 기준으로 화면 경계에서 방향과 위치를 보정하고, 긴 내용은 가용 공간 안에서 스크롤한다.

Combobox는 `zdp-design-system/components/Combobox`를 Svelte island 안에서 사용한다. hydration 후 화면 경계에 따라 목록을 위·아래로 배치하고 가용 높이를 제한한다. 소비처의 local Svelte wrapper가 option source와 filtering을 소유하며, 정적 HTML/CSS 경로는 JavaScript 위치 계산을 요구하지 않는다.

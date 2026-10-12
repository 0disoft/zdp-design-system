# 이동과 선택 컴포넌트 계약

Breadcrumb는 page-location trail, link, separator, current-page aria 구조만 제공하며 라우팅, SEO, 인증, 결제, 권한 판단은 소비 앱이 계속 소유한다.

Link는 일반 텍스트 이동, hover 색상 변화, keyboard focus highlight만 제공하며 라우팅, SEO, 인증, 결제, 권한 판단은 소비 앱이 계속 소유한다. 실제 단축키가 구현된 링크만 `ariaKeyShortcuts`를 전달한다.
SkipLink는 반복 탐색을 건너뛰는 keyboard-first link 구조와 focus-visible 표시만 제공하며 target id, 페이지 레이아웃, 라우팅 판단은 소비 앱이 계속 소유한다.

ThemeToggle은 다음 light/dark 전환 동작을 안내하는 일반 버튼이며 glyph, 접근성 이름, focus-visible 표면을 제공한다. 초기 테마 결정, storage key, system preference, SSR/초기 paint 처리는 소비 앱이 계속 소유한다.

LocaleSwitcher는 locale 선택을 위한 radiogroup, 선택 상태, focus-visible, keyboard 이동 표면만 제공한다. 실제 message catalog 로딩, URL routing, fallback locale, root `lang`, storage key, 사용자 preference 저장은 소비 앱이 계속 소유한다.

LocaleSwitcher와 SegmentedControl은 visible outer border 대신 raised group surface를 사용하고, 선택 항목은 filled accent surface로 구분한다. 소비 앱은 별도 테두리를 중첩하지 않으며 forced-colors에서는 디자인 시스템이 제공하는 system border와 Highlight 선택 상태를 유지한다.

TextScaleControl은 글자 크기 선택을 위한 radiogroup, 선택 상태, focus-visible, keyboard 이동 표면만 제공한다. 실제 document root 배율, media query, storage key, locale별 글자 크기 보정, 사용자 preference 저장은 소비 앱이 계속 소유한다.

SegmentedControl은 보기 방식, 밀도, 기간처럼 가까운 단일 선택의 `radiogroup`/`radio`/`aria-checked` 구조만 제공하며 실제 필터 의미, URL state, 정렬, 데이터 로딩, 권한 판단은 소비 앱이 계속 소유한다.

Disclosure, LocaleSwitcher, SegmentedControl, TextScaleControl, Menu, Popover, Tooltip은 명시적 `id` 또는 `idPrefix`가 없을 때도 반복 SSR과 hydration 사이에서 같은 fallback ID와 ARIA 참조를 유지한다. 외부 DOM과 참조를 공유하거나 고정 selector가 필요한 소비처만 명시적 값을 제공한다.

Tabs, Menu, SegmentedControl, LocaleSwitcher, TextScaleControl의 roving focus는 실제 `event.target`, container의 `ownerDocument`, computed RTL direction을 기준으로 이동한다. Keyboard selection callback은 합성 click이 아니라 원래 `KeyboardEvent`를 받으므로 소비 앱은 pointer와 keyboard 입력 출처를 구분할 수 있다.

Menu의 href item은 현재 문서의 실제 navigation을 전제로 focus를 복원하지 않지만, 새 문서를 여는 `target="_blank"` item이나 SPA router·소비 callback이 click에서 `preventDefault()`한 item은 현재 문서의 trigger focus를 복원한다. Pointer hover는 시각적 hover만 제공하며 roving keyboard 기준을 바꾸지 않고, 실제 item focus가 이동했을 때 keyboard 기준을 동기화한다.
Breadcrumb는 첫 번째 명시적 `current` item 하나만 `aria-current="page"`로 노출한다. 명시값이 없을 때만 마지막 item을 현재 페이지로 간주하므로, 중간 경로를 현재로 지정해도 마지막 링크가 중복 current가 되지 않는다.

Tabs, SegmentedControl, LocaleSwitcher, TextScaleControl에 전달된 선택값이 없거나 disabled·unknown 값이면 첫 enabled 항목으로 바인딩 값을 자동 보정한다. enabled 항목이 하나도 없으면 어떤 항목도 selected/checked로 표시하지 않는다. ARIA·시각 선택과 부모 상태는 항상 같은 값을 정본으로 공유한다.

Pagination은 목록 페이지 이동의 `nav`, ordered list, link/button, ellipsis, `aria-current="page"` 구조만 제공하며 전체 개수, 현재 페이지 상태, 페이지 크기, 쿼리 라우팅, 필터, 정렬, 데이터 로딩, 권한 판단은 소비 앱이 계속 소유한다. 작은 컨테이너에서는 pagination nav가 horizontal overflow를 소유하고 페이지 버튼이 여러 줄로 무너지지 않아야 하며, 스크롤 표면 안에서도 focus outline의 위아래 edge가 잘리지 않아야 한다.

Tabs는 가까운 정보 묶음 전환을 표현하되 라우팅, 권한, 데이터 로딩 판단은 소비 앱이 계속 소유한다. 기본 tab/panel prefix는 인스턴스마다 다르고 SSR과 hydration에서 안정적이며, 소비 앱이 명시적인 `idPrefix`를 전달하는 계약도 유지한다. 기존 `let:selectedId`, `let:selectedItem`, `bind:selectedId` 계약은 계속 지원한다.

상위 개요와 금지 경계는 [docs/CONSUMER_CONTRACT.md](../CONSUMER_CONTRACT.md)를 따른다.

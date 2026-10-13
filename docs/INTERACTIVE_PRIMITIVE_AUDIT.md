# Interactive Primitive Audit

이 문서는 고난도 interactive primitive를 외부 headless 구현 후보에 올릴지 판단하기 위한 현재 상태 감사다.
기준은 `docs/EXTERNAL_UI_ADOPTION.md`의 흡수 등급을 따른다.

## 결론

- Bits UI를 runtime dependency로 쓰는 예외는 `Menu`와 `Popover`다. shadcn-svelte, Ark UI를 포함한 나머지 primitive는 신규 도입을 보류하고 기존 구현과 검토 후보 상태를 유지한다.
- `Select`와 `CommandField`는 native element를 중심으로 둔 현재 구현을 유지한다.
- `Combobox`는 searchable single-select를 ZDP-native로 제공하되 filtering, async search, command execution, permissions는 소비 앱에 남긴다.
- `Dialog`, `Sheet`, `TermSheet`는 ZDP modal layer, focusable helper, scroll lock, focus return, activation-order stacking을 유지하되 inert sibling, portal, animation orchestration 요구가 커지면 headless 후보로 다시 평가한다.
- `Sheet`는 settings, filter, drawer형 보조 흐름의 공통 modal edge panel이다. Drawer를 별도 primitive로 복제하지 않고 Sheet placement/use case로 먼저 다룬다.
- `Menu`와 `Popover`는 가장 높은 위험군이다. 두 컴포넌트 모두 Bits UI를 ZDP adapter 뒤에서 내부 구현으로 채택했다. `Menu`의 typeahead는 구현과 검증을 마쳤고, Menu의 일반 화면 경계 보정은 구현했고, 남은 미래 범위는 submenu, portal, nested overlay와 Popover collision 같은 요구다.
- `Menu`는 Bits UI `DropdownMenu`(`Root`, `Trigger`, `Content`, `Item`)를 ZDP adapter 뒤에서 내부 구현으로 채택한 첫 사례다. public API와 CSS는 그대로 유지하고, 바깥 pointerdown에서 닫으며 프로그램의 외부 focus 이동은 `onfocusout`의 `flushSync` scope 정리로 닫는다. 채택 동작 검증은 완료됐다: Menu browser `--menu` 통과, Astro 실제 tarball 2페이지(astro 7.3.8, @astrojs/svelte 9.0.1) build와 hydration 통과, SSR hydration 통과, type 0 error/0 warning, CSS parity 688 통과, package·publish check 통과.
- 모바일 keyboard, 긴 옵션, async option, grouped option, virtualized list, 복잡한 collision 요구는 `Menu`, `Popover`, `Combobox` 안에서 계속 키우지 않고 `Sheet` flow 또는 headless spike로 보낸다.
- `Tooltip`은 짧은 non-interactive label로만 유지한다. 긴 안내, 클릭 가능한 내용, mobile-first 설명은 Popover, Disclosure, Dialog, 소비 앱 flow로 보낸다.

## 감사 매트릭스

| Primitive | Current Base | Risk | Current Coverage | Do Next |
| --- | --- | --- | --- | --- |
| Select | Native `select` | Low | label/id/error/describedBy, invalid, disabled, required, focus-visible | Custom select나 combobox 요구 전까지 유지 |
| CommandField | Native `input` | Low | label, shortcut hint, aria-keyshortcuts/autocomplete/controls/expanded/activedescendant passthrough, input keydown callback | result list, dispatcher, command palette는 별도 primitive로 분리 |
| Combobox | ZDP custom combobox/listbox | Medium | input combobox role, listbox/option roles, ArrowUp/ArrowDown, Enter select, Escape close, disabled skip, hidden value, open shadow root, InteractionProbe와 Chromium coverage | grouped options, virtualized list, async option loading, multi-select, portal/collision, closed shadow root 요구 시 headless spike |
| Tooltip | Hover/focus label | Low | role tooltip, slot-provided `describedBy`, Escape dismiss, 설명 hover 유지와 짧은 이동 유예, open shadow root와 Chromium coverage | interactive content 금지와 shadow-root stylesheet 설치 계약 유지 |
| Dialog | ZDP custom modal | Medium | Escape, backdrop close, focus trap, focus return, scroll lock, background inert, body portal와 open shadow root 호환, activation-order modal layer, Chromium nested-layer coverage | package-owned portal API, closed shadow root, animation orchestration 요구가 생기면 headless spike |
| Sheet | ZDP custom modal edge panel | Medium | right/left/bottom placement, Escape, backdrop close, focus trap, focus return, scroll lock, background inert, body portal와 open shadow root 호환, activation-order modal layer, InteractionProbe와 Chromium coverage | draggable sheet, snap point, package-owned portal API, closed shadow root 요구가 생기면 headless spike |
| TermSheet | ZDP glossary sheet | Medium | Escape, backdrop close, focus trap, focus return, scroll lock, background inert, body portal와 open shadow root 호환, activation-order modal layer, stable term attributes | glossary 외 설정/필터/drawer 요구는 Sheet로 보내고 closed shadow root는 지원하지 않는다 |
| Menu | Bits UI DropdownMenu adapter | High | trigger keyboard open, typeahead, IME 조합 보호, roving focus, disabled skip, Home/End, Escape, outside pointerdown close, 외부 focus 이동 close, focus return, viewport flip/shift, 가용 공간 스크롤, resize/scroll 추적, open shadow root, InteractionProbe와 Chromium coverage | Bits UI adapter와 자동 배치 검증 완료. submenu, portal, closed shadow root 요구는 계속 추적 |
| Popover | Bits UI Popover adapter | High | Escape, outside click, trigger focus policy, focus return, role null/group/dialog, open shadow root, InteractionProbe와 Chromium coverage | Bits UI adapter 동작 검증 완료(2026-10-13). collision/portal, nested overlay, closed shadow root는 future 재평가 |

## Component Notes

### Select

`Select`는 native `select`를 감싼다.
이 단계에서는 Bits UI나 Ark UI를 넣을 이유가 없다.
custom trigger, searchable option, grouped option, virtualized list, async option loading이 필요해지는 순간 새 `Combobox` 또는 custom `Select` 작업으로 분리한다.

### CommandField

`CommandField`는 input frame과 shortcut hint만 맡는다.
검색 결과, listbox, command execution, 전역 keydown dispatcher를 직접 만들지 않는다.
`aria-keyshortcuts`, `aria-autocomplete`, `aria-controls`, `aria-expanded`, `aria-activedescendant`, `onkeydown`은 소비 앱이 실제 shortcut focus, result surface, keyboard behavior를 붙일 때만 전달한다.

### Combobox

`Combobox`는 검색 가능한 단일 선택 입력이다.
ZDP는 label, input frame, listbox, active option, disabled option skip, hidden submitted value, keyboard navigation만 소유한다. IME 조합 중 Enter와 방향키는 option 선택이나 이동으로 소비하지 않는다.
소비 앱은 option source, filtering, async search, result ranking, command execution, permission visibility를 계속 소유한다.
단순 상태 선택은 native `Select`를 유지하고, 사용자가 입력으로 후보를 좁혀야 하는 단일 선택에만 `Combobox`를 쓴다.
InteractionProbe와 Chromium gate는 ArrowDown open, disabled skip, Enter select, Escape close, IME composition 보호, listbox label, selected value sync를 계속 확인한다. Chromium gate는 stylesheet가 설치된 open shadow root 안에서 input/toggle click이 listbox를 즉시 닫지 않고, Escape 뒤 input focus를 유지하며, 실제 outside click만 닫는 것도 확인한다. closed shadow root는 지원하지 않는다.

### Tooltip

`Tooltip`은 짧은 설명 text만 노출한다.
Tooltip 안에 button, link, form field를 넣지 않는다.
Escape로 현재 tooltip을 dismiss할 수 있어야 한다.
Chromium gate는 stylesheet가 설치된 open shadow root 안에서도 focus 표시, Escape dismiss, trigger focus 유지, blur 뒤 재표시를 확인한다. document에만 stylesheet를 import하면 shadow boundary를 넘지 않으므로 소비처가 해당 root 안에 CSS를 설치해야 한다. closed shadow root는 지원하지 않는다.
viewport collision과 mobile long-press를 해결하려고 floating engine으로 키우지 않는다.
그 요구는 Popover나 별도 help surface로 보낸다.

### Dialog

`Dialog`는 custom modal로 유지한다.
현재 기준은 Escape close, backdrop close, Tab trap, Shift+Tab trap, focus return, shared focusability helper, modal layer scroll lock, background inert, activation-order stacking이다.
Chromium gate는 Dialog, Sheet, TermSheet 각각의 keyboard/backdrop contract, disabled fieldset과 hidden·`aria-hidden`·`inert` ancestry를 제외한 focus trap, implicit `contenteditable`, checked radio group의 단일 tab stop, positive `tabindex` 정렬, Escape와 backdrop dismissal opt-out, 비활성 backdrop의 접근성 트리 제외와 panel focus 보존, background DOM branch inert, 중첩 layer의 LIFO·비-LIFO 종료 때 isolation/stacking 재정렬, top-layer focus 유지, outer-trigger focus fallback, 단일·중첩 top·중첩 lower component unmount의 focus/inert/scroll/layer cleanup, body portal과 open shadow root 경계, 기존 inert 상태와 scroll lock 복구를 확인한다.
다만 package-owned portal target API, closed shadow root focus orchestration, animation orchestration은 아직 소유하지 않는다.
이 요구가 실제 제품에서 반복되면 Runtime Dependency 등급으로 Bits UI 또는 Ark UI를 spike한다.

### Sheet

`Sheet`는 settings, filter, drawer형 보조 흐름을 위한 reusable modal edge panel이다.
현재 기준은 right, left, bottom placement, Escape close, backdrop close, Tab trap, Shift+Tab trap, focus return, shared focusability helper, modal layer scroll lock, background inert, activation-order stacking, stable sheet data attributes다.
저장, 권한, 데이터 fetch, 라우팅 판단은 소비 앱에 남긴다.
드래그 가능한 bottom sheet, snap point, portal target, mobile keyboard avoidance가 반복되면 이 컴포넌트 안에서 계속 키우지 말고 Bits UI 또는 Ark UI headless spike를 연다.

### TermSheet

`TermSheet`는 glossary/domain sheet로 유지한다.
현재 기준은 Dialog와 같은 focus/scroll lock 계열에 stable term attributes와 `data-zdp-ad-exclude`를 더한 형태다.
settings, filter, drawer형 보조 흐름은 TermSheet에 추가하지 않고 `Sheet`로 보낸다.

### Menu

`Menu`는 현재 가장 조심해야 하는 primitive다.
typeahead는 구현과 검증을 마쳤으므로 더 이상 후보 조건이 아니다. 남은 미래 범위는 submenu, checkbox/radio menu item, collision, portal, nested menu 확장이다.
그 확장 요구가 실제로 반복되면 이 컴포넌트 안에서 계속 키우지 않고 별도 headless spike로 분리한다.
단, Bits UI를 쓰더라도 `ZdpMenuItem`, `.zdp-menu*` class, token mapping, Storybook examples, consumer fixture는 ZDP가 소유한다.
`Menu`는 Bits UI `DropdownMenu`의 `Root`, `Trigger`, `Content`, `Item`을 ZDP adapter 뒤에서만 쓰는 Runtime Dependency로 채택했다. Root 공개 props·콜백·type, `ZdpMenuItem` public 타입, `items`·`placement`·`align`·`open`·`triggerLabel`·`idPrefix` props 이름, named `trigger` slot, `.zdp-menu*` class, token mapping, 기존 custom Escape dismiss 공유 순서, 기존 DOM controller·CSS는 그대로 유지한다.
바깥 pointerdown에서 닫고, 프로그램이 focus를 바깥으로 옮기면 `onfocusout`에서 `flushSync`로 scope를 정리하며 닫는다. 예전에는 바깥 클릭이 완료될 때까지 열려 있었으므로 닫히는 시점이 pointerdown으로 앞당겨졌다.
도구 계약 노트(사용자 UI 문구 아님): Bits UI 적용 범위는 `Menu`와 `Popover`다. 설치된 2.19.5에서 `Menu`가 쓰는 `DropdownMenu`의 `Content`와 `ContentStatic`은 `trapFocus={false}`가 실제 `FocusScope`에 전달되지 않는 결함이 있어 `Menu.svelte` adapter가 외부 focusout `flushSync` close와 Tab capture 정리로 기존 focus 탈출 보장을 유지한다. 반면 `Popover`가 쓰는 `Content`은 `trapFocus={false}`가 실제로 전달되어, adapter가 `onOpenAutoFocus`/`onCloseAutoFocus`/`onFocusOutside`를 preventDefault하고 child `onkeydown`으로 native Tab 순서를 유지한다. 소프트웨어 결함이라 설치본에 로컬 패치를 넣지 않고 버전도 고정하지 않는다. 외부 라이브러리 기본 동작만 신뢰하지 않고 이 focus 계약을 회귀 검사로 계속 확인한다.
`placement`와 `align`은 선호 배치이며 Bits UI `Content`의 collision detection, flip, shift가 화면 경계를 보정한다. 긴 메뉴는 가용 폭·높이 안에서 스크롤하고 창 크기와 스크롤 변경 시 위치를 갱신한다. automatic portal을 쓰지 않고 패널은 기존 Menu DOM 안에 유지한다. 정적 표면(Astro plain HTML/CSS, framework-neutral DOM controller entry)은 인터랙티브 `Menu`를 제공하지 않으므로 Svelte island에서만 쓰고, 콜백을 담은 `items`는 소비처의 local Svelte wrapper에서 만든다.
채택 동작 검증은 완료됐다. Menu browser `--menu`(disabled skip, Enter selection, focus return, outside click 포함) 통과, Astro 실제 tarball 2페이지(astro 7.3.8, @astrojs/svelte 9.0.1) build와 static CSS·controller resize·Menu hydration 통과, SSR hydration 통과, type 0 error/0 warning, CSS parity 688 통과, package·publish check 통과.
InteractionProbe는 ArrowDown open, roving focus, disabled skip, Home/End, Escape close, focus return, click select를 계속 확인한다. Chromium gate는 pointer open 뒤 첫 enabled item focus, Escape trigger focus 복귀, outside click target focus 보존에 더해 ArrowDown/ArrowUp trigger entry, disabled skip, 양방향 wrap, Home/End, Tab document exit, Enter selection과 trigger focus 복귀를 확인한다. open shadow root 안에서는 composed click path로 내부 입력을 보존하고 deepest active element로 trigger focus를 복구한다. closed shadow root는 지원하지 않는다.

### Popover

`Popover`는 non-modal floating panel이다.
`Popover`는 Bits UI `Popover`의 `Root`와 `Content`를 ZDP adapter 뒤에서 쓰는 Runtime Dependency로 채택했다. 기존 소비처 정의 trigger와 default legacy slot을 그대로 유지하므로 Bits `Trigger`는 쓰지 않는다. 공개 props, `trigger` slot과 default legacy slot, `.zdp-popover*` class, token mapping, `role`(`null`/`group`/`dialog`)은 그대로 ZDP 계약이고 public API는 바뀌지 않는다. `Content`에서 `trapFocus={false}`, `preventScroll={false}`를 쓰고, Bits 중복 dismissal은 끄고(`escapeKeydownBehavior`/`interactOutsideBehavior`=`ignore`) 기존 ZDP shared dismissal stack·Escape 순서와 `closeOnEscape`/`closeOnOutside` opt-out을 유지한다. `onOpenAutoFocus`/`onCloseAutoFocus`/`onFocusOutside`는 preventDefault하고 child `onkeydown`으로 native Tab 순서를 유지하므로 focus가 밖으로 이동하는 것만으로는 닫지 않고 scroll lock도 걸지 않는다. automatic portal 없이 기존 DOM 안의 내부 positioner로 배치한다. `placement`와 `align`은 선호 배치이며, 공간이 부족하면 flip/shift하고 가용 폭·높이에 맞춰 긴 내용을 스크롤한다. 간격은 ZDP 토큰을 따른다.
현재는 짧은 필터, 작은 설정, 간단한 정보 패널에만 쓴다.
panel open 시 첫 focus를 강제로 옮기지 않는 정책은 non-modal popover 기준에서는 허용하지만, form-heavy popover나 dialog-like popover가 늘면 policy를 다시 정해야 한다.
바깥 닫힘 시점은 Menu가 pointerdown, Popover는 포인터 완료 후 click으로 서로 다르고, Popover는 기존 시점을 유지한다.
자동 배치 검증 완료(2026-10-13): browser:popover:check PASS(네 모서리 flip/shift, LTR/RTL placement×align, 긴 내용, resize, anchor 이동·scroll, native Tab/Shift+Tab, IME 내부·외부, role group/null, 중첩 Menu+Popover top-only dismiss, open shadow root, iframe). Astro packed 3페이지 build·hydration·모서리 배치·콜백 once PASS. SSR hydration, type 0 error/0 warning, CSS parity 700, static a11y, package check PASS. public API diff none. 후속 수정(2026-10-13): Storybook 정적 계약의 Input·Textarea·Select 검사 기준을 공통 필드 토큰과 현재 선택창 스타일로 갱신해 기존 불일치 5건을 해결했고, storybook:check PASS.
Popover adapter compat 노트(사용자 UI 문구 아님): Bits 2 `EscapeLayer`는 `escapeKeydownBehavior=ignore`여도 document bubble 단계에서 Escape `preventDefault`를 부른다. Popover의 기존 계약인 IME 조합·`isComposing`·`keyCode 229` Escape와 `closeOnEscape=false`는 그 이벤트를 소비하지 않아야 하므로, `open ? rootElement?.ownerDocument : null`에 묶인 pre effect에서 Bits `Content`보다 먼저 document bubble guard를 등록한다. guard는 open일 때만 등록되고 closed에서 제거되며, `open && Escape && (IME || !closeOnEscape)`일 때만 `stopImmediatePropagation`으로 후속 document bubble 리스너로의 전달을 막아 Bits의 `preventDefault`를 방지한다(`preventDefault`는 하지 않는다. editor target 핸들러는 이미 처리된 상태다). unmount와 document 변경 시 listener를 정리한다.
남은 미래 범위는 portal target과 복잡한 nested overlay 확장이고, 그 요구가 실제로 반복되면 이 컴포넌트 안에서 계속 키우지 않고 별도 headless spike로 분리한다.
InteractionProbe는 trigger focus 유지, Escape close, focus return, outside click close를 계속 확인한다. Chromium gate는 panel 안 focus에서 Escape trigger 복귀, outside click target focus 보존, trigger의 `aria-expanded`와 `aria-controls` 정리뿐 아니라 `closeOnEscape={false}`와 `closeOnOutside={false}` 보호 중 open/focus/ARIA 유지 및 explicit close 복구까지 확인한다. open shadow root 안에서도 trigger click을 outside click으로 오판하지 않고 Escape focus return과 실제 외부 클릭 dismissal을 유지한다. closed shadow root는 지원하지 않는다. 이 opt-out은 non-modal `Popover`에만 허용하며 ARIA `Menu`의 Escape/outside dismissal은 끄지 않는다.

## Headless Spike Trigger

다음 중 두 개 이상이 같은 primitive에서 반복되면 직접 구현 확장 대신 headless spike를 연다.

- typeahead search
- submenu 또는 nested overlay
- collision detection, flip, shift
- portal target
- roving focus가 여러 axis로 확장
- aria-activedescendant 기반 virtual focus
- checkbox/radio menu item
- async option list
- draggable sheet 또는 snap point
- mobile viewport keyboard 대응

## Spike Rule

headless spike는 바로 dependency adoption이 아니다.
spike 결과는 다음을 남겨야 한다.

- candidate package and version
- license
- adoption grade
- public API leakage check
- CSS token mapping
- Storybook interaction coverage
- addon-a11y result
- consumer fixture result
- THIRD_PARTY_NOTICES impact

public API, class, token, consumer setup에 외부 철학이 새면 spike는 실패다.

Menu 자동 배치 검증 범위(2026-10-13): 4방향·3정렬·LTR/RTL, 모바일 네 모서리, 긴 메뉴, 리사이즈, 트리거 이동, 스크롤 컨테이너 추적, 키보드·dismiss, SSR/hydration, 실제 tarball Astro island. 일반 화면 경계 대응은 Bits UI Content에 맡기며 추가 portal·submenu 요구는 별도로 평가한다.

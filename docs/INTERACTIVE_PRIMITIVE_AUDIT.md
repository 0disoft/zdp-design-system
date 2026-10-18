# Interactive Primitive Audit

이 문서는 고난도 interactive primitive를 외부 headless 구현 후보에 올릴지 판단하기 위한 현재 상태 감사다.
기준은 `docs/EXTERNAL_UI_ADOPTION.md`의 흡수 등급을 따른다.

## 결론

- 플로팅 위치 계산의 runtime dependency는 공통 Floating UI DOM 액션이다. Bits UI runtime 의존성은 제거했으며, 나머지 headless primitive 도입은 실제 확장 요구가 생길 때 검토한다.
- `Select`와 `CommandField`는 native element를 중심으로 둔 현재 구현을 유지한다.
- `Combobox`는 searchable single-select를 ZDP-native로 제공하되 filtering, async search, command execution, permissions는 소비 앱에 남긴다.
- `Menu`, `Popover`, `Combobox`, `Tooltip`은 `floating-position.ts`와 `floating-boundary.ts`로 간격·flip/shift·가용 크기·클리핑·업데이트 수명을 공유한다.
- `Dialog`, `Sheet`, `TermSheet`는 ZDP modal layer, focusable helper, scroll lock, focus return, activation-order stacking을 유지하되 inert sibling, portal, animation orchestration 요구가 커지면 headless 후보로 다시 평가한다.
- `Sheet`는 settings, filter, drawer형 보조 흐름의 공통 modal edge panel이다. Drawer를 별도 primitive로 복제하지 않고 Sheet placement/use case로 먼저 다룬다.
- `Menu`와 `Popover`는 가장 높은 위험군이다. ZDP 상호작용과 공통 Floating UI 위치 계산을 쓰며, submenu·portal target·복잡한 중첩 확장은 별도로 평가한다.
- `Menu`는 ZDP roving focus·typeahead와 공용 dismiss stack을 사용한다. 바깥 pointerdown과 외부 focus 이동에서 닫고 native Tab 순서를 유지한다.
- 모바일 keyboard, 긴 옵션, async option, grouped option, virtualized list, 복잡한 collision 요구는 `Menu`, `Popover`, `Combobox` 안에서 계속 키우지 않고 `Sheet` flow 또는 headless spike로 보낸다.
- `Tooltip`은 짧은 non-interactive label로만 유지한다. 긴 안내, 클릭 가능한 내용, mobile-first 설명은 Popover, Disclosure, Dialog, 소비 앱 flow로 보낸다.

## 감사 매트릭스

| Primitive | Current Base | Risk | Current Coverage | Do Next |
| --- | --- | --- | --- | --- |
| Select | Native `select` | Low | label/id/error/describedBy, invalid, disabled, required, focus-visible | Custom select나 combobox 요구 전까지 유지 |
| CommandField | Native `input` | Low | label, shortcut hint, aria-keyshortcuts/autocomplete/controls/expanded/activedescendant passthrough, input keydown callback | result list, dispatcher, command palette는 별도 primitive로 분리 |
| Combobox | ZDP custom combobox/listbox | Medium | input combobox role, listbox/option roles, ArrowUp/ArrowDown, Enter select, Escape close, disabled skip, hidden value, viewport flip/shift, 입력창 폭·가용 높이, 긴 목록, active option 내부 스크롤, resize/scroll 추적, open shadow root, SSR와 packed Astro coverage | grouped options, virtualized list, async option loading, multi-select, portal target, 복잡한 collision, closed shadow root 요구 시 headless spike |
| Tooltip | Hover/focus label | Low | role tooltip, slot-provided `describedBy`, Escape dismiss, 설명 hover 유지와 짧은 이동 유예, open shadow root와 Chromium coverage | interactive content 금지와 shadow-root stylesheet 설치 계약 유지 |
| Dialog | ZDP custom modal | Medium | Escape, backdrop close, focus trap, focus return, scroll lock, background inert, body portal와 open shadow root 호환, activation-order modal layer, Chromium nested-layer coverage | package-owned portal API, closed shadow root, animation orchestration 요구가 생기면 headless spike |
| Sheet | ZDP custom modal edge panel | Medium | right/left/bottom placement, Escape, backdrop close, focus trap, focus return, scroll lock, background inert, body portal와 open shadow root 호환, activation-order modal layer, InteractionProbe와 Chromium coverage | draggable sheet, snap point, package-owned portal API, closed shadow root 요구가 생기면 headless spike |
| TermSheet | ZDP glossary sheet | Medium | Escape, backdrop close, focus trap, focus return, scroll lock, background inert, body portal와 open shadow root 호환, activation-order modal layer, stable term attributes | glossary 외 설정/필터/drawer 요구는 Sheet로 보내고 closed shadow root는 지원하지 않는다 |
| Menu | ZDP menu + shared Floating UI action | High | trigger keyboard open, typeahead, IME 조합 보호, roving focus, disabled skip, Home/End, Escape, outside pointerdown close, 외부 focus 이동 close, focus return, viewport·transform/paint 부모 경계 보정, 가용 공간 스크롤, resize/scroll 추적, open shadow root, InteractionProbe와 Chromium coverage | 공통 Floating UI 액션 사용. submenu, portal target, closed shadow root 요구는 계속 추적 |
| Popover | ZDP non-modal panel + shared Floating UI action | High | Escape, outside click, trigger focus policy, focus return, role null/group/dialog, viewport·transform/paint 부모 경계 보정, LTR/RTL 정렬, 긴 내용, resize/scroll 추적, open shadow root, iframe, SSR와 packed Astro coverage | 공통 Floating UI 액션 사용(2026-10-13). portal target, 복잡한 nested overlay, closed shadow root는 future 재평가 |

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
typeahead와 일반 화면·부모 경계 보정은 구현과 검증을 마쳤다. 남은 미래 범위는 submenu, checkbox/radio menu item, portal target, 복잡한 nested menu 확장이다.
그 확장 요구가 실제로 반복되면 이 컴포넌트 안에서 계속 키우지 않고 별도 headless spike로 분리한다.
Menu는 ZDP 키보드·포커스 처리와 공통 `floating-position.ts` 액션을 쓴다. `ZdpMenuItem` 타입, 공개 props·콜백, named `trigger` slot, `.zdp-menu*` class와 토큰 계약을 유지한다. `placement`와 `align`은 선호 배치이며 Floating UI가 화면과 클리핑 부모 경계에서 flip/shift하고 가용 폭·높이를 계산한다. 긴 패널은 내부에서 스크롤하며 스크롤·리사이즈에 따라 위치를 갱신한다. 자동 portal 없이 기존 DOM 안에 배치하고 정적 CSS의 배치 클래스도 유지한다. 바깥 pointerdown은 공용 dismiss stack에서 처리하고, 외부 focus 이동에서는 포커스 트랩 없이 닫는다. Tab/Shift+Tab은 메뉴 항목을 tab 순서에서 제외한 뒤 문서의 다음/이전 컨트롤로 이동한다. typeahead, disabled skip, Home/End, IME 보호와 선택 콜백을 유지한다.
InteractionProbe는 ArrowDown open, roving focus, disabled skip, Home/End, Escape close, focus return, click select를 계속 확인한다. Chromium gate는 pointer open 뒤 첫 enabled item focus, Escape trigger focus 복귀, outside click target focus 보존에 더해 ArrowDown/ArrowUp trigger entry, disabled skip, 양방향 wrap, Home/End, Tab document exit, Enter selection과 trigger focus 복귀를 확인한다. open shadow root 안에서는 composed click path로 내부 입력을 보존하고 deepest active element로 trigger focus를 복구한다. closed shadow root는 지원하지 않는다.

### Popover

`Popover`는 non-modal floating panel이다.
Popover는 공통 `floating-position.ts` 액션으로 위치를 계산하는 non-modal 패널이다. 공개 props, trigger/default 슬롯, `.zdp-popover*` class, 토큰과 `role`(`null`/`group`/`dialog`)을 유지한다. 소비처 trigger에 포커스를 두고 native Tab 순서를 따르며 scroll lock이나 focus trap을 걸지 않는다. Escape·outside click은 ZDP 공용 dismiss stack에서 처리하고 `closeOnEscape`·`closeOnOutside` opt-out과 IME 입력을 보존한다. `placement`·`align`은 선호 배치이며 가용 폭·높이 안에서 flip/shift하고 긴 내용은 스크롤한다. 자동 portal 없이 기존 DOM 안에서 배치한다. Menu는 pointerdown, Popover는 포인터 완료 후 click에서 바깥 입력으로 닫힌다.
현재는 짧은 필터, 작은 설정, 간단한 정보 패널에만 쓴다.
panel open 시 첫 focus를 강제로 옮기지 않는 정책은 non-modal popover 기준에서는 허용하지만, form-heavy popover나 dialog-like popover가 늘면 policy를 다시 정해야 한다.
바깥 닫힘 시점은 Menu가 pointerdown, Popover는 포인터 완료 후 click으로 서로 다르고, Popover는 기존 시점을 유지한다.
자동 배치 검증 완료(2026-10-13): browser:popover:check PASS(네 모서리 flip/shift, LTR/RTL placement×align, 긴 내용, resize, anchor 이동·scroll, native Tab/Shift+Tab, IME 내부·외부, role group/null, 중첩 Menu+Popover top-only dismiss, open shadow root, iframe). Astro packed 3페이지 build·hydration·모서리 배치·콜백 once PASS. SSR hydration, type 0 error/0 warning, CSS parity 700, static a11y, package check PASS. public API diff none. 후속 수정(2026-10-13): Storybook 정적 계약의 Input·Textarea·Select 검사 기준을 공통 필드 토큰과 현재 선택창 스타일로 갱신해 기존 불일치 5건을 해결했고, storybook:check PASS.
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

Menu 자동 배치 검증 범위(2026-10-13): 4방향·3정렬·LTR/RTL, 모바일 네 모서리, 긴 메뉴, 리사이즈, 트리거 이동, 스크롤 컨테이너 추적, 키보드·dismiss, SSR/hydration, 실제 tarball Astro island. 현재 화면 경계 대응은 공통 Floating UI 액션에 맡기며 추가 portal·submenu 요구는 별도로 평가한다.

자동 배치 완료 기록(2026-10-13): Menu·Popover의 화면 경계, transform+overflow hidden/auto 부모, paint containment에서 실제 hit-test와 긴 panel 스크롤을 검증했다. Combobox의 네 모서리·LTR/RTL·긴 목록·리사이즈·스크롤·active option·폼 제출도 검증했다. browser:menu:check, browser:popover:check, browser:controls:check, ssr:hydration:check, type:check(0 error/0 warning), api:check, storybook:check, preview:check(CSS parity 701), a11y:check, package:check, fixtures:check와 packed Astro 4페이지 build·hydration이 통과했다. Astro 정적 HTML/CSS와 Svelte island 경로, 공개 API는 유지했고 자동 portal은 추가하지 않았다.

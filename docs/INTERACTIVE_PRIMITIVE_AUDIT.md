# Interactive Primitive Audit

이 문서는 고난도 interactive primitive를 외부 headless 구현 후보에 올릴지 판단하기 위한 현재 상태 감사다.
기준은 `docs/EXTERNAL_UI_ADOPTION.md`의 흡수 등급을 따른다.

## 결론

- 지금 당장 Bits UI, shadcn-svelte, Ark UI를 package dependency로 추가하지 않는다.
- `Select`와 `CommandField`는 native element를 중심으로 둔 현재 구현을 유지한다.
- `Dialog`와 `TermSheet`는 ZDP modal layer, focusable helper, scroll lock, focus return을 유지하되 nested modal, inert sibling, portal 요구가 커지면 headless 후보로 다시 평가한다.
- `Menu`와 `Popover`는 가장 높은 위험군이다. 단순 더보기와 짧은 필터 표면은 현재 구현으로 유지하되, typeahead, submenu, collision detection, portal, nested overlay가 필요해지면 Bits UI 내부 의존성 후보로 올린다.
- `Tooltip`은 짧은 non-interactive label로만 유지한다. 긴 안내, 클릭 가능한 내용, mobile-first 설명은 Popover, Disclosure, Dialog, 소비 앱 flow로 보낸다.

## 감사 매트릭스

| Primitive | Current Base | Risk | Current Coverage | Do Next |
| --- | --- | --- | --- | --- |
| Select | Native `select` | Low | label/id/error/describedBy, invalid, disabled, required, focus-visible | Custom select나 combobox 요구 전까지 유지 |
| CommandField | Native `input` | Low | label, shortcut hint, aria-controls/expanded/activedescendant passthrough | result list, dispatcher, command palette는 별도 primitive로 분리 |
| Tooltip | CSS hover/focus label | Low | role tooltip, slot-provided `describedBy`, pointer-events none | interactive content 금지 유지 |
| Dialog | ZDP custom modal | Medium | Escape, backdrop close, focus trap, focus return, scroll lock, modal layer | nested modal, portal, inert sibling 요구가 생기면 headless spike |
| TermSheet | ZDP custom modal sheet | Medium | Escape, backdrop close, focus trap, focus return, scroll lock, stable term attributes | right/bottom sheet 외 변형이 늘면 headless spike |
| Menu | ZDP custom menu | High | trigger keyboard open, roving focus, disabled skip, Home/End, Escape, outside click, focus return, InteractionProbe play coverage | typeahead, submenu, pointerdown outside, collision/portal 요구 시 Bits UI 후보 |
| Popover | ZDP custom non-modal overlay | High | Escape, outside click, trigger focus policy, focus return, role/dialog passthrough, InteractionProbe play coverage | first focus policy, collision/portal, nested overlay 요구 시 Bits UI 후보 |

## Component Notes

### Select

`Select`는 native `select`를 감싼다.
이 단계에서는 Bits UI나 Ark UI를 넣을 이유가 없다.
custom trigger, searchable option, grouped option, virtualized list, async option loading이 필요해지는 순간 새 `Combobox` 또는 custom `Select` 작업으로 분리한다.

### CommandField

`CommandField`는 input frame과 shortcut hint만 맡는다.
검색 결과, listbox, command execution, 전역 keydown dispatcher를 직접 만들지 않는다.
`aria-controls`, `aria-expanded`, `aria-activedescendant`는 소비 앱이 result surface를 붙일 때만 전달한다.

### Tooltip

`Tooltip`은 짧은 설명 text만 노출한다.
Tooltip 안에 button, link, form field를 넣지 않는다.
viewport collision과 mobile long-press를 해결하려고 floating engine으로 키우지 않는다.
그 요구는 Popover나 별도 help surface로 보낸다.

### Dialog

`Dialog`는 custom modal로 유지한다.
현재 기준은 Escape close, backdrop close, Tab trap, Shift+Tab trap, focus return, shared focusability helper, modal layer scroll lock이다.
다만 sibling inert 처리, portal target, nested dialog priority, animation orchestration은 아직 소유하지 않는다.
이 요구가 실제 제품에서 반복되면 Runtime Dependency 등급으로 Bits UI 또는 Ark UI를 spike한다.

### TermSheet

`TermSheet`는 glossary/domain sheet가 아니라 reusable modal sheet 표면으로 유지한다.
현재 기준은 Dialog와 같은 focus/scroll lock 계열에 stable term attributes와 `data-zdp-ad-exclude`를 더한 형태다.
right/bottom 외 placement, snap point, draggable sheet, nested overlay가 필요하면 이 컴포넌트 안에서 계속 키우지 말고 별도 Sheet primitive 후보로 분리한다.

### Menu

`Menu`는 현재 가장 조심해야 하는 primitive다.
현재 구현은 단순 action menu에 충분하지만 typeahead, submenu, checkbox/radio menu item, collision, portal, pointerdown outside, nested menu를 직접 늘리기 시작하면 접근성 부채가 빠르게 커진다.
그 지점부터는 Behavior Spec이 아니라 Runtime Dependency 후보로 전환한다.
단, Bits UI를 쓰더라도 `ZdpMenuItem`, `.zdp-menu*` class, token mapping, Storybook examples, consumer fixture는 ZDP가 소유한다.
InteractionProbe는 ArrowDown open, roving focus, disabled skip, Home/End, Escape close, focus return, click select를 계속 확인한다.

### Popover

`Popover`는 non-modal floating panel이다.
현재는 짧은 필터, 작은 설정, 간단한 정보 패널에만 쓴다.
panel open 시 첫 focus를 강제로 옮기지 않는 정책은 non-modal popover 기준에서는 허용하지만, form-heavy popover나 dialog-like popover가 늘면 policy를 다시 정해야 한다.
collision/flip/portal/nested overlay 요구가 반복되면 내부 headless 의존성 후보로 올린다.
InteractionProbe는 trigger focus 유지, Escape close, focus return, outside click close를 계속 확인한다.

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
- sibling inert 처리
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

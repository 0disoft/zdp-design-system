# External UI Adoption

이 문서는 외부 UI 라이브러리와 예제를 `zdp-design-system`에 참고하거나 흡수할 때의 기준이다.
목표는 더 많은 기능을 만들되, ZDP public API, CSS token, Storybook, consumer fixture, a11y gate를 외부 철학에 넘기지 않는 것이다.

## 원칙

- 외부 UI 라이브러리는 ZDP의 dependency source가 아니라 검증 source다. 이는 기본 원칙이고, 명시적으로 채택한 `Menu`와 `Popover`만 예외로 runtime dependency다.
- 고난도 headless primitive는 public API와 styling contract가 ZDP 안에 갇혀 있다는 조건에서 내부 구현 의존성으로 허용할 수 있다.
- Tailwind, UnoCSS, registry, `cn()` helper, class merge helper, 외부 theme preset은 ZDP core public contract로 새지 않는다.
- ZDP public component props, DOM exposure policy, CSS class, token mapping, Storybook coverage, consumer fixture는 ZDP가 소유한다.
- Button, Badge, Card, typography, layout helper처럼 시각 규칙이 대부분인 컴포넌트는 외부 headless 의존성을 붙이지 않는다.
- 외부 코드를 복사하거나 포팅하면 원 출처, 라이선스, 변경 범위, notice 유지 여부를 component-level provenance로 남긴다.

## 흡수 등급

### Reference Only

예쁜 화면, interaction idea, docs 설명을 보고 제품 방향만 비교한 상태다.
코드, DOM 구조, naming, state machine을 옮기지 않는다.
THIRD_PARTY_NOTICES에는 보통 남기지 않아도 되지만 PR 설명에는 참고한 링크를 남긴다.

### Behavior Spec

키보드 이동, focus return, Escape 닫기, aria state 같은 동작 명세를 비교한 상태다.
코드는 복사하지 않고 ZDP-native Svelte/CSS로 다시 구현한다.
문서에는 `behavior reviewed against <source>, no source copied` 형태로 남긴다.

### Ported Structure

상태 흐름, DOM 배치, 이벤트 순서 같은 구조를 Svelte/ZDP 방식으로 옮긴 상태다.
원 코드가 직접 복사되지 않았어도 회색지대이므로 provenance를 남긴다.
Storybook interaction, a11y gate, consumer fixture가 같이 있어야 한다.

### Source Adapted

외부 코드 일부를 직접 복사하거나 의미 있게 변형한 상태다.
MIT 같은 허용 라이선스라도 원 저작권 고지와 license notice를 보존한다.
`THIRD_PARTY_NOTICES.md`와 component provenance에 source URL, license, adapted file, local owner를 남긴다.

### Runtime Dependency

외부 패키지를 dependency로 설치해 내부 구현에 쓰는 상태다.
Bits UI 같은 headless primitive에 한해 후보가 될 수 있고, public export에 외부 타입, prop 이름, class, theme token이 새면 실패다.
consumer fixture가 외부 패키지 설정 없이 `zdp-design-system` public export만으로 빌드되어야 한다.
현재 `Menu`와 `Popover`가 이 등급으로 Bits UI `DropdownMenu`/`Popover`를 ZDP adapter 뒤에서 내부 구현으로 채택했다. public API, CSS class, token, Storybook, consumer fixture는 그대로 ZDP가 소유한다.

### Prohibited

파생 컴포넌트 라이브러리, template, starter kit, redistributable UI kit에 제한이 있는 상용 UI 소스는 금지한다.
Tailwind Plus/Tailwind UI 계열은 ZDP public package 재료로 쓰지 않는다.

## 후보별 기준

### Bits UI / shadcn-svelte

Select, Combobox, Dialog, Command, Drawer, Sheet처럼 focus, keyboard, aria, nested overlay가 까다로운 primitive의 동작 명세와 테스트 후보로 검토한다.
내부 구현 의존성은 허용할 수 있지만, public API와 CSS token, class naming, DOM exposure policy는 ZDP가 소유한다.
`bits-ui` 타입, prop 이름, store shape, Tailwind class, shadcn registry 파일 구조가 ZDP public export로 새면 실패다.

### Bits UI Menu·Popover 채택 범위

`Menu.svelte`는 Bits UI `DropdownMenu`의 `Root`, `Trigger`, `ContentStatic`, `Item`을 ZDP adapter 뒤에서만 내부 구현으로 쓴다.

- `ZdpMenuItem` public 타입과 `items`, `open`, `triggerLabel`, `idPrefix`, `placement`, `align`, `onOpenChange`, `onSelect` props 이름, Root 공개 props·콜백·type, named `trigger` slot, `.zdp-menu*` class, token mapping, Storybook story, consumer fixture는 그대로 ZDP가 소유한다.
- 패널 위치는 기존 `.zdp-menu--{placement}`·`.zdp-menu--align-*` CSS 값을 유지한다. automatic portal을 켜지 않고 DOM 위치도 바꾸지 않는다.
- 기존 ZDP custom Escape dismiss 공유 순서와 framework-neutral DOM controller·CSS 표면은 유지한다.
- 바깥 pointerdown에서 닫고, 프로그램이 focus를 바깥으로 옮기면 `onfocusout`에서 `flushSync`로 scope를 정리하며 닫는다. 예전에는 바깥 클릭이 완료될 때까지 열려 있었다.
- 도구 계약 노트(사용자 UI 문구 아님): Bits UI 적용 범위는 `Menu`와 `Popover`다. 설치된 2.19.5에서 `Menu`가 쓰는 `DropdownMenu`의 `ContentStatic`은 `trapFocus={false}`가 실제 `FocusScope`에 전달되지 않는 결함이 있어 `Menu.svelte` adapter가 외부 focusout `flushSync` close와 Tab capture 정리로 기존 focus 탈출 보장을 유지한다. 반면 `Popover`가 쓰는 `ContentStatic`은 `trapFocus={false}`가 실제로 전달되어, adapter가 `onOpenAutoFocus`/`onCloseAutoFocus`/`onFocusOutside`를 preventDefault하고 child `onkeydown`으로 native Tab 순서를 유지한다. 소프트웨어 결함이라 설치본에 로컬 패치를 넣지 않고 버전도 고정하지 않는다. 외부 라이브러리 기본 동작만 신뢰하지 않고 이 focus 계약을 회귀 검사로 계속 확인한다. Popover adapter에는 별도 compat 처리가 하나 더 있다: Bits 2 `EscapeLayer`가 `escapeKeydownBehavior=ignore`여도 document bubble 단계에서 Escape `preventDefault`를 하므로, `open ? rootElement?.ownerDocument : null`에 묶인 pre effect가 open일 때만 Bits `Content`보다 먼저 document bubble guard를 등록하고 closed에서 제거한다. guard는 `open && Escape && (IME || !closeOnEscape)`일 때만 `stopImmediatePropagation`으로 후속 document bubble 리스너로의 전달을 막아 Bits의 `preventDefault`를 방지하고(`preventDefault` 없음) unmount와 document 변경 시 정리한다.
- 정적 소비 표면은 `bits-ui`나 Svelte를 import할 수 없다. Astro plain HTML/CSS와 `zdp-design-system/split-pane` 같은 framework-neutral DOM controller entry는 인터랙티브 `Menu`를 제공하지 않는다. 인터랙티브 `Menu`는 Svelte island(`@astrojs/svelte`) 안에서만 쓴다.
- `onclick` 같은 콜백을 담은 `items`는 Astro frontmatter에서 직렬화할 수 없으므로 소비처가 local Svelte wrapper 안에서 만든다.
- Storybook interaction과 `addon-a11y` gate, consumer fixture build가 같은 변경 단위에 있어야 한다.

Popover는 같은 등급으로 Bits UI `Popover`의 `Root`와 `ContentStatic`만 ZDP adapter 뒤에서 쓴다. 기존 소비처 정의 trigger와 default legacy slot을 그대로 유지하므로 Bits `Trigger`는 쓰지 않는다.

- 공개 props, `trigger` slot과 default legacy slot, `.zdp-popover*` class, token mapping, `role`(`null`/`group`/`dialog`)은 그대로 ZDP가 소유한다.
- `ContentStatic`에서 `trapFocus={false}`, `preventScroll={false}`를 쓴다. `Popover`의 `ContentStatic`은 `trapFocus={false}`가 실제로 전달되므로, `onOpenAutoFocus`/`onCloseAutoFocus`/`onFocusOutside`를 preventDefault하고 child `onkeydown`으로 native Tab 순서를 유지한다.
- Bits 중복 dismissal은 끄고(`escapeKeydownBehavior`/`interactOutsideBehavior`=`ignore`) 기존 ZDP shared dismissal stack·Escape 순서와 `closeOnEscape`/`closeOnOutside` opt-out을 그대로 쓴다. focus가 밖으로 이동하는 것만으로는 닫지 않고 scroll lock도 걸지 않는다.
- automatic portal을 켜지 않고 기존 static placement CSS 위치를 유지한다.
- 바깥 닫힘 시점은 Menu가 pointerdown, Popover는 포인터 완료 후 click으로 서로 다르고, Popover는 기존 시점을 유지한다.

### Skeleton / Flowbite Svelte / daisyUI

패턴 카탈로그로만 본다.
core primitive에 직접 유입하지 않고, 필요한 아이디어는 ZDP-native Svelte/CSS와 token mapping으로 다시 작성한다.
소비 앱이 Tailwind 설정이나 daisyUI theme을 알아야 하는 구조는 허용하지 않는다.

### Ark UI

React, Solid, Vue, Svelte를 같이 보는 장기 멀티 프레임워크 후보로 둔다.
현재 Svelte-first 표면에서는 기본 후보가 아니며, cross-framework package boundary가 실제 요구가 될 때 다시 평가한다.

### Motion / SmoothUI

core component가 아니라 marketing recipe와 campaign surface 후보로 격리한다.
Motion engine과 SmoothUI-derived recipe는 서로 다른 출처로 기록한다.
SmoothUI 코드를 참고하거나 포팅하면 SmoothUI source와 license를 따로 provenance와 notice에 남긴다.
모든 animation recipe는 `prefers-reduced-motion` 대체 흐름을 갖는다.

### Tailwind Plus / Tailwind UI

ZDP package, template, shared component, starter, registry, generated UI surface의 재료로 쓰지 않는다.
제품 end screen에서 별도 라이선스 아래 쓰는 결정은 해당 소비 앱이 소유하지만, 그 결과물이 `zdp-design-system`으로 역유입되면 안 된다.

## 고난도 Primitive 게이트

외부 headless 구현을 참고하거나 의존성 후보로 올리는 primitive는 다음 항목을 검토해야 한다.

- focus trap 또는 focus return
- Escape close
- outside click 또는 outside pointerdown
- Tab 순환과 Shift+Tab 역순환
- SSR/hydration 안정성
- nested overlay 동작
- scroll lock과 기존 body overflow 복원
- portal target 또는 layer root
- reduced motion 대체
- keyboard interaction 표준
- screen reader label, description, state
- form integration
- controlled/uncontrolled state
- disabled, readonly, invalid 상태
- Storybook interaction과 addon-a11y gate
- consumer fixture build

## Provenance Template

새 component나 큰 interaction 변경이 외부 source를 참고하면 PR이나 문서에 다음 항목을 남긴다.

```md
Component:
Source:
License:
Adoption grade:
What was adapted:
What was not copied:
ZDP-owned API:
ZDP token mapping:
A11y contract:
Fixture / story coverage:
Notice update:
```

예시는 다음처럼 남긴다.

```md
Component: Select
Source: Bits UI Select docs
License: MIT
Adoption grade: Behavior Spec
What was adapted: keyboard movement and aria state checklist
What was not copied: source code, prop names, Tailwind classes
ZDP-owned API: Select.svelte props and zdp-select CSS classes
ZDP token mapping: control, focus, line, surface tokens
A11y contract: labelled trigger, aria-expanded, roving option focus
Fixture / story coverage: Interaction story and consumer fixture
Notice update: not required because no source copied
```

## Review Rule

외부 UI를 참고한 변경은 “작동한다”만으로 통과하지 않는다.
ZDP public API가 외부 의존성을 숨기고, consumer가 내부 주방을 몰라도 import만으로 쓸 수 있어야 한다.

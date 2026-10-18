# External UI Adoption

이 문서는 외부 UI 라이브러리와 예제를 `zdp-design-system`에 참고하거나 흡수할 때의 기준이다.
목표는 더 많은 기능을 만들되, ZDP public API, CSS token, Storybook, consumer fixture, a11y gate를 외부 철학에 넘기지 않는 것이다.

## 원칙

- 외부 UI 라이브러리는 ZDP의 dependency source가 아니라 검증 source다. 네 플로팅 컴포넌트의 공통 위치 계산에 쓰는 Floating UI DOM API는 runtime dependency 예외다.
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
공통 위치 계산이나 Bits UI 같은 headless primitive가 후보가 될 수 있고, public export에 외부 타입, prop 이름, class, theme token이 새면 실패다.
consumer fixture가 외부 패키지 설정 없이 `zdp-design-system` public export만으로 빌드되어야 한다.
현재 `Menu`, `Popover`, `Combobox`, `Tooltip`의 위치 계산은 Floating UI DOM API를 공통 액션 뒤에서 쓴다. 공개 API와 상호작용은 ZDP가 소유한다.

### Prohibited

파생 컴포넌트 라이브러리, template, starter kit, redistributable UI kit에 제한이 있는 상용 UI 소스는 금지한다.
Tailwind Plus/Tailwind UI 계열은 ZDP public package 재료로 쓰지 않는다.

## 후보별 기준

### Bits UI / shadcn-svelte

Select, Combobox, Dialog, Command, Drawer, Sheet처럼 focus, keyboard, aria, nested overlay가 까다로운 primitive의 동작 명세와 테스트 후보로 검토한다.
내부 구현 의존성은 허용할 수 있지만, public API와 CSS token, class naming, DOM exposure policy는 ZDP가 소유한다.
`bits-ui` 타입, prop 이름, store shape, Tailwind class, shadcn registry 파일 구조가 ZDP public export로 새면 실패다.

### 공통 플로팅 위치 계산

Menu는 ZDP 키보드·포커스 처리와 공통 `floating-position.ts` 액션을 쓴다. `ZdpMenuItem` 타입, 공개 props·콜백, named `trigger` slot, `.zdp-menu*` class와 토큰 계약을 유지한다. `placement`와 `align`은 선호 배치이며 Floating UI가 화면과 클리핑 부모 경계에서 flip/shift하고 가용 폭·높이를 계산한다. 긴 패널은 내부에서 스크롤하며 스크롤·리사이즈에 따라 위치를 갱신한다. 자동 portal 없이 기존 DOM 안에 배치하고 정적 CSS의 배치 클래스도 유지한다. 바깥 pointerdown은 공용 dismiss stack에서 처리하고, 외부 focus 이동에서는 포커스 트랩 없이 닫는다. Tab/Shift+Tab은 메뉴 항목을 tab 순서에서 제외한 뒤 문서의 다음/이전 컨트롤로 이동한다. typeahead, disabled skip, Home/End, IME 보호와 선택 콜백을 유지한다.

Popover는 공통 `floating-position.ts` 액션으로 위치를 계산하는 non-modal 패널이다. 공개 props, trigger/default 슬롯, `.zdp-popover*` class, 토큰과 `role`(`null`/`group`/`dialog`)을 유지한다. 소비처 trigger에 포커스를 두고 native Tab 순서를 따르며 scroll lock이나 focus trap을 걸지 않는다. Escape·outside click은 ZDP 공용 dismiss stack에서 처리하고 `closeOnEscape`·`closeOnOutside` opt-out과 IME 입력을 보존한다. `placement`·`align`은 선호 배치이며 가용 폭·높이 안에서 flip/shift하고 긴 내용은 스크롤한다. 자동 portal 없이 기존 DOM 안에서 배치한다. Menu는 pointerdown, Popover는 포인터 완료 후 click에서 바깥 입력으로 닫힌다.

네 컴포넌트는 `floating-position.ts`에서 `@floating-ui/dom` 메이저 1의 `offset`, `flip`, `shift`, `size`, `autoUpdate`를 함께 사용한다. `floating-boundary.ts`가 transform·paint containment의 클리핑 부모를 찾고 같은 경계를 모든 middleware에 전달한다. 일반 overflow 부모에서는 fixed 패널이 빠져나오는 동작을 유지한다. 간격은 CSS 토큰의 계산된 값에서 읽고, unmount/옵션 변경 시 observer·listener와 지연된 좌표 적용을 정리한다. Combobox는 입력창 폭에 맞추고, Tooltip도 같은 가용 공간 제한을 쓴다.

Bits UI runtime 의존성과 focus/Escape 호환용 가드는 제거했다. Bits UI는 동작·접근성 검토 후보로 남는다. 소비 앱은 새 설정 없이 기존 공개 API를 쓰며 consumer fixture build로 확인한다. Astro plain HTML/CSS와 framework-neutral controller 경로는 그대로 유지하고, 인터랙티브 컴포넌트만 Svelte island로 hydrate한다.

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

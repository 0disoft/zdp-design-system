# External UI Adoption

이 문서는 외부 UI 라이브러리와 예제를 `zdp-design-system`에 참고하거나 흡수할 때의 기준이다.
목표는 더 많은 기능을 만들되, ZDP public API, CSS token, Storybook, consumer fixture, a11y gate를 외부 철학에 넘기지 않는 것이다.

## 원칙

- 외부 UI 라이브러리는 ZDP의 dependency source가 아니라 검증 source다.
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

### Prohibited

파생 컴포넌트 라이브러리, template, starter kit, redistributable UI kit에 제한이 있는 상용 UI 소스는 금지한다.
Tailwind Plus/Tailwind UI 계열은 ZDP public package 재료로 쓰지 않는다.

## 후보별 기준

### Bits UI / shadcn-svelte

Select, Combobox, Dialog, Popover, Menu, Command, Drawer, Sheet처럼 focus, keyboard, aria, nested overlay가 까다로운 primitive의 동작 명세와 테스트 후보로 검토한다.
내부 구현 의존성은 허용할 수 있지만, public API와 CSS token, class naming, DOM exposure policy는 ZDP가 소유한다.
`bits-ui` 타입, prop 이름, store shape, Tailwind class, shadcn registry 파일 구조가 ZDP public export로 새면 실패다.

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

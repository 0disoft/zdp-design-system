# Public API compatibility guard

`zdp-design-system`은 여러 소비 저장소가 함께 업그레이드하는 공개 패키지다. 타입 검사가 통과하더라도 공개 계약 변화에 맞는 릴리스 의도가 없으면 병합하지 않는다. 이 가드는 현재 작업 트리의 공개 API 계약을 base commit에서 추출한 계약과 비교한다.

## 검사 범위

검사는 `package.json` export map, `src/lib/index.ts` root export, 공개 Svelte 컴포넌트의 prop과 slot, prop이 참조하는 로컬 type declaration, `zdpTokenNames`를 계약으로 취급한다.

컴포넌트 prop은 legacy `export let`과 Svelte 5 typed `$props()` destructuring을 모두 읽는다. `$bindable()`, required 여부, 기본값도 계약에 포함한다. root helper export는 함수 signature, type 또는 interface declaration, 공개 const declaration을 정규화해 비교한다.

구현 본문과 CSS 값은 이 검사 대상이 아니다. 해당 영역은 기존 type, browser, accessibility, Storybook 검증이 담당한다.

## 판정 규칙

공개 export, 컴포넌트, prop, slot 또는 token 제거는 breaking change다. prop type과 기본값 변경, optional prop의 required 전환, `$bindable()` 제거, 공개 helper declaration 변경도 breaking change다.

새 export, 컴포넌트, optional prop, slot 또는 token은 additive change다. 새 required prop은 기존 소비 코드를 깨뜨리므로 breaking change로 처리한다.

현재 패키지가 `0.x`인 동안 additive와 breaking 변화 모두 minor 릴리스 의도가 필요하다. `1.0.0` 이후 additive는 minor, breaking은 major가 필요하다.

가드는 다음 중 하나를 요구한다.

1. feature PR에서 패키지 버전을 필요한 수준으로 직접 올린다.
2. 현재 base에 없거나 base와 내용이 다른 `.changes/*.md` 조각이 필요한 bump 이상을 선언한다.

기존 base에 이미 있던 조각은 새 PR의 의도로 인정하지 않는다. 따라서 unrelated breaking change가 이전 조각에 기대어 통과할 수 없다. 현재 release automation에서는 두 번째 방법이 기본이며, 생성된 release PR이 승인된 조각을 모아 실제 버전과 changelog를 갱신한다.

## 명령

현재 작업 트리의 계약 파싱만 확인한다.

```sh
bun run api:check
```

현재 계약을 JSON으로 출력한다.

```sh
bun scripts/check-public-api-contract.ts --print
```

특정 base commit과 현재 작업 트리를 비교한다.

```sh
bun scripts/check-public-api-contract.ts --base-ref <full-commit-sha>
```

`--base-ref`는 option ambiguity를 막기 위해 전체 40자 또는 64자 commit SHA만 받는다. 비교 모드는 현재 `.changes` 파일을 base의 같은 파일과 함께 읽어 새로 추가되거나 수정된 릴리스 의도만 계산한다.

PR과 main push CI는 GitHub가 제공하는 base SHA를 사용하며 package job은 전체 history를 checkout한다. `workflow_dispatch`처럼 usable base가 없는 실행은 계약 파싱만 수행한다. mutable snapshot을 갱신하거나 승인하는 절차는 없다.

## 의도적인 변경 절차

공개 API를 추가하거나 제거한 feature PR은 계약 변화가 의도적인지 확인하고 필요한 `patch|minor|major` 조각을 추가한다. feature PR에서 `package.json`을 중복으로 올리지 않는다. 생성된 release PR이 가장 높은 pending bump를 적용하고 조각을 changelog에 합친다.

타입 이름이 유지돼도 선언 구조가 바뀌면 guard가 실패한다. 소비자 영향이 없다는 근거가 분명하다면 API를 우회하지 말고 comparator 판정 규칙을 좁히는 회귀 테스트를 먼저 추가한다.

# ZDP 디자인 시스템 구현 가이드

ZDP 프론트엔드 코드를 작성하거나 수정할 때 읽는 시작 문서다. 설치된 버전의 [공개 패키지 표면](PUBLIC_SURFACE.md)에서 import를 찾고, [소비 계약](CONSUMER_CONTRACT.md)의 컴포넌트별 문서와 공개 타입에서 props, 이벤트 인자, 슬롯을 확인한다. [동작 예제](consumer-contract/working-examples.md)는 입력 검증, 검색 선택, 표 정렬, 페이지 이동, 알림 닫기를 실제 상태에 연결한다.

## 패키지와 화면 초기화

- Svelte 5와 Tauri Svelte는 앱 진입점에서 `zdp-design-system/tokens.css`를 한 번 불러오고, 컴포넌트는 `zdp-design-system/components/Button`처럼 필요한 공개 subpath에서 가져온다. 패키지 루트의 named export는 기존 앱 호환용이다. 저장소 내부 `src/` 경로는 소비 코드에서 사용하지 않는다.
- 정적 HTML이나 전역 유틸리티에는 `zdp-design-system/styles.css`를 쓴다. 이 파일에는 토큰이 포함되어 있다. 개별 CSS로 크기를 줄일 때는 [Granular CSS](GRANULAR_CSS.md)의 의존 관계를 확인한다.
- Astro의 인터랙티브 컨트롤은 [Svelte island](consumer-contract/astro.md)에서 hydration한다. CSS class는 외형을 제공한다. 자체 HTML 경로에서는 동작을 갖춘 native 요소를 우선 사용한다. 검색형 Combobox, Menu, Popover 등을 직접 구현하는 경우 키보드·포커스·ARIA 상태를 소비 앱에서 구현하고 검증한다.
- 화면에 `.zdp-surface-reset` 범위를 설정하고, 전환된 테마를 실제 표면의 `data-zdp-theme`에 적용한다. ThemeToggle은 다음 테마를 안내하는 버튼이다. 초기값, SSR 초기 화면, 시스템 선호도와 저장은 앱이 연결한다. TextScaleControl의 선택값도 실제 읽기 영역의 글자 크기와 앱 설정에 연결한다.

## 입력과 액션

- `Field`와 실제 컨트롤에 각각 상태를 전달한다. `required`와 `disabled`는 지원하는 실제 입력에, `readonly`는 Input·Textarea처럼 이를 지원하는 컨트롤에 전달한다. `Label forId`와 입력 `id`를 연결하고 폼으로 보낼 컨트롤에는 `name`을 지정한다. 반복 화면에서는 인스턴스별 ID를 사용한다.
- 검증 오류가 표시될 때 `Field`와 실제 입력에 `invalid`를 주고, `describedBy`에 도움말·오류 ID, `errorMessageId`에 오류 ID를 연결한다. 유효 상태로 돌아오면 오류 문구와 오류 ID를 제거하고 도움말 연결을 유지한다. `invalid`는 접근성·표시 상태다. 제출 차단은 브라우저 제약 검증과 앱 검증으로 연결한다.
- 제출 버튼은 `type="submit"`을 지정한다. 일반 액션은 Button, 실제 화면 이동은 Link를 쓴다. 아이콘만 있는 버튼에는 현지화한 `ariaLabel`을 제공한다. 네트워크 액션에는 처리 중 잠금, 성공·실패 피드백을 연결한다. 확인 단계가 필요한 액션은 확인이 끝났을 때만 실행한다.
- Combobox에서 `query`는 검색어이고 `value`는 선택해 제출할 값이다. 소비 앱이 후보를 필터링하고 비동기 요청을 처리한다. 입력 직후에는 옵션 클릭 또는 방향키와 Enter로 선택을 확정한다. 현재 후보와 비동기 선택 레코드를 따로 관리할 때는 [`selectedOption` 계약](consumer-contract/svelte.md)을 확인한다.

## 상태를 실제 결과에 연결

| 요소 | 소비 앱이 연결하는 상태와 결과 |
| --- | --- |
| SortHeader / Table | `onSort`로 정렬을 바꾸고 같은 상태에서 헤더 표시, 행 순서와 정렬된 열의 `th[aria-sort]`를 갱신한다. 표에 `caption` 또는 `labelledBy`를 주고 열·행 헤더에 알맞은 `scope`를 붙인다. |
| Pagination | 버튼 방식은 `onPageChange`로 `currentPage`와 데이터 범위를 갱신한다. 링크 방식은 `hrefForPage`의 목적지 URL과 라우터에서 읽은 `currentPage`를 맞춘다. 필터가 바뀌면 유효한 페이지 범위를 다시 계산한다. |
| Tabs / SegmentedControl | `bind:selectedId` 등 공개 계약으로 선택 상태와 실제 패널·필터 결과를 연결한다. 키보드로 선택해도 동일한 결과가 표시되는지 확인한다. |
| Dialog / Sheet / Popover / Menu | 트리거와 열림 상태를 연결한다. `bind:open`을 쓰거나 컴포넌트별 닫기·열림 콜백을 반영한다. 제목·설명이 있으면 `labelledBy`·`describedBy`를 실제 ID에 연결한다. 닫기 뒤 포커스와 다음 Tab 위치를 확인한다. |
| Toast / StatusToast | `onClose`로 토스트를 숨기거나 `onDismiss`로 해당 ID를 큐에서 제거한다. 알림의 생성·타이머·중복 제거와 재시도는 앱이 처리한다. |
| LocaleSwitcher | 선택값을 메시지 카탈로그, URL, 문서의 `lang`, 저장된 선호도와 동기화한다. |

## 언어, 디자인 토큰과 자산

- 사용자가 읽거나 듣는 문자열을 모두 현지화한다. 화면 문구뿐 아니라 아이콘 액션과 오버레이 닫기, 검색 결과 없음·선택 필요, 정렬 방향, 페이지 번호와 현재 페이지, 토스트 닫기를 확인한다. 기본 영문 문자열과 컴포넌트 기본값은 공개 타입과 구현 예제에서 확인한다.
- `lang="en"` 계열의 UI는 Geist Sans → Manrope → Inter → Noto Sans KR → 시스템 폴백 순서로 적용된다. 한국어는 Noto Sans KR 우선이며 다른 언어는 [README의 언어별 폰트 계약](../README.md#토큰-원칙)을 따른다. 웹폰트는 선택형 `locale-fonts.css` 또는 자체 호스팅으로 제공한다. `brand-fonts.css`는 실제 워드마크, `expressive-fonts.css`는 지정한 제목 표현에 사용한다.
- 배경색 단계, 여백, 정렬로 영역을 구분한다. 입력·오류나 실제 구획에 필요한 경계를 사용하고, 키보드 포커스와 강제 색상 표시를 유지한다. 색상·간격·크기에는 역할에 맞는 공개 토큰을 쓴다.
- [브랜드](BRAND_ASSETS.md)와 [크레딧](CREDIT_ASSETS.md)의 공개 manifest 및 에셋 경로를 사용한다. 표시 맥락에 맞춰 크기·비율·대체 텍스트를 결정한다. 제품 헤더의 기본은 simple ship mark다. Rodisoft 회사 식별에는 `rodi-mark.svg`를 쓰며 SVG를 처리할 수 없는 환경에서만 PNG 폴백을 선택한다.

## 완료 전에 확인할 것

- 컨트롤을 누르거나 키보드로 선택한 뒤 화면과 앱 상태가 함께 바뀌는지 확인한다. 필수값 누락, 오류 수정, 결과 없음, 처리 중, 닫기·취소를 함께 확인한다.
- 실제 제품 언어의 긴 문구, 모바일 폭, 라이트·다크 테마, 포커스 이동을 [소비처 체크리스트](consumer-contract/adoption-checklist.md)에 따라 확인한다. 데이터와 라우팅, 제품 권한, 결제·동의 정책은 소비 앱의 계약에 따라 검증한다.

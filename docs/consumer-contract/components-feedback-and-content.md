# 피드백과 콘텐츠 컴포넌트 계약

Accordion과 Disclosure는 접힌 안내, 설정 묶음, FAQ형 설명의 trigger/panel/`aria-expanded`/`aria-controls` 구조만 제공하며 실제 FAQ 문구, 설정 값, 항목 노출, 권한, 데이터 fetch 판단은 소비 앱이 계속 소유한다. Accordion은 단일 또는 복수 열린 상태를 관리하지만 항목 visibility, 필터 의미, 서버 상태 판단으로 확장하지 않는다.

Accordion의 `item.open`은 초기 항목과 새로 삽입된 항목의 기본 열림 상태다. 이후 항목 metadata 변경은 사용자가 연 패널을 유지하고, 제거되거나 disabled가 된 항목만 열린 목록에서 제외한다. 완전한 외부 제어가 필요한 소비처는 `onOpenChange` receipt를 소유한 별도 controlled flow를 둔다.

Toast와 StatusToast는 저장, 동기화, 실패, 경고처럼 짧은 상태 알림 표면과 dismiss/action/live-region 연결만 제공하며 알림 발생 조건, 큐 순서, 자동 닫힘 타이머, 중복 제거, 재시도 정책, 권한, 서버 상태 판단은 소비 앱이 계속 소유한다. StatusToast의 기본 ID는 SSR과 hydration에서 안정적이며, 소비 앱이 명시적인 `idPrefix`를 전달하는 계약도 유지한다. Toast와 StatusToast는 페이지 안 피드백이나 modal decision을 대체하지 않고, 오래 읽어야 하는 안내는 Callout 또는 소비 앱의 별도 흐름으로 남긴다.
Progress, Spinner, Skeleton은 작업 진행, 응답 대기, 콘텐츠 자리 예약 표면만 제공하며 로딩 조건, 진행률 계산, 완료/실패 전환, 데이터 fetch, 재시도, 권한, 서버 상태 판단은 소비 앱이 계속 소유한다. Skeleton은 최종 레이아웃 크기를 예약하는 용도로 쓰고, 실제 텍스트 의미나 빈 상태 판단은 EmptyState 또는 소비 앱의 상태 흐름에 남긴다.

Progress의 미정 상태는 트랙 일부를 이동시켜 완료 상태와 구분한다. RTL에서는 이동 방향을 반대로 하고, `prefers-reduced-motion: reduce`에서는 가운데의 짧은 정적 막대로 표시한다. 미정 상태에는 `aria-valuenow`를 제공하지 않는다. Svelte와 Astro용 정적 CSS가 같은 표시 규칙을 따른다.

Spinner는 크기와 테마에 관계없이 일정한 속도로 회전한다. `prefers-reduced-motion: reduce`에서는 회전을 멈추며 2px 테두리, 외곽 크기와 접근성 라벨을 유지한다. Svelte와 Astro용 정적 CSS가 같은 동작을 제공한다.

AdSlot은 광고나 후원 자리의 reserved layout, accessible label, placement/state data attribute만 제공한다. `placement`는 `inline`, `banner`, `rail`, `between-sections` 같은 layout hint이고, `state`는 `pending`, `filled`, `empty`, `blocked` 같은 표시 상태다. provider markup은 slot으로 소비 앱이 넣고, provider script, consent, slot id, ads.txt, personalized ads 판단은 소비 앱이 계속 소유한다.
InlineCode와 CodeBlock은 문서, 보안, 아키텍처 페이지의 코드 표시, language label, horizontal overflow, 선택적 복사 버튼만 제공하며 syntax highlighting, 코드 실행, 비밀값 탐지, 보안 분류, command palette는 소비 앱이나 문서 파이프라인이 계속 소유한다. CodeBlock은 `code` prop이 있을 때만 복사 버튼을 노출하므로 slot으로 표시한 코드의 복사 문자열은 소비 앱이 명시적으로 넘긴다. 긴 코드는 기본적으로 horizontal overflow 표면에서 스크롤되고, code body는 선택 가능해야 한다.

EmptyState는 비어 있는 상태의 surface, 제목 연결, 액션 배치만 제공하며 비어 있는 조건, 다음 액션 가능 여부, 데이터 재시도 판단은 소비 앱이 계속 소유한다.

상위 개요와 금지 경계는 [docs/CONSUMER_CONTRACT.md](../CONSUMER_CONTRACT.md)를 따른다.

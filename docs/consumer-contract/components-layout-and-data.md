# 레이아웃과 데이터 컴포넌트 계약

Avatar와 IdentityChip은 사람, 팀, 조직의 visual identity, 이니셜, 이름, 보조 텍스트, 선택적 링크 표면만 제공하며 실제 계정 식별, 프로필 라우팅, 온라인 상태, 권한, 초대 가능 여부 판단은 소비 앱이 계속 소유한다.
Icon은 장식용 glyph 또는 짧은 보조 기호의 박스, 크기, 중앙정렬만 제공하며 의미, 라벨 문구, 상태 판단은 소비 앱이 계속 소유한다.

VisuallyHidden은 screen-reader-only 보조 텍스트 숨김만 제공하며 라벨 문구, 번역, 권한, 데이터 판단은 소비 앱이 계속 소유한다.

Page는 shared page root, surface reset, theme tone만 제공하며 라우팅, SEO, 데이터, 권한, 제품별 visibility 판단은 소비 앱이 계속 소유한다.
Container는 페이지 폭, inline padding, centered width만 제공하며 그리드 의미, 라우팅, 데이터, 권한, 제품별 visibility 판단은 소비 앱이 계속 소유한다. 페이지 최외곽 shell은 `gutter="page"` 또는 정적 `.zdp-container--padding-page`를 사용해 max-width의 auto margin이 사라지는 폭에서도 양쪽 최소 24 CSS px를 유지한다. `padding="sm"`, `padding="md"`, `padding="lg"`는 중첩 Container용으로 계속 허용한다. 페이지 shell이 더 작은 gutter를 써야 한다면 의미 class를 조용히 빼는 대신 소비 저장소의 architecture 예외와 근거를 명시해야 한다. 이 semantic class/API는 architecture linter가 page shell의 작은 gutter를 식별할 수 있는 기준이다.
Section은 block rhythm과 optional full-width band만 제공하며 카드, 라우팅, 데이터, 권한, 제품별 visibility 판단은 소비 앱이 계속 소유한다.
PageHeader는 제목, 요약, 액션 배치만 제공하며 문구, SEO heading hierarchy, 라우팅, 데이터, 권한 판단은 소비 앱이 계속 소유한다. 일반 문서와 앱 페이지 제목은 `type.pageTitleSize`와 `type.pageTitleCompactSize` 범위에서 시작하고, 브랜드 히어로나 캠페인 표면만 소비 앱의 별도 대형 제목 예외를 둘 수 있다.
Stack은 가까운 요소의 세로 흐름, gap, align만 제공하며 페이지 그리드, 라우팅, 데이터, 권한, 제품별 visibility 판단은 소비 앱이 계속 소유한다.
Inline은 가까운 버튼, 배지, 작은 링크 묶음의 가로 흐름, gap, align, justify만 제공하며 페이지 그리드, 라우팅, 데이터, 권한, 제품별 visibility 판단은 소비 앱이 계속 소유한다.
Divider는 가까운 내용 사이의 구분선, line tone, semantic separator 역할만 제공하며 section layout, page rhythm, 라우팅, 데이터, 권한, 제품별 visibility 판단은 소비 앱이 계속 소유한다.
Grid는 반복되는 카드, 요약, 선택지 묶음의 responsive columns와 gap만 제공하며 각 항목의 의미, 데이터 로딩, 권한 판단은 소비 앱이 계속 소유한다.
Toolbar는 가까운 화면 도구와 액션 묶음의 wrapping, main/action 배치만 제공하며 저장, 삭제, 필터, 권한 판단은 소비 앱이 계속 소유한다.

Table은 표 형식 정보의 native table, caption, row/column header, horizontal overflow wrapper만 제공하며 정렬, 필터, 데이터 로딩, 권한 판단은 소비 앱이 계속 소유한다. 좁은 폭에서도 header와 cell 데이터가 한 글자씩 쪼개지지 않고 table wrapper가 overflow를 소유해야 한다. Table wrapper는 header 오른쪽에 빈 gutter stripe를 만들 수 있는 상시 `scrollbar-gutter: stable`을 기본값으로 쓰지 않는다.
SortHeader와 TableToolbar는 sortable column affordance, 선택 행 액션 자리, 밀도 전환 표면만 제공하며 `aria-sort`, 실제 정렬 계산, 선택 상태, 필터, 권한, 데이터 로딩 판단은 소비 앱이 계속 소유한다. `aria-sort`는 SortHeader 버튼이 아니라 owning `th` 또는 columnheader에 둔다.

KeyValue는 용어와 값의 description list 구조와 responsive columns만 제공하며 실제 원장, 보안, 결제, 권한 판단은 소비 앱이 계속 소유한다.

상위 개요와 금지 경계는 [docs/CONSUMER_CONTRACT.md](../CONSUMER_CONTRACT.md)를 따른다.

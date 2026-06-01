# zdp-design-system

ZDP의 디자인 토큰, CSS, 아이콘, Svelte UI 컴포넌트 경계를 고정하는 저장소다.

초기 목적은 `zdp-web-public`, `zdp-web-apps`, 제품 실험, 게임 소개 화면이 각자 다른 시각 언어를 만들지 않게 막는 것이다.

## 현재 범위

- 색상, 간격, 타이포그래피, radius, elevation 같은 디자인 토큰
- 공통 CSS reset과 theme contract
- Svelte UI 컴포넌트 public surface
- 아이콘 사용 기준과 접근성 기본 규칙
- Storybook 또는 동등한 컴포넌트 검토 표면

## 현재 제외

- 제품별 화면 구성
- 랜딩 페이지 문구
- 결제, 권한, 인증, 관리자 의사결정
- 앱 라우팅, API 호출, 데이터 저장
- 브랜드별 캠페인 실험

## 운영 문서

- `service.yaml`
- `AGENTS.md`
- `CONTRIBUTING.md`
- `CHANGELOG.md`

## 검증

아직 구현체 검증은 붙이지 않았다. 토큰과 컴포넌트가 들어오면 `tokens:check`, 접근성 검사, 패키지 export 검증을 먼저 추가한다.


# Contributing

## 변경 원칙

- 토큰 변경은 소비 저장소의 시각적 회귀 비용을 함께 생각한다.
- 컴포넌트 API는 제품 도메인 단어보다 UI 역할을 기준으로 둔다.
- 접근성 기본값을 낮추는 변경은 금지한다.

## 검증 기준

- 토큰 이름이 특정 제품이나 캠페인에 묶이지 않는다.
- 색상 토큰은 `hex` fallback과 `oklch` 값을 함께 추가하거나 함께 변경한다.
- sans/display 폰트 스택은 `"Pretendard Variable", Pretendard`를 우선하고, CSS는 Pretendard Variable dynamic subset 로드를 유지한다.
- `font.family.latin`, `font.family.korean`, `font.family.chinese`, `font.family.devanagari`, `font.family.multiscript`는 `:lang()` CSS 계약과 함께 변경한다.
- 선택형 `locale-fonts.css` public export를 바꾸면 `package.json` export, sideEffects, README, token/preview/storybook check를 함께 맞춘다.
- 소비 저장소 적용 방식은 `docs/CONSUMER_CONTRACT.md`와 함께 변경한다.
- Astro, Svelte, Tauri, Flutter 소비처는 public export만 사용하게 하고 내부 `src/` deep import를 문서나 예제로 만들지 않는다.
- 새 디자인 시스템 버전은 대표 소비처에서 build와 시각 QA를 확인한 뒤 broad adoption한다.
- `success`, `warning`, `danger` 상태 색은 각각 긍정/완료, 주의/보류, 삭제/오류/위험 의미로 유지한다.
- `focus.surface`, `focus.text`, `focus.line`은 keyboard focus 전용 기능 색으로 유지하고 일반 hover, 브랜드 장식, 상태 색으로 재사용하지 않는다.
- 카드, 버튼, 아이콘 버튼, preview 패널은 그림자와 그라데이션 없이 surface 색상, framed border, typography, spacing으로만 위계를 만든다.
- 버튼 hover는 빛 반사, 위치 이동, 커지는 그림자를 쓰지 않고 색상과 border 상태만 바꾼다.
- 버튼과 아이콘 버튼 hover는 light/dark 모두 배경색과 border 색을 함께 바꾼다.
- 버튼 active와 focus-visible도 같은 원칙을 따른다. active는 색과 border만 바꾸고, focus-visible은 `focus.surface` outline과 `focus.line` border로 표시한다.
- 버튼 라벨은 bold 계열을 쓰지 않고 `medium` weight를 쓴다.
- 공유 컴포넌트 radius는 `0.375rem`을 기준으로 보고 pill 형태를 기본값으로 쓰지 않는다.
- 공유 Button과 IconButton border width는 `2px`를 기준으로 유지한다.
- 링크 focus는 sunlit gold 배경과 어두운 하단선, 입력류 focus는 sunlit gold outline과 어두운 border가 함께 보여야 한다.
- Field, Label, Input, Textarea, Select, HelpText, ErrorText는 form public surface로 유지하고 help/error/id/aria 연결을 끊지 않는다.
- 입력류 hover, focus, invalid, disabled 상태는 light/dark 모두 같은 토큰 계열로 움직이며 그림자나 이동 효과를 쓰지 않는다.
- Checkbox, Radio, Switch는 native input을 유지하고 label, checked, focus-visible, disabled 상태가 키보드와 스크린리더에서 끊기지 않게 한다.
- 선택 컨트롤도 framed border와 surface 색상만 사용하며 hover 장식, 그림자, 그라데이션, pill switch를 기본값으로 만들지 않는다.
- Badge와 Callout은 상태 전달용 표면이며 제품 판단, 권한, 결제, 보안 결정을 직접 수행하지 않는다.
- Badge와 Callout도 그림자, 그라데이션, 반짝임 없이 surface, border, semantic accent 색상으로만 위계를 만든다.
- Tabs는 페이지 안의 가까운 정보 묶음 전환에만 사용하고 라우팅, 권한, 데이터 로딩 판단을 직접 수행하지 않는다.
- Tabs는 `tablist`, `tab`, `tabpanel`, roving tabindex, focus-visible 상태를 유지한다.
- Dialog는 `role="dialog"`, `aria-modal`, `aria-labelledby`, 선택적 `aria-describedby`, Escape 닫기, backdrop 닫기, focus trap, focus-visible 상태를 유지한다.
- Dialog는 저장, 삭제, 인증, 결제, 권한 판단을 직접 수행하지 않고 소비 앱의 확인 흐름을 담는 레이어 표면으로만 둔다.
- 본문 텍스트 line-height는 `1.6`을 기준으로 하며, compact control line-height와 섞지 않는다.
- 작은 본문, 캡션, 데이터 숫자 표시는 `bodySmall`, `caption`, `data` 타입 토큰을 우선 사용한다.
- 컴포넌트가 인증, 결제, 권한 판단을 직접 수행하지 않는다.
- 시각 변경은 Storybook의 `Design System/Overview`와 `preview/index.html`에서 light/dark 상태를 확인한다.
- Workduck 개발 서버와 빌드 액션이 깨지지 않도록 `dev`와 `build` 스크립트를 유지한다.
- 패키지 export가 안정된 뒤에는 변경 내역을 `CHANGELOG.md`에 남긴다.
- 토큰 JSON, CSS 변수, public export, Svelte 컴포넌트, Storybook, preview 변경 뒤에는 `bun run check`를 실행한다.

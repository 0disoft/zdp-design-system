# Flutter와 Native 소비 표면

Flutter와 native shell은 Svelte 컴포넌트를 직접 소비하지 않는다.
대신 `tokens/zdp.tokens.json`을 theme adapter 입력으로 사용한다.

- `hex`는 기본 theme fallback이다.
- `oklch`는 웹 또는 변환 가능한 렌더러에서 색 의도값으로 사용한다.
- `font.family.korean`, `font.family.latin`, `font.family.chinese`, `font.family.devanagari`, `font.family.japanese`, `font.family.thai`, `font.family.multiscript`는 locale별 fallback 순서의 source of truth다.
- `font.family.brand`는 브랜드 워드마크 전용 source of truth다. 일반 heading의 `font.family.display`와 섞지 않는다.
- `font.family.expressionScript`, `font.family.expressionInscription`, `font.family.expressionSketch`, `font.family.expressionEditorial`, `font.family.expressionSans`, `font.family.expressionKeyboard`는 opt-in 표현용 source of truth다. `expressive-fonts.css`를 import한 표면에서만 캠페인, 섹션 제목, 짧은 보조 안내, 키보드 표식에 제한해서 쓴다.
- `control.heightMd`, `control.glyphMd`, `control.choiceSize`, `control.choiceIndicatorSize`, `control.switchWidth`, `control.switchHeight`, `control.scrollbarSize`, `control.radius`, `control.borderWidth`, `control.hitTarget`은 native control size, icon glyph size, choice mark, switch track, scrollbar 두께를 맞출 때의 기준이다.
- `layer.*`는 skip link, floating overlay, toast, sheet, dialog처럼 겹침 순서가 필요한 surface의 기준이고, 소비처는 raw z-index 숫자를 직접 쌓지 않는다.
- `viewport.*`는 overlay panel clamp, safe-area inset, mobile viewport fallback의 기준이고, 소비처는 modal/sheet/dropdown에 raw `100vh`/`100vw`를 직접 쓰지 않는다.
- 소비처 fixture와 public example은 raw color literal, raw `px`, raw z-index number, raw `100vh`/`100vw`를 쓰지 않는다. `fixtures:check`는 이 위반을 shared token adoption drift로 본다.
- `color.scrollbar.track`, `color.scrollbar.thumb`, `color.scrollbar.thumbHover`는 overflow 영역의 light/dark scrollbar 색 기준이다.
- `color.selection.surface`, `color.selection.text`는 `.zdp-surface-reset` 안의 drag text selection 색 기준이다.
- `focus.surface`, `focus.text`, `focus.line`은 keyboard focus 또는 TV/desktop focus affordance의 기준색이다.
- `.zdp-user-select-control`, `.zdp-user-select-decorative`, `.zdp-user-select-dragging`은 token이 아니라 interaction utility다. 조작 부품, 장식 표면, 실제 드래그 중 상태에만 쓰고 읽는 정보의 기본 선택 가능성을 덮지 않는다.


상위 개요와 금지 경계는 [docs/CONSUMER_CONTRACT.md](../CONSUMER_CONTRACT.md)를 따른다.

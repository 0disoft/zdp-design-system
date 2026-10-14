# 입력과 액션 컴포넌트 계약

Button과 IconButton은 native button 위의 control 표면이며 `onclick`, `ariaLabel`, `ariaControls`, `ariaExpanded`, `ariaPressed`, `ariaDescribedBy`, `ariaKeyShortcuts` 같은 액션 연결 props를 전달한다. 저장, 삭제, 권한, 결제 판단은 소비 앱이 계속 소유한다.

Button의 md·sm 높이와 모서리는 입력 컴포넌트와 같은 control 토큰을 따른다. 좌우 padding은 md 12 CSS px, sm 8 CSS px이며 text variant는 기존 텍스트 액션 간격을 유지한다. Menu, Select, Combobox, Disclosure·Accordion의 펼침 표시는 같은 20 CSS px SVG와 inline-end 12 CSS px 여백을 공유한다. Disclosure·Accordion은 열린 상태에서 화살표를 위로 돌린다.

Primary·secondary·danger Button과 solid IconButton은 채워진 또는 tonal surface로 우선순위를 구분하고, ghost IconButton은 hover/active에서만 surface를 드러낸다. 기본 상태의 시각적 border는 사용하지 않지만 크기 안정성을 위한 투명 border slot과 keyboard focus outline, Windows forced-colors의 system border는 유지한다.

`Button variant="text"`와 framework-neutral `.zdp-button--text`는 콘텐츠·마케팅 화면의 경계 없는 텍스트 액션에 사용한다. 기본·hover·focus 상태는 배경 상자 대신 하단 선으로 구분하고, hover와 focus에서는 밝고 어두운 표면 모두에서 선 두께가 분명히 바뀌어야 하며, 최소 hit target은 그대로 유지한다. 실제 페이지 이동은 `<a class="zdp-button zdp-button--text zdp-button--md">`처럼 링크 의미를 유지하며, 폼 제출이나 상태 변경은 Svelte Button을 사용한다. 이 variant를 모든 버튼의 기본값으로 바꾸거나 파괴적·결제 확인 작업에 사용하지 않는다.

Button의 `loading` prop은 `boolean | undefined`이고 기본값은 `undefined`다. 생략하면 기존 버튼 크기를 유지한다. `loading={false}`는 `.zdp-button__spinner` 자리를 미리 확보하고, `true`는 같은 자리에서 spinner를 표시하므로 문구와 버튼 크기가 바뀌지 않는다. 처리 중에는 `native disabled`, `aria-disabled`, `aria-busy="true"`로 클릭·키보드 재실행과 submit·reset을 막는다. 같은 JavaScript task 안의 연속 클릭도 차단하며 첫 클릭의 기본 동작은 유지한다. 처리 중에는 투명도 1과 `progress` 커서를 쓰고, 명시적으로 `disabled`도 전달했으면 기존 비활성 표현을 유지한다. `prefers-reduced-motion: reduce`에서는 spinner 회전만 멈춘다. 요청 시작·완료와 오류 처리, 상태 안내 문구는 소비 앱이 소유한다.

Astro 등 framework-neutral markup은 `<button class="zdp-button zdp-button--primary zdp-button--md" data-loading="true" disabled aria-disabled="true" aria-busy="true">` 안에서 문구 앞에 `<span class="zdp-button__spinner" aria-hidden="true"></span>`를 둔다. 대기 상태는 `data-loading="false"`로 바꾸고 native `disabled`와 `aria-busy`를 해제하며 `aria-disabled="false"`로 갱신한다. 별도로 비활성화한 버튼은 `data-disabled="true"`로 구분한다. CSS는 모양만 제공하므로 상태 속성 갱신과 동작 차단은 소비 앱에서 함께 처리한다.

IconButton의 `loading`도 `boolean | undefined`이고 기본값은 `undefined`다. 명시적으로 전달하면 같은 JavaScript task 안의 연속 클릭도 차단한다. `true`일 때 원본 glyph를 숨기고 같은 자리에서 2 CSS px spinner를 표시하며, `false`일 때 spinner를 숨기고 아이콘을 복원한다. 정사각 크기와 원본 `ariaLabel`·`title`은 유지한다. 처리 중에는 native `disabled`, `aria-disabled`, `aria-busy="true"`, `data-loading="true"`를 노출하고, 대기 중에는 `data-loading`을 생략한다. 처리 중 투명도는 1, 커서는 `progress`이며 별도로 `disabled`도 전달하면 `data-disabled="true"`와 기존 비활성 표현을 유지한다. `prefers-reduced-motion: reduce`에서는 1초 주기의 회전만 멈춘다. 요청 시작·완료·오류 처리와 상태 안내는 소비 앱이 소유한다.

Framework-neutral markup은 `<button class="zdp-icon-button zdp-icon-button--solid zdp-icon-button--md" data-loading="true" disabled aria-disabled="true" aria-busy="true">` 안에 아이콘을 담은 `<span class="zdp-icon zdp-icon--md zdp-icon-button__glyph" aria-hidden="true">`와 `<span class="zdp-icon zdp-icon--md zdp-icon-button__spinner" aria-hidden="true"></span>`를 둔다. `sm`은 세 요소의 크기 클래스를 모두 `--sm`으로 맞춘다. 완료하면 `data-loading`·`disabled`·`aria-busy`를 제거하고 `aria-disabled="false"`로 갱신한다. CSS는 모양만 제공하므로 상태 갱신과 동작 차단은 소비 앱에서 함께 처리한다.

ConfirmAction은 중요한 액션을 밀기 또는 길게 누르기로 확인하는 표면이며 `onconfirm` 콜백만 전달한다. resting/hover/active/confirmed 상태는 outer border가 아니라 tonal surface, 진행 fill, thumb 색으로 구분하고 keyboard focus와 forced-colors에서만 의미 경계를 복원한다. 결제, 삭제, 권한, 환불 판단과 서버 요청은 소비 앱이 계속 소유한다.

CommandField는 검색 입력의 label, frame, focus-within, shortcut keycap, help/error id, `ariaKeyShortcuts`, `ariaAutocomplete`, result id 연결, 입력 keydown callback만 제공하며 검색 인덱스, 결과 정렬, command palette, 라우팅, 권한 판단은 소비 앱이 계속 소유한다. `ariaAutocomplete`, `ariaControls`, `ariaExpanded`, `ariaActivedescendant` 중 하나를 전달하면 입력은 `combobox` 역할과 기본 `aria-expanded="false"`를 함께 노출한다. 결과 목록, keyboard dispatcher, command 실행 상태는 소비 앱이 계속 소유한다.
Combobox는 검색 가능한 단일 선택의 label, input frame, listbox, active option, disabled option skip, hidden submitted value만 제공한다. 사용자가 query를 직접 편집하기 전에는 초기 `value`와 비동기로 도착하거나 label이 바뀐 option을 표시 query에 동기화한다. 사용자가 선택 label을 편집하면 hidden submitted value를 즉시 비우고 `onValueChange('', null)`을 호출한다. `required`는 임의 입력 문자열이 아니라 실제 option 선택을 검증하며 기본 문구는 `selectionRequiredText`로 바꿀 수 있다. IME 조합 중 Enter와 방향키는 선택이나 이동으로 처리하지 않는다. focus가 root 밖으로 나가거나 root 어디서든 Escape를 누르면 listbox를 닫고, 열린 상태에서 `disabled` 또는 `readonly`로 전환돼도 listbox와 dismiss layer를 즉시 닫는다. 목록 위치 계산은 내부 Floating UI DOM adapter가 담당하며 입력창 폭과 가용 높이에 맞춰 위·아래 배치를 보정한다. 창 크기와 스크롤 변경을 추적하고 닫힘·unmount 때 listener와 observer를 정리한다. 자동 portal을 쓰지 않고 기존 DOM을 유지한다. keyboard active option은 페이지를 움직이지 않고 panel의 보이는 영역으로 스크롤한다. 기본 input/listbox/option ID는 SSR과 hydration에서 안정적이며, 소비 앱이 명시적인 `id`를 전달하는 계약도 유지한다. light DOM과 stylesheet가 설치된 open shadow root에서 composed click path를 기준으로 자체 input/toggle/option 입력과 실제 outside click을 구분한다. 실제 필터링, async search, command 실행, 권한 판단은 소비 앱이 계속 소유한다. 단순 상태 선택은 native `Select`를 유지한다. `appearance: base-select`를 지원하는 브라우저에서는 picker surface, option 사이의 2 CSS px 간격과 각 option 안쪽의 2 CSS px inset, 선택 checkmark의 논리 inline-start 4 CSS px 여백, hover와 selected option, 공통 화살표가 ZDP theme token과 spacing 계약을 따른다. 닫힌 Select와 Combobox는 같은 SVG, 20 CSS px 크기와 inline-end 12 CSS px 여백을 사용하며 브라우저 기본 picker icon은 숨긴다. 지원하지 않거나 forced-colors가 활성화된 환경에서는 native 동작과 사용자 색상 강제를 유지한다. 사용자가 입력으로 후보를 좁히는 단일 선택일 때만 Combobox를 쓴다.

Radio group은 부모의 단일 `string | null` 값을 각 Radio의 `selectedValue`에 bind한다. DOM checked 상태는 `selectedValue === value`로 계산되고 선택 변경이 같은 부모 값으로 전파된다. 개별 `checked` prop은 두 상태 정본을 만들기 때문에 제공하지 않는다.

Radio의 `invalid`는 개별 선택지의 오류 스타일을 표시한다. 오류 상태는 소비 앱의 `radiogroup`에 `aria-invalid`로 전달하고, 오류 문구는 그룹과 각 Radio의 `describedBy`에 연결한다. 개별 `radio`의 `aria-invalid`와 `aria-errormessage`는 WAI-ARIA 1.2에서 deprecated되었으므로 사용하지 않는다. [WAI-ARIA radio와 radiogroup](https://www.w3.org/TR/wai-aria-1.2/#radio)

```svelte
<div role="radiogroup" aria-label="선택" aria-invalid={invalid ? 'true' : undefined}
  aria-describedby={invalid ? 'selection-error' : undefined}>
  <Radio name="selection" value="a" bind:selectedValue {invalid}
    describedBy={invalid ? 'selection-error' : null}>옵션 A</Radio>
  <Radio name="selection" value="b" bind:selectedValue {invalid}
    describedBy={invalid ? 'selection-error' : null}>옵션 B</Radio>
</div>
{#if invalid}
  <ErrorText id="selection-error">옵션을 선택해 주세요.</ErrorText>
{/if}
```

Kbd와 ShortcutHint는 `/`, `?`, `Enter`, `Esc`, `ArrowUp`, `ArrowDown`, `Ctrl/⌘+Enter` 같은 키캡 힌트만 제공한다. 실제 keydown dispatcher, command palette, 검색 focus 이동, 단축키 안내, 선택, 닫기, 파일 이동은 소비 앱이 소유한다. `ariaKeyShortcuts`와 `aria-keyshortcuts`는 실제 단축키가 동작하는 Button, IconButton, Link, CommandField에만 붙인다. 소비 앱의 전역 단축키 dispatcher는 `shouldZdpIgnoreShortcutEvent`, `isZdpTextEntryTarget`, `isZdpBrowserReservedShortcut`, `zdpShortcutRecommendations`, `zdpShortcutReservedExamples` 같은 shortcut policy helper로 입력창, IME 조합, 브라우저 예약 조합을 먼저 걸러낸다. `input, textarea, select, contenteditable`, `role="textbox"`, `role="searchbox"` 안에서는 전역 단축키를 꺼두고, `event.isComposing` 또는 `keyCode === 229`인 한국어 조합 입력도 무시한다. `Ctrl+K`, `Ctrl+S`처럼 Chrome과 브라우저가 기본 동작으로 가져가는 조합은 소비 앱에서 실제로 가로채고 검증한 경우가 아니면 예시나 UI 힌트로 보여주지 않는다.

Input, Textarea, Select는 `describedBy`에 하나 이상의 id를 연결할 수 있고 invalid 상태에서는 `errorMessageId`로 `aria-errormessage`를 연결한다. Input, Textarea, Select, Combobox, CommandField는 panel 배경, subtle 테두리, control 글자 크기·줄높이·모서리 토큰을 공유한다. 단일 행 기본 높이는 44 CSS px이며 sm을 지원하는 컴포넌트는 36 CSS px이다. focus는 같은 outline을 사용하고 invalid 상태는 danger 테두리와 `aria-invalid`, `aria-errormessage`, 연결된 ErrorText로 전달한다. readonly 표면과 disabled 투명도는 입력 가능 상태와 구분한다. Framework-neutral Select도 `.zdp-select-shell` 안에 native select와 `.zdp-select__arrow` 요소를 함께 배치한다. 에러 메시지 문구, 검증 조건, 제출 차단 여부는 소비 앱이 결정한다.
Switch도 `describedBy` id 배열과 `errorMessageId`를 통해 invalid 상태의 보조 설명과 에러 메시지를 native switch input에 연결한다.
Input과 Textarea의 `readonly` 상태는 제출과 포커스를 유지하는 읽기 전용 값에 사용한다. 권한 때문에 값을 바꾸면 안 되는지, 단순히 고정 식별자를 보여주는지는 소비 앱이 결정한다. Input은 문자열 `value`가 소유하는 text·search·email·password·url·tel·number·date·time·datetime-local·month·week만 허용한다. checked 상태는 Checkbox·Radio, FileList는 native file input, hidden form transport는 native hidden input이 각각 소유한다. CommandField의 type은 search 또는 text만 허용한다.

상위 개요와 금지 경계는 [docs/CONSUMER_CONTRACT.md](../CONSUMER_CONTRACT.md)를 따른다.

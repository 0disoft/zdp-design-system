# Svelte 소비 표면

Native form controls restore the values and checked states captured when mounted. After an uncancelled reset, their bindings synchronize with the browser's restored defaults on the next task. This also applies to externally associated Input/Textarea controls and to hydrated controls. Reset does not invoke input/change callbacks. Cancelled resets preserve the current values.

Reset listeners follow changes to the owning form and DOM root at the mutation-observer checkpoint. When imperatively moving individual controls into a different form, allow that checkpoint before resetting the new form. Moving an entire form retains its listener and supports a reset in the same turn.

Combobox `options` describes the current search candidates. A known selection remains valid when filtering removes it from the candidate list. For asynchronous search, pass `selectedOption` separately: a matching option object provides authoritative label and disabled metadata, while `null` invalidates the selected option. Omitting the prop uses current candidates and the last known selection. Unknown, empty, or explicitly disabled selections fail `required` validation. To remove a selection from submitted data, clear `value` as well.

```svelte
<Combobox
  options={searchResults}
  selectedOption={selectedRecord}
  bind:value={selectedValue}
  bind:query={searchQuery}
  required
/>
```

Input supports native `min`, `max`, `step`, `pattern`, `minlength`, and `maxlength` constraints. Input and Textarea both accept `form`, `inputmode`, `enterkeyhint`, `ariaLabel`, and `oninput`/`onchange`/`onfocus`/`onblur`/`onkeydown` callbacks. `oninput` receives the original DOM event after the component updates its bound string value; browser constraint validation and associated-form submission keep their native behavior.

Svelte 앱과 Svelte island는 token-only CSS와 필요한 컴포넌트 subpath를 직접 불러온다.

```ts
import 'zdp-design-system/tokens.css';
import Button from 'zdp-design-system/components/Button';
import Dialog from 'zdp-design-system/components/Dialog';
```

각 `.svelte` 파일이 자신의 scoped CSS를 포함하므로 같은 앱에서 `styles.css`까지 함께 import하지 않는다. 전역 utility class나 framework-neutral DOM controller를 함께 쓰는 화면만 `styles.css`를 선택하고, 그 경우 `tokens.css`를 별도로 중복 import하지 않는다. 기존 `import { Button } from 'zdp-design-system'` root named export는 호환용이지만 새 코드와 template의 기본 경로는 아니다.

상위 개요와 금지 경계는 [docs/CONSUMER_CONTRACT.md](../CONSUMER_CONTRACT.md)를 따른다.

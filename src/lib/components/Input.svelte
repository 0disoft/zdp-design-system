<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { ZdpInputType } from '../input.js';
  import { syncZdpFormReset } from '../form-reset.js';

  type DescribedBy = string | readonly string[] | null;

  interface Props {
    id?: string | null;
    name?: string | null;
    type?: ZdpInputType;
    value?: string;
    placeholder?: string | null;
    autocomplete?: HTMLInputAttributes['autocomplete'] | null;
    form?: string | null;
    min?: HTMLInputAttributes['min'] | null;
    max?: HTMLInputAttributes['max'] | null;
    step?: HTMLInputAttributes['step'] | null;
    minlength?: number | null;
    maxlength?: number | null;
    pattern?: string | null;
    inputmode?: HTMLInputAttributes['inputmode'] | null;
    enterkeyhint?: HTMLInputAttributes['enterkeyhint'] | null;
    ariaLabel?: string | null;
    oninput?: ((event: Event) => void) | null;
    onchange?: ((event: Event) => void) | null;
    onfocus?: ((event: FocusEvent) => void) | null;
    onblur?: ((event: FocusEvent) => void) | null;
    onkeydown?: ((event: KeyboardEvent) => void) | null;
    describedBy?: DescribedBy;
    errorMessageId?: string | null;
    invalid?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
  }

  let {
    id = $bindable(null),
    name = $bindable(null),
    type = $bindable('text'),
    value = $bindable(''),
    placeholder = $bindable(null),
    autocomplete = $bindable(null),
    form = $bindable(null),
    min = $bindable(null),
    max = $bindable(null),
    step = $bindable(null),
    minlength = $bindable(null),
    maxlength = $bindable(null),
    pattern = $bindable(null),
    inputmode = $bindable(null),
    enterkeyhint = $bindable(null),
    ariaLabel = $bindable(null),
    oninput = $bindable(null),
    onchange = $bindable(null),
    onfocus = $bindable(null),
    onblur = $bindable(null),
    onkeydown = $bindable(null),
    describedBy = $bindable(null),
    errorMessageId = $bindable(null),
    invalid = $bindable(false),
    disabled = $bindable(false),
    readonly = $bindable(false),
    required = $bindable(false)
  }: Props = $props();

  function handleInput(event: Event): void {
    value = (event.currentTarget as HTMLInputElement).value;
    oninput?.(event);
  }

  function normalizeIdRefs(value: DescribedBy): string | null {
    if (value === null) {
      return null;
    }

    if (typeof value === 'string') {
      const normalized = value.trim();
      return normalized ? normalized : null;
    }

    const normalized = value.map((entry) => entry.trim()).filter(Boolean);
    return normalized.length > 0 ? normalized.join(' ') : null;
  }
  let ariaDescribedBy = $derived(normalizeIdRefs(describedBy));
  let resolvedErrorMessageId = $derived(invalid && errorMessageId ? errorMessageId : null);
</script>

<input
  class="zdp-input"
  id={id ?? undefined}
  name={name ?? undefined}
  {type}
  {value}
  placeholder={placeholder ?? undefined}
  autocomplete={autocomplete ?? undefined}
  form={form ?? undefined}
  min={min ?? undefined}
  max={max ?? undefined}
  step={step ?? undefined}
  minlength={minlength ?? undefined}
  maxlength={maxlength ?? undefined}
  pattern={pattern ?? undefined}
  inputmode={inputmode ?? undefined}
  enterkeyhint={enterkeyhint ?? undefined}
  aria-label={ariaLabel ?? undefined}
  aria-describedby={ariaDescribedBy ?? undefined}
  aria-errormessage={resolvedErrorMessageId ?? undefined}
  aria-invalid={invalid ? 'true' : undefined}
  {disabled}
  readonly={readonly}
  {required}
  oninput={handleInput}
  onchange={onchange ?? undefined}
  onfocus={onfocus ?? undefined}
  onblur={onblur ?? undefined}
  onkeydown={onkeydown ?? undefined}
  use:syncZdpFormReset={{ initialValue: value, onReset: (input) => { value = input.value; } }}
/>

<style>
  .zdp-input {
    background: var(--zdp-control-field-surface);
    border: var(--zdp-control-border-width) solid var(--zdp-control-field-border);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-control-size);
    line-height: var(--zdp-type-control-line-height);
    min-height: var(--zdp-control-height-md);
    padding: 0 var(--zdp-control-padding-md);
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    width: 100%;
  }

  .zdp-input::placeholder {
    color: var(--zdp-color-ink-muted);
  }

  .zdp-input::-webkit-search-cancel-button {
    display: none !important;
  }

  .zdp-input::-webkit-calendar-picker-indicator {
    display: none !important;
  }

  .zdp-input::-webkit-inner-spin-button,
  .zdp-input::-webkit-outer-spin-button {
    appearance: none;
  }

  .zdp-input:-webkit-autofill,
  .zdp-input:-webkit-autofill:hover,
  .zdp-input:-webkit-autofill:focus {
    -webkit-text-fill-color: var(--zdp-color-ink-strong);
    caret-color: var(--zdp-color-ink-strong);
    transition: background-color 9999s ease-out;
  }

  .zdp-input:where(:hover:not(:disabled)) {
    background: var(--zdp-control-field-surface-hover);
    border-color: var(--zdp-control-field-border-hover);
  }

  .zdp-input:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-input[aria-invalid="true"] {
    border-color: var(--zdp-color-accent-danger);
  }

  .zdp-input[readonly] {
    background: var(--zdp-color-surface-raised);
    color: var(--zdp-color-ink-normal);
  }

  .zdp-input[readonly]:hover {
    background: var(--zdp-color-surface-raised);
  }

  .zdp-input:disabled {
    cursor: not-allowed;
    opacity: var(--zdp-control-disabled-opacity);
  }
</style>

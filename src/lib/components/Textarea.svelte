<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements';
  import { syncZdpFormReset } from '../form-reset.js';

  type DescribedBy = string | readonly string[] | null;

  interface Props {
    id?: string | null;
    name?: string | null;
    value?: string;
    placeholder?: string | null;
    autocomplete?: HTMLTextareaAttributes['autocomplete'] | null;
    form?: string | null;
    minlength?: number | null;
    maxlength?: number | null;
    inputmode?: HTMLTextareaAttributes['inputmode'] | null;
    enterkeyhint?: HTMLTextareaAttributes['enterkeyhint'] | null;
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
    rows?: number;
  }

  let {
    id = $bindable(null),
    name = $bindable(null),
    value = $bindable(''),
    placeholder = $bindable(null),
    autocomplete = $bindable(null),
    form = $bindable(null),
    minlength = $bindable(null),
    maxlength = $bindable(null),
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
    required = $bindable(false),
    rows = $bindable(4)
  }: Props = $props();

  function handleInput(event: Event): void {
    value = (event.currentTarget as HTMLTextAreaElement).value;
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

<textarea
  class="zdp-textarea"
  id={id ?? undefined}
  name={name ?? undefined}
  {value}
  placeholder={placeholder ?? undefined}
  autocomplete={autocomplete ?? undefined}
  form={form ?? undefined}
  minlength={minlength ?? undefined}
  maxlength={maxlength ?? undefined}
  inputmode={inputmode ?? undefined}
  enterkeyhint={enterkeyhint ?? undefined}
  aria-label={ariaLabel ?? undefined}
  aria-describedby={ariaDescribedBy ?? undefined}
  aria-errormessage={resolvedErrorMessageId ?? undefined}
  aria-invalid={invalid ? 'true' : undefined}
  {disabled}
  readonly={readonly}
  {required}
  {rows}
  oninput={handleInput}
  onchange={onchange ?? undefined}
  onfocus={onfocus ?? undefined}
  onblur={onblur ?? undefined}
  onkeydown={onkeydown ?? undefined}
  use:syncZdpFormReset={{ initialValue: value, onReset: (textarea) => { value = textarea.value; } }}
></textarea>

<style>
  .zdp-textarea {
    background: var(--zdp-control-field-surface);
    border: var(--zdp-control-border-width) solid var(--zdp-control-field-border);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-control-size);
    line-height: var(--zdp-type-control-line-height);
    min-height: 7rem;
    padding: var(--zdp-control-padding-md);
    resize: vertical;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    width: 100%;
  }

  .zdp-textarea::placeholder {
    color: var(--zdp-color-ink-muted);
  }

  .zdp-textarea:where(:hover:not(:disabled)) {
    background: var(--zdp-control-field-surface-hover);
    border-color: var(--zdp-control-field-border-hover);
  }

  .zdp-textarea:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-textarea[aria-invalid="true"] {
    border-color: var(--zdp-color-accent-danger);
  }

  .zdp-textarea[readonly] {
    background: var(--zdp-color-surface-raised);
    color: var(--zdp-color-ink-normal);
  }

  .zdp-textarea[readonly]:hover {
    background: var(--zdp-color-surface-raised);
  }

  .zdp-textarea:disabled {
    cursor: not-allowed;
    opacity: var(--zdp-control-disabled-opacity);
  }
</style>

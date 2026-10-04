<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { ZdpCommandFieldSize, ZdpCommandFieldType } from '../command';
  import ShortcutHint from './ShortcutHint.svelte';
  import { syncZdpFormReset } from '../form-reset';

  type DescribedBy = string | readonly string[] | null;
  type AriaAutocomplete = 'none' | 'inline' | 'list' | 'both';

  interface Props {
    id?: string | null;
    name?: string | null;
    value?: string;
    type?: ZdpCommandFieldType;
    label?: string | null;
    labelVisible?: boolean;
    ariaLabel?: string | null;
    placeholder?: string | null;
    autocomplete?: HTMLInputAttributes['autocomplete'] | null;
    describedBy?: DescribedBy;
    errorMessageId?: string | null;
    invalid?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    size?: ZdpCommandFieldSize;
    shortcutKeys?: readonly string[];
    ariaKeyShortcuts?: string | null;
    ariaAutocomplete?: AriaAutocomplete | null;
    ariaControls?: string | null;
    ariaExpanded?: boolean | null;
    ariaActivedescendant?: string | null;
    inputmode?: HTMLInputAttributes['inputmode'] | null;
    enterkeyhint?: HTMLInputAttributes['enterkeyhint'] | null;
    clearLabel?: string | null;
    oninput?: ((event: Event) => void) | null;
    onfocus?: ((event: FocusEvent) => void) | null;
    onblur?: ((event: FocusEvent) => void) | null;
    onkeydown?: ((event: KeyboardEvent) => void) | null;
  }

  const componentId = $props.id();
  let {
    id = $bindable(null),
    name = $bindable(null),
    value = $bindable(''),
    type = $bindable('search'),
    label = $bindable('Search'),
    labelVisible = $bindable(false),
    ariaLabel = $bindable(null),
    placeholder = $bindable('Search query'),
    autocomplete = $bindable('off'),
    describedBy = $bindable(null),
    errorMessageId = $bindable(null),
    invalid = $bindable(false),
    disabled = $bindable(false),
    readonly = $bindable(false),
    required = $bindable(false),
    size = $bindable('md'),
    shortcutKeys = $bindable(['/']),
    ariaKeyShortcuts = $bindable(null),
    ariaAutocomplete = $bindable(null),
    ariaControls = $bindable(null),
    ariaExpanded = $bindable(null),
    ariaActivedescendant = $bindable(null),
    inputmode = $bindable(null),
    enterkeyhint = $bindable(null),
    clearLabel = $bindable(null),
    oninput = $bindable(null),
    onfocus = $bindable(null),
    onblur = $bindable(null),
    onkeydown = $bindable(null),
  }: Props = $props();

  let inputElement = $state<HTMLInputElement | null>(null);
  const inputId = $derived(id ?? `zdp-command-field-${componentId}`);
  const showClearButton = $derived(value.length > 0 && !disabled && !readonly);

  const ariaDescribedBy = $derived(normalizeIdRefs(describedBy));
  const resolvedErrorMessageId = $derived(invalid && errorMessageId ? errorMessageId : null);
  const hasShortcut = $derived(shortcutKeys.length > 0);
  const inputAriaLabel = $derived(label ? undefined : ariaLabel ?? 'Search');
  const hasComboboxContract = $derived(
    ariaAutocomplete !== null ||
    ariaControls !== null ||
    ariaExpanded !== null ||
    ariaActivedescendant !== null
  );
  const resolvedAriaExpanded = $derived(hasComboboxContract ? ariaExpanded ?? false : null);

  function handleInput(event: Event): void {
    value = (event.currentTarget as HTMLInputElement).value;
    oninput?.(event);
  }

  function handleClear(): void {
    if (inputElement === null) {
      return;
    }
    value = '';
    inputElement.value = '';
    inputElement.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    inputElement.focus();
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
</script>

<div
  class={`zdp-command-field-shell zdp-command-field-shell--${size}`}
  data-invalid={invalid ? 'true' : undefined}
  data-disabled={disabled ? 'true' : undefined}
>
  {#if label}
    <label for={inputId} class={`zdp-command-field__label ${labelVisible ? '' : 'zdp-command-field__label--hidden'}`}>
      {label}
    </label>
  {/if}
  <span class={`zdp-command-field zdp-command-field--${size}`}>
    <input
      class="zdp-command-field__input"
      id={inputId}
      name={name ?? undefined}
      {type}
      {value}
      placeholder={placeholder ?? undefined}
      autocomplete={autocomplete ?? undefined}
      role={hasComboboxContract ? 'combobox' : undefined}
      aria-label={inputAriaLabel}
      aria-describedby={ariaDescribedBy ?? undefined}
      aria-errormessage={resolvedErrorMessageId ?? undefined}
      aria-invalid={invalid ? 'true' : undefined}
      aria-keyshortcuts={ariaKeyShortcuts ?? undefined}
      aria-autocomplete={ariaAutocomplete ?? undefined}
      aria-controls={ariaControls ?? undefined}
      aria-expanded={resolvedAriaExpanded ?? undefined}
      aria-haspopup={hasComboboxContract ? 'listbox' : undefined}
      aria-activedescendant={ariaActivedescendant ?? undefined}
      {disabled}
      readonly={readonly}
      {required}
      inputmode={inputmode ?? undefined}
      enterkeyhint={enterkeyhint ?? undefined}
      bind:this={inputElement}
      oninput={handleInput}
      onfocus={onfocus ?? undefined}
      onblur={onblur ?? undefined}
      onkeydown={onkeydown ?? undefined}
      use:syncZdpFormReset={{ initialValue: value, onReset: (input) => { value = input.value; } }}
    />
    {#if showClearButton}
      <button
        type="button"
        class="zdp-command-field__clear"
        aria-label={clearLabel ?? 'Clear search'}
        onclick={handleClear}
      >
        <svg
          aria-hidden="true"
          class="zdp-command-field__clear-icon"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 4l8 8M12 4l-8 8"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            fill="none"
          />
        </svg>
      </button>
    {/if}
    {#if hasShortcut}
      <span class="zdp-command-field__shortcut" aria-hidden="true">
        <ShortcutHint keys={shortcutKeys} size={size} />
      </span>
    {/if}
  </span>
</div>

<style>
  .zdp-command-field-shell {
    box-sizing: border-box;
    display: grid;
    gap: var(--zdp-space-2);
    inline-size: 100%;
    min-width: 0;
  }

  .zdp-command-field-shell--sm {
    gap: var(--zdp-space-1);
  }

  .zdp-command-field-shell--md {
    gap: var(--zdp-space-2);
  }

  .zdp-command-field__label {
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-label-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-label-line-height);
  }

  .zdp-command-field__label--hidden {
    block-size: 1px;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    inline-size: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
  }

  .zdp-command-field {
    align-items: center;
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-radius-md);
    box-sizing: border-box;
    color: var(--zdp-color-ink-strong);
    display: flex;
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-control-size);
    gap: var(--zdp-space-2);
    inline-size: 100%;
    min-width: 0;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
  }

  .zdp-command-field--sm {
    min-height: var(--zdp-control-height-sm);
    padding: 0 var(--zdp-space-2);
  }

  .zdp-command-field--md {
    min-height: var(--zdp-control-height-md);
    padding: 0 var(--zdp-space-2) 0 var(--zdp-space-3);
  }

  .zdp-command-field:hover {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
  }

  .zdp-command-field:focus-within {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-command-field-shell[data-invalid="true"] .zdp-command-field {
    border-color: var(--zdp-color-accent-danger);
  }

  .zdp-command-field-shell[data-disabled="true"] .zdp-command-field {
    cursor: not-allowed;
    opacity: var(--zdp-control-disabled-opacity);
  }

  .zdp-command-field__input {
    background: transparent;
    border: 0;
    color: inherit;
    flex: 1 1 auto;
    font: inherit;
    min-height: calc(var(--zdp-control-height-md) - 2px);
    min-width: 0;
    padding: 0;
  }

  .zdp-command-field--sm .zdp-command-field__input {
    min-height: calc(var(--zdp-control-height-sm) - 2px);
  }

  .zdp-command-field__input::placeholder {
    color: var(--zdp-color-ink-muted);
  }

  .zdp-command-field__input:focus {
    outline: 0;
  }

  .zdp-command-field__input::-webkit-calendar-picker-indicator {
    display: none !important;
  }

  .zdp-command-field__input::-webkit-search-cancel-button {
    display: none !important;
  }

  .zdp-command-field__clear {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: var(--zdp-radius-sm);
    color: var(--zdp-color-ink-muted);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    inline-size: var(--zdp-control-hit-target);
    block-size: var(--zdp-control-hit-target);
    justify-content: center;
    margin-inline-end: calc(-1 * var(--zdp-space-1));
    padding: 0;
  }

  .zdp-command-field__clear:hover {
    background: var(--zdp-color-surface-raised);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-command-field__clear:focus-visible {
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-command-field__clear-icon {
    block-size: var(--zdp-control-glyph-md);
    inline-size: var(--zdp-control-glyph-md);
  }

  .zdp-command-field__shortcut {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
    pointer-events: none;
    -webkit-user-select: none;
    user-select: none;
  }
</style>

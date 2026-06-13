<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { ZdpCommandFieldSize } from '../command';
  import ShortcutHint from './ShortcutHint.svelte';

  type DescribedBy = string | readonly string[] | null;

  export let id: string | null = null;
  export let name: string | null = null;
  export let value = '';
  export let type: HTMLInputAttributes['type'] = 'search';
  export let label: string | null = '검색';
  export let labelVisible = false;
  export let ariaLabel: string | null = null;
  export let placeholder: string | null = '검색어 입력';
  export let autocomplete: HTMLInputAttributes['autocomplete'] | null = 'off';
  export let describedBy: DescribedBy = null;
  export let errorMessageId: string | null = null;
  export let invalid = false;
  export let disabled = false;
  export let readonly = false;
  export let required = false;
  export let size: ZdpCommandFieldSize = 'md';
  export let shortcutKeys: readonly string[] = ['/'];
  export let ariaControls: string | null = null;
  export let ariaExpanded: boolean | null = null;
  export let ariaActivedescendant: string | null = null;
  export let inputmode: HTMLInputAttributes['inputmode'] | null = null;
  export let enterkeyhint: HTMLInputAttributes['enterkeyhint'] | null = null;
  export let oninput: ((event: Event) => void) | null = null;
  export let onfocus: ((event: FocusEvent) => void) | null = null;
  export let onblur: ((event: FocusEvent) => void) | null = null;

  $: ariaDescribedBy = normalizeIdRefs(describedBy);
  $: resolvedErrorMessageId = invalid && errorMessageId ? errorMessageId : null;
  $: hasShortcut = shortcutKeys.length > 0;
  $: inputAriaLabel = label ? undefined : ariaLabel ?? '검색';

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
</script>

<label
  class={`zdp-command-field-shell zdp-command-field-shell--${size}`}
  data-invalid={invalid ? 'true' : undefined}
  data-disabled={disabled ? 'true' : undefined}
>
  {#if label}
    <span class={`zdp-command-field__label ${labelVisible ? '' : 'zdp-command-field__label--hidden'}`}>
      {label}
    </span>
  {/if}
  <span class={`zdp-command-field zdp-command-field--${size}`}>
    <input
      class="zdp-command-field__input"
      id={id ?? undefined}
      name={name ?? undefined}
      {type}
      {value}
      placeholder={placeholder ?? undefined}
      autocomplete={autocomplete ?? undefined}
      aria-label={inputAriaLabel}
      aria-describedby={ariaDescribedBy ?? undefined}
      aria-errormessage={resolvedErrorMessageId ?? undefined}
      aria-invalid={invalid ? 'true' : undefined}
      aria-controls={ariaControls ?? undefined}
      aria-expanded={ariaExpanded ?? undefined}
      aria-activedescendant={ariaActivedescendant ?? undefined}
      {disabled}
      readonly={readonly}
      {required}
      inputmode={inputmode ?? undefined}
      enterkeyhint={enterkeyhint ?? undefined}
      oninput={handleInput}
      onfocus={onfocus ?? undefined}
      onblur={onblur ?? undefined}
    />
    {#if hasShortcut}
      <span class="zdp-command-field__shortcut" aria-hidden="true">
        <ShortcutHint keys={shortcutKeys} size={size} />
      </span>
    {/if}
  </span>
</label>

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
    opacity: 0.56;
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

  .zdp-command-field__shortcut {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
    pointer-events: none;
    -webkit-user-select: none;
    user-select: none;
  }
</style>

<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { ZdpComboboxOption, ZdpComboboxSize } from '../combobox';
  import { toZdpDomId } from '../dom-id';

  type DescribedBy = string | readonly string[] | null;

  interface Props {
    id?: string | null;
    name?: string | null;
    value?: string;
    query?: string;
    options?: readonly ZdpComboboxOption[];
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
    size?: ZdpComboboxSize;
    noResultsText?: string;
    selectionRequiredText?: string;
    onQueryChange?: ((query: string) => void) | null;
    onValueChange?: ((value: string, option: ZdpComboboxOption | null) => void) | null;
    onOpenChange?: ((open: boolean) => void) | null;
  }

  const componentId = $props.id();
  const fallbackIdPrefix = `zdp-combobox-${componentId}`;
  let {
    id = null,
    name = null,
    value = $bindable(''),
    query = $bindable(''),
    options = [],
    label = 'Search',
    labelVisible = false,
    ariaLabel = null,
    placeholder = 'Search query',
    autocomplete = 'off',
    describedBy = null,
    errorMessageId = null,
    invalid = false,
    disabled = false,
    readonly = false,
    required = false,
    size = 'md',
    noResultsText = 'No results',
    selectionRequiredText = 'Select an option',
    onQueryChange = null,
    onValueChange = null,
    onOpenChange = null
  }: Props = $props();

  let rootElement = $state<HTMLElement | null>(null);
  let inputElement = $state<HTMLInputElement | null>(null);
  let open = $state(false);
  let activeOptionId = $state('');
  let lastSyncedValue = $state(value);
  let lastSelectedValue = $state('');
  let lastSelectedLabel = $state('');

  const enabledOptions = $derived(options.filter((option) => !option.disabled));
  const selectedOption = $derived(options.find((option) => option.value === value) ?? null);
  const selectedOptionLabel = $derived(
    selectedOption?.label ?? (value === lastSelectedValue ? lastSelectedLabel : '')
  );
  const resolvedIdPrefix = $derived(toDomId(id ?? fallbackIdPrefix));
  const inputId = $derived(id ?? `${resolvedIdPrefix}-input`);
  const listboxId = $derived(`${resolvedIdPrefix}-listbox`);
  const ariaDescribedBy = $derived(normalizeIdRefs(describedBy));
  const resolvedErrorMessageId = $derived(invalid && errorMessageId ? errorMessageId : null);
  const hasOptions = $derived(options.length > 0);
  const activeOptionDomId = $derived(open && activeOptionId ? optionDomId(activeOptionId) : null);
  const inputAriaLabel = $derived(label ? undefined : ariaLabel ?? 'Search');
  const listboxLabel = $derived(`${label ?? ariaLabel ?? 'Selection'} list`);
  const selectionMissing = $derived(required && !disabled && !readonly && selectedOption === null);
  const resolvedSelectionRequiredText = $derived(selectionRequiredText.trim() || 'Select an option');

  $effect.pre(() => {
    if (selectedOption) {
      lastSelectedValue = selectedOption.value;
      lastSelectedLabel = selectedOption.label;
    }
  });

  $effect.pre(() => {
    activeOptionId = resolveActiveOptionId(activeOptionId, enabledOptions);
  });

  $effect.pre(() => {
    if (value !== lastSyncedValue) {
      query = selectedOptionLabel;
      lastSyncedValue = value;
    }
  });

  $effect(() => {
    syncInputValidity(inputElement, selectionMissing, resolvedSelectionRequiredText);
  });

  function setOpen(nextOpen: boolean): void {
    if (disabled || readonly || open === nextOpen) {
      return;
    }

    open = nextOpen;
    onOpenChange?.(nextOpen);

    if (nextOpen) {
      activeOptionId = selectedOption?.id ?? enabledOptions[0]?.id ?? '';
    }
  }

  function handleInput(event: Event): void {
    const nextQuery = (event.currentTarget as HTMLInputElement).value;
    query = nextQuery;
    onQueryChange?.(query);
    clearSelectionForQuery(nextQuery);
    setOpen(true);
    activeOptionId = enabledOptions[0]?.id ?? '';
  }

  function handleInputFocus(): void {
    if (hasOptions) {
      setOpen(true);
    }
  }

  function handleInputKeydown(event: KeyboardEvent): void {
    if (event.isComposing || event.keyCode === 229) {
      return;
    }

    if (disabled || readonly) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const wasOpen = open;
      setOpen(true);
      if (wasOpen) {
        moveActiveOption('ArrowDown');
      } else {
        activeOptionId = selectedOption?.id ?? enabledOptions[0]?.id ?? '';
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const wasOpen = open;
      setOpen(true);
      if (wasOpen) {
        moveActiveOption('ArrowUp');
      } else {
        activeOptionId = selectedOption?.id ?? enabledOptions[enabledOptions.length - 1]?.id ?? '';
      }
      return;
    }

    if (event.key === 'Home' && open) {
      event.preventDefault();
      activeOptionId = enabledOptions[0]?.id ?? '';
      return;
    }

    if (event.key === 'End' && open) {
      event.preventDefault();
      activeOptionId = enabledOptions[enabledOptions.length - 1]?.id ?? '';
      return;
    }

    if (event.key === 'Enter' && open) {
      const activeOption = enabledOptions.find((option) => option.id === activeOptionId) ?? null;

      if (activeOption) {
        event.preventDefault();
        selectOption(activeOption);
      }

      return;
    }

    if (event.key === 'Escape' && open) {
      event.preventDefault();
      const nextQuery = selectedOptionLabel || query;
      query = nextQuery;
      onQueryChange?.(nextQuery);
      setOpen(false);
    }
  }

  function handleToggleClick(): void {
    setOpen(!open);
    inputElement?.focus();
  }

  function handleDocumentClick(event: MouseEvent): void {
    if (!open || (rootElement !== null && event.composedPath().includes(rootElement))) {
      return;
    }

    setOpen(false);
  }

  function handleOptionMouseenter(option: ZdpComboboxOption): void {
    if (!option.disabled) {
      activeOptionId = option.id;
    }
  }

  function selectOption(option: ZdpComboboxOption): void {
    if (option.disabled) {
      return;
    }

    value = option.value;
    query = option.label;
    lastSyncedValue = value;
    lastSelectedValue = option.value;
    lastSelectedLabel = option.label;
    onQueryChange?.(query);
    onValueChange?.(value, option);
    setOpen(false);
    inputElement?.focus();
  }

  function clearSelectionForQuery(nextQuery: string): void {
    const currentOption = options.find((option) => option.value === value) ?? null;

    if (currentOption === null || currentOption.label === nextQuery) {
      return;
    }

    value = '';
    lastSyncedValue = value;
    onValueChange?.('', null);
  }

  function syncInputValidity(element: HTMLInputElement | null, missing: boolean, message: string): void {
    element?.setCustomValidity(missing ? message : '');
  }

  function moveActiveOption(key: 'ArrowDown' | 'ArrowUp'): void {
    if (enabledOptions.length === 0) {
      activeOptionId = '';
      return;
    }

    const currentIndex = Math.max(
      0,
      enabledOptions.findIndex((option) => option.id === activeOptionId)
    );

    const nextIndex =
      key === 'ArrowUp'
        ? (currentIndex - 1 + enabledOptions.length) % enabledOptions.length
        : (currentIndex + 1) % enabledOptions.length;

    activeOptionId = enabledOptions[nextIndex]?.id ?? activeOptionId;
  }

  function resolveActiveOptionId(currentId: string, availableOptions: readonly ZdpComboboxOption[]): string {
    if (availableOptions.some((option) => option.id === currentId)) {
      return currentId;
    }

    return availableOptions[0]?.id ?? '';
  }

  function optionDomId(optionId: string): string {
    return `${resolvedIdPrefix}-option-${toDomId(optionId)}`;
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

  function toDomId(id: string): string {
    return toZdpDomId(id, 'combobox');
  }
</script>

<svelte:document onclick={handleDocumentClick} />

<span
  class={`zdp-combobox zdp-combobox--${size}`}
  data-open={open ? 'true' : 'false'}
  data-invalid={invalid ? 'true' : undefined}
  data-disabled={disabled ? 'true' : undefined}
  bind:this={rootElement}
>
  {#if label}
    <label class={`zdp-combobox__label ${labelVisible ? '' : 'zdp-combobox__label--hidden'}`} for={inputId}>
      {label}
    </label>
  {/if}

  <span class="zdp-combobox__control">
    <input
      class="zdp-combobox__input"
      id={inputId}
      role="combobox"
      type="text"
      value={query}
      placeholder={placeholder ?? undefined}
      autocomplete={autocomplete ?? undefined}
      aria-label={inputAriaLabel}
      aria-autocomplete="list"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={open && hasOptions ? listboxId : undefined}
      aria-activedescendant={activeOptionDomId ?? undefined}
      aria-describedby={ariaDescribedBy ?? undefined}
      aria-errormessage={resolvedErrorMessageId ?? undefined}
      aria-invalid={invalid ? 'true' : undefined}
      aria-required={required ? 'true' : undefined}
      {disabled}
      readonly={readonly}
      {required}
      bind:this={inputElement}
      oninput={handleInput}
      onfocus={handleInputFocus}
      onkeydown={handleInputKeydown}
    />
    {#if name}
      <input type="hidden" {name} {value} disabled={disabled} />
    {/if}
    <button
      class="zdp-combobox__toggle"
      type="button"
      aria-label={open ? 'Close selection' : 'Open selection'}
      aria-controls={open && hasOptions ? listboxId : undefined}
      aria-expanded={open}
      disabled={disabled || readonly}
      onclick={handleToggleClick}
    >
      <span class="zdp-combobox__mark" aria-hidden="true"></span>
    </button>
  </span>

  {#if open}
    <span class="zdp-combobox__panel">
      {#if hasOptions}
        <span class="zdp-combobox__listbox" id={listboxId} role="listbox" aria-label={listboxLabel}>
          {#each options as option (option.id)}
            <button
              class="zdp-combobox__option"
              type="button"
              id={optionDomId(option.id)}
              role="option"
              aria-selected={option.value === value}
              aria-disabled={option.disabled ? 'true' : undefined}
              disabled={option.disabled}
              tabindex="-1"
              data-active={option.id === activeOptionId ? 'true' : undefined}
              data-selected={option.value === value ? 'true' : undefined}
              onmousedown={(event) => event.preventDefault()}
              onmouseenter={() => handleOptionMouseenter(option)}
              onclick={() => selectOption(option)}
            >
              <span class="zdp-combobox__option-label">{option.label}</span>
              {#if option.description}
                <span class="zdp-combobox__option-description">{option.description}</span>
              {/if}
            </button>
          {/each}
        </span>
      {:else}
        <span class="zdp-combobox__empty" role="status">{noResultsText}</span>
      {/if}
    </span>
  {/if}
</span>

<style>
  .zdp-combobox {
    box-sizing: border-box;
    display: grid;
    gap: var(--zdp-space-2);
    inline-size: 100%;
    min-width: 0;
    position: relative;
  }

  .zdp-combobox__label {
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-label-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-label-line-height);
  }

  .zdp-combobox__label--hidden {
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

  .zdp-combobox__control {
    align-items: center;
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-strong);
    display: flex;
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-control-size);
    gap: var(--zdp-space-1);
    inline-size: 100%;
    min-width: 0;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
  }

  .zdp-combobox--sm .zdp-combobox__control {
    min-height: var(--zdp-control-height-sm);
    padding: 0 var(--zdp-space-1) 0 var(--zdp-space-2);
  }

  .zdp-combobox--md .zdp-combobox__control {
    min-height: var(--zdp-control-height-md);
    padding: 0 var(--zdp-space-1) 0 var(--zdp-space-3);
  }

  .zdp-combobox__control:hover {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
  }

  .zdp-combobox__control:focus-within {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-combobox[data-invalid="true"] .zdp-combobox__control {
    border-color: var(--zdp-color-accent-danger);
  }

  .zdp-combobox[data-disabled="true"] .zdp-combobox__control {
    cursor: not-allowed;
    opacity: 0.56;
  }

  .zdp-combobox__input {
    background: transparent;
    border: 0;
    color: inherit;
    flex: 1 1 auto;
    font: inherit;
    min-height: calc(var(--zdp-control-height-md) - 2px);
    min-width: 0;
    padding: 0;
  }

  .zdp-combobox--sm .zdp-combobox__input {
    min-height: calc(var(--zdp-control-height-sm) - 2px);
  }

  .zdp-combobox__input::placeholder {
    color: var(--zdp-color-ink-muted);
  }

  .zdp-combobox__input:focus {
    outline: 0;
  }

  .zdp-combobox__toggle {
    align-items: center;
    background: transparent;
    border: var(--zdp-control-border-width) solid transparent;
    border-radius: var(--zdp-control-radius);
    color: var(--zdp-color-ink-muted);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    justify-content: center;
    min-height: calc(var(--zdp-control-height-sm) - 2px);
    min-width: calc(var(--zdp-control-height-sm) - 2px);
    padding: 0;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-combobox__toggle:hover:not(:disabled),
  .zdp-combobox__toggle:focus-visible {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-strong);
    outline: 0;
  }

  .zdp-combobox__toggle:disabled {
    cursor: not-allowed;
  }

  .zdp-combobox__mark {
    align-items: center;
    display: inline-flex;
    justify-content: center;
    line-height: 1;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-combobox__mark::before {
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid currentColor;
    content: '';
    display: inline-block;
    height: 0;
    width: 0;
  }

  .zdp-combobox__panel {
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong);
    border-radius: var(--zdp-control-radius);
    color: var(--zdp-color-ink-normal);
    display: grid;
    font-family: var(--zdp-font-family-sans);
    inline-size: 100%;
    left: 0;
    max-block-size: min(18rem, calc(var(--zdp-viewport-block) - var(--zdp-space-8)));
    min-width: 0;
    overflow: auto;
    padding: var(--zdp-space-1);
    position: absolute;
    top: calc(100% + var(--zdp-space-2));
    z-index: var(--zdp-layer-floating);
  }

  .zdp-combobox__listbox {
    display: grid;
    gap: var(--zdp-space-1);
    min-width: 0;
  }

  .zdp-combobox__option {
    align-items: start;
    background: transparent;
    border: var(--zdp-control-border-width) solid transparent;
    border-radius: var(--zdp-control-radius);
    color: var(--zdp-color-ink-normal);
    cursor: pointer;
    display: grid;
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-control-size);
    gap: var(--zdp-space-1);
    line-height: var(--zdp-type-control-line-height);
    min-height: var(--zdp-control-height-sm);
    min-width: 0;
    padding: var(--zdp-space-1) var(--zdp-space-2);
    text-align: left;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-combobox__option:hover:not(:disabled),
  .zdp-combobox__option[data-active="true"] {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-combobox__option[data-selected="true"] {
    background: var(--zdp-color-focus-surface);
    border-color: var(--zdp-color-focus-line);
    color: var(--zdp-color-focus-text);
  }

  .zdp-combobox__option:disabled,
  .zdp-combobox__option[aria-disabled="true"] {
    cursor: not-allowed;
    opacity: 0.56;
  }

  .zdp-combobox__option-label {
    min-width: 0;
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
  }

  .zdp-combobox__option-description,
  .zdp-combobox__empty {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-body-small-size);
    line-height: var(--zdp-type-body-small-line-height);
  }

  .zdp-combobox__empty {
    padding: var(--zdp-space-2);
  }
</style>

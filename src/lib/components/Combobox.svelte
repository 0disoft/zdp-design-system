<script lang="ts" context="module">
  let nextComboboxInstanceId = 0;
</script>

<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { ZdpComboboxOption, ZdpComboboxSize } from '../combobox';

  type DescribedBy = string | readonly string[] | null;

  export let id: string | null = null;
  export let name: string | null = null;
  export let value = '';
  export let query = '';
  export let options: readonly ZdpComboboxOption[] = [];
  export let label: string | null = 'Search';
  export let labelVisible = false;
  export let ariaLabel: string | null = null;
  export let placeholder: string | null = 'Search query';
  export let autocomplete: HTMLInputAttributes['autocomplete'] | null = 'off';
  export let describedBy: DescribedBy = null;
  export let errorMessageId: string | null = null;
  export let invalid = false;
  export let disabled = false;
  export let readonly = false;
  export let required = false;
  export let size: ZdpComboboxSize = 'md';
  export let noResultsText = 'No results';
  export let onQueryChange: ((query: string) => void) | null = null;
  export let onValueChange: ((value: string, option: ZdpComboboxOption | null) => void) | null = null;
  export let onOpenChange: ((open: boolean) => void) | null = null;

  const fallbackIdPrefix = `zdp-combobox-${++nextComboboxInstanceId}`;

  let rootElement: HTMLElement | null = null;
  let inputElement: HTMLInputElement | null = null;
  let open = false;
  let activeOptionId = '';
  let lastSyncedValue = value;
  let lastSelectedValue = '';
  let lastSelectedLabel = '';

  $: enabledOptions = options.filter((option) => !option.disabled);
  $: selectedOption = options.find((option) => option.value === value) ?? null;
  $: if (selectedOption) {
    lastSelectedValue = selectedOption.value;
    lastSelectedLabel = selectedOption.label;
  }
  $: selectedOptionLabel = selectedOption?.label ?? (value === lastSelectedValue ? lastSelectedLabel : '');
  $: resolvedIdPrefix = toDomId(id ?? fallbackIdPrefix);
  $: inputId = id ?? `${resolvedIdPrefix}-input`;
  $: listboxId = `${resolvedIdPrefix}-listbox`;
  $: ariaDescribedBy = normalizeIdRefs(describedBy);
  $: resolvedErrorMessageId = invalid && errorMessageId ? errorMessageId : null;
  $: hasOptions = options.length > 0;
  $: activeOptionId = resolveActiveOptionId(activeOptionId, enabledOptions);
  $: activeOptionDomId = open && activeOptionId ? optionDomId(activeOptionId) : null;
  $: inputAriaLabel = label ? undefined : ariaLabel ?? 'Search';
  $: listboxLabel = `${label ?? ariaLabel ?? 'Selection'} list`;

  $: if (value !== lastSyncedValue) {
    query = selectedOptionLabel;
    lastSyncedValue = value;
  }

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
    query = (event.currentTarget as HTMLInputElement).value;
    onQueryChange?.(query);
    setOpen(true);
    activeOptionId = enabledOptions[0]?.id ?? '';
  }

  function handleInputFocus(): void {
    if (hasOptions) {
      setOpen(true);
    }
  }

  function handleInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      moveActiveOption('ArrowDown');
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      moveActiveOption('ArrowUp');
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
    if (!open || rootElement?.contains(event.target as Node)) {
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
    return id.trim().replace(/[^a-zA-Z0-9_-]+/g, '-') || 'combobox';
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
      <input type="hidden" {name} {value} />
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
    max-block-size: min(18rem, calc(100vh - var(--zdp-space-8)));
    min-width: 0;
    overflow: auto;
    padding: var(--zdp-space-1);
    position: absolute;
    top: calc(100% + var(--zdp-space-2));
    z-index: 40;
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

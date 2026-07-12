<script lang="ts" context="module">
  let nextLocaleSwitcherInstanceId = 0;
</script>

<script lang="ts">
  import { toZdpDomId } from '../dom-id';
  import {
    zdpLocaleSwitcherOptions,
    type ZdpLocaleSwitcherOption,
    type ZdpLocaleSwitcherSize
  } from '../preferences';

  export let value = 'en';
  export let options: readonly ZdpLocaleSwitcherOption[] = zdpLocaleSwitcherOptions;
  export let ariaLabel = 'Language';
  export let idPrefix: string | null = null;
  export let size: ZdpLocaleSwitcherSize = 'md';
  export let disabled = false;
  export let onChange:
    | ((event: MouseEvent | KeyboardEvent, option: ZdpLocaleSwitcherOption) => void)
    | null = null;

  const fallbackIdPrefix = `zdp-locale-switcher-${++nextLocaleSwitcherInstanceId}`;

  $: enabledOptions = options.filter((option) => !option.disabled);
  $: activeOption =
    enabledOptions.find((option) => option.value === value) ?? enabledOptions[0] ?? options[0] ?? null;
  $: activeValue = activeOption?.value ?? value;
  $: resolvedIdPrefix = toDomId(idPrefix ?? fallbackIdPrefix);

  function selectOption(event: MouseEvent | KeyboardEvent, option: ZdpLocaleSwitcherOption): void {
    if (disabled || option.disabled) {
      return;
    }

    const previousValue = value;
    value = option.value;

    if (previousValue !== option.value) {
      onChange?.(event, option);
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      return;
    }

    const target = event.currentTarget as HTMLElement;
    const controls = Array.from(target.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)'));

    if (controls.length === 0) {
      return;
    }

    event.preventDefault();

    const currentIndex = Math.max(
      0,
      controls.findIndex((control) => control.getAttribute('aria-checked') === 'true')
    );
    const nextIndex = getNextIndex(event.key, currentIndex, controls.length);
    const nextControl = controls[nextIndex];

    nextControl.focus();
    nextControl.click();
  }

  function getNextIndex(key: string, currentIndex: number, length: number): number {
    if (key === 'Home') {
      return 0;
    }

    if (key === 'End') {
      return length - 1;
    }

    if (key === 'ArrowLeft') {
      return (currentIndex - 1 + length) % length;
    }

    return (currentIndex + 1) % length;
  }

  function optionId(option: ZdpLocaleSwitcherOption): string {
    return `${resolvedIdPrefix}-option-${toDomId(option.value)}`;
  }

  function toDomId(value: string): string {
    return toZdpDomId(value, 'option');
  }
</script>

<div
  class={`zdp-locale-switcher zdp-locale-switcher--${size}`}
  role="radiogroup"
  aria-label={ariaLabel}
  aria-disabled={disabled ? 'true' : undefined}
  tabindex="-1"
  data-zdp-locale-switcher
  data-zdp-locale-value={activeValue}
  onkeydown={handleKeydown}
>
  {#each options as option (option.value)}
    <button
      class={`zdp-locale-switcher__item ${
        option.value === activeValue ? 'zdp-locale-switcher__item--selected' : ''
      }`}
      id={optionId(option)}
      type="button"
      role="radio"
      lang={option.lang ?? undefined}
      aria-label={option.ariaLabel ?? option.label}
      aria-checked={option.value === activeValue}
      tabindex={option.value === activeValue ? 0 : -1}
      disabled={disabled || option.disabled}
      data-zdp-locale-option
      data-zdp-locale-option-value={option.value}
      onclick={(event) => selectOption(event, option)}
    >
      <span class="zdp-locale-switcher__label" aria-hidden="true">
        {option.shortLabel ?? option.label}
      </span>
    </button>
  {/each}
</div>

<style>
  .zdp-locale-switcher {
    align-items: center;
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-normal);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--zdp-font-family-sans);
    gap: var(--zdp-space-1);
    max-width: 100%;
    min-width: 0;
    padding: var(--zdp-space-1);
  }

  .zdp-locale-switcher__item {
    align-items: center;
    background: transparent;
    border: var(--zdp-control-border-width) solid transparent;
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-muted);
    cursor: pointer;
    display: inline-grid;
    font-family: var(--zdp-font-family-sans);
    font-weight: var(--zdp-font-weight-semibold);
    justify-content: center;
    letter-spacing: 0;
    line-height: 1;
    min-width: 0;
    padding: 0 var(--zdp-space-2);
    place-items: center;
    text-align: center;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-locale-switcher--sm .zdp-locale-switcher__item {
    height: var(--zdp-control-icon-sm);
    min-width: calc(var(--zdp-control-icon-sm) + var(--zdp-space-2));
  }

  .zdp-locale-switcher--md .zdp-locale-switcher__item {
    height: var(--zdp-control-icon-md);
    min-width: calc(var(--zdp-control-icon-md) + var(--zdp-space-2));
  }

  .zdp-locale-switcher__item:hover:not(:disabled):not([aria-checked='true']) {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-locale-switcher__item:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-locale-switcher__item--selected,
  .zdp-locale-switcher__item[aria-checked='true'] {
    background: var(--zdp-color-accent-primary-soft);
    border-color: var(--zdp-color-accent-primary-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-locale-switcher__item:disabled {
    cursor: not-allowed;
    opacity: 0.56;
  }

  .zdp-locale-switcher__label {
    display: inline-block;
    line-height: 1;
    white-space: nowrap;
  }
</style>

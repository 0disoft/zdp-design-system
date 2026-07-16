<script lang="ts">
  import { toZdpDomId } from '../dom-id';
  import {
    zdpTextScaleControlOptions,
    type ZdpTextScale,
    type ZdpTextScaleControlOption,
    type ZdpTextScaleControlSize
  } from '../preferences';

  interface Props {
    value?: ZdpTextScale;
    options?: readonly ZdpTextScaleControlOption[];
    ariaLabel?: string;
    idPrefix?: string | null;
    size?: ZdpTextScaleControlSize;
    disabled?: boolean;
    onChange?: ((event: MouseEvent | KeyboardEvent, option: ZdpTextScaleControlOption) => void) | null;
  }

  const componentId = $props.id();
  const fallbackIdPrefix = `zdp-text-scale-control-${componentId}`;
  let {
    value = $bindable<ZdpTextScale>('base'),
    options = zdpTextScaleControlOptions,
    ariaLabel = 'Text size',
    idPrefix = null,
    size = 'md',
    disabled = false,
    onChange = null
  }: Props = $props();

  const enabledOptions = $derived(options.filter((option) => !option.disabled));
  const activeOption = $derived(
    enabledOptions.find((option) => option.value === value) ?? enabledOptions[0] ?? options[0] ?? null
  );
  const activeValue = $derived(activeOption?.value ?? value);
  const resolvedIdPrefix = $derived(toDomId(idPrefix ?? fallbackIdPrefix));

  function selectOption(event: MouseEvent | KeyboardEvent, option: ZdpTextScaleControlOption): void {
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

  function optionId(option: ZdpTextScaleControlOption): string {
    return `${resolvedIdPrefix}-option-${toDomId(option.value)}`;
  }

  function toDomId(value: string): string {
    return toZdpDomId(value, 'option');
  }
</script>

<div
  class={`zdp-text-scale-control zdp-text-scale-control--${size}`}
  role="radiogroup"
  aria-label={ariaLabel}
  aria-disabled={disabled ? 'true' : undefined}
  tabindex="-1"
  data-zdp-text-scale-control
  data-zdp-text-scale-value={activeValue}
  onkeydown={handleKeydown}
>
  {#each options as option (option.value)}
    <button
      class={`zdp-text-scale-control__item ${
        option.value === activeValue ? 'zdp-text-scale-control__item--selected' : ''
      }`}
      id={optionId(option)}
      type="button"
      role="radio"
      aria-label={option.ariaLabel ?? undefined}
      aria-checked={option.value === activeValue}
      tabindex={option.value === activeValue ? 0 : -1}
      disabled={disabled || option.disabled}
      data-zdp-text-scale-option
      data-zdp-text-scale-option-value={option.value}
      onclick={(event) => selectOption(event, option)}
    >
      <span class="zdp-text-scale-control__sample" aria-hidden={option.ariaLabel ? 'true' : undefined}>
        {option.label}
      </span>
    </button>
  {/each}
</div>

<style>
  .zdp-text-scale-control {
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

  .zdp-text-scale-control__item {
    align-items: center;
    background: transparent;
    border: var(--zdp-control-border-width) solid transparent;
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-muted);
    cursor: pointer;
    display: inline-grid;
    font-family: var(--zdp-font-family-sans);
    font-weight: var(--zdp-font-weight-medium);
    justify-content: center;
    line-height: 1;
    min-width: 0;
    padding: 0;
    place-items: center;
    text-align: center;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-text-scale-control--sm .zdp-text-scale-control__item {
    height: var(--zdp-control-icon-sm);
    width: var(--zdp-control-icon-sm);
  }

  .zdp-text-scale-control--md .zdp-text-scale-control__item {
    height: var(--zdp-control-icon-md);
    width: var(--zdp-control-icon-md);
  }

  .zdp-text-scale-control__item:hover:not(:disabled):not([aria-checked='true']) {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-text-scale-control__item:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-text-scale-control__item--selected,
  .zdp-text-scale-control__item[aria-checked='true'] {
    background: var(--zdp-color-accent-primary-soft);
    border-color: var(--zdp-color-accent-primary-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-text-scale-control__item:disabled {
    cursor: not-allowed;
    opacity: 0.56;
  }

  .zdp-text-scale-control__sample {
    display: inline-block;
    line-height: 1;
  }

  .zdp-text-scale-control__item[data-zdp-text-scale-option-value='base'] .zdp-text-scale-control__sample {
    font-size: var(--zdp-font-size-sm);
  }

  .zdp-text-scale-control__item[data-zdp-text-scale-option-value='large'] .zdp-text-scale-control__sample {
    font-size: var(--zdp-font-size-md);
  }

  .zdp-text-scale-control__item[data-zdp-text-scale-option-value='larger'] .zdp-text-scale-control__sample {
    font-size: var(--zdp-font-size-lg);
  }
</style>

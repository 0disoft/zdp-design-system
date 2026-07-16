<script lang="ts">
  import { toZdpDomId } from '../dom-id';
  import type { ZdpSegmentedControlItem, ZdpSegmentedControlSize } from '../segmented';

  interface Props {
    items?: readonly ZdpSegmentedControlItem[];
    selectedId?: string | null;
    ariaLabel?: string;
    idPrefix?: string | null;
    size?: ZdpSegmentedControlSize;
    onChange?: ((event: MouseEvent | KeyboardEvent, item: ZdpSegmentedControlItem) => void) | null;
  }

  const componentId = $props.id();
  const fallbackIdPrefix = `zdp-segmented-control-${componentId}`;
  let {
    items = [],
    selectedId = $bindable(null),
    ariaLabel = 'Selection toggle',
    idPrefix = null,
    size = 'md',
    onChange = null
  }: Props = $props();

  const selectedItem = $derived(
    items.find((item) => item.id === selectedId && !item.disabled) ??
    items.find((item) => !item.disabled) ??
    items[0] ??
    null
  );
  const activeId = $derived(selectedItem?.id ?? '');
  const resolvedIdPrefix = $derived(toDomId(idPrefix ?? fallbackIdPrefix));

  function selectItem(event: MouseEvent | KeyboardEvent, item: ZdpSegmentedControlItem): void {
    if (item.disabled) {
      return;
    }

    const previousId = selectedId;
    selectedId = item.id;

    if (previousId !== item.id) {
      onChange?.(event, item);
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      return;
    }

    const target = event.currentTarget as HTMLElement;
    const options = Array.from(target.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)'));

    if (options.length === 0) {
      return;
    }

    event.preventDefault();

    const currentIndex = Math.max(
      0,
      options.findIndex((option) => option.getAttribute('aria-checked') === 'true')
    );
    const nextIndex = getNextIndex(event.key, currentIndex, options.length);
    const nextOption = options[nextIndex];

    nextOption.focus();
    nextOption.click();
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

  function itemId(id: string): string {
    return `${resolvedIdPrefix}-item-${toDomId(id)}`;
  }

  function toDomId(value: string): string {
    return toZdpDomId(value, 'item');
  }
</script>

<div
  class={`zdp-segmented-control zdp-segmented-control--${size}`}
  role="radiogroup"
  aria-label={ariaLabel}
  tabindex="-1"
  onkeydown={handleKeydown}
>
  {#each items as item (item.id)}
    <button
      class={`zdp-segmented-control__item ${item.id === activeId ? 'zdp-segmented-control__item--selected' : ''}`}
      id={itemId(item.id)}
      type="button"
      role="radio"
      aria-label={item.ariaLabel ?? undefined}
      aria-checked={item.id === activeId}
      tabindex={item.id === activeId ? 0 : -1}
      disabled={item.disabled}
      onclick={(event) => selectItem(event, item)}
    >
      {item.label}
    </button>
  {/each}
</div>

<style>
  .zdp-segmented-control {
    align-items: center;
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-normal);
    display: inline-flex;
    flex-wrap: wrap;
    font-family: var(--zdp-font-family-sans);
    gap: var(--zdp-space-1);
    max-width: 100%;
    min-width: 0;
    padding: var(--zdp-space-1);
  }

  .zdp-segmented-control__item {
    align-items: center;
    background: transparent;
    border: var(--zdp-control-border-width) solid transparent;
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-muted);
    cursor: pointer;
    display: inline-flex;
    font-family: var(--zdp-font-family-sans);
    font-weight: var(--zdp-font-weight-medium);
    justify-content: center;
    line-height: var(--zdp-type-control-line-height);
    min-width: 0;
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
    text-align: center;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-segmented-control--sm .zdp-segmented-control__item {
    font-size: var(--zdp-font-size-sm);
    min-block-size: var(--zdp-control-height-sm);
    padding: 0 var(--zdp-space-2);
  }

  .zdp-segmented-control--md .zdp-segmented-control__item {
    font-size: var(--zdp-type-control-size);
    min-block-size: var(--zdp-control-height-md);
    padding: 0 var(--zdp-space-3);
  }

  .zdp-segmented-control__item:hover:not(:disabled):not([aria-checked='true']) {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-segmented-control__item:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-segmented-control__item--selected,
  .zdp-segmented-control__item[aria-checked='true'] {
    background: var(--zdp-color-accent-primary-soft);
    border-color: var(--zdp-color-accent-primary-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-segmented-control__item:disabled {
    cursor: not-allowed;
    opacity: 0.56;
  }
</style>

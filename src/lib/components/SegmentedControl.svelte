<script lang="ts">
  import { toZdpDomId } from '../dom-id';
  import { moveZdpRovingFocus } from '../roving-focus';
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

  const normalizedSelectedItem = $derived(
    items.find((item) => item.id === selectedId && !item.disabled) ??
    items.find((item) => !item.disabled) ??
    null
  );
  const selectedItem = $derived(items.find((item) => item.id === selectedId && !item.disabled) ?? null);
  const activeId = $derived(selectedItem?.id ?? '');
  const resolvedIdPrefix = $derived(toDomId(idPrefix ?? fallbackIdPrefix));

  $effect.pre(() => {
    const normalizedId = normalizedSelectedItem?.id ?? null;
    if (selectedId !== normalizedId) {
      selectedId = normalizedId;
    }
  });

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
    const target = event.currentTarget as HTMLElement;
    const options = Array.from(target.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)'));
    const result = moveZdpRovingFocus({
      container: target,
      event,
      fallbackElement: options.find((option) => option.getAttribute('aria-checked') === 'true') ?? null,
      orientation: 'horizontal',
      selector: '[role="radio"]:not(:disabled)'
    });
    const nextItem = result === null ? undefined : items.filter((item) => !item.disabled)[result.index];

    if (nextItem === undefined) {
      return;
    }

    selectItem(event, nextItem);
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
    background: var(--zdp-color-surface-raised);
    border: var(--zdp-control-border-width) solid transparent;
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
    background: var(--zdp-color-surface-panel);
    border-color: transparent;
    color: var(--zdp-color-ink-strong);
  }

  .zdp-segmented-control__item:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-segmented-control__item--selected,
  .zdp-segmented-control__item[aria-checked='true'] {
    background: var(--zdp-color-accent-primary);
    border-color: transparent;
    color: var(--zdp-color-ink-strong);
  }

  :global([data-zdp-theme="dark"]) .zdp-segmented-control__item--selected,
  :global([data-zdp-theme="dark"]) .zdp-segmented-control__item[aria-checked='true'] {
    color: var(--zdp-color-ink-inverse);
  }

  .zdp-segmented-control__item:disabled {
    cursor: not-allowed;
    opacity: var(--zdp-control-disabled-opacity);
  }

  @media (forced-colors: active) {
    .zdp-segmented-control {
      border-color: ButtonText;
    }

    .zdp-segmented-control__item--selected,
    .zdp-segmented-control__item[aria-checked='true'] {
      background: Highlight;
      border-color: Highlight;
      color: HighlightText;
      forced-color-adjust: none;
    }
  }
</style>

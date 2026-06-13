<script lang="ts">
  import SegmentedControl from './SegmentedControl.svelte';
  import type { ZdpSegmentedControlItem } from '../segmented';
  import type { ZdpTableDensity, ZdpTableToolbarDensityItem } from '../table-tools';

  const defaultDensityItems: readonly ZdpTableToolbarDensityItem[] = [
    { id: 'default', label: '기본' },
    { id: 'compact', label: '촘촘히' }
  ];

  export let title: string | null = null;
  export let summary: string | null = null;
  export let selectedCount: number | null = null;
  export let selectedLabel: string | null = null;
  export let density: ZdpTableDensity = 'default';
  export let densityLabel = '표 밀도';
  export let densityItems: readonly ZdpTableToolbarDensityItem[] = defaultDensityItems;
  export let labelledBy: string | null = null;
  export let ariaLabel = '표 도구';
  export let onDensityChange:
    | ((event: MouseEvent | KeyboardEvent, density: ZdpTableDensity, item: ZdpTableToolbarDensityItem) => void)
    | null = null;

  $: normalizedSelectedCount = normalizeCount(selectedCount);
  $: resolvedSelectedLabel =
    selectedLabel ?? (normalizedSelectedCount > 0 ? `${normalizedSelectedCount}개 선택됨` : null);
  $: segmentedDensityItems = densityItems.map((item) => ({
    id: item.id,
    label: item.label,
    ariaLabel: item.ariaLabel,
    disabled: item.disabled
  }));
  $: activeDensity = normalizeDensity(density, densityItems);

  function handleDensityChange(
    event: MouseEvent | KeyboardEvent,
    item: ZdpSegmentedControlItem
  ): void {
    const densityItem = densityItems.find((entry) => entry.id === item.id);

    if (densityItem) {
      onDensityChange?.(event, densityItem.id, densityItem);
    }
  }

  function normalizeCount(value: number | null): number {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      return 0;
    }

    return Math.floor(value);
  }

  function normalizeDensity(
    value: ZdpTableDensity,
    items: readonly ZdpTableToolbarDensityItem[]
  ): ZdpTableDensity {
    if (items.some((item) => item.id === value && !item.disabled)) {
      return value;
    }

    return items.find((item) => !item.disabled)?.id ?? value;
  }
</script>

<div
  class="zdp-table-toolbar"
  role="group"
  aria-label={labelledBy ? undefined : ariaLabel}
  aria-labelledby={labelledBy ?? undefined}
>
  <div class="zdp-table-toolbar__body">
    {#if title}
      <strong class="zdp-table-toolbar__title">{title}</strong>
    {/if}
    {#if summary}
      <p class="zdp-table-toolbar__summary">{summary}</p>
    {/if}
    {#if resolvedSelectedLabel}
      <p class="zdp-table-toolbar__selection">{resolvedSelectedLabel}</p>
    {/if}
    <slot />
  </div>

  <div class="zdp-table-toolbar__controls">
    <slot name="controls" />
    {#if densityItems.length > 0}
      <div class="zdp-table-toolbar__density">
        <span class="zdp-table-toolbar__density-label">{densityLabel}</span>
        <SegmentedControl
          ariaLabel={densityLabel}
          items={segmentedDensityItems}
          selectedId={activeDensity}
          size="sm"
          onChange={handleDensityChange}
        />
      </div>
    {/if}
  </div>

  <div class="zdp-table-toolbar__actions">
    {#if normalizedSelectedCount > 0}
      <slot name="selection-actions" />
    {/if}
    <slot name="actions" />
  </div>
</div>

<style>
  .zdp-table-toolbar {
    align-items: center;
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-normal);
    display: flex;
    flex-wrap: wrap;
    font-family: var(--zdp-font-family-sans);
    gap: var(--zdp-space-3);
    justify-content: space-between;
    min-width: 0;
    padding: var(--zdp-space-3);
  }

  .zdp-table-toolbar__body {
    display: grid;
    flex: 1 1 16rem;
    gap: var(--zdp-space-1);
    min-inline-size: min(100%, 16rem);
  }

  .zdp-table-toolbar__title {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-body-small-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-body-small-line-height);
    min-width: 0;
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
  }

  .zdp-table-toolbar__summary,
  .zdp-table-toolbar__selection {
    font-size: var(--zdp-type-caption-size);
    line-height: var(--zdp-type-caption-line-height);
    margin: 0;
    min-width: 0;
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
  }

  .zdp-table-toolbar__summary {
    color: var(--zdp-color-ink-muted);
  }

  .zdp-table-toolbar__selection {
    color: var(--zdp-color-ink-strong);
    font-weight: var(--zdp-font-weight-medium);
  }

  .zdp-table-toolbar__controls,
  .zdp-table-toolbar__actions,
  .zdp-table-toolbar__density {
    align-items: center;
    display: flex;
    flex: 0 1 auto;
    flex-wrap: wrap;
    gap: var(--zdp-space-2);
    min-width: 0;
  }

  .zdp-table-toolbar__controls:empty,
  .zdp-table-toolbar__actions:empty {
    display: none;
  }

  .zdp-table-toolbar__actions {
    justify-content: flex-end;
    margin-inline-start: auto;
  }

  .zdp-table-toolbar__density-label {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-caption-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-caption-line-height);
  }

  @media (max-width: 48rem) {
    .zdp-table-toolbar__actions {
      inline-size: 100%;
      justify-content: flex-start;
      margin-inline-start: 0;
    }
  }
</style>

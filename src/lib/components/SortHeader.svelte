<script lang="ts">
  import type { ZdpSortDirection } from '../table-tools.ts';

  export let label = '정렬';
  export let direction: ZdpSortDirection = 'none';
  export let disabled = false;
  export let ariaLabel: string | null = null;
  export let onSort:
    | ((event: MouseEvent, nextDirection: Exclude<ZdpSortDirection, 'none'>) => void)
    | null = null;

  $: normalizedDirection = normalizeDirection(direction);
  $: nextDirection = normalizedDirection === 'ascending' ? 'descending' : 'ascending';
  $: directionLabel =
    normalizedDirection === 'ascending'
      ? '오름차순'
      : normalizedDirection === 'descending'
        ? '내림차순'
        : '정렬 없음';
  $: resolvedAriaLabel = ariaLabel ?? `${label} ${directionLabel}`;

  function handleClick(event: MouseEvent): void {
    if (disabled) {
      return;
    }

    onSort?.(event, nextDirection);
  }

  function normalizeDirection(value: ZdpSortDirection): ZdpSortDirection {
    if (value === 'ascending' || value === 'descending') {
      return value;
    }

    return 'none';
  }
</script>

<button
  class={`zdp-sort-header zdp-sort-header--${normalizedDirection}`}
  type="button"
  aria-label={resolvedAriaLabel}
  aria-disabled={disabled ? 'true' : undefined}
  data-sort-direction={normalizedDirection}
  disabled={disabled}
  onclick={handleClick}
>
  <span class="zdp-sort-header__label"><slot>{label}</slot></span>
  <span class="zdp-sort-header__mark" aria-hidden="true"></span>
</button>

<style>
  .zdp-sort-header {
    align-items: center;
    background: transparent;
    border: var(--zdp-control-border-width) solid transparent;
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: inherit;
    cursor: pointer;
    display: inline-flex;
    font-family: var(--zdp-font-family-sans);
    font-size: inherit;
    font-weight: inherit;
    gap: var(--zdp-space-2);
    justify-content: space-between;
    line-height: inherit;
    margin: calc(var(--zdp-space-1) * -1);
    max-width: 100%;
    min-block-size: var(--zdp-control-height-sm);
    min-width: 0;
    padding: var(--zdp-space-1) var(--zdp-space-2);
    text-align: start;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    -webkit-user-select: none;
    user-select: none;
    vertical-align: middle;
  }

  .zdp-sort-header:hover:not(:disabled) {
    background: var(--zdp-color-surface-panel);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-sort-header:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-sort-header:disabled {
    cursor: not-allowed;
    opacity: 0.56;
  }

  .zdp-sort-header__label {
    min-width: 0;
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
  }

  .zdp-sort-header__mark {
    align-items: center;
    color: var(--zdp-color-ink-muted);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: var(--zdp-type-caption-size);
    justify-content: center;
    line-height: 1;
    min-inline-size: 1em;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-sort-header__mark::before {
    content: '↕';
  }

  .zdp-sort-header--ascending .zdp-sort-header__mark::before {
    content: '↑';
  }

  .zdp-sort-header--descending .zdp-sort-header__mark::before {
    content: '↓';
  }

  .zdp-sort-header--ascending .zdp-sort-header__mark,
  .zdp-sort-header--descending .zdp-sort-header__mark {
    color: var(--zdp-color-accent-primary-strong);
  }
</style>

<script lang="ts">
  import { syncZdpFormReset } from '../form-reset';
  type DescribedBy = string | readonly string[] | null;

  export let id: string | null = null;
  export let name: string | null = null;
  export let value = '';
  export let describedBy: DescribedBy = null;
  export let errorMessageId: string | null = null;
  export let invalid = false;
  export let disabled = false;
  export let required = false;

  $: ariaDescribedBy = normalizeIdRefs(describedBy);
  $: resolvedErrorMessageId = invalid && errorMessageId ? errorMessageId : null;

  function handleChange(event: Event): void {
    value = (event.currentTarget as HTMLSelectElement).value;
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

<span class="zdp-select-shell">
  <select
    class="zdp-select"
    id={id ?? undefined}
    name={name ?? undefined}
    {value}
    aria-describedby={ariaDescribedBy ?? undefined}
    aria-errormessage={resolvedErrorMessageId ?? undefined}
    aria-invalid={invalid ? 'true' : undefined}
    {disabled}
    {required}
    onchange={handleChange}
    use:syncZdpFormReset={{ initialValue: value, onReset: (select) => { value = select.value; } }}
  >
    <slot />
  </select>
  <span class="zdp-select__arrow" aria-hidden="true"></span>
</span>

<style>
  .zdp-select-shell {
    color: var(--zdp-color-ink-muted);
    display: block;
    min-width: 0;
    position: relative;
    width: 100%;
  }

  .zdp-select {
    appearance: none;
    background: var(--zdp-control-field-surface);
    border: var(--zdp-control-border-width) solid var(--zdp-control-field-border);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-control-size);
    line-height: var(--zdp-type-control-line-height);
    min-height: var(--zdp-control-height-md);
    padding-block: 0;
    padding-inline: var(--zdp-control-padding-md) calc(var(--zdp-control-padding-md) + var(--zdp-control-indicator-size) + var(--zdp-space-2));
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    width: 100%;
  }

  .zdp-select__arrow {
    background-color: currentColor;
    block-size: var(--zdp-control-indicator-size);
    inline-size: var(--zdp-control-indicator-size);
    inset-block: 0;
    inset-inline-end: var(--zdp-control-padding-md);
    margin-block: auto;
    mask-image: var(--zdp-control-indicator-mask);
    mask-position: center;
    mask-repeat: no-repeat;
    mask-size: contain;
    pointer-events: none;
    position: absolute;
    -webkit-mask-image: var(--zdp-control-indicator-mask);
    -webkit-mask-position: center;
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-size: contain;
  }

  .zdp-select-shell:has(.zdp-select:disabled) .zdp-select__arrow {
    opacity: var(--zdp-control-disabled-opacity);
  }

  .zdp-select:hover:not(:disabled) {
    background: var(--zdp-control-field-surface-hover);
    border-color: var(--zdp-control-field-border-hover);
  }

  .zdp-select:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-select[aria-invalid="true"] {
    border-color: var(--zdp-color-accent-danger);
  }

  .zdp-select:disabled {
    cursor: not-allowed;
    opacity: var(--zdp-control-disabled-opacity);
  }

  @supports (appearance: base-select) {
    .zdp-select,
    .zdp-select::picker(select) {
      appearance: base-select;
    }

    .zdp-select {
      align-items: center;
      display: inline-flex;
      padding-block: 0;
    }

    .zdp-select::picker-icon {
      display: none;
    }

    .zdp-select::picker(select) {
      background: var(--zdp-color-surface-raised);
      border: var(--zdp-control-border-width) solid transparent;
      color: var(--zdp-color-ink-strong);
    }

    .zdp-select :global(option) {
      background-color: var(--zdp-color-surface-raised);
      color: var(--zdp-color-ink-strong);
      padding: calc(var(--zdp-space-1) / 2);
    }

    .zdp-select :global(option + option) {
      margin-block-start: calc(var(--zdp-space-1) / 2);
    }

    .zdp-select :global(option::checkmark) {
      margin-inline-start: var(--zdp-space-1);
    }

    .zdp-select :global(option:hover),
    .zdp-select :global(option:focus-visible) {
      background-color: var(--zdp-color-surface-panel);
      color: var(--zdp-color-ink-strong);
    }

    .zdp-select :global(option:checked) {
      background-color: var(--zdp-color-focus-surface);
      color: var(--zdp-color-focus-text);
    }
  }

  @media (forced-colors: active) {
    .zdp-select,
    .zdp-select::picker(select) {
      border-color: ButtonText;
    }

    .zdp-select__arrow {
      background-color: currentColor;
      color: ButtonText;
      forced-color-adjust: none;
    }
  }
</style>

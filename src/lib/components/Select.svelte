<script lang="ts">
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
  >
    <slot />
  </select>
  <svg
    class="zdp-select__arrow"
    aria-hidden="true"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 6l4 4 4-4"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />
  </svg>
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
    background: var(--zdp-color-surface-raised);
    border: var(--zdp-control-border-width) solid transparent;
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-control-size);
    line-height: var(--zdp-type-control-line-height);
    min-height: var(--zdp-control-height-md);
    padding: 0 calc(var(--zdp-space-3) + var(--zdp-control-glyph-md) + var(--zdp-space-2)) 0 var(--zdp-space-3);
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    width: 100%;
  }

  .zdp-select__arrow {
    block-size: var(--zdp-control-glyph-md);
    inline-size: var(--zdp-control-glyph-md);
    inset-block: 0;
    margin-block: auto;
    pointer-events: none;
    position: absolute;
    inset-inline-end: var(--zdp-space-3);
  }

  .zdp-select-shell:has(.zdp-select:disabled) .zdp-select__arrow {
    opacity: var(--zdp-control-disabled-opacity);
  }

  .zdp-select:hover:not(:disabled) {
    background: var(--zdp-color-accent-primary-soft);
    border-color: transparent;
  }

  .zdp-select:focus-visible {
    border-color: transparent;
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-select[aria-invalid="true"] {
    border-color: transparent;
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

    .zdp-select__arrow {
      display: none;
    }

    .zdp-select {
      padding-block: var(--zdp-space-3);
      padding-inline-end: var(--zdp-space-2);
    }

    .zdp-select::picker-icon {
      margin-inline-end: 0;
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
  }
</style>

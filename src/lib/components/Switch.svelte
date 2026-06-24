<script lang="ts">
  type DescribedBy = string | readonly string[] | null;

  export let id: string | null = null;
  export let name: string | null = null;
  export let checked = false;
  export let describedBy: DescribedBy = null;
  export let errorMessageId: string | null = null;
  export let invalid = false;
  export let disabled = false;
  export let required = false;

  $: ariaDescribedBy = normalizeIdRefs(describedBy);
  $: resolvedErrorMessageId = invalid && errorMessageId ? errorMessageId : null;

  function handleChange(event: Event): void {
    checked = (event.currentTarget as HTMLInputElement).checked;
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

<label class="zdp-switch" data-invalid={invalid ? 'true' : undefined}>
  <input
    class="zdp-switch__input"
    id={id ?? undefined}
    name={name ?? undefined}
    type="checkbox"
    role="switch"
    {checked}
    aria-describedby={ariaDescribedBy ?? undefined}
    aria-errormessage={resolvedErrorMessageId ?? undefined}
    aria-invalid={invalid ? 'true' : undefined}
    {disabled}
    {required}
    onchange={handleChange}
  />
  <span class="zdp-switch__track" aria-hidden="true"></span>
  <span class="zdp-switch__body">
    <span class="zdp-switch__label"><slot /></span>
    <slot name="help" />
  </span>
</label>

<style>
  .zdp-switch {
    align-items: start;
    color: var(--zdp-color-ink-normal);
    cursor: pointer;
    display: grid;
    font-family: var(--zdp-font-family-sans);
    gap: var(--zdp-space-3);
    grid-template-columns: var(--zdp-control-switch-width) minmax(0, 1fr);
    line-height: var(--zdp-type-body-small-line-height);
    min-width: 0;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-switch__input {
    height: 1px;
    margin: 0;
    opacity: 0;
    position: absolute;
    width: 1px;
  }

  .zdp-switch__track {
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    display: inline-flex;
    height: var(--zdp-control-switch-height);
    margin-top: var(--zdp-control-switch-thumb-offset);
    position: relative;
    -webkit-user-select: none;
    user-select: none;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease;
    width: var(--zdp-control-switch-width);
  }

  .zdp-switch__track::after {
    background: var(--zdp-color-ink-muted);
    border-radius: var(--zdp-radius-sm);
    content: "";
    height: var(--zdp-control-switch-thumb-size);
    left: var(--zdp-control-switch-thumb-offset);
    position: absolute;
    top: var(--zdp-control-switch-thumb-offset);
    transition:
      background-color var(--zdp-motion-fast) ease,
      left var(--zdp-motion-fast) ease;
    width: var(--zdp-control-switch-thumb-size);
  }

  .zdp-switch:hover .zdp-switch__input:not(:checked):not(:disabled) + .zdp-switch__track {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
  }

  .zdp-switch__input:checked + .zdp-switch__track {
    background: var(--zdp-color-accent-primary);
    border-color: var(--zdp-color-accent-primary-strong);
  }

  .zdp-switch__input:checked + .zdp-switch__track::after {
    background: var(--zdp-color-ink-inverse);
    left: var(--zdp-control-switch-thumb-checked-offset);
  }

  .zdp-switch__input:focus-visible + .zdp-switch__track {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-switch__input[aria-invalid="true"] + .zdp-switch__track {
    border-color: var(--zdp-color-accent-danger);
  }

  .zdp-switch:has(.zdp-switch__input:disabled) {
    cursor: not-allowed;
    opacity: 0.56;
  }

  .zdp-switch__body {
    display: grid;
    gap: var(--zdp-space-1);
    min-width: 0;
  }

  .zdp-switch__label {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-body-small-size);
    line-height: var(--zdp-type-body-small-line-height);
  }
</style>

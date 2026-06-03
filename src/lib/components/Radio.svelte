<script lang="ts">
  export let id: string | null = null;
  export let name: string | null = null;
  export let value: string | null = null;
  export let checked = false;
  export let describedBy: string | null = null;
  export let invalid = false;
  export let disabled = false;
  export let required = false;

  function handleChange(event: Event): void {
    checked = (event.currentTarget as HTMLInputElement).checked;
  }
</script>

<label class="zdp-choice zdp-choice--radio" data-invalid={invalid ? 'true' : undefined}>
  <input
    class="zdp-choice__input"
    id={id ?? undefined}
    name={name ?? undefined}
    type="radio"
    value={value ?? undefined}
    {checked}
    aria-describedby={describedBy ?? undefined}
    {disabled}
    {required}
    onchange={handleChange}
  />
  <span class="zdp-choice__mark" aria-hidden="true"></span>
  <span class="zdp-choice__body">
    <span class="zdp-choice__label"><slot /></span>
    <slot name="help" />
  </span>
</label>

<style>
  .zdp-choice {
    align-items: start;
    color: var(--zdp-color-ink-normal);
    cursor: pointer;
    display: grid;
    font-family: var(--zdp-font-family-sans);
    gap: var(--zdp-space-3);
    grid-template-columns: var(--zdp-control-choice-size) minmax(0, 1fr);
    line-height: var(--zdp-type-body-small-line-height);
    min-width: 0;
  }

  .zdp-choice__input {
    height: 1px;
    margin: 0;
    opacity: 0;
    position: absolute;
    width: 1px;
  }

  .zdp-choice__mark {
    align-items: center;
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong);
    border-radius: 50%;
    box-sizing: border-box;
    color: var(--zdp-color-ink-inverse);
    display: inline-flex;
    height: var(--zdp-control-choice-size);
    justify-content: center;
    margin-top: var(--zdp-control-switch-thumb-offset);
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    width: var(--zdp-control-choice-size);
  }

  .zdp-choice__mark::after {
    background: currentcolor;
    border-radius: 50%;
    content: "";
    display: none;
    height: var(--zdp-control-choice-indicator-size);
    width: var(--zdp-control-choice-indicator-size);
  }

  .zdp-choice:hover .zdp-choice__input:not(:checked):not(:disabled) + .zdp-choice__mark {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
  }

  .zdp-choice__input:checked + .zdp-choice__mark {
    background: var(--zdp-color-accent-primary);
    border-color: var(--zdp-color-accent-primary-strong);
  }

  .zdp-choice__input:checked + .zdp-choice__mark::after {
    display: block;
  }

  .zdp-choice__input:focus-visible + .zdp-choice__mark {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-choice[data-invalid="true"] .zdp-choice__mark {
    border-color: var(--zdp-color-accent-danger);
  }

  .zdp-choice:has(.zdp-choice__input:disabled) {
    cursor: not-allowed;
    opacity: 0.56;
  }

  .zdp-choice__body {
    display: grid;
    gap: var(--zdp-space-1);
    min-width: 0;
  }

  .zdp-choice__label {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-body-small-size);
    line-height: var(--zdp-type-body-small-line-height);
  }
</style>

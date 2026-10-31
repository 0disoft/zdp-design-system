<script lang="ts">
  import { syncZdpFormReset } from '../form-reset.js';
  interface Props {
    id?: string | null;
    name?: string | null;
    value?: string | null;
    checked?: boolean;
    describedBy?: string | null;
    invalid?: boolean;
    disabled?: boolean;
    required?: boolean;
  }

  let {
    id = $bindable(null),
    name = $bindable(null),
    value = $bindable(null),
    checked = $bindable(false),
    describedBy = $bindable(null),
    invalid = $bindable(false),
    disabled = $bindable(false),
    required = $bindable(false)
  }: Props = $props();

  function handleChange(event: Event): void {
    checked = (event.currentTarget as HTMLInputElement).checked;
  }
</script>

<label class="zdp-choice zdp-choice--checkbox" data-invalid={invalid ? 'true' : undefined}>
  <input
    class="zdp-choice__input"
    id={id ?? undefined}
    name={name ?? undefined}
    type="checkbox"
    value={value ?? undefined}
    {checked}
    aria-describedby={describedBy ?? undefined}
    aria-invalid={invalid ? 'true' : undefined}
    {disabled}
    {required}
    onchange={handleChange}
    use:syncZdpFormReset={{ initialChecked: checked, onReset: (input) => { checked = input.checked; } }}
  />
  <span class="zdp-choice__mark" aria-hidden="true"></span>
  <span class="zdp-choice__body">
    <span class="zdp-choice__label"><!-- svelte-ignore slot_element_deprecated public slot compatibility --><slot /></span>
    <!-- svelte-ignore slot_element_deprecated public slot compatibility --><slot name="help" />
  </span>
</label>

<style>
  .zdp-choice {
    align-items: start;
    color: var(--zdp-color-ink-normal);
    cursor: pointer;
    display: grid;
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-body-small-size);
    gap: var(--zdp-space-3);
    grid-template-columns: var(--zdp-control-choice-size) minmax(0, 1fr);
    line-height: var(--zdp-type-body-small-line-height);
    min-width: 0;
    -webkit-user-select: none;
    user-select: none;
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
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-strong);
    display: inline-flex;
    height: var(--zdp-control-choice-size);
    justify-content: center;
    /* Follow the first label line, including when the label wraps. */
    margin-top: max(0px, calc((1lh - var(--zdp-control-choice-size)) / 2 + 0.0625em));
    -webkit-user-select: none;
    user-select: none;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    width: var(--zdp-control-choice-size);
  }

  .zdp-choice--checkbox .zdp-choice__mark::after {
    background: currentcolor;
    content: "";
    display: none;
    height: var(--zdp-control-glyph-sm);
    /* Keep the glyph self-contained for consumers with a strict image CSP. */
    clip-path: polygon(20% 36%, 42% 58%, 78% 22%, 87% 31%, 42% 76%, 11% 45%);
    width: var(--zdp-control-glyph-sm);
  }

  :where(.zdp-choice:hover) .zdp-choice__input:where(:not(:checked):not(:disabled)) + .zdp-choice__mark {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
  }

  .zdp-choice__input:checked + .zdp-choice__mark {
    background: var(--zdp-color-accent-primary-strong);
    border-color: var(--zdp-color-accent-primary-strong);
    color: var(--zdp-color-ink-inverse);
  }

  .zdp-choice__input:checked + .zdp-choice__mark::after {
    display: block;
  }

  .zdp-choice__input:focus-visible + .zdp-choice__mark {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-choice__input[aria-invalid="true"] + .zdp-choice__mark {
    border-color: var(--zdp-color-accent-danger);
  }

  .zdp-choice:has(.zdp-choice__input:disabled) {
    cursor: not-allowed;
    opacity: var(--zdp-control-disabled-opacity);
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

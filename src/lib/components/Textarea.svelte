<script lang="ts">
  type DescribedBy = string | readonly string[] | null;

  export let id: string | null = null;
  export let name: string | null = null;
  export let value = '';
  export let placeholder: string | null = null;
  export let describedBy: DescribedBy = null;
  export let errorMessageId: string | null = null;
  export let invalid = false;
  export let disabled = false;
  export let readonly = false;
  export let required = false;
  export let rows = 4;

  $: ariaDescribedBy = normalizeIdRefs(describedBy);
  $: resolvedErrorMessageId = invalid && errorMessageId ? errorMessageId : null;

  function handleInput(event: Event): void {
    value = (event.currentTarget as HTMLTextAreaElement).value;
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

<textarea
  class="zdp-textarea"
  id={id ?? undefined}
  name={name ?? undefined}
  {value}
  placeholder={placeholder ?? undefined}
  aria-describedby={ariaDescribedBy ?? undefined}
  aria-errormessage={resolvedErrorMessageId ?? undefined}
  aria-invalid={invalid ? 'true' : undefined}
  {disabled}
  readonly={readonly}
  {required}
  {rows}
  oninput={handleInput}
></textarea>

<style>
  .zdp-textarea {
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-control-size);
    line-height: var(--zdp-font-line-height-normal);
    min-height: 7rem;
    padding: var(--zdp-space-3);
    resize: vertical;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    width: 100%;
  }

  .zdp-textarea::placeholder {
    color: var(--zdp-color-ink-muted);
  }

  .zdp-textarea:hover:not(:disabled) {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
  }

  .zdp-textarea:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-textarea[aria-invalid="true"] {
    border-color: var(--zdp-color-accent-danger);
  }

  .zdp-textarea[readonly] {
    background: var(--zdp-color-surface-raised);
    color: var(--zdp-color-ink-normal);
  }

  .zdp-textarea[readonly]:hover {
    background: var(--zdp-color-surface-raised);
  }

  .zdp-textarea:disabled {
    cursor: not-allowed;
    opacity: 0.56;
  }
</style>

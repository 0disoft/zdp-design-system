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
    if (Array.isArray(value)) {
      const normalized = value.map((entry) => entry.trim()).filter(Boolean);
      return normalized.length > 0 ? normalized.join(' ') : null;
    }

    const normalized = value?.trim();
    return normalized ? normalized : null;
  }
</script>

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

<style>
  .zdp-select {
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-control-size);
    line-height: var(--zdp-type-control-line-height);
    min-height: var(--zdp-control-height-md);
    padding: 0 var(--zdp-space-3);
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    width: 100%;
  }

  .zdp-select:hover:not(:disabled) {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
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
    opacity: 0.56;
  }
</style>

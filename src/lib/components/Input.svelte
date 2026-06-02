<script lang="ts">
  export let id: string | null = null;
  export let name: string | null = null;
  export let type = 'text';
  export let value = '';
  export let placeholder: string | null = null;
  export let autocomplete: string | null = null;
  export let describedBy: string | null = null;
  export let invalid = false;
  export let disabled = false;
  export let required = false;

  function handleInput(event: Event): void {
    value = (event.currentTarget as HTMLInputElement).value;
  }
</script>

<input
  class="zdp-input"
  id={id ?? undefined}
  name={name ?? undefined}
  {type}
  {value}
  placeholder={placeholder ?? undefined}
  autocomplete={autocomplete ?? undefined}
  aria-describedby={describedBy ?? undefined}
  aria-invalid={invalid ? 'true' : undefined}
  {disabled}
  {required}
  oninput={handleInput}
/>

<style>
  .zdp-input {
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

  .zdp-input::placeholder {
    color: var(--zdp-color-ink-muted);
  }

  .zdp-input:hover:not(:disabled) {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
  }

  .zdp-input:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-input[aria-invalid="true"] {
    border-color: var(--zdp-color-accent-danger);
  }

  .zdp-input:disabled {
    cursor: not-allowed;
    opacity: 0.56;
  }
</style>

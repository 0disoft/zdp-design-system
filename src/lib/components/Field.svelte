<script lang="ts">
  export let gap: 'sm' | 'md' = 'md';
  export let invalid = false;
  export let disabled = false;
  export let readonly = false;
  export let required = false;
</script>

<div
  class={`zdp-field zdp-field--${gap}`}
  data-invalid={invalid ? 'true' : undefined}
  data-disabled={disabled ? 'true' : undefined}
  data-readonly={readonly ? 'true' : undefined}
  data-required={required ? 'true' : undefined}
>
  <slot />
</div>

<style>
  .zdp-field {
    display: grid;
    gap: var(--zdp-space-2);
    min-width: 0;
  }

  .zdp-field--sm {
    gap: var(--zdp-space-1);
  }

  .zdp-field--md {
    gap: var(--zdp-space-2);
  }

  .zdp-field[data-disabled="true"] :global(.zdp-label),
  .zdp-field[data-disabled="true"] :global(.zdp-help-text) {
    color: var(--zdp-color-ink-muted);
  }
</style>

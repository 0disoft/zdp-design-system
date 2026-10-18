<script lang="ts">
  interface Props {
    gap?: 'sm' | 'md';
    invalid?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
  }

  let {
    gap = $bindable('md'),
    invalid = $bindable(false),
    disabled = $bindable(false),
    readonly = $bindable(false),
    required = $bindable(false)
  }: Props = $props();
</script>

<div
  class={`zdp-field zdp-field--${gap}`}
  data-invalid={invalid ? 'true' : undefined}
  data-disabled={disabled ? 'true' : undefined}
  data-readonly={readonly ? 'true' : undefined}
  data-required={required ? 'true' : undefined}
>
  <!-- svelte-ignore slot_element_deprecated public slot compatibility --><slot />
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

  .zdp-field[data-disabled="true"] :global(.zdp-input:not(:disabled)),
  .zdp-field[data-disabled="true"] :global(.zdp-textarea:not(:disabled)),
  .zdp-field[data-disabled="true"] :global(.zdp-select:not(:disabled)) {
    opacity: var(--zdp-control-disabled-opacity);
  }
</style>

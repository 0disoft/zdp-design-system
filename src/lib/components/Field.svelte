<script lang="ts">
  export let gap: 'sm' | 'md' = 'md';
  export let invalid = false;
</script>

<div class={`zdp-field zdp-field--${gap}`} data-invalid={invalid ? 'true' : undefined}>
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
</style>

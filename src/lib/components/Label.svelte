<script lang="ts">
  export let forId: string | null = null;
  export let required = false;
</script>

<label class="zdp-label" for={forId ?? undefined}>
  <slot />
  {#if required}
    <span class="zdp-label__required" aria-hidden="true">*</span>
  {/if}
</label>

<style>
  .zdp-label {
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-label-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-label-line-height);
  }

  .zdp-label__required {
    color: var(--zdp-color-accent-danger);
    margin-left: var(--zdp-space-1);
  }
</style>

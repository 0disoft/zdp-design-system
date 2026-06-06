<script lang="ts">
  export let forId: string | null = null;
  export let required = false;
  export let requiredLabel = '필수';
</script>

<label class="zdp-label" for={forId ?? undefined}>
  <slot />
  {#if required}
    <span class="zdp-label__required" aria-hidden="true">*</span>
    <span class="zdp-label__required-text">({requiredLabel})</span>
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
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-label__required-text {
    border: 0;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }
</style>

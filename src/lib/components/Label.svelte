<script lang="ts">
  interface Props {
    forId?: string | null;
    required?: boolean;
    requiredLabel?: string;
  }

  let {
    forId = $bindable(null),
    required = $bindable(false),
    requiredLabel = $bindable('Required')
  }: Props = $props();
</script>

<label class="zdp-label" for={forId ?? undefined}>
  <!-- svelte-ignore slot_element_deprecated public slot compatibility --><slot />
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

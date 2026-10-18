<script lang="ts">
  interface Props {
    align?: 'start' | 'center';
    tone?: 'panel' | 'raised';
    labelledBy?: string | null;
  }

  let {
    align = $bindable('start'),
    tone = $bindable('panel'),
    labelledBy = $bindable(null)
  }: Props = $props();
</script>

<section
  class={`zdp-empty-state zdp-empty-state--align-${align} zdp-empty-state--${tone}`}
  aria-labelledby={labelledBy ?? undefined}
>
  <div class="zdp-empty-state__body">
    <!-- svelte-ignore slot_element_deprecated public slot compatibility --><slot />
  </div>
  <div class="zdp-empty-state__actions">
    <!-- svelte-ignore slot_element_deprecated public slot compatibility --><slot name="actions" />
  </div>
</section>

<style>
  .zdp-empty-state {
    background: var(--zdp-color-surface-panel);
    border: 1px solid transparent;
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-normal);
    display: grid;
    font-family: var(--zdp-font-family-sans);
    gap: var(--zdp-space-4);
    min-width: 0;
    padding: clamp(var(--zdp-space-4), 4%, var(--zdp-space-6));
  }

  .zdp-empty-state--raised {
    background: var(--zdp-color-surface-raised);
  }

  .zdp-empty-state--align-center {
    justify-items: center;
    text-align: center;
  }

  .zdp-empty-state__body {
    display: grid;
    gap: var(--zdp-space-2);
    max-inline-size: 36rem;
    min-width: 0;
  }

  .zdp-empty-state__body :global(*) {
    margin-block: 0;
  }

  .zdp-empty-state__body :global(strong),
  .zdp-empty-state__body :global(h2),
  .zdp-empty-state__body :global(h3) {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-body-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-body-line-height);
  }

  .zdp-empty-state__body :global(p) {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-body-small-size);
    line-height: var(--zdp-type-body-small-line-height);
  }

  .zdp-empty-state__actions {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--zdp-space-2);
    min-width: 0;
  }

  .zdp-empty-state--align-center .zdp-empty-state__actions {
    justify-content: center;
  }
</style>

<script lang="ts">
  export let tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger' = 'neutral';
  export let labelledBy: string | null = null;
  export let semanticRole: 'note' | 'status' | 'alert' | null = null;
</script>

<section
  class={`zdp-callout zdp-callout--${tone}`}
  aria-labelledby={labelledBy ?? undefined}
  role={semanticRole ?? undefined}
>
  <span class="zdp-callout__mark" aria-hidden="true"></span>
  <div class="zdp-callout__body">
    <slot />
  </div>
</section>

<style>
  .zdp-callout {
    align-items: start;
    background: var(--zdp-color-surface-panel);
    border: 1px solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-normal);
    display: grid;
    font-family: var(--zdp-font-family-sans);
    gap: var(--zdp-space-3);
    grid-template-columns: var(--zdp-space-2) minmax(0, 1fr);
    line-height: var(--zdp-type-body-small-line-height);
    min-width: 0;
    padding: var(--zdp-space-4);
  }

  .zdp-callout__mark {
    align-self: start;
    background: var(--zdp-color-line-strong);
    border-radius: var(--zdp-radius-sm);
    display: block;
    height: calc(var(--zdp-type-body-small-size) * var(--zdp-type-body-small-line-height));
    -webkit-user-select: none;
    user-select: none;
    width: var(--zdp-space-2);
  }

  .zdp-callout__body {
    display: grid;
    gap: var(--zdp-space-2);
    min-width: 0;
  }

  .zdp-callout__body :global(*) {
    margin-bottom: 0;
    margin-top: 0;
  }

  .zdp-callout__body :global(strong) {
    color: var(--zdp-color-ink-strong);
    font-weight: var(--zdp-font-weight-semibold);
  }

  .zdp-callout--info .zdp-callout__mark {
    background: var(--zdp-color-accent-primary);
  }

  .zdp-callout--success .zdp-callout__mark {
    background: var(--zdp-color-accent-success);
  }

  .zdp-callout--warning .zdp-callout__mark {
    background: var(--zdp-color-accent-warning);
  }

  .zdp-callout--danger {
    border-color: var(--zdp-color-accent-danger);
  }

  .zdp-callout--danger .zdp-callout__mark {
    background: var(--zdp-color-accent-danger);
  }
</style>

<script lang="ts">
  import { feedbackMarkPath } from '../feedback-mark.js';

  interface Props {
    tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
    labelledBy?: string | null;
    semanticRole?: 'note' | 'status' | 'alert' | null;
  }

  let {
    tone = $bindable('neutral'),
    labelledBy = $bindable(null),
    semanticRole = $bindable(null)
  }: Props = $props();
</script>

<section
  class={`zdp-callout zdp-callout--${tone}`}
  aria-labelledby={labelledBy ?? undefined}
  role={semanticRole ?? undefined}
>
  <span class="zdp-callout__mark" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d={feedbackMarkPath[tone]} />
    </svg>
  </span>
  <div class="zdp-callout__body">
    <!-- svelte-ignore slot_element_deprecated public slot compatibility --><slot />
  </div>
</section>

<style>
  .zdp-callout {
    align-items: start;
    background: var(--zdp-color-surface-raised);
    border: 1px solid transparent;
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-normal);
    display: grid;
    font-family: var(--zdp-font-family-sans);
    gap: var(--zdp-space-3);
    grid-template-columns: var(--zdp-control-glyph-md) minmax(0, 1fr);
    line-height: var(--zdp-type-body-small-line-height);
    min-width: 0;
    padding: var(--zdp-space-4);
  }

  .zdp-callout__mark {
    align-self: start;
    align-items: center;
    color: var(--zdp-color-ink-muted);
    display: grid;
    min-block-size: calc(var(--zdp-type-body-small-size) * var(--zdp-type-body-small-line-height));
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-callout__mark :global(svg) {
    inline-size: 100%;
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
    color: var(--zdp-color-accent-primary-strong);
  }

  .zdp-callout--success .zdp-callout__mark {
    color: var(--zdp-color-accent-success);
  }

  .zdp-callout--warning .zdp-callout__mark {
    color: var(--zdp-color-accent-warning);
  }

  .zdp-callout--danger .zdp-callout__mark {
    color: var(--zdp-color-accent-danger);
  }
</style>

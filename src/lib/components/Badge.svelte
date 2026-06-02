<script lang="ts">
  export let tone: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' = 'neutral';
  export let size: 'sm' | 'md' = 'md';
</script>

<span class={`zdp-badge zdp-badge--${tone} zdp-badge--${size}`}>
  <slot />
</span>

<style>
  .zdp-badge {
    align-items: center;
    background: var(--zdp-color-surface-panel);
    border: 1px solid var(--zdp-color-line-strong);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-strong);
    display: inline-flex;
    font-family: var(--zdp-font-family-sans);
    font-weight: var(--zdp-font-weight-medium);
    justify-content: center;
    line-height: var(--zdp-type-caption-line-height);
    max-width: 100%;
    min-width: 0;
    text-decoration: none;
    white-space: nowrap;
  }

  .zdp-badge--sm {
    font-size: var(--zdp-font-size-xs);
    min-height: var(--zdp-control-height-sm);
    padding: 0 var(--zdp-space-2);
  }

  .zdp-badge--md {
    font-size: var(--zdp-type-caption-size);
    min-height: var(--zdp-control-height-sm);
    padding: 0 var(--zdp-space-3);
  }

  .zdp-badge--primary {
    background: var(--zdp-color-accent-primary-soft);
    border-color: var(--zdp-color-accent-primary-strong);
    color: var(--zdp-color-accent-primary-strong);
  }

  .zdp-badge--success {
    border-color: var(--zdp-color-accent-success);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-badge--warning {
    border-color: var(--zdp-color-accent-warning);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-badge--danger {
    border-color: var(--zdp-color-accent-danger);
    color: var(--zdp-color-accent-danger);
  }
</style>

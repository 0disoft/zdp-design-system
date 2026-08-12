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
    border: 1px solid transparent;
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

  .zdp-badge::before {
    background: var(--zdp-color-line-strong);
    border-radius: 50%;
    content: '';
    flex: 0 0 auto;
    height: 0.4em;
    margin-inline-end: var(--zdp-space-1);
    width: 0.4em;
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
    color: var(--zdp-color-ink-strong);
  }

  .zdp-badge--primary::before {
    background: var(--zdp-color-accent-primary-strong);
  }

  .zdp-badge--success {
    color: var(--zdp-color-ink-strong);
  }

  .zdp-badge--success::before {
    background: var(--zdp-color-accent-success);
  }

  .zdp-badge--warning {
    color: var(--zdp-color-ink-strong);
  }

  .zdp-badge--warning::before {
    background: var(--zdp-color-accent-warning);
  }

  .zdp-badge--danger {
    color: var(--zdp-color-accent-danger);
  }

  .zdp-badge--danger::before {
    background: var(--zdp-color-accent-danger);
  }
</style>

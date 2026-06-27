<script lang="ts">
  import type { ZdpToastTone } from '../toast';

  export let tone: ZdpToastTone = 'neutral';
  export let labelledBy: string | null = null;
  export let describedBy: string | null = null;
  export let semanticRole: 'status' | 'alert' | 'note' | null = null;
  export let live: 'off' | 'polite' | 'assertive' | null = null;
  export let atomic = true;
  export let dismissLabel = 'Dismiss notification';
  export let onClose: ((event: MouseEvent) => void) | null = null;

  $: resolvedRole = semanticRole ?? (tone === 'danger' ? 'alert' : 'status');
  $: resolvedLive = live === 'off' ? undefined : live ?? (tone === 'danger' ? 'assertive' : 'polite');
  $: resolvedAtomic = live === 'off' ? undefined : atomic;
</script>

<div
  class={`zdp-toast zdp-toast--${tone}`}
  aria-labelledby={labelledBy ?? undefined}
  aria-describedby={describedBy ?? undefined}
  aria-live={resolvedLive}
  aria-atomic={resolvedAtomic}
  role={resolvedRole ?? undefined}
>
  <span class="zdp-toast__mark" aria-hidden="true"></span>
  <div class="zdp-toast__body">
    <slot />
  </div>
  {#if onClose}
    <button class="zdp-toast__close" type="button" aria-label={dismissLabel} onclick={onClose}>
      <span aria-hidden="true">×</span>
    </button>
  {/if}
</div>

<style>
  .zdp-toast {
    align-items: start;
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-normal);
    display: grid;
    font-family: var(--zdp-font-family-sans);
    gap: var(--zdp-space-3);
    grid-template-columns: var(--zdp-space-2) minmax(0, 1fr) auto;
    inline-size: min(100%, 28rem);
    line-height: var(--zdp-type-body-small-line-height);
    min-width: 0;
    padding: var(--zdp-space-4);
  }

  .zdp-toast__mark {
    align-self: stretch;
    background: var(--zdp-color-line-strong);
    border-radius: var(--zdp-radius-sm);
    display: block;
    min-block-size: calc(var(--zdp-type-body-small-size) * var(--zdp-type-body-small-line-height));
    -webkit-user-select: none;
    user-select: none;
    width: var(--zdp-space-2);
  }

  .zdp-toast__body {
    display: grid;
    gap: var(--zdp-space-1);
    min-width: 0;
  }

  .zdp-toast__body :global(*) {
    margin-bottom: 0;
    margin-top: 0;
  }

  .zdp-toast__body :global(strong),
  .zdp-toast__body :global(.zdp-toast__title) {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-body-small-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-body-small-line-height);
  }

  .zdp-toast__body :global(p),
  .zdp-toast__body :global(.zdp-toast__message) {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-caption-size);
    line-height: var(--zdp-type-caption-line-height);
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
  }

  .zdp-toast__body :global(.zdp-toast__action) {
    align-items: center;
    align-self: start;
    background: transparent;
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    color: var(--zdp-color-ink-strong);
    cursor: pointer;
    display: inline-flex;
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-caption-size);
    font-weight: var(--zdp-font-weight-medium);
    justify-content: center;
    line-height: var(--zdp-type-caption-line-height);
    margin-block-start: var(--zdp-space-3);
    min-height: var(--zdp-control-height-sm);
    padding: 0 var(--zdp-space-3);
    text-decoration-line: none;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-toast__body :global(.zdp-toast__action:hover) {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
  }

  .zdp-toast__body :global(.zdp-toast__action:focus-visible) {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-toast__close {
    align-items: center;
    background: transparent;
    border: var(--zdp-control-border-width) solid transparent;
    border-radius: var(--zdp-control-radius);
    color: var(--zdp-color-ink-muted);
    cursor: pointer;
    display: inline-flex;
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-title-size);
    height: var(--zdp-control-height-sm);
    justify-content: center;
    line-height: 1;
    padding: 0;
    -webkit-user-select: none;
    user-select: none;
    width: var(--zdp-control-height-sm);
  }

  .zdp-toast__close:hover {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-toast__close:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-toast--info .zdp-toast__mark {
    background: var(--zdp-color-accent-primary);
  }

  .zdp-toast--success .zdp-toast__mark {
    background: var(--zdp-color-accent-success);
  }

  .zdp-toast--warning .zdp-toast__mark {
    background: var(--zdp-color-accent-warning);
  }

  .zdp-toast--danger {
    border-color: var(--zdp-color-accent-danger);
  }

  .zdp-toast--danger .zdp-toast__mark {
    background: var(--zdp-color-accent-danger);
  }
</style>

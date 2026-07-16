<script lang="ts">
  import { toZdpDomId } from '../dom-id';
  import Toast from './Toast.svelte';
  import type { ZdpStatusToastItem } from '../toast';

  type Placement =
    | 'inline'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end';

  interface Props {
    items?: readonly ZdpStatusToastItem[];
    placement?: Placement;
    idPrefix?: string;
    ariaLabel?: string;
    labelledBy?: string | null;
    onDismiss?: ((event: MouseEvent, item: ZdpStatusToastItem) => void) | null;
  }

  const componentId = $props.id();
  const fallbackIdPrefix = `zdp-status-toast-${componentId}`;
  let {
    items = [],
    placement = 'bottom-end',
    idPrefix = fallbackIdPrefix,
    ariaLabel = 'Status notifications',
    labelledBy = null,
    onDismiss = null
  }: Props = $props();

  const resolvedIdPrefix = $derived(toZdpDomId(idPrefix, fallbackIdPrefix));

  function titleId(item: ZdpStatusToastItem): string | null {
    return item.title ? `${resolvedIdPrefix}-${toDomId(item.id)}-title` : null;
  }

  function messageId(item: ZdpStatusToastItem): string {
    return `${resolvedIdPrefix}-${toDomId(item.id)}-message`;
  }

  function handleDismiss(event: MouseEvent, item: ZdpStatusToastItem): void {
    onDismiss?.(event, item);
  }

  function handleAction(event: MouseEvent, item: ZdpStatusToastItem): void {
    item.onclick?.(event, item);
  }

  function resolvedRel(item: ZdpStatusToastItem): string | undefined {
    return item.target === '_blank' ? item.rel ?? 'noopener noreferrer' : item.rel;
  }

  function toDomId(id: string): string {
    return toZdpDomId(id, 'item');
  }
</script>

<div
  class={`zdp-status-toast zdp-status-toast--${placement}`}
  aria-label={labelledBy ? undefined : ariaLabel}
  aria-labelledby={labelledBy ?? undefined}
  role="group"
>
  {#each items as item (item.id)}
    <Toast
      tone={item.tone ?? 'neutral'}
      labelledBy={titleId(item)}
      describedBy={messageId(item)}
      dismissLabel={item.dismissLabel ?? 'Dismiss notification'}
      onClose={onDismiss ? (event) => handleDismiss(event, item) : null}
    >
      {#if item.title}
        <strong class="zdp-toast__title" id={titleId(item) ?? undefined}>{item.title}</strong>
      {/if}
      <p class="zdp-toast__message" id={messageId(item)}>{item.message}</p>
      {#if item.actionLabel}
        {#if item.href}
          <a
            class="zdp-toast__action"
            href={item.href}
            target={item.target}
            rel={resolvedRel(item)}
            onclick={item.onclick ? (event) => handleAction(event, item) : undefined}
          >
            {item.actionLabel}
          </a>
        {:else if item.onclick}
          <button class="zdp-toast__action" type="button" onclick={(event) => handleAction(event, item)}>
            {item.actionLabel}
          </button>
        {/if}
      {/if}
    </Toast>
  {/each}
</div>

<style>
  .zdp-status-toast {
    box-sizing: border-box;
    display: grid;
    gap: var(--zdp-space-3);
    inline-size: min(28rem, calc(var(--zdp-viewport-inline) - var(--zdp-space-6)));
    max-inline-size: 100%;
    pointer-events: none;
    z-index: var(--zdp-layer-toast);
  }

  .zdp-status-toast :global(.zdp-toast) {
    pointer-events: auto;
  }

  .zdp-status-toast--inline {
    inline-size: min(100%, 28rem);
    position: static;
  }

  .zdp-status-toast--top-start,
  .zdp-status-toast--top-end,
  .zdp-status-toast--bottom-start,
  .zdp-status-toast--bottom-end {
    position: fixed;
  }

  .zdp-status-toast--top-start {
    left: max(var(--zdp-space-4), var(--zdp-viewport-safe-inline-start));
    top: max(var(--zdp-space-4), var(--zdp-viewport-safe-block-start));
  }

  .zdp-status-toast--top-end {
    right: max(var(--zdp-space-4), var(--zdp-viewport-safe-inline-end));
    top: max(var(--zdp-space-4), var(--zdp-viewport-safe-block-start));
  }

  .zdp-status-toast--bottom-start {
    bottom: max(var(--zdp-space-4), var(--zdp-viewport-safe-block-end));
    left: max(var(--zdp-space-4), var(--zdp-viewport-safe-inline-start));
  }

  .zdp-status-toast--bottom-end {
    bottom: max(var(--zdp-space-4), var(--zdp-viewport-safe-block-end));
    right: max(var(--zdp-space-4), var(--zdp-viewport-safe-inline-end));
  }

  @media (max-width: 42rem) {
    .zdp-status-toast--top-start,
    .zdp-status-toast--top-end,
    .zdp-status-toast--bottom-start,
    .zdp-status-toast--bottom-end {
      left: max(var(--zdp-space-3), var(--zdp-viewport-safe-inline-start));
      right: max(var(--zdp-space-3), var(--zdp-viewport-safe-inline-end));
    }
  }
</style>

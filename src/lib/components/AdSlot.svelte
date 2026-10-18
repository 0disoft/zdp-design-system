<script lang="ts">
  import type { ZdpAdSlotPlacement, ZdpAdSlotState } from '../ad-slot.js';

  type DescribedBy = string | readonly string[] | null;

  interface Props {
    placement?: ZdpAdSlotPlacement;
    state?: ZdpAdSlotState;
    label?: string;
    fallbackText?: string | null;
    minHeight?: string | null;
    reserved?: boolean;
    id?: string | null;
    describedBy?: DescribedBy;
  }

  let {
    placement = $bindable('inline'),
    state = $bindable('pending'),
    label = $bindable('Advertisement'),
    fallbackText = $bindable(null),
    minHeight = $bindable(null),
    reserved = $bindable(true),
    id = $bindable(null),
    describedBy = $bindable(null)
  }: Props = $props();

  function defaultMinHeight(currentPlacement: ZdpAdSlotPlacement): string {
    switch (currentPlacement) {
      case 'banner':
        return '5.5rem';
      case 'rail':
        return '12rem';
      case 'between-sections':
        return '4rem';
      default:
        return '4rem';
    }
  }

  function normalizeIdRefs(value: DescribedBy): string | null {
    if (value === null) {
      return null;
    }

    if (typeof value === 'string') {
      const normalized = value.trim();
      return normalized ? normalized : null;
    }

    const normalized = value.map((entry) => entry.trim()).filter(Boolean);
    return normalized.length > 0 ? normalized.join(' ') : null;
  }
  // Only blocked/empty states render a neutral fallback; provider markup stays consumer-owned.
  let showFallback = $derived(state === 'blocked' || state === 'empty');
  let resolvedFallbackText = $derived(fallbackText ?? label);
  let reservedHeight = $derived(reserved ? minHeight ?? defaultMinHeight(placement) : null);
  let ariaDescribedBy = $derived(normalizeIdRefs(describedBy));
</script>

<aside
  class={`zdp-ad-slot zdp-ad-slot--${placement} zdp-ad-slot--${state}${reserved ? ' zdp-ad-slot--reserved' : ''}`}
  id={id ?? undefined}
  aria-label={label}
  aria-describedby={ariaDescribedBy ?? undefined}
  data-zdp-ad-slot
  data-zdp-ad-placement={placement}
  data-zdp-ad-state={state}
  data-zdp-ad-reserved={reserved ? 'true' : 'false'}
  style:min-height={reservedHeight}
>
  {#if showFallback}
    <p class="zdp-ad-slot__fallback">{resolvedFallbackText}</p>
  {/if}
  <!-- svelte-ignore slot_element_deprecated public slot compatibility --><slot />
</aside>

<style>
  .zdp-ad-slot {
    align-content: center;
    align-items: center;
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-muted);
    display: grid;
    font-family: var(--zdp-font-family-sans);
    justify-items: stretch;
    min-width: 0;
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
    padding: var(--zdp-space-3);
  }

  .zdp-ad-slot--reserved {
    overflow: hidden;
  }

  .zdp-ad-slot--banner {
    inline-size: 100%;
  }

  .zdp-ad-slot--between-sections {
    inline-size: 100%;
  }

  .zdp-ad-slot--rail {
    align-content: start;
    block-size: 100%;
    inline-size: 100%;
  }

  .zdp-ad-slot--filled {
    color: var(--zdp-color-ink-normal);
    padding: 0;
  }

  .zdp-ad-slot--filled :global(*) {
    margin: 0;
    max-inline-size: 100%;
    min-width: 0;
  }

  .zdp-ad-slot__fallback {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-caption-size);
    justify-self: center;
    line-height: var(--zdp-type-caption-line-height);
    margin: 0;
    text-align: center;
  }

  .zdp-ad-slot--blocked {
    border-color: var(--zdp-color-line-strong);
    border-style: dashed;
  }

  .zdp-ad-slot--empty .zdp-ad-slot__fallback {
    opacity: 0.72;
  }

  @media (max-width: 48rem) {
    .zdp-ad-slot--rail {
      block-size: auto;
    }
  }
</style>

<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { createZdpDismissLayer } from '../dismiss-layer';

  type Placement = 'top' | 'right' | 'bottom' | 'left';

  interface Props {
    text: string;
    placement?: Placement;
    id?: string | null;
    disabled?: boolean;
  }

  const componentId = $props.id();
  const fallbackId = `zdp-tooltip-${componentId}`;
  let { text, placement = 'top', id = null, disabled = false }: Props = $props();

  let rootElement = $state<HTMLElement | null>(null);
  let contentElement = $state<HTMLElement | null>(null);
  let dismissed = $state(false);
  let pointerInside = $state(false);
  let focusInside = $state(false);
  const dismissLayer = createZdpDismissLayer();

  const tooltipId = $derived(id ?? fallbackId);
  const describedBy = $derived(disabled ? null : tooltipId);
  const visible = $derived(!disabled && !dismissed && (pointerInside || focusInside));

  $effect(() => {
    const root = rootElement;
    const content = contentElement;
    const preferredPlacement = placement;
    const currentText = text;
    const view = root?.ownerDocument.defaultView;
    if (!visible || !root || !content || !view || !currentText) return;
    let frame = 0;
    const update = () => {
      content.style.translate = 'none';
      const trigger = root.getBoundingClientRect();
      const box = content.getBoundingClientRect();
      const gap = Number.parseFloat(view.getComputedStyle(content).paddingRight) || 0;
      const viewport = view.visualViewport;
      const minX = (viewport?.offsetLeft ?? 0) + gap;
      const minY = (viewport?.offsetTop ?? 0) + gap;
      const maxX = minX + (viewport?.width ?? view.innerWidth) - 2 * gap;
      const maxY = minY + (viewport?.height ?? view.innerHeight) - 2 * gap;
      let left = box.left;
      let top = box.top;
      if (preferredPlacement === 'top' && top < minY && trigger.bottom + gap + box.height <= maxY) top = trigger.bottom + gap;
      if (preferredPlacement === 'bottom' && box.bottom > maxY && trigger.top - gap - box.height >= minY) top = trigger.top - gap - box.height;
      if (preferredPlacement === 'left' && left < minX && trigger.right + gap + box.width <= maxX) left = trigger.right + gap;
      if (preferredPlacement === 'right' && box.right > maxX && trigger.left - gap - box.width >= minX) left = trigger.left - gap - box.width;
      left = Math.max(minX, Math.min(left, maxX - box.width));
      top = Math.max(minY, Math.min(top, maxY - box.height));
      const scaleX = root.offsetWidth ? trigger.width / root.offsetWidth : 1;
      const scaleY = root.offsetHeight ? trigger.height / root.offsetHeight : 1;
      content.style.translate = `${(left - box.left) / (scaleX || 1)}px ${(top - box.top) / (scaleY || 1)}px`;
    };
    const schedule = () => {
      view.cancelAnimationFrame(frame);
      frame = view.requestAnimationFrame(update);
    };
    update();
    const observer = new view.ResizeObserver(schedule);
    observer.observe(root);
    observer.observe(content);
    view.addEventListener('resize', schedule);
    root.ownerDocument.addEventListener('scroll', schedule, true);
    view.visualViewport?.addEventListener('resize', schedule);
    view.visualViewport?.addEventListener('scroll', schedule);
    return () => {
      observer.disconnect();
      view.cancelAnimationFrame(frame);
      view.removeEventListener('resize', schedule);
      root.ownerDocument.removeEventListener('scroll', schedule, true);
      view.visualViewport?.removeEventListener('resize', schedule);
      view.visualViewport?.removeEventListener('scroll', schedule);
      content.style.removeProperty('translate');
    };
  });

  $effect.pre(() => {
    dismissLayer.setActive(visible, rootElement, {
      closeOnOutside: false,
      ignoreOutside: true,
      onEscape: () => (dismissed = true)
    });
  });

  onDestroy(() => dismissLayer.destroy());

  onMount(() => {
    const root = rootElement;

    if (!root) {
      return;
    }

    root.addEventListener('mouseenter', handleMouseenter);
    root.addEventListener('mouseleave', handleMouseleave);
    root.addEventListener('focusin', handleFocusin);
    root.addEventListener('focusout', handleFocusout);

    return () => {
      root.removeEventListener('mouseenter', handleMouseenter);
      root.removeEventListener('mouseleave', handleMouseleave);
      root.removeEventListener('focusin', handleFocusin);
      root.removeEventListener('focusout', handleFocusout);
    };
  });

  function handleMouseenter(): void {
    pointerInside = true;
    dismissed = false;
  }

  function handleMouseleave(): void {
    pointerInside = false;
    dismissed = false;
  }

  function handleFocusin(): void {
    focusInside = true;
    if (!pointerInside) {
      dismissed = false;
    }
  }

  function handleFocusout(event: FocusEvent): void {
    if (event.relatedTarget instanceof Node && rootElement?.contains(event.relatedTarget)) {
      return;
    }

    focusInside = false;
    if (!pointerInside) {
      dismissed = false;
    }
  }
</script>

<span
  class={`zdp-tooltip zdp-tooltip--${placement}`}
  data-disabled={disabled ? 'true' : undefined}
  data-dismissed={dismissed ? 'true' : undefined}
  bind:this={rootElement}
>
  <span class="zdp-tooltip__trigger">
    <!-- svelte-ignore slot_element_deprecated legacy default slot contract remains public -->
    <slot describedBy={describedBy} />
  </span>
  {#if !disabled}
    <span
      id={tooltipId}
      class="zdp-tooltip__content"
      role="tooltip"
      bind:this={contentElement}
    >
      {text}
    </span>
  {/if}
</span>

<style>
  .zdp-tooltip {
    display: inline-flex;
    min-width: 0;
    position: relative;
    vertical-align: middle;
  }

  .zdp-tooltip__trigger {
    display: inline-flex;
    min-width: 0;
  }

  .zdp-tooltip__content {
    background: var(--zdp-color-ink-strong);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong);
    border-radius: var(--zdp-control-radius);
    bottom: var(--zdp-tooltip-bottom, auto);
    color: var(--zdp-color-surface-panel);
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-caption-size);
    left: var(--zdp-tooltip-left, auto);
    line-height: var(--zdp-type-caption-line-height);
    opacity: 0;
    padding: var(--zdp-space-1) var(--zdp-space-2);
    pointer-events: none;
    position: absolute;
    right: var(--zdp-tooltip-right, auto);
    top: var(--zdp-tooltip-top, auto);
    transform: var(--zdp-tooltip-transform, none);
    -webkit-user-select: none;
    user-select: none;
    box-sizing: border-box;
    width: max-content;
    max-inline-size: min(22rem, calc(var(--zdp-viewport-inline) - var(--zdp-space-4)));
    overflow-wrap: anywhere;
    white-space: normal;
    z-index: var(--zdp-layer-floating);
  }

  .zdp-tooltip--top {
    --zdp-tooltip-bottom: calc(100% + var(--zdp-space-2));
    --zdp-tooltip-left: 0;
    --zdp-tooltip-right: auto;
    --zdp-tooltip-top: auto;
    --zdp-tooltip-transform: none;
  }

  .zdp-tooltip--top .zdp-tooltip__content {
    bottom: var(--zdp-tooltip-bottom);
    left: var(--zdp-tooltip-left);
  }

  .zdp-tooltip--right {
    --zdp-tooltip-bottom: auto;
    --zdp-tooltip-left: calc(100% + var(--zdp-space-2));
    --zdp-tooltip-right: auto;
    --zdp-tooltip-top: 0;
    --zdp-tooltip-transform: none;
  }

  .zdp-tooltip--right .zdp-tooltip__content {
    left: var(--zdp-tooltip-left);
    top: var(--zdp-tooltip-top);
  }

  .zdp-tooltip--bottom {
    --zdp-tooltip-bottom: auto;
    --zdp-tooltip-left: 0;
    --zdp-tooltip-right: auto;
    --zdp-tooltip-top: calc(100% + var(--zdp-space-2));
    --zdp-tooltip-transform: none;
  }

  .zdp-tooltip--bottom .zdp-tooltip__content {
    left: var(--zdp-tooltip-left);
    top: var(--zdp-tooltip-top);
  }

  .zdp-tooltip--left {
    --zdp-tooltip-bottom: auto;
    --zdp-tooltip-left: auto;
    --zdp-tooltip-right: calc(100% + var(--zdp-space-2));
    --zdp-tooltip-top: 0;
    --zdp-tooltip-transform: none;
  }

  .zdp-tooltip--left .zdp-tooltip__content {
    right: var(--zdp-tooltip-right);
    top: var(--zdp-tooltip-top);
  }

  .zdp-tooltip:hover .zdp-tooltip__content,
  .zdp-tooltip:focus-within .zdp-tooltip__content {
    opacity: 1;
  }

  .zdp-tooltip[data-dismissed="true"] .zdp-tooltip__content {
    opacity: 0;
  }

  .zdp-tooltip[data-disabled="true"] {
    cursor: default;
  }
</style>

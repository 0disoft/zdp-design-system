<script lang="ts">
  import { onDestroy, type Snippet } from 'svelte';
  import { toZdpDomId } from '../dom-id';
  import { beginZdpDragSelection } from '../drag-selection';
  import { clampZdpSplitPaneSize, type ZdpSplitPaneOrientation } from '../split-pane';

  type ZdpSplitPaneResizeEvent = PointerEvent | KeyboardEvent | MouseEvent;

  interface Props {
    id?: string | null;
    primaryId?: string | null;
    secondaryId?: string | null;
    size?: number;
    defaultSize?: number;
    minSize?: number;
    maxSize?: number;
    secondaryMinSize?: number;
    handleSize?: number;
    keyboardStep?: number;
    largeKeyboardStep?: number;
    orientation?: ZdpSplitPaneOrientation;
    ariaLabel?: string;
    disabled?: boolean;
    primary?: Snippet;
    children?: Snippet;
    getValueText?: ((size: number) => string) | null;
    onResize?: ((size: number, event: ZdpSplitPaneResizeEvent) => void) | null;
    onResizeCommit?: ((size: number, event: ZdpSplitPaneResizeEvent) => void) | null;
  }

  const componentId = $props.id();
  const fallbackId = `zdp-resizable-split-pane-${componentId}`;
  let {
    id = null,
    primaryId = null,
    secondaryId = null,
    size = $bindable(280),
    defaultSize = 280,
    minSize = 220,
    maxSize = 480,
    secondaryMinSize = 0,
    handleSize = 24,
    keyboardStep = 8,
    largeKeyboardStep = 32,
    orientation = 'vertical',
    ariaLabel = 'Resize primary panel',
    disabled = false,
    primary,
    children,
    getValueText = null,
    onResize = null,
    onResizeCommit = null
  }: Props = $props();

  let rootElement: HTMLDivElement | null = $state(null);
  let separatorElement: HTMLDivElement | null = $state(null);
  let containerSize = $state(Number.POSITIVE_INFINITY);
  let dragging = $state(false);
  let activePointerId: number | null = null;
  let pointerStartCoordinate = 0;
  let pointerStartSize = 0;
  let pointerMoved = false;
  let endDragSelection: (() => void) | null = null;

  const resolvedId = $derived(toZdpDomId(id ?? fallbackId, fallbackId));
  const resolvedPrimaryId = $derived(toZdpDomId(primaryId ?? `${resolvedId}-primary`, `${resolvedId}-primary`));
  const resolvedSecondaryId = $derived(
    toZdpDomId(secondaryId ?? `${resolvedId}-secondary`, `${resolvedId}-secondary`)
  );
  const normalizedMinSize = $derived(normalizeSize(minSize, 220));
  const normalizedMaxSize = $derived(Math.max(normalizedMinSize, normalizeSize(maxSize, 480)));
  const normalizedSecondaryMinSize = $derived(normalizeSize(secondaryMinSize, 0));
  const normalizedHandleSize = $derived(Math.max(1, normalizeSize(handleSize, 24)));
  const normalizedKeyboardStep = $derived(Math.max(1, normalizeSize(keyboardStep, 8)));
  const normalizedLargeKeyboardStep = $derived(Math.max(1, normalizeSize(largeKeyboardStep, 32)));
  const containerMaximum = $derived(
    Number.isFinite(containerSize)
      ? Math.max(normalizedMinSize, Math.floor(containerSize - normalizedSecondaryMinSize))
      : normalizedMaxSize
  );
  const effectiveMaxSize = $derived(Math.min(normalizedMaxSize, containerMaximum));
  const renderedSize = $derived(
    clampZdpSplitPaneSize(size, {
      defaultSize,
      minSize: normalizedMinSize,
      maxSize: effectiveMaxSize
    })
  );
  const constrained = $derived(
    Number.isFinite(containerSize) && containerSize < normalizedMinSize + normalizedSecondaryMinSize
  );
  const valueText = $derived(getValueText?.(renderedSize) ?? `${renderedSize} pixels`);
  const rootStyle = $derived(
    `--zdp-resizable-split-pane-size: ${renderedSize}px; --zdp-resizable-split-pane-handle-size: ${normalizedHandleSize}px;`
  );

  $effect(() => {
    const element = rootElement;

    if (!element || typeof ResizeObserver === 'undefined') {
      return;
    }

    const updateContainerSize = (): void => {
      const bounds = element.getBoundingClientRect();
      containerSize = orientation === 'vertical' ? bounds.width : bounds.height;
    };
    const observer = new ResizeObserver(updateContainerSize);
    updateContainerSize();
    observer.observe(element);

    return () => observer.disconnect();
  });

  $effect(() => {
    if (disabled && dragging) {
      finishPointerInteraction();
    }
  });

  function normalizeSize(value: number, fallback: number): number {
    return Number.isFinite(value) ? Math.max(0, Math.round(value)) : fallback;
  }

  function setSize(nextSize: number, event: ZdpSplitPaneResizeEvent, commit: boolean): void {
    const clampedSize = clampZdpSplitPaneSize(nextSize, {
      defaultSize,
      minSize: normalizedMinSize,
      maxSize: effectiveMaxSize
    });

    if (clampedSize === size) {
      return;
    }

    size = clampedSize;
    onResize?.(clampedSize, event);

    if (commit) {
      onResizeCommit?.(clampedSize, event);
    }
  }

  function pointerCoordinate(event: PointerEvent): number {
    return orientation === 'vertical' ? event.clientX : event.clientY;
  }

  function primaryAxisPosition(event: PointerEvent): number {
    if (!rootElement) {
      return renderedSize;
    }

    const bounds = rootElement.getBoundingClientRect();

    if (orientation === 'horizontal') {
      return event.clientY - bounds.top;
    }

    return getComputedStyle(rootElement).direction === 'rtl'
      ? bounds.right - event.clientX
      : event.clientX - bounds.left;
  }

  function handlePointerDown(event: PointerEvent): void {
    if (disabled || event.button !== 0 || !event.isPrimary || !separatorElement) {
      return;
    }

    event.preventDefault();
    activePointerId = event.pointerId;
    pointerStartCoordinate = pointerCoordinate(event);
    pointerStartSize = renderedSize;
    pointerMoved = false;
    dragging = true;
    separatorElement.setPointerCapture(event.pointerId);
    endDragSelection = beginZdpDragSelection(separatorElement.ownerDocument);
  }

  function handlePointerMove(event: PointerEvent): void {
    if (!dragging || event.pointerId !== activePointerId) {
      return;
    }

    event.preventDefault();
    pointerMoved = pointerMoved || Math.abs(pointerCoordinate(event) - pointerStartCoordinate) >= 3;

    if (pointerMoved) {
      setSize(primaryAxisPosition(event), event, false);
    }
  }

  function handlePointerUp(event: PointerEvent): void {
    if (!dragging || event.pointerId !== activePointerId) {
      return;
    }

    if (pointerMoved) {
      const committedSize = renderedSize;
      finishPointerInteraction();
      onResizeCommit?.(committedSize, event);
      return;
    }

    const direction = primaryAxisPosition(event) < renderedSize ? -1 : 1;
    finishPointerInteraction();
    setSize(pointerStartSize + direction * normalizedKeyboardStep, event, true);
  }

  function handlePointerCancel(event: PointerEvent): void {
    if (event.pointerId === activePointerId) {
      finishPointerInteraction();
    }
  }

  function handleLostPointerCapture(event: PointerEvent): void {
    if (dragging && event.pointerId === activePointerId) {
      const committedSize = renderedSize;
      finishPointerInteraction();
      onResizeCommit?.(committedSize, event);
    }
  }

  function finishPointerInteraction(): void {
    const pointerId = activePointerId;
    dragging = false;
    activePointerId = null;
    pointerMoved = false;
    endDragSelection?.();
    endDragSelection = null;

    if (pointerId !== null && separatorElement?.hasPointerCapture(pointerId)) {
      separatorElement.releasePointerCapture(pointerId);
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (disabled) {
      return;
    }

    const step = event.shiftKey ? normalizedLargeKeyboardStep : normalizedKeyboardStep;
    let nextSize: number | null = null;

    if (event.key === 'Home') {
      nextSize = normalizedMinSize;
    } else if (event.key === 'End') {
      nextSize = effectiveMaxSize;
    } else if (event.key === 'PageUp') {
      nextSize = renderedSize - normalizedLargeKeyboardStep;
    } else if (event.key === 'PageDown') {
      nextSize = renderedSize + normalizedLargeKeyboardStep;
    } else if (orientation === 'horizontal' && event.key === 'ArrowUp') {
      nextSize = renderedSize - step;
    } else if (orientation === 'horizontal' && event.key === 'ArrowDown') {
      nextSize = renderedSize + step;
    } else if (orientation === 'vertical' && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      const rtl = rootElement ? getComputedStyle(rootElement).direction === 'rtl' : false;
      const increase = rtl ? event.key === 'ArrowLeft' : event.key === 'ArrowRight';
      nextSize = renderedSize + (increase ? step : -step);
    }

    if (nextSize === null) {
      return;
    }

    event.preventDefault();
    setSize(nextSize, event, true);
  }

  function handleDoubleClick(event: MouseEvent): void {
    if (disabled) {
      return;
    }

    setSize(defaultSize, event, true);
    event.preventDefault();
  }

  onDestroy(finishPointerInteraction);
</script>

<div
  bind:this={rootElement}
  class={`zdp-resizable-split-pane zdp-resizable-split-pane--${orientation}`}
  class:zdp-resizable-split-pane--dragging={dragging}
  id={resolvedId}
  style={rootStyle}
  data-zdp-resizable-split-pane
  data-zdp-resizable-split-pane-orientation={orientation}
  data-zdp-resizable-split-pane-constrained={constrained ? 'true' : undefined}
>
  <div id={resolvedPrimaryId} class="zdp-resizable-split-pane__primary" data-zdp-split-pane-primary>
    {@render primary?.()}
  </div>

  <!--
    The ARIA Window Splitter pattern requires a focusable separator with value and keyboard behavior.
    Svelte currently classifies separator as non-interactive even when this complete pattern is present.
  -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    bind:this={separatorElement}
    class="zdp-resizable-split-pane__separator"
    role="separator"
    aria-label={ariaLabel}
    aria-controls={resolvedPrimaryId}
    aria-orientation={orientation}
    aria-valuemin={normalizedMinSize}
    aria-valuemax={effectiveMaxSize}
    aria-valuenow={renderedSize}
    aria-valuetext={valueText}
    aria-disabled={disabled ? 'true' : undefined}
    tabindex={disabled ? -1 : 0}
    data-zdp-split-pane-separator
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointercancel={handlePointerCancel}
    onlostpointercapture={handleLostPointerCapture}
    onkeydown={handleKeydown}
    ondblclick={handleDoubleClick}
  ></div>

  <div id={resolvedSecondaryId} class="zdp-resizable-split-pane__secondary" data-zdp-split-pane-secondary>
    {@render children?.()}
  </div>
</div>

<style>
  .zdp-resizable-split-pane {
    display: grid;
    min-block-size: 0;
    min-inline-size: 0;
    position: relative;
  }

  .zdp-resizable-split-pane--vertical {
    grid-template-columns: var(--zdp-resizable-split-pane-size) minmax(0, 1fr);
  }

  .zdp-resizable-split-pane--horizontal {
    grid-template-rows: var(--zdp-resizable-split-pane-size) minmax(0, 1fr);
  }

  .zdp-resizable-split-pane__primary,
  .zdp-resizable-split-pane__secondary {
    min-block-size: 0;
    min-inline-size: 0;
    overflow: auto;
  }

  .zdp-resizable-split-pane__separator {
    background: transparent;
    border: 0;
    box-sizing: border-box;
    padding: 0;
    position: absolute;
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-resizable-split-pane__separator::before {
    background: var(--zdp-color-line-strong);
    content: '';
    position: absolute;
  }

  .zdp-resizable-split-pane--vertical > .zdp-resizable-split-pane__separator {
    block-size: 100%;
    cursor: col-resize;
    inline-size: var(--zdp-resizable-split-pane-handle-size);
    inset-block-start: 0;
    inset-inline-start: var(--zdp-resizable-split-pane-size);
    margin-inline-start: calc(var(--zdp-resizable-split-pane-handle-size) / -2);
  }

  .zdp-resizable-split-pane--vertical > .zdp-resizable-split-pane__separator::before {
    block-size: 100%;
    inline-size: var(--zdp-control-border-width);
    inset-block-start: 0;
    inset-inline-start: 50%;
  }

  .zdp-resizable-split-pane--horizontal > .zdp-resizable-split-pane__separator {
    block-size: var(--zdp-resizable-split-pane-handle-size);
    cursor: row-resize;
    inline-size: 100%;
    inset-block-start: var(--zdp-resizable-split-pane-size);
    inset-inline-start: 0;
    margin-block-start: calc(var(--zdp-resizable-split-pane-handle-size) / -2);
  }

  .zdp-resizable-split-pane--horizontal > .zdp-resizable-split-pane__separator::before {
    block-size: var(--zdp-control-border-width);
    inline-size: 100%;
    inset-block-start: 50%;
    inset-inline-start: 0;
  }

  .zdp-resizable-split-pane__separator:hover::before,
  .zdp-resizable-split-pane__separator:focus-visible::before,
  .zdp-resizable-split-pane--dragging > .zdp-resizable-split-pane__separator::before {
    background: var(--zdp-color-focus-line);
  }

  .zdp-resizable-split-pane__separator:focus-visible {
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: calc(var(--zdp-control-focus-outline-width) * -1);
  }

  .zdp-resizable-split-pane__separator[aria-disabled='true'] {
    cursor: default;
  }

  @media (forced-colors: active) {
    .zdp-resizable-split-pane__separator::before {
      background: CanvasText;
    }

    .zdp-resizable-split-pane__separator:focus-visible {
      outline-color: Highlight;
    }
  }
</style>

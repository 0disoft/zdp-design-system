<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import { toZdpDomId } from '../dom-id';
  import {
    clampZdpSplitPaneSize,
    createZdpSplitPaneController,
    type ZdpSplitPaneController,
    type ZdpSplitPaneOrientation,
    type ZdpSplitPaneResizeEvent
  } from '../split-pane';

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
  let primaryElement: HTMLDivElement | null = $state(null);
  let separatorElement: HTMLDivElement | null = $state(null);
  let secondaryElement: HTMLDivElement | null = $state(null);
  let controller: ZdpSplitPaneController | null = null;

  const resolvedId = $derived(toZdpDomId(id ?? fallbackId, fallbackId));
  const resolvedPrimaryId = $derived(toZdpDomId(primaryId ?? `${resolvedId}-primary`, `${resolvedId}-primary`));
  const resolvedSecondaryId = $derived(
    toZdpDomId(secondaryId ?? `${resolvedId}-secondary`, `${resolvedId}-secondary`)
  );
  const normalizedMinSize = $derived(normalizeSize(minSize, 220));
  const normalizedMaxSize = $derived(Math.max(normalizedMinSize, normalizeSize(maxSize, 480)));
  const normalizedHandleSize = $derived(Math.max(1, normalizeSize(handleSize, 24)));
  const renderedSize = $derived(
    clampZdpSplitPaneSize(size, {
      defaultSize,
      minSize: normalizedMinSize,
      maxSize: normalizedMaxSize
    })
  );
  const valueText = $derived(getValueText?.(renderedSize) ?? `${renderedSize} pixels`);
  const rootStyle = $derived(
    `--zdp-resizable-split-pane-size: ${renderedSize}px; --zdp-resizable-split-pane-handle-size: ${normalizedHandleSize}px;`
  );

  onMount(() => {
    if (!rootElement || !primaryElement || !separatorElement || !secondaryElement) {
      return;
    }

    controller = createZdpSplitPaneController(
      {
        root: rootElement,
        primary: primaryElement,
        separator: separatorElement,
        secondary: secondaryElement
      },
      createControllerOptions()
    );

    return () => {
      controller?.destroy();
      controller = null;
    };
  });

  $effect(() => {
    controller?.update(createControllerOptions());
  });

  function createControllerOptions() {
    return {
      size,
      defaultSize,
      minSize,
      maxSize,
      secondaryMinSize,
      handleSize,
      keyboardStep,
      largeKeyboardStep,
      orientation,
      ariaLabel,
      disabled,
      getValueText,
      onResize: (nextSize: number, event: ZdpSplitPaneResizeEvent): void => {
        size = nextSize;
        onResize?.(nextSize, event);
      },
      onResizeCommit: (nextSize: number, event: ZdpSplitPaneResizeEvent): void => {
        size = nextSize;
        onResizeCommit?.(nextSize, event);
      }
    };
  }

  function normalizeSize(value: number, fallback: number): number {
    return Number.isFinite(value) ? Math.max(0, Math.round(value)) : fallback;
  }
</script>

<div
  bind:this={rootElement}
  class={`zdp-resizable-split-pane zdp-resizable-split-pane--${orientation}`}
  id={resolvedId}
  style={rootStyle}
  data-zdp-resizable-split-pane
  data-zdp-resizable-split-pane-orientation={orientation}
>
  <div
    bind:this={primaryElement}
    id={resolvedPrimaryId}
    class="zdp-resizable-split-pane__primary"
    data-zdp-split-pane-primary
  >
    {@render primary?.()}
  </div>

  <!-- The ARIA Window Splitter pattern intentionally uses a focusable separator. -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    bind:this={separatorElement}
    class="zdp-resizable-split-pane__separator"
    role="separator"
    aria-label={ariaLabel}
    aria-controls={resolvedPrimaryId}
    aria-orientation={orientation}
    aria-valuemin={normalizedMinSize}
    aria-valuemax={normalizedMaxSize}
    aria-valuenow={renderedSize}
    aria-valuetext={valueText}
    aria-disabled={disabled ? 'true' : undefined}
    tabindex={disabled ? -1 : 0}
    data-zdp-split-pane-separator
  ></div>

  <div
    bind:this={secondaryElement}
    id={resolvedSecondaryId}
    class="zdp-resizable-split-pane__secondary"
    data-zdp-split-pane-secondary
  >
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

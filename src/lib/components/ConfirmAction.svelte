<script lang="ts">
  import { onDestroy } from 'svelte';

  export let id: string | null = null;
  export let tone: 'primary' | 'danger' = 'primary';
  export let label = 'Slide to confirm';
  export let hint = 'Slide or hold for 2 seconds';
  export let completeLabel = 'Confirmed';
  export let disabled = false;
  export let durationMs = 2000;
  export let onconfirm: (() => void) | null = null;

  let progress = 0;
  let active = false;
  let confirmed = false;
  let startX = 0;
  let trackWidth = 1;
  let startedAt = 0;
  let progressTimer: number | null = null;
  let resetTimer: number | null = null;

  $: safeDurationMs = Math.max(600, durationMs);
  $: progressStyle = `--zdp-confirm-action-progress: ${progress};`;
  $: if (disabled && active) {
    cancelInteraction();
  }

  function beginInteraction(clientX: number | null, element: HTMLButtonElement): void {
    if (disabled || confirmed) {
      return;
    }

    clearTimers();
    active = true;
    progress = 0;
    startedAt = Date.now();
    startX = clientX ?? 0;
    trackWidth = Math.max(1, element.getBoundingClientRect().width);
    progressTimer = window.setInterval(updateHoldProgress, 40);
  }

  function updateHoldProgress(): void {
    if (!active || disabled) {
      if (disabled) {
        cancelInteraction();
      }
      return;
    }

    progress = Math.max(progress, Math.min(1, (Date.now() - startedAt) / safeDurationMs));

    if (progress >= 1) {
      confirmAction();
    }
  }

  function updateSlideProgress(clientX: number): void {
    if (!active || disabled || confirmed) {
      return;
    }

    progress = Math.max(progress, Math.min(1, (clientX - startX) / trackWidth));

    if (progress >= 0.92) {
      confirmAction();
    }
  }

  function confirmAction(): void {
    if (disabled) {
      cancelInteraction();
      return;
    }

    if (confirmed) {
      return;
    }

    clearTimers();
    active = false;
    confirmed = true;
    progress = 1;
    onconfirm?.();
    resetTimer = window.setTimeout(reset, 1000);
  }

  function cancelInteraction(): void {
    if (confirmed) {
      return;
    }

    clearTimers();
    active = false;
    progress = 0;
  }

  function reset(): void {
    clearTimers();
    active = false;
    confirmed = false;
    progress = 0;
  }

  function clearTimers(): void {
    if (progressTimer !== null) {
      window.clearInterval(progressTimer);
      progressTimer = null;
    }

    if (resetTimer !== null) {
      window.clearTimeout(resetTimer);
      resetTimer = null;
    }
  }

  function handlePointerDown(event: PointerEvent): void {
    const button = event.currentTarget as HTMLButtonElement;
    button.setPointerCapture(event.pointerId);
    beginInteraction(event.clientX, button);
  }

  function handlePointerMove(event: PointerEvent): void {
    updateSlideProgress(event.clientX);
  }

  function handlePointerEnd(event: PointerEvent): void {
    const button = event.currentTarget as HTMLButtonElement;

    if (button.hasPointerCapture(event.pointerId)) {
      button.releasePointerCapture(event.pointerId);
    }

    cancelInteraction();
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();

    if (!active) {
      beginInteraction(null, event.currentTarget as HTMLButtonElement);
    }
  }

  function handleKeyup(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      cancelInteraction();
    }
  }

  onDestroy(clearTimers);
</script>

<button
  class={`zdp-confirm-action zdp-confirm-action--${tone}`}
  {id}
  type="button"
  {disabled}
  aria-disabled={disabled}
  aria-live="polite"
  data-active={active ? 'true' : undefined}
  data-confirmed={confirmed ? 'true' : undefined}
  style={progressStyle}
  onpointerdown={handlePointerDown}
  onpointermove={handlePointerMove}
  onpointerup={handlePointerEnd}
  onpointercancel={handlePointerEnd}
  onkeydown={handleKeydown}
  onkeyup={handleKeyup}
>
  <span class="zdp-confirm-action__fill" aria-hidden="true"></span>
  <span class="zdp-confirm-action__thumb" aria-hidden="true">
    <svg class="zdp-confirm-action__glyph" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  </span>
  <span class="zdp-confirm-action__body">
    <span class="zdp-confirm-action__label">{confirmed ? completeLabel : label}</span>
    <span class="zdp-confirm-action__hint">{hint}</span>
  </span>
</button>

<style>
  .zdp-confirm-action {
    --zdp-confirm-action-progress: 0;
    --zdp-confirm-action-fill: var(--zdp-color-accent-primary);

    align-items: center;
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-strong);
    cursor: pointer;
    display: inline-grid;
    font-family: var(--zdp-font-family-sans);
    grid-template-columns: var(--zdp-control-height-sm) minmax(0, 1fr);
    isolation: isolate;
    min-height: calc(var(--zdp-control-height-md) + var(--zdp-space-3));
    min-width: min(100%, 18rem);
    overflow: hidden;
    padding: var(--zdp-space-2) var(--zdp-space-4) var(--zdp-space-2) var(--zdp-space-2);
    position: relative;
    text-align: start;
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
    vertical-align: middle;
  }

  .zdp-confirm-action__fill {
    background: var(--zdp-confirm-action-fill);
    bottom: 0;
    left: 0;
    position: absolute;
    top: 0;
    width: calc(var(--zdp-confirm-action-progress) * 100%);
    z-index: var(--zdp-layer-behind);
  }

  .zdp-confirm-action__thumb {
    align-items: center;
    background: var(--zdp-color-accent-primary);
    border: var(--zdp-control-border-width) solid var(--zdp-color-accent-primary-strong);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-strong);
    display: inline-flex;
    font-size: var(--zdp-control-glyph-sm);
    height: var(--zdp-control-height-sm);
    justify-content: center;
    line-height: 1;
    width: var(--zdp-control-height-sm);
  }

  .zdp-confirm-action__glyph {
    display: block;
    fill: none;
    height: var(--zdp-control-glyph-sm);
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2.25;
    width: var(--zdp-control-glyph-sm);
  }

  :global([data-zdp-theme="dark"]) .zdp-confirm-action__thumb {
    color: var(--zdp-color-ink-inverse);
  }

  :global([data-zdp-theme="dark"]) .zdp-confirm-action {
    --zdp-confirm-action-fill: var(--zdp-color-accent-primary-soft);
  }

  .zdp-confirm-action__body {
    display: grid;
    gap: var(--zdp-space-1);
    min-width: 0;
    padding-left: var(--zdp-space-3);
  }

  .zdp-confirm-action__label {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-control-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-control-line-height);
  }

  .zdp-confirm-action__hint {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-caption-size);
    line-height: var(--zdp-type-caption-line-height);
  }

  .zdp-confirm-action:hover:not(:disabled) {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
  }

  .zdp-confirm-action:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-confirm-action--danger {
    border-color: var(--zdp-color-accent-danger);
  }

  .zdp-confirm-action--danger .zdp-confirm-action__fill {
    background: var(--zdp-color-accent-danger);
    opacity: 0.24;
  }

  .zdp-confirm-action--danger .zdp-confirm-action__thumb {
    background: var(--zdp-color-accent-danger);
    border-color: var(--zdp-color-accent-danger);
  }

  .zdp-confirm-action[data-active="true"],
  .zdp-confirm-action[data-confirmed="true"] {
    border-color: var(--zdp-color-focus-line);
  }

  .zdp-confirm-action[data-confirmed="true"] .zdp-confirm-action__thumb {
    background: var(--zdp-color-accent-success);
    border-color: var(--zdp-color-accent-success);
  }

  .zdp-confirm-action:disabled {
    cursor: not-allowed;
    opacity: 0.56;
  }
</style>

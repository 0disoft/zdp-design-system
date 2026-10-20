<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import Button from './Button.svelte';

  interface Props {
    id?: string | null;
    tone?: 'primary' | 'danger';
    label?: string;
    hint?: string;
    completeLabel?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    disabled?: boolean;
    pending?: boolean;
    pendingLabel?: string;
    pendingHint?: string;
    durationMs?: number;
    onconfirm?: (() => void) | null;
  }

  let {
    id = $bindable(null),
    tone = $bindable('primary'),
    label = $bindable('Slide to confirm'),
    hint = $bindable('Slide or hold for 2 seconds'),
    completeLabel = $bindable('Confirmed'),
    confirmLabel = $bindable('Confirm'),
    cancelLabel = $bindable('Cancel'),
    disabled = $bindable(false),
    pending = $bindable(false),
    pendingLabel = $bindable('Processing'),
    pendingHint = $bindable('Please wait'),
    durationMs = $bindable(2000),
    onconfirm = $bindable(null)
  }: Props = $props();

  let progress = $state(0);
  let active = $state(false);
  let activePointerId: number | null = null;
  let confirmed = $state(false);
  const componentId = $props.id();
  const confirmationId = `${componentId}-confirmation`;
  let confirmationOpen = $state(false);
  let trigger: HTMLButtonElement | undefined = $state();
  let confirmationGroup: HTMLDivElement | undefined = $state();
  // Survives success/pending resets until the completing pointer's click arrives.
  let suppressPointerClick = false;
  let startX = 0;
  let trackWidth = 1;
  let startedAt = 0;
  let interactionDurationMs = $state(2000);
  let progressFrame: number | null = null;
  let confirmTimer: number | null = null;
  let resetTimer: number | null = null;

  function beginInteraction(clientX: number | null, element: HTMLButtonElement): void {
    if (disabled || pending || confirmed || confirmationOpen) {
      return;
    }

    clearTimers();
    active = true;
    progress = 0;
    startX = clientX ?? 0;
    trackWidth = Math.max(1, element.getBoundingClientRect().width);
    interactionDurationMs = safeDurationMs;
    startedAt = performance.now();
    addCancellationListeners();
    progressFrame = window.requestAnimationFrame(updateHoldProgress);
    confirmTimer = window.setTimeout(confirmAction, interactionDurationMs);
  }

  function updateHoldProgress(now: number): void {
    if (!active || disabled || pending) {
      if (disabled || pending) {
        cancelInteraction();
      }
      return;
    }

    progress = Math.max(progress, Math.min(1, (now - startedAt) / interactionDurationMs));
    progressFrame = window.requestAnimationFrame(updateHoldProgress);
  }

  function updateSlideProgress(clientX: number): void {
    if (!active || disabled || pending || confirmed) {
      return;
    }

    const slideProgress = Math.min(1, (clientX - startX) / trackWidth);
    progress = Math.max(progress, slideProgress);

    if (slideProgress >= 0.92) {
      confirmAction();
    }
  }

  function confirmAction(): void {
    if (disabled || pending) {
      cancelInteraction();
      return;
    }

    if (confirmed) {
      return;
    }

    clearTimers();
    if (activePointerId !== null) suppressPointerClick = true;
    if (confirmationOpen) trigger?.focus();
    confirmationOpen = false;
    active = false;
    activePointerId = null;
    confirmed = true;
    progress = 1;
    resetTimer = window.setTimeout(reset, 1000);

    try {
      onconfirm?.();
    } catch (error) {
      reset();
      throw error;
    }
  }

  function cancelInteraction(): void {
    if (confirmed) {
      return;
    }

    clearTimers();
    active = false;
    activePointerId = null;
    progress = 0;
  }

  function reset(): void {
    clearTimers();
    active = false;
    activePointerId = null;
    confirmed = false;
    confirmationOpen = false;
    progress = 0;
  }

  function clearTimers(): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (progressFrame !== null) {
      window.cancelAnimationFrame(progressFrame);
      progressFrame = null;
    }

    if (confirmTimer !== null) {
      window.clearTimeout(confirmTimer);
      confirmTimer = null;
    }

    if (resetTimer !== null) {
      window.clearTimeout(resetTimer);
      resetTimer = null;
    }

    removeCancellationListeners();
  }

  function addCancellationListeners(): void {
    window.addEventListener('blur', cancelInteraction);
    document.addEventListener('visibilitychange', cancelInteraction);
  }

  function removeCancellationListeners(): void {
    window.removeEventListener('blur', cancelInteraction);
    document.removeEventListener('visibilitychange', cancelInteraction);
  }

  function handlePointerDown(event: PointerEvent): void {
    if (event.button !== 0 || !event.isPrimary || disabled || pending || confirmed || active || confirmationOpen) {
      return;
    }

    const button = event.currentTarget as HTMLButtonElement;
    suppressPointerClick = false;
    try {
      button.setPointerCapture(event.pointerId);
    } catch {
      cancelInteraction();
      return;
    }

    beginInteraction(event.clientX, button);
    activePointerId = event.pointerId;
  }

  function handlePointerMove(event: PointerEvent): void {
    if (event.pointerId === activePointerId) {
      updateSlideProgress(event.clientX);
    }
  }

  function handlePointerEnd(event: PointerEvent): void {
    if (event.pointerId !== activePointerId) {
      return;
    }

    const button = event.currentTarget as HTMLButtonElement;

    if (button.hasPointerCapture(event.pointerId)) {
      button.releasePointerCapture(event.pointerId);
    }

    cancelInteraction();
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.isComposing || event.keyCode === 229 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();

    if (!event.repeat && !active) {
      beginInteraction(null, event.currentTarget as HTMLButtonElement);
    }
  }

  function handleKeyup(event: KeyboardEvent): void {
    if (event.isComposing || event.keyCode === 229) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      if (!event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
        event.preventDefault();
      }
      cancelInteraction();
    }
  }

  async function handleClick(event: MouseEvent): Promise<void> {
    if (suppressPointerClick && event.detail > 0) {
      suppressPointerClick = false;
      return;
    }
    if (disabled || pending || confirmed || confirmationOpen) return;
    cancelInteraction();
    confirmationOpen = true;
    await tick();
    if (confirmationOpen && !disabled && !pending) confirmationGroup?.querySelector('button')?.focus();
  }

  function cancelConfirmation(): void {
    confirmationOpen = false;
    trigger?.focus();
  }

  function confirmClick(): void {
    if (confirmationOpen) confirmAction();
  }

  function handleConfirmationKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && !event.isComposing) {
      event.preventDefault();
      event.stopPropagation();
      cancelConfirmation();
    }
  }

  onDestroy(clearTimers);
  let safeDurationMs = $derived(Math.min(2_147_483_647, Math.max(600, Number.isFinite(durationMs) ? durationMs : 2000)));
  let progressStyle = $derived(`--zdp-confirm-action-progress: ${progress};`);
  $effect.pre(() => {
    if (pending) {
      reset();
    }
  });
  $effect.pre(() => {
    if (disabled) confirmationOpen = false;
    if (disabled && active) {
      cancelInteraction();
    }
  });
  $effect.pre(() => {
    if (active && safeDurationMs !== interactionDurationMs) {
      cancelInteraction();
    }
  });
</script>

<button
  bind:this={trigger}
  class={`zdp-confirm-action zdp-confirm-action--${tone}`}
  {id}
  type="button"
  disabled={disabled || pending}
  aria-disabled={disabled || pending}
  aria-busy={pending ? 'true' : undefined}
  aria-expanded={confirmationOpen}
  aria-controls={confirmationOpen ? confirmationId : undefined}
  aria-live="polite"
  data-pending={pending ? 'true' : undefined}
  data-disabled={disabled ? 'true' : undefined}
  data-active={active ? 'true' : undefined}
  data-confirmed={confirmed ? 'true' : undefined}
  style={progressStyle}
  onpointerdown={handlePointerDown}
  onpointermove={handlePointerMove}
  onpointerup={handlePointerEnd}
  onpointercancel={handlePointerEnd}
  onlostpointercapture={handlePointerEnd}
  onblur={cancelInteraction}
  onkeydown={handleKeydown}
  onkeyup={handleKeyup}
  onclick={handleClick}
>
  <span class="zdp-confirm-action__fill" aria-hidden="true"></span>
  <span class="zdp-confirm-action__thumb" aria-hidden="true">
    <span class="zdp-confirm-action__spinner" aria-hidden="true"></span>
    <svg class="zdp-confirm-action__glyph" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  </span>
  <span class="zdp-confirm-action__body">
    <span class="zdp-confirm-action__label">{pending ? pendingLabel : confirmed ? completeLabel : label}</span>
    <span class="zdp-confirm-action__hint">{pending ? pendingHint : hint}</span>
  </span>
</button>

{#if confirmationOpen}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions (Escape cancels the group from its native buttons.) -->
  <div class="zdp-confirm-action__confirmation" id={confirmationId} bind:this={confirmationGroup}
    role="group" aria-label={label} tabindex="-1" onkeydown={handleConfirmationKeydown}>
    <Button variant="secondary" disabled={disabled || pending} onclick={cancelConfirmation}>{cancelLabel}</Button>
    <Button variant={tone === 'danger' ? 'danger' : 'primary'} disabled={disabled || pending} onclick={confirmClick}>{confirmLabel}</Button>
  </div>
{/if}

<style>
  .zdp-confirm-action__confirmation {
    display: flex;
    flex-wrap: wrap;
    gap: var(--zdp-space-2);
    margin-block-start: var(--zdp-space-2);
  }

  .zdp-confirm-action {
    --zdp-confirm-action-progress: 0;
    --zdp-confirm-action-fill: var(--zdp-color-accent-primary-strong);

    align-items: center;
    background: var(--zdp-color-surface-raised);
    border: var(--zdp-control-border-width) solid transparent;
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
    opacity: 0.24;
    position: absolute;
    top: 0;
    width: calc(var(--zdp-confirm-action-progress) * 100%);
    z-index: var(--zdp-layer-behind);
  }

  .zdp-confirm-action__thumb {
    align-items: center;
    background: var(--zdp-color-accent-primary-strong);
    border: var(--zdp-control-border-width) solid transparent;
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-inverse);
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
    color: var(--zdp-color-ink-normal);
    font-size: var(--zdp-type-caption-size);
    line-height: var(--zdp-type-caption-line-height);
  }

  .zdp-confirm-action:where(:hover:not(:disabled)) {
    background: var(--zdp-color-interaction-hover);
    border-color: transparent;
  }

  .zdp-confirm-action:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-confirm-action--danger {
    border-color: transparent;
  }

  .zdp-confirm-action--danger .zdp-confirm-action__fill {
    background: var(--zdp-color-accent-danger);
    opacity: 0.24;
  }

  .zdp-confirm-action--danger .zdp-confirm-action__thumb {
    background: var(--zdp-color-accent-danger);
    border-color: transparent;
  }

  .zdp-confirm-action:where([data-active="true"]),
  .zdp-confirm-action:where([data-confirmed="true"]) {
    border-color: transparent;
  }

  .zdp-confirm-action[data-confirmed="true"] .zdp-confirm-action__thumb {
    background: var(--zdp-color-accent-success);
    border-color: transparent;
  }

  .zdp-confirm-action:disabled {
    cursor: not-allowed;
    opacity: var(--zdp-control-disabled-opacity);
  }

  .zdp-confirm-action[data-pending="true"]:not([data-disabled="true"]) {
    cursor: progress;
    opacity: 1;
  }

  .zdp-confirm-action__spinner {
    border: 2px solid color-mix(in oklch, currentColor 35%, transparent);
    border-block-start-color: currentColor;
    border-inline-end-color: currentColor;
    border-radius: 50%;
    box-sizing: border-box;
    display: none;
    height: var(--zdp-control-glyph-sm);
    width: var(--zdp-control-glyph-sm);
  }

  .zdp-confirm-action[data-pending="true"] .zdp-confirm-action__spinner {
    animation: zdp-confirm-action-pending-rotate 1s linear infinite;
    display: block;
  }

  .zdp-confirm-action[data-pending="true"] .zdp-confirm-action__glyph {
    display: none;
  }

  .zdp-confirm-action[data-pending="true"] .zdp-confirm-action__fill {
    width: 0;
  }

  @keyframes zdp-confirm-action-pending-rotate {
    to {
      transform: rotate(1turn);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .zdp-confirm-action[data-pending="true"] .zdp-confirm-action__spinner {
      animation: none;
    }
  }

  @media (forced-colors: active) {
    .zdp-confirm-action,
    .zdp-confirm-action__thumb {
      border-color: ButtonText;
    }
  }
</style>

<script lang="ts">
  import type { ZdpProgressSize, ZdpProgressTone } from '../progress';

  export let value: number | null = null;
  export let min = 0;
  export let max = 100;
  export let tone: ZdpProgressTone = 'primary';
  export let size: ZdpProgressSize = 'md';
  export let ariaLabel = '진행 상태';
  export let labelledBy: string | null = null;
  export let describedBy: string | null = null;
  export let valueText: string | null = null;

  $: hasRange = Number.isFinite(min) && Number.isFinite(max) && max > min;
  $: hasValue = value !== null && Number.isFinite(value) && hasRange;
  $: clampedValue = hasValue ? Math.min(max, Math.max(min, value ?? min)) : min;
  $: progressPercent = hasRange ? ((clampedValue - min) / (max - min)) * 100 : 0;
  $: progressStyle = `--zdp-progress-value: ${progressPercent}%;`;
</script>

<div
  class={`zdp-progress zdp-progress--${tone} zdp-progress--${size}`}
  aria-label={labelledBy ? undefined : ariaLabel}
  aria-labelledby={labelledBy ?? undefined}
  aria-describedby={describedBy ?? undefined}
  aria-valuemin={hasRange ? min : undefined}
  aria-valuemax={hasRange ? max : undefined}
  aria-valuenow={hasValue ? clampedValue : undefined}
  aria-valuetext={valueText ?? undefined}
  data-indeterminate={hasValue ? undefined : 'true'}
  role="progressbar"
  style={progressStyle}
>
  <span class="zdp-progress__track" aria-hidden="true">
    <span class="zdp-progress__bar"></span>
  </span>
</div>

<style>
  .zdp-progress {
    --zdp-progress-accent: var(--zdp-color-accent-primary);
    --zdp-progress-value: 0%;

    box-sizing: border-box;
    display: grid;
    inline-size: min(100%, 28rem);
    min-width: 0;
  }

  .zdp-progress__track {
    background: var(--zdp-color-surface-raised);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    display: block;
    inline-size: 100%;
    overflow: hidden;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-progress--sm .zdp-progress__track {
    block-size: var(--zdp-space-2);
  }

  .zdp-progress--md .zdp-progress__track {
    block-size: var(--zdp-space-3);
  }

  .zdp-progress__bar {
    background: var(--zdp-progress-accent);
    block-size: 100%;
    display: block;
    inline-size: var(--zdp-progress-value);
    min-inline-size: 0;
    transition: inline-size var(--zdp-motion-fast) ease;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-progress[data-indeterminate="true"] .zdp-progress__bar {
    inline-size: 100%;
    opacity: 0.64;
  }

  .zdp-progress--neutral {
    --zdp-progress-accent: var(--zdp-color-line-strong);
  }

  .zdp-progress--primary {
    --zdp-progress-accent: var(--zdp-color-accent-primary);
  }

  .zdp-progress--success {
    --zdp-progress-accent: var(--zdp-color-accent-success);
  }

  .zdp-progress--warning {
    --zdp-progress-accent: var(--zdp-color-accent-warning);
  }

  .zdp-progress--danger {
    --zdp-progress-accent: var(--zdp-color-accent-danger);
  }

  @media (prefers-reduced-motion: reduce) {
    .zdp-progress__bar {
      transition: none;
    }
  }
</style>

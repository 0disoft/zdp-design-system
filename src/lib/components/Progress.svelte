<script lang="ts">
  import type { ZdpProgressSize, ZdpProgressTone } from '../progress.js';

  interface Props {
    value?: number | null;
    min?: number;
    max?: number;
    tone?: ZdpProgressTone;
    size?: ZdpProgressSize;
    ariaLabel?: string;
    labelledBy?: string | null;
    describedBy?: string | null;
    valueText?: string | null;
  }

  let {
    value = $bindable(null),
    min = $bindable(0),
    max = $bindable(100),
    tone = $bindable('primary'),
    size = $bindable('md'),
    ariaLabel = $bindable('Progress'),
    labelledBy = $bindable(null),
    describedBy = $bindable(null),
    valueText = $bindable(null)
  }: Props = $props();

  function rangePercent(current: number, lower: number, upper: number): number {
    const range = upper - lower;
    return Number.isFinite(range)
      ? ((current - lower) / range) * 100
      : ((current / 2 - lower / 2) / (upper / 2 - lower / 2)) * 100;
  }
  let hasRange = $derived(Number.isFinite(min) && Number.isFinite(max) && max > min);
  let hasValue = $derived(value !== null && Number.isFinite(value) && hasRange);
  let clampedValue = $derived(hasValue ? Math.min(max, Math.max(min, value ?? min)) : min);
  let progressPercent = $derived(hasRange ? rangePercent(clampedValue, min, max) : 0);
  let progressStyle = $derived(`--zdp-progress-value: ${progressPercent}%;`);
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
    background: color-mix(in oklch, var(--zdp-progress-accent) 94%, var(--zdp-color-ink-strong));
    block-size: 100%;
    display: block;
    inline-size: var(--zdp-progress-value);
    min-inline-size: 0;
    transition: inline-size var(--zdp-motion-fast) ease;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-progress[data-indeterminate="true"] .zdp-progress__bar {
    --zdp-progress-waiting-travel: 233.333333%;
    animation: zdp-progress-waiting 1.4s ease-in-out infinite alternate;
    inline-size: 30%;
    transition: none;
  }

  .zdp-progress[data-indeterminate="true"]:dir(rtl) .zdp-progress__bar {
    --zdp-progress-waiting-travel: -233.333333%;
  }

  @keyframes zdp-progress-waiting {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(var(--zdp-progress-waiting-travel));
    }
  }

  .zdp-progress--neutral {
    --zdp-progress-accent: var(--zdp-color-line-strong);
  }

  .zdp-progress--primary {
    --zdp-progress-accent: var(--zdp-color-accent-primary-strong);
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
    .zdp-progress[data-indeterminate="true"] .zdp-progress__bar {
      animation: none;
      margin-inline: auto;
    }

    .zdp-progress__bar {
      transition: none;
    }
  }
</style>

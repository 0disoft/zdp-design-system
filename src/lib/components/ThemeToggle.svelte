<script lang="ts">
  import type { ZdpThemeMode, ZdpThemeToggleSize } from '../theme';

  export let theme: ZdpThemeMode = 'light';
  export let size: ZdpThemeToggleSize = 'md';
  export let id: string | null = null;
  export let name: string | null = null;
  export let value: string | null = null;
  export let form: string | null = null;
  export let disabled = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let lightLabel = '라이트 모드로 전환';
  export let darkLabel = '다크 모드로 전환';
  export let ariaControls: string | null = null;
  export let ariaDescribedBy: string | null = null;
  export let onclick: ((event: MouseEvent) => void) | null = null;

  $: isDark = theme === 'dark';
  $: ariaLabel = isDark ? lightLabel : darkLabel;
</script>

<button
  class={`zdp-theme-toggle zdp-theme-toggle--${size}`}
  {id}
  {name}
  {value}
  {form}
  {type}
  {disabled}
  aria-label={ariaLabel}
  aria-pressed={isDark}
  aria-controls={ariaControls ?? undefined}
  aria-describedby={ariaDescribedBy ?? undefined}
  data-zdp-theme-toggle
  data-zdp-theme-state={theme}
  onclick={onclick ?? undefined}
>
  <span class="zdp-theme-toggle__icon zdp-theme-toggle__icon--sun" aria-hidden="true">
    <svg viewBox="0 0 24 24" focusable="false">
      <circle cx="12" cy="12" r="3.6"></circle>
      <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6"></path>
    </svg>
  </span>
  <span class="zdp-theme-toggle__icon zdp-theme-toggle__icon--moon" aria-hidden="true">
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M17.8 15.4A7 7 0 0 1 8.6 6.2 7.4 7.4 0 1 0 17.8 15.4Z"></path>
    </svg>
  </span>
</button>

<style>
  .zdp-theme-toggle {
    align-items: center;
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-normal);
    cursor: pointer;
    display: inline-grid;
    flex: 0 0 auto;
    font-family: var(--zdp-font-family-sans);
    justify-items: center;
    line-height: 1;
    padding: 0;
    place-items: center;
    position: relative;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    vertical-align: middle;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-theme-toggle--sm {
    height: var(--zdp-control-icon-sm);
    width: var(--zdp-control-icon-sm);
  }

  .zdp-theme-toggle--md {
    height: var(--zdp-control-icon-md);
    width: var(--zdp-control-icon-md);
  }

  .zdp-theme-toggle:hover:not(:disabled) {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-theme-toggle:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-theme-toggle:disabled {
    cursor: not-allowed;
    opacity: 0.56;
  }

  .zdp-theme-toggle__icon {
    color: currentColor;
    display: grid;
    grid-area: 1 / 1;
    height: var(--zdp-control-glyph-md);
    place-items: center;
    transition: opacity var(--zdp-motion-fast) ease;
    width: var(--zdp-control-glyph-md);
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-theme-toggle--sm .zdp-theme-toggle__icon {
    height: var(--zdp-control-glyph-sm);
    width: var(--zdp-control-glyph-sm);
  }

  .zdp-theme-toggle__icon svg {
    display: block;
    fill: none;
    height: 100%;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.8;
    width: 100%;
  }

  .zdp-theme-toggle__icon--moon svg {
    fill: currentColor;
    stroke: currentColor;
    transform: translate(0.08rem, -0.04rem);
  }

  .zdp-theme-toggle[data-zdp-theme-state='light'] .zdp-theme-toggle__icon--moon,
  .zdp-theme-toggle[data-zdp-theme-state='dark'] .zdp-theme-toggle__icon--sun {
    opacity: 0;
  }

  .zdp-theme-toggle[data-zdp-theme-state='dark'] {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-strong);
  }
</style>

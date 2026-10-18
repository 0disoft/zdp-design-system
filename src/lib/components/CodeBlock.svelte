<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import type { ZdpCodeBlockSize, ZdpCodeBlockTone } from '../code.js';

  interface Props {
    code?: string;
    language?: string | null;
    label?: string | null;
    caption?: string | null;
    size?: ZdpCodeBlockSize;
    tone?: ZdpCodeBlockTone;
    wrap?: boolean;
    showCopy?: boolean;
    copyLabel?: string;
    copyingLabel?: string;
    copiedLabel?: string;
    copyFailedLabel?: string;
    ariaLabel?: string | null;
    labelledBy?: string | null;
    describedBy?: string | null;
  }

  let {
    code = $bindable(''),
    language = $bindable(null),
    label = $bindable(null),
    caption = $bindable(null),
    size = $bindable('md'),
    tone = $bindable('default'),
    wrap = $bindable(false),
    showCopy = $bindable(true),
    copyLabel = $bindable('Copy'),
    copyingLabel = $bindable('Copying'),
    copiedLabel = $bindable('Copied'),
    copyFailedLabel = $bindable('Copy failed'),
    ariaLabel = $bindable(null),
    labelledBy = $bindable(null),
    describedBy = $bindable(null)
  }: Props = $props();

  type CopyState = 'idle' | 'copying' | 'copied' | 'failed';

  let copyState: CopyState = $state('idle');
  let resetCopyStateTimer: ReturnType<typeof setTimeout> | null = null;
  let copyProgressTimer: ReturnType<typeof setTimeout> | null = null;
  let showCopyProgress = $state(false);
  let copyRequestVersion = 0;
  let destroyed = false;
  let knownCode = untrack(() => code);
  let knownShowCopy = untrack(() => showCopy);

  onDestroy(() => {
    destroyed = true;
    invalidateCopyState();
  });

  function invalidateCopyState(): void {
    copyRequestVersion += 1;
    clearResetCopyStateTimer();
    clearCopyProgressTimer();
    showCopyProgress = false;
    copyState = 'idle';
  }

  function clearCopyProgressTimer(): void {
    if (copyProgressTimer !== null) {
      clearTimeout(copyProgressTimer);
      copyProgressTimer = null;
    }
  }

  function clearResetCopyStateTimer(): void {
    if (resetCopyStateTimer !== null) {
      clearTimeout(resetCopyStateTimer);
      resetCopyStateTimer = null;
    }
  }

  function scheduleResetCopyState(): void {
    clearResetCopyStateTimer();

    resetCopyStateTimer = setTimeout(() => {
      copyState = 'idle';
      resetCopyStateTimer = null;
    }, 2200);
  }

  async function handleCopy(): Promise<void> {
    if (!canCopy || copyState === 'copying') {
      return;
    }

    const requestVersion = ++copyRequestVersion;
    const copiedCode = code;
    let nextState: CopyState;
    clearResetCopyStateTimer();
    clearCopyProgressTimer();
    showCopyProgress = false;
    copyState = 'copying';
    copyProgressTimer = setTimeout(() => {
      showCopyProgress = true;
      copyProgressTimer = null;
    }, 150);

    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable');
      }

      await navigator.clipboard.writeText(copiedCode);
      nextState = 'copied';
    } catch {
      nextState = 'failed';
    }

    if (destroyed || requestVersion !== copyRequestVersion || copiedCode !== code || !canCopy) {
      return;
    }

    clearCopyProgressTimer();
    showCopyProgress = false;
    copyState = nextState;
    scheduleResetCopyState();
  }
  let canCopy = $derived(showCopy && code.length > 0);
  $effect.pre(() => {
    if (code !== knownCode || showCopy !== knownShowCopy) {
      knownCode = code;
      knownShowCopy = showCopy;
      invalidateCopyState();
    }
  });
  let resolvedAriaLabel = $derived(ariaLabel ?? (!labelledBy && label ? label : null));
  let codeRegionLabel = $derived([label ?? ariaLabel, language ? `${language} code` : 'Code'].filter(Boolean).join(' '));
  const resolvedCopyLabel = $derived.by(() =>
    copyState === 'copying' && showCopyProgress ? copyingLabel : copyState === 'copied' ? copiedLabel : copyState === 'failed' ? copyFailedLabel : copyLabel
  );
</script>

<div
  class={`zdp-code-block zdp-code-block--${size} zdp-code-block--${tone}`}
  data-wrap={wrap ? 'true' : undefined}
  role="group"
  aria-label={resolvedAriaLabel ?? undefined}
  aria-labelledby={labelledBy ?? undefined}
  aria-describedby={describedBy ?? undefined}
>
  {#if label || language || canCopy}
    <div class="zdp-code-block__header">
      {#if label || language}
        <div class="zdp-code-block__meta">
          {#if label}
            <span class="zdp-code-block__title">{label}</span>
          {/if}
          {#if language}
            <span class="zdp-code-block__language">{language}</span>
          {/if}
        </div>
      {/if}
      {#if canCopy}
        <button
          class="zdp-code-block__copy"
          type="button"
          data-copy-state={copyState}
          data-copy-progress={showCopyProgress ? 'true' : undefined}
          disabled={copyState === 'copying'}
          aria-disabled={copyState === 'copying'}
          aria-busy={copyState === 'copying' ? 'true' : undefined}
          onclick={handleCopy}
        >
          <span class="zdp-code-block__copy-spinner" aria-hidden="true"></span>
          {#if copyState === 'copied' || copyState === 'failed'}
            <svg class="zdp-code-block__copy-result" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
              {#if copyState === 'copied'}
                <path d="m5 12 4 4L19 6" />
              {:else}
                <path d="m6 6 12 12M18 6 6 18" />
              {/if}
            </svg>
          {/if}
          <span class="zdp-code-block__copy-label" aria-live="polite">{resolvedCopyLabel}</span>
        </button>
      {/if}
    </div>
  {/if}

  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div class="zdp-code-block__scroller" role="region" aria-label={codeRegionLabel} tabindex="0">
    <pre class="zdp-code-block__pre"><code class="zdp-code-block__code" data-language={language ?? undefined}>{#if code.length > 0}{code}{:else}<!-- svelte-ignore slot_element_deprecated public slot compatibility --><slot />{/if}</code></pre>
  </div>

  {#if caption}
    <p class="zdp-code-block__caption">{caption}</p>
  {/if}
</div>

<style>
  .zdp-code-block {
    --zdp-code-block-surface: var(--zdp-color-surface-panel);

    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-normal);
    display: grid;
    font-family: var(--zdp-font-family-sans);
    gap: 0;
    min-width: 0;
    overflow: hidden;
  }

  .zdp-code-block--muted {
    --zdp-code-block-surface: var(--zdp-color-surface-raised);

    background: var(--zdp-color-surface-raised);
  }

  .zdp-code-block__header {
    align-items: center;
    border-block-end: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    display: flex;
    flex-wrap: wrap;
    gap: var(--zdp-space-2);
    justify-content: space-between;
    min-width: 0;
    padding: var(--zdp-space-2) var(--zdp-space-3);
  }

  .zdp-code-block__meta {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--zdp-space-2);
    min-width: 0;
  }

  .zdp-code-block__title {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-body-small-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-body-small-line-height);
    min-width: 0;
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
  }

  .zdp-code-block__language {
    color: var(--zdp-color-ink-muted);
    font-family: var(--zdp-font-family-mono);
    font-size: var(--zdp-type-caption-size);
    line-height: var(--zdp-type-caption-line-height);
    min-width: 0;
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
  }

  .zdp-code-block__copy {
    align-items: center;
    background: transparent;
    border: var(--zdp-control-border-width) solid transparent;
    border-radius: var(--zdp-control-radius);
    color: var(--zdp-color-ink-strong);
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-size: var(--zdp-type-caption-size);
    font-weight: var(--zdp-font-weight-medium);
    gap: var(--zdp-space-2);
    line-height: var(--zdp-type-caption-line-height);
    min-height: var(--zdp-control-height-sm);
    padding: 0 var(--zdp-space-3);
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-code-block__copy:where(:hover:not(:disabled)) {
    background: var(--zdp-color-interaction-hover);
    border-color: transparent;
  }

  .zdp-code-block__copy:where(:active:not(:disabled)) {
    background: var(--zdp-color-interaction-pressed);
    border-color: transparent;
  }

  .zdp-code-block__copy:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-code-block__copy[data-copy-state="copying"] {
    cursor: progress;
  }

  .zdp-code-block__copy-spinner {
    border: 2px solid var(--zdp-color-line-subtle);
    border-block-start-color: currentColor;
    border-inline-end-color: currentColor;
    border-radius: 50%;
    box-sizing: border-box;
    display: none;
    flex: 0 0 auto;
    height: var(--zdp-control-glyph-sm);
    width: var(--zdp-control-glyph-sm);
  }

  .zdp-code-block__copy[data-copy-state="copying"] .zdp-code-block__copy-spinner {
    animation: zdp-code-copy-rotate 1s linear infinite;
  }

  .zdp-code-block__copy[data-copy-progress="true"] .zdp-code-block__copy-spinner {
    display: block;
  }

  .zdp-code-block__copy-result {
    flex: 0 0 auto;
    height: var(--zdp-control-glyph-sm);
    width: var(--zdp-control-glyph-sm);
  }

  @keyframes zdp-code-copy-rotate {
    to {
      transform: rotate(1turn);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .zdp-code-block__copy[data-copy-state="copying"] .zdp-code-block__copy-spinner {
      animation: none;
    }
  }

  .zdp-code-block__scroller {
    background: var(--zdp-code-block-surface);
    color: var(--zdp-color-ink-strong);
    min-width: 0;
    overscroll-behavior-inline: contain;
    overflow-x: auto;
    padding: var(--zdp-space-4);
    scrollbar-gutter: stable;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-x pan-y;
  }

  .zdp-code-block__scroller:focus-visible {
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: calc(var(--zdp-control-focus-outline-offset) * -1);
  }

  .zdp-code-block__pre {
    background: var(--zdp-code-block-surface);
    font-family: var(--zdp-font-family-mono);
    font-size: var(--zdp-type-data-size);
    line-height: var(--zdp-font-line-height-normal);
    margin: 0;
    min-width: max-content;
    tab-size: 2;
    white-space: pre;
  }

  .zdp-code-block__code {
    background: var(--zdp-code-block-surface);
    color: inherit;
    font: inherit;
  }

  .zdp-code-block[data-wrap="true"] .zdp-code-block__pre {
    min-width: 0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .zdp-code-block__caption {
    border-block-start: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-caption-size);
    line-height: var(--zdp-type-caption-line-height);
    margin: 0;
    min-width: 0;
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
    padding: var(--zdp-space-2) var(--zdp-space-3);
  }

  .zdp-code-block--sm .zdp-code-block__scroller {
    padding: var(--zdp-space-3);
  }

  .zdp-code-block--sm .zdp-code-block__pre {
    font-size: var(--zdp-type-caption-size);
  }
</style>

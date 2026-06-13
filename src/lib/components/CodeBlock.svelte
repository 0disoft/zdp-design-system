<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { ZdpCodeBlockSize, ZdpCodeBlockTone } from '../code';

  export let code = '';
  export let language: string | null = null;
  export let label: string | null = null;
  export let caption: string | null = null;
  export let size: ZdpCodeBlockSize = 'md';
  export let tone: ZdpCodeBlockTone = 'default';
  export let wrap = false;
  export let showCopy = true;
  export let copyLabel = '복사';
  export let copiedLabel = '복사됨';
  export let copyFailedLabel = '복사 실패';
  export let ariaLabel: string | null = null;
  export let labelledBy: string | null = null;
  export let describedBy: string | null = null;

  type CopyState = 'idle' | 'copied' | 'failed';

  let copyState: CopyState = 'idle';
  let resetCopyStateTimer: ReturnType<typeof setTimeout> | null = null;

  $: canCopy = showCopy && code.length > 0;
  $: resolvedAriaLabel = ariaLabel ?? (!labelledBy && label ? label : null);
  $: codeRegionLabel = [label ?? ariaLabel, language ? `${language} 코드` : '코드'].filter(Boolean).join(' ');
  $: resolvedCopyLabel =
    copyState === 'copied' ? copiedLabel : copyState === 'failed' ? copyFailedLabel : copyLabel;

  onDestroy(() => {
    clearResetCopyStateTimer();
  });

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
    }, 1800);
  }

  async function handleCopy(): Promise<void> {
    if (!canCopy) {
      return;
    }

    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable');
      }

      await navigator.clipboard.writeText(code);
      copyState = 'copied';
    } catch {
      copyState = 'failed';
    }

    scheduleResetCopyState();
  }
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
        <button class="zdp-code-block__copy" type="button" onclick={handleCopy}>
          {resolvedCopyLabel}
        </button>
      {/if}
    </div>
  {/if}

  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div class="zdp-code-block__scroller" role="region" aria-label={codeRegionLabel} tabindex="0">
    <pre class="zdp-code-block__pre"><code class="zdp-code-block__code" data-language={language ?? undefined}>{#if code.length > 0}{code}{:else}<slot />{/if}</code></pre>
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
  }

  .zdp-code-block__language {
    color: var(--zdp-color-ink-muted);
    font-family: var(--zdp-font-family-mono);
    font-size: var(--zdp-type-caption-size);
    line-height: var(--zdp-type-caption-line-height);
  }

  .zdp-code-block__copy {
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    color: var(--zdp-color-ink-strong);
    cursor: pointer;
    font: inherit;
    font-size: var(--zdp-type-caption-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-caption-line-height);
    min-height: var(--zdp-control-height-sm);
    padding: 0 var(--zdp-space-3);
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-code-block__copy:hover {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
  }

  .zdp-code-block__copy:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
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
    padding: var(--zdp-space-2) var(--zdp-space-3);
  }

  .zdp-code-block--sm .zdp-code-block__scroller {
    padding: var(--zdp-space-3);
  }

  .zdp-code-block--sm .zdp-code-block__pre {
    font-size: var(--zdp-type-caption-size);
  }
</style>

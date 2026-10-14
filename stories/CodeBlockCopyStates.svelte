<script lang="ts">
  import CodeBlock from '../src/lib/components/CodeBlock.svelte';
  import Stack from '../src/lib/components/Stack.svelte';

  const themes = ['light', 'dark'] as const;
  const exampleCode = `zdp-design-system/styles.css\nzdp-design-system/tokens.css`;
  const copyLabel = '복사';
  const copyingLabel = '복사 중';
  const copiedLabel = '복사됨';
  const copyFailedLabel = '복사 실패';
</script>

<main class="component-story zdp-surface-reset" lang="ko">
  <header class="component-story__header">
    <p>Code Block</p>
    <h1>복사 상태</h1>
  </header>

  <div class="component-story__grid">
    {#each themes as theme}
      <section
        class="component-story__panel"
        data-zdp-theme={theme}
        aria-labelledby={`code-copy-${theme}-title`}
      >
        <h2 id={`code-copy-${theme}-title`}>{theme === 'light' ? 'Light' : 'Dark'}</h2>
        <Stack gap="md">
          <CodeBlock
            label={`스타일 불러오기 · ${theme === 'light' ? '밝은 테마' : '어두운 테마'}`}
            language="ts"
            code={exampleCode}
            caption="복사 결과는 아이콘과 문구로 2.2초간 표시하고, 실패하면 다시 시도할 수 있어요."
            {copyLabel}
            {copyingLabel}
            {copiedLabel}
            {copyFailedLabel}
          />
        </Stack>
      </section>
    {/each}
  </div>
</main>

<style>
  .component-story {
    background: var(--zdp-color-surface-canvas);
    color: var(--zdp-color-ink-normal);
    display: grid;
    gap: var(--zdp-space-8);
    min-height: var(--zdp-viewport-block);
    padding: var(--zdp-space-8);
  }

  .component-story__header {
    display: grid;
    gap: var(--zdp-space-2);
  }

  .component-story__header p {
    color: var(--zdp-color-accent-danger);
    font-size: var(--zdp-type-label-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-label-line-height);
    margin: 0;
    text-transform: uppercase;
  }

  .component-story__header h1 {
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-display);
    font-size: var(--zdp-type-page-title-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-page-title-line-height);
    margin: 0;
  }

  .component-story__grid {
    display: grid;
    gap: var(--zdp-space-6);
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .component-story__panel {
    align-content: start;
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid transparent;
    border-radius: var(--zdp-control-radius);
    color: var(--zdp-color-ink-normal);
    display: grid;
    gap: var(--zdp-space-5);
    padding: var(--zdp-space-6);
  }

  .component-story__panel h2 {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-title-size);
    line-height: var(--zdp-type-title-line-height);
    margin: 0;
  }

  @media (max-width: 860px) {
    .component-story {
      padding: var(--zdp-space-4);
    }

    .component-story__grid {
      grid-template-columns: 1fr;
    }
  }
</style>

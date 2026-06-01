<script lang="ts">
  import Button from '../src/lib/components/Button.svelte';
  import IconButton from '../src/lib/components/IconButton.svelte';
  import Surface from '../src/lib/components/Surface.svelte';
</script>

<main class="storybook-preview zdp-surface-reset">
  <header class="storybook-preview__header">
    <div>
      <h1>ZDP Design System</h1>
      <p>Tokens, surfaces, buttons, light and dark.</p>
    </div>
    <span>Storybook</span>
  </header>

  <div class="storybook-preview__grid" aria-label="Theme previews">
    <section class="theme-panel" data-zdp-theme="light" aria-labelledby="storybook-light-title">
      <div class="theme-panel__header">
        <h2 id="storybook-light-title">Light</h2>
        <span>OKLCH</span>
      </div>

      <section class="preview-section" aria-labelledby="storybook-light-color">
        <h3 id="storybook-light-color">Color</h3>
        <div class="swatches">
          <span class="swatch">
            <span class="swatch__paint swatch__paint--primary"></span>
            <span class="swatch__label">Primary</span>
          </span>
          <span class="swatch">
            <span class="swatch__paint swatch__paint--success"></span>
            <span class="swatch__label">Success</span>
          </span>
          <span class="swatch">
            <span class="swatch__paint swatch__paint--warning"></span>
            <span class="swatch__label">Warning</span>
          </span>
          <span class="swatch">
            <span class="swatch__paint swatch__paint--danger"></span>
            <span class="swatch__label">Danger</span>
          </span>
        </div>
      </section>

      <section class="preview-section" aria-labelledby="storybook-light-type">
        <h3 id="storybook-light-type">Type</h3>
        <p class="type-sample">
          <strong>빠르게 만들고 오래 가져가기</strong>
          <span>Readable body text with steady spacing and quiet contrast.</span>
        </p>
      </section>

      <section class="preview-section" aria-labelledby="storybook-light-actions">
        <h3 id="storybook-light-actions">Actions</h3>
        <div class="action-row">
          <Button variant="primary">저장</Button>
          <Button variant="secondary">취소</Button>
          <Button variant="danger">삭제</Button>
          <IconButton ariaLabel="추가" variant="solid">+</IconButton>
        </div>
      </section>

      <section class="preview-section" aria-labelledby="storybook-light-surfaces">
        <h3 id="storybook-light-surfaces">Surfaces</h3>
        <div class="surface-grid">
          <Surface tone="panel" padding="lg">
            <span class="surface-kicker">Panel</span>
            <strong>기본 작업 영역</strong>
            <p>차분한 배경 위에서 내용과 액션이 먼저 보인다.</p>
          </Surface>
          <Surface tone="raised" padding="lg">
            <span class="surface-kicker">Raised</span>
            <strong>강조 영역</strong>
            <p>목록, 설정, 선택 흐름에 맞는 밀도다.</p>
          </Surface>
        </div>
      </section>
    </section>

    <section class="theme-panel" data-zdp-theme="dark" aria-labelledby="storybook-dark-title">
      <div class="theme-panel__header">
        <h2 id="storybook-dark-title">Dark</h2>
        <span>OKLCH</span>
      </div>

      <section class="preview-section" aria-labelledby="storybook-dark-color">
        <h3 id="storybook-dark-color">Color</h3>
        <div class="swatches">
          <span class="swatch">
            <span class="swatch__paint swatch__paint--primary"></span>
            <span class="swatch__label">Primary</span>
          </span>
          <span class="swatch">
            <span class="swatch__paint swatch__paint--success"></span>
            <span class="swatch__label">Success</span>
          </span>
          <span class="swatch">
            <span class="swatch__paint swatch__paint--warning"></span>
            <span class="swatch__label">Warning</span>
          </span>
          <span class="swatch">
            <span class="swatch__paint swatch__paint--danger"></span>
            <span class="swatch__label">Danger</span>
          </span>
        </div>
      </section>

      <section class="preview-section" aria-labelledby="storybook-dark-type">
        <h3 id="storybook-dark-type">Type</h3>
        <p class="type-sample">
          <strong>빠르게 만들고 오래 가져가기</strong>
          <span>Readable body text with steady spacing and quiet contrast.</span>
        </p>
      </section>

      <section class="preview-section" aria-labelledby="storybook-dark-actions">
        <h3 id="storybook-dark-actions">Actions</h3>
        <div class="action-row">
          <Button variant="primary">저장</Button>
          <Button variant="secondary">취소</Button>
          <Button variant="danger">삭제</Button>
          <IconButton ariaLabel="추가" variant="solid">+</IconButton>
        </div>
      </section>

      <section class="preview-section" aria-labelledby="storybook-dark-surfaces">
        <h3 id="storybook-dark-surfaces">Surfaces</h3>
        <div class="surface-grid">
          <Surface tone="panel" padding="lg">
            <span class="surface-kicker">Panel</span>
            <strong>기본 작업 영역</strong>
            <p>차분한 배경 위에서 내용과 액션이 먼저 보인다.</p>
          </Surface>
          <Surface tone="raised" padding="lg">
            <span class="surface-kicker">Raised</span>
            <strong>강조 영역</strong>
            <p>목록, 설정, 선택 흐름에 맞는 밀도다.</p>
          </Surface>
        </div>
      </section>
    </section>
  </div>
</main>

<style>
  .storybook-preview {
    background: var(--zdp-color-surface-canvas);
    color: var(--zdp-color-ink-normal);
    display: grid;
    gap: var(--zdp-space-8);
    min-height: 100vh;
    padding: var(--zdp-space-8);
  }

  .storybook-preview__header {
    align-items: end;
    display: flex;
    gap: var(--zdp-space-4);
    justify-content: space-between;
  }

  .storybook-preview__header h1 {
    color: var(--zdp-color-ink-strong);
    font-size: 3.5rem;
    font-weight: var(--zdp-font-weight-bold);
    line-height: 1;
    margin: 0;
  }

  .storybook-preview__header p {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-font-size-sm);
    margin: var(--zdp-space-3) 0 0;
  }

  .storybook-preview__header > span,
  .theme-panel__header span {
    background: var(--zdp-color-accent-primary-soft);
    border-radius: var(--zdp-radius-pill);
    color: var(--zdp-color-accent-primary-strong);
    font-size: var(--zdp-font-size-xs);
    font-weight: var(--zdp-font-weight-semibold);
    padding: var(--zdp-space-1) var(--zdp-space-3);
  }

  .storybook-preview__grid {
    display: grid;
    gap: var(--zdp-space-6);
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .theme-panel {
    background: var(--zdp-color-surface-canvas);
    border: 1px solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-radius-lg);
    color: var(--zdp-color-ink-normal);
    display: grid;
    gap: var(--zdp-space-6);
    min-width: 0;
    padding: var(--zdp-space-6);
  }

  .theme-panel__header {
    align-items: center;
    display: flex;
    justify-content: space-between;
  }

  .theme-panel__header h2 {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-font-size-xl);
    font-weight: var(--zdp-font-weight-bold);
    margin: 0;
  }

  .preview-section {
    display: grid;
    gap: var(--zdp-space-3);
  }

  .preview-section h3 {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-font-size-xs);
    font-weight: var(--zdp-font-weight-bold);
    letter-spacing: 0;
    margin: 0;
    text-transform: uppercase;
  }

  .swatches {
    display: grid;
    gap: var(--zdp-space-2);
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .swatch {
    border: 1px solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-radius-md);
    min-height: 4.25rem;
    overflow: hidden;
  }

  .swatch__paint {
    display: block;
    height: 2.5rem;
  }

  .swatch__paint--primary {
    background: var(--zdp-color-accent-primary);
  }

  .swatch__paint--success {
    background: var(--zdp-color-accent-success);
  }

  .swatch__paint--warning {
    background: var(--zdp-color-accent-warning);
  }

  .swatch__paint--danger {
    background: var(--zdp-color-accent-danger);
  }

  .swatch__label {
    background: var(--zdp-color-surface-panel);
    color: var(--zdp-color-ink-muted);
    display: block;
    font-size: var(--zdp-font-size-xs);
    padding: var(--zdp-space-2);
  }

  .type-sample {
    display: grid;
    gap: var(--zdp-space-2);
    margin: 0;
  }

  .type-sample strong {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-font-size-xl);
    line-height: var(--zdp-font-line-height-tight);
  }

  .type-sample span {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-font-size-sm);
  }

  .action-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--zdp-space-3);
  }

  .surface-grid {
    display: grid;
    gap: var(--zdp-space-3);
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .surface-grid :global(.zdp-surface) {
    min-height: 8rem;
  }

  .surface-kicker {
    color: var(--zdp-color-ink-muted);
    display: block;
    font-size: var(--zdp-font-size-xs);
    font-weight: var(--zdp-font-weight-semibold);
    margin-bottom: var(--zdp-space-2);
  }

  .surface-grid p {
    color: inherit;
    font-size: var(--zdp-font-size-sm);
    margin: var(--zdp-space-2) 0 0;
  }

  @media (max-width: 860px) {
    .storybook-preview {
      padding: var(--zdp-space-4);
    }

    .storybook-preview__header {
      align-items: start;
      display: grid;
    }

    .storybook-preview__header h1 {
      font-size: 2.5rem;
    }

    .storybook-preview__grid,
    .surface-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 520px) {
    .swatches {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>

<script lang="ts">
  import Button from '../src/lib/components/Button.svelte';
  import IconButton from '../src/lib/components/IconButton.svelte';
  import Surface from '../src/lib/components/Surface.svelte';
</script>

<main class="storybook-preview zdp-surface-reset">
  <header class="storybook-preview__header">
    <div>
      <p class="eyebrow">Sunlit parchment kit</p>
      <h1>ZDP Design System</h1>
      <p>Bright town-square surfaces, soft heraldic color, and quiet working controls.</p>
    </div>
    <span>Storybook</span>
  </header>

  <div class="storybook-preview__grid" aria-label="Theme previews">
    <section class="theme-panel theme-panel--light" data-zdp-theme="light" aria-labelledby="storybook-light-title">
      <div class="theme-panel__header">
        <h2 id="storybook-light-title">Light</h2>
        <span>OKLCH</span>
      </div>

      <section class="preview-section" aria-labelledby="storybook-light-color">
        <h3 id="storybook-light-color">Color</h3>
        <div class="swatches">
          <span class="swatch">
            <span class="swatch__paint swatch__paint--primary"></span>
            <span class="swatch__label">Dusty blue</span>
          </span>
          <span class="swatch">
            <span class="swatch__paint swatch__paint--success"></span>
            <span class="swatch__label">Sage green</span>
          </span>
          <span class="swatch">
            <span class="swatch__paint swatch__paint--warning"></span>
            <span class="swatch__label">Sunlit gold</span>
          </span>
          <span class="swatch">
            <span class="swatch__paint swatch__paint--danger"></span>
            <span class="swatch__label">Burgundy</span>
          </span>
        </div>
      </section>

      <section class="preview-section" aria-labelledby="storybook-light-type">
        <h3 id="storybook-light-type">Type</h3>
        <p class="type-sample">
          <strong>마을 광장처럼 밝고 단단하게</strong>
          <span>Pretendard-first multiscript text with warm contrast and enough air for product work.</span>
          <a href="#foundation-tokens">자세히 보기</a>
        </p>
      </section>

      <section class="preview-section" aria-labelledby="storybook-light-focus">
        <h3 id="storybook-light-focus">Focus</h3>
        <div class="focus-demo">
          <a href="#foundation-tokens">출시 노트 보기</a>
          <label class="focus-demo__field" for="storybook-light-focus-search">
            <span>검색</span>
            <input id="storybook-light-focus-search" type="search" placeholder="Search Design System" />
          </label>
        </div>
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
            <span class="surface-kicker">Parchment</span>
            <strong>작업을 펼치는 자리</strong>
            <p>밝은 종이감 위에 내용, 선택지, 다음 액션이 또렷하게 올라온다.</p>
          </Surface>
          <Surface tone="raised" padding="lg">
            <span class="surface-kicker">Banner</span>
            <strong>살짝 들어 올린 강조</strong>
            <p>목록, 설정, 작은 알림이 과하게 튀지 않고 구분된다.</p>
          </Surface>
        </div>
      </section>
    </section>

    <section class="theme-panel theme-panel--dark" data-zdp-theme="dark" aria-labelledby="storybook-dark-title">
      <div class="theme-panel__header">
        <h2 id="storybook-dark-title">Dark</h2>
        <span>OKLCH</span>
      </div>

      <section class="preview-section" aria-labelledby="storybook-dark-color">
        <h3 id="storybook-dark-color">Color</h3>
        <div class="swatches">
          <span class="swatch">
            <span class="swatch__paint swatch__paint--primary"></span>
            <span class="swatch__label">Moonlit blue</span>
          </span>
          <span class="swatch">
            <span class="swatch__paint swatch__paint--success"></span>
            <span class="swatch__label">Sage green</span>
          </span>
          <span class="swatch">
            <span class="swatch__paint swatch__paint--warning"></span>
            <span class="swatch__label">Lantern gold</span>
          </span>
          <span class="swatch">
            <span class="swatch__paint swatch__paint--danger"></span>
            <span class="swatch__label">Terracotta</span>
          </span>
        </div>
      </section>

      <section class="preview-section" aria-labelledby="storybook-dark-type">
        <h3 id="storybook-dark-type">Type</h3>
        <p class="type-sample">
          <strong>밤에도 종이결은 남기기</strong>
          <span>Dark mode keeps the same market palette without turning into a blue console.</span>
          <a href="#foundation-tokens">자세히 보기</a>
        </p>
      </section>

      <section class="preview-section" aria-labelledby="storybook-dark-focus">
        <h3 id="storybook-dark-focus">Focus</h3>
        <div class="focus-demo">
          <a href="#foundation-tokens">업데이트 보기</a>
          <label class="focus-demo__field" for="storybook-dark-focus-search">
            <span>검색</span>
            <input id="storybook-dark-focus-search" type="search" placeholder="Search Design System" />
          </label>
        </div>
      </section>

      <section class="preview-section" aria-labelledby="storybook-dark-actions">
        <h3 id="storybook-dark-actions">Actions</h3>
        <div class="action-row">
          <Button variant="primary">저장</Button>
          <Button variant="secondary">취소</Button>
          <Button variant="danger">삭제</Button>
          <IconButton ariaLabel="추가" variant="ghost">+</IconButton>
        </div>
      </section>

      <section class="preview-section" aria-labelledby="storybook-dark-surfaces">
        <h3 id="storybook-dark-surfaces">Surfaces</h3>
        <div class="surface-grid">
          <Surface tone="panel" padding="lg">
            <span class="surface-kicker">Parchment</span>
            <strong>어두운 배경의 작업지</strong>
            <p>톤은 낮추되 버튼과 상태 색은 같은 계열로 이어진다.</p>
          </Surface>
          <Surface tone="raised" padding="lg">
            <span class="surface-kicker">Banner</span>
            <strong>중요한 조각만 살짝 앞으로</strong>
            <p>짙은 잉크 위에서도 경계와 초점이 분명하다.</p>
          </Surface>
        </div>
      </section>
    </section>
  </div>

  <section class="foundation-strip" id="foundation-tokens" aria-label="Foundation tokens">
    <article>
      <span>Type</span>
      <strong>Body / small / caption / data</strong>
    </article>
    <article>
      <span>Control</span>
      <strong>2.25rem / 2.75rem</strong>
    </article>
    <article>
      <span>Responsive</span>
      <strong>40 / 64 / 80 / 96rem</strong>
    </article>
    <article>
      <span>i18n</span>
      <strong><span lang="ko">긴문장</span> / <span lang="zh">自由</span> / <span lang="hi">स्वर</span> / Safe</strong>
    </article>
  </section>

  <section class="motif-strip" aria-label="Decorative motif samples">
    <span class="motif-strip__line"></span>
    <span class="motif-strip__mark">✦</span>
    <span class="motif-strip__line"></span>
  </section>
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

  .eyebrow {
    color: var(--zdp-color-accent-danger);
    font-size: var(--zdp-font-size-xs);
    font-weight: var(--zdp-font-weight-bold);
    letter-spacing: 0;
    margin: 0 0 var(--zdp-space-2);
    text-transform: uppercase;
  }

  .storybook-preview__header h1 {
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-display);
    font-size: 3.5rem;
    font-weight: var(--zdp-font-weight-bold);
    line-height: 1;
    margin: 0;
  }

  .storybook-preview__header p:not(.eyebrow) {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-font-size-md);
    margin: var(--zdp-space-3) 0 0;
    max-width: 34rem;
  }

  .storybook-preview__header > span,
  .theme-panel__header span {
    background: var(--zdp-color-surface-raised);
    border: 1px solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-radius-md);
    color: var(--zdp-color-ink-muted);
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
    background: var(--zdp-color-surface-panel);
    border: 1px solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-radius-lg);
    color: var(--zdp-color-ink-normal);
    display: grid;
    gap: var(--zdp-space-6);
    min-width: 0;
    padding: var(--zdp-space-6);
  }

  .theme-panel--light {
    border-color: var(--zdp-color-line-strong);
  }

  .theme-panel--dark {
    background: var(--zdp-color-surface-panel);
  }

  .theme-panel__header {
    align-items: center;
    display: flex;
    gap: var(--zdp-space-3);
    justify-content: space-between;
  }

  .theme-panel__header h2 {
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-display);
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
    background: var(--zdp-color-surface-panel);
    border: 1px solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-radius-md);
    min-height: 4.5rem;
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
    color: var(--zdp-color-ink-muted);
    display: block;
    font-size: var(--zdp-font-size-xs);
    padding: var(--zdp-space-2);
    text-decoration: none;
  }

  [data-zdp-theme="dark"] .swatch__label {
    background: var(--zdp-color-surface-inverse);
    color: var(--zdp-color-ink-inverse);
  }

  .type-sample {
    display: grid;
    gap: var(--zdp-space-2);
    margin: 0;
  }

  .type-sample strong {
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-display);
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

  .focus-demo {
    display: grid;
    gap: var(--zdp-space-3);
    max-width: 28rem;
  }

  .focus-demo__field {
    display: grid;
    gap: var(--zdp-space-2);
  }

  .focus-demo__field span {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-label-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-label-line-height);
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
    color: var(--zdp-color-accent-danger);
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

  .foundation-strip {
    --storybook-type-body-small: var(--zdp-type-body-small-size);
    --storybook-type-caption: var(--zdp-type-caption-size);
    --storybook-type-data: var(--zdp-type-data-size);
    --storybook-control-border-width: var(--zdp-control-border-width);
    --storybook-focus-outline-width: var(--zdp-control-focus-outline-width);
    display: grid;
    gap: var(--zdp-space-3);
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .foundation-strip article {
    background: var(--zdp-color-surface-panel);
    border: 1px solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    display: grid;
    gap: var(--zdp-space-2);
    min-width: 0;
    padding: var(--zdp-space-4);
  }

  .foundation-strip span {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-label-size);
    font-weight: var(--zdp-font-weight-bold);
    line-height: var(--zdp-type-label-line-height);
    text-transform: uppercase;
  }

  .foundation-strip strong {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-body-size);
    line-height: var(--zdp-type-body-line-height);
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
  }

  .motif-strip {
    align-items: center;
    color: var(--zdp-color-line-strong);
    display: grid;
    gap: var(--zdp-space-3);
    grid-template-columns: 1fr auto 1fr;
  }

  .motif-strip__line {
    background: currentcolor;
    display: block;
    height: 1px;
  }

  .motif-strip__mark {
    color: var(--zdp-color-accent-warning);
    font-size: var(--zdp-font-size-xl);
    line-height: 1;
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
    .foundation-strip,
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

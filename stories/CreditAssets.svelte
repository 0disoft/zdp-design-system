<script lang="ts">
  const lemonAssets = [
    {
      name: 'Mono',
      url: new URL('../src/lib/assets/credits/credit-lemon-simple-mono.svg', import.meta.url).href,
      surface: 'light'
    },
    {
      name: 'Inverse',
      url: new URL('../src/lib/assets/credits/credit-lemon-simple-inverse.svg', import.meta.url).href,
      surface: 'dark'
    },
    {
      name: 'Current color',
      url: new URL('../src/lib/assets/credits/credit-lemon-simple-current-color.svg', import.meta.url).href,
      surface: 'current'
    },
    {
      name: 'Color',
      url: new URL('../src/lib/assets/credits/credit-lemon-simple-color.svg', import.meta.url).href,
      surface: 'light'
    }
  ] as const;

  const packAssets = [
    ['Dinghy', new URL('../src/lib/assets/credits/credit-pack-dinghy.svg', import.meta.url).href],
    ['Skiff', new URL('../src/lib/assets/credits/credit-pack-skiff.svg', import.meta.url).href],
    ['Sloop', new URL('../src/lib/assets/credits/credit-pack-sloop.svg', import.meta.url).href],
    ['Brig', new URL('../src/lib/assets/credits/credit-pack-brig.svg', import.meta.url).href],
    ['Frigate', new URL('../src/lib/assets/credits/credit-pack-frigate.svg', import.meta.url).href],
    ['Galleon', new URL('../src/lib/assets/credits/credit-pack-galleon.svg', import.meta.url).href],
    ['Flagship', new URL('../src/lib/assets/credits/credit-pack-flagship.svg', import.meta.url).href]
  ] as const;

  const keyartAssets = [
    ['Dinghy', new URL('../src/lib/assets/credits/credit-pack-keyart-dinghy.webp', import.meta.url).href],
    ['Skiff', new URL('../src/lib/assets/credits/credit-pack-keyart-skiff.webp', import.meta.url).href],
    ['Sloop', new URL('../src/lib/assets/credits/credit-pack-keyart-sloop.webp', import.meta.url).href],
    ['Brig', new URL('../src/lib/assets/credits/credit-pack-keyart-brig.webp', import.meta.url).href],
    ['Frigate', new URL('../src/lib/assets/credits/credit-pack-keyart-frigate.webp', import.meta.url).href],
    ['Galleon', new URL('../src/lib/assets/credits/credit-pack-keyart-galleon.webp', import.meta.url).href],
    ['Flagship', new URL('../src/lib/assets/credits/credit-pack-keyart-flagship.webp', import.meta.url).href]
  ] as const;
</script>

<main class="credit-preview zdp-surface-reset">
  <header>
    <p class="credit-preview__eyebrow">ZDP credits</p>
    <h1>Credit assets</h1>
  </header>

  <section aria-labelledby="credit-marks-title">
    <h2 id="credit-marks-title">Lemon marks</h2>
    <div class="credit-grid credit-grid--marks">
      {#each lemonAssets as asset}
        <figure class:credit-frame--dark={asset.surface === 'dark'} class="credit-frame">
          {#if asset.surface === 'current'}
            <span
              class="credit-icon credit-icon--current"
              style={`--credit-asset-url: url("${asset.url}")`}
              aria-hidden="true"
            ></span>
          {:else}
            <img src={asset.url} alt="" width="48" height="48" />
          {/if}
          <figcaption>{asset.name}</figcaption>
        </figure>
      {/each}
    </div>
  </section>

  <section aria-labelledby="credit-keyart-title">
    <h2 id="credit-keyart-title">Pricing key art</h2>
    <div class="credit-grid credit-grid--keyart">
      {#each keyartAssets as [name, url]}
        <figure class="credit-frame credit-frame--keyart">
          <img src={url} alt="" width="1600" height="900" />
          <figcaption>{name} · 1600 × 900</figcaption>
        </figure>
      {/each}
    </div>
  </section>

  <section aria-labelledby="credit-packs-title">
    <h2 id="credit-packs-title">Compact credit pack glyphs</h2>
    <div class="credit-grid credit-grid--ships">
      {#each packAssets as [name, url]}
        <figure class="credit-frame credit-frame--ship">
          <div class="credit-ship-sizes" aria-hidden="true">
            <span class="credit-icon credit-icon--small" style={`--credit-asset-url: url("${url}")`}></span>
            <span class="credit-icon credit-icon--large" style={`--credit-asset-url: url("${url}")`}></span>
          </div>
          <figcaption>{name} · 24 / 64 px</figcaption>
        </figure>
      {/each}
    </div>
  </section>
</main>

<style>
  .credit-preview {
    background: var(--zdp-color-surface-canvas);
    color: var(--zdp-color-ink-strong);
    display: grid;
    gap: var(--zdp-space-8);
    min-block-size: var(--zdp-viewport-block);
    padding: var(--zdp-space-8);
  }

  header,
  section {
    inline-size: 100%;
    margin-inline: auto;
    max-inline-size: 80rem;
  }

  header h1,
  section h2 {
    margin-block: 0;
  }

  .credit-preview__eyebrow {
    font-size: var(--zdp-type-label-size);
    font-weight: var(--zdp-font-weight-bold);
    margin-block: 0 var(--zdp-space-2);
    text-transform: uppercase;
  }

  section {
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-radius-lg);
    display: grid;
    gap: var(--zdp-space-5);
    padding: var(--zdp-space-6);
  }

  .credit-grid {
    display: grid;
    gap: var(--zdp-space-4);
  }

  .credit-grid--marks {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .credit-grid--ships {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .credit-grid--keyart {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .credit-frame {
    background: var(--zdp-color-surface-raised);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-radius-md);
    color: var(--zdp-color-ink-strong);
    display: grid;
    margin: 0;
    min-inline-size: 0;
    overflow: hidden;
  }

  .credit-frame--dark {
    background: var(--zdp-color-surface-canvas);
  }

  .credit-frame img,
  .credit-icon--current {
    block-size: 8rem;
    box-sizing: border-box;
    display: block;
    inline-size: 8rem;
    margin: var(--zdp-space-6) auto;
    padding: var(--zdp-space-5);
  }

  .credit-frame--dark img {
    background: var(--zdp-color-surface-canvas);
  }

  .credit-frame--keyart img {
    block-size: auto;
    inline-size: 100%;
    margin: 0;
    padding: var(--zdp-space-4);
  }

  .credit-icon {
    background: currentcolor;
    display: block;
    mask: var(--credit-asset-url) center / contain no-repeat;
  }

  .credit-icon--current {
    color: var(--zdp-color-accent-primary);
  }

  .credit-ship-sizes {
    align-items: end;
    color: var(--zdp-color-ink-strong);
    display: flex;
    gap: var(--zdp-space-4);
    justify-content: center;
    min-block-size: 8rem;
    padding: var(--zdp-space-6);
  }

  .credit-icon--small {
    block-size: 1.5rem;
    inline-size: 1.5rem;
  }

  .credit-icon--large {
    block-size: 4rem;
    inline-size: 4rem;
  }

  figcaption {
    background: var(--zdp-color-surface-panel);
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-caption-size);
    padding: var(--zdp-space-3);
  }

  @media (max-width: 64rem) {
    .credit-grid--marks,
    .credit-grid--keyart,
    .credit-grid--ships {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 36rem) {
    .credit-preview {
      padding: var(--zdp-space-4);
    }

    .credit-grid--marks,
    .credit-grid--keyart,
    .credit-grid--ships {
      grid-template-columns: 1fr;
    }
  }
</style>

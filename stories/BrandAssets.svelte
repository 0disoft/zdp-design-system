<script lang="ts">
  import shipMarkSimpleCurrentColorMarkup from '../src/lib/assets/brand/ship-mark-simple-current-color.svg?raw';

  let unavailableAsset = false;

  const assets = {
    og: new URL('../src/lib/assets/brand/og-background-1200x630.jpg', import.meta.url).href,
    square256: new URL('../src/lib/assets/brand/brand-square-256.webp', import.meta.url).href,
    square512: new URL('../src/lib/assets/brand/brand-square-512.webp', import.meta.url).href,
    square1024: new URL('../src/lib/assets/brand/brand-square-1024.webp', import.meta.url).href,
    editorial: new URL('../src/lib/assets/brand/editorial-720x540.webp', import.meta.url).href,
    landscape: new URL('../src/lib/assets/brand/landscape-960x540.webp', import.meta.url).href,
    shipMark: new URL('../src/lib/assets/brand/ship-mark.svg', import.meta.url).href,
    shipMarkSimpleMono: new URL('../src/lib/assets/brand/ship-mark-simple-mono.svg', import.meta.url).href,
    shipMarkSimpleInverse: new URL('../src/lib/assets/brand/ship-mark-simple-inverse.svg', import.meta.url).href,
    shipMarkSimpleTricolor: new URL('../src/lib/assets/brand/ship-mark-simple-tricolor.svg', import.meta.url).href
  } as const;
</script>

<main class="asset-preview zdp-surface-reset">
  <header>
    <p class="asset-preview__eyebrow">ZDP brand</p>
    <h1>Fallback assets</h1>
  </header>

  <section aria-labelledby="asset-preview-dark-title" data-zdp-theme="dark">
    <h2 id="asset-preview-dark-title">Dark surfaces</h2>
    <div class="asset-grid asset-grid--wide">
      <figure class="asset-frame asset-frame--og">
        <img src={assets.og} alt="" width="1200" height="630" />
        <span class="safe-area" aria-hidden="true"></span>
        <figcaption>Open Graph · 1200 × 630</figcaption>
      </figure>
      <figure class="asset-frame asset-frame--square">
        <img
          src={assets.square512}
          srcset={`${assets.square256} 256w, ${assets.square512} 512w, ${assets.square1024} 1024w`}
          sizes="(max-width: 50rem) calc(100vw - 4rem), 27rem"
          alt=""
          width="1024"
          height="1024"
        />
        <figcaption>Square · responsive 256 / 512 / 1024</figcaption>
      </figure>
      <figure class="asset-frame asset-frame--landscape">
        <img src={assets.landscape} alt="" width="960" height="540" />
        <figcaption>Landscape · 16:9</figcaption>
      </figure>
      <figure class="asset-frame asset-frame--mark asset-frame--inverse">
        <img src={assets.shipMarkSimpleInverse} alt="" width="48" height="48" />
        <figcaption>Simple inverse mark · 48 × 48</figcaption>
      </figure>
    </div>
  </section>

  <section aria-labelledby="asset-preview-light-title" data-zdp-theme="light">
    <h2 id="asset-preview-light-title">Light surfaces</h2>
    <div class="asset-grid">
      <figure class="asset-frame asset-frame--editorial">
        <img src={assets.editorial} alt="" width="720" height="540" />
        <figcaption>Editorial · 4:3</figcaption>
      </figure>
      <figure class="asset-frame asset-frame--mark">
        <img src={assets.shipMark} alt="" width="48" height="48" />
        <figcaption>Detailed compatibility mark · 48 × 48</figcaption>
      </figure>
      <figure class="asset-frame asset-frame--mark">
        <img src={assets.shipMarkSimpleMono} alt="" width="48" height="48" />
        <figcaption>Simple mono mark · default</figcaption>
      </figure>
      <figure class="asset-frame asset-frame--mark">
        <span class="asset-mark-preview" aria-hidden="true">
          {@html shipMarkSimpleCurrentColorMarkup}
        </span>
        <figcaption>Simple currentColor mark · inline use</figcaption>
      </figure>
      <figure class="asset-frame asset-frame--mark">
        <img src={assets.shipMarkSimpleTricolor} alt="" width="48" height="48" />
        <figcaption>Simple tricolor mark · 32 px minimum</figcaption>
      </figure>
      <figure class="asset-frame asset-frame--missing">
        {#if unavailableAsset}
          <span class="asset-missing-preview" aria-hidden="true">
            <svg viewBox="0 0 48 48">
              <rect x="7" y="9" width="34" height="30" rx="2" fill="none" stroke="currentColor" stroke-width="2" />
              <path d="m10 36 9-10 6 6 5-5 8 9M32 16h.01" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
              <path d="M9 41 40 7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="3" />
            </svg>
          </span>
        {:else}
          <img
            src="/__zdp_missing_brand_asset__.webp"
            alt=""
            width="256"
            height="256"
            onerror={() => (unavailableAsset = true)}
          />
        {/if}
        <figcaption>Unavailable asset</figcaption>
      </figure>
    </div>
  </section>
</main>

<style>
  .asset-preview {
    background: var(--zdp-color-surface-canvas);
    color: var(--zdp-color-ink-strong);
    display: grid;
    gap: var(--zdp-space-8);
    min-block-size: var(--zdp-viewport-block);
    padding: var(--zdp-space-8);
  }

  header,
  section {
    margin-inline: auto;
    max-inline-size: 80rem;
    inline-size: 100%;
  }

  header h1,
  section h2 {
    margin-block: 0;
  }

  .asset-preview__eyebrow {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-label-size);
    font-weight: var(--zdp-font-weight-bold);
    margin-block: 0 var(--zdp-space-2);
    text-transform: uppercase;
  }

  section {
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-radius-lg);
    color: var(--zdp-color-ink-strong);
    display: grid;
    gap: var(--zdp-space-5);
    padding: var(--zdp-space-6);
  }

  .asset-grid {
    display: grid;
    gap: var(--zdp-space-5);
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .asset-grid--wide {
    grid-template-columns: minmax(0, 2fr) minmax(14rem, 1fr);
  }

  .asset-frame {
    background: var(--zdp-color-surface-raised);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-radius-md);
    display: grid;
    margin: 0;
    min-inline-size: 0;
    overflow: hidden;
    position: relative;
  }

  .asset-frame img {
    background: var(--zdp-color-surface-raised);
    block-size: auto;
    display: block;
    inline-size: 100%;
    object-fit: contain;
  }

  .asset-frame--og img { aspect-ratio: 40 / 21; }
  .asset-frame--square img,
  .asset-frame--mark img,
  .asset-frame--missing img { aspect-ratio: 1; }
  .asset-frame--editorial img { aspect-ratio: 4 / 3; }
  .asset-frame--landscape img { aspect-ratio: 16 / 9; }

  .asset-frame--mark img,
  .asset-frame--missing img,
  .asset-mark-preview,
  .asset-missing-preview {
    margin: auto;
    max-inline-size: 16rem;
    padding: var(--zdp-space-8);
  }

  .asset-frame--inverse {
    background: var(--zdp-color-surface-canvas);
  }

  .asset-frame--inverse img {
    background: var(--zdp-color-surface-canvas);
  }

  .asset-mark-preview {
    aspect-ratio: 1;
    block-size: auto;
    box-sizing: border-box;
    color: var(--zdp-color-accent-primary);
    display: block;
    inline-size: 100%;
  }

  .asset-mark-preview :global(svg),
  .asset-missing-preview svg {
    block-size: 100%;
    display: block;
    inline-size: 100%;
  }

  .asset-missing-preview {
    aspect-ratio: 1;
    box-sizing: border-box;
    color: var(--zdp-color-ink-muted);
    display: block;
    inline-size: 100%;
  }

  .safe-area {
    border: var(--zdp-control-border-width) dashed color-mix(in oklch, var(--zdp-color-focus-line) 72%, transparent);
    inset: 10% 6% 22% 54%;
    pointer-events: none;
    position: absolute;
  }

  figcaption {
    background: var(--zdp-color-surface-panel);
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-caption-size);
    padding: var(--zdp-space-3);
  }

  @media (max-width: 50rem) {
    .asset-preview { padding: var(--zdp-space-4); }
    .asset-grid,
    .asset-grid--wide { grid-template-columns: 1fr; }
  }
</style>

import assert from 'node:assert/strict';

const zoomEquivalentWidths = [
  { label: '100%', width: 1600 },
  { label: '125%', width: 1280 },
  { label: '150%', width: 1067 },
  { label: '200%', width: 800 }
];

const pageContainerSelectors = [
  '[data-testid="svelte-page-gutter-host"] > .zdp-container--padding-page',
  '[data-testid="static-page-gutter"]'
];

export async function verifyPageGutterContracts(page, baseUrl) {
  await page.goto(`${baseUrl}/page-gutter.html`, {
    timeout: 30_000,
    waitUntil: 'domcontentloaded'
  });

  for (const direction of ['ltr', 'rtl']) {
    await page.evaluate((dir) => {
      document.documentElement.dir = dir;
    }, direction);

    for (const zoomCase of zoomEquivalentWidths) {
      await page.setViewportSize({ width: zoomCase.width, height: 900 });

      for (const selector of pageContainerSelectors) {
        const metrics = await measureContainer(page.locator(selector));
        const context = `${selector} at ${zoomCase.label} zoom-equivalent width in ${direction}`;

        assert.ok(metrics.classNames.includes('zdp-container--padding-page'), `${context} must expose the semantic page gutter class.`);
        assert.ok(metrics.paddingInlineStart >= 24, `${context} must preserve at least 24 CSS px at inline start.`);
        assert.ok(metrics.paddingInlineEnd >= 24, `${context} must preserve at least 24 CSS px at inline end.`);
        assert.ok(metrics.contentLeft >= 24, `${context} content must remain at least 24 CSS px from the physical left edge.`);
        assert.ok(metrics.contentRight >= 24, `${context} content must remain at least 24 CSS px from the physical right edge.`);
        assert.ok(metrics.scrollWidth <= metrics.clientWidth, `${context} must not overflow horizontally.`);
      }

      const documentMetrics = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth
      }));
      assert.ok(
        documentMetrics.scrollWidth <= documentMetrics.clientWidth,
        `Page gutter fixture must not overflow horizontally at ${zoomCase.label} zoom-equivalent width in ${direction}.`
      );
    }
  }

  const nestedMetrics = await measureContainer(
    page.locator('[data-testid="nested-container-host"] > .zdp-container--padding-md')
  );
  assert.equal(nestedMetrics.paddingInlineStart, 16, 'Nested medium padding must remain 16 CSS px.');
  assert.equal(nestedMetrics.paddingInlineEnd, 16, 'Nested medium padding must remain 16 CSS px.');
}

async function measureContainer(locator) {
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const paddingLeft = Number.parseFloat(style.paddingLeft);
    const paddingRight = Number.parseFloat(style.paddingRight);

    return {
      classNames: Array.from(element.classList),
      clientWidth: element.clientWidth,
      contentLeft: rect.left + paddingLeft,
      contentRight: window.innerWidth - rect.right + paddingRight,
      paddingInlineEnd: Number.parseFloat(style.paddingInlineEnd),
      paddingInlineStart: Number.parseFloat(style.paddingInlineStart),
      scrollWidth: element.scrollWidth
    };
  });
}

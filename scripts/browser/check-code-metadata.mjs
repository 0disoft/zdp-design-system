import assert from 'node:assert/strict';

export async function verifyCodeMetadataOverflowContracts(page) {
  const viewport = page.viewportSize();
  try {
    await page.setViewportSize({ width: 320, height: 640 });
    const fixture = page.getByTestId('code-metadata-overflow');
    for (const block of await fixture.locator('.zdp-code-block').all()) {
      const geometry = await block.evaluate((element) => {
        const surface = element.getBoundingClientRect();
        return Array.from(element.querySelectorAll('.zdp-code-block__title, .zdp-code-block__caption')).map((text) => {
          const range = document.createRange();
          range.selectNodeContents(text);
          const rect = range.getBoundingClientRect();
          return { left: rect.left, right: rect.right, surfaceLeft: surface.left, surfaceRight: surface.right,
            height: text.getBoundingClientRect().height, lineHeight: parseFloat(getComputedStyle(text).lineHeight) };
        });
      });
      for (const text of geometry) {
        assert.ok(text.left >= text.surfaceLeft && text.right <= text.surfaceRight, 'Metadata must remain inside the code surface.');
        assert.ok(text.height > text.lineHeight, 'Long metadata must wrap instead of being clipped.');
      }
    }
    const scroller = fixture.locator('.zdp-code-block__scroller');
    assert.ok(await scroller.evaluate((element) => element.scrollWidth > element.clientWidth), 'Code must retain its horizontal scroll surface.');
    await scroller.focus();
    await scroller.press('ArrowRight');
    await page.waitForFunction(() => document.querySelector('[data-testid="code-metadata-overflow"] .zdp-code-block__scroller').scrollLeft > 0);
  } finally {
    await page.setViewportSize(viewport);
  }
}

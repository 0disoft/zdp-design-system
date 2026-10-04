import assert from 'node:assert/strict';

export async function verifyPageHeaderTypeContracts(page) {
  const viewport = page.viewportSize();
  const fixture = page.getByTestId('page-header-type');
  try {
    for (const [width, token] of [[1280, '--zdp-type-page-title-size'], [320, '--zdp-type-page-title-compact-size']]) {
      await page.setViewportSize({ width, height: 800 });
      const expected = await page.evaluate((token) => {
        const probe = document.createElement('span');
        probe.style.fontSize = `var(${token})`;
        probe.style.fontWeight = 'var(--zdp-font-weight-medium)';
        probe.style.lineHeight = 'var(--zdp-type-page-title-line-height)';
        document.body.append(probe);
        const computed = getComputedStyle(probe);
        const style = { size: computed.fontSize, weight: computed.fontWeight, lineHeight: computed.lineHeight };
        probe.remove();
        return style;
      }, token);
      for (const id of ['component-title', 'css-title']) {
        const style = await fixture.getByTestId(id).evaluate((element) => {
          const computed = getComputedStyle(element);
          return { size: computed.fontSize, weight: computed.fontWeight, lineHeight: computed.lineHeight };
        });
        assert.deepEqual(style, expected, `${id} must use the responsive page title tokens.`);
      }
      const custom = await fixture.getByTestId('consumer-title').evaluate((element) => {
        const style = getComputedStyle(element);
        return [style.fontSize, style.fontWeight, style.lineHeight];
      });
      assert.deepEqual(custom, ['24px', '700', '36px'], 'Consumer title styles must override defaults.');
    }
  } finally {
    await page.setViewportSize(viewport);
  }
}

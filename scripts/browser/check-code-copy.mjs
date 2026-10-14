import assert from 'node:assert/strict';

export async function verifyCodeCopyAppearance(page, root, button, setCopying) {
  const viewport = page.viewportSize();
  const originalTheme = await root.getAttribute('data-zdp-theme');
  try {
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const theme of ['light', 'dark']) {
        await root.evaluate((element, value) => element.setAttribute('data-zdp-theme', value), theme);
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        if (await button.getAttribute('data-copy-state') === 'idle') {
          const spacing = await button.evaluate(element => {
            const box = element.getBoundingClientRect();
            const label = element.querySelector('.zdp-code-block__copy-label').getBoundingClientRect();
            return Math.abs((box.left + box.right) / 2 - (label.left + label.right) / 2);
          });
          assert.ok(spacing <= 1, 'Idle copy text must be centered without an invisible icon slot.');
        }
        await setCopying(true);
        assert.equal(await button.isDisabled(), true);
        assert.equal(await button.getAttribute('aria-busy'), 'true');
        assert.equal(await button.getAttribute('data-copy-state'), 'copying');
        await button.locator('.zdp-code-block__copy-spinner').waitFor({ state: 'visible' });
        const state = await button.evaluate(element => {
          const spinner = element.querySelector('.zdp-code-block__copy-spinner');
          const style = getComputedStyle(spinner);
          return {
            animation: style.animationName, visibility: style.visibility, stroke: style.borderTopWidth,
            color: style.borderTopColor, foreground: getComputedStyle(element).color,
            width: parseFloat(style.width), height: parseFloat(style.height),
            opacity: getComputedStyle(element).opacity, cursor: getComputedStyle(element).cursor
          };
        });
        assert.notEqual(state.animation, 'none');
        assert.equal(state.visibility, 'visible');
        assert.equal(state.stroke, '2px');
        assert.equal(state.color, state.foreground);
        assert.ok(state.width > 0 && state.width === state.height);
        assert.equal(state.opacity, '1');
        assert.equal(state.cursor, 'progress');
        await page.emulateMedia({ reducedMotion: 'reduce' });
        assert.equal(await button.locator('.zdp-code-block__copy-spinner').evaluate(element => getComputedStyle(element).animationName), 'none');
        await setCopying(false);
        assert.equal(await button.isDisabled(), false);
        assert.equal(await button.getAttribute('aria-busy'), null);
        assert.equal(await button.locator('.zdp-code-block__copy-spinner').evaluate(element => getComputedStyle(element).display), 'none');
      }
    }
  } finally {
    await setCopying(false);
    await root.evaluate((element, theme) => {
      if (theme === null) element.removeAttribute('data-zdp-theme');
      else element.setAttribute('data-zdp-theme', theme);
    }, originalTheme);
    await page.emulateMedia({ reducedMotion: null });
    if (viewport) await page.setViewportSize(viewport);
  }
}

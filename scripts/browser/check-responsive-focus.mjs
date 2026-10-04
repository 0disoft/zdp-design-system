import assert from 'node:assert/strict';

export async function verifyResponsiveFocusContracts(page) {
  const originalViewport = page.viewportSize();
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.id = 'responsive-focus-test-style';
    style.textContent = '@media(max-width:1000px){[data-testid="responsive-focus-tail"]{display:none}}';
    document.head.append(style);
  });
  try {
    for (const [triggerId, name, closeName] of [
      ['dialog-trigger', 'Review changes', 'Close dialog'],
      ['sheet-trigger', 'Release details', 'Close sheet'],
      ['term-sheet-trigger', 'Browser term', 'Close term']
    ]) {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.getByTestId(triggerId).click();
      const panel = page.getByRole('dialog', { name, exact: true });
      const close = panel.getByRole('button', { name: closeName, exact: true });
      await panel.evaluate((element) => {
        Object.assign(element.style, { inlineSize: '500px', maxInlineSize: '500px', blockSize: '350px', maxBlockSize: '350px' });
        const row = document.createElement('div');
        const kept = document.createElement('button');
        kept.dataset.testid = 'responsive-focus-kept';
        kept.textContent = 'Always available';
        const tail = document.createElement('button');
        tail.dataset.testid = 'responsive-focus-tail';
        tail.textContent = 'Wide viewport action';
        row.append(kept, tail);
        element.append(row);
      });
      await close.focus();
      await page.keyboard.press('Shift+Tab');
      const tail = page.getByTestId('responsive-focus-tail');
      assert.equal(await tail.evaluate((element) => document.activeElement === element), true);
      await page.keyboard.press('Tab');
      assert.equal(await close.evaluate((element) => document.activeElement === element), true);
      const before = await panel.boundingBox();
      await page.setViewportSize({ width: 900, height: 800 });
      await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-testid="responsive-focus-tail"]')).display === 'none');
      const after = await panel.boundingBox();
      assert.equal(after.width, before.width, 'The media query must change tab stops without resizing the panel.');
      assert.equal(after.height, before.height);
      await page.keyboard.press('Shift+Tab');
      assert.equal(await page.getByTestId('responsive-focus-kept').evaluate((element) => document.activeElement === element), true, `${name} must skip the now-hidden last control.`);
      await page.keyboard.press('Tab');
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-testid="responsive-focus-tail"]')).display !== 'none');
      await page.keyboard.press('Shift+Tab');
      assert.equal(await tail.evaluate((element) => document.activeElement === element), true, 'Visible controls must rejoin the tab order.');
      await page.keyboard.press('Escape');
      await panel.waitFor({ state: 'detached' });
    }
  } finally {
    await page.evaluate(() => document.getElementById('responsive-focus-test-style')?.remove());
    await page.setViewportSize(originalViewport);
  }
}

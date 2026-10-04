import assert from 'node:assert/strict';

export async function verifyConfirmRepeatContracts(page) {
  const button = page.locator('#repeat-confirm-action');
  const count = page.getByTestId('repeat-confirm-count');

  for (const key of ['Enter', ' ']) {
    const previousCount = Number(await count.textContent());
    await button.focus();
    await page.keyboard.down(key);
    try {
      await page.waitForFunction(
        (expected) => document.querySelector('[data-testid="repeat-confirm-count"]').textContent === String(expected),
        previousCount + 1
      );
      await page.waitForFunction(() => !document.querySelector('#repeat-confirm-action').hasAttribute('data-confirmed'));
      await page.keyboard.down(key);
      assert.equal(await button.getAttribute('data-active'), null, 'A held key must not restart confirmation after reset.');
      await page.waitForTimeout(650);
      assert.equal(Number(await count.textContent()), previousCount + 1);
    } finally {
      await page.keyboard.up(key);
    }
  }
}

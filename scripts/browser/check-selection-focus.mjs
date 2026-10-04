import assert from 'node:assert/strict';

export async function verifySelectionFocusContracts(page) {
  for (const kind of ['locale', 'scale', 'segment']) {
    const fixture = page.getByTestId(`selection-focus-${kind}`);
    const group = fixture.getByRole('radiogroup');
    for (const operation of ['disable', 'remove', 'disable-all', 'external']) {
      await page.getByTestId(`selection-${kind}-restore`).click();
      await group.getByRole('radio').first().focus();
      await page.getByTestId(`selection-${kind}-${operation}`).evaluate((element) => element.click());
      const target = operation === 'external' ? page.getByTestId('selection-outside')
        : operation === 'disable-all' ? group : group.locator('[role="radio"][aria-checked="true"]');
      await target.evaluate(async (element) => {
        await new Promise((resolve) => requestAnimationFrame(resolve));
      });
      assert.equal(await target.evaluate((element) => element.ownerDocument.activeElement === element), true, `${kind}: ${operation} must recover focus while preserving deliberate external focus moves.`);
    }
  }
}

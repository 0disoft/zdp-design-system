import assert from 'node:assert/strict';

export async function verifySelectionFocusContracts(page) {
  for (const kind of ['locale', 'scale', 'segment']) {
    const fixture = page.getByTestId(`selection-focus-${kind}`);
    const group = fixture.getByRole('radiogroup');
    if (kind !== 'scale') {
      await page.getByTestId(`selection-${kind}-empty`).click();
      assert.equal(await group.locator('[aria-checked="true"]').count(), 1, 'Empty values remain valid selections.');
      await group.getByRole('radio').focus();
      await page.getByTestId(`selection-${kind}-disable-all`).evaluate((element) => element.click());
      assert.equal(await group.locator('[aria-checked="true"]').count(), 0, 'All-disabled groups must have no selection, including empty values.');
      assert.equal(await group.locator('[role="radio"][tabindex="0"]').count(), 0);
      assert.equal(await group.evaluate((element) => document.activeElement === element), true);
    }
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

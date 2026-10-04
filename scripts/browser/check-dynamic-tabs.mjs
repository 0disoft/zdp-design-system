import assert from 'node:assert/strict';

export async function verifyDynamicTabsContracts(page) {
  const fixture = page.getByTestId('dynamic-tabs');
  const selected = fixture.getByRole('tab', { name: 'Dynamic B', exact: true });
  await selected.focus();
  await selected.evaluate((element) => { window.__zdpReorderedTab = element; });
  try {
    for (const testId of ['tabs-move-to-end', 'tabs-move-to-start', 'tabs-insert-first', 'tabs-reverse-in-place']) {
      // A consumer may replace items while the user is navigating the tablist.
      await fixture.getByTestId(testId).evaluate((element) => element.click());
      assert.equal(await selected.evaluate((element) => document.activeElement === element), true, `Reordering or inserting tabs must preserve focus on the same item (${testId}).`);
      assert.equal(await selected.evaluate((element) => element === window.__zdpReorderedTab), true, 'A tab ID must retain its button identity.');
      assert.equal(await selected.getAttribute('aria-selected'), 'true');
      assert.equal(await selected.getAttribute('tabindex'), '0');
      assert.equal(await fixture.getByRole('tabpanel').textContent(), 'Dynamic B panel');
    }
    await fixture.getByTestId('tabs-update-external-focus').evaluate((element) => element.click());
    assert.equal(await fixture.getByTestId('tabs-outside-focus').evaluate((element) => document.activeElement === element), true, 'Focus restoration must preserve a deliberate consumer focus move.');
    await selected.focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await fixture.getByRole('tab', { name: 'Dynamic C', exact: true }).getAttribute('aria-selected'), 'true', 'Keyboard movement must follow the updated order.');
  } finally {
    await page.evaluate(() => { delete window.__zdpReorderedTab; });
  }
}

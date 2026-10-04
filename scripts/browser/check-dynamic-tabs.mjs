import assert from 'node:assert/strict';

export async function verifyTabPanelFocusContracts(page) {
  const fixture = page.getByTestId('tab-panel-focus');
  const editor = fixture.getByRole('textbox', { name: 'Tab panel editor', exact: true });
  for (const action of ['switch', 'remove', 'disable-all', 'reorder', 'switch-outside']) {
    await fixture.getByTestId('reset').click();
    await editor.focus();
    await fixture.getByTestId(action).evaluate((element) => element.click());
    const target = action === 'disable-all' ? fixture.getByRole('tablist')
      : action === 'reorder' ? editor
      : action === 'switch-outside' ? fixture.getByTestId('outside')
      : fixture.getByRole('tab', { selected: true });
    assert.equal(await target.evaluate((element) => document.activeElement === element), true, `Panel updates must recover lost focus and preserve deliberate focus moves (${action}).`);
  }
  await fixture.getByTestId('reset').click();
}

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

export async function verifyRemovedTabFocusContracts(page) {
  const fixture = page.getByTestId('dynamic-tabs');
  const selected = () => fixture.getByRole('tab', { selected: true });
  for (const testId of ['tabs-remove-focused', 'tabs-disable-focused', 'tabs-disable-all']) {
    await fixture.getByTestId('tabs-restore-items').click();
    await selected().focus();
    await fixture.getByTestId(testId).evaluate((element) => element.click());
    if (testId === 'tabs-disable-all') {
      assert.equal(await selected().count(), 0);
      assert.equal(await fixture.getByRole('tablist').evaluate((element) => document.activeElement === element), true, 'With no enabled tabs, retain focus on the list so Tab can leave it.');
    } else {
      assert.equal(await selected().textContent(), 'Dynamic A');
      assert.equal(await selected().evaluate((element) => document.activeElement === element), true, 'Removing or disabling the focused tab must focus the new selection.');
      await page.keyboard.press('ArrowRight');
      assert.equal(await selected().textContent(), 'Dynamic C', 'Navigation must resume after focus recovery.');
    }
  }
  await fixture.getByTestId('tabs-restore-items').click();
  await selected().focus();
  await fixture.getByTestId('tabs-remove-external-focus').evaluate((element) => element.click());
  assert.equal(await fixture.getByTestId('tabs-outside-focus').evaluate((element) => document.activeElement === element), true, 'Removal must preserve a deliberate external focus move.');
  await fixture.getByTestId('tabs-restore-items').click();
}

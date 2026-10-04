import assert from 'node:assert/strict';

export async function verifyDynamicMenuContracts(page) {
  const trigger = page.getByRole('button', { name: 'Dynamic actions', exact: true });
  const menu = page.getByRole('menu', { name: 'Dynamic actions', exact: true });
  const setItems = (items) => page.evaluate((items) => {
    window.dispatchEvent(new CustomEvent('zdp-test-menu-items', { detail: items }));
  }, items);
  const assertFocused = async (label) => {
    await page.waitForFunction((label) => document.activeElement?.textContent.trim() === label, label);
  };
  await trigger.click();
  await assertFocused('Dynamic first');
  await setItems([{ id: 'second', label: 'Dynamic second' }, { id: 'third', label: 'Dynamic third' }]);
  await assertFocused('Dynamic second');
  await page.keyboard.press('ArrowDown');
  await assertFocused('Dynamic third');
  await setItems([{ id: 'second', label: 'Dynamic second' }, { id: 'third', label: 'Dynamic third', disabled: true }]);
  await assertFocused('Dynamic second');
  await setItems([]);
  await page.waitForFunction(() => document.activeElement?.getAttribute('role') === 'menu');
  assert.equal(await menu.count(), 1, 'An empty menu must retain a focus target for Escape and Tab.');
  await setItems([{ id: 'returned', label: 'Dynamic returned' }]);
  await assertFocused('Dynamic returned');
  const outside = page.getByTestId('dynamic-menu-outside');
  await outside.focus();
  await setItems([{ id: 'replacement', label: 'Dynamic replacement' }]);
  assert.equal(await outside.evaluate((element) => document.activeElement === element), true, 'Updates must not take focus from an outside control.');
  await page.keyboard.press('Escape');
  assert.equal(await menu.count(), 0);
}

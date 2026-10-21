import assert from 'node:assert/strict';

export async function verifyDynamicMenuContracts(page) {
  await verifyParentMenuFocusContracts(page);
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
  await setItems([
    { id: 'alpha', label: 'Alpha' },
    { id: 'alpine', label: 'Alpine' },
    { id: 'alps', label: 'Alps', disabled: true },
    { id: 'beta', label: 'Beta' }
  ]);
  await trigger.click();
  await page.keyboard.press('a');
  await assertFocused('Alpine');
  await page.keyboard.press('a');
  await assertFocused('Alpha');
  await page.keyboard.press('Home');
  await page.keyboard.type('alpi');
  await assertFocused('Alpine');
  assert.equal(await page.getByTestId('dynamic-menu-selections').textContent(), '0', 'Typeahead must only move focus.');
  await page.keyboard.press('Home');
  await page.keyboard.press('Space');
  assert.equal(await menu.count(), 0);
  assert.equal(await page.getByTestId('dynamic-menu-selections').textContent(), '1', 'Space must select exactly once.');
  await trigger.click();
  await page.keyboard.press('Shift+Tab');
  assert.equal(await page.getByTestId('dynamic-menu-before').evaluate(element => document.activeElement === element), true,
    'Shift+Tab must continue to the previous native control.');
  assert.equal(await menu.count(), 0);
}

async function verifyParentMenuFocusContracts(page) {
  const isActive = (element) => element.getRootNode().activeElement === element;
  for (const testId of ['menu-focus', 'shadow-menu-focus']) {
    const fixture = page.getByTestId(testId);
    const trigger = fixture.getByRole('button', { name: 'Bound menu trigger', exact: true });
    const item = fixture.getByRole('menuitem', { name: 'Bound menu item', exact: true });
    const outside = fixture.getByTestId('outside');
    // A parent state update must not first pass through outside-click dismissal.
    const changeMenu = action => fixture.evaluate((element, action) => {
      element.dispatchEvent(new CustomEvent('zdp-test-menu-state', { detail: action }));
    }, action);
    await trigger.click();
    assert.equal(await item.evaluate(isActive), true);
    await changeMenu('close');
    assert.equal(await item.count(), 0);
    assert.equal(await trigger.evaluate(isActive), true, `Parent closure must restore the Menu trigger (${testId}).`);

    await trigger.click();
    await changeMenu('close-outside');
    assert.equal(await item.count(), 0);
    assert.equal(await outside.evaluate(isActive), true, 'Deferred restoration must preserve deliberate outside focus.');

    await trigger.click();
    await trigger.evaluate(element => {
      element.dataset.focusReturns = '0';
      element.addEventListener('focus', () => {
        element.dataset.focusReturns = String(Number(element.dataset.focusReturns) + 1);
      });
    });
    await changeMenu('reopen');
    assert.equal(await item.count(), 1);
    assert.equal(await item.evaluate(isActive), true, 'A reopened Menu must retain item focus.');
    assert.equal(await trigger.getAttribute('data-focus-returns'), '0', 'A stale close task must not focus the trigger during reopening.');
    await outside.click();
    assert.equal(await item.count(), 0);
    assert.equal(await outside.evaluate(isActive), true, 'Outside click must keep its restoration opt-out.');
    await trigger.click();
    await page.keyboard.press('Tab');
    assert.equal(await fixture.getByTestId('close').evaluate(isActive), true, 'Tab must keep native traversal after closing.');
  }
}

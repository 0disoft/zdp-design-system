import assert from 'node:assert/strict';

export async function verifyToastDismissFocusContracts(page) {
  const fixture = page.getByTestId('toast-focus');
  const group = fixture.getByRole('group', { name: 'Focus notifications', exact: true });
  const behavior = fixture.getByRole('combobox', { name: 'Toast dismissal behavior', exact: true });
  const close = (title) => group.getByRole('button', { name: `Dismiss ${title}`, exact: true });
  const focused = (element) => element.ownerDocument.activeElement === element;
  const dismiss = async (title) => { await close(title).focus(); await page.keyboard.press('Enter'); };
  const reset = async () => fixture.getByTestId('reset').evaluate((element) => element.click());
  try {
    await behavior.selectOption('remove');
    await dismiss('Middle');
    assert.equal(await close('Last').evaluate(focused), true, 'Removing a focused toast must focus the following close button.');
    await dismiss('Last');
    assert.equal(await close('First').evaluate(focused), true, 'Removing the last toast must focus the previous close button.');
    await dismiss('First');
    assert.equal(await group.evaluate(focused), true, 'An empty stack must retain focus on its group.');
    await reset();
    await dismiss('First');
    assert.equal(await close('Middle').evaluate(focused), true);
    await reset();
    await behavior.selectOption('outside');
    await dismiss('First');
    assert.equal(await fixture.getByTestId('outside').evaluate(focused), true, 'Consumer focus choices must remain intact.');
    await reset();
    await behavior.selectOption('keep');
    await dismiss('First');
    assert.equal(await close('First').evaluate(focused), true, 'A retained notification must keep its focused close button.');
    await behavior.selectOption('remove');
    await fixture.getByTestId('outside').focus();
    await close('First').evaluate((element) => element.click());
    assert.equal(await fixture.getByTestId('outside').evaluate(focused), true, 'Dismissal without close-button focus must not steal focus.');
  } finally {
    await behavior.selectOption('remove');
    await reset();
  }
}

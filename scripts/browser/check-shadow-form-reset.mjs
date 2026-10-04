import assert from 'node:assert/strict';

export async function verifyShadowFormResetContracts(page) {
  const frame = page.frameLocator('[title="Embedded shadow form"]');
  const state = frame.getByTestId('reset-bound-state');
  const form = frame.locator('#reset-native-form');
  const expected = { text: 'seed', notes: 'note', choice: 'b', checked: true, switched: true, radio: 'b', command: 'find', combo: 'beta', query: 'Beta', external: 'outside' };
  await frame.getByRole('button', { name: 'Edit reset values', exact: true }).click();
  await frame.getByRole('button', { name: 'Reset values', exact: true }).click();
  await page.waitForFunction(() => {
    const shadow = document.querySelector('[title="Embedded shadow form"]').contentDocument.querySelector('[data-testid="shadow-form-host"]').shadowRoot;
    return JSON.parse(shadow.querySelector('[data-testid="reset-bound-state"]').textContent).text === 'seed';
  });
  assert.deepEqual(JSON.parse(await state.textContent()), expected, 'All bindings must synchronize after a shadow-root reset.');
  assert.deepEqual(await form.evaluate((element) => Object.fromEntries(new FormData(element))), {
    text: 'seed', notes: 'note', choice: 'b', checked: 'on', switched: 'on', radio: 'b', command: 'find', combo: 'beta', external: 'outside'
  }, 'Submitted values must match the restored bindings, including the hidden Combobox value.');
  await frame.getByRole('button', { name: 'Edit reset values', exact: true }).click();
  await frame.getByRole('checkbox', { name: 'Cancel reset', exact: true }).check();
  const edited = JSON.parse(await state.textContent());
  await frame.getByRole('button', { name: 'Reset values', exact: true }).click();
  // Wait past the deferred reset callbacks before testing cancellation.
  await state.evaluate((element) => new Promise((resolve) => setTimeout(resolve, 20)));
  assert.deepEqual(JSON.parse(await state.textContent()), edited, 'Cancelling a shadow-root reset must preserve bindings.');
  assert.equal(await frame.getByRole('textbox', { name: 'Reset text', exact: true }).inputValue(), 'edited');
  await frame.getByRole('checkbox', { name: 'Cancel reset', exact: true }).uncheck();
}

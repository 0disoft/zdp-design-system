import assert from 'node:assert/strict';

export async function verifyDisclosureFocusContracts(page) {
  const fixture = page.getByTestId('disclosure-focus');
  const editor = fixture.getByRole('textbox', { name: 'Disclosure editor', exact: true });
  const trigger = fixture.getByRole('button', { name: 'Collapsible editor', exact: true });
  for (let heading = 0; heading < 2; heading += 1) {
    for (const action of ['collapse', 'collapse-disabled', 'collapse-outside']) {
      await fixture.getByTestId('reset').click();
      await editor.focus();
      await fixture.getByTestId(action).evaluate((element) => element.click());
      assert.equal(await editor.count(), 0);
      const target = action === 'collapse-disabled' ? fixture.locator('.zdp-disclosure')
        : action === 'collapse-outside' ? fixture.getByTestId('outside') : trigger;
      assert.equal(await target.evaluate((element) => document.activeElement === element), true, `Collapsing must restore focus without overriding consumer focus (${action}, heading ${heading}).`);
    }
    await fixture.getByTestId('heading').click();
  }
  await fixture.getByTestId('reset').click();
  await fixture.getByTestId('outside').focus();
  await fixture.getByTestId('collapse').evaluate((element) => element.click());
  assert.equal(await fixture.getByTestId('outside').evaluate((element) => document.activeElement === element), true, 'An unrelated focus must be preserved.');
}

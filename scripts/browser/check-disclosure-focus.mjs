import assert from 'node:assert/strict';

export async function verifyDisclosureFocusContracts(page) {
  const fixture = page.getByTestId('disclosure-focus');
  const editor = fixture.getByRole('textbox', { name: 'Disclosure editor', exact: true });
  const trigger = fixture.getByRole('button', { name: 'Collapsible editor', exact: true });
  const nestedOutcomes = [];
  for (let heading = 0; heading < 2; heading += 1) {
    for (const nested of [false, true]) {
      for (const action of ['collapse', 'collapse-disabled', 'collapse-outside']) {
        await fixture.getByTestId('reset').click();
        if (nested) {
          const focused = await editor.evaluate((element) => {
            const host = element.ownerDocument.createElement('div');
            element.after(host);
            const shadow = host.attachShadow({ mode: 'open' });
            const input = element.ownerDocument.createElement('input');
            shadow.append(input);
            input.focus();
            return shadow.activeElement === input;
          });
          assert.equal(focused, true);
        } else {
          await editor.focus();
        }
        await fixture.getByTestId(action).evaluate((element) => element.click());
        assert.equal(await editor.count(), 0);
        const target = action === 'collapse-disabled' ? fixture.locator('.zdp-disclosure')
          : action === 'collapse-outside' ? fixture.getByTestId('outside') : trigger;
        const restored = await target.evaluate((element) => element.ownerDocument.activeElement === element);
        if (nested) nestedOutcomes.push({ heading, action, restored });
        else assert.equal(restored, true, `Collapse must restore or preserve focus (${action}, heading ${heading}).`);
      }
    }
    await fixture.getByTestId('heading').click();
  }
  assert.deepEqual(nestedOutcomes.filter(({ restored }) => !restored), [],
    'Collapse must also recover or preserve focus from a nested shadow editor.');
  await fixture.getByTestId('reset').click();
  await fixture.getByTestId('outside').focus();
  await fixture.getByTestId('collapse').evaluate((element) => element.click());
  assert.equal(await fixture.getByTestId('outside').evaluate((element) => document.activeElement === element), true, 'An unrelated focus must be preserved.');
}

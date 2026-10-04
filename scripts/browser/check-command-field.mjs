import assert from 'node:assert/strict';

export async function verifyCommandFieldContracts(page) {
  for (const scope of [page, page.frameLocator('[title="Embedded shadow form"]')]) {
    const form = scope.locator('#reset-native-form');
    const input = form.locator('input[name="command"]');
    const originalValue = await input.inputValue();
    const originalId = await input.getAttribute('id');
    assert.ok(originalId, 'Fields without explicit IDs must still have a label association.');
    await input.evaluate((element) => {
      const owner = element.ownerDocument;
      owner.__commandEvents = [];
      owner.__commandListener = (event) => {
        if (event.composedPath()[0] === element) owner.__commandEvents.push(element.value);
      };
      owner.addEventListener('input', owner.__commandListener);
    });
    try {
      await input.fill('query');
      assert.equal(await form.getByRole('searchbox', { name: 'Reset command', exact: true }).count(), 1, 'Clear button text must not become part of the accessible name.');
      await form.getByRole('button', { name: 'Clear search', exact: true }).click();
      assert.equal(await input.inputValue(), '');
      assert.equal(await form.getByRole('searchbox', { name: 'Reset command', exact: true }).count(), 1, 'The accessible name must remain stable after clearing.');
      assert.equal(await input.evaluate((element) => element.getRootNode().activeElement === element), true, 'Clearing must focus the input.');
      assert.equal(await input.getAttribute('id'), originalId, 'Label associations must remain stable across value updates.');
      assert.deepEqual(await input.evaluate((element) => element.ownerDocument.__commandEvents), ['query', ''], 'Typing and clearing must both reach the owner document, including across a shadow boundary.');
      const state = JSON.parse(await scope.getByTestId('reset-bound-state').textContent());
      assert.equal(state.command, '', 'Clearing must update the parent value binding.');
      await form.locator(`label[for="${originalId}"]`).evaluate((element) => element.click());
      assert.equal(await input.evaluate((element) => element.getRootNode().activeElement === element), true);
    } finally {
      await input.evaluate((element) => {
        const owner = element.ownerDocument;
        owner.removeEventListener('input', owner.__commandListener);
        delete owner.__commandListener;
        delete owner.__commandEvents;
      });
      await input.fill(originalValue);
    }
  }
}

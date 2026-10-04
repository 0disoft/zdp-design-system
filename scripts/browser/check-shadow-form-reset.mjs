import assert from 'node:assert/strict';

export async function verifyReassociatedFormResetContracts(page) {
  const controls = page.getByTestId('reassociated-controls');
  const state = page.getByTestId('reassociated-state');
  for (const destination of ['shadow', 'frame-shadow']) {
    await controls.locator('input[type="text"]').fill('edited');
    await controls.locator('select').selectOption('a');
    await controls.locator('input[type="checkbox"]').uncheck();
    await controls.evaluate((element, destination) => {
      const parent = element.parentNode;
      const next = element.nextSibling;
      const host = document.createElement(destination === 'shadow' ? 'div' : 'iframe');
      host.dataset.testid = 'reassociated-destination';
      document.body.append(host);
      const body = destination === 'shadow' ? host : host.contentDocument.body;
      const container = body.ownerDocument.createElement('div');
      body.append(container);
      const shadow = container.attachShadow({ mode: 'open' });
      const form = body.ownerDocument.createElement('form');
      shadow.append(form);
      form.append(element);
      window.__reassociatedForm = form;
      window.__restoreReassociatedControls = () => { parent.insertBefore(element, next); host.remove(); };
    }, destination);
    try {
      // Ownership follows DOM changes at the mutation-observer checkpoint.
      await page.evaluate(() => new Promise((resolve) => queueMicrotask(resolve)));
      await page.evaluate(() => {
        const form = window.__reassociatedForm;
        form.addEventListener('reset', (event) => event.preventDefault(), { once: true });
        form.reset();
      });
      await state.evaluate(() => new Promise((resolve) => setTimeout(resolve, 20)));
      assert.deepEqual(JSON.parse(await state.textContent()), { text: 'edited', choice: 'a', checked: false }, 'Cancelling reset after reassociation must preserve bindings.');
      assert.deepEqual(await page.evaluate(() => Object.fromEntries(new FormData(window.__reassociatedForm))), { text: 'edited', choice: 'a' });
      await page.evaluate(() => window.__reassociatedForm.reset());
      await page.waitForFunction(() => JSON.parse(document.querySelector('[data-testid="reassociated-state"]').textContent).text === 'seed');
      assert.deepEqual(JSON.parse(await state.textContent()), { text: 'seed', choice: 'b', checked: true });
      assert.deepEqual(await page.evaluate(() => Object.fromEntries(new FormData(window.__reassociatedForm))), { text: 'seed', choice: 'b', checked: 'on' }, 'Reset bindings and submission must agree in the new form.');
    } finally {
      await page.evaluate(() => {
        window.__restoreReassociatedControls();
        delete window.__restoreReassociatedControls;
        delete window.__reassociatedForm;
      });
    }
  }
}

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

export async function verifyMovedFormResetContracts(page) {
  const form = page.locator('#reset-native-form');
  const state = page.getByTestId('reset-bound-state');
  for (const destination of ['shadow', 'frame-shadow']) {
    await page.getByRole('button', { name: 'Edit reset values', exact: true }).click();
    const edited = JSON.parse(await state.textContent());
    assert.equal(edited.text, 'edited');
    await form.evaluate((element, destination) => {
      const parent = element.parentNode;
      const next = element.nextSibling;
      const host = document.createElement(destination === 'shadow' ? 'div' : 'iframe');
      document.body.append(host);
      const root = destination === 'shadow' ? host : host.contentDocument.body;
      const container = root.ownerDocument.createElement('div');
      root.append(container);
      container.attachShadow({ mode: 'open' }).append(element);
      window.__restoreMovedForm = () => { parent.insertBefore(element, next); host.remove(); };
      // Reset in the same turn as the move, before mutation observers can rebind.
      element.addEventListener('reset', (event) => event.preventDefault(), { once: true });
      element.reset();
    }, destination);
    try {
      await state.evaluate(() => new Promise((resolve) => setTimeout(resolve, 20)));
      assert.deepEqual(JSON.parse(await state.textContent()), edited, 'Cancellation must still preserve bindings after moving the form.');
      await page.evaluate(() => {
        const host = document.body.lastElementChild;
        const root = host.tagName === 'IFRAME' ? host.contentDocument.body : host;
        root.firstElementChild.shadowRoot.querySelector('form').reset();
      });
      await page.waitForFunction(() => JSON.parse(document.querySelector('[data-testid="reset-bound-state"]').textContent).text === 'seed');
      const resetState = JSON.parse(await state.textContent());
      assert.equal(resetState.notes, 'note');
      assert.equal(resetState.choice, 'b');
      assert.equal(resetState.checked, true);
      assert.equal(resetState.radio, 'b');
      assert.equal(resetState.command, 'find');
      assert.equal(resetState.combo, 'beta');
    } finally {
      await page.evaluate(() => { window.__restoreMovedForm(); delete window.__restoreMovedForm; });
    }
  }
}

import assert from 'node:assert/strict';

export async function verifyNativeInputContracts(page) {
  const quantity = page.getByRole('spinbutton', { name: 'Native quantity' });
  await quantity.fill('3');
  assert.equal(await quantity.evaluate((element) => element.validity.stepMismatch), true);
  await quantity.fill('12');
  assert.equal(await quantity.evaluate((element) => element.validity.rangeOverflow), true);
  await quantity.fill('6');
  assert.equal(await quantity.evaluate((element) => element.checkValidity()), true);

  const code = page.getByRole('textbox', { name: 'Native code', exact: true });
  await code.fill('ab');
  assert.equal(await code.evaluate((element) => element.validity.patternMismatch), true);
  await code.fill('AB');
  await code.press('C');
  assert.equal(await page.getByTestId('native-code-value').textContent(), 'ABC');
  assert.equal(await code.getAttribute('inputmode'), 'text');
  assert.equal(await code.getAttribute('enterkeyhint'), 'next');

  const notes = page.getByRole('textbox', { name: 'Native notes', exact: true });
  await notes.fill('N');
  assert.equal(await notes.evaluate((element) => element.validity.tooShort), true);
  await notes.fill('Note');
  await notes.press('s');
  assert.equal(await page.getByTestId('native-notes-value').textContent(), 'Notes');
  assert.equal(await notes.getAttribute('maxlength'), '6');
  assert.equal(await notes.getAttribute('enterkeyhint'), 'done');
  await code.focus();

  const events = (await page.getByTestId('native-input-events').textContent()).split(',');
  for (const type of ['input', 'change', 'focus', 'blur', 'keydown']) {
    assert.ok(events.includes(type), `Native form callback must receive ${type}.`);
  }
  assert.deepEqual(await page.locator('#native-input-form').evaluate((form) =>
    Object.fromEntries(new FormData(form))
  ), { quantity: '6', code: 'ABC', notes: 'Notes' });
}

export async function verifyFormResetContracts(page) {
  await page.getByRole('button', { name: 'Edit reset values', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Cancel reset', exact: true }).check();
  const editedState = await page.getByTestId('reset-bound-state').textContent();
  await page.getByRole('button', { name: 'Reset values', exact: true }).click();
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 0)));
  assert.equal(await page.getByTestId('reset-bound-state').textContent(), editedState, 'Cancelled resets must preserve bindings.');
  assert.equal(await page.getByRole('textbox', { name: 'Reset text', exact: true }).inputValue(), 'edited');
  await page.getByRole('checkbox', { name: 'Cancel reset', exact: true }).uncheck();
  await page.getByRole('button', { name: 'Reset values', exact: true }).click();
  await page.waitForFunction(() => JSON.parse(document.querySelector('[data-testid="reset-bound-state"]').textContent).text === 'seed');
  const initialState = {
    text: 'seed', notes: 'note', choice: 'b', checked: true, switched: true,
    radio: 'b', command: 'find', combo: 'beta', query: 'Beta', external: 'outside'
  };
  assert.deepEqual(JSON.parse(await page.getByTestId('reset-bound-state').textContent()), initialState, 'Reset must restore every native and custom binding.');
  assert.equal(await page.getByRole('textbox', { name: 'External reset text', exact: true }).inputValue(), 'outside');
  assert.equal(await page.getByRole('combobox', { name: 'Reset combo', exact: true }).inputValue(), 'Beta');
  assert.equal(await page.getByRole('combobox', { name: 'Reset combo', exact: true }).evaluate((input) => input.checkValidity()), true);
  assert.deepEqual(await page.locator('#reset-native-form').evaluate((form) => Object.fromEntries(new FormData(form))), {
    text: 'seed', notes: 'note', choice: 'b', checked: 'on', switched: 'on',
    radio: 'b', command: 'find', combo: 'beta', external: 'outside'
  }, 'Submitted form values must match restored bindings.');
  await page.getByRole('button', { name: 'Edit reset values', exact: true }).click();
  await page.locator('#reset-native-form').evaluate((form) => form.reset());
  await page.waitForFunction(() => JSON.parse(document.querySelector('[data-testid="reset-bound-state"]').textContent).text === 'seed');
  assert.deepEqual(JSON.parse(await page.getByTestId('reset-bound-state').textContent()), initialState, 'Programmatic reset must synchronize the same initial values.');
}

export async function verifyAsyncSelectResetContracts(page) {
  const select = page.getByRole('combobox', { name: 'Async reset choice', exact: true });
  const value = page.getByTestId('async-reset-value');
  await page.getByRole('button', { name: 'Load reset options', exact: true }).click();
  assert.equal(await select.inputValue(), 'b');
  await select.selectOption('a');
  await page.getByRole('checkbox', { name: 'Cancel async reset', exact: true }).check();
  await page.getByRole('button', { name: 'Reset async choice', exact: true }).click();
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 0)));
  assert.equal(await select.inputValue(), 'a');
  assert.equal(await value.textContent(), 'a', 'Cancelled resets must preserve late-loaded selections.');
  await page.getByRole('checkbox', { name: 'Cancel async reset', exact: true }).uncheck();
  await page.getByRole('button', { name: 'Reset async choice', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('[data-testid="async-reset-value"]').textContent === 'b');
  assert.equal(await select.inputValue(), 'b');
  assert.deepEqual(await page.locator('#async-reset-form').evaluate((form) => Object.fromEntries(new FormData(form))), { asyncChoice: 'b' });

  await select.selectOption('a');
  await page.getByRole('button', { name: 'Replace reset options', exact: true }).click();
  await page.locator('#async-reset-form').evaluate((form) => form.reset());
  await page.waitForFunction(() => document.querySelector('[data-testid="async-reset-value"]').textContent === 'b');
  assert.equal(await select.inputValue(), 'b', 'Replaced options must retain the initial reset value.');
  assert.equal(await select.evaluate(element => element.selectedIndex), 1,
    'Reset must preserve the first matching option when values are duplicated.');
}

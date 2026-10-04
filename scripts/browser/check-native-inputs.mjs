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

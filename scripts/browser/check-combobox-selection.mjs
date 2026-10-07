import assert from 'node:assert/strict';

export async function verifyComboboxEditingContracts(page) {
  const input = page.getByRole('combobox', { name: 'Cached filtered choice', exact: true });
  const cases = [
    ['Shift+Home', [0, 3]],
    ['Shift+End', [3, 5]],
    ['Control+Home', [0, 0]],
    ['Control+End', [5, 5]],
    ['Shift+ArrowUp', [0, 3]],
    ['Shift+ArrowDown', [3, 5]],
    ['Control+Shift+ArrowUp', [0, 3]],
    ['Control+Shift+ArrowDown', [3, 5]]
  ];
  for (const [key, expected] of cases) {
    await input.fill('Alpha');
    await input.evaluate((element) => element.setSelectionRange(3, 3));
    const activeId = await input.getAttribute('aria-activedescendant');
    await input.press(key);
    assert.deepEqual(await input.evaluate((element) => [element.selectionStart, element.selectionEnd]), expected, `${key} must preserve native text editing.`);
    assert.equal(await input.getAttribute('aria-activedescendant'), activeId, 'Editing shortcuts must not change the active option.');
  }
  for (const modifier of ['ctrlKey', 'altKey', 'metaKey', 'shiftKey']) {
    for (const key of ['ArrowUp', 'ArrowDown', 'Enter']) {
      const activeId = await input.getAttribute('aria-activedescendant');
      const query = await input.inputValue();
      const prevented = await input.evaluate((element, { modifier, key }) => {
        const event = new KeyboardEvent('keydown', { key, [modifier]: true, bubbles: true, cancelable: true });
        element.dispatchEvent(event);
        return event.defaultPrevented;
      }, { modifier, key });
      assert.equal(prevented, false, `${modifier} + ${key} must remain available to native and consumer handlers.`);
      assert.equal(await input.getAttribute('aria-activedescendant'), activeId);
      assert.equal(await input.inputValue(), query);
    }
  }
  await input.press('Escape');
}

export async function verifyComboboxSelectionContracts(page) {
  const cached = page.getByRole('combobox', { name: 'Cached filtered choice', exact: true });
  const authoritative = page.getByRole('combobox', { name: 'Authoritative filtered choice', exact: true });
  const unknown = page.getByRole('combobox', { name: 'Unknown filtered choice', exact: true });
  const valid = (input) => input.checkValidity();
  const submittedValue = (input) => input.parentElement.querySelector('input[type="hidden"]').value;

  assert.equal(await authoritative.inputValue(), 'Alpha');
  assert.equal(await authoritative.evaluate(valid), true, 'Explicit selection metadata must work outside the search results.');
  assert.equal(await unknown.evaluate(valid), false, 'Unknown values must not become valid merely because they are nonempty.');
  const optional = page.getByRole('combobox', { name: 'Optional unknown choice', exact: true });
  await optional.fill('New search');
  assert.equal(await optional.evaluate(submittedValue), '', 'Editing an unknown selection must clear its submitted ID.');
  assert.equal(await optional.evaluate(input => new FormData(input.form).get('optional')), '',
    'Native form submission must not retain the stale selection.');
  assert.equal(await page.getByTestId('optional-selection-clears').textContent(), '1');
  await optional.fill('Another search');
  assert.equal(await page.getByTestId('optional-selection-clears').textContent(), '1', 'An already empty selection must not emit another clear.');
  await optional.press('Escape');
  await page.getByRole('button', { name: 'Hide selected candidate', exact: true }).click();
  assert.equal(await cached.inputValue(), 'Alpha');
  assert.equal(await cached.evaluate(valid), true, 'Filtering candidates must preserve a known required selection.');
  assert.equal(await cached.evaluate(submittedValue), 'alpha');
  await cached.focus();
  await cached.press('ArrowDown');
  const activeId = await cached.getAttribute('aria-activedescendant');
  assert.equal((await page.locator(`[id="${activeId}"]`).textContent()).trim(), 'Beta', 'Keyboard focus must target a current search result.');
  await cached.press('Escape');
  await page.getByRole('button', { name: 'Clear search candidates', exact: true }).click();
  assert.equal(await cached.evaluate(valid), true, 'An empty search result set must preserve the selected value.');
  await page.getByRole('button', { name: 'Hide selected candidate', exact: true }).click();
  await cached.fill('B');
  assert.equal(await cached.evaluate(submittedValue), '', 'Editing a cached label must clear its submitted selection.');
  assert.equal(await cached.evaluate(valid), false);
  await cached.press('ArrowDown');
  await cached.press('Enter');
  assert.equal(await cached.inputValue(), 'Beta');
  assert.equal(await cached.evaluate(valid), true);
  assert.equal(await page.getByTestId('filtered-selection-value').textContent(), 'beta');

  await page.getByRole('button', { name: 'Rename selected metadata', exact: true }).click();
  assert.equal(await authoritative.inputValue(), 'Renamed Alpha');
  await page.getByRole('button', { name: 'Disable selected metadata', exact: true }).click();
  assert.equal(await authoritative.evaluate(valid), false, 'An explicitly disabled selection must fail required validation.');
  await page.getByRole('button', { name: 'Invalidate selected metadata', exact: true }).click();
  assert.equal(await authoritative.inputValue(), '');
  assert.equal(await authoritative.evaluate(valid), false, 'Explicit null metadata must invalidate the selected option.');
  const invalidated = page.getByRole('combobox', { name: 'Optional authoritative choice', exact: true });
  assert.equal(await invalidated.evaluate(valid), true, 'An optional cleared selection must remain valid.');
  assert.equal(await invalidated.evaluate(input => new FormData(input.form).get('invalidated')), '',
    'Explicitly invalidated optional metadata must not submit the old ID.');
  assert.equal(await page.getByTestId('invalidated-selection-value').textContent(), '');
  assert.equal(await page.getByTestId('invalidated-selection-clears').textContent(), '1');
  await page.getByRole('button', { name: 'Invalidate selected metadata', exact: true }).click();
  assert.equal(await page.getByTestId('invalidated-selection-clears').textContent(), '1', 'Repeated invalidation must not emit another clear.');
}

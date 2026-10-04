import assert from 'node:assert/strict';

export async function verifyThemeToggleActionContracts(page) {
  const fixture = page.getByTestId('theme-toggle-actions');
  const standard = fixture.getByTestId('default-theme-toggle').getByRole('button');
  const custom = fixture.getByTestId('custom-theme-toggle').getByRole('button');
  const state = fixture.getByTestId('theme-actions-state');
  for (const [activation, expected, count] of [['click', 'dark', 1], ['Enter', 'light', 2], ['Space', 'dark', 3]]) {
    if (activation === 'click') await standard.click();
    else await standard.press(activation);
    assert.equal(await state.textContent(), `${expected}:${count}`, 'Theme actions must keep pointer and native keyboard activation.');
    assert.equal(await standard.getAttribute('data-zdp-theme-state'), expected);
    assert.equal(await standard.getAttribute('aria-label'), expected === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    assert.equal(await custom.getAttribute('aria-label'), expected === 'dark' ? 'Use light palette' : 'Use dark palette');
    for (const button of [standard, custom]) {
      assert.equal(await button.getAttribute('aria-pressed'), null, 'A changing action label must not also expose a pressed state.');
      assert.ok(!(await button.ariaSnapshot()).includes('[pressed]'));
    }
  }
  await custom.click();
  assert.equal(await state.textContent(), 'light:4', 'Custom labels must preserve activation.');
  await fixture.getByRole('checkbox').check();
  assert.equal(await standard.isDisabled(), true);
  await standard.evaluate((element) => element.click());
  assert.equal(await state.textContent(), 'light:4', 'Disabled theme actions must remain inactive.');
  await fixture.getByRole('checkbox').uncheck();
}

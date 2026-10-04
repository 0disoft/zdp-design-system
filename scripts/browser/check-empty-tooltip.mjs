import assert from 'node:assert/strict';

export async function verifyEmptyTooltipContracts(page) {
  const dialog = page.getByRole('dialog', { name: 'Empty tooltip dialog', exact: true });
  const trigger = page.getByTestId('empty-tooltip-trigger');
  await page.getByTestId('empty-tooltip-open').click();
  await trigger.focus();
  assert.equal(await dialog.getByRole('tooltip').count(), 0, 'Empty text must not render a tooltip.');
  assert.equal(await trigger.getAttribute('aria-describedby'), null, 'Empty text must not create an empty description reference.');
  await page.keyboard.press('Escape');
  assert.equal(await dialog.count(), 0, 'An empty tooltip must not consume its parent dialog Escape.');

  await page.getByTestId('tooltip-use-text').click();
  await page.getByTestId('empty-tooltip-open').click();
  await trigger.focus();
  assert.equal(await dialog.getByRole('tooltip').textContent(), 'Available explanation');
  assert.ok(await trigger.getAttribute('aria-describedby'));
  await page.getByTestId('tooltip-use-whitespace').evaluate((element) => element.click());
  assert.equal(await dialog.getByRole('tooltip').count(), 0, 'Clearing active tooltip text to whitespace must remove the tooltip.');
  assert.equal(await trigger.getAttribute('aria-describedby'), null);
  await page.keyboard.press('Escape');
  assert.equal(await dialog.count(), 0, 'Removing active tooltip content must release its dismiss layer.');
}

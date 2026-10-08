import assert from 'node:assert/strict';

export async function verifyTooltipLifecycleContracts(page) {
  const errors = [];
  const onError = (error) => errors.push(error.message);
  page.on('pageerror', onError);
  const fixture = page.getByTestId('tooltip-lifecycle');
  const tooltip = fixture.locator('.zdp-tooltip');
  try {
    await fixture.getByTestId('trigger').focus();
    await page.waitForFunction(() => document.querySelector('[data-testid="tooltip-lifecycle"] .zdp-tooltip').dataset.visible === 'true');
    await fixture.getByTestId('replace-text').evaluate((element) => element.click());
    await page.waitForFunction(() => document.querySelector('[data-testid="tooltip-lifecycle"] .zdp-tooltip').dataset.visible === 'false');
    await fixture.getByTestId('outside').focus();
    assert.equal(await tooltip.getAttribute('data-visible'), 'false');
    await fixture.getByTestId('replace-focus').evaluate((element) => element.click());
    await page.waitForFunction(() => document.querySelector('[data-testid="tooltip-lifecycle"] .zdp-tooltip').dataset.visible === 'true');
    assert.equal(await fixture.getByTestId('replacement').evaluate((element) => element.ownerDocument.activeElement === element), true);
    await fixture.getByTestId('outside').focus();
    assert.equal(await tooltip.getAttribute('data-visible'), 'false');
    await fixture.getByTestId('replacement').focus();
    await fixture.getByTestId('unmount').evaluate((element) => element.click());
    await tooltip.waitFor({ state: 'detached' });
    await fixture.getByTestId('mount-focused').click();
    await fixture.getByTestId('initial-focus').waitFor();
    assert.equal(await fixture.getByTestId('initial-focus').evaluate((element) => element.ownerDocument.activeElement === element), true);
    await page.waitForFunction(() => document.querySelector('[data-testid="tooltip-lifecycle"] .zdp-tooltip').dataset.visible === 'true');
    await fixture.getByTestId('outside').focus();
    await page.waitForFunction(() => document.querySelector('[data-testid="tooltip-lifecycle"] .zdp-tooltip').dataset.visible === 'false');
    await fixture.getByTestId('unmount').evaluate((element) => element.click());
    await tooltip.waitFor({ state: 'detached' });
    assert.deepEqual(errors, [], 'Replacing or removing focused tooltip content must not cause reactive mutation errors.');
  } finally {
    page.off('pageerror', onError);
  }
}

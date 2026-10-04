import assert from 'node:assert/strict';

export async function verifyTableDensityContracts(page) {
  const fixture = page.getByTestId('table-interaction');
  const compact = fixture.getByRole('radio', { name: 'Compact', exact: true });
  const normal = fixture.getByRole('radio', { name: 'Default', exact: true });
  const density = fixture.getByTestId('bound-density');
  const table = fixture.getByRole('table', { name: 'Bound density table', exact: true });
  await compact.click();
  assert.equal(await density.textContent(), 'compact');
  assert.ok((await table.getAttribute('class')).includes('zdp-table--density-compact'));
  assert.equal(await fixture.getByTestId('density-changes').textContent(), '1');
  await page.getByTestId('density-external-default').click();
  assert.equal(await normal.getAttribute('aria-checked'), 'true', 'External density updates must update the control.');
  await normal.focus();
  await normal.press('ArrowRight');
  assert.equal(await density.textContent(), 'compact', 'Keyboard density changes must propagate to the parent binding.');
  await page.getByTestId('density-disable-compact').click();
  assert.equal(await density.textContent(), 'default', 'Disabling the selected density must synchronize the enabled fallback.');
  assert.equal(await normal.getAttribute('aria-checked'), 'true');
  assert.ok((await table.getAttribute('class')).includes('zdp-table--density-default'));
  assert.equal(await fixture.getByTestId('density-changes').textContent(), '2', 'Automatic normalization must not fabricate user change callbacks.');
}

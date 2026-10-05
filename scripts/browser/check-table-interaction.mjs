import assert from 'node:assert/strict';

export async function verifyLocalizedSortContracts(page) {
  const fixture = page.getByTestId('localized-sort');
  await fixture.getByRole('button', { name: '이름 정렬 안 됨', exact: true }).click();
  const ascending = fixture.getByRole('button', { name: '이름 오름차순', exact: true });
  await ascending.focus();
  await page.keyboard.press('Enter');
  assert.equal(await fixture.getByRole('button', { name: '이름 내림차순', exact: true }).count(), 1);
  assert.equal(await fixture.getByTestId('changes').textContent(), '2', 'Translation must preserve pointer and keyboard sorting callbacks.');
  await fixture.getByTestId('locale').click();
  assert.equal(await fixture.getByRole('button', { name: '이름 Descending', exact: true }).count(), 1, 'Locale updates must update the current state announcement.');
  assert.equal(await fixture.getByRole('button', { name: '가격 기준 정렬', exact: true }).count(), 1, 'Explicit accessible names must remain complete overrides.');
  await fixture.getByTestId('reset').click();
  assert.equal(await fixture.getByRole('button', { name: '이름 Not sorted', exact: true }).count(), 1);
}

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

export async function verifySortNameContracts(page) {
  const fixture = page.getByTestId('sort-names');
  for (const label of ['Price', 'Created date', 'Status']) {
    assert.equal(await fixture.getByRole('button', { name: `${label} Not sorted`, exact: true }).count(), 1, 'Sort buttons must combine their displayed labels and current direction.');
  }
  assert.equal(await fixture.getByRole('button', { name: 'Order by count', exact: true }).count(), 1, 'Explicit accessible labels must still override content naming.');
  await fixture.getByTestId('sort-use-descending').click();
  await fixture.getByTestId('sort-change-label').click();
  for (const label of ['Cost', 'Created date', 'Status']) {
    assert.equal(await fixture.getByRole('button', { name: `${label} Descending`, exact: true }).count(), 1, 'Dynamic slot labels and sort direction must update the accessible name.');
  }
  assert.equal(await fixture.getByRole('button', { name: 'Order by count', exact: true }).count(), 1);
}

import assert from 'node:assert/strict';

export async function verifyDynamicPaginationContracts(page) {
  const fixture = page.getByTestId('dynamic-pagination');
  const links = fixture.locator('nav a');
  assert.ok((await links.evaluateAll((elements) => elements.map((element) => element.getAttribute('href')))).every((href) => href.startsWith('/en/')));
  await fixture.getByTestId('pagination-update-links').click();
  assert.ok((await links.evaluateAll((elements) => elements.map((element) => element.getAttribute('href')))).every((href) => href.startsWith('/ko/')), 'Replacing the resolver must update previous, next, and page links.');
  assert.equal(await fixture.getByRole('link', { name: 'Previous', exact: true }).getAttribute('href'), '/ko/list?page=3');
  assert.equal(await fixture.getByRole('link', { name: 'Next', exact: true }).getAttribute('href'), '/ko/list?page=5');
  await fixture.getByRole('link', { name: 'Updated page 5', exact: true }).click();
  assert.equal(await fixture.getByTestId('pagination-clicked-page').textContent(), '5');
  assert.equal(await fixture.getByRole('button', { name: 'Updated selected page 4', exact: true }).isDisabled(), true);
  await fixture.getByTestId('pagination-remove-links').click();
  assert.equal(await links.count(), 0, 'Removing the resolver must replace all links with buttons.');
  await fixture.getByRole('button', { name: 'Previous', exact: true }).click();
  assert.equal(await fixture.getByTestId('pagination-clicked-page').textContent(), '3');
  await fixture.getByTestId('pagination-update-links').click();
  assert.equal(await fixture.getByRole('link', { name: 'Next', exact: true }).getAttribute('href'), '/ko/list?page=5');
}

export async function verifyPaginationBoundsContracts(page) {
  const fixture = page.getByTestId('dynamic-pagination');
  const nav = fixture.getByRole('navigation');
  for (const testId of ['pagination-safe-limit', 'pagination-finite-limit']) {
    await fixture.getByTestId(testId).click();
    const current = nav.locator('[aria-current="page"]');
    assert.equal(await current.textContent(), String(Number.MAX_SAFE_INTEGER), 'Page numbers must stay representable at the safe integer boundary.');
    assert.equal(await current.isDisabled(), true);
    assert.equal(await nav.getByRole('button', { name: 'Next', exact: true }).isDisabled(), true);
    const pageNumbers = await nav.locator('.zdp-pagination__link:not(.zdp-pagination__link--control)').evaluateAll((elements) => elements.map((element) => Number(element.textContent)));
    assert.ok(pageNumbers.every((number) => Number.isSafeInteger(number) && number >= 1));
    assert.equal(new Set(pageNumbers).size, pageNumbers.length);
    assert.ok(pageNumbers.length <= 11, 'Even huge page ranges must render a bounded set of controls.');
    await nav.getByRole('link', { name: 'Previous', exact: true }).click();
    assert.equal(await fixture.getByTestId('pagination-clicked-page').textContent(), String(Number.MAX_SAFE_INTEGER - 1));
  }
  await fixture.getByTestId('pagination-invalid-range').click();
  assert.equal(await nav.locator('[aria-current="page"]').textContent(), '1');
  assert.equal(await nav.getByRole('button', { name: 'Previous', exact: true }).isDisabled(), true);
  assert.equal(await nav.getByRole('button', { name: 'Next', exact: true }).isDisabled(), true);
  await fixture.getByTestId('pagination-normal-range').click();
  assert.equal(await nav.locator('[aria-current="page"]').textContent(), '4', 'Ordinary page ranges must still render normally after boundary updates.');
}

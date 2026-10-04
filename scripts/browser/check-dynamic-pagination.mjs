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

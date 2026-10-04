import assert from 'node:assert/strict';

export async function verifyAvatarFallbackContracts(page) {
  const fixture = page.getByTestId('avatar-fallback-fixture');
  const avatar = fixture.getByTestId('avatar-standalone').locator('.zdp-avatar');
  await avatar.locator('.zdp-avatar__initials').waitFor();
  assert.equal(await avatar.locator('img').count(), 0);
  assert.equal(await avatar.locator('.zdp-avatar__initials').textContent(), 'ZD');
  assert.equal(await avatar.getAttribute('role'), 'img');
  assert.equal(await avatar.getAttribute('aria-label'), 'Zerodi');
  assert.equal(await avatar.locator('.zdp-avatar__initials').getAttribute('aria-hidden'), 'true');
  const decorative = fixture.getByTestId('avatar-chip').locator('.zdp-avatar');
  await decorative.locator('.zdp-avatar__initials').waitFor();
  assert.equal(await decorative.textContent(), 'AB');
  assert.equal(await decorative.getAttribute('aria-hidden'), 'true');
  assert.equal(await decorative.getAttribute('role'), null);
  const empty = fixture.getByTestId('avatar-empty').locator('.zdp-avatar');
  await empty.locator('.zdp-avatar__initials').waitFor({ state: 'attached' });
  assert.equal(await empty.locator('img').count(), 0);
  assert.equal(await empty.getAttribute('aria-label'), 'Member without initials');

  await fixture.getByRole('button', { name: 'Load valid avatar' }).click();
  const image = avatar.locator('img');
  await image.waitFor();
  await page.waitForFunction(() => {
    const image = document.querySelector('[data-testid="avatar-standalone"] img');
    return image?.complete && image.naturalWidth > 0;
  });
  assert.equal(await image.getAttribute('alt'), '');
  assert.equal(await avatar.locator('.zdp-avatar__initials').count(), 0);
  await fixture.getByRole('button', { name: 'Clear avatar image' }).click();
  await avatar.locator('.zdp-avatar__initials').waitFor();
  await fixture.getByRole('button', { name: 'Retry broken avatar' }).click();
  await avatar.locator('.zdp-avatar__initials').waitFor();
  assert.equal(await avatar.locator('.zdp-avatar__initials').textContent(), 'ZD');
}

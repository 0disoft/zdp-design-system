import assert from 'node:assert/strict';

export async function verifyAccordionInstanceContracts(page) {
  const fixture = page.getByTestId('accordion-instances');
  const references = await fixture.evaluate((root) => Array.from(root.querySelectorAll('.zdp-disclosure__trigger')).map((trigger) => {
    const panel = trigger.ownerDocument.getElementById(trigger.getAttribute('aria-controls'));
    return {
      triggerId: trigger.id,
      panelId: panel.id,
      ownsPanel: trigger.closest('.zdp-accordion').contains(panel),
      ownsLabel: panel.ownerDocument.getElementById(panel.getAttribute('aria-labelledby')) === trigger
    };
  }));
  assert.equal(new Set(references.map((entry) => entry.triggerId)).size, 2);
  assert.equal(new Set(references.map((entry) => entry.panelId)).size, 2);
  assert.ok(references.every((entry) => entry.ownsPanel && entry.ownsLabel));
  const account = fixture.getByRole('button', { name: 'Account general', exact: true });
  const service = fixture.getByRole('button', { name: 'Service general', exact: true });
  await account.click();
  assert.equal(await account.getAttribute('aria-expanded'), 'false');
  assert.equal(await service.getAttribute('aria-expanded'), 'true');
  await account.click();
  assert.equal(await page.getByTestId('accordion-change-item').textContent(), 'general');
  assert.equal(await page.getByTestId('accordion-change-open-ids').textContent(), 'general', 'Callback IDs must remain consumer-owned item IDs.');
}

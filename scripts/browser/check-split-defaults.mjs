import assert from 'node:assert/strict';

export async function verifySplitDefaultSizeContracts(page) {
  const omitted = page.locator('#omitted-size-split');
  const explicit = page.locator('#explicit-size-split');
  const checkSize = async (pane, size) => {
    assert.equal(await pane.getByRole('separator').getAttribute('aria-valuenow'), String(size));
    assert.equal(await pane.evaluate(element => element.style.getPropertyValue('--zdp-resizable-split-pane-size')), `${size}px`);
    assert.equal(await pane.locator('[data-zdp-split-pane-primary]').evaluate(element => Math.round(element.getBoundingClientRect().height)), size);
  };
  await checkSize(omitted, 64);
  await checkSize(explicit, 80);
  // The existing disabled fixture must have the same initial projection.
  const fixture = page.getByTestId('control-consistency-light-ltr');
  await checkSize(fixture.locator('.zdp-resizable-split-pane'), 64);
  await omitted.getByRole('separator').press('ArrowDown');
  await checkSize(omitted, 72);
  const controls = page.getByTestId('split-defaults-fixture');
  await controls.getByRole('button', { name: 'Change default to 48', exact: true }).click();
  await checkSize(omitted, 72);
  await checkSize(explicit, 80);
  await controls.getByRole('button', { name: 'Restore default to 64', exact: true }).click();
  await checkSize(omitted, 72);
  await checkSize(explicit, 80);
  for (const pane of [omitted, explicit]) {
    await pane.getByRole('separator').dblclick();
    await checkSize(pane, 64);
  }
  assert.equal(await controls.getByTestId('explicit-split-size').textContent(), '64', 'Reset writes the restored size through the binding');
}

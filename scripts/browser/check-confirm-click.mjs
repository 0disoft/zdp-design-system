import assert from 'node:assert/strict';

export async function verifyConfirmClickContracts(page) {
  await verifyHoldEscape(page);
  await verifyNestedConfirmEscape(page);
  const button = page.locator('#repeat-confirm-action');
  const count = page.getByTestId('repeat-confirm-count');
  const group = page.getByRole('group', { name: 'Confirm repeated hold', exact: true });
  const before = Number(await count.textContent());
  assert.equal(await button.getAttribute('aria-expanded'), 'false');
  const activate = () => button.evaluate(element => element.click());
  await activate(); // No pointer or keyboard event precedes this activation.
  await group.waitFor();
  assert.equal(await count.textContent(), String(before), 'Activation opens a separate confirmation step');
  assert.equal(await button.getAttribute('aria-expanded'), 'true');
  assert.equal(await group.getAttribute('id'), await button.getAttribute('aria-controls'));
  await page.waitForFunction(id => document.activeElement?.closest('[role="group"]')?.id === id, await group.getAttribute('id'));
  assert.equal(await group.getByRole('button', { name: 'Cancel', exact: true }).evaluate(element => element === document.activeElement), true);
  await group.getByRole('button', { name: 'Cancel', exact: true }).evaluate(element => element.click());
  assert.equal(await group.count(), 0);
  assert.equal(await button.evaluate(element => element === document.activeElement), true);
  assert.equal(await count.textContent(), String(before));
  await activate();
  await group.waitFor();
  await page.keyboard.press('Escape');
  assert.equal(await group.count(), 0);
  assert.equal(await button.evaluate(element => element === document.activeElement), true);
  await activate();
  await group.getByRole('button', { name: 'Confirm', exact: true }).evaluate(element => { element.click(); element.click(); });
  assert.equal(await count.textContent(), String(before + 1), 'Two click activations of the final button confirm once');
  assert.equal(await group.count(), 0);
  assert.equal(await button.evaluate(element => element === document.activeElement), true);
  await page.waitForFunction(() => !document.querySelector('#repeat-confirm-action').hasAttribute('data-confirmed'));

  // The completing pointer's click must still be ignored after the success reset.
  await button.scrollIntoViewIfNeeded();
  const box = await button.boundingBox();
  await page.mouse.move(box.x + 8, box.y + box.height / 2);
  await page.mouse.down();
  try {
    await page.waitForFunction(expected => document.querySelector('[data-testid="repeat-confirm-count"]').textContent === String(expected), before + 2);
    await page.waitForFunction(() => !document.querySelector('#repeat-confirm-action').hasAttribute('data-confirmed'));
  } finally { await page.mouse.up(); }
  assert.equal(await group.count(), 0, 'A completed hold must not open another step on release');
  assert.equal(await count.textContent(), String(before + 2));
  // A fresh short pointer click remains usable as a two-step alternative.
  await button.click();
  await group.waitFor();
  await group.getByRole('button', { name: 'Cancel', exact: true }).click();

  const root = page.getByTestId('confirm-pending-fixture');
  const primary = root.locator('#pending-confirm-primary');
  const danger = root.locator('#pending-confirm-danger');
  const primaryGroup = root.getByRole('group', { name: 'Confirm primary', exact: true });
  const dangerGroup = root.getByRole('group', { name: 'Confirm danger', exact: true });
  const pendingCount = root.getByTestId('confirm-pending-count');
  const pendingBefore = Number(await pendingCount.textContent());
  const togglePending = () => root.getByTestId('confirm-pending-toggle').evaluate(element => element.click());
  const toggleDisabled = () => root.getByTestId('confirm-pending-disable').evaluate(element => element.click());
  await primary.evaluate(element => element.click());
  await primaryGroup.waitFor();
  await togglePending();
  assert.equal(await primaryGroup.count(), 0, 'Pending closes a stale confirmation step');
  await primary.evaluate(element => element.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  assert.equal(await primaryGroup.count(), 0, 'Pending ignores even dispatched click activation');
  assert.equal(await pendingCount.textContent(), String(pendingBefore));
  await togglePending();
  await danger.evaluate(element => element.click());
  await dangerGroup.waitFor();
  await toggleDisabled();
  assert.equal(await dangerGroup.count(), 0, 'Disabled closes a stale confirmation step');
  await danger.evaluate(element => element.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  assert.equal(await dangerGroup.count(), 0);
  assert.equal(await pendingCount.textContent(), String(pendingBefore));
  await toggleDisabled();

  // A click confirmation can synchronously enter pending without a duplicate call.
  await primary.evaluate(element => element.click());
  await primaryGroup.getByRole('button', { name: 'Confirm', exact: true }).evaluate(element => { element.click(); element.click(); });
  assert.equal(await pendingCount.textContent(), String(pendingBefore + 1));
  assert.equal(await primary.getAttribute('data-pending'), 'true');
  assert.equal(await primaryGroup.count(), 0);
  await togglePending();
}

async function verifyHoldEscape(page) {
  const trigger = page.locator('#repeat-confirm-action');
  const count = page.getByTestId('repeat-confirm-count');
  const results = [];
  for (const input of ['keyboard', 'pointer']) {
    const before = Number(await count.textContent());
    await trigger.focus();
    if (input === 'keyboard') {
      await page.keyboard.down('Enter');
    } else {
      await trigger.scrollIntoViewIfNeeded();
      const box = await trigger.boundingBox();
      await page.mouse.move(box.x + 8, box.y + box.height / 2);
      await page.mouse.down();
    }
    try {
      assert.equal(await trigger.getAttribute('data-active'), 'true');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(700); // The hold deadline is 600 ms.
    } finally {
      if (input === 'keyboard') await page.keyboard.up('Enter');
      else await page.mouse.up();
    }
    results.push({
      confirmations: Number(await count.textContent()) - before,
      expanded: await trigger.getAttribute('aria-expanded')
    });
    await page.waitForFunction(() => !document.querySelector('#repeat-confirm-action').hasAttribute('data-confirmed'));
  }
  assert.deepEqual(results, [
    { confirmations: 0, expanded: 'false' },
    { confirmations: 0, expanded: 'false' }
  ], 'Escape must stop keyboard and pointer holds without confirming or opening an inline confirmation on release.');
}

async function verifyNestedConfirmEscape(page) {
  const opener = page.getByRole('button', { name: 'Open confirmation dialog', exact: true });
  const dialog = page.getByRole('dialog', { name: 'Edit draft before confirming', exact: true });
  const draft = dialog.getByRole('textbox', { name: 'Draft text' });
  const trigger = dialog.locator('#nested-confirm-action');
  const group = dialog.getByRole('group', { name: 'Confirm draft action', exact: true });
  const count = page.getByTestId('confirm-pending-count');
  const before = await count.textContent();
  const openConfirmation = async () => {
    await trigger.evaluate(element => element.click());
    await group.getByRole('button', { name: 'Cancel', exact: true }).waitFor();
  };

  await opener.click();
  await draft.fill('Unsaved changes');
  await trigger.focus();
  await page.keyboard.down('Space');
  try {
    assert.equal(await trigger.getAttribute('data-active'), 'true');
    await page.keyboard.press('Escape');
    assert.equal(await dialog.count(), 1, 'Escape during a hold must keep the dialog open.');
    assert.equal(await trigger.getAttribute('data-active'), null, 'Escape must cancel the active hold.');
    assert.equal(await draft.inputValue(), 'Unsaved changes');
  } finally {
    await page.keyboard.up('Space');
  }
  await openConfirmation();
  await page.keyboard.press('Escape');
  assert.equal(await dialog.count(), 1, 'The first Escape must keep the parent dialog open.');
  assert.equal(await group.count(), 0, 'The first Escape must cancel the inline confirmation.');
  assert.equal(await trigger.evaluate(element => element === document.activeElement), true);
  assert.equal(await draft.inputValue(), 'Unsaved changes');
  await page.keyboard.press('Escape');
  assert.equal(await dialog.count(), 0, 'The second Escape must reach the parent dialog.');

  await opener.click();
  await openConfirmation();
  await draft.focus();
  await page.keyboard.press('Escape');
  assert.equal(await dialog.count(), 0, 'Escape outside the confirmation group must reach the dialog.');
  assert.equal(await count.textContent(), before, 'Neither Escape path may execute the action.');
}

import assert from 'node:assert/strict';
import { hasInertAncestor, isDeepActive } from './browser-assertions.mjs';

export async function verifyModalContracts(page) {
  await verifyModalKeyboardContract({
    page,
    triggerTestId: 'dialog-trigger',
    dialogName: 'Review changes',
    closeName: 'Close dialog',
    backdropSelector: '.zdp-dialog__backdrop',
    lastTestId: 'dialog-last-action'
  });
  await verifyModalKeyboardContract({
    page,
    triggerTestId: 'sheet-trigger',
    dialogName: 'Release details',
    closeName: 'Close sheet',
    backdropSelector: '.zdp-sheet__backdrop',
    lastTestId: 'sheet-last-action'
  });
  await verifyModalKeyboardContract({
    page,
    triggerTestId: 'term-sheet-trigger',
    dialogName: 'Browser term',
    closeName: 'Close term',
    backdropSelector: '.zdp-term-sheet__backdrop',
    lastRole: 'link',
    lastName: 'View details'
  });

  await verifyProtectedModalContract({
    page,
    triggerTestId: 'protected-dialog-trigger',
    dialogName: 'Protected dialog',
    closeName: 'Close protected dialog',
    backdropSelector: '.zdp-dialog__backdrop'
  });
  await verifyProtectedModalContract({
    page,
    triggerTestId: 'protected-sheet-trigger',
    dialogName: 'Protected sheet',
    closeName: 'Close protected sheet',
    backdropSelector: '.zdp-sheet__backdrop'
  });
  await verifyProtectedModalContract({
    page,
    triggerTestId: 'protected-term-trigger',
    dialogName: 'Protected term',
    closeName: 'Close protected term',
    backdropSelector: '.zdp-term-sheet__backdrop'
  });

  const abruptDialogTrigger = page.getByTestId('abrupt-dialog-trigger');
  await abruptDialogTrigger.focus();
  await abruptDialogTrigger.click();
  const abruptDialog = page.getByRole('dialog', { name: 'Removable dialog' });
  assert.equal(await abruptDialog.count(), 1);
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  assert.equal(await hasInertAncestor(abruptDialogTrigger), true);
  await abruptDialog.getByTestId('abrupt-dialog-unmount').click();
  assert.equal(await abruptDialog.count(), 0, 'Parent unmount must destroy the active modal layer.');
  assert.equal(await page.locator('html').getAttribute('data-zdp-modal-layer-count'), null);
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  assert.equal(await hasInertAncestor(abruptDialogTrigger), false, 'Parent unmount must restore background interaction.');
  assert.equal(
    await abruptDialogTrigger.evaluate((element) => document.activeElement === element),
    true,
    'Parent unmount must restore focus to the surviving trigger.'
  );
  assert.equal(await page.getByTestId('preexisting-inert').getAttribute('inert'), '');

  const abruptNestedTrigger = page.getByTestId('abrupt-nested-trigger');
  await abruptNestedTrigger.click();
  let abruptNestedDialog = page.getByRole('dialog', { name: 'Removable nested dialog' });
  let abruptNestedSheetTrigger = abruptNestedDialog.getByTestId('abrupt-nested-sheet-trigger');
  await abruptNestedSheetTrigger.click();
  let abruptNestedSheet = page.getByRole('dialog', { name: 'Removable nested sheet' });
  assert.equal(await page.locator('html').getAttribute('data-zdp-modal-layer-count'), '2');
  assert.equal(await hasInertAncestor(abruptNestedDialog), true);
  assert.equal(await hasInertAncestor(abruptNestedSheet), false);
  await abruptNestedSheet.getByTestId('abrupt-nested-remove-top').click();
  assert.equal(await abruptNestedSheet.count(), 0, 'Destroying the top component must remove only its modal layer.');
  assert.equal(await abruptNestedDialog.count(), 1);
  assert.equal(await abruptNestedDialog.locator('..').getAttribute('data-zdp-modal-layer-level'), '1');
  assert.equal(await hasInertAncestor(abruptNestedDialog), false, 'Destroying the top component must reactivate the lower modal.');
  assert.equal(await hasInertAncestor(abruptNestedTrigger), true);
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  assert.equal(
    await abruptNestedSheetTrigger.evaluate((element) => document.activeElement === element),
    true,
    'Destroying the top component must restore focus inside the lower modal.'
  );
  await page.keyboard.press('Escape');
  assert.equal(await abruptNestedDialog.count(), 0);
  assert.equal(await abruptNestedTrigger.evaluate((element) => document.activeElement === element), true);
  assert.equal(await hasInertAncestor(abruptNestedTrigger), false);
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');

  await abruptNestedTrigger.click();
  abruptNestedDialog = page.getByRole('dialog', { name: 'Removable nested dialog' });
  abruptNestedSheetTrigger = abruptNestedDialog.getByTestId('abrupt-nested-sheet-trigger');
  await abruptNestedSheetTrigger.click();
  abruptNestedSheet = page.getByRole('dialog', { name: 'Removable nested sheet' });
  const removeLowerDialog = abruptNestedSheet.getByTestId('abrupt-nested-remove-lower');
  await removeLowerDialog.click();
  assert.equal(await abruptNestedDialog.count(), 0, 'Destroying the lower component must not remove the top modal.');
  assert.equal(await abruptNestedSheet.count(), 1);
  assert.equal(await abruptNestedSheet.locator('..').getAttribute('data-zdp-modal-layer-level'), '1');
  assert.equal(await hasInertAncestor(abruptNestedSheet), false);
  assert.equal(await hasInertAncestor(abruptNestedTrigger), true);
  assert.equal(await removeLowerDialog.evaluate((element) => document.activeElement === element), true);
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  await page.keyboard.press('Escape');
  assert.equal(await abruptNestedSheet.count(), 0);
  assert.equal(
    await abruptNestedTrigger.evaluate((element) => document.activeElement === element),
    true,
    'The surviving top modal must inherit the removed lower layer focus-return target.'
  );
  assert.equal(await page.locator('html').getAttribute('data-zdp-modal-layer-count'), null);
  assert.equal(await hasInertAncestor(abruptNestedTrigger), false);
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  assert.equal(await page.getByTestId('preexisting-inert').getAttribute('inert'), '');

  const portalDialogTrigger = page.getByTestId('portal-dialog-trigger');
  await portalDialogTrigger.click();
  const portalDialog = page.getByRole('dialog', { name: 'Portal dialog' });
  assert.equal(await portalDialog.count(), 1);
  assert.equal(await hasInertAncestor(portalDialogTrigger), true, 'A body portal must isolate its light-DOM trigger.');
  assert.equal(await hasInertAncestor(portalDialog), false);
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  await page.keyboard.press('Escape');
  assert.equal(await portalDialog.count(), 0);
  assert.equal(await portalDialogTrigger.evaluate((element) => document.activeElement === element), true);
  assert.equal(await hasInertAncestor(portalDialogTrigger), false);
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');

  await verifyShadowModalBoundary({
    page,
    triggerTestId: 'shadow-dialog-trigger',
    dialogName: 'Shadow dialog',
    closeName: 'Close shadow dialog',
    lastTestId: 'shadow-dialog-last-action'
  });
  await verifyShadowModalBoundary({
    page,
    triggerTestId: 'shadow-sheet-trigger',
    dialogName: 'Shadow sheet',
    closeName: 'Close shadow sheet',
    lastTestId: 'shadow-sheet-last-action'
  });
  await verifyShadowModalBoundary({
    page,
    triggerTestId: 'shadow-term-trigger',
    dialogName: 'Shadow term',
    closeName: 'Close shadow term',
    lastRole: 'link',
    lastName: 'View details'
  });
}
export async function verifyNestedModalContracts(page) {
  const nestedDialogTrigger = page.getByTestId('nested-dialog-trigger');
  await nestedDialogTrigger.click();
  const nestedDialog = page.getByRole('dialog', { name: 'Nested dialog' });
  await nestedDialog.getByTestId('nested-sheet-trigger').click();
  const nestedSheet = page.getByRole('dialog', { name: 'Nested sheet' });
  assert.equal(await page.locator('html').getAttribute('data-zdp-modal-layer-count'), '2');
  assert.equal(await hasInertAncestor(nestedDialog), true, 'The lower modal layer must become inert.');
  assert.equal(await hasInertAncestor(nestedSheet), false, 'The top modal layer must remain interactive.');
  assert.equal(await hasInertAncestor(nestedDialogTrigger), true, 'Background controls must remain inert.');
  assert.equal(
    await nestedDialog.locator('..').getAttribute('data-zdp-modal-layer-level'),
    '1'
  );
  assert.equal(
    await nestedSheet.locator('..').getAttribute('data-zdp-modal-layer-level'),
    '2'
  );
  const nestedDialogZIndex = Number(await nestedDialog.locator('..').evaluate((element) => getComputedStyle(element).zIndex));
  const nestedSheetZIndex = Number(await nestedSheet.locator('..').evaluate((element) => getComputedStyle(element).zIndex));
  assert.ok(
    nestedSheetZIndex > nestedDialogZIndex,
    'A later modal activation must create a higher real stacking context regardless of component type.'
  );

  const closeUnderlyingDialog = nestedSheet.getByTestId('close-underlying-dialog');
  await closeUnderlyingDialog.click();
  assert.equal(await nestedDialog.count(), 0, 'The lower modal layer must be able to close independently.');
  assert.equal(await page.locator('html').getAttribute('data-zdp-modal-layer-count'), '1');
  assert.equal(
    await nestedSheet.locator('..').getAttribute('data-zdp-modal-layer-level'),
    '1',
    'A surviving modal must be renumbered after a lower layer closes.'
  );
  assert.equal(
    await closeUnderlyingDialog.evaluate((element) => document.activeElement === element),
    true,
    'Closing a lower modal must not steal focus from the active top layer.'
  );
  assert.equal(await hasInertAncestor(nestedSheet), false, 'A surviving top layer must stay interactive.');
  assert.equal(await hasInertAncestor(nestedDialogTrigger), true, 'Background isolation must survive non-LIFO close.');
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');

  await page.keyboard.press('Escape');
  assert.equal(await nestedSheet.count(), 0);
  assert.equal(
    await nestedDialogTrigger.evaluate((element) => document.activeElement === element),
    true,
    'The final nested modal must fall back to the surviving outer trigger when its original trigger is removed.'
  );
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  assert.equal(await page.locator('html').getAttribute('data-zdp-modal-layer-count'), null);
  assert.equal(await hasInertAncestor(nestedDialogTrigger), false, 'Final close must restore background interaction.');
  assert.equal(await page.getByTestId('preexisting-inert').getAttribute('inert'), '', 'Pre-existing inert state must survive modal cleanup.');

  await nestedDialogTrigger.click();
  const reopenedNestedDialog = page.getByRole('dialog', { name: 'Nested dialog' });
  const reopenedNestedSheetTrigger = reopenedNestedDialog.getByTestId('nested-sheet-trigger');
  await reopenedNestedSheetTrigger.click();
  const reopenedNestedSheet = page.getByRole('dialog', { name: 'Nested sheet' });
  await page.keyboard.press('Escape');
  assert.equal(await reopenedNestedSheet.count(), 0);
  assert.equal(await hasInertAncestor(reopenedNestedDialog), false, 'Closing the top layer must reactivate the lower layer.');
  assert.equal(
    await reopenedNestedSheetTrigger.evaluate((element) => document.activeElement === element),
    true,
    'Top-layer close must restore focus inside the reactivated lower layer.'
  );
  assert.equal(await hasInertAncestor(nestedDialogTrigger), true);
  await page.keyboard.press('Escape');
  assert.equal(await reopenedNestedDialog.count(), 0);
  assert.equal(await hasInertAncestor(nestedDialogTrigger), false);
  assert.equal(await page.getByTestId('preexisting-inert').getAttribute('inert'), '');
}

async function verifyModalKeyboardContract({
  page,
  triggerTestId,
  dialogName,
  closeName,
  backdropSelector,
  lastTestId,
  lastRole,
  lastName
}) {
  const trigger = page.getByTestId(triggerTestId);
  await trigger.focus();
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: dialogName });
  const closeButton = dialog.getByRole('button', { name: closeName });
  const lastControl = lastTestId
    ? dialog.getByTestId(lastTestId)
    : dialog.getByRole(lastRole, { name: lastName });

  assert.equal(await dialog.count(), 1, `${dialogName} must expose one named modal dialog.`);
  assert.equal(await dialog.getAttribute('aria-modal'), 'true');
  assert.equal(
    await closeButton.evaluate((element) => document.activeElement === element),
    true,
    `${dialogName} must focus its first control after opening.`
  );
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  assert.equal(await page.locator('html').getAttribute('data-zdp-modal-layer-count'), '1');
  assert.equal(await hasInertAncestor(trigger), true, `${dialogName} must make its background trigger inert.`);

  await page.keyboard.press('Shift+Tab');
  assert.equal(
    await lastControl.evaluate((element) => document.activeElement === element),
    true,
    `${dialogName} must wrap backward focus to its last control.`
  );
  await page.keyboard.press('Tab');
  assert.equal(
    await closeButton.evaluate((element) => document.activeElement === element),
    true,
    `${dialogName} must wrap forward focus to its first control.`
  );

  await page.keyboard.press('Escape');
  assert.equal(await dialog.count(), 0, `${dialogName} must close on Escape.`);
  assert.equal(
    await trigger.evaluate((element) => document.activeElement === element),
    true,
    `${dialogName} must restore focus to its trigger.`
  );
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  assert.equal(await page.locator('html').getAttribute('data-zdp-modal-layer-count'), null);
  assert.equal(await hasInertAncestor(trigger), false, `${dialogName} must restore background interaction.`);
  assert.equal(await page.getByTestId('preexisting-inert').getAttribute('inert'), '');

  await trigger.click();
  assert.equal(await dialog.count(), 1);
  await page.locator(backdropSelector).click({ position: { x: 5, y: 5 } });
  assert.equal(await dialog.count(), 0, `${dialogName} must close on backdrop click.`);
  assert.equal(
    await trigger.evaluate((element) => document.activeElement === element),
    true,
    `${dialogName} must restore focus after backdrop dismissal.`
  );
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  assert.equal(await page.locator('html').getAttribute('data-zdp-modal-layer-count'), null);
  assert.equal(await hasInertAncestor(trigger), false, `${dialogName} backdrop close must restore background interaction.`);
  assert.equal(await page.getByTestId('preexisting-inert').getAttribute('inert'), '');
}

async function verifyProtectedModalContract({ page, triggerTestId, dialogName, closeName, backdropSelector }) {
  const trigger = page.getByTestId(triggerTestId);
  await trigger.focus();
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: dialogName });
  const closeButton = dialog.getByRole('button', { name: closeName });
  const backdrop = page.locator(backdropSelector);
  assert.equal(await dialog.count(), 1);
  assert.equal(await closeButton.evaluate((element) => document.activeElement === element), true);
  assert.equal(await page.getByRole('button', { name: closeName }).count(), 1);
  assert.equal(await backdrop.evaluate((element) => element.tagName), 'DIV');
  assert.equal(await backdrop.getAttribute('aria-hidden'), 'true');

  await page.keyboard.press('Escape');
  assert.equal(await dialog.count(), 1, `${dialogName} must ignore Escape when dismissal is disabled.`);
  assert.equal(await closeButton.evaluate((element) => document.activeElement === element), true);

  await backdrop.click({ position: { x: 5, y: 5 } });
  assert.equal(await dialog.count(), 1, `${dialogName} must ignore backdrop clicks when dismissal is disabled.`);
  assert.equal(
    await closeButton.evaluate((element) => document.activeElement === element),
    true,
    `${dialogName} backdrop interaction must not move focus out of the protected modal.`
  );
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  assert.equal(await page.locator('html').getAttribute('data-zdp-modal-layer-count'), '1');
  assert.equal(await hasInertAncestor(trigger), true, `${dialogName} must keep its background inert while protected.`);

  await closeButton.click();
  assert.equal(await dialog.count(), 0);
  assert.equal(await trigger.evaluate((element) => document.activeElement === element), true);
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  assert.equal(await page.locator('html').getAttribute('data-zdp-modal-layer-count'), null);
  assert.equal(await hasInertAncestor(trigger), false, `${dialogName} explicit close must restore background interaction.`);
  assert.equal(await page.getByTestId('preexisting-inert').getAttribute('inert'), '');
}

async function verifyShadowModalBoundary({
  page,
  triggerTestId,
  dialogName,
  closeName,
  lastTestId,
  lastRole,
  lastName
}) {
  const trigger = page.getByTestId(triggerTestId);
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: dialogName });
  const closeButton = dialog.getByRole('button', { name: closeName });
  const lastControl = lastTestId
    ? dialog.getByTestId(lastTestId)
    : dialog.getByRole(lastRole, { name: lastName });

  assert.equal(await dialog.count(), 1);
  assert.equal(await hasInertAncestor(trigger), true, `${dialogName} must isolate shadow-root sibling controls.`);
  assert.equal(await hasInertAncestor(dialog), false);
  assert.equal(await isDeepActive(closeButton), true);
  await page.keyboard.press('Shift+Tab');
  assert.equal(await isDeepActive(lastControl), true, `${dialogName} focus must wrap backward inside the shadow root.`);
  await page.keyboard.press('Tab');
  assert.equal(await isDeepActive(closeButton), true, `${dialogName} focus must wrap forward inside the shadow root.`);
  await page.keyboard.press('Escape');
  assert.equal(await dialog.count(), 0);
  assert.equal(await isDeepActive(trigger), true, `${dialogName} must restore its inner shadow trigger focus.`);
  assert.equal(await hasInertAncestor(trigger), false);
}

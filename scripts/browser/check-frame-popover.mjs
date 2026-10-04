import assert from 'node:assert/strict';

export async function verifyFramePopoverContracts(page) {
  const frame = page.frameLocator('[title="Embedded popover document"]');
  const trigger = frame.getByTestId('frame-popover-trigger');
  const action = frame.getByTestId('frame-popover-action');
  await trigger.click();
  await action.focus();
  await page.keyboard.press('Escape');
  assert.equal(await action.count(), 0);
  assert.equal(await trigger.evaluate((element) => element.ownerDocument.activeElement === element), true, 'Escape must restore the iframe trigger captured by the parent runtime.');
  await trigger.click();
  await action.click();
  assert.equal(await action.count(), 0);
  assert.equal(await trigger.evaluate((element) => element.ownerDocument.activeElement === element), true, 'Explicit close must restore the iframe trigger.');
  await trigger.click();
  const outside = frame.getByTestId('frame-popover-outside');
  await outside.click();
  assert.equal(await action.count(), 0);
  assert.equal(await outside.evaluate((element) => element.ownerDocument.activeElement === element), true, 'Outside dismissal must preserve focus on the outside iframe control.');

  // Also capture an element created natively by the iframe, alongside the
  // parent-runtime template elements adopted into that document.
  await frame.locator('body').evaluate((body) => {
    const native = body.ownerDocument.createElement('button');
    native.dataset.testid = 'frame-native-focus-return';
    native.textContent = 'Native iframe control';
    body.append(native);
    native.focus();
    body.querySelector('[data-testid="frame-popover-trigger"]').click();
  });
  await action.focus();
  await page.keyboard.press('Escape');
  assert.equal(await frame.getByTestId('frame-native-focus-return').evaluate((element) => element.ownerDocument.activeElement === element), true, 'Native iframe elements must also be valid focus return targets.');
  await frame.getByTestId('frame-native-focus-return').evaluate((element) => element.remove());
}

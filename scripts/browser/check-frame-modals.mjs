import assert from 'node:assert/strict';

export async function verifyFrameModalContracts(page) {
  const frame = page.frameLocator('[title="Embedded modal document"]');
  const native = frame.getByTestId('frame-modal-native-outside');
  for (const scope of ['body', 'shadow']) {
    const trigger = frame.getByTestId(`frame-modal-${scope}-trigger`);
    await trigger.click();
    await frame.getByRole('dialog').waitFor();
    assert.equal(await trigger.evaluate((element) => element.inert), true, 'Adopted modal siblings must become inert.');
    assert.equal(await native.evaluate((element) => element.inert), true, 'Native iframe background must also become inert.');
    assert.equal(await frame.locator('body').evaluate((body) => body.style.overflow), 'hidden');
    assert.equal(await native.evaluate((element) => {
      element.focus();
      return element.ownerDocument.activeElement === element;
    }), false, 'The modal must prevent focus from escaping to iframe background.');
    await frame.getByRole('dialog').getByRole('button', { name: 'Close embedded dialog' }).click();
    assert.equal(await trigger.evaluate((element) => element.inert), false);
    assert.equal(await native.evaluate((element) => element.inert), false);
    assert.equal(await frame.getByTestId('frame-modal-already-inert').evaluate((element) => element.inert), true, 'Closing must preserve preexisting inert state.');
    assert.equal(await frame.locator('body').evaluate((body) => body.style.overflow), '');
    assert.equal(await trigger.evaluate((element) => element.getRootNode().activeElement === element), true, 'Closing must restore the iframe trigger.');
  }
}

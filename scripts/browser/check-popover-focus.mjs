import assert from 'node:assert/strict';

const isActive = (element) => element.getRootNode().activeElement === element;

export async function verifyPopoverFocusContracts(page) {
  for (const testId of ['popover-focus', 'shadow-popover-focus']) {
    const fixture = page.getByTestId(testId);
    const trigger = fixture.getByRole('button', { name: 'Bound popover trigger', exact: true });
    const editor = fixture.getByRole('textbox', { name: 'Bound popover editor', exact: true });
    for (const action of ['close', 'close-outside', 'close-document-outside', 'close-without-restore']) {
      await trigger.focus();
      await trigger.evaluate((element) => element.click());
      await editor.focus();
      await fixture.getByTestId(action).evaluate((element) => element.click());
      assert.equal(await editor.count(), 0);
      if (action === 'close-without-restore') {
        assert.equal(await trigger.evaluate(isActive), false, 'Explicit close(false) must keep its focus restoration opt-out.');
      } else {
        const target = action === 'close-document-outside' ? page.getByTestId('document-popover-outside')
          : action === 'close-outside' ? fixture.getByTestId('outside') : trigger;
        assert.equal(await target.evaluate(isActive), true, `Parent closure must recover focus and preserve deliberate moves (${testId}, ${action}).`);
      }
    }
    await trigger.focus();
    await trigger.evaluate((element) => element.click());
    await fixture.getByTestId('outside').focus();
    await fixture.getByTestId('close').evaluate((element) => element.click());
    assert.equal(await fixture.getByTestId('outside').evaluate(isActive), true, 'Closing must not steal unrelated focus.');
  }
}

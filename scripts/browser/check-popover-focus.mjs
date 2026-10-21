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

    await trigger.click();
    assert.equal(await trigger.evaluate(isActive), true, 'Popover opening must keep focus on its custom trigger.');
    await editor.focus();
    await page.keyboard.press('Shift+Tab');
    assert.equal(await trigger.evaluate(isActive), true, 'Shift+Tab must leave the first panel control in native order.');
    const nestedTrigger = fixture.getByRole('button', { name: 'Nested popover trigger', exact: true });
    await nestedTrigger.focus();
    await page.keyboard.press('Tab');
    assert.equal(await fixture.getByTestId('outside').evaluate(isActive), true, 'Tab must leave the last panel control without looping.');
    assert.equal(await editor.count(), 1, 'A non-modal Popover must remain open when focus leaves.');
    await editor.focus();
    for (const composition of [{ isComposing: true }, { keyCode: 229 }]) {
      const prevented = await editor.evaluate((element, composition) => {
        const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true, cancelable: true, ...composition });
        element.dispatchEvent(event);
        return event.defaultPrevented;
      }, composition);
      assert.equal(prevented, false, 'IME Escape must remain available to the Popover editor.');
      assert.equal(await editor.count(), 1, 'IME Escape must preserve the Popover.');
      const outsidePrevented = await fixture.getByTestId('outside').evaluate((element, composition) => {
        element.focus();
        const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true, cancelable: true, ...composition });
        element.dispatchEvent(event);
        return event.defaultPrevented;
      }, composition);
      assert.equal(outsidePrevented, false, 'Open Popover must not consume IME Escape outside its panel.');
      await editor.focus();
    }

    const menuTrigger = fixture.getByRole('button', { name: 'Nested popover actions', exact: true });
    await menuTrigger.click();
    await page.keyboard.press('Escape');
    assert.equal(await fixture.getByRole('menu').count(), 0, 'Escape must dismiss the nested Bits Menu first.');
    assert.equal(await editor.count(), 1, 'Nested Menu dismissal must keep the Popover open.');
    assert.equal(await menuTrigger.evaluate(isActive), true, 'Nested Menu dismissal must return focus inside the Popover.');

    const outside = fixture.getByTestId('outside');
    await outside.evaluate((element) => {
      element.dataset.clicks = '0';
      element.addEventListener('click', () => {
        element.dataset.clicks = String(Number(element.dataset.clicks) + 1);
      });
    });
    await menuTrigger.click();
    await outside.click();
    assert.equal(await fixture.getByRole('menu').count(), 0, 'One real outside click must dismiss the nested Menu.');
    assert.equal(await editor.count(), 1, 'The click following Menu pointerdown dismissal must preserve the outer Popover.');
    assert.equal(await outside.evaluate(isActive), true, 'Outside dismissal must preserve native button focus.');
    assert.equal(await outside.getAttribute('data-clicks'), '1', 'Outside dismissal must still deliver the button click.');
    await outside.click();
    assert.equal(await editor.count(), 0, 'A second real outside click must dismiss the remaining Popover.');

    await trigger.click();
    await menuTrigger.click();
    await outside.evaluate((element) => element.click());
    assert.equal(await fixture.getByRole('menu').count(), 0, 'Click-only input must dismiss the top Menu.');
    assert.equal(await editor.count(), 1, 'Click-only input must preserve the outer Popover.');
    await outside.evaluate((element) => element.click());
    assert.equal(await editor.count(), 0, 'A second click-only input must dismiss the remaining Popover.');
    await trigger.click();

    await nestedTrigger.click();
    await fixture.getByTestId('nested-action').focus();
    await page.keyboard.press('Escape');
    assert.equal(await fixture.getByTestId('nested-action').count(), 0, 'Escape must dismiss only the inner Bits Popover.');
    assert.equal(await editor.count(), 1, 'The outer Popover must survive inner dismissal.');
    assert.equal(await nestedTrigger.evaluate(isActive), true);
    await nestedTrigger.click();
    await fixture.getByTestId('outside').click();
    assert.equal(await fixture.getByTestId('nested-action').count(), 0);
    assert.equal(await editor.count(), 1, 'One outside click must dismiss only the top Popover.');
    await fixture.getByTestId('outside').click();
    assert.equal(await editor.count(), 0);
  }
}

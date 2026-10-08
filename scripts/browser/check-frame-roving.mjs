import assert from 'node:assert/strict';

export async function verifyFrameRovingContracts(page) {
  const frame = page.frameLocator('[title="Embedded keyboard controls"]');
  for (const [groupRole, groupName, itemRole, itemPrefix, selectedAttribute] of [
    ['tablist', 'Embedded tabs', 'tab', 'Frame tab', 'aria-selected'],
    ['radiogroup', 'Embedded choices', 'radio', 'Frame choice', 'aria-checked'],
    ['radiogroup', 'Embedded languages', 'radio', 'Frame language', 'aria-checked'],
    ['radiogroup', 'Embedded text sizes', 'radio', 'Frame size', 'aria-checked']
  ]) {
    const group = frame.getByRole(groupRole, { name: groupName, exact: true });
    const first = group.getByRole(itemRole, { name: `${itemPrefix} A`, exact: true });
    const second = group.getByRole(itemRole, { name: `${itemPrefix} B`, exact: true });
    const third = group.getByRole(itemRole, { name: `${itemPrefix} C`, exact: true });
    assert.equal(await second.getAttribute(selectedAttribute), 'true');
    assert.equal(await third.evaluate((element) => element instanceof element.ownerDocument.defaultView.HTMLElement), false, 'The fixture must exercise adopted controls.');
    await third.focus();
    for (const composing of [{ isComposing: true }, { keyCode: 229 }]) {
      for (const key of ['ArrowLeft', 'ArrowRight', 'Home', 'End']) {
        const prevented = await third.evaluate((element, options) => {
          const event = new KeyboardEvent('keydown', { ...options, bubbles: true, cancelable: true });
          element.dispatchEvent(event);
          return event.defaultPrevented;
        }, { key, ...composing });
        assert.equal(prevented, false, 'Composition keys must remain available to the IME.');
        assert.equal(await third.evaluate((element) => element.ownerDocument.activeElement === element), true);
        assert.equal(await second.getAttribute(selectedAttribute), 'true', 'Composition must not change selection.');
      }
    }
    await third.evaluate((element) => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true });
      event.preventDefault();
      element.dispatchEvent(event);
    });
    assert.equal(await third.evaluate((element) => element.ownerDocument.activeElement === element), true,
      'Already handled keyboard events must not move focus or select another control.');
    assert.equal(await second.getAttribute(selectedAttribute), 'true');
    await page.keyboard.press('ArrowLeft');
    assert.equal(await second.getAttribute(selectedAttribute), 'true', 'Movement must start at the focused control rather than the selected fallback.');
    assert.equal(await second.evaluate((element) => element.ownerDocument.activeElement === element), true);
    await page.keyboard.press('ArrowRight');
    assert.equal(await third.getAttribute(selectedAttribute), 'true');
    await page.keyboard.press('ArrowRight');
    assert.equal(await first.getAttribute(selectedAttribute), 'true', 'Repeated movement must wrap using the actual focus target.');
    await group.evaluate((element) => { element.style.direction = 'rtl'; });
    await page.keyboard.press('ArrowRight');
    assert.equal(await third.getAttribute(selectedAttribute), 'true', 'Adopted controls must preserve RTL movement.');
    await group.evaluate((element) => { element.style.direction = ''; });
  }
}

import assert from 'node:assert/strict';

async function assertCompositionEscapePreserves(target, isOpen) {
  for (const composing of [{ isComposing: true }, { keyCode: 229 }]) {
    const prevented = await target.evaluate((element, composing) => {
      const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true, cancelable: true, ...composing });
      element.dispatchEvent(event);
      return event.defaultPrevented;
    }, composing);
    assert.equal(prevented, false, 'IME Escape must remain available to the text editor.');
    assert.equal(await isOpen(), true, 'IME Escape must preserve the current overlay.');
  }
}

export async function verifyImeOverlayContracts(page) {
  for (const [triggerId, name] of [
    ['dialog-trigger', 'Review changes'],
    ['sheet-trigger', 'Release details'],
    ['term-sheet-trigger', 'Browser term']
  ]) {
    await page.getByTestId(triggerId).click();
    const panel = page.getByRole('dialog', { name, exact: true });
    await panel.evaluate((element) => {
      const input = document.createElement('input');
      input.dataset.testid = 'ime-overlay-input';
      element.append(input);
      input.focus();
    });
    const input = page.getByTestId('ime-overlay-input');
    await assertCompositionEscapePreserves(input, async () => (await panel.count()) === 1);
    assert.equal(await input.evaluate((element) => document.activeElement === element), true);
    await page.keyboard.press('Escape');
    await panel.waitFor({ state: 'detached' });
  }

  for (const label of ['Reset combo', 'Shadow owner']) {
    const input = page.getByRole('combobox', { name: label, exact: true });
    await input.focus();
    await assertCompositionEscapePreserves(input, async () => (await input.getAttribute('aria-expanded')) === 'true');
    await page.keyboard.press('Escape');
    assert.equal(await input.getAttribute('aria-expanded'), 'false', 'Escape after composition must still close the list.');
  }
}

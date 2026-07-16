import assert from 'node:assert/strict';

export async function verifyFoundationAndFormContracts(page) {
  const labelledSection = page.getByRole('region', { name: 'Release summary' });
  assert.equal(await labelledSection.count(), 1, 'A labelled section Card must expose one named region.');
  assert.equal(await labelledSection.getAttribute('tabindex'), null, 'Card itself must stay out of the tab order.');
  assert.equal(
    await labelledSection.evaluate((element) => getComputedStyle(element).cursor),
    'auto',
    'Hover styling must not advertise a clickable Card cursor.'
  );

  const labelledDiv = page.getByRole('region', { name: 'Deployment status' });
  assert.equal(await labelledDiv.count(), 1, 'A labelled div Card must expose one explicit region.');

  await page.keyboard.press('Tab');
  const focusedTestId = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  assert.equal(focusedTestId, 'card-link', 'The first keyboard stop must be the explicit link inside Card.');

  const tooltipTrigger = page.getByTestId('tooltip-trigger');
  const tooltip = page.getByRole('tooltip', { name: 'Keyboard help', exact: true });
  await tooltipTrigger.focus();
  assert.equal(await tooltipTrigger.getAttribute('aria-describedby'), 'browser-tooltip');
  assert.equal(await tooltip.evaluate((element) => getComputedStyle(element).opacity), '1');
  await page.keyboard.press('Escape');
  assert.equal(await tooltip.evaluate((element) => getComputedStyle(element).opacity), '0');
  assert.equal(
    await tooltipTrigger.evaluate((element) => document.activeElement === element),
    true,
    'Escape dismissal must preserve focus on the Tooltip trigger.'
  );

  const tabs = page.getByRole('tablist', { name: 'Release views' }).getByRole('tab');
  const tabIds = await tabs.evaluateAll((elements) => elements.map((element) => element.id));
  const controlledPanelIds = await tabs.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('aria-controls'))
  );
  assert.equal(new Set(tabIds).size, 2, 'Distinct logical tab ids must remain distinct DOM ids.');
  assert.equal(new Set(controlledPanelIds).size, 2, 'Distinct tabs must retain distinct aria-controls targets.');
  const tabPanels = page.locator('.zdp-tabs__panel');
  assert.equal(await tabPanels.count(), 2, 'Every tab aria-controls target must remain in the DOM.');
  assert.deepEqual(
    new Set(await tabPanels.evaluateAll((elements) => elements.map((element) => element.id))),
    new Set(controlledPanelIds),
    'Every tab must reference an existing panel.'
  );
  assert.equal(await page.getByRole('tabpanel').getAttribute('id'), controlledPanelIds[0]);
  assert.equal(await tabPanels.nth(1).getAttribute('hidden'), '', 'Inactive tab panels must be hidden.');
  await tabs.nth(0).focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await tabs.nth(1).getAttribute('aria-selected'), 'true');
  assert.equal(await page.getByRole('tabpanel').getAttribute('id'), controlledPanelIds[1]);

  const disclosureTrigger = page.getByRole('button', { name: 'Browser details' });
  assert.equal(await disclosureTrigger.getAttribute('aria-controls'), null);
  await disclosureTrigger.click();
  const disclosurePanelId = await disclosureTrigger.getAttribute('aria-controls');
  assert.ok(disclosurePanelId, 'An open Disclosure must reference its rendered panel.');
  assert.equal(await page.locator(`[id="${disclosurePanelId}"]`).count(), 1);
  await disclosureTrigger.click();
  assert.equal(await disclosureTrigger.getAttribute('aria-controls'), null);

  const combobox = page.getByRole('combobox', { name: 'Owner', exact: true });
  await combobox.focus();
  assert.equal(await page.getByRole('listbox', { name: 'Owner list' }).count(), 1);
  for (const legacyKeyCode of [null, 229]) {
    const dispatchResult = await combobox.evaluate((element, keyCode) => {
      const event = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        isComposing: keyCode === null,
        key: 'Enter'
      });
      if (keyCode !== null) {
        Object.defineProperty(event, 'keyCode', { value: keyCode });
      }
      return element.dispatchEvent(event);
    }, legacyKeyCode);
    assert.equal(dispatchResult, true, 'IME composition keys must not be consumed as option selection.');
  }
  assert.equal(await page.locator('input[type="hidden"][name="owner"]').inputValue(), '');
  assert.equal(await page.getByTestId('combobox-selection-count').textContent(), '0');
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('listbox', { name: 'Owner list' }).count(), 0);
  await page.keyboard.press('ArrowDown');
  assert.match(
    (await combobox.getAttribute('aria-activedescendant')) ?? '',
    /-option-security$/,
    'The first ArrowDown from a closed Combobox must activate the first enabled option.'
  );
  await page.keyboard.press('Escape');

  const requiredCombobox = page.getByRole('combobox', { name: 'Required owner', exact: true });
  assert.equal(await requiredCombobox.evaluate((element) => element.checkValidity()), false);
  await requiredCombobox.fill('Unlisted owner');
  assert.equal(await page.locator('input[type="hidden"][name="required-owner"]').inputValue(), '');
  assert.equal(await requiredCombobox.evaluate((element) => element.validationMessage), 'Choose an owner');
  await page.keyboard.press('Escape');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('input[type="hidden"][name="required-owner"]').inputValue(), 'security');
  assert.equal(await requiredCombobox.evaluate((element) => element.checkValidity()), true);
  await requiredCombobox.fill('Edited selection');
  assert.equal(await page.locator('input[type="hidden"][name="required-owner"]').inputValue(), '');
  assert.equal(await page.getByTestId('required-combobox-selection-count').textContent(), '2');
  await page.keyboard.press('Escape');

  const confirmAction = page.getByRole('button', { name: /Confirm browser action/ });
  await confirmAction.evaluate((element) => {
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter' }));
  });
  await page.waitForTimeout(80);
  await page.getByTestId('disable-confirm-action').click();
  await page.waitForTimeout(650);
  assert.equal(await page.getByTestId('confirm-action-count').textContent(), '0');
  assert.equal(await confirmAction.getAttribute('data-active'), null);
  assert.match((await confirmAction.getAttribute('style')) ?? '', /progress:\s*0(?:;|$)/);

  const quietToast = page.getByTestId('toast-live-off').locator('.zdp-toast');
  assert.equal(await quietToast.getAttribute('aria-live'), 'off');
  assert.equal(await quietToast.getAttribute('aria-atomic'), null);

  const statusToastIdRefs = await page.getByTestId('status-toast-id-fixture').locator('.zdp-toast').evaluateAll(
    (elements) =>
      elements.flatMap((element) => [element.getAttribute('aria-labelledby'), element.getAttribute('aria-describedby')])
  );
  assert.equal(new Set(statusToastIdRefs).size, statusToastIdRefs.length, 'StatusToast IDREFs must be instance-unique.');
  for (const idRef of statusToastIdRefs) {
    assert.ok(idRef && !/\s/.test(idRef), 'StatusToast IDREFs must be valid single DOM ids.');
    assert.equal(await page.locator(`[id="${idRef}"]`).count(), 1, `StatusToast target ${idRef} must exist once.`);
  }
}

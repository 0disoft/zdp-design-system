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

  const expectedConfirmActionError = 'Expected ConfirmAction callback failure.';
  const throwingConfirmAction = page.locator('#throwing-confirm-action');
  await page.evaluate((expectedMessage) => {
    window.__zdpConfirmActionError = null;
    window.addEventListener(
      'error',
      (event) => {
        const message = event.error instanceof Error ? event.error.message : event.message;

        if (message !== expectedMessage) {
          return;
        }

        event.preventDefault();
        window.__zdpConfirmActionError = message;
      },
      { once: true }
    );
  }, expectedConfirmActionError);
  await throwingConfirmAction.evaluate((element) => {
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter' }));
  });
  await page.waitForFunction(
    (expectedMessage) => window.__zdpConfirmActionError === expectedMessage,
    expectedConfirmActionError
  );
  await page.waitForFunction(() => {
    const button = document.querySelector('#throwing-confirm-action');
    return (
      button instanceof HTMLButtonElement &&
      !button.hasAttribute('data-active') &&
      !button.hasAttribute('data-confirmed') &&
      button.style.getPropertyValue('--zdp-confirm-action-progress').trim() === '0'
    );
  });
  assert.equal(await throwingConfirmAction.getAttribute('data-active'), null);
  assert.equal(await throwingConfirmAction.getAttribute('data-confirmed'), null);
  assert.match((await throwingConfirmAction.getAttribute('style')) ?? '', /progress:\s*0(?:;|$)/);

  const splitPaneFixture = page.getByTestId('split-pane-fixture');
  const splitPane = splitPaneFixture.locator('#browser-split-pane');
  const separator = page.getByRole('separator', { name: 'Navigation width' });
  const controlledPanelId = await separator.getAttribute('aria-controls');
  assert.ok(controlledPanelId, 'The split pane separator must identify its primary panel.');
  assert.equal(await page.locator(`[id="${controlledPanelId}"]`).count(), 1);
  assert.equal(await separator.getAttribute('aria-orientation'), 'vertical');
  assert.equal(await separator.getAttribute('aria-valuemin'), '220');
  assert.equal(await separator.getAttribute('aria-valuemax'), '480');
  assert.equal(await separator.getAttribute('aria-valuenow'), '280');
  assert.equal(await separator.getAttribute('aria-valuetext'), '280 pixels');
  assert.ok((await separator.boundingBox()).width >= 24, 'The splitter hit target must be at least 24 CSS pixels wide.');

  await separator.focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await separator.getAttribute('aria-valuenow'), '288');
  await page.keyboard.press('Shift+ArrowRight');
  assert.equal(await separator.getAttribute('aria-valuenow'), '320');
  await page.keyboard.press('Home');
  assert.equal(await separator.getAttribute('aria-valuenow'), '220');
  await page.keyboard.press('End');
  assert.equal(await separator.getAttribute('aria-valuenow'), '480');

  await page.getByTestId('split-pane-toggle-direction').click();
  await separator.focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowLeft');
  assert.equal(await separator.getAttribute('aria-valuenow'), '228', 'ArrowLeft must increase the primary pane in RTL.');
  await page.getByTestId('split-pane-toggle-direction').click();

  const separatorBounds = await separator.boundingBox();
  assert.ok(separatorBounds, 'The split pane separator must have measurable browser geometry.');
  await page.mouse.move(separatorBounds.x + separatorBounds.width / 2, separatorBounds.y + separatorBounds.height / 2);
  await page.mouse.down();
  assert.equal(
    await page.locator('html').evaluate((element) => element.classList.contains('zdp-user-select-dragging')),
    true,
    'Text selection suppression must start with the active drag only.'
  );
  await page.mouse.move(separatorBounds.x + separatorBounds.width / 2 + 72, separatorBounds.y + separatorBounds.height / 2);
  assert.ok(Number(await separator.getAttribute('aria-valuenow')) >= 296, 'Pointer movement must resize the primary pane.');
  await page.mouse.up();
  assert.equal(
    await page.locator('html').evaluate((element) => element.classList.contains('zdp-user-select-dragging')),
    false,
    'Text selection suppression must be removed after pointer release.'
  );

  const draggedSize = Number(await separator.getAttribute('aria-valuenow'));
  const clickBounds = await separator.boundingBox();
  assert.ok(clickBounds, 'The resized separator must retain measurable geometry.');
  await separator.click({ position: { x: clickBounds.width - 2, y: clickBounds.height / 2 } });
  const clickedSize = Number(await separator.getAttribute('aria-valuenow'));
  assert.equal(clickedSize, draggedSize + 8, 'A single pointer click on the end half must provide a non-drag resize step.');

  await page.getByTestId('split-pane-reset-state').click();
  assert.equal(await page.getByTestId('split-pane-size').textContent(), '220');
  await page.getByTestId('split-pane-restore-state').click();
  assert.equal(await page.getByTestId('split-pane-size').textContent(), String(clickedSize));
  await page.evaluate(() => localStorage.setItem('zdp:split-pane-size:v1:browser-fixture-navigation', '   '));
  await page.getByTestId('split-pane-restore-state').click();
  assert.equal(
    await page.getByTestId('split-pane-size').textContent(),
    '280',
    'Blank or corrupt persisted values must restore the configured default.'
  );
  assert.equal(await splitPane.getAttribute('data-zdp-resizable-split-pane-constrained'), null);

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

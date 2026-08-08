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

  const releaseStatus = page.getByRole('combobox', { name: 'Release status', exact: true });
  const selectPickerStyle = await releaseStatus.evaluate((element) => {
    const supportsCustomizableSelect = CSS.supports('appearance', 'base-select');
    const pickerStyle = getComputedStyle(element, '::picker-icon');
    const spacedOptionStyle = getComputedStyle(element.options[1]);
    const selectedOptionCheckmarkStyle = getComputedStyle(element.selectedOptions[0], '::checkmark');
    const selectStyle = getComputedStyle(element);
    return {
      supportsCustomizableSelect,
      appearance: selectStyle.appearance,
      paddingBlockStart: Number.parseFloat(selectStyle.paddingTop),
      paddingBlockEnd: Number.parseFloat(selectStyle.paddingBottom),
      paddingInlineEnd: Number.parseFloat(selectStyle.paddingInlineEnd),
      pickerMarginInlineEnd: Number.parseFloat(pickerStyle.marginInlineEnd),
      selectedOptionCheckmarkMarginInlineStart: Number.parseFloat(selectedOptionCheckmarkStyle.marginInlineStart),
      optionMarginBlockStart: Number.parseFloat(spacedOptionStyle.marginBlockStart),
      optionPaddingBlockStart: Number.parseFloat(spacedOptionStyle.paddingBlockStart),
      optionPaddingBlockEnd: Number.parseFloat(spacedOptionStyle.paddingBlockEnd),
      optionPaddingInlineStart: Number.parseFloat(spacedOptionStyle.paddingInlineStart),
      optionPaddingInlineEnd: Number.parseFloat(spacedOptionStyle.paddingInlineEnd)
    };
  });
  if (selectPickerStyle.supportsCustomizableSelect) {
    assert.equal(selectPickerStyle.appearance, 'base-select');
    assert.equal(
      selectPickerStyle.paddingBlockStart,
      selectPickerStyle.paddingBlockEnd,
      'The customizable native Select must use symmetric block padding for vertical centering.'
    );
    assert.ok(
      selectPickerStyle.paddingBlockStart >= 8,
      'The customizable native Select must retain enough block padding to center its value and picker icon.'
    );
    assert.equal(
      selectPickerStyle.paddingInlineEnd,
      8,
      'The native Select control must keep its picker icon within a balanced 8 CSS pixel inline-end inset.'
    );
    assert.equal(
      selectPickerStyle.pickerMarginInlineEnd,
      0,
      'The picker icon must not add a second inline-end margin beyond the Select control inset.'
    );
    assert.equal(
      selectPickerStyle.selectedOptionCheckmarkMarginInlineStart,
      4,
      'The selected option checkmark must keep 4 CSS pixels of logical inline-start clearance from the picker edge.'
    );
    assert.equal(
      selectPickerStyle.optionMarginBlockStart,
      2,
      'Adjacent customizable Select options must keep 2 CSS pixels of separation.'
    );
    assert.equal(
      selectPickerStyle.optionPaddingBlockStart,
      2,
      'Customizable Select options must add 2 CSS pixels of visible block-start breathing room.'
    );
    assert.equal(
      selectPickerStyle.optionPaddingBlockEnd,
      2,
      'Customizable Select options must add 2 CSS pixels of visible block-end breathing room.'
    );
    assert.equal(
      selectPickerStyle.optionPaddingInlineStart,
      2,
      'Customizable Select options must add 2 CSS pixels of inline-start breathing room.'
    );
    assert.equal(
      selectPickerStyle.optionPaddingInlineEnd,
      2,
      'Customizable Select options must add 2 CSS pixels of inline-end breathing room.'
    );
    const originalTheme = await page.locator('html').getAttribute('data-zdp-theme');
    for (const theme of ['light', 'dark']) {
      const selectedOptionVisuals = await releaseStatus.evaluate((element, selectedTheme) => {
        document.documentElement.setAttribute('data-zdp-theme', selectedTheme);
        const selectedOption = element.selectedOptions[0];
        const probe = document.createElement('span');
        probe.style.backgroundColor = 'var(--zdp-color-focus-surface)';
        probe.style.color = 'var(--zdp-color-focus-text)';
        document.body.append(probe);
        const visuals = {
          backgroundColor: getComputedStyle(selectedOption).backgroundColor,
          color: getComputedStyle(selectedOption).color,
          expectedBackgroundColor: getComputedStyle(probe).backgroundColor,
          expectedColor: getComputedStyle(probe).color
        };
        probe.remove();
        return visuals;
      }, theme);
      assert.equal(
        selectedOptionVisuals.backgroundColor,
        selectedOptionVisuals.expectedBackgroundColor,
        `The ${theme} native Select must use the themed focus surface instead of the browser selection color.`
      );
      assert.equal(
        selectedOptionVisuals.color,
        selectedOptionVisuals.expectedColor,
        `The ${theme} native Select must keep readable themed text on its selected option.`
      );
    }
    await page.locator('html').evaluate((element, theme) => {
      if (theme === null) element.removeAttribute('data-zdp-theme');
      else element.setAttribute('data-zdp-theme', theme);
    }, originalTheme);
  }
  await releaseStatus.selectOption('blocked');
  assert.equal(await releaseStatus.inputValue(), 'blocked', 'Picker icon styling must preserve native Select changes.');

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
  const confirmActionBox = await confirmAction.boundingBox();
  assert.ok(confirmActionBox);

  await page.mouse.move(confirmActionBox.x + confirmActionBox.width / 2, confirmActionBox.y + confirmActionBox.height / 2);
  await page.mouse.down({ button: 'right' });
  await page.waitForTimeout(650);
  await page.mouse.up({ button: 'right' });
  assert.equal(await page.getByTestId('confirm-action-count').textContent(), '0');
  assert.equal(await confirmAction.getAttribute('data-active'), null);

  await page.mouse.down();
  await confirmAction.dispatchEvent('lostpointercapture', { pointerId: 1 });
  await page.waitForTimeout(650);
  await page.mouse.up();
  assert.equal(await page.getByTestId('confirm-action-count').textContent(), '0');
  assert.equal(await confirmAction.getAttribute('data-active'), null);

  await confirmAction.evaluate((element) => {
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter' }));
    window.dispatchEvent(new Event('blur'));
  });
  await page.waitForTimeout(650);
  assert.equal(await page.getByTestId('confirm-action-count').textContent(), '0');
  assert.equal(await confirmAction.getAttribute('data-active'), null);

  await confirmAction.evaluate((element) => {
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter' }));
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(650);
  assert.equal(await page.getByTestId('confirm-action-count').textContent(), '0');
  assert.equal(await confirmAction.getAttribute('data-active'), null);

  await confirmAction.focus();
  await confirmAction.evaluate((element) => {
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter' }));
  });
  await page.getByTestId('disable-confirm-action').focus();
  await page.waitForTimeout(650);
  assert.equal(await page.getByTestId('confirm-action-count').textContent(), '0');
  assert.equal(await confirmAction.getAttribute('data-active'), null);

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

  const disabledShareLink = page.getByRole('link', { name: 'Disabled browser share' });
  const shareUrlBeforeClick = page.url();
  assert.equal(await disabledShareLink.getAttribute('aria-disabled'), 'true');
  assert.equal(await disabledShareLink.getAttribute('tabindex'), '-1');
  assert.equal(await disabledShareLink.getAttribute('href'), null);
  assert.equal(await disabledShareLink.getAttribute('aria-describedby'), null);
  await disabledShareLink.dispatchEvent('click');
  assert.equal(page.url(), shareUrlBeforeClick);
  assert.equal(await page.getByTestId('disabled-share-count').textContent(), '0');

  const splitPaneFixture = page.getByTestId('split-pane-fixture');
  const splitPane = splitPaneFixture.locator('#browser-split-pane');
  const separator = splitPaneFixture.getByRole('separator', { name: 'Navigation width', exact: true });
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

  let separatorBounds = await separator.boundingBox();
  assert.ok(separatorBounds, 'The split pane separator must have measurable browser geometry.');
  await page.mouse.move(separatorBounds.x + 2, separatorBounds.y + separatorBounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(separatorBounds.x + 6, separatorBounds.y + separatorBounds.height / 2);
  assert.equal(
    await separator.getAttribute('aria-valuenow'),
    '232',
    'Dragging 4 pixels from the start edge of the hit target must resize by exactly 4 pixels.'
  );
  await page.mouse.up();

  separatorBounds = await separator.boundingBox();
  assert.ok(separatorBounds, 'The split pane separator must remain measurable after start-edge drag.');
  await page.mouse.move(separatorBounds.x + separatorBounds.width - 2, separatorBounds.y + separatorBounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(separatorBounds.x + separatorBounds.width - 6, separatorBounds.y + separatorBounds.height / 2);
  assert.equal(
    await separator.getAttribute('aria-valuenow'),
    '228',
    'Dragging 4 pixels from the end edge of the hit target must resize by exactly 4 pixels.'
  );
  await page.mouse.up();

  separatorBounds = await separator.boundingBox();
  assert.ok(separatorBounds, 'The split pane separator must retain measurable geometry after edge drags.');
  await page.mouse.move(separatorBounds.x + separatorBounds.width / 2, separatorBounds.y + separatorBounds.height / 2);
  await page.mouse.down();
  assert.equal(
    await page.locator('html').evaluate((element) => element.classList.contains('zdp-user-select-dragging')),
    true,
    'Text selection suppression must start with the active drag only.'
  );
  await page.mouse.move(separatorBounds.x + separatorBounds.width / 2 + 72, separatorBounds.y + separatorBounds.height / 2);
  assert.equal(await separator.getAttribute('aria-valuenow'), '300', 'Pointer movement must apply its delta to the drag-start size.');
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

  const staticSplitPane = page.locator('#browser-static-split-pane');
  const staticSeparator = page.locator('#browser-static-split-pane-separator');
  assert.equal(
    await page
      .getByTestId('static-split-pane-fixture')
      .getByRole('separator', { name: 'Static navigation width', exact: true })
      .count(),
    1
  );
  assert.equal(await staticSplitPane.getAttribute('data-zdp-resizable-split-pane-orientation'), 'vertical');
  assert.equal(await staticSeparator.getAttribute('aria-controls'), await staticSplitPane.locator('nav').getAttribute('id'));
  assert.equal(await staticSeparator.getAttribute('aria-valuemin'), '220');
  assert.equal(await staticSeparator.getAttribute('aria-valuemax'), '480');
  assert.equal(await staticSeparator.getAttribute('aria-valuenow'), '280');
  await staticSeparator.focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await staticSeparator.getAttribute('aria-valuenow'), '288');
  assert.equal(await page.getByTestId('static-split-pane-size').textContent(), '288');
  await page.keyboard.press('Home');
  assert.equal(await staticSeparator.getAttribute('aria-valuenow'), '220');
  await page.getByTestId('static-split-pane-destroy').click();
  assert.equal(await staticSeparator.getAttribute('role'), null, 'Destroy must restore the separator role.');
  assert.equal(await staticSplitPane.locator('nav').getAttribute('id'), null, 'Destroy must remove its generated panel id.');
  assert.equal(
    await staticSplitPane.getAttribute('data-zdp-resizable-split-pane'),
    null,
    'Destroy must restore controller-owned root attributes.'
  );
  assert.equal(
    await staticSplitPane.evaluate((element) => element.classList.contains('zdp-resizable-split-pane')),
    false,
    'Destroy must restore controller-owned classes.'
  );

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

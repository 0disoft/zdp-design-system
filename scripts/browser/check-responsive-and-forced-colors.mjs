import assert from 'node:assert/strict';

export async function verifyResponsiveAndForcedColorContracts(page) {
  const initialViewport = page.viewportSize();
  assert.ok(initialViewport, 'The browser contract page must expose its initial viewport.');

  try {
    await verifyTableToolbarBreakpoint(page);
    await verifySheetSafeAreaGeometry(page);
    await verifyForcedColorStates(page);
  } finally {
    await page.evaluate(() => {
      const root = document.documentElement;
      root.style.removeProperty('--zdp-viewport-safe-inline-start');
      root.style.removeProperty('--zdp-viewport-safe-inline-end');
      root.style.removeProperty('--zdp-viewport-safe-block-start');
      root.style.removeProperty('--zdp-viewport-safe-block-end');
    });
    await page.emulateMedia({ forcedColors: 'none' });
    await page.setViewportSize(initialViewport);
  }
}

async function verifyTableToolbarBreakpoint(page) {
  const toolbar = page.getByRole('group', { name: 'Browser table tools' });
  const actions = toolbar.locator('.zdp-table-toolbar__actions');

  await page.setViewportSize({ width: 800, height: 900 });
  const wideGeometry = await measureToolbar(toolbar);
  assert.ok(
    wideGeometry.actionWidth < wideGeometry.toolbarWidth * 0.5,
    'TableToolbar actions must remain content-sized above the 48rem breakpoint.'
  );
  assert.equal(wideGeometry.justifyContent, 'flex-end');

  await page.setViewportSize({ width: 760, height: 900 });
  const narrowGeometry = await measureToolbar(toolbar);
  assert.ok(
    narrowGeometry.actionWidth > narrowGeometry.toolbarWidth * 0.9,
    'TableToolbar actions must occupy their own row below the 48rem breakpoint.'
  );
  assert.equal(narrowGeometry.justifyContent, 'flex-start');
  assert.equal(narrowGeometry.marginInlineStart, '0px');
}

async function measureToolbar(toolbar) {
  return toolbar.evaluate((element) => {
    const actionsElement = element.querySelector('.zdp-table-toolbar__actions');
    if (!(actionsElement instanceof HTMLElement)) {
      throw new Error('TableToolbar actions must be rendered for responsive measurement.');
    }
    const actionsStyle = getComputedStyle(actionsElement);

    return {
      actionWidth: actionsElement.getBoundingClientRect().width,
      toolbarWidth: element.getBoundingClientRect().width,
      justifyContent: actionsStyle.justifyContent,
      marginInlineStart: actionsStyle.marginInlineStart
    };
  });
}

async function verifySheetSafeAreaGeometry(page) {
  await page.setViewportSize({ width: 700, height: 900 });
  await page.evaluate(() => {
    const root = document.documentElement;
    root.style.setProperty('--zdp-viewport-safe-inline-start', '31px');
    root.style.setProperty('--zdp-viewport-safe-inline-end', '29px');
    root.style.setProperty('--zdp-viewport-safe-block-start', '23px');
    root.style.setProperty('--zdp-viewport-safe-block-end', '37px');
  });

  await page.getByTestId('sheet-trigger').click();
  const sheet = page.getByRole('dialog', { name: 'Release details' });
  const geometry = await sheet.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);

    return {
      bottom: rect.bottom,
      left: rect.left,
      paddingBottom: style.paddingBottom,
      paddingLeft: style.paddingLeft,
      paddingRight: style.paddingRight,
      right: rect.right,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth
    };
  });

  assert.equal(Math.round(geometry.left), 0, 'Mobile Sheet must reach the viewport inline start.');
  assert.equal(Math.round(geometry.right), geometry.viewportWidth, 'Mobile Sheet must reach the viewport inline end.');
  assert.equal(Math.round(geometry.bottom), geometry.viewportHeight, 'Mobile Sheet must stay anchored to the viewport bottom.');
  assert.equal(geometry.paddingLeft, '31px', 'Mobile Sheet must preserve inline-start safe-area padding.');
  assert.equal(geometry.paddingRight, '29px', 'Mobile Sheet must preserve inline-end safe-area padding.');
  assert.equal(geometry.paddingBottom, '37px', 'Mobile Sheet must preserve block-end safe-area padding.');

  await page.keyboard.press('Escape');
  assert.equal(await sheet.count(), 0);
}

async function verifyForcedColorStates(page) {
  await page.emulateMedia({ forcedColors: 'active' });

  const focusButton = page.getByRole('button', { name: 'Review contrast' });
  await focusButton.focus();
  const focusStyle = await focusButton.evaluate((element) => {
    const style = getComputedStyle(element);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
  });
  assert.equal(focusStyle.outlineStyle, 'solid', 'Forced-colors focus must use a visible solid outline.');
  assert.ok(Number.parseFloat(focusStyle.outlineWidth) >= 2, 'Forced-colors focus outline must remain at least 2px wide.');

  const disabledButton = page.getByRole('button', { name: 'Unavailable contrast action' });
  const disabledStyle = await disabledButton.evaluate((element) => {
    const style = getComputedStyle(element);
    return { borderColor: style.borderColor, color: style.color, opacity: style.opacity };
  });
  assert.equal(disabledStyle.opacity, '1', 'Forced-colors disabled controls must not rely on opacity alone.');
  assert.equal(
    disabledStyle.borderColor,
    disabledStyle.color,
    'Forced-colors disabled controls must expose the same system disabled color in text and border.'
  );

  const selectedOption = page.getByRole('radio', { name: 'Selected contrast' });
  const selectedStyle = await selectedOption.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      color: style.color,
      forcedColorAdjust: style.forcedColorAdjust
    };
  });
  assert.equal(selectedStyle.forcedColorAdjust, 'none');
  assert.notEqual(selectedStyle.backgroundColor, selectedStyle.color, 'Selected forced-color state must keep distinct fill and text colors.');
}

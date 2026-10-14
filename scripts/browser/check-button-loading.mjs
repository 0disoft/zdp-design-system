import assert from 'node:assert/strict';

export async function verifyButtonLoadingAppearance(page, root, buttons, setLoading) {
  const viewport = page.viewportSize();
  try {
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const theme of ['light', 'dark']) {
        await root.evaluate((element, theme) => element.setAttribute('data-zdp-theme', theme), theme);
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await setLoading(false);
        const before = await geometry(buttons);
        await setLoading(true);
        assert.deepEqual(await geometry(buttons), before, 'Busy buttons must preserve size and label.');
        assert.equal(await buttons.count(), 8, 'Exercise both sizes of all four button variants.');
        for (const button of await buttons.all()) {
          assert.equal(await button.isDisabled(), true);
          assert.equal(await button.getAttribute('aria-busy'), 'true');
          const spinner = button.locator('.zdp-button__spinner');
          assert.equal(await spinner.getAttribute('aria-hidden'), 'true');
          const style = await spinner.evaluate(element => {
            const spinner = getComputedStyle(element);
            const button = element.closest('button');
            const box = element.getBoundingClientRect();
            const bounds = button.getBoundingClientRect();
            return {
              animation: spinner.animationName,
              stroke: spinner.borderTopWidth,
              color: spinner.borderTopColor,
              text: getComputedStyle(button).color,
              opacity: getComputedStyle(button).opacity,
              cursor: getComputedStyle(button).cursor,
              inside: box.left >= bounds.left && box.right <= bounds.right && box.top >= bounds.top && box.bottom <= bounds.bottom
            };
          });
          assert.notEqual(style.animation, 'none');
          assert.equal(style.stroke, '2px');
          assert.equal(style.color, style.text, 'Loading marks must inherit readable button foregrounds.');
          assert.equal(style.opacity, '1', 'Loading must not dim a readable action as if unavailable.');
          assert.equal(style.cursor, 'progress');
          assert.equal(style.inside, true);
        }
        await page.emulateMedia({ reducedMotion: 'reduce' });
        assert.ok((await buttons.locator('.zdp-button__spinner').evaluateAll(elements =>
          elements.map(element => getComputedStyle(element).animationName))).every(name => name === 'none'));
        await setLoading(false);
        assert.ok((await buttons.locator('.zdp-button__spinner').evaluateAll(elements =>
          elements.map(element => getComputedStyle(element).visibility))).every(visibility => visibility === 'hidden'));
      }
    }
  } finally {
    await setLoading(false);
    await page.emulateMedia({ reducedMotion: null });
    if (viewport) await page.setViewportSize(viewport);
  }
}

async function geometry(buttons) {
  return buttons.evaluateAll(elements => elements.map(element => {
    const { width, height } = element.getBoundingClientRect();
    return { width, height, label: element.textContent.trim() };
  }));
}

export async function verifyButtonLoadingContracts(page) {
  const root = page.getByTestId('button-loading-fixture');
  const buttons = root.getByTestId('button-loading-variants').locator('button');
  const toggle = root.getByTestId('button-loading-toggle');
  const setLoading = async loading => {
    if ((await buttons.first().getAttribute('data-loading')) !== String(loading)) await toggle.click();
  };
  await verifyButtonLoadingAppearance(page, root, buttons, setLoading);
  assert.equal(await root.getByRole('button', { name: 'Unchanged action', exact: true }).getAttribute('data-loading'), null);
  const submit = root.getByRole('button', { name: 'Save form', exact: true });
  const input = root.getByRole('textbox', { name: 'Loading form value' });
  await input.fill('changed');
  await submit.focus();
  // Two activations in one task also exercise the pre-DOM-update guard.
  await submit.evaluate(element => { element.click(); element.click(); });
  assert.equal(await root.getByTestId('button-loading-submissions').textContent(), '1');
  assert.equal(await root.getByTestId('button-loading-clicks').textContent(), '1');
  await submit.evaluate(element => element.click());
  assert.equal(await submit.evaluate(element => element === document.activeElement), false, 'Busy native buttons leave keyboard focus.');
  const busyBox = await submit.boundingBox();
  await page.mouse.click(busyBox.x + busyBox.width / 2, busyBox.y + busyBox.height / 2);
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  await input.focus();
  await page.keyboard.press('Enter');
  await root.getByRole('button', { name: 'Reset form', exact: true }).evaluate(element => element.click());
  assert.equal(await input.inputValue(), 'changed');
  assert.equal(await root.getByTestId('button-loading-resets').textContent(), '0');
  assert.equal(await root.getByTestId('button-loading-submissions').textContent(), '1');
  assert.equal(await root.getByTestId('button-loading-clicks').textContent(), '1');
  const unavailable = root.getByRole('button', { name: 'Unavailable action', exact: true });
  assert.notEqual(await unavailable.evaluate(element => getComputedStyle(element).opacity), '1');
  await setLoading(false);
  assert.equal(await unavailable.isDisabled(), true);
  await submit.focus();
  await page.keyboard.press('Enter');
  assert.equal(await root.getByTestId('button-loading-submissions').textContent(), '2', 'A completed action must become usable again.');
  await setLoading(false);
  await root.getByRole('button', { name: 'Reset form', exact: true }).click();
  assert.equal(await root.getByTestId('button-loading-resets').textContent(), '1');
  assert.equal(await input.inputValue(), 'initial');
}

import assert from 'node:assert/strict';

export async function verifyButtonLoadingAppearance(page, root, buttons, setLoading, { icon = false } = {}) {
  const viewport = page.viewportSize();
  const spinnerSelector = icon ? '.zdp-icon-button__spinner' : '.zdp-button__spinner';
  try {
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const theme of ['light', 'dark']) {
        await root.evaluate((element, theme) => element.setAttribute('data-zdp-theme', theme), theme);
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await setLoading(false);
        const before = await geometry(buttons);
        if (!icon) {
          const idleLayout = await buttons.evaluateAll(elements => elements.map(element => {
            const spinner = element.querySelector('.zdp-button__spinner');
            const box = element.getBoundingClientRect();
            const range = document.createRange();
            range.selectNodeContents(element);
            const label = range.getBoundingClientRect();
            const baseline = element.cloneNode(true);
            baseline.querySelector('.zdp-button__spinner').remove();
            baseline.removeAttribute('data-loading');
            element.after(baseline);
            const baselineWidth = baseline.getBoundingClientRect().width;
            baseline.remove();
            return {
              display: getComputedStyle(spinner).display,
              centered: Math.abs((box.left + box.right) / 2 - (label.left + label.right) / 2) <= 1,
              normalWidth: Math.abs(box.width - baselineWidth) <= 1
            };
          }));
          assert.ok(idleLayout.every(layout => layout.display === 'none' && layout.centered && layout.normalWidth),
            'Idle loading-capable buttons must match ordinary button width with centered text and no reserved spinner gap.');
        }
        await setLoading(true);
        const busy = await geometry(buttons);
        if (icon) assert.deepEqual(busy, before, 'Icon buttons must preserve size and name.');
        else {
          assert.deepEqual(busy.map(({ width, ...rest }) => rest), before.map(({ width, ...rest }) => rest),
            'Busy text buttons must preserve height and label.');
          assert.ok(busy.every((state, index) => state.width >= before[index].width), 'Only visible loading feedback may add width.');
        }
        assert.equal(await buttons.count(), icon ? 4 : 8, 'Exercise both sizes of all action variants.');
        for (const button of await buttons.all()) {
          assert.equal(await button.isDisabled(), true);
          assert.equal(await button.getAttribute('aria-busy'), 'true');
          const spinner = button.locator(spinnerSelector);
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
          if (icon) {
            assert.equal(await button.locator('.zdp-icon-button__glyph').evaluate(element => getComputedStyle(element).visibility), 'hidden');
            assert.ok(await button.getAttribute('aria-label'), 'Loading icons retain their accessible name.');
          }
        }
        await page.emulateMedia({ reducedMotion: 'reduce' });
        assert.ok((await buttons.locator(spinnerSelector).evaluateAll(elements =>
          elements.map(element => getComputedStyle(element).animationName))).every(name => name === 'none'));
        await setLoading(false);
        const hidden = await buttons.locator(spinnerSelector).evaluateAll((elements, icon) =>
          elements.every(element => icon ? getComputedStyle(element).visibility === 'hidden' : getComputedStyle(element).display === 'none'), icon);
        assert.ok(hidden);
        assert.deepEqual(await geometry(buttons), before, 'Completion must restore the original button size and label.');
        if (icon) assert.ok((await buttons.locator('.zdp-icon-button__glyph').evaluateAll(elements =>
          elements.map(element => getComputedStyle(element).visibility))).every(visibility => visibility === 'visible'));
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
    return { width, height, label: element.textContent.trim(), name: element.getAttribute('aria-label'), title: element.getAttribute('title'), pressed: element.getAttribute('aria-pressed') };
  }));
}

export async function verifyButtonLoadingContracts(page, { icon = false } = {}) {
  const prefix = icon ? 'icon-button-loading' : 'button-loading';
  const root = page.getByTestId(`${prefix}-fixture`);
  const buttons = root.getByTestId(`${prefix}-variants`).locator('button');
  const toggle = root.getByTestId(`${prefix}-toggle`);
  const setLoading = async loading => {
    if ((await buttons.first().getAttribute('data-loading') === 'true') !== loading) await toggle.click();
  };
  await verifyButtonLoadingAppearance(page, root, buttons, setLoading, { icon });
  assert.equal(await root.getByRole('button', { name: 'Unchanged action', exact: true }).getAttribute('data-loading'), null);
  const submit = root.getByRole('button', { name: 'Save form', exact: true });
  const input = root.getByRole('textbox', { name: 'Loading form value' });
  await input.fill('changed');
  await submit.focus();
  // Two activations in one task also exercise the pre-DOM-update guard.
  await submit.evaluate(element => { element.click(); element.click(); });
  assert.equal(await root.getByTestId(`${prefix}-submissions`).textContent(), '1');
  assert.equal(await root.getByTestId(`${prefix}-clicks`).textContent(), '1');
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
  assert.equal(await root.getByTestId(`${prefix}-resets`).textContent(), '0');
  assert.equal(await root.getByTestId(`${prefix}-submissions`).textContent(), '1');
  assert.equal(await root.getByTestId(`${prefix}-clicks`).textContent(), '1');
  const unavailable = root.getByRole('button', { name: 'Unavailable action', exact: true });
  assert.notEqual(await unavailable.evaluate(element => getComputedStyle(element).opacity), '1');
  await setLoading(false);
  assert.equal(await unavailable.isDisabled(), true);
  await submit.focus();
  await page.keyboard.press('Enter');
  assert.equal(await root.getByTestId(`${prefix}-submissions`).textContent(), '2', 'A completed action must become usable again.');
  await setLoading(false);
  await root.getByRole('button', { name: 'Reset form', exact: true }).click();
  assert.equal(await root.getByTestId(`${prefix}-resets`).textContent(), '1');
  assert.equal(await input.inputValue(), 'initial');
}

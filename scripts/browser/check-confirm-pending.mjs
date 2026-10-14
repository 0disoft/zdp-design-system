import assert from 'node:assert/strict';

export async function verifyConfirmPendingAppearance(page, root, buttons, setPending) {
  const viewport = page.viewportSize();
  try {
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const theme of ['light', 'dark']) {
        await root.evaluate((element, theme) => element.setAttribute('data-zdp-theme', theme), theme);
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await setPending(false);
        const before = await buttons.evaluateAll(elements => elements.map(element => {
          const { width, height } = element.getBoundingClientRect();
          return { width, height, thumb: getComputedStyle(element.querySelector('.zdp-confirm-action__thumb')).backgroundColor };
        }));
        await setPending(true);
        assert.equal(await buttons.count(), 2, 'Exercise both primary and danger tones.');
        for (const [index, button] of (await buttons.all()).entries()) {
          assert.equal(await button.isDisabled(), true);
          assert.equal(await button.getAttribute('aria-busy'), 'true');
          assert.equal(await button.getAttribute('aria-disabled'), 'true');
          assert.equal(await button.getAttribute('data-active'), null);
          assert.equal(await button.getAttribute('data-confirmed'), null, 'Processing is separate from confirmed success.');
          const state = await button.evaluate(element => {
            const spinner = element.querySelector('.zdp-confirm-action__spinner');
            const thumb = element.querySelector('.zdp-confirm-action__thumb');
            const box = element.getBoundingClientRect();
            return {
              width: box.width, height: box.height, thumb: getComputedStyle(thumb).backgroundColor,
              fillWidth: element.querySelector('.zdp-confirm-action__fill').getBoundingClientRect().width,
              animation: getComputedStyle(spinner).animationName,
              stroke: getComputedStyle(spinner).borderTopWidth,
              color: getComputedStyle(spinner).borderTopColor, foreground: getComputedStyle(thumb).color,
              opacity: getComputedStyle(element).opacity, cursor: getComputedStyle(element).cursor,
              hint: element.querySelector('.zdp-confirm-action__hint').textContent
            };
          });
          assert.deepEqual({ width: state.width, height: state.height, thumb: state.thumb }, before[index]);
          assert.equal(state.fillWidth, 0, 'The confirmation fill must not imply request progress.');
          assert.notEqual(state.animation, 'none');
          assert.equal(state.stroke, '2px');
          assert.equal(state.color, state.foreground);
          assert.equal(state.opacity, '1');
          assert.equal(state.cursor, 'progress');
          assert.equal(state.hint, 'Wait for the result');
        }
        await page.emulateMedia({ reducedMotion: 'reduce' });
        assert.ok(await buttons.locator('.zdp-confirm-action__spinner').evaluateAll(elements =>
          elements.every(element => getComputedStyle(element).animationName === 'none')));
        await setPending(false);
        assert.ok(await buttons.evaluateAll(elements => elements.every(element => !element.disabled && !element.hasAttribute('aria-busy'))));
      }
    }
  } finally {
    await setPending(false);
    await page.emulateMedia({ reducedMotion: null });
    if (viewport) await page.setViewportSize(viewport);
  }
}

export async function verifyConfirmPendingContracts(page) {
  const root = page.getByTestId('confirm-pending-fixture');
  const buttons = root.getByTestId('confirm-pending-actions').locator('button');
  const button = buttons.first();
  const toggle = root.getByTestId('confirm-pending-toggle');
  const count = root.getByTestId('confirm-pending-count');
  const setPending = async pending => {
    if ((await button.getAttribute('data-pending') === 'true') !== pending) await toggle.evaluate(element => element.click());
  };
  await verifyConfirmPendingAppearance(page, root, buttons, setPending);
  await button.focus();
  await page.keyboard.down('Enter');
  await page.waitForFunction(() => document.querySelector('#pending-confirm-primary').hasAttribute('data-active'));
  await setPending(true);
  await page.keyboard.up('Enter');
  await page.waitForTimeout(700);
  assert.equal(await count.textContent(), '0', 'Pending during a hold must cancel its confirmation timer.');
  await setPending(false);
  assert.equal(await button.getAttribute('data-active'), null);
  await button.focus();
  await page.keyboard.down('Space');
  try {
    await page.waitForFunction(() => document.querySelector('[data-testid="confirm-pending-count"]').textContent === '1');
  } finally { await page.keyboard.up('Space'); }
  await page.waitForTimeout(1100);
  assert.equal(await button.getAttribute('data-pending'), 'true', 'Pending must outlive the old one-second confirmation reset.');
  const box = await button.boundingBox();
  await page.mouse.click(box.x + 8, box.y + box.height / 2);
  await button.evaluate(element => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    element.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 4, isPrimary: true, button: 0, bubbles: true }));
  });
  assert.equal(await button.getAttribute('data-active'), null);
  assert.equal(await count.textContent(), '1');
  await root.getByTestId('confirm-pending-disable').click();
  assert.notEqual(await buttons.last().evaluate(element => getComputedStyle(element).opacity), '1');
  await setPending(false);
  assert.equal(await buttons.last().isDisabled(), true, 'Clearing pending must preserve explicit disabled.');
  await root.getByTestId('confirm-pending-disable').click();
  // Recovery covers both successful and failed requests: the caller clears pending.
  await button.focus();
  await page.keyboard.down('Enter');
  try {
    await page.waitForFunction(() => document.querySelector('[data-testid="confirm-pending-count"]').textContent === '2');
  } finally { await page.keyboard.up('Enter'); }
  await setPending(false);
  assert.equal(await button.locator('.zdp-confirm-action__label').textContent(), 'Confirm primary');
}

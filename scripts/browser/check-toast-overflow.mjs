import assert from 'node:assert/strict';

export async function verifyToastTitleOverflowContracts(page) {
  const viewport = page.viewportSize();
  try {
    await page.setViewportSize({ width: 320, height: 480 });
    const fixture = page.getByTestId('toast-long-title');
    await fixture.waitFor();
    const toasts = await fixture.locator('.zdp-toast').all();
    assert.equal(toasts.length, 2, 'Both direct and StatusToast title variants must be exercised.');
    for (const toast of toasts) {
      const geometry = await toast.evaluate((element) => {
        const title = element.querySelector('strong');
        const titleRect = title.getBoundingClientRect();
        const closeRect = element.querySelector('button').getBoundingClientRect();
        return { width: element.clientWidth, content: element.scrollWidth, titleRight: titleRect.right, closeLeft: closeRect.left, titleHeight: titleRect.height, lineHeight: Number.parseFloat(getComputedStyle(title).lineHeight) };
      });
      assert.ok(geometry.content <= geometry.width, 'Long titles must not overflow their notification.');
      assert.ok(geometry.titleRight <= geometry.closeLeft, 'Long titles must not overlap the dismiss control.');
      assert.ok(geometry.titleHeight > geometry.lineHeight, 'Long titles must wrap across multiple lines.');
      const close = toast.getByRole('button');
      await close.focus();
      assert.equal(await close.evaluate((element) => document.activeElement === element), true);
      await close.click();
    }
  } finally {
    await page.setViewportSize(viewport);
  }
}

export async function verifyToastStackOverflowContracts(page) {
  const fixture = page.getByTestId('toast-overflow');
  const stack = fixture.getByRole('group', { name: 'Scrollable notifications', exact: true });
  const placementControl = fixture.getByRole('combobox', { name: 'Overflow toast placement', exact: true });
  const viewport = page.viewportSize();
  try {
    await page.setViewportSize({ width: 800, height: 480 });
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--zdp-viewport-safe-block-start', '29px');
      document.documentElement.style.setProperty('--zdp-viewport-safe-block-end', '37px');
    });
    for (const [placement, width] of [['top-start', 800], ['top-end', 800], ['bottom-start', 800], ['bottom-end', 800], ['bottom-end', 320]]) {
      await page.setViewportSize({ width, height: 480 });
      await fixture.getByTestId('reset').evaluate((element) => element.click());
      await placementControl.selectOption(placement);
      await stack.evaluate((element) => { element.scrollTop = 0; });
      const geometry = await stack.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, height: element.clientHeight, content: element.scrollHeight };
      });
      assert.ok(geometry.top >= 28 && geometry.bottom <= 444, 'Fixed notifications must stay inside both viewport safe areas.');
      assert.ok(geometry.content > geometry.height, 'The stack must retain every notification in a scrollable area.');
      await stack.hover();
      await page.mouse.wheel(0, 300);
      await page.waitForFunction(() => document.querySelector('[aria-label="Scrollable notifications"]').scrollTop > 0);
      const first = stack.getByRole('button', { name: 'Dismiss notification 1', exact: true });
      await first.focus();
      await first.click();
      assert.equal(await stack.getByRole('button').count(), 7, 'The first notification must remain dismissible.');
      const last = stack.getByRole('button', { name: 'Dismiss notification 8', exact: true });
      await last.focus();
      assert.ok(await stack.evaluate((element) => element.scrollTop > 0), 'Keyboard focus must scroll the last notification into view.');
      await last.click();
      assert.equal(await stack.getByRole('button').count(), 6, 'The last notification must remain dismissible.');
    }
    await placementControl.selectOption('inline');
    const inline = await stack.evaluate((element) => ({ position: getComputedStyle(element).position, maxHeight: getComputedStyle(element).maxHeight, height: element.clientHeight, content: element.scrollHeight }));
    assert.equal(inline.position, 'static');
    assert.equal(inline.maxHeight, 'none', 'Inline notifications must keep their document flow.');
    assert.ok(inline.content <= inline.height);
  } finally {
    await placementControl.selectOption('inline');
    await fixture.getByTestId('reset').evaluate((element) => element.click());
    await page.evaluate(() => {
      document.documentElement.style.removeProperty('--zdp-viewport-safe-block-start');
      document.documentElement.style.removeProperty('--zdp-viewport-safe-block-end');
    });
    await page.setViewportSize(viewport);
  }
}

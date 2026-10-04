import assert from 'node:assert/strict';

export async function verifyTooltipHoverContracts(page) {
  const originalViewport = page.viewportSize();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.evaluate(() => {
    let active = document.activeElement;
    while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
    active?.blur();
  });
  try {
    for (const placement of ['top', 'right', 'bottom', 'left']) {
      const trigger = page.getByTestId(`edge-tooltip-trigger-${placement}`);
      const tip = page.locator(`#edge-tooltip-${placement}`);
      await trigger.evaluate((element) => {
        Object.assign(element.closest('.zdp-tooltip').style, { position: 'fixed', left: '450px', top: '300px', right: 'auto', zIndex: '1000' });
      });
      try {
        await trigger.hover();
        await page.waitForFunction((id) => {
          const tip = document.getElementById(id);
          return tip.closest('.zdp-tooltip').dataset.visible === 'true' && getComputedStyle(tip).opacity === '1';
        }, `edge-tooltip-${placement}`);
        const triggerBox = await trigger.boundingBox();
        const tipBox = await tip.boundingBox();
        assert.ok(triggerBox && tipBox);
        const gap = placement === 'top'
          ? { x: triggerBox.x + triggerBox.width / 2, y: (tipBox.y + tipBox.height + triggerBox.y) / 2 }
          : placement === 'bottom'
            ? { x: triggerBox.x + triggerBox.width / 2, y: (triggerBox.y + triggerBox.height + tipBox.y) / 2 }
            : placement === 'left'
              ? { x: (tipBox.x + tipBox.width + triggerBox.x) / 2, y: triggerBox.y + triggerBox.height / 2 }
              : { x: (triggerBox.x + triggerBox.width + tipBox.x) / 2, y: triggerBox.y + triggerBox.height / 2 };
        await page.mouse.move(gap.x, gap.y);
        const gapState = await tip.evaluate((element, gap) => ({
          opacity: getComputedStyle(element).opacity,
          visible: element.closest('.zdp-tooltip').dataset.visible,
          dismissed: element.closest('.zdp-tooltip').dataset.dismissed,
          hit: document.elementFromPoint(gap.x, gap.y)?.outerHTML.slice(0, 180),
          rect: element.getBoundingClientRect().toJSON()
        }), gap);
        assert.equal(gapState.opacity, '1', `Tooltip must survive the ${placement} gap crossing: ${JSON.stringify({ triggerBox, tipBox, gap, gapState })}`);
        await page.mouse.move(tipBox.x + tipBox.width / 2, tipBox.y + tipBox.height / 2);
        await page.waitForTimeout(250);
        assert.equal(await tip.evaluate((element) => getComputedStyle(element).opacity), '1', 'Hovering the explanation must keep it visible.');
        assert.equal(await tip.evaluate((element) => getComputedStyle(element).pointerEvents), 'auto');
        await page.keyboard.press('Escape');
        assert.equal(await tip.evaluate((element) => getComputedStyle(element).opacity), '0');
        assert.equal(await tip.evaluate((element) => getComputedStyle(element).pointerEvents), 'none');
        await page.mouse.move(0, 0);
        await page.waitForTimeout(250);
        await trigger.hover();
        assert.equal(await tip.evaluate((element) => getComputedStyle(element).opacity), '1');
        await page.mouse.move(0, 0);
        await page.waitForTimeout(250);
        assert.equal(await tip.evaluate((element) => getComputedStyle(element).opacity), '0', 'Leaving both surfaces must hide the tooltip.');
      } finally {
        await trigger.evaluate((element) => element.closest('.zdp-tooltip').removeAttribute('style'));
      }
    }
  } finally {
    await page.setViewportSize(originalViewport);
  }
}

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
    const narrowTrigger = page.getByTestId('edge-tooltip-trigger-right');
    const narrowTip = page.locator('#edge-tooltip-right');
    await page.setViewportSize({ width: 390, height: 844 });
    await narrowTrigger.evaluate(element => Object.assign(element.closest('.zdp-tooltip').style,
      { position:'fixed', left:'240px', top:'300px', right:'auto', zIndex:'1000' }));
    try {
      await page.mouse.move(0,0);
      await page.waitForFunction(() => document.querySelector('#edge-tooltip-right').closest('.zdp-tooltip').dataset.visible === 'false');
      assert.equal(await narrowTip.boundingBox(),null,'hidden explanations must not contribute offscreen boxes');
      await narrowTrigger.focus();
      await page.waitForFunction(() => document.querySelector('#edge-tooltip-right').closest('.zdp-tooltip').dataset.visible === 'true');
      await page.waitForFunction(() => { const rect=document.querySelector('#edge-tooltip-right').getBoundingClientRect(); return rect.width>0 && rect.left>=0 && rect.right<=innerWidth; });
      await page.keyboard.press('Escape');
      assert.equal(await narrowTip.boundingBox(),null,'Escape must also remove the tooltip from layout');
      await narrowTrigger.evaluate(element => element.blur());
    } finally {
      await narrowTrigger.evaluate(element => element.closest('.zdp-tooltip').removeAttribute('style'));
      await page.setViewportSize({width:1280,height:800});
    }
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
    const clippedTrigger = page.getByTestId('edge-tooltip-trigger-bottom');
    const clippedTip = page.locator('#edge-tooltip-bottom');
    const previousStyle = await clippedTrigger.evaluate(element => {
      const root = element.closest('.zdp-tooltip');
      const previous = root.getAttribute('style');
      const frame = document.createElement('div');
      frame.dataset.testid = 'tooltip-clipping-frame';
      Object.assign(frame.style, { position: 'fixed', left: '24px', top: '100px', width: '300px', height: '200px', overflow: 'hidden', zIndex: '2000' });
      root.before(frame); frame.append(root);
      Object.assign(root.style, { position: 'absolute', right: '12px', bottom: '12px' });
      return previous;
    });
    try {
      for (const mode of [
        { transform: 'scale(.9)', contain: 'none' },
        { transform: 'none', contain: 'paint' }
      ]) {
        await page.getByTestId('tooltip-clipping-frame').evaluate((element, style) => Object.assign(element.style, style), mode);
        await clippedTrigger.focus();
        await page.waitForFunction(() => {
          const tip = document.querySelector('#edge-tooltip-bottom');
          const frame = document.querySelector('[data-testid="tooltip-clipping-frame"]');
          const rect = tip.getBoundingClientRect();
          const bounds = frame.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && rect.left >= bounds.left + 7 &&
            rect.right <= bounds.right - 7 && rect.top >= bounds.top + 7 && rect.bottom <= bounds.bottom - 7;
        });
        assert.equal(await clippedTip.getAttribute('data-side'), 'top', 'A constrained Tooltip must flip inside its containing block.');
        await page.keyboard.press('Escape');
        await clippedTrigger.evaluate(element => element.blur());
      }
    } finally {
      await clippedTrigger.evaluate((element, previous) => {
        const root = element.closest('.zdp-tooltip');
        const frame = root.parentElement;
        frame.before(root); frame.remove();
        if (previous === null) root.removeAttribute('style'); else root.setAttribute('style', previous);
      }, previousStyle);
    }
  } finally {
    await page.setViewportSize(originalViewport);
  }
}

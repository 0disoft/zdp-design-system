import assert from 'node:assert/strict';
import { verifyFloatingClippingContracts } from './check-floating-clipping.mjs';

export async function verifyPopoverEdgeContracts(page) {
  const originalViewport = page.viewportSize();
  const configure = detail => page.evaluate(detail => window.dispatchEvent(
    new CustomEvent('zdp-test-popover-geometry', { detail })), detail);
  const trigger = page.getByRole('button', { name: '모서리 설정', exact: true });
  const panel = page.getByRole('dialog', { name: '모서리 설정', exact: true });
  const waitInside = () => page.waitForFunction(() => {
    const panel = document.querySelector('[data-testid="edge-popover-anchor"] .zdp-popover__panel');
    if (!panel) return false;
    const rect = panel.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.left >= 7 && rect.top >= 7 &&
      rect.right <= innerWidth - 7 && rect.bottom <= innerHeight - 7;
  });
  try {
    await page.setViewportSize({ width: 1000, height: 800 });
    for (const direction of ['ltr', 'rtl']) {
      for (const placement of ['top', 'right', 'bottom', 'left']) {
        for (const align of ['start', 'center', 'end']) {
          await configure({ placement, align, direction, corner: 'center', count: 1 });
          await trigger.click();
          await waitInside();
          assert.equal(await panel.getAttribute('data-side'), placement, 'Keep the requested side when it fits');
          const geometry = await panel.evaluate(element => ({
            panel: element.getBoundingClientRect().toJSON(),
            trigger: element.closest('.zdp-popover').querySelector('.zdp-popover__trigger').getBoundingClientRect().toJSON()
          }));
          const horizontal = placement === 'top' || placement === 'bottom';
          const start = horizontal ? (direction === 'rtl' ? 'right' : 'left') : 'top';
          const end = horizontal ? (direction === 'rtl' ? 'left' : 'right') : 'bottom';
          const delta = align === 'center' ? (geometry.panel[start] + geometry.panel[end] - geometry.trigger[start] - geometry.trigger[end]) / 2
            : geometry.panel[align === 'start' ? start : end] - geometry.trigger[align === 'start' ? start : end];
          assert.ok(Math.abs(delta) < 1, `${placement}/${align}/${direction}: retain logical alignment`);
          const gap = placement === 'top' ? geometry.trigger.top - geometry.panel.bottom
            : placement === 'bottom' ? geometry.panel.top - geometry.trigger.bottom
            : placement === 'left' ? geometry.trigger.left - geometry.panel.right : geometry.panel.left - geometry.trigger.right;
          assert.ok(Math.abs(gap - 8) < 1, 'Use the ZDP spacing token');
          await page.keyboard.press('Escape');
        }
      }
    }
    await page.setViewportSize({ width: 320, height: 480 });
    for (const corner of ['top-left', 'top-right', 'bottom-left', 'bottom-right']) {
      for (const placement of ['top', 'right', 'bottom', 'left']) {
        await configure({ corner, placement, align: 'center', direction: 'ltr', count: 1 });
        await trigger.click();
        await waitInside();
        if ((corner.startsWith('top') && placement === 'top') || (corner.startsWith('bottom') && placement === 'bottom') ||
          (corner.endsWith('left') && placement === 'left') || (corner.endsWith('right') && placement === 'right')) {
          assert.notEqual(await panel.getAttribute('data-side'), placement, 'Flip when the requested side has no room');
        }
        await page.keyboard.press('Escape');
      }
    }
    await configure({ corner: 'bottom-right', placement: 'bottom', count: 40, align: 'end' });
    await trigger.click();
    await waitInside();
    assert.equal(await panel.evaluate(element => element.scrollHeight > element.clientHeight), true, 'Long content scrolls within available height');
    await panel.getByRole('button', { name: '적용', exact: true }).focus();
    await page.setViewportSize({ width: 240, height: 320 });
    await waitInside();
    assert.equal(await panel.getByRole('button', { name: '적용', exact: true }).evaluate(element => element === document.activeElement), true, 'Resizing preserves focus');
    await configure({ corner: 'top-left' });
    await waitInside();
    assert.equal(await panel.count(), 1, 'Anchor movement preserves the open panel');
    await page.keyboard.press('Escape');
    assert.equal(await trigger.evaluate(element => element === document.activeElement), true);
    await page.setViewportSize({ width: 600, height: 600 });
    await configure({ corner: 'bottom-right', placement: 'bottom', align: 'end', count: 40 });
    await verifyFloatingClippingContracts(page, { kind: 'popover', trigger, panel });
    await configure({ corner: 'top-left', placement: 'bottom', align: 'start', count: 1 });
    await page.getByTestId('edge-popover-anchor').evaluate(anchor => {
      const scroller = document.createElement('div');
      scroller.dataset.testid = 'popover-scroll-container';
      Object.assign(scroller.style, { position: 'fixed', left: '24px', top: '100px', width: '300px', height: '240px', overflow: 'auto' });
      const content = document.createElement('div');
      Object.assign(content.style, { position: 'relative', height: '800px' });
      anchor.before(scroller);
      scroller.append(content);
      content.append(anchor);
      anchor.className = 'edge-popover-anchor';
      Object.assign(anchor.style, { position: 'absolute', left: '12px', top: '200px' });
      scroller.scrollTop = 100;
    });
    await trigger.click();
    await waitInside();
    const beforeScroll = await panel.evaluate(element => element.getBoundingClientRect().top);
    await page.getByTestId('popover-scroll-container').evaluate(element => { element.scrollTop += 60; });
    await page.waitForFunction(before => {
      const panel = document.querySelector('[data-testid="edge-popover-anchor"] .zdp-popover__panel');
      return Math.abs(panel.getBoundingClientRect().top - (before - 60)) < 1;
    }, beforeScroll);
    await waitInside();
    await page.keyboard.press('Escape');
  } finally {
    await configure(null);
    await page.setViewportSize(originalViewport);
  }
}

import assert from 'node:assert/strict';

export async function verifyMenuGeometryContracts(page) {
  const originalViewport = page.viewportSize();
  let currentSettings = {};
  const configure = settings => {
    currentSettings = { ...currentSettings, ...settings };
    return page.evaluate(detail => window.dispatchEvent(
      new CustomEvent('zdp-test-menu-geometry', { detail })), settings);
  };
  const trigger = page.getByRole('button', { name: '모서리 메뉴', exact: true });
  const panel = page.getByRole('menu', { name: '모서리 메뉴', exact: true });
  const waitInside = async () => {
    try { await page.waitForFunction(() => {
      const panel = document.querySelector('[data-testid="edge-menu-anchor"] .zdp-menu__panel');
      if (!panel) return false;
      const rect = panel.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.left >= 7 && rect.top >= 7 &&
        rect.right <= innerWidth - 7 && rect.bottom <= innerHeight - 7;
    }); } catch (error) {
      const actual = await panel.evaluate(element => ({
        bounds: element.getBoundingClientRect().toJSON(),
        side: element.dataset.side,
        styles: element.getAttribute('style'),
        wrapper: element.parentElement.getAttribute('style'),
        viewport: { width: innerWidth, height: innerHeight }
      }));
      throw new Error(`Menu escaped viewport: ${JSON.stringify({ settings: currentSettings, actual })}`, { cause: error });
    }
  };
  try {
    await page.setViewportSize({ width: 1000, height: 800 });
    for (const direction of ['ltr', 'rtl']) {
      for (const placement of ['top', 'right', 'bottom', 'left']) {
        for (const align of ['start', 'center', 'end']) {
          await configure({ placement, align, direction, corner: 'center', count: 4 });
          await trigger.click();
          await waitInside();
          assert.equal(await panel.getAttribute('data-side'), placement, 'Keep the requested side when it fits');
          const geometry = await panel.evaluate(element => {
            const panel = element.getBoundingClientRect();
            const trigger = element.closest('.zdp-menu').querySelector('.zdp-menu__trigger').getBoundingClientRect();
            return { panel: panel.toJSON(), trigger: trigger.toJSON() };
          });
          const horizontal = placement === 'top' || placement === 'bottom';
          const start = horizontal ? (direction === 'rtl' ? 'right' : 'left') : 'top';
          const end = horizontal ? (direction === 'rtl' ? 'left' : 'right') : 'bottom';
          const delta = align === 'center' ? (geometry.panel[start] + geometry.panel[end] - geometry.trigger[start] - geometry.trigger[end]) / 2
            : geometry.panel[align === 'start' ? start : end] - geometry.trigger[align === 'start' ? start : end];
          assert.ok(Math.abs(delta) < 1, `${placement}/${align}/${direction}: retain logical alignment`);
          await page.keyboard.press('Escape');
        }
      }
    }
    await page.setViewportSize({ width: 320, height: 480 });
    for (const corner of ['top-left', 'top-right', 'bottom-left', 'bottom-right']) {
      for (const placement of ['top', 'right', 'bottom', 'left']) {
        await configure({ corner, placement, align: 'center', direction: 'ltr', count: 4 });
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
    await trigger.press('ArrowUp');
    await waitInside();
    assert.equal(await panel.evaluate(element => element.scrollHeight > element.clientHeight), true, 'Long menus scroll within available height');
    assert.equal(await panel.getByRole('menuitem').last().evaluate(element => element === document.activeElement), true);
    await page.waitForFunction(() => {
      const panel = document.querySelector('[data-testid="edge-menu-anchor"] .zdp-menu__panel');
      const last = panel.querySelector('[role="menuitem"]:last-child').getBoundingClientRect();
      const bounds = panel.getBoundingClientRect();
      return last.top >= bounds.top && last.bottom <= bounds.bottom;
    });
    await page.setViewportSize({ width: 240, height: 320 });
    await waitInside();
    // Keep an open Menu attached when its anchor moves, without adding public props.
    await configure({ corner: 'top-left' });
    await waitInside();
    assert.equal(await panel.count(), 1);
    await page.keyboard.press('Escape');
    assert.equal(await trigger.evaluate(element => element === document.activeElement), true);
    await page.setViewportSize({ width: 600, height: 600 });
    await configure({ corner: 'top-left', placement: 'bottom', align: 'start', count: 4 });
    await page.getByTestId('edge-menu-anchor').evaluate(anchor => {
      const scroller = document.createElement('div');
      scroller.dataset.testid = 'menu-scroll-container';
      Object.assign(scroller.style, { position: 'fixed', left: '24px', top: '100px', width: '300px', height: '240px', overflow: 'auto' });
      const content = document.createElement('div');
      Object.assign(content.style, { position: 'relative', height: '800px' });
      anchor.before(scroller);
      scroller.append(content);
      content.append(anchor);
      anchor.className = 'edge-menu-anchor';
      Object.assign(anchor.style, { position: 'absolute', left: '12px', top: '200px' });
      scroller.scrollTop = 100;
    });
    await trigger.click();
    await waitInside();
    const beforeScroll = await panel.evaluate(element => element.getBoundingClientRect().top);
    await page.getByTestId('menu-scroll-container').evaluate(element => { element.scrollTop += 60; });
    await page.waitForFunction(before => {
      const panel = document.querySelector('[data-testid="edge-menu-anchor"] .zdp-menu__panel');
      return Math.abs(panel.getBoundingClientRect().top - (before - 60)) < 1;
    }, beforeScroll);
    await waitInside();
    await page.keyboard.press('Escape');
  } finally {
    await configure(null);
    await page.setViewportSize(originalViewport);
  }
}

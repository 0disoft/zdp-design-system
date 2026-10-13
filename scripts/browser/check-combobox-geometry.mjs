import assert from 'node:assert/strict';

export async function verifyComboboxGeometryContracts(page) {
  const viewport = page.viewportSize();
  const configure = detail => page.evaluate(detail => window.dispatchEvent(new CustomEvent('zdp-test-combobox-geometry', { detail })), detail);
  const input = page.getByRole('combobox', { name: '모서리 담당 팀', exact: true });
  const panel = page.getByTestId('edge-combobox-anchor').locator('.zdp-combobox__panel');
  const waitInside = () => page.waitForFunction(() => {
    const panel = document.querySelector('[data-testid="edge-combobox-anchor"] .zdp-combobox__panel');
    const rect = panel?.getBoundingClientRect();
    return panel?.hasAttribute('data-zdp-positioned') && rect.width > 0 && rect.height > 0 &&
      rect.left >= 7 && rect.top >= 7 && rect.right <= innerWidth - 7 && rect.bottom <= innerHeight - 7;
  }).catch(async error => {
    console.error(await page.evaluate(() => {
      const element = document.querySelector('[data-testid="edge-combobox-anchor"] .zdp-combobox__panel');
      if (!element) return { panel: null };
      return ({
      rect: element.getBoundingClientRect().toJSON(), style: element.getAttribute('style'),
      css: { width: getComputedStyle(element).width, height: getComputedStyle(element).height, transform: getComputedStyle(element).transform },
      side: element.dataset.side, anchor: element.closest('form').className,
      viewport: { width: innerWidth, height: innerHeight }
    }); }));
    throw error;
  });
  try {
    await page.setViewportSize({ width: 320, height: 480 });
    for (const direction of ['ltr', 'rtl']) {
      for (const corner of ['top-left', 'top-right', 'bottom-left', 'bottom-right']) {
        await configure({ corner, direction, count: 4 });
        await input.focus();
        await input.press('Escape');
        await input.press('ArrowDown');
        await waitInside();
        assert.equal(await panel.getAttribute('data-side'), corner.startsWith('bottom') ? 'top' : 'bottom');
        const geometry = await panel.evaluate(element => ({
          panel: element.getBoundingClientRect().toJSON(),
          anchor: element.closest('.zdp-combobox').querySelector('.zdp-combobox__control').getBoundingClientRect().toJSON(),
          windowScroll: scrollY
        }));
        assert.ok(Math.abs(geometry.panel.width - geometry.anchor.width) < 1, 'Match the field width');
        assert.ok(Math.abs(geometry.panel.left - geometry.anchor.left) < 1, 'Preserve alignment in both directions');
        const gap = corner.startsWith('bottom') ? geometry.anchor.top - geometry.panel.bottom : geometry.panel.top - geometry.anchor.bottom;
        assert.ok(Math.abs(gap - 8) < 1, 'Retain the ZDP gap');
        assert.equal(await input.evaluate(element => element === document.activeElement), true);
        await input.press('ArrowDown');
        assert.equal(await input.getAttribute('aria-activedescendant'), await panel.getByRole('option', { name: '담당 팀 3', exact: true }).getAttribute('id'), 'Skip disabled options');
        await input.press('Escape');
        assert.equal(await page.evaluate(() => scrollY), geometry.windowScroll, 'Navigation must not scroll the page');
      }
    }
    await configure({ corner: 'bottom-right', count: 40, direction: 'ltr' });
    await input.press('ArrowDown');
    await waitInside();
    assert.equal(await panel.evaluate(element => element.scrollHeight > element.clientHeight), true);
    await input.press('End');
    const waitActiveVisible = () => page.waitForFunction(() => {
      const root = document.querySelector('[data-testid="edge-combobox-anchor"]');
      const panel = root.querySelector('.zdp-combobox__panel').getBoundingClientRect();
      const option = root.querySelector('[data-active="true"]').getBoundingClientRect();
      return option.top >= panel.top && option.bottom <= panel.bottom;
    });
    await waitActiveVisible();
    await page.setViewportSize({ width: 240, height: 320 });
    await waitInside();
    await waitActiveVisible();
    await configure({ corner: 'top-left' });
    await waitInside();
    await input.press('Enter');
    assert.equal(await input.inputValue(), '담당 팀 40');
    assert.equal(await input.evaluate(element => new FormData(element.form).get('team')), 'value-39');
    await input.fill('없는 팀');
    await waitInside();
    assert.equal(await panel.getByRole('status').textContent(), 'No results');
    assert.equal(await input.evaluate(element => new FormData(element.form).get('team')), '');
    await input.fill('담당 팀 3');
    await waitInside();
    await input.press('Escape');
    assert.equal(await panel.count(), 0);
    await input.fill('');
    await input.press('Escape');
    await page.setViewportSize({ width: 600, height: 600 });
    await configure({ corner: 'top-left', count: 4 });
    await page.getByTestId('edge-combobox-anchor').evaluate(anchor => {
      const scroller = document.createElement('div');
      scroller.dataset.testid = 'combobox-scroll-container';
      Object.assign(scroller.style, { position: 'fixed', left: '24px', top: '100px', width: '300px', height: '240px', overflow: 'auto' });
      const content = document.createElement('div');
      Object.assign(content.style, { position: 'relative', height: '800px' });
      anchor.before(scroller); scroller.append(content); content.append(anchor);
      anchor.className = 'edge-combobox-anchor';
      Object.assign(anchor.style, { position: 'absolute', left: '12px', top: '200px' });
      scroller.scrollTop = 100;
    });
    await input.press('ArrowDown');
    await waitInside();
    const before = await panel.evaluate(element => element.getBoundingClientRect().top);
    await page.getByTestId('combobox-scroll-container').evaluate(element => { element.scrollTop += 60; });
    await page.waitForFunction(before => Math.abs(document.querySelector('[data-testid="edge-combobox-anchor"] .zdp-combobox__panel').getBoundingClientRect().top - (before - 60)) < 1, before);
    await waitInside();
    await input.press('Escape');
  } finally { await configure(null); await page.setViewportSize(viewport); }
}

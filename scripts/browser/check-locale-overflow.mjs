import assert from 'node:assert/strict';

export async function verifyLocaleOverflowContracts(page) {
  const viewport = page.viewportSize();
  const fixture = page.getByTestId('locale-overflow');
  const component = fixture.getByRole('radiogroup', { name: 'Scrollable languages', exact: true });
  const selected = component.locator('[aria-checked="true"]');
  const assertFocusedVisible = async (button) => {
    const geometry = await button.evaluate((element) => {
      const group = element.closest('[role="radiogroup"]');
      const g = group.getBoundingClientRect();
      const b = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const bleed = parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset);
      return { focused: element.ownerDocument.activeElement === element, left: b.left - bleed, right: b.right + bleed,
        top: b.top - bleed, bottom: b.bottom + bleed, groupLeft: g.left, groupRight: g.right, groupTop: g.top, groupBottom: g.bottom };
    });
    assert.ok(geometry.focused);
    assert.ok(geometry.left >= geometry.groupLeft - 1 && geometry.right <= geometry.groupRight + 1, `Focused language and outline must remain horizontally visible: ${JSON.stringify(geometry)}`);
    assert.ok(geometry.top >= geometry.groupTop - 1 && geometry.bottom <= geometry.groupBottom + 1, 'Focus outline must remain vertically visible.');
  };
  try {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const dir of ['ltr', 'rtl']) {
      await fixture.evaluate((element, dir) => element.dir = dir, dir);
      for (const group of await fixture.getByRole('radiogroup').all()) {
        const contained = await group.evaluate((element) => ({
          width: element.clientWidth, content: element.scrollWidth, overflow: getComputedStyle(element).overflowX,
          right: element.getBoundingClientRect().right, containerRight: element.parentElement.getBoundingClientRect().right
        }));
        assert.equal(contained.overflow, 'auto');
        assert.ok(contained.content > contained.width);
        assert.ok(contained.right <= contained.containerRight + 1, 'Language groups must stay inside their container.');
      }
      await component.getByRole('radio', { name: 'EN', exact: true }).focus();
      await page.keyboard.press('Home');
      for (let index = 0; index < 8; index++) {
        await assertFocusedVisible(selected);
        if (index < 7) await page.keyboard.press(dir === 'ltr' ? 'ArrowRight' : 'ArrowLeft');
      }
      assert.equal(await selected.textContent(), 'RU');
      await page.keyboard.press('Home');
      await assertFocusedVisible(selected);
      assert.equal(await selected.textContent(), 'EN');
      const cssGroup = fixture.getByRole('radiogroup', { name: 'CSS scrollable languages', exact: true });
      await cssGroup.getByRole('radio', { name: 'RU', exact: true }).focus();
      await assertFocusedVisible(cssGroup.getByRole('radio', { name: 'RU', exact: true }));
    }
  } finally {
    await fixture.evaluate((element) => element.removeAttribute('dir'));
    await page.setViewportSize(viewport);
  }
}

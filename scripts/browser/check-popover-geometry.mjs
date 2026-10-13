import assert from 'node:assert/strict';
import { verifyPopoverEdgeContracts } from './check-popover-edges.mjs';

export async function verifyPopoverGeometryContracts(page) {
  const fixture = page.getByTestId('popover-geometry');
  for (const placement of ['top', 'right', 'bottom', 'left']) {
    for (const align of ['start', 'center', 'end']) {
      await fixture.getByTestId(`geometry-${placement}-${align}`).evaluate((element) => element.click());
      await fixture.getByTestId('geometry-trigger').click();
      await page.waitForFunction(({ placement, align }) => {
        const trigger = document.querySelector('[data-testid="popover-geometry"] .zdp-popover__trigger')?.getBoundingClientRect();
        const panel = document.querySelector('[data-testid="popover-geometry"] .zdp-popover__panel');
        const rect = panel?.getBoundingClientRect();
        if (!trigger || !rect) return false;
        const gap = placement === 'right' ? rect.left - trigger.right
          : placement === 'left' ? trigger.left - rect.right
          : placement === 'top' ? trigger.top - rect.bottom : rect.top - trigger.bottom;
        return panel?.dataset.side === placement && panel.dataset.align === align &&
          gap > 0;
      }, { placement, align });
      const { trigger, panel } = await fixture.evaluate((element) => ({
        trigger: element.querySelector('.zdp-popover').getBoundingClientRect().toJSON(),
        panel: element.querySelector('.zdp-popover__panel').getBoundingClientRect().toJSON()
      }));
      const label = `${placement}/${align}`;
      const gap = placement === 'right' ? panel.left - trigger.right
        : placement === 'left' ? trigger.left - panel.right
        : placement === 'top' ? trigger.top - panel.bottom : panel.top - trigger.bottom;
      assert.ok(gap > 0, `${label}: the panel must stay on the requested side without covering the trigger.`);
      const horizontal = placement === 'top' || placement === 'bottom';
      const start = horizontal ? 'left' : 'top';
      const end = horizontal ? 'right' : 'bottom';
      const difference = align === 'start' ? panel[start] - trigger[start]
        : align === 'end' ? panel[end] - trigger[end]
        : (panel[start] + panel[end] - trigger[start] - trigger[end]) / 2;
      assert.ok(Math.abs(difference) < 1, `${label}: align must apply along the perpendicular axis.`);
      await page.keyboard.press('Escape');
    }
  }
  for (const [testId, expectedRole] of [['geometry-role-group', 'group'], ['geometry-role-none', null]]) {
    await fixture.getByTestId(testId).click();
    await fixture.getByTestId('geometry-trigger').click();
    const panel = fixture.locator('.zdp-popover__panel');
    assert.equal(await panel.getAttribute('role'), expectedRole, 'Bits must preserve the ZDP role override.');
    assert.equal(await panel.getAttribute('aria-describedby'), 'geometry-description');
    await page.keyboard.press('Escape');
  }
  await verifyPopoverEdgeContracts(page);
}

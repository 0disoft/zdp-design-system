import assert from 'node:assert/strict';

export async function verifySplitPointerOwnership(page) {
  const pane = page.locator('#browser-split-pane');
  const separator = pane.getByRole('separator');
  await separator.scrollIntoViewIfNeeded();
  const box = await separator.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const session = await page.context().newCDPSession(page);
  try {
    await session.send('Emulation.setTouchEmulationEnabled', { enabled: true });
    await page.mouse.move(x, y);
    await page.mouse.down();
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ id: 1, x, y }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    assert.equal(await pane.evaluate((element) => element.classList.contains('zdp-resizable-split-pane--dragging')), true, 'Ending a simultaneous touch must not end the initiating mouse drag.');
    await page.mouse.up();
    assert.equal(await pane.evaluate((element) => element.classList.contains('zdp-resizable-split-pane--dragging')), false);
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('zdp-user-select-dragging')), false, 'Mixed input must release the document selection lock.');
    assert.notEqual(await page.evaluate(() => getComputedStyle(document.body).userSelect), 'none');
  } finally {
    await page.mouse.up();
    await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] }).catch(() => {});
    await session.send('Emulation.setTouchEmulationEnabled', { enabled: false });
    await session.detach();
  }
}

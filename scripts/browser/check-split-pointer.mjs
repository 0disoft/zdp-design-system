import assert from 'node:assert/strict';

export async function verifySplitPointerOwnership(page) {
  const finalPosition = await page.evaluate(async (rootPath) => {
    const { createZdpSplitPaneController } = await import(`/@fs/${rootPath}/src/lib/split-pane.ts`);
    const root = document.createElement('div');
    root.style.cssText = 'width: 800px; height: 100px;';
    const primary = document.createElement('div');
    const separator = document.createElement('div');
    root.append(primary, separator);
    document.body.append(root);
    // Synthetic events need capture stubs; geometry and listeners use the real DOM.
    separator.setPointerCapture = () => {};
    separator.hasPointerCapture = () => false;
    const commits = [];
    const controller = createZdpSplitPaneController({ root, primary, separator }, {
      size: 280, minSize: 100, maxSize: 600,
      onResizeCommit: (size) => commits.push(size)
    });
    try {
      for (const [type, clientX] of [['pointerdown', 10], ['pointermove', 50], ['pointerup', 90]]) {
        separator.dispatchEvent(new PointerEvent(type, { pointerId: 7, isPrimary: true, button: 0, clientX }));
      }
      return { size: controller.getSize(), commits };
    } finally {
      controller.destroy();
      root.remove();
    }
  }, process.cwd().replaceAll('\\', '/'));
  assert.deepEqual(finalPosition, { size: 360, commits: [360] }, 'Commit the release coordinate even when the final move has not been delivered.');
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

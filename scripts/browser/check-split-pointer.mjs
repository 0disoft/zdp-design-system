import assert from 'node:assert/strict';

export async function verifySplitCallbackFailures(page) {
  const results = await page.evaluate(async (rootPath) => {
    const { createZdpSplitPaneController } = await import(`/@fs/${rootPath}/src/lib/split-pane.ts`);
    const cases = [
      { phase: 'start', callback: 'getValueText' },
      ...['frame', 'release', 'capture-loss'].flatMap(phase =>
        ['getValueText', 'onResize'].map(callback => ({ phase, callback }))),
      { phase: 'release', callback: 'onResizeCommit' }
    ];
    const results = [];
    for (const scenario of cases) {
      const root = document.createElement('div');
      root.style.cssText = 'width: 800px; height: 100px;';
      const primary = document.createElement('div');
      const separator = document.createElement('div');
      root.append(primary, separator);
      document.body.append(root);
      let captured = null;
      separator.setPointerCapture = id => { captured = id; };
      separator.hasPointerCapture = id => captured === id;
      separator.releasePointerCapture = () => { captured = null; };
      const originalRequest = window.requestAnimationFrame;
      const originalCancel = window.cancelAnimationFrame;
      const frames = new Map();
      let frameId = 0;
      window.requestAnimationFrame = callback => { frames.set(++frameId, callback); return frameId; };
      window.cancelAnimationFrame = id => { frames.delete(id); };
      const failure = new Error(`split ${scenario.phase} ${scenario.callback}`);
      const errors = [];
      const handleError = event => { errors.push(event.error); event.preventDefault(); };
      window.addEventListener('error', handleError);
      let armed = false;
      const commits = [];
      const controller = createZdpSplitPaneController({ root, primary, separator }, {
        size: 280, minSize: 100, maxSize: 600,
        getValueText: size => {
          if (armed && scenario.callback === 'getValueText') throw failure;
          return `${size} pixels`;
        },
        onResize: () => { if (armed && scenario.callback === 'onResize') throw failure; },
        onResizeCommit: size => {
          if (armed && scenario.callback === 'onResizeCommit') throw failure;
          commits.push(size);
        }
      });
      const dispatch = (type, clientX) => separator.dispatchEvent(new PointerEvent(type,
        { pointerId: 7, isPrimary: true, button: 0, clientX }));
      try {
        armed = scenario.phase === 'start';
        dispatch('pointerdown', 10);
        armed = true;
        if (scenario.phase !== 'start') {
          dispatch('pointermove', 60);
          if (scenario.phase === 'frame') {
            for (const [id, callback] of frames) {
              frames.delete(id);
              try { callback(performance.now()); } catch (error) { errors.push(error); }
            }
          } else {
            dispatch(scenario.phase === 'release' ? 'pointerup' : 'lostpointercapture', 60);
          }
        }
        const afterFailure = {
          dragging: root.classList.contains('zdp-resizable-split-pane--dragging'),
          selectionLocked: document.documentElement.classList.contains('zdp-user-select-dragging'),
          captured, pendingFrames: frames.size, commits: [...commits],
          originalError: errors.length === 1 && errors[0] === failure
        };
        armed = false;
        dispatch('pointerdown', 10);
        dispatch('pointerup', 60);
        results.push({ ...scenario, ...afterFailure, recoveryCommits: commits.length });
      } finally {
        armed = false;
        controller.destroy();
        window.requestAnimationFrame = originalRequest;
        window.cancelAnimationFrame = originalCancel;
        window.removeEventListener('error', handleError);
        root.remove();
      }
    }
    return results;
  }, process.cwd().replaceAll('\\', '/'));
  for (const { phase, callback, ...result } of results) {
    assert.deepEqual(result, {
      dragging: false, selectionLocked: false, captured: null, pendingFrames: 0,
      commits: [], originalError: true, recoveryCommits: 1
    }, `A ${callback} failure during ${phase} must release the drag and allow another interaction.`);
  }
  console.log(`Split callback failure cleanup: ${results.length} scenarios passed.`);
}

export async function verifySplitReentrantCallbacks(page) {
  const results = await page.evaluate(async (rootPath) => {
    const { createZdpSplitPaneController } = await import(`/@fs/${rootPath}/src/lib/split-pane.ts`);
    const results = [];
    for (const mode of ['destroy', 'disable']) {
      for (const interaction of ['keyboard', 'release', 'capture-loss']) {
        const root = document.createElement('div');
        root.style.cssText = 'width: 800px; height: 100px;';
        const primary = document.createElement('div');
        const separator = document.createElement('div');
        root.append(primary, separator);
        document.body.append(root);
        separator.setPointerCapture = () => {};
        separator.hasPointerCapture = () => false;
        const commits = [];
        const controller = createZdpSplitPaneController({ root, primary, separator }, {
          size: 280, minSize: 100, maxSize: 600,
          onResize: () => mode === 'destroy' ? controller.destroy() : controller.update({ disabled: true }),
          onResizeCommit: (size) => commits.push(size)
        });
        try {
          if (interaction === 'keyboard') {
            separator.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
          } else {
            separator.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 7, isPrimary: true, button: 0, clientX: 10 }));
            if (interaction === 'capture-loss') separator.dispatchEvent(new PointerEvent('pointermove', { pointerId: 7, clientX: 60 }));
            separator.dispatchEvent(new PointerEvent(interaction === 'release' ? 'pointerup' : 'lostpointercapture',
              { pointerId: 7, clientX: 60 }));
          }
          results.push({ mode, interaction, commits, dragging: root.classList.contains('zdp-resizable-split-pane--dragging'),
            selectionLocked: document.documentElement.classList.contains('zdp-user-select-dragging') });
        } finally { controller.destroy(); root.remove(); }
      }
    }
    return results;
  }, process.cwd().replaceAll('\\', '/'));
  for (const result of results) {
    assert.deepEqual(result.commits, [], `A ${result.mode} callback must stop the ${result.interaction} commit.`);
    assert.equal(result.dragging, false);
    assert.equal(result.selectionLocked, false);
  }
}

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

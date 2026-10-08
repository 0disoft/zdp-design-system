import assert from 'node:assert/strict';

export async function verifyConfirmSlideThresholdContracts(page) {
  const button = page.locator('#repeat-confirm-action');
  const count = page.getByTestId('repeat-confirm-count');
  const previousCount = Number(await count.textContent());
  await button.scrollIntoViewIfNeeded();
  const box = await button.boundingBox();
  const x = box.x + 5;
  const y = box.y + box.height / 2;
  await page.evaluate(() => {
    window.__zdpConfirmRaf = window.requestAnimationFrame;
    window.__zdpConfirmTimeout = window.setTimeout;
    window.requestAnimationFrame = callback => window.__zdpConfirmRaf.call(window, now => callback(now + 570));
    window.setTimeout = (callback, delay, ...args) => window.__zdpConfirmTimeout.call(window, delay === 600 ? () => {} : callback, delay, ...args);
  });
  try {
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.waitForFunction(() => Number(document.querySelector('#repeat-confirm-action').style.getPropertyValue('--zdp-confirm-action-progress')) >= 0.92);
    await page.mouse.move(x + 1, y);
    assert.equal(Number(await count.textContent()), previousCount, 'Hold progress must not let a small pointer move confirm before the hold timer.');
    await page.mouse.move(x + box.width * 0.94, y);
    assert.equal(Number(await count.textContent()), previousCount + 1, 'A real slide past the threshold must still confirm.');
  } finally {
    await page.mouse.up();
    await page.evaluate(() => {
      window.requestAnimationFrame = window.__zdpConfirmRaf;
      window.setTimeout = window.__zdpConfirmTimeout;
      delete window.__zdpConfirmRaf;
      delete window.__zdpConfirmTimeout;
    });
  }
  await page.waitForFunction(() => !document.querySelector('#repeat-confirm-action').hasAttribute('data-confirmed'));
}

export async function verifyConfirmCompositionContracts(page) {
  const button = page.locator('#repeat-confirm-action');
  const count = page.getByTestId('repeat-confirm-count');
  const previousCount = await count.textContent();
  await button.focus();
  for (const modifier of ['altKey', 'ctrlKey', 'metaKey', 'shiftKey']) {
    for (const key of ['Enter', ' ']) {
      const prevented = await button.evaluate((element, { key, modifier }) => {
        const event = new KeyboardEvent('keydown', { key, [modifier]: true, bubbles: true, cancelable: true });
        element.dispatchEvent(event);
        return event.defaultPrevented;
      }, { key, modifier });
      assert.equal(prevented, false, 'Modified keys must remain available to shortcuts.');
      assert.equal(await button.getAttribute('data-active'), null, 'Modified keys must not start a confirmation hold.');
      const keyupPrevented = await button.evaluate((element, { key, modifier }) => {
        const event = new KeyboardEvent('keyup', { key, [modifier]: true, bubbles: true, cancelable: true });
        element.dispatchEvent(event);
        return event.defaultPrevented;
      }, { key, modifier });
      assert.equal(keyupPrevented, false, 'Modified keyup must remain available to shortcuts.');
      await button.evaluate((element, { key, modifier }) => {
        element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
        element.dispatchEvent(new KeyboardEvent('keyup', { key, [modifier]: true, bubbles: true, cancelable: true }));
      }, { key, modifier });
      assert.equal(await button.getAttribute('data-active'), null, 'Modified keyup must still cancel an ordinary hold.');
    }
  }
  await page.waitForTimeout(650);
  assert.equal(await count.textContent(), previousCount, 'Modified keys must not invoke the confirmation callback.');
  for (const composing of [{ isComposing: true }, { keyCode: 229 }]) {
    for (const key of ['Enter', ' ']) {
      const prevented = await button.evaluate((element, { key, composing }) => {
        const event = new KeyboardEvent('keydown', { key, ...composing, bubbles: true, cancelable: true });
        element.dispatchEvent(event);
        return event.defaultPrevented;
      }, { key, composing });
      assert.equal(prevented, false, 'Composition keydown must remain available to the IME.');
      assert.equal(await button.getAttribute('data-active'), null, 'Composition must not start a confirmation hold.');
      await page.waitForTimeout(650);
      assert.equal(await count.textContent(), previousCount, 'Composition must not invoke the confirmation callback.');
      const keyupPrevented = await button.evaluate((element, { key, composing }) => {
        const event = new KeyboardEvent('keyup', { key, ...composing, bubbles: true, cancelable: true });
        element.dispatchEvent(event);
        return event.defaultPrevented;
      }, { key, composing });
      assert.equal(keyupPrevented, false, 'Composition keyup must remain available to the IME.');
    }
  }
}

export async function verifyConfirmRepeatContracts(page) {
  const button = page.locator('#repeat-confirm-action');
  const count = page.getByTestId('repeat-confirm-count');

  for (const key of ['Enter', ' ']) {
    const previousCount = Number(await count.textContent());
    await button.focus();
    await page.keyboard.down(key);
    try {
      await page.waitForFunction(
        (expected) => document.querySelector('[data-testid="repeat-confirm-count"]').textContent === String(expected),
        previousCount + 1
      );
      await page.waitForFunction(() => !document.querySelector('#repeat-confirm-action').hasAttribute('data-confirmed'));
      await page.keyboard.down(key);
      assert.equal(await button.getAttribute('data-active'), null, 'A held key must not restart confirmation after reset.');
      await page.waitForTimeout(650);
      assert.equal(Number(await count.textContent()), previousCount + 1);
    } finally {
      await page.keyboard.up(key);
    }
  }
}

export async function verifyConfirmDurationContracts(page) {
  const button = page.locator('#invalid-duration-confirm-action');
  const count = page.getByTestId('invalid-duration-confirm-count');
  await button.focus();
  await page.keyboard.down('Enter');
  try {
    await page.waitForTimeout(700);
    assert.equal(await count.textContent(), '0', 'NaN must use the default hold duration instead of confirming immediately.');
    await page.waitForFunction(() => document.querySelector('[data-testid="invalid-duration-confirm-count"]').textContent === '1');
  } finally {
    await page.keyboard.up('Enter');
  }
  await page.waitForFunction(() => !document.querySelector('#invalid-duration-confirm-action').hasAttribute('data-confirmed'));
  for (const testId of ['confirm-duration-infinity', 'confirm-duration-overflow']) {
    await page.getByTestId(testId).click();
    await button.focus();
    await page.keyboard.down('Enter');
    try {
      await page.waitForTimeout(700);
      assert.equal(await count.textContent(), '1', 'Non-finite or overflowing delays must not bypass the hold.');
    } finally {
      await page.keyboard.up('Enter');
    }
    assert.equal(await button.getAttribute('data-active'), null, 'Releasing must still cancel the invalid-duration hold.');
  }
}

export async function verifyChangingConfirmDurationContracts(page) {
  const button = page.locator('#changing-duration-confirm-action');
  const count = page.getByTestId('changing-duration-confirm-count');
  await button.focus();
  await page.keyboard.down('Enter');
  try {
    await page.getByTestId('confirm-duration-longer').evaluate((element) => element.click());
    assert.equal(await button.getAttribute('data-active'), null, 'Increasing the duration must cancel the current hold.');
    await page.waitForTimeout(750);
    assert.equal(await count.textContent(), '0', 'The original shorter timer must not confirm after cancellation.');
  } finally { await page.keyboard.up('Enter'); }
  await page.keyboard.down('Enter');
  try {
    await page.waitForTimeout(700);
    assert.equal(await count.textContent(), '0', 'A new hold must use the longer duration.');
    await page.waitForFunction(() => document.querySelector('[data-testid="changing-duration-confirm-count"]').textContent === '1');
  } finally { await page.keyboard.up('Enter'); }
  await page.waitForFunction(() => !document.querySelector('#changing-duration-confirm-action').hasAttribute('data-confirmed'));
  await page.keyboard.down('Enter');
  try {
    await page.getByTestId('confirm-duration-shorter').evaluate((element) => element.click());
    assert.equal(await button.getAttribute('data-active'), null, 'Decreasing the duration must also cancel the current hold.');
    assert.equal(await button.evaluate((element) => element.style.getPropertyValue('--zdp-confirm-action-progress')), '0');
    await page.waitForTimeout(2100);
    assert.equal(await count.textContent(), '1', 'The cancelled longer timer must not fire.');
  } finally { await page.keyboard.up('Enter'); }
}

export async function verifyCopyLifecycleContracts(page) {
  const fixture = page.getByTestId('copy-lifecycle');
  const button = fixture.locator('.zdp-code-block__copy');
  await page.evaluate(() => {
    window.__zdpCopyDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    window.__zdpCopyRequests = [];
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: (text) => new Promise((resolve, reject) => window.__zdpCopyRequests.push({ text, resolve, reject })) }
    });
  });
  try {
    await button.click();
    await page.getByTestId('replace-copy-code').click();
    assert.equal(await fixture.locator('code').textContent(), 'beta');
    await page.evaluate(() => window.__zdpCopyRequests[0].resolve());
    assert.equal((await button.textContent()).trim(), 'Copy', 'Completion for replaced code must be ignored.');

    await button.click();
    await button.click();
    await page.evaluate(() => window.__zdpCopyRequests[2].reject(new Error('Copy rejected')));
    await page.waitForFunction(() => document.querySelector('[data-testid="copy-lifecycle"] .zdp-code-block__copy').textContent.trim() === 'Copy failed');
    await page.evaluate(() => window.__zdpCopyRequests[1].resolve());
    assert.equal((await button.textContent()).trim(), 'Copy failed', 'Older success must not replace the latest result.');

    await button.click();
    await page.evaluate(() => window.__zdpCopyRequests[3].resolve());
    await page.waitForFunction(() => document.querySelector('[data-testid="copy-lifecycle"] .zdp-code-block__copy').textContent.trim() === 'Copied');
    await page.getByTestId('replace-copy-code').click();
    assert.equal((await button.textContent()).trim(), 'Copy', 'Changing code must clear an existing copied status.');

    await button.click();
    await page.getByTestId('toggle-copy-mount').click();
    await page.evaluate(async () => {
      const originalTimeout = window.setTimeout;
      window.__zdpLateCopyTimers = 0;
      window.setTimeout = function (callback, delay, ...args) {
        if (delay === 1800) window.__zdpLateCopyTimers += 1;
        return originalTimeout.call(this, callback, delay, ...args);
      };
      try {
        window.__zdpCopyRequests[4].resolve();
        await Promise.resolve();
        await Promise.resolve();
      } finally {
        window.setTimeout = originalTimeout;
      }
    });
    assert.equal(await page.evaluate(() => window.__zdpLateCopyTimers), 0, 'Unmounted code blocks must not schedule feedback timers.');
    await page.getByTestId('toggle-copy-mount').click();
    assert.equal((await button.textContent()).trim(), 'Copy');
    assert.deepEqual(await page.evaluate(() => window.__zdpCopyRequests.map((request) => request.text)), ['alpha', 'beta', 'beta', 'beta', 'alpha']);
  } finally {
    await page.evaluate(() => {
      if (window.__zdpCopyDescriptor) {
        Object.defineProperty(navigator, 'clipboard', window.__zdpCopyDescriptor);
      } else {
        delete navigator.clipboard;
      }
      delete window.__zdpCopyDescriptor;
      delete window.__zdpCopyRequests;
      delete window.__zdpLateCopyTimers;
    });
  }
}

export async function verifyTouchConfirmContracts(page) {
  const button = page.locator('#repeat-confirm-action');
  const count = page.getByTestId('repeat-confirm-count');
  const previousCount = Number(await count.textContent());
  await button.scrollIntoViewIfNeeded();
  const box = await button.boundingBox();
  const first = { x: box.x + 5, y: box.y + box.height / 2, id: 1 };
  const second = { x: first.x + 10, y: first.y + 2, id: 2 };
  const session = await page.context().newCDPSession(page);
  try {
    await session.send('Emulation.setTouchEmulationEnabled', { enabled: true });
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [first] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [first, second] });
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove', touchPoints: [first, { ...second, x: first.x + box.width }]
    });
    assert.equal(await count.textContent(), String(previousCount), 'A second finger must not slide-confirm the first finger hold.');
    // Also exercise cancellation and capture-loss events from an unrelated pointer.
    await button.evaluate((element) => {
      for (const type of ['pointercancel', 'lostpointercapture']) {
        element.dispatchEvent(new PointerEvent(type, { pointerId: 999, bubbles: true }));
      }
    });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ ...second, x: first.x + box.width }] });
    assert.equal(await button.getAttribute('data-active'), 'true', 'Lifting the second finger must preserve the first finger hold.');
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove', touchPoints: [{ ...first, x: first.x + box.width }]
    });
    await page.waitForFunction((expected) => document.querySelector('[data-testid="repeat-confirm-count"]').textContent === String(expected), previousCount + 1);
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForFunction(() => !document.querySelector('#repeat-confirm-action').hasAttribute('data-confirmed'));
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [first] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    assert.equal(await button.getAttribute('data-active'), null, 'Lifting the initiating finger must cancel its hold.');
  } finally {
    await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] }).catch(() => {});
    await session.send('Emulation.setTouchEmulationEnabled', { enabled: false });
    await session.detach();
  }
}

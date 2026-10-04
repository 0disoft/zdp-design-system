import assert from 'node:assert/strict';

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

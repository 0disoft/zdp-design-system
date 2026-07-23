import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const port = Number.parseInt(process.argv[2] ?? '', 10);
assert.ok(Number.isInteger(port) && port > 0, 'Packed framework-neutral browser check requires a Vite port.');

const browser = await chromium.launch({
  channel: process.env.ZDP_BROWSER_CHANNEL ?? 'chrome',
  headless: true,
  timeout: 30_000
});

try {
  const page = await browser.newPage();
  const runtimeErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('requestfailed', (request) => {
    runtimeErrors.push(`${request.url()}: ${request.failure()?.errorText ?? 'request failed'}`);
  });
  page.setDefaultTimeout(10_000);
  page.setDefaultNavigationTimeout(30_000);

  await page.goto(`http://127.0.0.1:${port}`, {
    timeout: 30_000,
    waitUntil: 'networkidle'
  });
  await page.waitForFunction(() => window.__zdpFrameworkNeutralDevResult !== undefined);

  assert.deepEqual(runtimeErrors, [], `Framework-neutral Vite dev runtime failed:\n${runtimeErrors.join('\n')}`);
  const result = await page.evaluate(() => window.__zdpFrameworkNeutralDevResult);
  assert.deepEqual(result, {
    clampedSize: 480,
    currentSize: 312,
    orientation: 'vertical',
    role: 'separator',
    storedSize: 312
  });

  console.log('Packed framework-neutral Vite dev browser check passed.');
} finally {
  await browser.close();
}

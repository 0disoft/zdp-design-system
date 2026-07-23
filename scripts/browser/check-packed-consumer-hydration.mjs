import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const packedModalKinds = ['dialog', 'sheet', 'term-sheet'];
const packedModalAccessibleNames = {
  dialog: 'Packed hydration dialog',
  sheet: 'Packed hydration sheet',
  'term-sheet': 'Packed hydration term sheet'
};
const packedModalCloseNames = {
  dialog: 'Close packed hydration dialog',
  sheet: 'Close packed hydration sheet',
  'term-sheet': 'Close packed hydration term sheet'
};
const port = parsePort(process.argv[2]);
let browser;

try {
  browser = await chromium.launch({
    channel: process.env.ZDP_BROWSER_CHANNEL ?? 'chrome',
    headless: true,
    timeout: 30_000
  });

  for (const kind of packedModalKinds) {
    await verifyPackedModalHydration(browser, port, kind);
  }

  console.log('Packed consumer modal hydration browser check passed.');
} finally {
  await browser?.close();
}

function parsePort(value) {
  const parsed = Number(value);
  assert.ok(Number.isInteger(parsed) && parsed > 0 && parsed <= 65_535, 'Packed modal browser check requires a valid port.');
  return parsed;
}

async function verifyPackedModalHydration(activeBrowser, targetPort, kind) {
  const page = await activeBrowser.newPage();
  const browserMessages = [];
  page.on('console', (message) => {
    if (message.type() === 'warning' || message.type() === 'error') {
      browserMessages.push(message.text());
    }
  });
  page.setDefaultTimeout(10_000);
  page.setDefaultNavigationTimeout(30_000);

  try {
    await page.goto(`http://127.0.0.1:${targetPort}/modal/${kind}`, {
      timeout: 30_000,
      waitUntil: 'domcontentloaded'
    });
    await page.waitForFunction(() => window.__zdpPackedModalResult || window.__zdpPackedModalError);

    const result = await page.evaluate(() => ({
      after: window.__zdpPackedModalResult,
      before: window.__zdpPackedModalBefore,
      error: window.__zdpPackedModalError ?? null
    }));
    assert.equal(result.error, null, `${kind} packed hydration failed: ${result.error}`);
    assert.deepEqual(result.before, {
      backgroundInert: false,
      bodyOverflow: '',
      layerActive: null,
      layerCount: null,
      layerLevel: null
    });
    assert.deepEqual(result.after, {
      backgroundInert: true,
      bodyOverflow: 'hidden',
      layerActive: 'true',
      layerCount: '1',
      layerLevel: '1'
    });

    const modal = page.getByRole('dialog', { name: packedModalAccessibleNames[kind] });
    assert.equal(await modal.count(), 1, `${kind} packed modal must remain open after hydration.`);
    await modal.getByRole('button', { name: packedModalCloseNames[kind] }).click();
    await page.getByTestId('packed-modal-open-state').getByText('closed', { exact: true }).waitFor();
    await page.waitForFunction(() => {
      const background = document.querySelector('[data-testid="packed-modal-background"]');
      return (
        !document.documentElement.hasAttribute('data-zdp-modal-layer-count') &&
        document.body.style.overflow === '' &&
        background !== null &&
        !background.hasAttribute('inert')
      );
    });

    assert.equal(await modal.count(), 0, `${kind} packed modal must close after hydration.`);
    assert.deepEqual(browserMessages, [], `${kind} packed hydration emitted browser diagnostics.`);
  } finally {
    await page.close();
  }
}

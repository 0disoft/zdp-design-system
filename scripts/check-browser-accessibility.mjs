import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';
import { verifyFoundationAndFormContracts } from './browser/check-foundation-and-forms.mjs';
import { verifyModalContracts, verifyNestedModalContracts } from './browser/check-modals.mjs';
import { verifyOverlayContracts, verifyShadowOverlayContracts } from './browser/check-overlays.mjs';
import { verifyPageGutterContracts } from './browser/check-page-gutters.mjs';
import { verifyResponsiveAndForcedColorContracts } from './browser/check-responsive-and-forced-colors.mjs';

const root = process.cwd();
const cacheDir = await mkdtemp(join(tmpdir(), 'zdp-design-system-browser-'));
const server = await createServer({
  cacheDir,
  configFile: false,
  logLevel: 'error',
  optimizeDeps: {
    noDiscovery: true
  },
  plugins: [svelte()],
  root: join(root, 'tests/browser'),
  server: {
    hmr: false,
    host: '127.0.0.1',
    port: 0,
    strictPort: false
  }
});

let browser;

try {
  await server.listen();
  const address = server.httpServer?.address();
  assert.ok(address && typeof address === 'object', 'Vite browser fixture server must expose a listening address.');

  browser = await chromium.launch({
    channel: process.env.ZDP_BROWSER_CHANNEL ?? 'chrome',
    headless: true,
    timeout: 30_000
  });
  const page = await browser.newPage();
  await page.addInitScript(() => {
    const originalAddEventListener = Document.prototype.addEventListener;
    const originalRemoveEventListener = Document.prototype.removeEventListener;
    const captureListeners = {
      click: new Set(),
      keydown: new Set()
    };

    Document.prototype.addEventListener = function (type, listener, options) {
      const capture = options === true || (typeof options === 'object' && options?.capture === true);
      if (this === document && capture && (type === 'click' || type === 'keydown')) {
        captureListeners[type].add(listener);
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
    Document.prototype.removeEventListener = function (type, listener, options) {
      const capture = options === true || (typeof options === 'object' && options?.capture === true);
      if (this === document && capture && (type === 'click' || type === 'keydown')) {
        captureListeners[type].delete(listener);
      }
      return originalRemoveEventListener.call(this, type, listener, options);
    };
    window.__zdpDismissListenerCounts = () => ({
      click: captureListeners.click.size,
      keydown: captureListeners.keydown.size
    });
  });
  page.setDefaultTimeout(10_000);
  page.setDefaultNavigationTimeout(30_000);
  const baseUrl = `http://127.0.0.1:${address.port}`;
  await page.goto(baseUrl, {
    timeout: 30_000,
    waitUntil: 'domcontentloaded'
  });

  await verifyFoundationAndFormContracts(page);
  await verifyOverlayContracts(page);
  await verifyModalContracts(page);
  await verifyShadowOverlayContracts(page);
  await verifyNestedModalContracts(page);
  await verifyResponsiveAndForcedColorContracts(page);
  await verifyPageGutterContracts(page, baseUrl);

  console.log('Design system browser accessibility check passed.');
} finally {
  await browser?.close();
  await server.close();
  await rm(cacheDir, { force: true, recursive: true });
}

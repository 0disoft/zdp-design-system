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
  page.setDefaultTimeout(10_000);
  page.setDefaultNavigationTimeout(30_000);
  await page.goto(`http://127.0.0.1:${address.port}`, {
    timeout: 30_000,
    waitUntil: 'domcontentloaded'
  });

  await verifyFoundationAndFormContracts(page);
  await verifyOverlayContracts(page);
  await verifyModalContracts(page);
  await verifyShadowOverlayContracts(page);
  await verifyNestedModalContracts(page);
  await verifyResponsiveAndForcedColorContracts(page);

  console.log('Design system browser accessibility check passed.');
} finally {
  await browser?.close();
  await server.close();
  await rm(cacheDir, { force: true, recursive: true });
}

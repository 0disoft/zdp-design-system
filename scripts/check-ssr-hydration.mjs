import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';

const root = process.cwd();
const cacheDir = await mkdtemp(join(tmpdir(), 'zdp-design-system-ssr-'));
let renderedBody = '';

const server = await createServer({
  appType: 'custom',
  cacheDir,
  configFile: false,
  logLevel: 'error',
  optimizeDeps: {
    noDiscovery: true
  },
  plugins: [
    svelte(),
    {
      name: 'zdp-ssr-hydration-fixture',
      configureServer(vite) {
        vite.middlewares.use(async (request, response, next) => {
          if (request.url !== '/') {
            next();
            return;
          }

          try {
            const html = await vite.transformIndexHtml(
              request.url,
              `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="data:," />
    <title>SSR hydration check</title>
  </head>
  <body>
    <main id="app">${renderedBody}</main>
    <script>
      window.__zdpCaptureHydrationContract = (root) => ({
        ids: Array.from(root.querySelectorAll('[id]'), (element) => element.id),
        idReferences: Array.from(
          root.querySelectorAll('[aria-activedescendant], [aria-controls], [aria-describedby], [aria-labelledby]')
        ).flatMap((element) =>
          ['aria-activedescendant', 'aria-controls', 'aria-describedby', 'aria-labelledby']
            .flatMap((attribute) => (element.getAttribute(attribute) || '').split(/\\s+/))
            .filter(Boolean)
        )
      });
      window.__zdpHydrationBefore = window.__zdpCaptureHydrationContract(document.querySelector('#app'));
    </script>
    <script type="module" src="/tests/ssr/hydrate.js"></script>
  </body>
</html>`
            );
            response.statusCode = 200;
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            response.end(html);
          } catch (error) {
            next(error);
          }
        });
      }
    }
  ],
  root,
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
  assert.ok(address && typeof address === 'object', 'SSR fixture server must expose a listening address.');

  const { render } = await server.ssrLoadModule('svelte/server');
  const fixtureModule = await server.ssrLoadModule('/tests/ssr/IdHydrationFixture.svelte');
  render(fixtureModule.default);
  renderedBody = render(fixtureModule.default).body;

  for (const idPrefix of [
    'zdp-status-toast-',
    'zdp-tabs-',
    'zdp-combobox-',
    'zdp-disclosure-',
    'zdp-locale-switcher-',
    'zdp-menu-',
    'zdp-popover-',
    'zdp-segmented-control-',
    'zdp-text-scale-control-',
    'zdp-term-sheet-',
    'zdp-tooltip-'
  ]) {
    assert.ok(renderedBody.includes(idPrefix), `Second SSR render must include generated ${idPrefix} ids.`);
  }

  browser = await chromium.launch({
    channel: process.env.ZDP_BROWSER_CHANNEL ?? 'chrome',
    headless: true,
    timeout: 30_000
  });
  const page = await browser.newPage();
  const hydrationWarnings = [];
  page.on('console', (message) => {
    if (message.type() === 'warning' || message.type() === 'error') {
      hydrationWarnings.push(message.text());
    }
  });
  page.setDefaultTimeout(10_000);
  page.setDefaultNavigationTimeout(30_000);
  await page.goto(`http://127.0.0.1:${address.port}`, {
    timeout: 30_000,
    waitUntil: 'domcontentloaded'
  });
  await page.waitForFunction(() => window.__zdpHydrationResult || window.__zdpHydrationError);

  const result = await page.evaluate(() => ({
    after: window.__zdpHydrationResult,
    before: window.__zdpHydrationBefore,
    error: window.__zdpHydrationError ?? null
  }));

  assert.equal(result.error, null, `Design system hydration failed: ${result.error}`);
  assert.deepEqual(result.after.ids, result.before.ids, 'Hydration must preserve generated DOM ids exactly.');
  assert.deepEqual(
    result.after.idReferences,
    result.before.idReferences,
    'Hydration must preserve generated ARIA ID references exactly.'
  );
  assert.equal(new Set(result.after.ids).size, result.after.ids.length, 'Hydrated DOM ids must be instance-unique.');

  for (const idReference of result.after.idReferences) {
    const targetCount = await page.locator(`[id="${idReference}"]`).count();
    assert.equal(targetCount, 1, `ARIA reference ${idReference} must resolve to exactly one element.`);
  }

  const termSheet = page.getByRole('dialog', { name: 'Hydration term' });
  await termSheet.getByRole('button', { name: 'Close hydration term' }).click();
  await page.getByTestId('term-sheet-bound-open').getByText('closed', { exact: true }).waitFor();
  assert.equal(await page.getByRole('dialog', { name: 'Hydration term' }).count(), 0, 'TermSheet must close after hydration.');

  await page.getByRole('tab', { name: 'History' }).click();
  await page.getByTestId('tabs-slot-selection').getByText('history', { exact: true }).waitFor();
  assert.equal(
    await page.getByTestId('tabs-bound-selection').textContent(),
    'history',
    'Tabs bind:selectedId contract must update after hydration.'
  );

  const combobox = page.getByRole('combobox', { name: 'Hydration choice' });
  await combobox.click();
  const listboxId = await combobox.getAttribute('aria-controls');
  assert.ok(listboxId, 'Hydrated Combobox must expose its generated listbox id while open.');
  assert.equal(await page.locator(`[id="${listboxId}"]`).count(), 1, 'Combobox aria-controls must resolve once.');
  await page.getByRole('option', { name: 'Beta' }).click();
  assert.equal(await page.getByTestId('combobox-bound-value').textContent(), 'beta', 'Combobox bind:value must update.');
  assert.equal(await page.getByTestId('combobox-bound-query').textContent(), 'Beta', 'Combobox bind:query must update.');

  await page.getByRole('button', { name: 'Hydration disclosure' }).click();
  assert.equal(await page.getByTestId('disclosure-bound-open').textContent(), 'closed', 'Disclosure bind:open must update.');

  const localeSwitcher = page.getByRole('radiogroup', { name: 'Hydration language' });
  await localeSwitcher.getByRole('radio', { name: 'Korean' }).click();
  assert.equal(await page.getByTestId('locale-bound-value').textContent(), 'ko', 'LocaleSwitcher bind:value must update.');

  const segmentedControl = page.getByRole('radiogroup', { name: 'Hydration view' });
  await segmentedControl.getByRole('radio', { name: 'Grid' }).click();
  assert.equal(await page.getByTestId('segmented-bound-value').textContent(), 'grid', 'SegmentedControl binding must update.');

  const textScaleControl = page.getByRole('radiogroup', { name: 'Hydration text size' });
  await textScaleControl.getByRole('radio', { name: 'Large text size' }).click();
  assert.equal(await page.getByTestId('text-scale-bound-value').textContent(), 'large', 'TextScaleControl binding must update.');

  const menuTrigger = page.getByRole('button', { name: 'Hydration menu' });
  await menuTrigger.click();
  const menuPanelId = await menuTrigger.getAttribute('aria-controls');
  assert.ok(menuPanelId, 'Hydrated Menu must expose its generated panel id while open.');
  assert.equal(await page.locator(`[id="${menuPanelId}"]`).count(), 1, 'Menu aria-controls must resolve once.');
  await page.getByRole('menuitem', { name: 'Review' }).click();
  assert.equal(await page.getByTestId('menu-bound-open').textContent(), 'closed', 'Menu bind:open must update.');
  assert.equal(await page.getByTestId('menu-selection').textContent(), 'review', 'Menu selection callback must update.');
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Hydration menu');

  const popoverTrigger = page.getByTestId('popover-trigger');
  await popoverTrigger.click();
  const popoverPanelId = await popoverTrigger.getAttribute('aria-controls');
  assert.ok(popoverPanelId, 'Hydrated Popover trigger must expose its generated panel id while open.');
  assert.equal(await page.locator(`[id="${popoverPanelId}"]`).count(), 1, 'Popover aria-controls must resolve once.');
  await page.getByRole('button', { name: 'Close hydration popover' }).click();
  assert.equal(await page.getByTestId('popover-bound-open').textContent(), 'closed', 'Popover bind:open must update.');
  await page.waitForFunction(() => document.activeElement?.textContent?.trim() === 'Hydration popover');

  const tooltipTrigger = page.getByTestId('tooltip-trigger');
  const tooltipId = await tooltipTrigger.getAttribute('aria-describedby');
  assert.ok(tooltipId, 'Hydrated Tooltip trigger must expose its generated description id.');
  assert.equal(await page.locator(`[id="${tooltipId}"]`).count(), 1, 'Tooltip aria-describedby must resolve once.');
  await tooltipTrigger.focus();
  await tooltipTrigger.press('Escape');
  assert.equal(
    await tooltipTrigger.evaluate((element) => element.closest('.zdp-tooltip')?.getAttribute('data-dismissed')),
    'true',
    'Tooltip Escape dismissal must survive hydration.'
  );
  assert.equal(await tooltipTrigger.evaluate((element) => document.activeElement === element), true, 'Tooltip must keep focus.');

  assert.deepEqual(hydrationWarnings, [], `Hydration emitted browser warnings: ${hydrationWarnings.join('\n')}`);
  console.log('Design system SSR hydration check passed.');
} finally {
  await browser?.close();
  await server.close();
  await rm(cacheDir, { force: true, recursive: true });
}

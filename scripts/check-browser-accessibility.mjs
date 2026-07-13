import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';

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

  const labelledSection = page.getByRole('region', { name: 'Release summary' });
  assert.equal(await labelledSection.count(), 1, 'A labelled section Card must expose one named region.');
  assert.equal(await labelledSection.getAttribute('tabindex'), null, 'Card itself must stay out of the tab order.');
  assert.equal(
    await labelledSection.evaluate((element) => getComputedStyle(element).cursor),
    'auto',
    'Hover styling must not advertise a clickable Card cursor.'
  );

  const labelledDiv = page.getByRole('region', { name: 'Deployment status' });
  assert.equal(await labelledDiv.count(), 1, 'A labelled div Card must expose one explicit region.');

  await page.keyboard.press('Tab');
  const focusedTestId = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  assert.equal(focusedTestId, 'card-link', 'The first keyboard stop must be the explicit link inside Card.');

  const tooltipTrigger = page.getByTestId('tooltip-trigger');
  const tooltip = page.getByRole('tooltip', { name: 'Keyboard help' });
  await tooltipTrigger.focus();
  assert.equal(await tooltipTrigger.getAttribute('aria-describedby'), 'browser-tooltip');
  assert.equal(await tooltip.evaluate((element) => getComputedStyle(element).opacity), '1');
  await page.keyboard.press('Escape');
  assert.equal(await tooltip.evaluate((element) => getComputedStyle(element).opacity), '0');
  assert.equal(
    await tooltipTrigger.evaluate((element) => document.activeElement === element),
    true,
    'Escape dismissal must preserve focus on the Tooltip trigger.'
  );

  const tabs = page.getByRole('tablist', { name: 'Release views' }).getByRole('tab');
  const tabIds = await tabs.evaluateAll((elements) => elements.map((element) => element.id));
  const controlledPanelIds = await tabs.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('aria-controls'))
  );
  assert.equal(new Set(tabIds).size, 2, 'Distinct logical tab ids must remain distinct DOM ids.');
  assert.equal(new Set(controlledPanelIds).size, 2, 'Distinct tabs must retain distinct aria-controls targets.');
  assert.equal(await page.getByRole('tabpanel').getAttribute('id'), controlledPanelIds[0]);

  const combobox = page.getByRole('combobox', { name: 'Owner' });
  await combobox.focus();
  assert.equal(await page.getByRole('listbox', { name: 'Owner list' }).count(), 1);
  for (const legacyKeyCode of [null, 229]) {
    const dispatchResult = await combobox.evaluate((element, keyCode) => {
      const event = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        isComposing: keyCode === null,
        key: 'Enter'
      });
      if (keyCode !== null) {
        Object.defineProperty(event, 'keyCode', { value: keyCode });
      }
      return element.dispatchEvent(event);
    }, legacyKeyCode);
    assert.equal(dispatchResult, true, 'IME composition keys must not be consumed as option selection.');
  }
  assert.equal(await page.locator('input[type="hidden"][name="owner"]').inputValue(), '');
  assert.equal(await page.getByTestId('combobox-selection-count').textContent(), '0');
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('listbox', { name: 'Owner list' }).count(), 0);

  await verifyModalKeyboardContract({
    page,
    triggerTestId: 'dialog-trigger',
    dialogName: 'Review changes',
    closeName: 'Close dialog',
    backdropSelector: '.zdp-dialog__backdrop',
    lastTestId: 'dialog-last-action'
  });
  await verifyModalKeyboardContract({
    page,
    triggerTestId: 'sheet-trigger',
    dialogName: 'Release details',
    closeName: 'Close sheet',
    backdropSelector: '.zdp-sheet__backdrop',
    lastTestId: 'sheet-last-action'
  });
  await verifyModalKeyboardContract({
    page,
    triggerTestId: 'term-sheet-trigger',
    dialogName: 'Browser term',
    closeName: 'Close term',
    backdropSelector: '.zdp-term-sheet__backdrop',
    lastRole: 'link',
    lastName: 'View details'
  });

  await verifyProtectedModalContract({
    page,
    triggerTestId: 'protected-dialog-trigger',
    dialogName: 'Protected dialog',
    closeName: 'Close protected dialog',
    backdropSelector: '.zdp-dialog__backdrop'
  });
  await verifyProtectedModalContract({
    page,
    triggerTestId: 'protected-sheet-trigger',
    dialogName: 'Protected sheet',
    closeName: 'Close protected sheet',
    backdropSelector: '.zdp-sheet__backdrop'
  });
  await verifyProtectedModalContract({
    page,
    triggerTestId: 'protected-term-trigger',
    dialogName: 'Protected term',
    closeName: 'Close protected term',
    backdropSelector: '.zdp-term-sheet__backdrop'
  });

  const nestedDialogTrigger = page.getByTestId('nested-dialog-trigger');
  await nestedDialogTrigger.click();
  const nestedDialog = page.getByRole('dialog', { name: 'Nested dialog' });
  await nestedDialog.getByTestId('nested-sheet-trigger').click();
  const nestedSheet = page.getByRole('dialog', { name: 'Nested sheet' });
  assert.equal(await page.locator('html').getAttribute('data-zdp-modal-layer-count'), '2');
  assert.equal(
    await nestedDialog.locator('..').getAttribute('data-zdp-modal-layer-level'),
    '1'
  );
  assert.equal(
    await nestedSheet.locator('..').getAttribute('data-zdp-modal-layer-level'),
    '2'
  );
  const nestedDialogZIndex = Number(await nestedDialog.locator('..').evaluate((element) => getComputedStyle(element).zIndex));
  const nestedSheetZIndex = Number(await nestedSheet.locator('..').evaluate((element) => getComputedStyle(element).zIndex));
  assert.ok(
    nestedSheetZIndex > nestedDialogZIndex,
    'A later modal activation must create a higher real stacking context regardless of component type.'
  );

  const closeUnderlyingDialog = nestedSheet.getByTestId('close-underlying-dialog');
  await closeUnderlyingDialog.click();
  assert.equal(await nestedDialog.count(), 0, 'The lower modal layer must be able to close independently.');
  assert.equal(await page.locator('html').getAttribute('data-zdp-modal-layer-count'), '1');
  assert.equal(
    await nestedSheet.locator('..').getAttribute('data-zdp-modal-layer-level'),
    '1',
    'A surviving modal must be renumbered after a lower layer closes.'
  );
  assert.equal(
    await closeUnderlyingDialog.evaluate((element) => document.activeElement === element),
    true,
    'Closing a lower modal must not steal focus from the active top layer.'
  );
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');

  await page.keyboard.press('Escape');
  assert.equal(await nestedSheet.count(), 0);
  assert.equal(
    await nestedDialogTrigger.evaluate((element) => document.activeElement === element),
    true,
    'The final nested modal must fall back to the surviving outer trigger when its original trigger is removed.'
  );
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  assert.equal(await page.locator('html').getAttribute('data-zdp-modal-layer-count'), null);

  console.log('Design system browser accessibility check passed.');
} finally {
  await browser?.close();
  await server.close();
  await rm(cacheDir, { force: true, recursive: true });
}

async function verifyModalKeyboardContract({
  page,
  triggerTestId,
  dialogName,
  closeName,
  backdropSelector,
  lastTestId,
  lastRole,
  lastName
}) {
  const trigger = page.getByTestId(triggerTestId);
  await trigger.focus();
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: dialogName });
  const closeButton = dialog.getByRole('button', { name: closeName });
  const lastControl = lastTestId
    ? dialog.getByTestId(lastTestId)
    : dialog.getByRole(lastRole, { name: lastName });

  assert.equal(await dialog.count(), 1, `${dialogName} must expose one named modal dialog.`);
  assert.equal(await dialog.getAttribute('aria-modal'), 'true');
  assert.equal(
    await closeButton.evaluate((element) => document.activeElement === element),
    true,
    `${dialogName} must focus its first control after opening.`
  );
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  assert.equal(await page.locator('html').getAttribute('data-zdp-modal-layer-count'), '1');

  await page.keyboard.press('Shift+Tab');
  assert.equal(
    await lastControl.evaluate((element) => document.activeElement === element),
    true,
    `${dialogName} must wrap backward focus to its last control.`
  );
  await page.keyboard.press('Tab');
  assert.equal(
    await closeButton.evaluate((element) => document.activeElement === element),
    true,
    `${dialogName} must wrap forward focus to its first control.`
  );

  await page.keyboard.press('Escape');
  assert.equal(await dialog.count(), 0, `${dialogName} must close on Escape.`);
  assert.equal(
    await trigger.evaluate((element) => document.activeElement === element),
    true,
    `${dialogName} must restore focus to its trigger.`
  );
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  assert.equal(await page.locator('html').getAttribute('data-zdp-modal-layer-count'), null);

  await trigger.click();
  assert.equal(await dialog.count(), 1);
  await page.locator(backdropSelector).click({ position: { x: 5, y: 5 } });
  assert.equal(await dialog.count(), 0, `${dialogName} must close on backdrop click.`);
  assert.equal(
    await trigger.evaluate((element) => document.activeElement === element),
    true,
    `${dialogName} must restore focus after backdrop dismissal.`
  );
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  assert.equal(await page.locator('html').getAttribute('data-zdp-modal-layer-count'), null);
}

async function verifyProtectedModalContract({ page, triggerTestId, dialogName, closeName, backdropSelector }) {
  const trigger = page.getByTestId(triggerTestId);
  await trigger.focus();
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: dialogName });
  const closeButton = dialog.getByRole('button', { name: closeName });
  const backdrop = page.locator(backdropSelector);
  assert.equal(await dialog.count(), 1);
  assert.equal(await closeButton.evaluate((element) => document.activeElement === element), true);
  assert.equal(await page.getByRole('button', { name: closeName }).count(), 1);
  assert.equal(await backdrop.evaluate((element) => element.tagName), 'DIV');
  assert.equal(await backdrop.getAttribute('aria-hidden'), 'true');

  await page.keyboard.press('Escape');
  assert.equal(await dialog.count(), 1, `${dialogName} must ignore Escape when dismissal is disabled.`);
  assert.equal(await closeButton.evaluate((element) => document.activeElement === element), true);

  await backdrop.click({ position: { x: 5, y: 5 } });
  assert.equal(await dialog.count(), 1, `${dialogName} must ignore backdrop clicks when dismissal is disabled.`);
  assert.equal(
    await closeButton.evaluate((element) => document.activeElement === element),
    true,
    `${dialogName} backdrop interaction must not move focus out of the protected modal.`
  );
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  assert.equal(await page.locator('html').getAttribute('data-zdp-modal-layer-count'), '1');

  await closeButton.click();
  assert.equal(await dialog.count(), 0);
  assert.equal(await trigger.evaluate((element) => document.activeElement === element), true);
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  assert.equal(await page.locator('html').getAttribute('data-zdp-modal-layer-count'), null);
}

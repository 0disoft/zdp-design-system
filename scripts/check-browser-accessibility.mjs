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
  const tooltip = page.getByRole('tooltip', { name: 'Keyboard help', exact: true });
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

  const combobox = page.getByRole('combobox', { name: 'Owner', exact: true });
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

  const outsideOverlayTarget = page.getByTestId('overlay-outside-target');
  const menuTrigger = page.getByRole('button', { name: 'Browser actions' });
  await menuTrigger.focus();
  await menuTrigger.click();
  let menu = page.getByRole('menu', { name: 'Browser actions' });
  assert.equal(await menu.count(), 1);
  assert.equal(await menuTrigger.getAttribute('aria-expanded'), 'true');
  assert.equal(
    await menu.getByRole('menuitem', { name: 'Edit release' }).evaluate((element) => document.activeElement === element),
    true,
    'Menu must focus its first enabled item after pointer opening.'
  );
  await page.keyboard.press('Escape');
  assert.equal(await menu.count(), 0);
  assert.equal(await menuTrigger.evaluate((element) => document.activeElement === element), true);
  assert.equal(await menuTrigger.getAttribute('aria-expanded'), 'false');
  assert.equal(await menuTrigger.getAttribute('aria-controls'), null);

  await menuTrigger.click();
  menu = page.getByRole('menu', { name: 'Browser actions' });
  await outsideOverlayTarget.click();
  assert.equal(await menu.count(), 0, 'Menu must close after an outside click.');
  assert.equal(
    await outsideOverlayTarget.evaluate((element) => document.activeElement === element),
    true,
    'Outside dismissal must keep focus on the clicked target instead of stealing it back.'
  );

  await menuTrigger.focus();
  await page.keyboard.press('ArrowDown');
  menu = page.getByRole('menu', { name: 'Browser actions' });
  const editMenuItem = menu.getByRole('menuitem', { name: 'Edit release' });
  const deleteMenuItem = menu.getByRole('menuitem', { name: 'Delete release' });
  const archiveMenuItem = menu.getByRole('menuitem', { name: 'Archive release' });
  assert.equal(await editMenuItem.evaluate((element) => document.activeElement === element), true);
  assert.equal(await deleteMenuItem.getAttribute('aria-disabled'), 'true');
  assert.equal(await deleteMenuItem.getAttribute('tabindex'), '-1');
  await page.keyboard.press('ArrowDown');
  assert.equal(
    await archiveMenuItem.evaluate((element) => document.activeElement === element),
    true,
    'ArrowDown must skip disabled items.'
  );
  await page.keyboard.press('ArrowDown');
  assert.equal(
    await editMenuItem.evaluate((element) => document.activeElement === element),
    true,
    'ArrowDown must wrap to the first enabled item.'
  );
  await page.keyboard.press('End');
  assert.equal(await archiveMenuItem.evaluate((element) => document.activeElement === element), true);
  await page.keyboard.press('Home');
  assert.equal(await editMenuItem.evaluate((element) => document.activeElement === element), true);
  await page.keyboard.press('ArrowUp');
  assert.equal(
    await archiveMenuItem.evaluate((element) => document.activeElement === element),
    true,
    'ArrowUp must wrap to the last enabled item.'
  );
  await page.keyboard.press('Tab');
  assert.equal(await menu.count(), 0, 'Tab must close the Menu.');
  assert.equal(
    await page.getByTestId('popover-trigger').evaluate((element) => document.activeElement === element),
    true,
    'Tab must continue to the next document control instead of restoring trigger focus.'
  );

  await menuTrigger.focus();
  await page.keyboard.press('ArrowUp');
  menu = page.getByRole('menu', { name: 'Browser actions' });
  assert.equal(
    await menu.getByRole('menuitem', { name: 'Archive release' }).evaluate((element) => document.activeElement === element),
    true,
    'ArrowUp on the trigger must open the Menu at its last enabled item.'
  );
  await page.keyboard.press('Home');
  await page.keyboard.press('Enter');
  assert.equal(await menu.count(), 0, 'Enter must select the focused Menu item and close the Menu.');
  assert.equal(await page.getByTestId('menu-selection').textContent(), 'edit');
  assert.equal(await menuTrigger.evaluate((element) => document.activeElement === element), true);

  const popoverTrigger = page.getByTestId('popover-trigger');
  await popoverTrigger.focus();
  await popoverTrigger.click();
  let popover = page.getByRole('dialog', { name: 'Browser filters' });
  const popoverAction = page.getByTestId('popover-action');
  assert.equal(await popover.count(), 1);
  assert.equal(await popoverTrigger.getAttribute('aria-expanded'), 'true');
  await popoverAction.focus();
  await page.keyboard.press('Escape');
  assert.equal(await popover.count(), 0);
  assert.equal(await popoverTrigger.evaluate((element) => document.activeElement === element), true);
  assert.equal(await popoverTrigger.getAttribute('aria-expanded'), 'false');
  assert.equal(await popoverTrigger.getAttribute('aria-controls'), null);

  await popoverTrigger.click();
  popover = page.getByRole('dialog', { name: 'Browser filters' });
  await page.getByTestId('popover-action').focus();
  await outsideOverlayTarget.click();
  assert.equal(await popover.count(), 0, 'Popover must close after an outside click.');
  assert.equal(
    await outsideOverlayTarget.evaluate((element) => document.activeElement === element),
    true,
    'Popover outside dismissal must preserve focus on the clicked target.'
  );

  const protectedPopoverTrigger = page.getByTestId('protected-popover-trigger');
  await protectedPopoverTrigger.click();
  const protectedPopover = page.getByRole('dialog', { name: 'Protected filters' });
  const protectedPopoverAction = page.getByTestId('protected-popover-action');
  assert.equal(await protectedPopover.count(), 1);
  await protectedPopoverAction.focus();
  await page.keyboard.press('Escape');
  assert.equal(await protectedPopover.count(), 1, 'Escape opt-out must keep the Popover open.');
  assert.equal(
    await protectedPopoverAction.evaluate((element) => document.activeElement === element),
    true,
    'Escape opt-out must not move focus out of the Popover.'
  );
  await outsideOverlayTarget.click();
  assert.equal(await protectedPopover.count(), 1, 'Outside-click opt-out must keep the Popover open.');
  assert.equal(
    await outsideOverlayTarget.evaluate((element) => document.activeElement === element),
    true,
    'A protected non-modal Popover must still allow the clicked outside target to receive focus.'
  );
  assert.equal(await protectedPopoverTrigger.getAttribute('aria-expanded'), 'true');
  assert.notEqual(await protectedPopoverTrigger.getAttribute('aria-controls'), null);
  await page.getByTestId('protected-popover-close').focus();
  await page.getByTestId('protected-popover-close').click();
  assert.equal(await protectedPopover.count(), 0, 'The explicit close action must close a protected Popover.');
  assert.equal(await protectedPopoverTrigger.evaluate((element) => document.activeElement === element), true);
  assert.equal(await protectedPopoverTrigger.getAttribute('aria-expanded'), 'false');
  assert.equal(await protectedPopoverTrigger.getAttribute('aria-controls'), null);

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

  const abruptDialogTrigger = page.getByTestId('abrupt-dialog-trigger');
  await abruptDialogTrigger.focus();
  await abruptDialogTrigger.click();
  const abruptDialog = page.getByRole('dialog', { name: 'Removable dialog' });
  assert.equal(await abruptDialog.count(), 1);
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  assert.equal(await hasInertAncestor(abruptDialogTrigger), true);
  await abruptDialog.getByTestId('abrupt-dialog-unmount').click();
  assert.equal(await abruptDialog.count(), 0, 'Parent unmount must destroy the active modal layer.');
  assert.equal(await page.locator('html').getAttribute('data-zdp-modal-layer-count'), null);
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  assert.equal(await hasInertAncestor(abruptDialogTrigger), false, 'Parent unmount must restore background interaction.');
  assert.equal(
    await abruptDialogTrigger.evaluate((element) => document.activeElement === element),
    true,
    'Parent unmount must restore focus to the surviving trigger.'
  );
  assert.equal(await page.getByTestId('preexisting-inert').getAttribute('inert'), '');

  const abruptNestedTrigger = page.getByTestId('abrupt-nested-trigger');
  await abruptNestedTrigger.click();
  let abruptNestedDialog = page.getByRole('dialog', { name: 'Removable nested dialog' });
  let abruptNestedSheetTrigger = abruptNestedDialog.getByTestId('abrupt-nested-sheet-trigger');
  await abruptNestedSheetTrigger.click();
  let abruptNestedSheet = page.getByRole('dialog', { name: 'Removable nested sheet' });
  assert.equal(await page.locator('html').getAttribute('data-zdp-modal-layer-count'), '2');
  assert.equal(await hasInertAncestor(abruptNestedDialog), true);
  assert.equal(await hasInertAncestor(abruptNestedSheet), false);
  await abruptNestedSheet.getByTestId('abrupt-nested-remove-top').click();
  assert.equal(await abruptNestedSheet.count(), 0, 'Destroying the top component must remove only its modal layer.');
  assert.equal(await abruptNestedDialog.count(), 1);
  assert.equal(await abruptNestedDialog.locator('..').getAttribute('data-zdp-modal-layer-level'), '1');
  assert.equal(await hasInertAncestor(abruptNestedDialog), false, 'Destroying the top component must reactivate the lower modal.');
  assert.equal(await hasInertAncestor(abruptNestedTrigger), true);
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  assert.equal(
    await abruptNestedSheetTrigger.evaluate((element) => document.activeElement === element),
    true,
    'Destroying the top component must restore focus inside the lower modal.'
  );
  await page.keyboard.press('Escape');
  assert.equal(await abruptNestedDialog.count(), 0);
  assert.equal(await abruptNestedTrigger.evaluate((element) => document.activeElement === element), true);
  assert.equal(await hasInertAncestor(abruptNestedTrigger), false);
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');

  await abruptNestedTrigger.click();
  abruptNestedDialog = page.getByRole('dialog', { name: 'Removable nested dialog' });
  abruptNestedSheetTrigger = abruptNestedDialog.getByTestId('abrupt-nested-sheet-trigger');
  await abruptNestedSheetTrigger.click();
  abruptNestedSheet = page.getByRole('dialog', { name: 'Removable nested sheet' });
  const removeLowerDialog = abruptNestedSheet.getByTestId('abrupt-nested-remove-lower');
  await removeLowerDialog.click();
  assert.equal(await abruptNestedDialog.count(), 0, 'Destroying the lower component must not remove the top modal.');
  assert.equal(await abruptNestedSheet.count(), 1);
  assert.equal(await abruptNestedSheet.locator('..').getAttribute('data-zdp-modal-layer-level'), '1');
  assert.equal(await hasInertAncestor(abruptNestedSheet), false);
  assert.equal(await hasInertAncestor(abruptNestedTrigger), true);
  assert.equal(await removeLowerDialog.evaluate((element) => document.activeElement === element), true);
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  await page.keyboard.press('Escape');
  assert.equal(await abruptNestedSheet.count(), 0);
  assert.equal(
    await abruptNestedTrigger.evaluate((element) => document.activeElement === element),
    true,
    'The surviving top modal must inherit the removed lower layer focus-return target.'
  );
  assert.equal(await page.locator('html').getAttribute('data-zdp-modal-layer-count'), null);
  assert.equal(await hasInertAncestor(abruptNestedTrigger), false);
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  assert.equal(await page.getByTestId('preexisting-inert').getAttribute('inert'), '');

  const portalDialogTrigger = page.getByTestId('portal-dialog-trigger');
  await portalDialogTrigger.click();
  const portalDialog = page.getByRole('dialog', { name: 'Portal dialog' });
  assert.equal(await portalDialog.count(), 1);
  assert.equal(await hasInertAncestor(portalDialogTrigger), true, 'A body portal must isolate its light-DOM trigger.');
  assert.equal(await hasInertAncestor(portalDialog), false);
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  await page.keyboard.press('Escape');
  assert.equal(await portalDialog.count(), 0);
  assert.equal(await portalDialogTrigger.evaluate((element) => document.activeElement === element), true);
  assert.equal(await hasInertAncestor(portalDialogTrigger), false);
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');

  await verifyShadowModalBoundary({
    page,
    triggerTestId: 'shadow-dialog-trigger',
    dialogName: 'Shadow dialog',
    closeName: 'Close shadow dialog',
    lastTestId: 'shadow-dialog-last-action'
  });
  await verifyShadowModalBoundary({
    page,
    triggerTestId: 'shadow-sheet-trigger',
    dialogName: 'Shadow sheet',
    closeName: 'Close shadow sheet',
    lastTestId: 'shadow-sheet-last-action'
  });
  await verifyShadowModalBoundary({
    page,
    triggerTestId: 'shadow-term-trigger',
    dialogName: 'Shadow term',
    closeName: 'Close shadow term',
    lastRole: 'link',
    lastName: 'View details'
  });

  const shadowHost = page.getByTestId('shadow-modal-host');
  const shadowOutsideTarget = page.getByTestId('shadow-overlay-outside-target');
  const shadowMenuTrigger = page.getByRole('button', { name: 'Shadow actions' });
  await shadowMenuTrigger.click();
  let shadowMenu = page.getByRole('menu', { name: 'Shadow actions' });
  assert.equal(await shadowMenu.count(), 1, 'A Menu trigger inside an open shadow root must not dismiss itself.');
  assert.equal(
    await isDeepActive(shadowMenu.getByRole('menuitem', { name: 'Edit shadow release' })),
    true,
    'A shadow-root Menu must focus its first enabled item.'
  );
  await page.keyboard.press('Escape');
  assert.equal(await shadowMenu.count(), 0);
  assert.equal(await isDeepActive(shadowMenuTrigger), true, 'A shadow-root Menu must restore its inner trigger focus.');
  assert.equal(await shadowMenuTrigger.getAttribute('aria-expanded'), 'false');
  assert.equal(await shadowMenuTrigger.getAttribute('aria-controls'), null);

  await shadowMenuTrigger.click();
  shadowMenu = page.getByRole('menu', { name: 'Shadow actions' });
  await shadowOutsideTarget.click();
  assert.equal(await shadowMenu.count(), 0, 'A shadow-root Menu must close after a composed outside click.');
  assert.equal(
    await shadowOutsideTarget.evaluate((element) => document.activeElement === element),
    true,
    'Shadow Menu outside dismissal must preserve focus on the clicked light-DOM target.'
  );

  const shadowPopoverTrigger = page.getByTestId('shadow-popover-trigger');
  await shadowPopoverTrigger.click();
  let shadowPopover = page.getByRole('dialog', { name: 'Shadow filters' });
  assert.equal(await shadowPopover.count(), 1, 'A Popover trigger inside an open shadow root must not dismiss itself.');
  await page.getByTestId('shadow-popover-action').focus();
  await page.keyboard.press('Escape');
  assert.equal(await shadowPopover.count(), 0);
  assert.equal(
    await isDeepActive(shadowPopoverTrigger),
    true,
    'A shadow-root Popover must restore its inner trigger focus.'
  );
  assert.equal(await shadowPopoverTrigger.getAttribute('aria-expanded'), 'false');
  assert.equal(await shadowPopoverTrigger.getAttribute('aria-controls'), null);

  await shadowPopoverTrigger.click();
  shadowPopover = page.getByRole('dialog', { name: 'Shadow filters' });
  await shadowOutsideTarget.click();
  assert.equal(await shadowPopover.count(), 0, 'A shadow-root Popover must close after a composed outside click.');
  assert.equal(
    await shadowOutsideTarget.evaluate((element) => document.activeElement === element),
    true,
    'Shadow Popover outside dismissal must preserve focus on the clicked light-DOM target.'
  );

  const shadowTooltipTrigger = page.getByTestId('shadow-tooltip-trigger');
  const shadowTooltip = page.getByRole('tooltip', { name: 'Shadow keyboard help' });
  await shadowTooltipTrigger.focus();
  assert.equal(await isDeepActive(shadowTooltipTrigger), true);
  assert.equal(await shadowTooltipTrigger.getAttribute('aria-describedby'), 'shadow-tooltip');
  assert.equal(
    await shadowTooltip.evaluate((element) => getComputedStyle(element).opacity),
    '1',
    'A Tooltip must remain visible when its trigger is focused inside an open shadow root.'
  );
  await page.keyboard.press('Escape');
  assert.equal(await shadowTooltip.locator('..').getAttribute('data-dismissed'), 'true');
  assert.equal(await shadowTooltip.evaluate((element) => getComputedStyle(element).opacity), '0');
  assert.equal(
    await isDeepActive(shadowTooltipTrigger),
    true,
    'Shadow Tooltip Escape dismissal must preserve its inner trigger focus.'
  );
  await shadowOutsideTarget.focus();
  await shadowTooltipTrigger.focus();
  assert.equal(
    await shadowTooltip.evaluate((element) => getComputedStyle(element).opacity),
    '1',
    'A shadow-root Tooltip must become available again after focus leaves and returns.'
  );

  const shadowCombobox = page.getByRole('combobox', { name: 'Shadow owner' });
  const shadowComboboxToggle = shadowHost.getByRole('button', { name: 'Open selection' });
  await shadowOutsideTarget.click();
  await shadowComboboxToggle.click();
  let shadowListbox = page.getByRole('listbox', { name: 'Shadow owner list' });
  assert.equal(
    await shadowListbox.count(),
    1,
    'A Combobox toggle inside an open shadow root must not dismiss its own listbox.'
  );
  assert.equal(await isDeepActive(shadowCombobox), true, 'A shadow-root Combobox toggle must focus its input.');
  assert.equal(await shadowCombobox.getAttribute('aria-expanded'), 'true');
  assert.notEqual(await shadowCombobox.getAttribute('aria-controls'), null);
  await page.keyboard.press('Escape');
  assert.equal(await shadowListbox.count(), 0);
  assert.equal(await isDeepActive(shadowCombobox), true, 'Escape must preserve shadow-root Combobox input focus.');
  assert.equal(await shadowCombobox.getAttribute('aria-expanded'), 'false');
  assert.equal(await shadowCombobox.getAttribute('aria-controls'), null);

  await shadowOutsideTarget.click();
  await shadowCombobox.click();
  shadowListbox = page.getByRole('listbox', { name: 'Shadow owner list' });
  assert.equal(await shadowListbox.count(), 1, 'A shadow-root Combobox input click must keep its listbox open.');
  await shadowOutsideTarget.click();
  assert.equal(await shadowListbox.count(), 0, 'A shadow-root Combobox must close after a composed outside click.');
  assert.equal(
    await shadowOutsideTarget.evaluate((element) => document.activeElement === element),
    true,
    'Shadow Combobox outside dismissal must preserve focus on the clicked light-DOM target.'
  );
  assert.equal(await hasInertAncestor(portalDialogTrigger), false);
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');

  const nestedDialogTrigger = page.getByTestId('nested-dialog-trigger');
  await nestedDialogTrigger.click();
  const nestedDialog = page.getByRole('dialog', { name: 'Nested dialog' });
  await nestedDialog.getByTestId('nested-sheet-trigger').click();
  const nestedSheet = page.getByRole('dialog', { name: 'Nested sheet' });
  assert.equal(await page.locator('html').getAttribute('data-zdp-modal-layer-count'), '2');
  assert.equal(await hasInertAncestor(nestedDialog), true, 'The lower modal layer must become inert.');
  assert.equal(await hasInertAncestor(nestedSheet), false, 'The top modal layer must remain interactive.');
  assert.equal(await hasInertAncestor(nestedDialogTrigger), true, 'Background controls must remain inert.');
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
  assert.equal(await hasInertAncestor(nestedSheet), false, 'A surviving top layer must stay interactive.');
  assert.equal(await hasInertAncestor(nestedDialogTrigger), true, 'Background isolation must survive non-LIFO close.');
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
  assert.equal(await hasInertAncestor(nestedDialogTrigger), false, 'Final close must restore background interaction.');
  assert.equal(await page.getByTestId('preexisting-inert').getAttribute('inert'), '', 'Pre-existing inert state must survive modal cleanup.');

  await nestedDialogTrigger.click();
  const reopenedNestedDialog = page.getByRole('dialog', { name: 'Nested dialog' });
  const reopenedNestedSheetTrigger = reopenedNestedDialog.getByTestId('nested-sheet-trigger');
  await reopenedNestedSheetTrigger.click();
  const reopenedNestedSheet = page.getByRole('dialog', { name: 'Nested sheet' });
  await page.keyboard.press('Escape');
  assert.equal(await reopenedNestedSheet.count(), 0);
  assert.equal(await hasInertAncestor(reopenedNestedDialog), false, 'Closing the top layer must reactivate the lower layer.');
  assert.equal(
    await reopenedNestedSheetTrigger.evaluate((element) => document.activeElement === element),
    true,
    'Top-layer close must restore focus inside the reactivated lower layer.'
  );
  assert.equal(await hasInertAncestor(nestedDialogTrigger), true);
  await page.keyboard.press('Escape');
  assert.equal(await reopenedNestedDialog.count(), 0);
  assert.equal(await hasInertAncestor(nestedDialogTrigger), false);
  assert.equal(await page.getByTestId('preexisting-inert').getAttribute('inert'), '');

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
  assert.equal(await hasInertAncestor(trigger), true, `${dialogName} must make its background trigger inert.`);

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
  assert.equal(await hasInertAncestor(trigger), false, `${dialogName} must restore background interaction.`);
  assert.equal(await page.getByTestId('preexisting-inert').getAttribute('inert'), '');

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
  assert.equal(await hasInertAncestor(trigger), false, `${dialogName} backdrop close must restore background interaction.`);
  assert.equal(await page.getByTestId('preexisting-inert').getAttribute('inert'), '');
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
  assert.equal(await hasInertAncestor(trigger), true, `${dialogName} must keep its background inert while protected.`);

  await closeButton.click();
  assert.equal(await dialog.count(), 0);
  assert.equal(await trigger.evaluate((element) => document.activeElement === element), true);
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  assert.equal(await page.locator('html').getAttribute('data-zdp-modal-layer-count'), null);
  assert.equal(await hasInertAncestor(trigger), false, `${dialogName} explicit close must restore background interaction.`);
  assert.equal(await page.getByTestId('preexisting-inert').getAttribute('inert'), '');
}

async function hasInertAncestor(locator) {
  return locator.evaluate((element) => element.closest('[inert]') !== null);
}

async function verifyShadowModalBoundary({
  page,
  triggerTestId,
  dialogName,
  closeName,
  lastTestId,
  lastRole,
  lastName
}) {
  const trigger = page.getByTestId(triggerTestId);
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: dialogName });
  const closeButton = dialog.getByRole('button', { name: closeName });
  const lastControl = lastTestId
    ? dialog.getByTestId(lastTestId)
    : dialog.getByRole(lastRole, { name: lastName });

  assert.equal(await dialog.count(), 1);
  assert.equal(await hasInertAncestor(trigger), true, `${dialogName} must isolate shadow-root sibling controls.`);
  assert.equal(await hasInertAncestor(dialog), false);
  assert.equal(await isDeepActive(closeButton), true);
  await page.keyboard.press('Shift+Tab');
  assert.equal(await isDeepActive(lastControl), true, `${dialogName} focus must wrap backward inside the shadow root.`);
  await page.keyboard.press('Tab');
  assert.equal(await isDeepActive(closeButton), true, `${dialogName} focus must wrap forward inside the shadow root.`);
  await page.keyboard.press('Escape');
  assert.equal(await dialog.count(), 0);
  assert.equal(await isDeepActive(trigger), true, `${dialogName} must restore its inner shadow trigger focus.`);
  assert.equal(await hasInertAncestor(trigger), false);
}

async function isDeepActive(locator) {
  return locator.evaluate((element) => {
    let activeElement = document.activeElement;

    while (activeElement instanceof HTMLElement && activeElement.shadowRoot?.activeElement) {
      activeElement = activeElement.shadowRoot.activeElement;
    }

    return activeElement === element;
  });
}

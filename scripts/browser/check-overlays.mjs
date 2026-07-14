import assert from 'node:assert/strict';
import { hasInertAncestor, isDeepActive } from './browser-assertions.mjs';

export async function verifyOverlayContracts(page) {
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
  await pointerDownOn(page, outsideOverlayTarget);
  assert.equal(await menu.count(), 1, 'Menu must remain open until the outside pointer sequence produces a click.');
  assert.equal(
    await outsideOverlayTarget.evaluate((element) => document.activeElement === element),
    true,
    'Outside pointerdown must move focus before Menu dismissal.'
  );
  await page.mouse.up();
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
  await pointerDownOn(page, outsideOverlayTarget);
  assert.equal(await popover.count(), 1, 'Popover must remain open until outside pointerup produces a click.');
  assert.equal(
    await outsideOverlayTarget.evaluate((element) => document.activeElement === element),
    true,
    'Outside pointerdown must move focus before Popover dismissal.'
  );
  await page.mouse.up();
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
  await pointerDownOn(page, outsideOverlayTarget);
  assert.equal(await protectedPopover.count(), 1, 'Outside pointerdown opt-out must keep the Popover open.');
  await page.mouse.up();
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

  const combobox = page.getByRole('combobox', { name: 'Owner', exact: true });
  const comboboxOutsideTarget = page.getByTestId('card-link');
  await combobox.click();
  const listbox = page.getByRole('listbox', { name: 'Owner list' });
  assert.equal(await listbox.count(), 1);
  await pointerDownOn(page, comboboxOutsideTarget);
  assert.equal(await listbox.count(), 1, 'Combobox must remain open until outside pointerup produces a click.');
  assert.equal(
    await comboboxOutsideTarget.evaluate((element) => document.activeElement === element),
    true,
    'Outside pointerdown must move focus before Combobox dismissal.'
  );
  await page.mouse.up();
  assert.equal(await listbox.count(), 0, 'Combobox must close after the outside click completes.');
  assert.equal(await combobox.getAttribute('aria-expanded'), 'false');
  assert.equal(await combobox.getAttribute('aria-controls'), null);
}

export async function verifyShadowOverlayContracts(page) {
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
  await pointerDownOn(page, shadowOutsideTarget);
  assert.equal(
    await shadowMenu.count(),
    1,
    'A shadow-root Menu must remain open until the composed outside pointer sequence produces a click.'
  );
  assert.equal(
    await shadowOutsideTarget.evaluate((element) => document.activeElement === element),
    true,
    'Composed outside pointerdown must move focus before shadow Menu dismissal.'
  );
  await page.mouse.up();
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
  await pointerDownOn(page, shadowOutsideTarget);
  assert.equal(
    await shadowPopover.count(),
    1,
    'A shadow-root Popover must remain open until the composed outside pointer sequence produces a click.'
  );
  assert.equal(
    await shadowOutsideTarget.evaluate((element) => document.activeElement === element),
    true,
    'Composed outside pointerdown must move focus before shadow Popover dismissal.'
  );
  await page.mouse.up();
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
  await pointerDownOn(page, shadowOutsideTarget);
  assert.equal(
    await shadowListbox.count(),
    1,
    'A shadow-root Combobox must remain open until the composed outside pointer sequence produces a click.'
  );
  assert.equal(
    await shadowOutsideTarget.evaluate((element) => document.activeElement === element),
    true,
    'Composed outside pointerdown must move focus before shadow Combobox dismissal.'
  );
  await page.mouse.up();
  assert.equal(await shadowListbox.count(), 0, 'A shadow-root Combobox must close after a composed outside click.');
  assert.equal(
    await shadowOutsideTarget.evaluate((element) => document.activeElement === element),
    true,
    'Shadow Combobox outside dismissal must preserve focus on the clicked light-DOM target.'
  );
  const portalDialogTrigger = page.getByTestId('portal-dialog-trigger');
  assert.equal(await hasInertAncestor(portalDialogTrigger), false);
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
}

async function pointerDownOn(page, target) {
  await target.click({ trial: true });
  const bounds = await target.boundingBox();
  assert.ok(bounds, 'The outside-dismiss target must have a measurable pointer hit area.');
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
}

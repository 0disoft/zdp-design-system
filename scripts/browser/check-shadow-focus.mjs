import assert from 'node:assert/strict';
import { isDeepActive } from './browser-assertions.mjs';

export async function verifyShadowFocusContracts(page) {
  for (const [trigger, name, closeName, lastId] of [
    ['dialog-trigger', 'Review changes', 'Close dialog', 'dialog-last-action'],
    ['sheet-trigger', 'Release details', 'Close sheet', 'sheet-last-action']
  ]) {
    await page.getByTestId(trigger).click();
    const panel = page.getByRole('dialog', { name, exact: true });
    const close = panel.getByRole('button', { name: closeName, exact: true });
    await panel.evaluate((element) => {
      // The base fixture deliberately has aria-hidden controls that remain native Tab stops.
      for (const hidden of element.querySelectorAll('[aria-hidden="true"]')) hidden.inert = true;
      const host = document.createElement('div');
      host.dataset.testid = 'inner-focus-host';
      element.append(host);
      // Prime the cache before attaching a root, which does not emit a mutation.
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
      host.attachShadow({ mode: 'open' }).innerHTML = '<button>Inner shadow first</button><slot></slot><button>Inner shadow last</button>';
      const slotted = document.createElement('button');
      slotted.textContent = 'Slotted action';
      host.append(slotted);
    });
    const first = panel.getByRole('button', { name: 'Inner shadow first', exact: true });
    const slotted = panel.getByRole('button', { name: 'Slotted action', exact: true });
    const last = panel.getByRole('button', { name: 'Inner shadow last', exact: true });
    await panel.getByTestId(lastId).focus();
    for (const target of [first, slotted, last, close]) {
      await page.keyboard.press('Tab');
      assert.equal(await isDeepActive(target), true, `${name} must include shadow and slotted controls in Tab order.`);
    }
    await page.keyboard.press('Shift+Tab');
    assert.equal(await isDeepActive(last), true, 'Backward wrapping must reach the last shadow control.');
    await last.evaluate((element) => { element.disabled = true; });
    await slotted.focus();
    await page.keyboard.press('Tab');
    assert.equal(await isDeepActive(close), true, 'Mutations inside the shadow root must invalidate the focus cache.');
    await panel.getByTestId('inner-focus-host').evaluate((host) => { host.inert = true; });
    await panel.getByTestId(lastId).focus();
    await page.keyboard.press('Tab');
    assert.equal(await isDeepActive(close), true, 'Inert shadow hosts must exclude all inner controls.');
    const host = panel.getByTestId('inner-focus-host');
    await host.evaluate((element) => { element.inert = false; element.tabIndex = -1; });
    await panel.getByTestId(lastId).focus();
    await page.keyboard.press('Tab');
    assert.equal(await isDeepActive(close), true, 'Negative shadow hosts must not prevent forward wrapping.');
    await page.keyboard.press('Shift+Tab');
    assert.equal(await isDeepActive(panel.getByTestId(lastId)), true, 'Negative shadow hosts must exclude their inner controls from backward wrapping.');
    await host.evaluate((element) => element.removeAttribute('tabindex'));
    await close.focus();
    await page.keyboard.press('Shift+Tab');
    assert.equal(await isDeepActive(slotted), true, 'Restoring the shadow focus scope must refresh the cached controls.');
    await page.keyboard.press('Escape');
  }

  const style = await page.addStyleTag({ content: '.zdp-dialog__close { visibility: collapse !important; }' });
  try {
    await page.getByTestId('dialog-trigger').click();
    const panel = page.getByRole('dialog', { name: 'Review changes', exact: true });
    assert.equal(await panel.evaluate((element) => element.contains(document.activeElement)), true, 'Collapsed close controls must not prevent initial modal focus.');
    assert.equal(await panel.locator('.zdp-dialog__close').evaluate((element) => document.activeElement === element), false);
    await page.keyboard.press('Escape');
  } finally {
    await style.evaluate((element) => element.remove());
  }
}

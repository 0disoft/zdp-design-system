import assert from 'node:assert/strict';

const shortcuts = [
  { key: 'ArrowLeft', altKey: true },
  { key: 'ArrowRight', altKey: true },
  { key: 'Home', ctrlKey: true },
  { key: 'End', ctrlKey: true },
  { key: 'ArrowLeft', metaKey: true }
];

async function verifyPreservedKeys(control, keys = shortcuts) {
  for (const shortcut of keys) {
    const allowed = await control.evaluate((element, init) => element.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })
    ), shortcut);
    assert.equal(allowed, true, 'Modified navigation keys must keep their browser default.');
    assert.equal(await control.evaluate((element) => element.ownerDocument.activeElement === element), true, 'Modified navigation keys must not move control focus.');
  }
}

export async function verifyReservedNavigationContracts(page) {
  const frame = page.frameLocator('[title="Embedded keyboard controls"]');
  for (const [role, name, itemRole, attribute] of [
    ['tablist', 'Embedded tabs', 'tab', 'aria-selected'],
    ['radiogroup', 'Embedded choices', 'radio', 'aria-checked'],
    ['radiogroup', 'Embedded languages', 'radio', 'aria-checked'],
    ['radiogroup', 'Embedded text sizes', 'radio', 'aria-checked']
  ]) {
    const group = frame.getByRole(role, { name, exact: true });
    const control = group.locator(`[role="${itemRole}"][${attribute}="true"]`);
    const originalId = await control.getAttribute('id');
    await control.focus();
    await verifyPreservedKeys(control);
    assert.equal(await control.getAttribute('id'), originalId, 'Browser shortcuts must not change the selected item.');
  }
  const trigger = page.getByRole('button', { name: 'Browser actions', exact: true });
  await trigger.focus();
  await verifyPreservedKeys(trigger, [{ key: 'ArrowDown', ctrlKey: true }]);
  assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
  await trigger.click();
  const item = page.getByRole('menu', { name: 'Browser actions', exact: true }).getByRole('menuitem', { name: 'Edit release', exact: true });
  await verifyPreservedKeys(item, [{ key: 'Home', ctrlKey: true }, { key: 'End', ctrlKey: true }, { key: 'ArrowDown', metaKey: true }]);
  await item.press('Escape');
}

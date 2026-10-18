import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createZdpModalFocus } from '../src/lib/modal-focus.js';
import type { ZdpModalLayerHandle } from '../src/lib/modal-layer.js';

function fixture() {
  let open = true;
  let focusCount = 0;
  let target: HTMLElement | null = null;
  const trigger = { isConnected: true, focus: () => focusCount++ } as unknown as HTMLElement;
  const ownerDocument = { activeElement: null, defaultView: null } as unknown as Document;
  const panel = {
    isConnected: true, ownerDocument, children: [], focus: () => focusCount++
  } as unknown as HTMLElement;
  const modalLayer: ZdpModalLayerHandle = {
    setActive() {}, destroy() {},
    setFocusReturnTarget(value) { target = value; },
    takeFocusReturnTarget() { return target; }
  };
  const controller = createZdpModalFocus({
    getOpen: () => open, getPanel: () => panel, getLayer: () => panel, modalLayer
  });
  return {
    controller, trigger,
    setOpen(value: boolean) { open = value; controller.sync(); },
    setTarget(value: HTMLElement) { target = value; },
    focusCount: () => focusCount
  };
}

test('closing before tick cancels initial focus and restores the trigger once', async () => {
  const f = fixture();
  f.controller.sync();
  f.setTarget(f.trigger);
  f.setOpen(false);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(f.focusCount(), 1);
  f.controller.destroy();
});

test('reopening invalidates the previous transition and focuses only once', async () => {
  const f = fixture();
  f.controller.sync();
  f.setOpen(false);
  f.setOpen(true);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(f.focusCount(), 1);
  f.controller.destroy();
});

test('destroying before tick cancels initial focus', async () => {
  const f = fixture();
  f.controller.sync();
  f.controller.destroy();
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(f.focusCount(), 0);
});

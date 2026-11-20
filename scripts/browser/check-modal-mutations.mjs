import assert from 'node:assert/strict';

export async function verifyFocusableAttributeMutations(page, moduleUrl) {
  const results = await page.evaluate(async (url) => {
    const { collectZdpTabbableElements, getZdpActiveElement } = await import(url);
    const { createZdpModalFocus } = await import(url.replace('focusable.ts', 'modal-focus.ts'));
    const results = [];
    for (const shadow of [false, true]) {
      for (const attribute of ['data-focus-state', 'id', 'aria-expanded', 'outside-visibility']) {
        for (const delivery of ['same-task', 'observer-callback']) {
          const ancestor = document.createElement('div');
          const root = document.createElement('section');
          root.style.cssText = 'width:500px;height:200px;';
          root.tabIndex = -1;
          const first = document.createElement('button');
          first.id = 'attribute-first';
          const middle = document.createElement('button');
          middle.id = 'attribute-middle';
          root.append(first, middle);
          let tree = root;
          if (shadow) {
            const host = document.createElement('div');
            root.append(host);
            tree = host.attachShadow({ mode: 'open' });
          }
          const style = document.createElement('style');
          style.textContent = '[data-focus-state="hidden"] > button, #focus-closed > button, [aria-expanded="false"] > button { display:none; } #attribute-tail { visibility: var(--test-tail-visibility, visible); }';
          const group = document.createElement('div');
          const tail = document.createElement('button');
          tail.id = 'attribute-tail';
          group.append(tail);
          tree.append(style, group);
          ancestor.append(root);
          document.body.append(ancestor);
          const controller = createZdpModalFocus({
            getOpen: () => true, getPanel: () => root, getLayer: () => root,
            modalLayer: { setFocusReturnTarget() {}, takeFocusReturnTarget() { return null; } }
          });
          const ids = () => collectZdpTabbableElements(root).map(element => element.id);
          const reverseTab = () => controller.handleKeydown(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, cancelable: true }));
          try {
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            const before = root.getBoundingClientRect();
            const initial = ids();
            first.focus();
            reverseTab();
            first.focus();
            if (attribute === 'outside-visibility') {
              ancestor.style.setProperty('--test-tail-visibility', 'hidden');
            } else {
              group.setAttribute(attribute, attribute === 'id' ? 'focus-closed' : attribute === 'aria-expanded' ? 'false' : 'hidden');
            }
            if (delivery === 'observer-callback') await new Promise(resolve => queueMicrotask(resolve));
            const hidden = ids();
            reverseTab();
            const hiddenFocus = getZdpActiveElement(document)?.id;
            if (attribute === 'outside-visibility') {
              ancestor.style.removeProperty('--test-tail-visibility');
            } else {
              group.removeAttribute(attribute);
            }
            if (delivery === 'observer-callback') await new Promise(resolve => queueMicrotask(resolve));
            const restored = ids();
            first.focus();
            reverseTab();
            const after = root.getBoundingClientRect();
            results.push({ shadow, attribute, delivery, initial, hidden, hiddenFocus, restored,
              restoredFocus: getZdpActiveElement(document)?.id,
              unchangedBounds: before.width === after.width && before.height === after.height });
          } finally {
            controller.destroy();
            ancestor.remove();
          }
        }
      }
    }
    return results;
  }, moduleUrl);
  for (const { shadow, attribute, delivery, ...result } of results) {
    assert.deepEqual(result, {
      initial: ['attribute-first', 'attribute-middle', 'attribute-tail'],
      hidden: ['attribute-first', 'attribute-middle'], hiddenFocus: 'attribute-middle',
      restored: ['attribute-first', 'attribute-middle', 'attribute-tail'],
      restoredFocus: 'attribute-tail', unchangedBounds: true
    }, `${attribute}, shadow=${shadow}, ${delivery}: exclude hidden controls and restore visible controls to the modal Tab order.`);
  }
  console.log(`Modal focus with visibility changes: ${results.length} scenarios passed.`);
}

export async function verifyModalMutationContracts(page) {
  await verifyModalFocusReturnAcrossShadowRoots(page);
  for (const [triggerId, name] of [
    ['dialog-trigger', 'Review changes'],
    ['sheet-trigger', 'Release details'],
    ['term-sheet-trigger', 'Browser term'],
    ['shadow-dialog-trigger', 'Shadow dialog']
  ]) {
    await page.getByTestId(triggerId).click();
    const panel = page.getByRole('dialog', { name, exact: true });
    await panel.waitFor();
    await panel.evaluate((element) => {
      const layer = element.closest('[data-zdp-modal-layer-root]');
      const button = document.createElement('button');
      button.dataset.testid = 'late-modal-sibling';
      button.textContent = 'Late sibling';
      layer.parentNode.append(button);
      const bodyButton = document.createElement('button');
      bodyButton.dataset.testid = 'late-modal-body-sibling';
      bodyButton.textContent = 'Late body sibling';
      document.body.append(bodyButton);
      const preexisting = document.createElement('button');
      preexisting.dataset.testid = 'late-preexisting-inert';
      preexisting.inert = true;
      document.body.append(preexisting);
    });
    const sibling = page.getByTestId('late-modal-sibling');
    const bodySibling = page.getByTestId('late-modal-body-sibling');
    await page.waitForFunction(() => document.querySelector('[data-testid="late-modal-body-sibling"]').inert);
    assert.equal(await sibling.evaluate((element) => element.inert), true);
    assert.equal(await bodySibling.evaluate((element) => {
      element.focus();
      return document.activeElement === element;
    }), false, `${name} must prevent focus on late background controls.`);

    // Moving a managed sibling into the modal must restore its interactivity.
    await panel.evaluate((element) => {
      const root = element.getRootNode();
      element.append(root.querySelector('[data-testid="late-modal-sibling"]'));
    });
    await page.waitForFunction(() => {
      const host = document.querySelector('[data-testid="shadow-modal-host"]');
      const sibling = document.querySelector('[data-testid="late-modal-sibling"]') ?? host.shadowRoot.querySelector('[data-testid="late-modal-sibling"]');
      return sibling && !sibling.inert;
    });
    assert.equal(await sibling.evaluate((element) => {
      element.focus();
      const root = element.getRootNode();
      return root.activeElement === element;
    }), true);
    await sibling.evaluate((element) => {
      const layer = element.closest('[data-zdp-modal-layer-root]');
      layer.parentNode.append(element);
    });
    await page.waitForFunction(() => {
      const host = document.querySelector('[data-testid="shadow-modal-host"]');
      const sibling = document.querySelector('[data-testid="late-modal-sibling"]') ?? host.shadowRoot.querySelector('[data-testid="late-modal-sibling"]');
      return sibling?.inert;
    });
    await panel.getByRole('button', { name: /^Close/ }).click();
    await panel.waitFor({ state: 'detached' });
    assert.equal(await sibling.evaluate((element) => element.inert), false);
    assert.equal(await bodySibling.evaluate((element) => element.inert), false);
    assert.equal(await page.getByTestId('late-preexisting-inert').evaluate((element) => element.inert), true);
    await sibling.evaluate((element) => element.remove());
    await page.evaluate(() => {
      document.querySelector('[data-testid="late-modal-body-sibling"]').remove();
      document.querySelector('[data-testid="late-preexisting-inert"]').remove();
    });
  }
  await page.evaluate(() => {
    const button = document.createElement('button');
    button.dataset.testid = 'after-modal-close';
    document.body.append(button);
  });
  await page.waitForTimeout(0);
  assert.equal(await page.getByTestId('after-modal-close').evaluate((element) => element.inert), false);
  await page.getByTestId('after-modal-close').evaluate((element) => element.remove());
}

async function verifyModalFocusReturnAcrossShadowRoots(page) {
  const results = await page.evaluate(async (rootPath) => {
    const { createZdpModalLayer } = await import(`/@fs/${rootPath}/src/lib/modal-layer.ts`);
    const results = [];
    for (const shadowDepth of [0, 1, 2]) {
      for (const method of ['close', 'destroy']) {
        const launcher = document.createElement('button');
        const lower = document.createElement('section');
        const higher = document.createElement('section');
        const higherAction = document.createElement('button');
        higher.append(higherAction);
        document.body.append(launcher, lower, higher);
        let triggerTree = lower;
        for (let depth = 0; depth < shadowDepth; depth++) {
          const host = document.createElement('div');
          triggerTree.append(host);
          triggerTree = host.attachShadow({ mode: 'open' });
        }
        const trigger = document.createElement('button');
        triggerTree.append(trigger);
        const lowerLayer = createZdpModalLayer();
        const higherLayer = createZdpModalLayer();
        try {
          launcher.focus();
          lowerLayer.setFocusReturnTarget(launcher);
          lowerLayer.setActive(true, lower);
          trigger.focus();
          higherLayer.setFocusReturnTarget(triggerTree.activeElement ?? document.activeElement);
          higherLayer.setActive(true, higher);
          higherAction.focus();

          if (method === 'destroy') lowerLayer.destroy();
          else lowerLayer.setActive(false);
          lower.remove();
          const keptTopFocus = document.activeElement === higherAction;
          higherLayer.setActive(false);
          higherLayer.takeFocusReturnTarget()?.focus();
          results.push({ shadowDepth, method, keptTopFocus, restored: document.activeElement === launcher });
        } finally {
          higherLayer.destroy();
          lowerLayer.destroy();
          launcher.remove();
          lower.remove();
          higher.remove();
        }
      }
    }
    return results;
  }, process.cwd().replaceAll('\\', '/'));

  assert.deepEqual(results.filter(result => !result.keptTopFocus || !result.restored), [],
    'Closing a lower layer must forward focus return across shadow roots.');
  console.log(`Modal focus return across shadow roots: ${results.length} scenarios passed.`);
}

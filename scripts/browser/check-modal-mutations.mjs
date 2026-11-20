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
  await verifyModalInertRemoval(page);
  await verifyModalFocusReturnAcrossShadowRoots(page);
  await verifyModalReattachment(page);
  await verifySlottedModalIsolation(page);
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

async function verifyModalInertRemoval(page) {
  const result = await page.evaluate(async (rootPath) => {
    const { createZdpModalLayer } = await import(`/@fs/${rootPath}/src/lib/modal-layer.ts`);
    const panel = document.createElement('section');
    const managed = document.createElement('button');
    const preexisting = document.createElement('button');
    const untouched = document.createElement('button');
    preexisting.inert = untouched.inert = true;
    document.body.append(panel, managed, preexisting, untouched);
    const layer = createZdpModalLayer();
    try {
      layer.setActive(true, panel);
      // An app unlocks background controls without adding or removing nodes.
      managed.inert = preexisting.inert = false;
      await Promise.resolve();
      const reachable = [managed, preexisting].map((button) => {
        button.focus();
        return document.activeElement === button;
      });
      layer.setActive(false);
      return { reachable, afterClose: [managed, preexisting, untouched].map(button => button.inert) };
    } finally {
      layer.destroy();
      for (const node of [panel, managed, preexisting, untouched]) node.remove();
    }
  }, process.cwd().replaceAll('\\', '/'));
  assert.deepEqual(result, { reachable: [false, false], afterClose: [false, false, true] },
    'Background controls must stay isolated after inert is cleared, while close respects the updated app state.');
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

async function verifyModalReattachment(page) {
  const results = await page.evaluate(async (rootPath) => {
    const { createZdpModalLayer } = await import(`/@fs/${rootPath}/src/lib/modal-layer.ts`);
    const checkpoint = () => new Promise(resolve => queueMicrotask(resolve));
    const results = [];
    for (const shadow of [false, true]) {
      const formerParent = document.createElement('section');
      const destination = document.createElement('section');
      const portal = document.createElement('div');
      const background = document.createElement('button');
      const host = document.createElement('div');
      const modal = document.createElement('div');
      const modalAction = document.createElement('button');
      modal.append(modalAction);
      (shadow ? host.attachShadow({ mode: 'open' }) : host).append(modal);
      formerParent.append(host);
      destination.append(portal);
      document.body.append(formerParent, destination, background);
      const layer = createZdpModalLayer();
      try {
        layer.setActive(true, modal);
        const initiallyIsolated = background.inert;
        host.remove();
        await checkpoint();
        const detachedWasReleased = !background.inert;
        portal.append(host);
        await checkpoint();
        background.focus();
        const reattachedWasIsolated = background.inert && document.activeElement !== background;
        layer.setActive(false);
        background.focus();
        const closedWasReleased = !background.inert && document.activeElement === background;
        results.push({ shadow, initiallyIsolated, detachedWasReleased, reattachedWasIsolated, closedWasReleased });
      } finally {
        layer.destroy();
        formerParent.remove();
        destination.remove();
        background.remove();
      }
    }
    return results;
  }, process.cwd().replaceAll('\\', '/'));

  for (const { shadow, ...result } of results) {
    assert.deepEqual(result, {
      initiallyIsolated: true, detachedWasReleased: true, reattachedWasIsolated: true, closedWasReleased: true
    }, `Modal isolation must resume after reattaching inside an existing portal (shadow=${shadow}).`);
  }
  console.log(`Modal reattachment: ${results.length} portal scenarios passed.`);
}

async function verifySlottedModalIsolation(page) {
  const result = await page.evaluate(async (rootPath) => {
    const { createZdpModalLayer } = await import(`/@fs/${rootPath}/src/lib/modal-layer.ts`);
    const settle = () => new Promise(resolve => queueMicrotask(resolve));
    const host = document.createElement('section');
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <section><slot name="first"></slot><button>First background</button></section>
      <section><slot name="second"></slot><button>Second background</button></section>
    `;
    host.innerHTML = `
      <div slot="first"><section><button>Modal action</button></section></div>
      <button slot="first">Slotted background</button>
    `;
    document.body.append(host);
    const [firstRegion, secondRegion] = shadow.children;
    const [assignedBranch, slottedBackground] = host.children;
    const modal = assignedBranch.firstElementChild;
    const action = modal.firstElementChild;
    const backgrounds = [firstRegion.lastElementChild, secondRegion.lastElementChild, slottedBackground];
    const layer = createZdpModalLayer();
    function canFocus(target) {
      target.blur();
      target.focus();
      return target.getRootNode().activeElement === target;
    }
    function readFocus() {
      return { action: canFocus(action), reachableBackgrounds: backgrounds.filter(canFocus).length };
    }

    try {
      layer.setActive(true, modal);
      const opened = readFocus();
      assignedBranch.slot = 'second';
      await settle();
      const reassigned = readFocus();
      assignedBranch.slot = 'missing';
      await settle();
      const unassigned = readFocus();
      assignedBranch.slot = 'first';
      await settle();
      const returned = readFocus();
      layer.setActive(false);
      return { opened, reassigned, unassigned, returned, closed: readFocus() };
    } finally {
      layer.destroy();
      host.remove();
    }
  }, process.cwd().replaceAll('\\', '/'));

  assert.deepEqual(result, {
    opened: { action: true, reachableBackgrounds: 0 },
    reassigned: { action: true, reachableBackgrounds: 0 },
    unassigned: { action: false, reachableBackgrounds: 3 },
    returned: { action: true, reachableBackgrounds: 0 },
    closed: { action: true, reachableBackgrounds: 3 }
  }, 'Modal isolation must follow the visible slot path and release it when the modal leaves that path.');
  console.log('Slotted modal isolation: 5 lifecycle states passed.');
}

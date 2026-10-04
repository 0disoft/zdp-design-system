import assert from 'node:assert/strict';

export async function verifyModalMutationContracts(page) {
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

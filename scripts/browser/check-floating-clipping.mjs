import assert from 'node:assert/strict';

export async function verifyFloatingClippingContracts(page, { kind, trigger, panel }) {
  const anchor = page.getByTestId(`edge-${kind}-anchor`);
  const previous = await anchor.evaluate(anchor => {
    const previous = { style: anchor.getAttribute('style'), className: anchor.className };
    const frame = document.createElement('div');
    frame.dataset.testid = 'floating-clipping-frame';
    Object.assign(frame.style, { position: 'fixed', left: '24px', top: '100px', width: '300px', height: '280px', overflow: 'hidden', zIndex: '2000' });
    anchor.before(frame); frame.append(anchor);
    anchor.className = `edge-${anchor.dataset.testid.includes('menu') ? 'menu' : 'popover'}-anchor`;
    Object.assign(anchor.style, { position: 'absolute', right: '12px', bottom: '12px' });
    return previous;
  });
  try {
    for (const configuration of [
      { transform: 'none', contain: 'none', overflow: 'hidden', constrained: false },
      { transform: 'translateZ(0)', contain: 'none', overflow: 'hidden', constrained: true },
      { transform: 'translateZ(0)', contain: 'none', overflow: 'auto', constrained: true },
      { transform: 'none', contain: 'paint', overflow: 'hidden', constrained: true }
    ]) {
      await page.getByTestId('floating-clipping-frame').evaluate((frame, style) => Object.assign(frame.style, style), configuration);
      await trigger.click();
      await panel.waitFor();
      await page.waitForFunction(({ kind, constrained }) => {
        const panel = document.querySelector(`[data-testid="edge-${kind}-anchor"] .zdp-${kind}__panel`);
        const frame = document.querySelector('[data-testid="floating-clipping-frame"]');
        const rect = panel?.getBoundingClientRect();
        if (!rect || !rect.width || !rect.height) return false;
        if (constrained) {
          const boundary = frame.getBoundingClientRect();
          if (rect.left < boundary.left + 7 || rect.right > boundary.right - 7 ||
            rect.top < boundary.top + 7 || rect.bottom > boundary.bottom - 7) return false;
        }
        return [[rect.left + 6, rect.top + 6], [rect.right - 6, rect.bottom - 6]].every(([x, y]) => panel.contains(document.elementFromPoint(x, y)));
      }, { kind, constrained: configuration.constrained }).catch(async error => {
        const actual = await panel.evaluate(element => ({
          panel: element.getBoundingClientRect().toJSON(),
          boundary: element.closest('[data-testid="floating-clipping-frame"]').getBoundingClientRect().toJSON()
        }));
        throw new Error(`${kind} clipping: ${JSON.stringify({ configuration, actual })}`, { cause: error });
      });
      assert.equal(await panel.evaluate(element => element.scrollHeight > element.clientHeight), true, 'Long panels scroll instead of clipping');
      await page.keyboard.press('Escape');
      assert.equal(await trigger.evaluate(element => element === document.activeElement), true);
    }
  } finally {
    await anchor.evaluate((anchor, previous) => {
      const frame = anchor.parentElement;
      frame.before(anchor); frame.remove();
      anchor.className = previous.className;
      if (previous.style === null) anchor.removeAttribute('style'); else anchor.setAttribute('style', previous.style);
    }, previous);
  }
}

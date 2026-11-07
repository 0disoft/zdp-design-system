import assert from 'node:assert/strict';

/** Reproduce fields flush against a clipping container, not only a padded form. */
export async function verifyFieldFocusContracts(page) {
  const viewport = page.viewportSize();
  let checks = 0;
  try {
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const forcedColors of ['none', 'active']) {
        await page.emulateMedia({ forcedColors });
        for (const theme of ['light', 'dark']) for (const direction of ['ltr', 'rtl']) {
          const root = page.getByTestId(`control-consistency-${theme}-${direction}`);
          await root.evaluate(element => {
            const reset = document.createElement('div');
            reset.className = 'zdp-surface-reset';
            reset.dataset.focusReset = '';
            reset.innerHTML = '<input aria-label="Native focus input"><textarea aria-label="Native focus note"></textarea><select aria-label="Native focus selection"><option>Team</option></select>';
            element.append(reset);
          });
          const selectors = ['.zdp-input', '.zdp-textarea', '.zdp-select', '.zdp-combobox__control',
            '.zdp-command-field', '[data-focus-reset] input', '[data-focus-reset] textarea', '[data-focus-reset] select'];
          try {
            for (const selector of selectors) {
              const frame = root.locator(selector).first();
              const field = ['.zdp-combobox__control', '.zdp-command-field'].includes(selector) ? frame.locator('input') : frame;
              await frame.evaluate(element => {
                const clip = document.createElement('div');
                clip.dataset.focusClip = '';
                clip.style.cssText = 'overflow:hidden;padding:0;border:0;min-width:0;';
                element.before(clip);
                clip.append(element);
              });
              try {
                const methods = await field.evaluate(el => el.tagName === 'SELECT') ? ['keyboard'] : ['mouse', 'keyboard'];
                for (const method of methods) {
                  await field.scrollIntoViewIfNeeded();
                  if (method === 'mouse') await field.click();
                  else { await page.keyboard.press('Tab'); await field.focus(); }
                  const style = await frame.evaluate(element => {
                    const css = getComputedStyle(element);
                    const backgrounds = [];
                    for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
                      backgrounds.unshift(getComputedStyle(ancestor).backgroundColor);
                    }
                    return { style: css.outlineStyle, width: parseFloat(css.outlineWidth),
                      offset: parseFloat(css.outlineOffset), color: css.outlineColor, backgrounds };
                  });
                  const label = `${width}/${forcedColors}/${theme}/${direction}/${selector}/${method}`;
                  assert.equal(style.style, 'solid', `${label}: visible focus ring`);
                  assert.ok(style.width >= 2 && style.width + style.offset <= 0, `${label}: ring fits inside clipping bounds`);
                  const png = (await frame.screenshot()).toString('base64');
                  const edges = await page.evaluate(async ({ png, color, backgrounds, depth }) => {
                    const picture = new Image();
                    picture.src = `data:image/png;base64,${png}`;
                    await picture.decode();
                    const canvas = document.createElement('canvas');
                    canvas.width = picture.width; canvas.height = picture.height;
                    const context = canvas.getContext('2d');
                    // System Highlight can be translucent on Linux. Compare the
                    // painted composite, not the uncomposited CSS color and alpha.
                    context.fillStyle = 'Canvas'; context.fillRect(0, 0, 1, 1);
                    for (const background of backgrounds) {
                      context.fillStyle = background; context.fillRect(0, 0, 1, 1);
                    }
                    context.fillStyle = color; context.fillRect(0, 0, 1, 1);
                    const expected = [...context.getImageData(0, 0, 1, 1).data];
                    context.drawImage(picture, 0, 0);
                    // Fractional layout coordinates can shift a cropped edge by
                    // one pixel. Inspect the inset stroke band on every side.
                    return ['top', 'bottom', 'left', 'right'].map(side => {
                      for (let inset = 0; inset <= depth + 1; inset++) {
                        const [x, y] = side === 'top' ? [canvas.width / 2, inset]
                          : side === 'bottom' ? [canvas.width / 2, canvas.height - 1 - inset]
                          : side === 'left' ? [inset, canvas.height / 2]
                          : [canvas.width - 1 - inset, canvas.height / 2];
                        const pixel = [...context.getImageData(Math.floor(x), Math.floor(y), 1, 1).data];
                        if (pixel.every((value, index) => Math.abs(value - expected[index]) <= 3)) return true;
                      }
                      return false;
                    });
                  }, { png, color: style.color, backgrounds: style.backgrounds,
                    depth: Math.max(1, Math.floor(-style.offset - style.width / 2)) });
                  assert.deepEqual(edges, [true, true, true, true], `${label}: all four edges remain painted (${style.color})`);
                  checks++;
                  if (selector === '.zdp-combobox__control') await field.press('Escape');
                }
              } finally {
                await frame.evaluate(element => {
                  const clip = element.parentElement;
                  clip.before(element); clip.remove();
                });
              }
            }
            const button = root.locator('.zdp-button--secondary').first();
            await button.focus();
            assert.ok(await button.evaluate(el => parseFloat(getComputedStyle(el).outlineOffset) > 0), 'Button focus placement stays unchanged');
          } finally {
            await root.locator('[data-focus-reset]').evaluate(el => el.remove());
          }
        }
      }
    }
    console.log(`Field focus: ${checks} mouse/keyboard cases passed with four painted edges.`);
  } finally {
    await page.emulateMedia({ forcedColors: 'none' });
    await page.setViewportSize(viewport);
  }
}

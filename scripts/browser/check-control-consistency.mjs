import assert from 'node:assert/strict';

export async function verifyControlConsistency(page) {
  for (const theme of ['light', 'dark']) {
    for (const direction of ['ltr', 'rtl']) {
      const fixture = page.getByTestId(`control-consistency-${theme}-${direction}`);
      const styles = await fixture.evaluate(root => {
        const selectors = ['.zdp-input', '.zdp-select', '.zdp-combobox__control', '.zdp-command-field'];
        const measure = element => {
          const style = getComputedStyle(element);
          return { height: element.getBoundingClientRect().height, background: style.backgroundColor,
            border: style.borderTopColor, radius: style.borderRadius, font: style.fontSize, lineHeight: style.lineHeight };
        };
        const fields = selectors.map(selector => measure(root.querySelector(selector)));
        const small = root.querySelector('[data-testid="small-controls"]');
        const actions = ['.zdp-button', '.zdp-icon-button', '.zdp-menu__trigger'].map(selector => measure(root.querySelector(selector)));
        const smallControls = ['.zdp-combobox__control', '.zdp-command-field', '.zdp-button', '.zdp-icon-button'].map(selector => measure(small.querySelector(selector)));
        const arrow = root.querySelector('.zdp-select__arrow');
        const mark = root.querySelector('.zdp-combobox__mark');
        const control = root.querySelector('.zdp-combobox__control');
        const selectRect = root.querySelector('.zdp-select').getBoundingClientRect();
        const controlRect = control.getBoundingClientRect();
        const arrowRect = arrow.getBoundingClientRect();
        const markRect = mark.getBoundingClientRect();
        const endInset = (outer, inner) => root.dir === 'rtl' ? inner.left - outer.left : outer.right - inner.right;
        const glyph = getComputedStyle(mark, '::before');
        const menu = root.querySelector('.zdp-menu__trigger');
        const menuMark = root.querySelector('.zdp-menu__trigger-mark');
        const disclosure = root.querySelector('.zdp-disclosure');
        const disclosureMark = root.querySelector('.zdp-disclosure__mark');
        const navigation = ['.zdp-tabs__tab', '.zdp-segmented-control__item'].map(selector => measure(root.querySelector(selector)));
        const reference = document.createElement('span');
        root.append(reference);
        const colorsFor = (background, color, border) => {
          reference.style.background = `var(--zdp-color-${background})`;
          reference.style.color = `var(--zdp-color-${color})`;
          reference.style.border = border ? `1px solid var(--zdp-color-${border})` : '1px solid transparent';
          const style = getComputedStyle(reference);
          return {background: style.backgroundColor, color: style.color, border: style.borderTopColor};
        };
        const expectedPrimary = colorsFor('surface-inverse', 'ink-inverse', 'line-strong');
        const expectedSecondary = colorsFor('surface-panel', 'ink-strong', 'line-strong');
        const expectedSelected = colorsFor('interaction-selected', 'ink-strong', null);
        reference.remove();
        const colors = selector => {
          const style = getComputedStyle(root.querySelector(selector));
          return {background: style.backgroundColor, color: style.color, border: style.borderTopColor};
        };
        return { fields, actions, smallControls, expectedSurface: getComputedStyle(root.querySelector('[data-testid="field-surface-reference"]')).backgroundColor,
          primary: colors('.zdp-button--primary'), solid: colors('.zdp-icon-button--solid'),
          secondary: colors('.zdp-button--secondary'), selected: colors('.zdp-segmented-control__item[aria-checked="true"]'),
          textScale: colors('.zdp-text-scale-control__item[aria-checked="true"]'),
          locale: colors('.zdp-locale-switcher__item[aria-checked="true"]'),
          segmentSurface: getComputedStyle(root.querySelector('.zdp-segmented-control')).backgroundColor,
          localeSurface: getComputedStyle(root.querySelector('.zdp-locale-switcher')).backgroundColor,
          expectedPrimary, expectedSecondary, expectedSelected,
          navigation,
          inset: [endInset(selectRect, arrowRect), endInset(controlRect, markRect),
            endInset(menu.getBoundingClientRect(), menuMark.getBoundingClientRect()),
            endInset(disclosure.getBoundingClientRect(), disclosureMark.getBoundingClientRect())],
          glyph: [getComputedStyle(arrow).maskImage, glyph.maskImage, getComputedStyle(menuMark, '::before').maskImage, getComputedStyle(disclosureMark, '::before').maskImage],
          glyphSize: [arrowRect.width, Number.parseFloat(glyph.width), menuMark.getBoundingClientRect().width, disclosureMark.getBoundingClientRect().width],
          menuSurface: getComputedStyle(menu).backgroundColor,
          buttonSurface: getComputedStyle(root.querySelector('.zdp-button')).backgroundColor,
          nativePickerDisplay: getComputedStyle(root.querySelector('.zdp-select'), '::picker-icon').display };
      });
      const baseline = styles.fields[0];
      for (const action of [styles.primary, styles.solid]) {
        assert.equal(action.background, styles.expectedPrimary.background, `${theme}/${direction}: primary surface must resolve in its own theme`);
        assert.equal(action.color, styles.expectedPrimary.color, `${theme}/${direction}: primary text must resolve in its own theme`);
      }
      assert.deepEqual(styles.secondary, styles.expectedSecondary, `${theme}/${direction}: secondary action must use the outlined panel surface`);
      assert.deepEqual(styles.selected, styles.expectedSelected, `${theme}/${direction}: selected control must use its own theme's soft surface`);
      assert.deepEqual(styles.textScale, styles.expectedSelected, `${theme}/${direction}: selected text scale must use a background without an outline`);
      assert.deepEqual(styles.locale, styles.expectedSelected, `${theme}/${direction}: selected language must use a background without an outline`);
      assert.notEqual(styles.selected.background, styles.segmentSurface, 'Selected segment must remain distinct from the group surface');
      assert.notEqual(styles.locale.background, styles.localeSurface, 'Selected language must remain distinct from the group surface');
      assert.equal(baseline.background, styles.expectedSurface, 'Field aliases must resolve in the current nested theme');
      for (const field of styles.fields) assert.deepEqual(field, baseline, `${theme}/${direction}: field frame and typography must match`);
      for (const action of styles.actions) {
        assert.equal(action.height, baseline.height, `${theme}/${direction}: md actions and fields must share height`);
        assert.equal(action.radius, baseline.radius);
      }
      assert.equal(styles.actions[0].font, baseline.font, 'Text actions and fields must share typography');
      assert.equal(styles.actions[2].font, baseline.font, 'Menu actions and fields must share typography');
      for (const navigation of styles.navigation) {
        assert.equal(navigation.height, baseline.height, 'Navigation controls share the md height');
        assert.equal(navigation.font, baseline.font);
        assert.equal(navigation.lineHeight, baseline.lineHeight);
      }
      assert.equal(styles.menuSurface, styles.buttonSurface, 'Secondary actions share the same resting surface');
      for (const control of styles.smallControls) assert.equal(control.height, styles.smallControls[0].height, 'All sm controls must share height');
      for (const inset of styles.inset) assert.ok(Math.abs(inset - 12) < 0.6, `${theme}/${direction}: all indicators share the 12px inline-end inset (${styles.inset})`);
      assert.deepEqual(styles.glyphSize, [20, 20, 20, 20]);
      for (const glyph of styles.glyph) assert.equal(glyph, styles.glyph[0], 'Selection and expansion controls share the same source glyph');
      assert.equal(styles.nativePickerDisplay, 'none', 'Native picker must not replace the shared indicator');
      const disclosureTrigger = fixture.locator('.zdp-disclosure__trigger');
      await disclosureTrigger.click();
      const textScale = fixture.locator('.zdp-text-scale-control__item[aria-checked="true"]');
      await textScale.focus();
      await textScale.press('ArrowRight');
      const focus = await textScale.evaluate(element => {
        const style = getComputedStyle(element);
        return {outline: style.outlineStyle, width: style.outlineWidth, border: style.borderTopColor};
      });
      assert.equal(focus.outline, 'solid', 'Selected controls must retain visible keyboard focus');
      assert.equal(focus.width, '3px');
      assert.notEqual(focus.border, 'rgba(0, 0, 0, 0)', 'Focus border must override the transparent selected border');
      await textScale.press('Tab');
      assert.equal(await disclosureTrigger.getAttribute('aria-expanded'), 'true');
      await page.waitForFunction(testId => {
        const mark = document.querySelector(`[data-testid="${testId}"] .zdp-disclosure__mark`);
        return getComputedStyle(mark, '::before').rotate === '180deg';
      }, `control-consistency-${theme}-${direction}`);
      await disclosureTrigger.click();
    }
  }
  await verifyControlStatePriority(page);
}

async function verifyControlStatePriority(page) {
  const initialViewport = page.viewportSize();
  try {
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 844 });
      for (const theme of ['light', 'dark']) {
        const fixture = page.getByTestId(`control-consistency-${theme}-ltr`);
        const expected = await fixture.evaluate(root => {
          const reference = document.createElement('span');
          root.append(reference);
          reference.style.borderColor = 'var(--zdp-color-accent-danger)';
          const danger = getComputedStyle(reference).borderTopColor;
          reference.style.borderColor = 'var(--zdp-color-focus-line)';
          const focus = getComputedStyle(reference).borderTopColor;
          reference.remove();
          return { danger, focus };
        });
        const invalid = fixture.getByTestId('validation-controls');
        for (const selector of ['.zdp-input', '.zdp-textarea', '.zdp-select', '.zdp-combobox__input',
          '.zdp-choice--checkbox .zdp-choice__input', '.zdp-choice--radio .zdp-choice__input', '.zdp-switch__input']) {
          const input = invalid.locator(selector);
          const frame = selector.includes('combobox') ? input.locator('..') :
            selector.includes('choice') || selector.includes('switch') ? input.locator('+ span') : input;
          const hoverTarget = selector.includes('choice') || selector.includes('switch') ? input.locator('..') : input;
          await hoverTarget.hover();
          await page.keyboard.press('Tab');
          await input.focus();
          await frame.evaluate(waitForFiniteMotion);
          assert.equal(await frame.evaluate(element => getComputedStyle(element).borderTopColor), expected.danger,
            `${width}/${theme}/${selector}: hover and keyboard focus must preserve the error border`);
          assert.equal(await frame.evaluate(element => getComputedStyle(element).outlineWidth), '3px',
            `${width}/${theme}/${selector}: invalid controls must also show the keyboard outline`);
        }
        for (const selector of ['.zdp-button--primary', '.zdp-button--secondary', '.zdp-icon-button--solid',
          '.zdp-icon-button--ghost', '.zdp-segmented-control__item', '.zdp-text-scale-control__item', '.zdp-locale-switcher__item', '.zdp-confirm-action']) {
          const control = fixture.locator(selector).first();
          await control.hover();
          await page.keyboard.press('Tab');
          await control.focus();
          await page.keyboard.down('Space');
          try {
            await control.evaluate(waitForFiniteMotion);
            assert.equal(await control.evaluate(element => getComputedStyle(element).borderTopColor), expected.focus,
              `${width}/${theme}/${selector}: pressing a hovered control must preserve its keyboard focus border`);
          } finally {
            await page.keyboard.up('Space');
          }
        }
        const disabled = fixture.getByTestId('disabled-controls');
        for (const selector of ['.zdp-input', '.zdp-textarea', '.zdp-select', '.zdp-combobox__control',
          '.zdp-button', '.zdp-choice--checkbox', '.zdp-choice--radio', '.zdp-switch', '.zdp-resizable-split-pane__separator']) {
          const control = disabled.locator(selector);
          const measure = element => {
            const frame = element.querySelector('.zdp-choice__mark, .zdp-switch__track') ?? element;
            const style = getComputedStyle(frame, frame.matches('[role="separator"]') ? '::before' : null);
            return [style.backgroundColor, style.borderTopColor, style.color, getComputedStyle(element).opacity];
          };
          await page.mouse.move(0, 0);
          const resting = await control.evaluate(measure);
          await control.hover();
          await control.evaluate(waitForFiniteMotion);
          assert.deepEqual(await control.evaluate(measure), resting,
            `${width}/${theme}/${selector}: disabled controls must not acquire hover colors`);
        }
      }
    }
  } finally {
    await page.setViewportSize(initialViewport);
  }
}

async function waitForFiniteMotion(element) {
  // A focus/hover change can replace a transition and reject its finished promise.
  // Wait for the replacement too before asserting the final computed styles.
  while (true) {
    const animations = element.getAnimations({ subtree: true }).filter(animation =>
      (animation.playState === 'running' || animation.pending) &&
      Number.isFinite(animation.effect?.getComputedTiming().endTime));
    if (animations.length === 0) return;
    await Promise.all(animations.map(animation => animation.finished.catch(error => {
      if (error.name !== 'AbortError') throw error;
    })));
  }
}

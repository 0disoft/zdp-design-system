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
        return { fields, actions, smallControls, expectedSurface: getComputedStyle(root.querySelector('[data-testid="field-surface-reference"]')).backgroundColor,
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
      assert.equal(await disclosureTrigger.getAttribute('aria-expanded'), 'true');
      await page.waitForFunction(testId => {
        const mark = document.querySelector(`[data-testid="${testId}"] .zdp-disclosure__mark`);
        return getComputedStyle(mark, '::before').rotate === '180deg';
      }, `control-consistency-${theme}-${direction}`);
      await disclosureTrigger.click();
    }
  }
}

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
        return { fields, actions, smallControls, expectedSurface: getComputedStyle(root.querySelector('[data-testid="field-surface-reference"]')).backgroundColor,
          inset: [endInset(selectRect, arrowRect), endInset(controlRect, markRect)],
          glyph: [getComputedStyle(arrow).maskImage, glyph.maskImage], glyphSize: [arrowRect.width, Number.parseFloat(glyph.width)],
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
      for (const control of styles.smallControls) assert.equal(control.height, styles.smallControls[0].height, 'All sm controls must share height');
      assert.ok(Math.abs(styles.inset[0] - styles.inset[1]) < 0.6, `${theme}/${direction}: arrow inline-end inset must match`);
      assert.deepEqual(styles.glyphSize, [20, 20]);
      assert.equal(styles.glyph[0], styles.glyph[1], 'Select and Combobox must use the same source glyph');
      assert.equal(styles.nativePickerDisplay, 'none', 'Native picker must not replace the shared indicator');
    }
  }
}

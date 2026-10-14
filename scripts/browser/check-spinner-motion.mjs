import assert from 'node:assert/strict';

export async function verifySpinnerMotion(page, spinners) {
  assert.equal(await spinners.count(), 3, 'Exercise small, medium and large spinners.');
  for (const [index, size] of [16, 20, 36].entries()) {
    const spinner = spinners.nth(index);
    const originalTheme = await spinner.getAttribute('data-zdp-theme');
    try {
      for (const theme of ['light', 'dark']) {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        const rotation = await spinner.evaluate((root, theme) => {
          root.setAttribute('data-zdp-theme', theme);
          const mark = root.querySelector('.zdp-spinner__mark');
          const animation = mark.getAnimations()[0];
          if (!animation) throw new Error('Spinner must rotate.');
          const timing = animation.effect.getTiming();
          animation.pause();
          const samples = [0, 250, 500, 750].map(time => {
            animation.currentTime = time;
            const matrix = new DOMMatrix(getComputedStyle(mark).transform);
            const rect = root.getBoundingClientRect();
            return { x: matrix.a, y: matrix.b, width: rect.width, height: rect.height };
          });
          const border = getComputedStyle(mark).borderTopWidth;
          animation.play();
          return { samples, border, duration: timing.duration, easing: timing.easing, iterations: timing.iterations };
        }, theme);
        assert.equal(rotation.duration, 1000);
        assert.equal(rotation.easing, 'linear');
        assert.equal(rotation.iterations, Infinity);
        assert.equal(rotation.border, '2px');
        const positions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        rotation.samples.forEach((sample, i) => {
          assert.ok(Math.abs(sample.x - positions[i][0]) < 0.01 && Math.abs(sample.y - positions[i][1]) < 0.01,
            `${theme}/${size}: spinner must rotate steadily through each quarter turn.`);
          assert.equal(sample.width, size, 'Rotation must preserve the outer width.');
          assert.equal(sample.height, size, 'Rotation must preserve the outer height.');
        });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        const reduced = await spinner.locator('.zdp-spinner__mark').evaluate(mark => ({
          animation: getComputedStyle(mark).animationName,
          transform: getComputedStyle(mark).transform,
          width: mark.getBoundingClientRect().width,
          border: getComputedStyle(mark).borderTopWidth
        }));
        assert.deepEqual(reduced, { animation: 'none', transform: 'none', width: size, border: '2px' },
          'Reduced motion must stop rotation while preserving the spinner shape.');
      }
    } finally {
      await spinner.evaluate((root, theme) => {
        if (theme === null) root.removeAttribute('data-zdp-theme'); else root.setAttribute('data-zdp-theme', theme);
      }, originalTheme);
      await page.emulateMedia({ reducedMotion: null });
    }
  }
}

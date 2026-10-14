import assert from 'node:assert/strict';

export async function verifyWaitingProgress(page, progress) {
  const originalTheme = await progress.getAttribute('data-zdp-theme');
  const originalDir = await progress.getAttribute('dir');
  try {
    assert.equal(await progress.getAttribute('aria-valuenow'), null, 'Unknown progress must not announce a percentage.');
    for (const theme of ['light', 'dark']) {
      for (const dir of ['ltr', 'rtl']) {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        const motion = await progress.evaluate((root, { theme, dir }) => {
          root.setAttribute('data-zdp-theme', theme);
          root.setAttribute('dir', dir);
          const track = root.querySelector('.zdp-progress__track');
          const bar = root.querySelector('.zdp-progress__bar');
          const trackRect = track.getBoundingClientRect();
          const animation = bar.getAnimations()[0];
          assertAnimation(animation);
          animation.pause();
          const samples = [0, 700, 1400].map(time => {
            animation.currentTime = time;
            const rect = bar.getBoundingClientRect();
            return { left: rect.left, right: rect.right, width: rect.width };
          });
          animation.play();
          return { samples, track: { left: trackRect.left, right: trackRect.right, width: track.clientWidth } };

          function assertAnimation(animation) {
            if (!animation || animation.effect.getTiming().iterations !== Infinity) {
              throw new Error('Waiting progress must have an ongoing CSS animation.');
            }
          }
        }, { theme, dir });
        for (const sample of motion.samples) {
          assert.ok(Math.abs(sample.width / motion.track.width - 0.3) < 0.01, 'Waiting segment must occupy 30% of the track.');
          assert.ok(sample.left >= motion.track.left - 1 && sample.right <= motion.track.right + 1,
            `${theme}/${dir}: waiting segment must remain inside the track.`);
        }
        const distance = motion.samples[2].left - motion.samples[0].left;
        assert.ok(dir === 'ltr' ? distance > motion.track.width * 0.6 : distance < -motion.track.width * 0.6,
          `${theme}/${dir}: waiting motion must follow the reading direction.`);

        await page.emulateMedia({ reducedMotion: 'reduce' });
        const reduced = await progress.evaluate(root => {
          const track = root.querySelector('.zdp-progress__track').getBoundingClientRect();
          const bar = root.querySelector('.zdp-progress__bar');
          const rect = bar.getBoundingClientRect();
          return { animation: getComputedStyle(bar).animationName, width: rect.width / track.width,
            centerOffset: Math.abs((rect.left + rect.right) / 2 - (track.left + track.right) / 2) };
        });
        assert.equal(reduced.animation, 'none', 'Reduced motion must stop the waiting animation.');
        assert.ok(reduced.width > 0.28 && reduced.width < 0.31 && reduced.centerOffset < 1,
          'Reduced motion must show a short centered segment rather than a completed bar.');
      }
    }
  } finally {
    await progress.evaluate((root, { theme, dir }) => {
      if (theme === null) root.removeAttribute('data-zdp-theme'); else root.setAttribute('data-zdp-theme', theme);
      if (dir === null) root.removeAttribute('dir'); else root.setAttribute('dir', dir);
    }, { theme: originalTheme, dir: originalDir });
    await page.emulateMedia({ reducedMotion: null });
  }
}

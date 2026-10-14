import assert from 'node:assert/strict';

export async function verifySkeletonMotion(page, animated, stationary) {
  assert.equal(await animated.count(), 3, 'Exercise text, block and avatar placeholders.');
  assert.equal(await stationary.count(), 3);
  for (let index = 0; index < 3; index += 1) {
    const root = animated.nth(index);
    const fixed = stationary.nth(index);
    const originalTheme = await root.getAttribute('data-zdp-theme');
    const originalFixedTheme = await fixed.getAttribute('data-zdp-theme');
    try {
      for (const theme of ['light', 'dark']) {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        const pulse = await root.evaluate((root, theme) => {
          root.setAttribute('data-zdp-theme', theme);
          const lines = Array.from(root.querySelectorAll('.zdp-skeleton__line'));
          const animations = lines.map(line => line.getAnimations()[0]);
          if (animations.some(animation => !animation || animation.effect.getTiming().iterations !== Infinity)) {
            throw new Error('Every animated placeholder line must pulse.');
          }
          animations.forEach(animation => animation.pause());
          const samples = [0, 900, 1800].map(time => {
            animations.forEach(animation => { animation.currentTime = time; });
            const rect = root.getBoundingClientRect();
            return { opacity: lines.map(line => Number(getComputedStyle(line).opacity)), width: rect.width, height: rect.height };
          });
          animations.forEach(animation => animation.play());
          return { samples, hidden: root.getAttribute('aria-hidden') };
        }, theme);
        assert.equal(pulse.hidden, 'true', 'Decorative skeletons must stay hidden from assistive technology.');
        for (const [i, expected] of [0.72, 0.86, 1].entries()) {
          assert.ok(pulse.samples[i].opacity.every(opacity => Math.abs(opacity - expected) < 0.01),
            `${theme}: pulse must stay gentle and never disappear.`);
          assert.equal(pulse.samples[i].width, pulse.samples[0].width);
          assert.equal(pulse.samples[i].height, pulse.samples[0].height);
        }

        await fixed.evaluate((root, theme) => root.setAttribute('data-zdp-theme', theme), theme);
        await assertStatic(fixed, 'The disabled option');
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await assertStatic(root, 'Reduced motion');
      }
    } finally {
      for (const [element, theme] of [[root, originalTheme], [fixed, originalFixedTheme]]) {
        await element.evaluate((root, theme) => {
          if (theme === null) root.removeAttribute('data-zdp-theme'); else root.setAttribute('data-zdp-theme', theme);
        }, theme);
      }
      await page.emulateMedia({ reducedMotion: null });
    }
  }

  async function assertStatic(root, label) {
    const lines = await root.locator('.zdp-skeleton__line').evaluateAll(lines => lines.map(line => ({
      animation: getComputedStyle(line).animationName, opacity: getComputedStyle(line).opacity
    })));
    assert.ok(lines.every(line => line.animation === 'none' && line.opacity === '1'),
      `${label} must keep a clear static placeholder.`);
  }
}

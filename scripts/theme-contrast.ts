/** Check semantic foreground/background pairs in both theme fallback palettes. */
export function checkThemeContrast(css: string): string[] {
  const failures: string[] = [];
  const modernOffset = css.indexOf('@supports (color: oklch');
  const fallbackCss = css.slice(0, modernOffset < 0 ? css.length : modernOffset);
  for (const theme of ['light', 'dark']) {
    const block = fallbackCss.match(new RegExp(`\\[data-zdp-theme="${theme}"\\] \\{([^}]+)\\}`))?.[1];
    const colors = new Map([...block?.matchAll(/--zdp-color-([\w-]+):\s*(#[\da-f]{6});/gi) ?? []]
      .map((match) => [match[1], match[2]]));
    const pairs: [string, string, number][] = [
      ['ink-inverse', 'surface-inverse', 4.5],
      ['ink-inverse', 'ink-normal', 4.5],
      ['ink-inverse', 'accent-danger', 4.5],
      ['ink-inverse', 'accent-primary-strong', 3],
      ['focus-text', 'focus-surface', 4.5],
      ['focus-text', 'accent-primary', 4.5],
      ['selection-text', 'selection-surface', 4.5],
      ['line-strong', 'surface-panel', 3]
    ];
    for (const surface of ['canvas', 'panel', 'raised']) {
      for (const ink of ['strong', 'normal', 'muted']) pairs.push([`ink-${ink}`, `surface-${surface}`, 4.5]);
      for (const status of ['success', 'warning', 'danger']) pairs.push([`accent-${status}`, `surface-${surface}`, 4.5]);
    }
    for (const state of ['hover', 'pressed', 'selected']) {
      for (const ink of ['strong', 'normal']) pairs.push([`ink-${ink}`, `interaction-${state}`, 4.5]);
    }
    for (const [foreground, background, minimum] of pairs) {
      const fg = colors.get(foreground);
      const bg = colors.get(background);
      if (!fg || !bg) {
        failures.push(`${theme}: missing color pair ${foreground}/${background}.`);
        continue;
      }
      const foregroundLuminance = luminance(fg);
      const backgroundLuminance = luminance(bg);
      const ratio = (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
        (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
      if (ratio < minimum) failures.push(`${theme}: ${foreground}/${background} contrast ${ratio.toFixed(2)} must reach ${minimum}:1.`);
    }
  }
  return failures;
}

function luminance(hex: string): number {
  return ([0.2126, 0.7152, 0.0722] as const).reduce((sum, weight, index) => {
    const value = parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16) / 255;
    const linear = value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    return sum + linear * weight;
  }, 0);
}

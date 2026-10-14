// Mixing flat colors for interaction states does not introduce a decorative effect.
export const decorativeEffectNeedles = [
  'linear-gradient',
  'radial-gradient',
  'conic-gradient',
  'box-shadow',
  'text-shadow',
  'drop-shadow(',
  'filter:',
  'backdrop-filter',
  'transition: all',
  'animation:',
  '@keyframes',
  '.zdp-button::before',
  '.zdp-button::after',
  '.zdp-icon-button::before',
  '.zdp-icon-button::after',
  'translate3d(',
  'translateY('
] as const;

export const overRoundedUsageNeedles = [
  'var(--zdp-radius-pill)',
  'border-radius: 999px',
  'border-radius: 9999px',
  'border-radius: 9999rem'
] as const;

export function assertNoDecorativeEffects(
  failures: string[],
  targetName: string,
  source: string
): void {
  for (const forbiddenText of decorativeEffectNeedles) {
    if (source.includes(forbiddenText)) {
      failures.push(`${targetName} must not include ${forbiddenText}.`);
    }
  }
}

// Only the indeterminate Progress bar may use this functional waiting motion.
export function withoutProgressWaitingMotion(source: string): string {
  return source
    .replace(/\.zdp-progress\[data-indeterminate="true"\] \.zdp-progress__bar\s*\{[^{}]*\}/g,
      (rule) => rule
        .replace('animation: zdp-progress-waiting 1.4s ease-in-out infinite alternate;', '')
        .replace('animation: none;', ''))
    .replace(/@keyframes zdp-progress-waiting\s*\{\s*from\s*\{\s*transform: translateX\(0\);\s*\}\s*to\s*\{\s*transform: translateX\(var\(--zdp-progress-waiting-travel\)\);\s*\}\s*\}/g, '');
}

export function assertNoOverRoundedUsage(
  failures: string[],
  targetName: string,
  source: string
): void {
  for (const forbiddenText of overRoundedUsageNeedles) {
    if (source.includes(forbiddenText)) {
      failures.push(`${targetName} must not include over-rounded radius usage ${forbiddenText}.`);
    }
  }
}

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
  'color-mix(',
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

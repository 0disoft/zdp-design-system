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

// Allow only the scoped functional loading animations.
export function withoutLoadingMotion(source: string): string {
  return source
    .replace(/\.zdp-progress\[data-indeterminate="true"\] \.zdp-progress__bar\s*\{[^{}]*\}/g,
      (rule) => rule
        .replace('animation: zdp-progress-waiting 1.4s ease-in-out infinite alternate;', '')
        .replace('animation: none;', ''))
    .replace(/@keyframes zdp-progress-waiting\s*\{\s*from\s*\{\s*transform: translateX\(0\);\s*\}\s*to\s*\{\s*transform: translateX\(var\(--zdp-progress-waiting-travel\)\);\s*\}\s*\}/g, '')
    .replace(/\.zdp-spinner__mark\s*\{[^{}]*\}/g,
      (rule) => rule
        .replace('animation: zdp-spinner-rotate 1s linear infinite;', '')
        .replace('animation: none;', ''))
    .replace(/@keyframes zdp-spinner-rotate\s*\{\s*to\s*\{\s*transform: rotate\(1turn\);\s*\}\s*\}/g, '')
    .replace(/\.zdp-skeleton\[data-animated="true"\] \.zdp-skeleton__line\s*\{[^{}]*\}/g,
      (rule) => rule
        .replace('animation: zdp-skeleton-pulse 1.8s ease-in-out infinite alternate;', '')
        .replace('animation: none;', ''))
    .replace(/@keyframes zdp-skeleton-pulse\s*\{\s*from\s*\{\s*opacity: 0\.72;\s*\}\s*to\s*\{\s*opacity: 1;\s*\}\s*\}/g, '')
    .replace(/(?:\.zdp-button\[data-loading="true"\] )?\.zdp-button__spinner\s*\{[^{}]*\}/g,
      (rule) => rule
        .replace('animation: zdp-button-loading-rotate 1s linear infinite;', '')
        .replace('animation: none;', ''))
    .replace(/@keyframes zdp-button-loading-rotate\s*\{\s*to\s*\{\s*transform: rotate\(1turn\);\s*\}\s*\}/g, '')
    .replace(/\.zdp-icon-button\[data-loading="true"\] \.zdp-icon-button__spinner\s*\{[^{}]*\}/g,
      (rule) => rule
        .replace('animation: zdp-icon-button-loading-rotate 1s linear infinite;', '')
        .replace('animation: none;', ''))
    .replace(/@keyframes zdp-icon-button-loading-rotate\s*\{\s*to\s*\{\s*transform: rotate\(1turn\);\s*\}\s*\}/g, '')
    .replace(/\.zdp-confirm-action\[data-pending="true"\] \.zdp-confirm-action__spinner\s*\{[^{}]*\}/g,
      (rule) => rule
        .replace('animation: zdp-confirm-action-pending-rotate 1s linear infinite;', '')
        .replace('animation: none;', ''))
    .replace(/@keyframes zdp-confirm-action-pending-rotate\s*\{\s*to\s*\{\s*transform: rotate\(1turn\);\s*\}\s*\}/g, '')
    .replace(/\.zdp-code-block__copy\[data-copy-state="copying"\] \.zdp-code-block__copy-spinner\s*\{[^{}]*\}/g,
      (rule) => rule
        .replace('animation: zdp-code-copy-rotate 1s linear infinite;', '')
        .replace('animation: none;', ''))
    .replace(/@keyframes zdp-code-copy-rotate\s*\{\s*to\s*\{\s*transform: rotate\(1turn\);\s*\}\s*\}/g, '');
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

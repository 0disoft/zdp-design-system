
import type { PreviewCheckContext } from './context';

export function checkPreviewFoundation(context: PreviewCheckContext): void {
const { styleEntry, tokenStyle, brandFontStyle, expressiveFontStyle, localeFontStyle, failures } = context;



for (const requiredText of [
  '.zdp-surface-reset a:not(.zdp-button):not(.zdp-icon-button):not(.zdp-share-action)',
  'font-family: var(--zdp-font-family-sans)',
  'Noto Sans KR Variable',
  '--zdp-font-family-latin',
  '--zdp-font-family-korean',
  '--zdp-font-family-chinese',
  '--zdp-font-family-devanagari',
  '--zdp-font-family-brand',
  '--zdp-font-family-expression-script',
  '--zdp-font-family-expression-inscription',
  '--zdp-font-family-expression-sketch',
  '--zdp-font-family-expression-editorial',
  '--zdp-font-family-expression-sans',
  '--zdp-font-family-expression-keyboard',
  '.zdp-surface-reset:lang(ko)',
  '.zdp-surface-reset:lang(zh)',
  '.zdp-surface-reset:lang(hi)',
  '.zdp-surface-reset:lang(ja)',
  'text-decoration-line: none',
  'color var(--zdp-motion-fast) ease',
  '--zdp-color-focus-surface',
  '--zdp-color-focus-text',
  '--zdp-color-focus-line',
  '--zdp-color-scrollbar-track',
  '--zdp-color-scrollbar-thumb',
  '--zdp-color-scrollbar-thumb-hover',
  '--zdp-color-selection-surface',
  '--zdp-color-selection-text',
  '--zdp-control-scrollbar-size',
  'scrollbar-width: thin',
  '::-webkit-scrollbar-thumb',
  '.zdp-surface-reset::selection',
  '.zdp-surface-reset *::selection',
  'background: var(--zdp-color-selection-surface)',
  'color: var(--zdp-color-selection-text)',
  'border-bottom: var(--zdp-control-focus-underline-width) solid var(--zdp-color-focus-line)',
  '.zdp-surface-reset :where(input, textarea, select):focus-visible',
  'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
  '--zdp-type-body-line-height: 1.6',
  '--zdp-font-line-height-normal: 1.6'
]) {
  if (!tokenStyle.includes(requiredText)) {
    failures.push(`Token style contract is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  'font-family: "Playwrite AU VIC Guides"',
  'font-display: swap',
  'fontsource/fonts/playwrite-au-vic-guides@5.2.6/latin-400-normal.woff2'
]) {
  if (!brandFontStyle.includes(requiredText)) {
    failures.push(`Brand font style contract is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  '@fontsource/tangerine@5.3.0/400.css',
  '@fontsource/tangerine@5.3.0/700.css',
  '@fontsource/caesar-dressing@5.3.0/400.css',
  '@fontsource/copse@5.3.0/400.css',
  '@fontsource/fredericka-the-great@5.3.0/400.css',
  '@fontsource/google-sans@5.3.1/400.css',
  '@fontsource/google-sans@5.3.1/700.css',
  '@fontsource/libertinus-keyboard@5.3.0/400.css',
  '@fontsource-variable/merriweather@5.3.0/index.css',
  '@fontsource-variable/cabin@5.3.0/index.css'
]) {
  if (!expressiveFontStyle.includes(requiredText)) {
    failures.push(`Expressive font style contract is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  '@fontsource-variable/manrope@5.2.8/index.css',
  '@fontsource-variable/noto-sans-sc@5.2.10/index.css',
  '@fontsource-variable/noto-sans-devanagari@5.2.8/index.css'
]) {
  if (!localeFontStyle.includes(requiredText)) {
    failures.push(`Locale font style contract is missing ${requiredText}.`);
  }
}
}

export function checkPreviewImports(context: PreviewCheckContext): void {
const { styleEntry, localeFontStyle, failures } = context;
for (const importPath of ['./tokens.css', './components.css']) {
  if (!styleEntry.includes(`@import "${importPath}";`)) {
    failures.push(`Missing style entry import ${importPath}.`);
  }
}

for (const [entryName, entry] of [['styles.css', styleEntry], ['locale-fonts.css', localeFontStyle]] as const) {
  if (!entry.includes('@fontsource-variable/noto-sans-kr@5/index.css')) {
    failures.push(`${entryName} must load the Noto Sans KR variable webfont.`);
  }
}
}

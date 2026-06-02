import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { assertNoDecorativeEffects, assertNoOverRoundedUsage } from './style-contract';

const root = process.cwd();
const previewPath = join(root, 'preview', 'index.html');
const styleEntryPath = join(root, 'src', 'styles', 'index.css');
const tokenStylePath = join(root, 'src', 'styles', 'tokens.css');
const localeFontStylePath = join(root, 'src', 'styles', 'locale-fonts.css');
const componentStylePath = join(root, 'src', 'styles', 'components.css');
const failures: string[] = [];

const [preview, styleEntry, tokenStyle, localeFontStyle, componentStyle] = await Promise.all([
  readFile(previewPath, 'utf8'),
  readFile(styleEntryPath, 'utf8'),
  readFile(tokenStylePath, 'utf8'),
  readFile(localeFontStylePath, 'utf8'),
  readFile(componentStylePath, 'utf8')
]);

for (const importPath of ['./tokens.css', './components.css']) {
  if (!styleEntry.includes(`@import "${importPath}";`)) {
    failures.push(`Missing style entry import ${importPath}.`);
  }
}

for (const requiredText of [
  '../src/styles/index.css',
  'data-zdp-theme="light"',
  'data-zdp-theme="dark"',
  'Pretendard-first multiscript text',
  'lang="zh"',
  'lang="hi"',
  'zdp-button zdp-button--primary zdp-button--md',
  'zdp-icon-button zdp-icon-button--solid zdp-icon-button--md',
  'zdp-surface zdp-surface--panel zdp-surface--padding-lg',
  '--zdp-color-accent-primary',
  '--zdp-color-accent-success',
  '--zdp-color-accent-warning',
  '--zdp-color-accent-danger',
  '--zdp-type-body-size',
  '--zdp-type-body-small-size',
  '--zdp-type-caption-size',
  '--zdp-type-data-size',
  '--zdp-breakpoint-tablet',
  '--zdp-control-height-md',
  '--zdp-control-border-width',
  '--zdp-control-focus-outline-width',
  '--zdp-i18n-overflow-wrap',
  'Foundation tokens',
  'Search Design System',
  '출시 노트 보기',
  '업데이트 보기',
  '자세히 보기'
]) {
  if (!preview.includes(requiredText)) {
    failures.push(`Preview is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  '.zdp-surface-reset a:not(.zdp-button):not(.zdp-icon-button)',
  'font-family: var(--zdp-font-family-sans)',
  'Pretendard Variable',
  '--zdp-font-family-latin',
  '--zdp-font-family-korean',
  '--zdp-font-family-chinese',
  '--zdp-font-family-devanagari',
  '.zdp-surface-reset:lang(ko)',
  '.zdp-surface-reset:lang(zh)',
  '.zdp-surface-reset:lang(hi)',
  'text-decoration-line: none',
  'color var(--zdp-motion-fast) ease',
  '--zdp-color-focus-surface',
  '--zdp-color-focus-text',
  '--zdp-color-focus-line',
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
  '@fontsource-variable/manrope@5.2.8/index.css',
  '@fontsource-variable/noto-sans-sc@5.2.10/index.css',
  '@fontsource-variable/noto-sans-devanagari@5.2.8/index.css'
]) {
  if (!localeFontStyle.includes(requiredText)) {
    failures.push(`Locale font style contract is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  'font-family: var(--zdp-font-family-sans)',
  'font-weight: var(--zdp-font-weight-medium)',
  'border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong)',
  'background: var(--zdp-color-accent-primary)',
  '.zdp-button--primary:hover:not(:disabled)',
  '.zdp-button--secondary:hover:not(:disabled)',
  '.zdp-button--danger:hover:not(:disabled)',
  'background: var(--zdp-color-surface-raised)',
  '.zdp-button--primary:active:not(:disabled)',
  '.zdp-icon-button--solid:hover:not(:disabled)',
  '.zdp-icon-button--ghost:hover:not(:disabled)',
  '.zdp-icon-button--solid:active:not(:disabled)',
  'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
  'border-color: var(--zdp-color-focus-line)',
  '.zdp-icon-button__glyph',
  'align-items: center',
  'justify-content: center',
  'line-height: 1'
]) {
  if (!componentStyle.includes(requiredText)) {
    failures.push(`Component style contract is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'Token style contract', tokenStyle);
assertNoDecorativeEffects(failures, 'Locale font style contract', localeFontStyle);
assertNoDecorativeEffects(failures, 'Component style contract', componentStyle);
assertNoDecorativeEffects(failures, 'Preview', preview);
assertNoOverRoundedUsage(failures, 'Component style contract', componentStyle);
assertNoOverRoundedUsage(failures, 'Preview', preview);

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(failure);
  }

  process.exitCode = 1;
}

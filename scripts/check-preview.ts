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
  'zdp-inline zdp-inline--gap-sm',
  'zdp-badge zdp-badge--primary zdp-badge--md',
  'zdp-badge zdp-badge--success zdp-badge--md',
  'zdp-badge zdp-badge--warning zdp-badge--md',
  'zdp-badge zdp-badge--danger zdp-badge--md',
  'zdp-link',
  'zdp-skip-link',
  'zdp-visually-hidden',
  'zdp-page zdp-page--canvas zdp-surface-reset',
  'zdp-section zdp-section--spacing-lg zdp-section--panel',
  'zdp-container zdp-container--lg zdp-container--padding-lg',
  'zdp-page-header zdp-page-header--align-center',
  'zdp-page-header__body',
  'zdp-page-header__title',
  'zdp-page-header__summary',
  'zdp-page-header__actions',
  'zdp-stack zdp-stack--gap-md',
  'zdp-divider zdp-divider--horizontal zdp-divider--subtle',
  'zdp-callout zdp-callout--info',
  'zdp-callout zdp-callout--danger',
  'zdp-callout__mark',
  'zdp-callout__body',
  'zdp-breadcrumb',
  'zdp-breadcrumb__list',
  'zdp-breadcrumb__item',
  'zdp-breadcrumb__link',
  'zdp-breadcrumb__separator',
  'zdp-breadcrumb__current',
  'aria-current="page"',
  'zdp-tabs',
  'zdp-tabs__list',
  'zdp-tabs__tab zdp-tabs__tab--active',
  'zdp-tabs__panel',
  'role="tablist"',
  'tabindex="-1"',
  'role="tabpanel"',
  'zdp-dialog',
  'zdp-dialog__backdrop',
  'zdp-dialog__panel zdp-dialog__panel--md',
  'role="dialog"',
  'aria-modal="true"',
  'zdp-dialog__header',
  'zdp-dialog__title',
  'zdp-dialog__body',
  'zdp-dialog__footer',
  'zdp-dialog__close',
  'zdp-choice zdp-choice--checkbox',
  'zdp-choice zdp-choice--radio',
  'zdp-switch',
  'zdp-choice__input',
  'zdp-choice__mark',
  'zdp-switch__track',
  'zdp-field zdp-field--md',
  'zdp-label',
  'zdp-input',
  'zdp-select',
  'zdp-textarea',
  'zdp-help-text',
  'zdp-error-text',
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
  'line-height: var(--zdp-type-title-line-height)',
  'Foundation tokens',
  'Search Design System',
  '화면의 첫 장면',
  '출시 노트 보기',
  '업데이트 보기',
  '자세히 보기',
  'light-forms-title',
  'dark-forms-title',
  '공개 표기와 알림에 사용됩니다.',
  '이미 발급된 값은 그대로 둡니다.',
  'readonly',
  '다음 단계 전에 기준을 확인하세요.',
  '업데이트 받기',
  '알림 주기',
  '자동 저장',
  '작성 중인 내용을 임시 보관합니다.',
  'light-feedback-title',
  'dark-feedback-title',
  'light-breadcrumb-title',
  'dark-breadcrumb-title',
  'light-tabs-title',
  'dark-tabs-title',
  'light-dialog-title',
  'dark-dialog-title',
  '검토 중',
  '정상',
  '삭제 전에 다시 확인하세요.',
  '탭은 페이지 안의 가까운 정보 묶음을 바꿀 때 사용합니다.'
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
  'font-weight: var(--zdp-font-weight-regular)',
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
  '.zdp-badge',
  '.zdp-badge--primary',
  '.zdp-badge--success',
  '.zdp-badge--warning',
  '.zdp-badge--danger',
  '.zdp-link',
  '.zdp-link:hover',
  '.zdp-link:focus-visible',
  '.zdp-link[aria-current]',
  '.zdp-link--muted',
  '.zdp-skip-link',
  '.zdp-skip-link:focus-visible',
  '.zdp-visually-hidden',
  '.zdp-page',
  '.zdp-page--canvas',
  '.zdp-container',
  '.zdp-container--lg',
  '.zdp-container--padding-lg',
  '.zdp-section',
  '.zdp-section--spacing-lg',
  '.zdp-section--panel',
  '.zdp-page-header',
  '.zdp-page-header__body',
  '.zdp-page-header__title',
  '.zdp-page-header__summary',
  '.zdp-page-header__actions',
  '.zdp-stack',
  '.zdp-stack--gap-md',
  '.zdp-stack--align-start',
  '.zdp-inline',
  '.zdp-inline--gap-sm',
  '.zdp-inline--align-center',
  '.zdp-divider',
  '.zdp-divider--horizontal',
  '.zdp-divider--subtle',
  'border-block-start: 1px solid var(--zdp-color-line-subtle)',
  'display: flex',
  'flex-wrap: wrap',
  'display: grid',
  'min-width: 0',
  'position: fixed',
  'pointer-events: none',
  'pointer-events: auto',
  'clip: rect(0 0 0 0)',
  'clip-path: inset(50%)',
  'position: absolute',
  'white-space: nowrap',
  '.zdp-callout',
  '.zdp-callout__mark',
  '.zdp-callout__body',
  '.zdp-callout--info .zdp-callout__mark',
  '.zdp-callout--success .zdp-callout__mark',
  '.zdp-callout--warning .zdp-callout__mark',
  '.zdp-callout--danger .zdp-callout__mark',
  '.zdp-breadcrumb',
  '.zdp-breadcrumb__list',
  '.zdp-breadcrumb__item',
  '.zdp-breadcrumb__link',
  '.zdp-breadcrumb__link:focus-visible',
  '.zdp-breadcrumb__current',
  '.zdp-breadcrumb__separator',
  '.zdp-tabs',
  '.zdp-tabs__list',
  '.zdp-tabs__tab',
  '.zdp-tabs__tab--active',
  '.zdp-tabs__tab:focus-visible',
  '.zdp-tabs__panel',
  '.zdp-tabs__panel:focus-visible',
  '.zdp-dialog',
  '.zdp-dialog__backdrop',
  '.zdp-dialog__panel',
  '.zdp-dialog__panel--sm',
  '.zdp-dialog__panel--md',
  '.zdp-dialog__panel--lg',
  '.zdp-dialog__panel:focus-visible',
  '.zdp-dialog__close:focus-visible',
  '.zdp-dialog__footer',
  '.zdp-field',
  '.zdp-label',
  '.zdp-input',
  '.zdp-textarea',
  '.zdp-select',
  '.zdp-help-text',
  '.zdp-error-text',
  '.zdp-input:hover:not(:disabled)',
  '.zdp-textarea:hover:not(:disabled)',
  '.zdp-select:hover:not(:disabled)',
  '.zdp-input:focus-visible',
  '.zdp-textarea:focus-visible',
  '.zdp-select:focus-visible',
  '.zdp-input[aria-invalid="true"]',
  '.zdp-textarea[aria-invalid="true"]',
  '.zdp-select[aria-invalid="true"]',
  '.zdp-input[readonly]',
  '.zdp-textarea[readonly]',
  '.zdp-choice',
  '.zdp-switch',
  '.zdp-choice__input',
  '.zdp-switch__input',
  '.zdp-choice__mark',
  '.zdp-switch__track',
  '.zdp-choice__input:checked + .zdp-choice__mark',
  '.zdp-switch__input:checked + .zdp-switch__track',
  '.zdp-choice__input:focus-visible + .zdp-choice__mark',
  '.zdp-switch__input:focus-visible + .zdp-switch__track',
  '.zdp-choice__input[aria-invalid="true"] + .zdp-choice__mark',
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

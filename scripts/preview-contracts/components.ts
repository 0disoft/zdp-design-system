import { assertNoDecorativeEffects, assertNoOverRoundedUsage } from '../style-contract';
import type { PreviewCheckContext } from './context';

export function checkPreviewComponents(context: PreviewCheckContext): void {
const { preview, tokenStyle, localeFontStyle, componentStyle, failures } = context;

for (const requiredText of [
  '.zdp-user-select-control',
  '.zdp-user-select-decorative',
  '.zdp-user-select-dragging',
  '-webkit-user-select: none',
  'user-select: none',
  'font-family: var(--zdp-font-family-sans)',
  'font-weight: var(--zdp-font-weight-medium)',
  'border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong)',
  'border-color: var(--zdp-color-line-subtle)',
  '.zdp-confirm-action',
  '.zdp-confirm-action__fill',
  '.zdp-confirm-action__thumb',
  '.zdp-confirm-action__glyph',
  '.zdp-confirm-action__label',
  '.zdp-confirm-action__hint',
  '.zdp-confirm-action--danger',
  '--zdp-confirm-action-progress: 0',
  'width: calc(var(--zdp-confirm-action-progress) * 100%)',
  'touch-action: none',
  'background: var(--zdp-color-accent-primary)',
  'background: var(--zdp-color-accent-danger)',
  'opacity: 0.24',
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
  'color: var(--zdp-color-ink-strong)',
  '.zdp-badge--success',
  '.zdp-badge--warning',
  '.zdp-badge--danger',
  '.zdp-avatar',
  '.zdp-avatar--sm',
  '.zdp-avatar--md',
  '.zdp-avatar--lg',
  '.zdp-avatar--primary',
  '.zdp-avatar__image',
  '.zdp-avatar__initials',
  '.zdp-identity-chip',
  '.zdp-identity-chip--sm',
  '.zdp-identity-chip--md',
  '.zdp-identity-chip--link',
  '.zdp-identity-chip--link:hover',
  '.zdp-identity-chip--link:focus-visible',
  '.zdp-identity-chip[data-selected="true"]',
  '.zdp-identity-chip[aria-current]',
  '.zdp-identity-chip__body',
  '.zdp-identity-chip__label',
  '.zdp-identity-chip__description',
  '.zdp-link',
  '.zdp-link:hover',
  '.zdp-link:focus-visible',
  '.zdp-link[aria-current]',
  '.zdp-link--muted',
  '.zdp-skip-link',
  '.zdp-skip-link:focus-visible',
  '.zdp-visually-hidden',
  '.zdp-brand-lockup',
  '.zdp-brand-lockup__mark',
  '.zdp-brand-wordmark',
  '.zdp-surface-reset .zdp-brand-wordmark',
  'font-family: var(--zdp-font-family-brand)',
  'font-weight: var(--zdp-font-weight-semibold)',
  '.zdp-page',
  '.zdp-page--canvas',
  '.zdp-container',
  '.zdp-container--lg',
  '.zdp-container--padding-lg',
  '.zdp-container--padding-page',
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
  '.zdp-grid',
  '.zdp-grid--columns-two',
  '.zdp-grid--columns-auto',
  '.zdp-grid--gap-md',
  '.zdp-toolbar',
  '.zdp-toolbar__main',
  '.zdp-toolbar__actions',
  '.zdp-kbd',
  '.zdp-kbd__sr-label',
  '.zdp-kbd--sm',
  '.zdp-kbd--md',
  '.zdp-shortcut-hint',
  '.zdp-shortcut-hint--sm',
  '.zdp-shortcut-hint--md',
  '.zdp-shortcut-hint__separator',
  '.zdp-command-field-shell',
  '.zdp-command-field-shell--sm',
  '.zdp-command-field-shell--md',
  '.zdp-command-field__label',
  '.zdp-command-field__label--hidden',
  '.zdp-command-field',
  '.zdp-command-field--sm',
  '.zdp-command-field--md',
  '.zdp-command-field:hover',
  '.zdp-command-field:focus-within',
  '.zdp-command-field-shell[data-invalid="true"] .zdp-command-field',
  '.zdp-command-field-shell[data-disabled="true"] .zdp-command-field',
  '.zdp-command-field__input',
  '.zdp-command-field--sm .zdp-command-field__input',
  '.zdp-command-field__input::placeholder',
  '.zdp-command-field__input:focus',
  '.zdp-command-field__shortcut',
  '.zdp-combobox',
  '.zdp-combobox__label',
  '.zdp-combobox__control',
  '.zdp-combobox__control:focus-within',
  '.zdp-combobox__input',
  '.zdp-combobox__toggle',
  '.zdp-combobox__mark',
  '.zdp-combobox__panel',
  '.zdp-combobox__listbox',
  '.zdp-combobox__option',
  '.zdp-combobox__option[data-active="true"]',
  '.zdp-combobox__option[data-selected="true"]',
  '.zdp-combobox__option-description',
  '.zdp-combobox__empty',
  '.zdp-theme-toggle',
  '.zdp-theme-toggle--sm',
  '.zdp-theme-toggle--md',
  '.zdp-theme-toggle:hover:not(:disabled)',
  '.zdp-theme-toggle:focus-visible',
  '.zdp-theme-toggle__icon',
  '.zdp-theme-toggle__icon--moon svg',
  'transform: translate(0.08rem, -0.04rem)',
  '.zdp-theme-toggle[data-zdp-theme-state="light"] .zdp-theme-toggle__icon--moon',
  '.zdp-theme-toggle[data-zdp-theme-state="dark"]',
  '.zdp-locale-switcher',
  '.zdp-locale-switcher--sm .zdp-locale-switcher__item',
  '.zdp-locale-switcher--md .zdp-locale-switcher__item',
  '.zdp-locale-switcher__item:focus-visible',
  '.zdp-locale-switcher__label',
  '.zdp-text-scale-control',
  '.zdp-text-scale-control--sm .zdp-text-scale-control__item',
  '.zdp-text-scale-control--md .zdp-text-scale-control__item',
  '.zdp-text-scale-control__item:focus-visible',
  '.zdp-text-scale-control__item[data-zdp-text-scale-option-value="larger"]',
  '.zdp-tooltip',
  '.zdp-tooltip__trigger',
  '.zdp-tooltip__content',
  '.zdp-tooltip--top .zdp-tooltip__content',
  '.zdp-tooltip--right .zdp-tooltip__content',
  '.zdp-tooltip--bottom .zdp-tooltip__content',
  '.zdp-tooltip--left .zdp-tooltip__content',
  '.zdp-tooltip:hover .zdp-tooltip__content',
  '.zdp-tooltip:focus-within .zdp-tooltip__content',
  '.zdp-tooltip[data-dismissed="true"] .zdp-tooltip__content',
  '.zdp-disclosure',
  '.zdp-disclosure__heading',
  '.zdp-disclosure__trigger',
  '.zdp-disclosure__trigger:hover:not(:disabled)',
  '.zdp-disclosure__trigger:focus-visible',
  '.zdp-disclosure__trigger:disabled',
  '.zdp-disclosure__title',
  '.zdp-disclosure__mark',
  '.zdp-disclosure__panel',
  '.zdp-accordion',
  '.zdp-accordion__item',
  '.zdp-segmented-control',
  '.zdp-segmented-control__item',
  '.zdp-segmented-control--sm .zdp-segmented-control__item',
  '.zdp-segmented-control--md .zdp-segmented-control__item',
  '.zdp-segmented-control__item:hover:not(:disabled):not([aria-checked="true"])',
  '.zdp-segmented-control__item:focus-visible',
  '.zdp-segmented-control__item--selected',
  '.zdp-segmented-control__item[aria-checked="true"]',
  '.zdp-segmented-control__item:disabled',
  '.zdp-popover',
  '.zdp-popover__trigger',
  '.zdp-popover__panel',
  '.zdp-popover__panel:focus-visible',
  '.zdp-popover--bottom .zdp-popover__panel',
  '.zdp-popover--align-start .zdp-popover__panel',
  '.zdp-menu',
  '.zdp-menu__trigger',
  '.zdp-menu__trigger:focus-visible',
  '.zdp-menu__panel',
  '.zdp-menu__panel:focus-visible',
  '.zdp-menu__item',
  '.zdp-menu__item:hover:not(:disabled):not([aria-disabled="true"])',
  '.zdp-menu__item--danger',
  '.zdp-menu__separator',
  '.zdp-menu__trigger-mark::before',
  '.zdp-menu--bottom .zdp-menu__panel',
  '.zdp-menu--align-end .zdp-menu__panel',
  '.zdp-toast',
  '.zdp-toast__mark',
  '.zdp-toast__body',
  '.zdp-toast__title',
  '.zdp-toast__message',
  '.zdp-toast__action',
  '.zdp-toast__action {\n  align-items: center;',
  'margin-block-start: var(--zdp-space-3)',
  '.zdp-toast__action:focus-visible',
  '.zdp-toast__close',
  '.zdp-toast__close:focus-visible',
  '.zdp-toast--success .zdp-toast__mark',
  '.zdp-toast--warning .zdp-toast__mark',
  '.zdp-toast--danger .zdp-toast__mark',
  '.zdp-status-toast',
  '.zdp-status-toast .zdp-toast',
  '.zdp-status-toast--inline',
  '.zdp-status-toast--top-end',
  '.zdp-status-toast--bottom-end',
  '.zdp-progress',
  '.zdp-progress__track',
  '.zdp-progress__bar',
  '.zdp-progress[data-indeterminate="true"] .zdp-progress__bar',
  '.zdp-progress--success',
  '.zdp-progress--warning',
  '.zdp-progress--danger',
  '.zdp-spinner',
  '.zdp-spinner__mark',
  '.zdp-spinner--sm',
  '.zdp-spinner--md',
  '.zdp-spinner--lg',
  '.zdp-spinner--warning',
  '.zdp-skeleton',
  '.zdp-skeleton__line',
  '.zdp-skeleton--text .zdp-skeleton__line',
  '.zdp-skeleton--block .zdp-skeleton__line',
  '.zdp-skeleton--avatar .zdp-skeleton__line',
  '.zdp-skeleton[data-animated="false"] .zdp-skeleton__line',
  '.zdp-ad-slot',
  '.zdp-ad-slot--reserved',
  '.zdp-ad-slot--banner',
  '.zdp-ad-slot--between-sections',
  '.zdp-ad-slot--rail',
  '.zdp-ad-slot--filled',
  '.zdp-ad-slot__fallback',
  '.zdp-ad-slot--blocked',
  '.zdp-ad-slot--empty .zdp-ad-slot__fallback',
  'prefers-reduced-motion',
  '.zdp-divider',
  '.zdp-divider--horizontal',
  '.zdp-divider--subtle',
  '.zdp-table-wrap',
  '.zdp-table',
  '.zdp-table__caption',
  '.zdp-table th',
  '.zdp-table td',
  '.zdp-inline-code',
  '.zdp-code-block',
  '--zdp-code-block-surface: var(--zdp-color-surface-panel)',
  '--zdp-code-block-surface: var(--zdp-color-surface-raised)',
  '.zdp-code-block__header',
  '.zdp-code-block__meta',
  '.zdp-code-block__title',
  '.zdp-code-block__language',
  '.zdp-code-block__copy',
  '.zdp-code-block__copy:focus-visible',
  '.zdp-code-block__scroller',
  'background: var(--zdp-code-block-surface)',
  'overscroll-behavior-inline: contain',
  '.zdp-code-block__scroller:focus-visible',
  '.zdp-code-block__pre',
  '.zdp-code-block[data-wrap="true"] .zdp-code-block__pre',
  '.zdp-sort-header',
  '.zdp-sort-header__label',
  '.zdp-sort-header__mark',
  '.zdp-sort-header__mark::before',
  '.zdp-sort-header--ascending .zdp-sort-header__mark::before',
  '.zdp-sort-header--descending .zdp-sort-header__mark::before',
  '.zdp-sort-header--ascending .zdp-sort-header__mark',
  '.zdp-table-toolbar',
  '.zdp-table-toolbar__body',
  '.zdp-table-toolbar__title',
  '.zdp-table-toolbar__summary',
  '.zdp-table-toolbar__selection',
  '.zdp-table-toolbar__controls',
  '.zdp-table-toolbar__actions',
  '.zdp-table-toolbar__density',
  '.zdp-table-toolbar__density-label',
  '.zdp-key-value',
  '.zdp-key-value dt',
  '.zdp-key-value dd',
  '.zdp-empty-state',
  '.zdp-empty-state__body',
  '.zdp-empty-state__actions',
  '.zdp-share-dock',
  '.zdp-share-dock--side',
  '.zdp-share-dock--rail',
  '.zdp-share-dock--bottom',
  '.zdp-share-dock--inline',
  '.zdp-share-dock__list',
  '.zdp-share-action',
  '.zdp-share-action:hover:not(:disabled)',
  '.zdp-share-action:focus-visible',
  '.zdp-share-action__mark',
  '.zdp-share-icon',
  '.zdp-share-action__tooltip',
  '.zdp-share-action:hover .zdp-share-action__tooltip',
  'max-inline-size: calc(var(--zdp-viewport-inline) - var(--zdp-space-6))',
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
  'height: calc(var(--zdp-type-body-small-size) * var(--zdp-type-body-small-line-height))',
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
  '.zdp-pagination',
  '.zdp-pagination__list',
  '.zdp-pagination__item',
  '.zdp-pagination__link',
  '.zdp-pagination__link--control',
  'overflow-x: auto',
  '--zdp-pagination-focus-bleed',
  'padding-block: var(--zdp-pagination-focus-bleed)',
  'padding-inline: var(--zdp-pagination-focus-bleed)',
  'scrollbar-gutter: stable',
  'scroll-padding-inline: var(--zdp-pagination-focus-bleed)',
  'touch-action: pan-x pan-y',
  'flex-wrap: nowrap',
  'width: max-content',
  'white-space: nowrap',
  '.zdp-pagination__link:hover:not(:disabled):not([aria-current="page"])',
  '.zdp-pagination__link:focus-visible',
  '.zdp-pagination__link[aria-current="page"]',
  '.zdp-pagination__link:disabled',
  '.zdp-pagination__ellipsis',
  '.zdp-tabs',
  '.zdp-tabs__list',
  '.zdp-tabs__tab',
  '.zdp-tabs__tab--active',
  '.zdp-tabs__tab:focus-visible',
  '.zdp-tabs__panel',
  '.zdp-tabs__panel:focus-visible',
  '.zdp-term-trigger',
  '.zdp-term-trigger:hover:not(:disabled)',
  '.zdp-term-trigger:focus-visible',
  '.zdp-term-sheet__backdrop',
  '.zdp-term-sheet',
  '.zdp-term-sheet--right',
  '.zdp-term-sheet--bottom',
  '.zdp-term-sheet:focus-visible',
  '.zdp-term-sheet__header',
  '.zdp-term-sheet__heading',
  '.zdp-term-sheet__eyebrow',
  '.zdp-term-sheet__title',
  '.zdp-term-sheet__close',
  '.zdp-term-sheet__body',
  '.zdp-term-sheet__short',
  '.zdp-term-sheet__section',
  '.zdp-term-sheet__related',
  '.zdp-term-sheet__related-button',
  '.zdp-dialog',
  '.zdp-dialog__backdrop',
  '.zdp-dialog__panel',
  '.zdp-dialog__panel--sm',
  '.zdp-dialog__panel--md',
  '.zdp-dialog__panel--lg',
  '.zdp-dialog__panel:focus-visible',
  '.zdp-dialog__close:focus-visible',
  '.zdp-dialog__footer',
  '.zdp-sheet-layer',
  '.zdp-sheet__backdrop',
  '.zdp-sheet',
  '.zdp-sheet--right',
  '.zdp-sheet--left',
  '.zdp-sheet--bottom',
  '.zdp-sheet--sm',
  '.zdp-sheet--md',
  '.zdp-sheet--lg',
  '.zdp-sheet:focus-visible',
  '.zdp-sheet__header',
  '.zdp-sheet__title',
  '.zdp-sheet__body',
  '.zdp-sheet__footer',
  '.zdp-sheet__close',
  '.zdp-sheet__close:focus-visible',
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
  'border-bottom: 2px solid currentcolor',
  'border-left: 2px solid currentcolor',
  '.zdp-choice:hover .zdp-choice__input:not(:checked):not(:disabled) + .zdp-choice__mark',
  '.zdp-switch:hover .zdp-switch__input:not(:checked):not(:disabled) + .zdp-switch__track',
  'grid-template-columns: var(--zdp-control-choice-size) minmax(0, 1fr)',
  'grid-template-columns: var(--zdp-control-switch-width) minmax(0, 1fr)',
  'height: var(--zdp-control-choice-size)',
  'height: var(--zdp-control-switch-height)',
  'width: var(--zdp-control-switch-width)',
  '.zdp-choice__input:checked + .zdp-choice__mark',
  '.zdp-switch__input:checked + .zdp-switch__track',
  '.zdp-choice__input:focus-visible + .zdp-choice__mark',
  '.zdp-switch__input:focus-visible + .zdp-switch__track',
  '.zdp-choice__input[aria-invalid="true"] + .zdp-choice__mark',
  '.zdp-switch__input[aria-invalid="true"] + .zdp-switch__track',
  'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
  'border-color: var(--zdp-color-focus-line)',
  '.zdp-icon',
  '.zdp-icon--sm',
  '.zdp-icon--md',
  'font-size: var(--zdp-control-glyph-md)',
  '.zdp-icon-button__glyph',
  'align-items: center',
  'justify-content: center',
  'text-align: center',
  'line-height: 1'
]) {
  if (!componentStyle.includes(requiredText)) {
    failures.push(`Component style contract is missing ${requiredText}.`);
  }
}

for (const [label, source] of [
  ['static preview markup', preview],
  ['framework-neutral component CSS', componentStyle]
] as const) {
  for (const forbiddenText of ['zdp-term-sheet__footer', 'zdp-term-sheet__detail-link']) {
    if (source.includes(forbiddenText)) {
      failures.push(`${label} must not restore the removed TermSheet detail action contract ${forbiddenText}.`);
    }
  }
}

const staticTermTriggerBlock = componentStyle.slice(
  componentStyle.indexOf('.zdp-term-trigger {'),
  componentStyle.indexOf('.zdp-term-trigger:focus-visible')
);

for (const requiredText of [
  'background: var(--zdp-color-accent-primary-soft)',
  '.zdp-term-trigger:hover:not(:disabled)',
  'color: var(--zdp-color-ink-strong)'
]) {
  if (!staticTermTriggerBlock.includes(requiredText)) {
    failures.push(`Static TermTrigger contract is missing ${requiredText}.`);
  }
}

if (staticTermTriggerBlock.includes('background: transparent')) {
  failures.push('Static TermTrigger must keep its soft accent background in the default state.');
}

const staticBorderlessControlBlocks: Array<readonly [string, string]> = [
  [
    'Button',
    componentStyle.slice(componentStyle.indexOf('.zdp-button--primary {'), componentStyle.indexOf('.zdp-button--secondary {'))
  ],
  [
    'IconButton',
    componentStyle.slice(
      componentStyle.indexOf('.zdp-icon-button {'),
      componentStyle.indexOf('.zdp-icon-button:focus-visible')
    )
  ]
];

for (const [label, block] of staticBorderlessControlBlocks) {
  if (!block.includes('border-color: transparent')) {
    failures.push(`Static ${label} must preserve border geometry without a visible default border.`);
  }

  for (const forbiddenText of [
    'border-color: var(--zdp-color-line-',
    'border-color: var(--zdp-color-accent-primary-strong)',
    'border-color: var(--zdp-color-accent-danger)'
  ]) {
    if (block.includes(forbiddenText)) {
      failures.push(`Static ${label} visual variants must not restore visible borders: ${forbiddenText}.`);
    }
  }
}

const staticSecondaryButtonBlock = componentStyle.slice(
  componentStyle.indexOf('.zdp-button--secondary {'),
  componentStyle.indexOf('.zdp-button--secondary:hover')
);

const staticDangerButtonBlock = componentStyle.slice(
  componentStyle.indexOf('.zdp-button--danger {'),
  componentStyle.indexOf('.zdp-button--danger:hover')
);

const staticDangerButtonHoverBlock = componentStyle.slice(
  componentStyle.indexOf('.zdp-button--danger:hover:not(:disabled)'),
  componentStyle.indexOf('.zdp-button--danger:active:not(:disabled)')
);

if (!staticSecondaryButtonBlock.includes('background: var(--zdp-color-surface-panel)') ||
    !staticSecondaryButtonBlock.includes('border-color: var(--zdp-color-line-strong)')) {
  failures.push('Static Button secondary variant must use the Quiet Ivory panel surface and a visible outline.');
}

for (const requiredText of ['background: var(--zdp-color-accent-danger)', 'color: var(--zdp-color-ink-inverse)']) {
  if (!staticDangerButtonBlock.includes(requiredText)) {
    failures.push(`Static Button danger variant must keep a contrast-safe filled surface: ${requiredText}.`);
  }
}

for (const requiredText of ['background: var(--zdp-color-surface-panel)', 'color: var(--zdp-color-accent-danger)']) {
  if (!staticDangerButtonHoverBlock.includes(requiredText)) {
    failures.push(`Static Button danger hover must keep its label visible: ${requiredText}.`);
  }
}

for (const [label, selector] of [
  ['LocaleSwitcher', '.zdp-locale-switcher'],
  ['SegmentedControl', '.zdp-segmented-control']
] satisfies Array<readonly [string, string]>) {
  const rootBlock = componentStyle.slice(
    componentStyle.indexOf(`${selector} {`),
    componentStyle.indexOf(`${selector}__item {`)
  );
  const interactionBlock = componentStyle.slice(
    componentStyle.indexOf(`${selector}__item:hover`),
    componentStyle.indexOf(`${selector}__item:disabled`)
  );

  for (const requiredText of [
    'background: var(--zdp-color-surface-raised)',
    'border: var(--zdp-control-border-width) solid transparent'
  ]) {
    if (!rootBlock.includes(requiredText)) {
      failures.push(`Static ${label} surface-first root is missing ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'background: var(--zdp-color-surface-panel)',
    'background: var(--zdp-color-accent-primary-soft)',
    'border-color: transparent'
  ]) {
    if (!interactionBlock.includes(requiredText)) {
      failures.push(`Static ${label} surface state is missing ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'border-color: var(--zdp-color-accent-primary-strong)',
    'color: var(--zdp-color-ink-strong)'
  ]) {
    if (!interactionBlock.includes(requiredText)) {
      failures.push(`Static ${label} must use the shared selection colors: ${requiredText}.`);
    }
  }
}

for (const [label, startSelector, endSelector] of [
  ['ConfirmAction', '.zdp-confirm-action {', '.zdp-badge {'],
  ['Menu', '.zdp-menu__trigger {', '.zdp-menu__separator {'],
  ['Select', '.zdp-select {', '.zdp-choice,']
] satisfies Array<readonly [string, string, string]>) {
  const blockStart = componentStyle.indexOf(startSelector);
  const blockEnd = componentStyle.indexOf(endSelector, blockStart + startSelector.length);
  const block = componentStyle.slice(blockStart, blockEnd);

  for (const requiredText of [
    'border: var(--zdp-control-border-width) solid transparent',
    'background: var(--zdp-color-surface-raised)'
  ]) {
    if (!block.includes(requiredText)) {
      failures.push(`Static ${label} must keep the borderless surface contract text ${requiredText}.`);
    }
  }
}

for (const requiredText of [
  '.zdp-button:not(.zdp-button--text)',
  '.zdp-icon-button',
  '.zdp-locale-switcher',
  '.zdp-segmented-control',
  'border-color: ButtonText',
  '.zdp-button--text::after',
  'background: ButtonText'
]) {
  if (!componentStyle.includes(requiredText)) {
    failures.push(`Forced-colors borderless control fallback is missing ${requiredText}.`);
  }
}

for (const forbiddenText of [
  'selectstart',
  'user-select: none !important',
  'body {\n  user-select: none',
  '.zdp-page {\n  user-select: none',
  '.zdp-table td {\n  user-select: none',
  '.zdp-code-block__pre {\n  user-select: none',
  '.zdp-toast__message {\n  user-select: none'
]) {
  if (componentStyle.includes(forbiddenText) || tokenStyle.includes(forbiddenText) || preview.includes(forbiddenText)) {
    failures.push(`Text selection behavior must not include broad or JS selection blocking: ${forbiddenText}.`);
  }
}

assertNoDecorativeEffects(failures, 'Token style contract', tokenStyle);

assertNoDecorativeEffects(failures, 'Locale font style contract', localeFontStyle);

assertNoDecorativeEffects(failures, 'Component style contract', componentStyle);

assertNoDecorativeEffects(failures, 'Preview', preview);

assertNoOverRoundedUsage(failures, 'Component style contract', componentStyle);

assertNoOverRoundedUsage(failures, 'Preview', preview);
}

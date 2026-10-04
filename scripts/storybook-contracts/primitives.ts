import type { StorybookCheckContext } from './context';
import { assertNoDecorativeEffects, assertNoOverRoundedUsage } from '../style-contract';

export function checkPrimitivesContracts(context: StorybookCheckContext): void {
  const { failures, navigationComponent, accordion, avatar, badge, callout, codeBlock, combobox, commandField, disclosure, kbd, label, link, localeSwitcher, menu, popover, progress, segmentedControl, shortcutHint, shortcuts, skeleton, tooltip, statusToast, spinner, textScaleControl, themeToggle, toast, inlineCode, identityChip } = context;

  for (const requiredText of [
    "type ZdpLocaleSwitcherOption",
    "type ZdpLocaleSwitcherSize",
    "value = $bindable('en')",
    'role="radiogroup"',
    'role="radio"',
    'aria-checked={option.value === activeValue}',
    'data-zdp-locale-switcher',
    'data-zdp-locale-value={activeValue}',
    'data-zdp-locale-option-value={option.value}',
    'class={`zdp-locale-switcher zdp-locale-switcher--${size}`}',
    '.zdp-locale-switcher',
    'background: var(--zdp-color-surface-raised)',
    'border: var(--zdp-control-border-width) solid transparent',
    '.zdp-locale-switcher__item:hover:not(:disabled):not([aria-checked=',
    'background: var(--zdp-color-surface-panel)',
    'border-color: transparent',
    'background: var(--zdp-color-accent-primary)',
    ':global([data-zdp-theme="dark"]) .zdp-locale-switcher__item--selected',
    'color: var(--zdp-color-ink-inverse)',
    '@media (forced-colors: active)',
    'border-color: ButtonText',
    '.zdp-locale-switcher__item:focus-visible',
    '.zdp-locale-switcher__label',
    'user-select: none'
  ]) {
    if (!localeSwitcher.includes(requiredText)) {
      failures.push(`LocaleSwitcher component is missing ${requiredText}.`);
    }
  }

  for (const requiredText of [
    "type ZdpTextScale,",
    "value = $bindable<ZdpTextScale>('base')",
    "type ZdpTextScaleControlOption",
    "type ZdpTextScaleControlSize",
    'role="radiogroup"',
    'role="radio"',
    'aria-checked={option.value === activeValue}',
    'data-zdp-text-scale-control',
    'data-zdp-text-scale-value={activeValue}',
    'data-zdp-text-scale-option-value={option.value}',
    'class={`zdp-text-scale-control zdp-text-scale-control--${size}`}',
    '.zdp-text-scale-control',
    '.zdp-text-scale-control__item:focus-visible',
    '.zdp-text-scale-control__item[data-zdp-text-scale-option-value=',
    'user-select: none'
  ]) {
    if (!textScaleControl.includes(requiredText)) {
      failures.push(`TextScaleControl component is missing ${requiredText}.`);
    }
  }

  for (const requiredText of [
    "import type { ZdpThemeMode, ZdpThemeToggleSize }",
    'theme: ZdpThemeMode',
    'size: ZdpThemeToggleSize',
    "lightLabel = 'Switch to light mode'",
    "darkLabel = 'Switch to dark mode'",
    'aria-label={ariaLabel}',
    'data-zdp-theme-toggle',
    'data-zdp-theme-state={theme}',
    'class={`zdp-theme-toggle zdp-theme-toggle--${size}`}',
    'zdp-theme-toggle__icon--sun',
    'zdp-theme-toggle__icon--moon',
    'transform: translate(0.08rem, -0.04rem)',
    '.zdp-theme-toggle',
    '.zdp-theme-toggle:focus-visible',
    '.zdp-theme-toggle[data-zdp-theme-state=',
    'user-select: none'
  ]) {
    if (!themeToggle.includes(requiredText)) {
      failures.push(`ThemeToggle component is missing ${requiredText}.`);
    }
  }
  if (themeToggle.includes('aria-pressed=')) {
    failures.push('ThemeToggle must expose its changing action label as an ordinary button.');
  }

  for (const requiredText of [
    '../src/lib/components/Breadcrumb.svelte',
    '../src/lib/components/Inline.svelte',
    '../src/lib/components/Link.svelte',
    '../src/lib/components/Pagination.svelte',
    '../src/lib/components/SkipLink.svelte',
    '../src/lib/components/Stack.svelte',
    '../src/lib/components/Surface.svelte',
    '../src/lib/components/Tabs.svelte',
    'Finding your place',
    '본문으로 건너뛰기',
    'id="navigation-main"',
    'tabindex="-1"',
    'data-zdp-theme="light"',
    'data-zdp-theme="dark"',
    'line-height: var(--zdp-type-title-line-height)',
    '페이지 위치',
    '텍스트 이동',
    '목록 페이지',
    '밝은 화면 목록 페이지',
    '어두운 화면 목록 페이지',
    '가까운 섹션',
    '자세히 보기',
    '기록 보기',
    'ariaCurrent="page"',
    '현재 위치',
    'Light navigation sections',
    'Dark navigation sections',
    'zdp-surface-reset'
  ]) {
    if (!navigationComponent.includes(requiredText)) {
      failures.push(`Navigation story surface is missing ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'ZdpAvatarSize',
    'ZdpAvatarTone',
    'label: string | null = null',
    'initials: string | null = null',
    'imageSrc: string | null = null',
    "size: ZdpAvatarSize = 'md'",
    "tone: ZdpAvatarTone = 'neutral'",
    'decorative = false',
    'resolvedLabel',
    'resolvedInitials',
    'accessibilityLabel',
    'class={`zdp-avatar zdp-avatar--${size} zdp-avatar--${tone}`}',
    "role={decorative ? undefined : 'img'}",
    'aria-label={accessibilityLabel}',
    'aria-hidden={decorative ?',
    'class="zdp-avatar__image"',
    'alt=""',
    'class="zdp-avatar__initials"',
    '.zdp-avatar',
    '.zdp-avatar--sm',
    '.zdp-avatar--md',
    '.zdp-avatar--lg',
    '.zdp-avatar--primary',
    '.zdp-avatar__image',
    '.zdp-avatar__initials',
    'border-radius: 50%'
  ]) {
    if (!avatar.includes(requiredText)) {
      failures.push(`Avatar component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'Avatar component', avatar);

  assertNoOverRoundedUsage(failures, 'Avatar component', avatar);

  for (const requiredText of [
    '.zdp-badge',
    '.zdp-badge--primary',
    '.zdp-badge--success',
    '.zdp-badge--warning',
    '.zdp-badge--danger',
    'color: var(--zdp-color-ink-strong)',
    'font-weight: var(--zdp-font-weight-medium)',
    'border-radius: var(--zdp-control-radius)',
    'background: var(--zdp-color-surface-panel)'
  ]) {
    if (!badge.includes(requiredText)) {
      failures.push(`Badge component is missing ${requiredText}.`);
    }
  }

  for (const requiredText of [
    "import Avatar from './Avatar.svelte'",
    'ZdpIdentityChipAriaCurrent',
    'ZdpIdentityChipSize',
    "label = 'User'",
    'description: string | null = null',
    'initials: string | null = null',
    'imageSrc: string | null = null',
    'href: string | null = null',
    "size: ZdpIdentityChipSize = 'md'",
    'selected = false',
    'ariaLabel: string | null = null',
    'ariaCurrent: ZdpIdentityChipAriaCurrent | null = null',
    'chipClass',
    '{#if href}',
    'aria-current={ariaCurrent ?? undefined}',
    'data-selected={selected ?',
    '<Avatar label={label} initials={initials} imageSrc={imageSrc} size={size} decorative />',
    'class="zdp-identity-chip__body"',
    'class="zdp-identity-chip__label"',
    'class="zdp-identity-chip__description"',
    '.zdp-identity-chip',
    '.zdp-identity-chip--sm',
    '.zdp-identity-chip--md',
    '.zdp-identity-chip--link',
    '.zdp-identity-chip--link:hover',
    '.zdp-identity-chip--link:focus-visible',
    ".zdp-identity-chip[data-selected='true']",
    '.zdp-identity-chip[aria-current]',
    '.zdp-identity-chip__body',
    '.zdp-identity-chip__label',
    '.zdp-identity-chip__description',
    'overflow-wrap: var(--zdp-i18n-overflow-wrap)'
  ]) {
    if (!identityChip.includes(requiredText)) {
      failures.push(`IdentityChip component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'IdentityChip component', identityChip);

  assertNoOverRoundedUsage(failures, 'IdentityChip component', identityChip);

  for (const requiredText of [
    '.zdp-callout',
    '.zdp-callout__mark',
    '.zdp-callout__body',
    'aria-labelledby={labelledBy ?? undefined}',
    'role={semanticRole ?? undefined}',
    'height: calc(var(--zdp-type-body-small-size) * var(--zdp-type-body-small-line-height))',
    'border-radius: var(--zdp-control-radius)',
    'background: var(--zdp-color-surface-panel)',
    '.zdp-callout--info .zdp-callout__mark',
    '.zdp-callout--success .zdp-callout__mark',
    '.zdp-callout--warning .zdp-callout__mark',
    '.zdp-callout--danger .zdp-callout__mark'
  ]) {
    if (!callout.includes(requiredText)) {
      failures.push(`Callout component is missing ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'import type { ZdpToastTone }',
    'tone: ZdpToastTone',
    'semanticRole:',
    'live:',
    'atomic = true',
    'dismissLabel =',
    'onClose:',
    'aria-live={resolvedLive}',
    'aria-atomic={resolvedAtomic}',
    'role={resolvedRole ?? undefined}',
    'class={`zdp-toast zdp-toast--${tone}`}',
    'class="zdp-toast__mark"',
    'class="zdp-toast__body"',
    'class="zdp-toast__close"',
    '.zdp-toast',
    '.zdp-toast__mark',
    '.zdp-toast__body',
    '.zdp-toast__title',
    '.zdp-toast__message',
    '.zdp-toast__action',
    '.zdp-toast__body :global(.zdp-toast__action) {\n    align-items: center;',
    'margin-block-start: var(--zdp-space-3)',
    '.zdp-toast__action:focus-visible',
    '.zdp-toast__close',
    '.zdp-toast__close:focus-visible',
    '.zdp-toast--success .zdp-toast__mark',
    '.zdp-toast--warning .zdp-toast__mark',
    '.zdp-toast--danger .zdp-toast__mark'
  ]) {
    if (!toast.includes(requiredText)) {
      failures.push(`Toast component is missing ${requiredText}.`);
    }
  }

  for (const requiredText of [
    "import Toast from './Toast.svelte'",
    'import type { ZdpStatusToastItem }',
    'items?: readonly ZdpStatusToastItem[]',
    'placement?: Placement',
    'idPrefix =',
    'ariaLabel =',
    'onDismiss?: (',
    'function resolvedRel',
    "item.rel ?? 'noopener noreferrer'",
    'class={`zdp-status-toast zdp-status-toast--${placement}`}',
    'aria-label={labelledBy ? undefined : ariaLabel}',
    'aria-labelledby={labelledBy ?? undefined}',
    'onClose={onDismiss ?',
    'class="zdp-toast__title"',
    'class="zdp-toast__message"',
    'class="zdp-toast__action"',
    '.zdp-status-toast',
    '.zdp-status-toast :global(.zdp-toast)',
    '.zdp-status-toast--inline',
    '.zdp-status-toast--top-end',
    '.zdp-status-toast--bottom-end'
  ]) {
    if (!statusToast.includes(requiredText)) {
      failures.push(`StatusToast component is missing ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'import type { ZdpProgressSize, ZdpProgressTone }',
    'value: number | null = null',
    'min = 0',
    'max = 100',
    'ariaLabel =',
    'valueText:',
    'Number.isFinite',
    'role="progressbar"',
    'aria-valuemin={hasRange ? min : undefined}',
    'aria-valuemax={hasRange ? max : undefined}',
    'aria-valuenow={hasValue ? clampedValue : undefined}',
    'aria-valuetext={valueText ?? undefined}',
    "data-indeterminate={hasValue ? undefined : 'true'}",
    'style={progressStyle}',
    'class="zdp-progress__track"',
    'class="zdp-progress__bar"',
    '.zdp-progress',
    '.zdp-progress__track',
    '.zdp-progress__bar',
    '.zdp-progress[data-indeterminate="true"] .zdp-progress__bar',
    '.zdp-progress--success',
    '.zdp-progress--warning',
    '.zdp-progress--danger',
    'prefers-reduced-motion'
  ]) {
    if (!progress.includes(requiredText)) {
      failures.push(`Progress component is missing ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'import type { ZdpProgressTone, ZdpSpinnerSize }',
    'size: ZdpSpinnerSize',
    'tone: ZdpProgressTone',
    'decorative = false',
    'semanticRole:',
    'aria-hidden={decorative ?',
    'aria-label={decorative ? undefined : label}',
    'role={decorative ? undefined : semanticRole ?? undefined}',
    'class="zdp-spinner__mark"',
    '.zdp-spinner',
    '.zdp-spinner__mark',
    'border-block-start-color: currentColor',
    'border-inline-end-color: currentColor',
    '.zdp-spinner--sm',
    '.zdp-spinner--md',
    '.zdp-spinner--lg',
    '.zdp-spinner--warning',
    '.zdp-spinner--danger'
  ]) {
    if (!spinner.includes(requiredText)) {
      failures.push(`Spinner component is missing ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'import type { ZdpSkeletonVariant }',
    'variant: ZdpSkeletonVariant',
    'lines = 1',
    'animated = true',
    'decorative = true',
    'lineCount = Math.max',
    "variant === 'text' ? lineCount : 1",
    'aria-hidden={decorative ?',
    'aria-label={!decorative && !labelledBy ? ariaLabel : undefined}',
    "role={decorative ? undefined : 'status'}",
    'data-animated={animated ?',
    'class={`zdp-skeleton zdp-skeleton--${variant}`}',
    'class={`zdp-skeleton__line',
    '.zdp-skeleton',
    '.zdp-skeleton__line',
    '.zdp-skeleton--text .zdp-skeleton__line',
    '.zdp-skeleton--block .zdp-skeleton__line',
    '.zdp-skeleton--avatar .zdp-skeleton__line',
    '.zdp-skeleton[data-animated="false"] .zdp-skeleton__line'
  ]) {
    if (!skeleton.includes(requiredText)) {
      failures.push(`Skeleton component is missing ${requiredText}.`);
    }
  }

  for (const source of [badge, callout, toast, statusToast, progress, spinner, skeleton]) {
    assertNoDecorativeEffects(failures, 'Feedback component', source);
    assertNoOverRoundedUsage(failures, 'Feedback component', source);
  }

  for (const requiredText of [
    '.zdp-link',
    '.zdp-link--primary',
    '.zdp-link--muted',
    'href: string',
    'ariaKeyShortcuts: string | null = null',
    'aria-current={resolvedAriaCurrent}',
    'aria-keyshortcuts={ariaKeyShortcuts ?? undefined}',
    "rel ?? 'noopener noreferrer'",
    'border-bottom: var(--zdp-control-focus-underline-width) solid transparent',
    'text-decoration-line: none',
    '.zdp-link:hover',
    '.zdp-link:focus-visible',
    'background: var(--zdp-color-focus-surface)',
    'border-bottom-color: var(--zdp-color-focus-line)',
    'color: var(--zdp-color-focus-text)'
  ]) {
    if (!link.includes(requiredText)) {
      failures.push(`Link component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'Link component', link);

  assertNoOverRoundedUsage(failures, 'Link component', link);

  for (const requiredText of [
    '<kbd',
    'label: string | null = null',
    "size: 'sm' | 'md' = 'md'",
    '<span class="zdp-kbd__sr-label">{ariaLabel}</span>',
    "aria-hidden={ariaLabel ? 'true' : undefined}",
    'title={title ?? undefined}',
    'class={`zdp-kbd zdp-kbd--${size}`}',
    '.zdp-kbd__sr-label',
    'box-sizing: border-box',
    'place-items: center',
    'vertical-align: middle',
    'white-space: nowrap'
  ]) {
    if (!kbd.includes(requiredText)) {
      failures.push(`Kbd component is missing ${requiredText}.`);
    }
  }

  for (const requiredText of [
    "import Kbd from './Kbd.svelte'",
    'keys: readonly string[] = []',
    "size: 'sm' | 'md' = 'md'",
    'ariaLabel: string | null = null',
    "keys.join(' ')",
    'labelledGroupRole',
    'class={`zdp-shortcut-hint zdp-shortcut-hint--${size}`}',
    'role={labelledGroupRole}',
    'aria-label={resolvedAriaLabel || undefined}',
    'class="zdp-shortcut-hint__separator"',
    'aria-hidden="true"',
    '<Kbd label={key} {size} />',
    'display: inline-flex',
    'white-space: nowrap'
  ]) {
    if (!shortcutHint.includes(requiredText)) {
      failures.push(`ShortcutHint component is missing ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'export type ZdpShortcutIntent',
    'export type ZdpShortcutRisk',
    'export interface ZdpShortcutRecommendation',
    'export interface ZdpShortcutGuardOptions',
    'export const zdpShortcutRecommendations',
    'export const zdpShortcutReservedExamples',
    'export function isZdpTextEntryTarget',
    'export function isZdpBrowserReservedShortcut',
    'export function shouldZdpIgnoreShortcutEvent',
    'input',
    'textarea',
    'select',
    'contenteditable',
    'role="textbox"',
    'role="searchbox"',
    'reservedModifierKeys',
    'Ctrl+S',
    'Cmd+Q',
    'Alt+ArrowLeft',
    'Backspace'
  ]) {
    if (!shortcuts.includes(requiredText)) {
      failures.push(`Shortcut policy helper is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'Kbd component', kbd);

  assertNoDecorativeEffects(failures, 'ShortcutHint component', shortcutHint);

  assertNoOverRoundedUsage(failures, 'Kbd component', kbd);

  assertNoOverRoundedUsage(failures, 'ShortcutHint component', shortcutHint);

  for (const requiredText of [
    '<code class="zdp-inline-code"',
    'text: string | null = null',
    'aria-label={ariaLabel ?? undefined}',
    '.zdp-inline-code',
    'font-family: var(--zdp-font-family-mono)',
    'box-decoration-break: clone',
    'word-break: break-word'
  ]) {
    if (!inlineCode.includes(requiredText)) {
      failures.push(`InlineCode component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'InlineCode component', inlineCode);

  assertNoOverRoundedUsage(failures, 'InlineCode component', inlineCode);

  for (const requiredText of [
    "import { onDestroy } from 'svelte'",
    "import type { ZdpCodeBlockSize, ZdpCodeBlockTone }",
    'export let code =',
    'language: string | null = null',
    'label: string | null = null',
    'caption: string | null = null',
    "size: ZdpCodeBlockSize = 'md'",
    "tone: ZdpCodeBlockTone = 'default'",
    'wrap = false',
    'showCopy = true',
    "copyLabel = 'Copy'",
    "copiedLabel = 'Copied'",
    "copyFailedLabel = 'Copy failed'",
    'class={`zdp-code-block zdp-code-block--${size} zdp-code-block--${tone}`}',
    'data-wrap={wrap ?',
    'role="group"',
    'aria-labelledby={labelledBy ?? undefined}',
    'class="zdp-code-block__header"',
    'class="zdp-code-block__meta"',
    'class="zdp-code-block__title"',
    'class="zdp-code-block__language"',
    'class="zdp-code-block__copy"',
    'codeRegionLabel',
    'svelte-ignore a11y_no_noninteractive_tabindex',
    'class="zdp-code-block__scroller"',
    'class="zdp-code-block__pre"',
    'role="region"',
    'tabindex="0"',
    'class="zdp-code-block__code"',
    '.zdp-code-block',
    '--zdp-code-block-surface: var(--zdp-color-surface-panel)',
    '--zdp-code-block-surface: var(--zdp-color-surface-raised)',
    '.zdp-code-block__copy:focus-visible',
    'background: var(--zdp-code-block-surface)',
    '.zdp-code-block__scroller:focus-visible',
    '.zdp-code-block[data-wrap="true"] .zdp-code-block__pre',
    'font-family: var(--zdp-font-family-mono)',
    'overflow-x: auto',
    'overscroll-behavior-inline: contain',
    'scrollbar-gutter: stable',
    'touch-action: pan-x pan-y'
  ]) {
    if (!codeBlock.includes(requiredText)) {
      failures.push(`CodeBlock component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'CodeBlock component', codeBlock);

  assertNoOverRoundedUsage(failures, 'CodeBlock component', codeBlock);

  for (const requiredText of [
    "import type { ZdpCommandFieldSize, ZdpCommandFieldType }",
    "import ShortcutHint from './ShortcutHint.svelte'",
    'type DescribedBy = string | readonly string[] | null',
    "type AriaAutocomplete = 'none' | 'inline' | 'list' | 'both'",
    'id?: string | null',
    'id = $bindable(null)',
    'name?: string | null',
    'name = $bindable(null)',
    'type?: ZdpCommandFieldType',
    "type = $bindable('search')",
    'label?: string | null',
    "label = $bindable('Search')",
    'labelVisible = $bindable(false)',
    'placeholder?: string | null',
    "placeholder = $bindable('Search query')",
    "autocomplete?: HTMLInputAttributes['autocomplete'] | null",
    "autocomplete = $bindable('off')",
    'describedBy?: DescribedBy',
    'describedBy = $bindable(null)',
    'errorMessageId?: string | null',
    'errorMessageId = $bindable(null)',
    'invalid = $bindable(false)',
    'disabled = $bindable(false)',
    'readonly = $bindable(false)',
    'required = $bindable(false)',
    'size?: ZdpCommandFieldSize',
    "size = $bindable('md')",
    'shortcutKeys?: readonly string[]',
    "shortcutKeys = $bindable(['/'])",
    'ariaKeyShortcuts?: string | null',
    'ariaKeyShortcuts = $bindable(null)',
    'ariaAutocomplete?: AriaAutocomplete | null',
    'ariaAutocomplete = $bindable(null)',
    'ariaControls?: string | null',
    'ariaControls = $bindable(null)',
    'ariaExpanded?: boolean | null',
    'ariaExpanded = $bindable(null)',
    'ariaActivedescendant?: string | null',
    'ariaActivedescendant = $bindable(null)',
    'onkeydown?: ((event: KeyboardEvent) => void) | null',
    'onkeydown = $bindable(null)',
    'normalizeIdRefs',
    'hasComboboxContract =',
    'resolvedAriaExpanded = $derived(hasComboboxContract ? ariaExpanded ?? false : null)',
    "role={hasComboboxContract ? 'combobox' : undefined}",
    'aria-describedby={ariaDescribedBy ?? undefined}',
    'aria-errormessage={resolvedErrorMessageId ?? undefined}',
    "aria-invalid={invalid ? 'true' : undefined}",
    'aria-keyshortcuts={ariaKeyShortcuts ?? undefined}',
    'aria-autocomplete={ariaAutocomplete ?? undefined}',
    'aria-controls={ariaControls ?? undefined}',
    'aria-expanded={resolvedAriaExpanded ?? undefined}',
    "aria-haspopup={hasComboboxContract ? 'listbox' : undefined}",
    'aria-activedescendant={ariaActivedescendant ?? undefined}',
    'onkeydown={onkeydown ?? undefined}',
    'class={`zdp-command-field-shell zdp-command-field-shell--${size}`}',
    "data-invalid={invalid ? 'true' : undefined}",
    "data-disabled={disabled ? 'true' : undefined}",
    'zdp-command-field__label--hidden',
    'class={`zdp-command-field zdp-command-field--${size}`}',
    'class="zdp-command-field__input"',
    'class="zdp-command-field__shortcut"',
    'aria-hidden="true"',
    '<ShortcutHint keys={shortcutKeys} size={size} />',
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
    'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
    'border-color: var(--zdp-color-focus-line)',
    'clip-path: inset(50%)'
  ]) {
    if (!commandField.includes(requiredText)) {
      failures.push(`CommandField component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'CommandField component', commandField);

  assertNoOverRoundedUsage(failures, 'CommandField component', commandField);

  for (const requiredText of [
    "import type { ZdpComboboxOption, ZdpComboboxSize }",
    'type DescribedBy = string | readonly string[] | null',
    'interface Props',
    'id?: string | null',
    'name?: string | null',
    "value = $bindable('')",
    "query = $bindable('')",
    'options?: readonly ZdpComboboxOption[]',
    "label = 'Search'",
    'labelVisible = false',
    'ariaLabel?: string | null',
    'placeholder?: string | null',
    "autocomplete?: HTMLInputAttributes['autocomplete'] | null",
    'describedBy?: DescribedBy',
    'errorMessageId?: string | null',
    'invalid = false',
    'disabled = false',
    'readonly = false',
    'required = false',
    "size = 'md'",
    "selectionRequiredText = 'Select an option'",
    'onQueryChange?: ((query: string) => void) | null',
    'onValueChange?: ((value: string, option: ZdpComboboxOption | null) => void) | null',
    'onOpenChange?: ((open: boolean) => void) | null',
    'role="combobox"',
    'aria-autocomplete="list"',
    'aria-haspopup="listbox"',
    'aria-expanded={open}',
    'aria-controls={open && hasOptions ? listboxId : undefined}',
    'aria-activedescendant={activeOptionDomId ?? undefined}',
    'aria-describedby={ariaDescribedBy ?? undefined}',
    'aria-errormessage={resolvedErrorMessageId ?? undefined}',
    "aria-invalid={invalid ? 'true' : undefined}",
    '<input type="hidden" {name} {value} disabled={disabled} />',
    'role="listbox"',
    'aria-label={resolvedListboxLabel}',
    'role="option"',
    'aria-selected={option.value === value}',
    'aria-disabled={option.disabled ?',
    'tabindex="-1"',
    'onQueryChange?.(query)',
    'onQueryChange?.(nextQuery)',
    '.zdp-combobox',
    '.zdp-combobox__control',
    '.zdp-combobox__control:focus-within',
    '.zdp-combobox__input',
    '.zdp-combobox__toggle',
    '.zdp-combobox__panel',
    '.zdp-combobox__listbox',
    '.zdp-combobox__option',
    '.zdp-combobox__option[data-active="true"]',
    '.zdp-combobox__option[data-selected="true"]',
    'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
    'border-color: var(--zdp-color-focus-line)',
    '-webkit-user-select: none',
    'user-select: none'
  ]) {
    if (!combobox.includes(requiredText)) {
      failures.push(`Combobox component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'Combobox component', combobox);

  assertNoOverRoundedUsage(failures, 'Combobox component', combobox);

  for (const requiredText of [
    "placement = 'top'",
    'disabled = false',
    'slot_element_deprecated legacy default slot contract remains public',
    'dismissLayer.setActive(visible, rootElement',
    'ignoreOutside: true',
    'onEscape: () => (dismissed = true)',
    'data-dismissed={dismissed ?',
    '<slot describedBy={describedBy} />',
    'id={tooltipId}',
    'role="tooltip"',
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
    'pointer-events: none',
    'white-space: normal',
    'overflow-wrap: anywhere',
    'max-inline-size: min('
  ]) {
    if (!tooltip.includes(requiredText)) {
      failures.push(`Tooltip component is missing ${requiredText}.`);
    }
  }

  if (tooltip.includes('document.activeElement.blur()')) {
    failures.push('Tooltip Escape dismissal must preserve trigger focus instead of calling document.activeElement.blur().');
  }

  assertNoDecorativeEffects(failures, 'Tooltip component', tooltip);

  assertNoOverRoundedUsage(failures, 'Tooltip component', tooltip);

  for (const requiredText of [
    "import type { ZdpDisclosureHeadingLevel }",
    'open = $bindable(false)',
    'disabled = false',
    "title = 'View details'",
    'headingLevel?: ZdpDisclosureHeadingLevel | null',
    'onOpenChange?: ((open: boolean) => void) | null',
    'slot_element_deprecated legacy named slot contract remains public',
    'slot_element_deprecated legacy default slot contract remains public',
    'resolvedId',
    'triggerId',
    'panelId',
    'aria-expanded={open}',
    'aria-controls={open ? panelId : undefined}',
    'disabled={disabled}',
    'role="heading"',
    'aria-level={headingLevel}',
    'class="zdp-disclosure__trigger"',
    'class="zdp-disclosure__title"',
    'class="zdp-disclosure__mark"',
    'class="zdp-disclosure__panel"',
    'role="group"',
    'aria-labelledby={triggerId}',
    '.zdp-disclosure',
    '.zdp-disclosure__trigger',
    '.zdp-disclosure__trigger:focus-visible',
    '.zdp-disclosure__panel',
    'overflow-wrap: var(--zdp-i18n-overflow-wrap)'
  ]) {
    if (!disclosure.includes(requiredText)) {
      failures.push(`Disclosure component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'Disclosure component', disclosure);

  assertNoOverRoundedUsage(failures, 'Disclosure component', disclosure);

  for (const requiredText of [
    "import Disclosure from './Disclosure.svelte'",
    'ZdpAccordionItem',
    'ZdpAccordionMode',
    'ZdpDisclosureHeadingLevel',
    'items?: readonly ZdpAccordionItem[]',
    "mode = 'multiple'",
    "ariaLabel = 'Collapsed sections'",
    'headingLevel?: ZdpDisclosureHeadingLevel | null',
    'onOpenChange',
    'nextItemStateSignature',
    'reconcileOpenIds',
    'retainedOpenIds',
    'newDefaultOpenIds',
    'normalizeInitialOpenIds',
    'isItemOpen',
    'role="list"',
    'aria-label={ariaLabel}',
    'class="zdp-accordion__item"',
    'role="listitem"',
    '<Disclosure',
    'open={isItemOpen(item.id)}',
    'disabled={item.disabled ?? false}',
    '.zdp-accordion',
    '.zdp-accordion__item'
  ]) {
    if (!accordion.includes(requiredText)) {
      failures.push(`Accordion component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'Accordion component', accordion);

  assertNoOverRoundedUsage(failures, 'Accordion component', accordion);

  for (const requiredText of [
    'ZdpSegmentedControlItem',
    'ZdpSegmentedControlSize',
    'items?: readonly ZdpSegmentedControlItem[]',
    'selectedId = $bindable(null)',
    "ariaLabel = 'Selection toggle'",
    'idPrefix?: string | null',
    "size = 'md'",
    'onChange',
    'activeId',
    'role="radiogroup"',
    'aria-label={ariaLabel}',
    'class={`zdp-segmented-control zdp-segmented-control--${size}`}',
    'class={`zdp-segmented-control__item',
    'role="radio"',
    'aria-checked={item.id === activeId}',
    'tabindex={item.id === activeId ? 0 : -1}',
    'disabled={item.disabled}',
    'onclick={(event) => selectItem(event, item)}',
    '.zdp-segmented-control',
    'background: var(--zdp-color-surface-raised)',
    'border: var(--zdp-control-border-width) solid transparent',
    '.zdp-segmented-control__item:hover:not(:disabled):not([aria-checked=',
    'background: var(--zdp-color-surface-panel)',
    'border-color: transparent',
    'background: var(--zdp-color-accent-primary)',
    ':global([data-zdp-theme="dark"]) .zdp-segmented-control__item--selected',
    'color: var(--zdp-color-ink-inverse)',
    '@media (forced-colors: active)',
    'border-color: ButtonText',
    '.zdp-segmented-control__item',
    '.zdp-segmented-control--sm .zdp-segmented-control__item',
    '.zdp-segmented-control--md .zdp-segmented-control__item',
    '.zdp-segmented-control__item:focus-visible',
    '.zdp-segmented-control__item--selected',
    'overflow-wrap: var(--zdp-i18n-overflow-wrap)'
  ]) {
    if (!segmentedControl.includes(requiredText)) {
      failures.push(`SegmentedControl component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'SegmentedControl component', segmentedControl);

  assertNoOverRoundedUsage(failures, 'SegmentedControl component', segmentedControl);

  for (const [label, source] of [
    ['LocaleSwitcher', localeSwitcher],
    ['SegmentedControl', segmentedControl]
  ] satisfies Array<readonly [string, string]>) {
    for (const forbiddenText of [
      'border-color: var(--zdp-color-line-strong)',
      'border-color: var(--zdp-color-accent-primary-strong)'
    ]) {
      if (source.includes(forbiddenText)) {
        failures.push(`${label} must express hover and selection with surfaces instead of visible borders: ${forbiddenText}.`);
      }
    }
  }

  for (const requiredText of [
    "placement = 'bottom'",
    "align = 'start'",
    "role = 'dialog'",
    'open = $bindable(false)',
    'slot_element_deprecated legacy named slot contract remains public',
    'slot_element_deprecated legacy default slot contract remains public',
    'onOpenChange',
    'dismissLayer.setActive(open, rootElement',
    'data-open={open ?',
    'slot name="trigger"',
    'panelId={panelId}',
    'role={role ?? undefined}',
    'aria-labelledby={labelledBy ?? triggerId}',
    '.zdp-popover',
    '.zdp-popover__trigger',
    '.zdp-popover__panel',
    '.zdp-popover__panel:focus-visible',
    '.zdp-popover--bottom .zdp-popover__panel',
    '.zdp-popover--top.zdp-popover--align-start .zdp-popover__panel',
    'max-inline-size: min(22rem, calc(var(--zdp-viewport-inline) - var(--zdp-space-6)))',
    'translate: -50% 0',
    'translate: 0 -50%'
  ]) {
    if (!popover.includes(requiredText)) {
      failures.push(`Popover component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'Popover component', popover);

  assertNoOverRoundedUsage(failures, 'Popover component', popover);

  for (const requiredText of [
    'import type { ZdpMenuItem }',
    'items?: readonly ZdpMenuItem[]',
    'open = $bindable(false)',
    'slot_element_deprecated legacy named slot contract remains public',
    'triggerLabel =',
    'onOpenChange',
    'onSelect',
    'focusActiveItem',
    'resolvedRel',
    'dismissLayer.setActive(open, rootElement',
    'aria-haspopup="menu"',
    'aria-expanded={open}',
    'aria-controls={open ? panelId : undefined}',
    'role="menu"',
    'aria-labelledby={triggerId}',
    'role="menuitem"',
    'aria-disabled={item.disabled ?',
    'tabindex={item.id === activeItemId && !item.disabled ? 0 : -1}',
    'data-menu-item-id={item.id}',
    'role="separator"',
    'class="zdp-menu__trigger-mark"',
    '.zdp-menu__trigger-mark::before',
    '.zdp-menu',
    '.zdp-menu__trigger',
    '.zdp-menu__trigger:focus-visible',
    '.zdp-menu__panel',
    '.zdp-menu__panel:focus-visible',
    '.zdp-menu__item',
    '.zdp-menu__item:hover:not(:disabled):not([aria-disabled="true"])',
    '.zdp-menu__item--danger',
    '.zdp-menu__separator',
    'border: var(--zdp-control-border-width) solid transparent',
    'background: var(--zdp-color-surface-panel)',
    'background: var(--zdp-color-surface-raised)',
    'background: var(--zdp-color-accent-primary-soft)',
    'border-color: ButtonText',
    '.zdp-menu--bottom .zdp-menu__panel',
    '.zdp-menu--align-end .zdp-menu__panel',
    'max-inline-size: min(18rem, calc(var(--zdp-viewport-inline) - var(--zdp-space-6)))',
    'translate: -50% 0',
    'translate: 0 -50%'
  ]) {
    if (!menu.includes(requiredText)) {
      failures.push(`Menu component is missing ${requiredText}.`);
    }
  }
}

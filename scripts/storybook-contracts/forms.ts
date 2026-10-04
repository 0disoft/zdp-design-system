import type { StorybookCheckContext } from './context';
import { assertNoDecorativeEffects, assertNoOverRoundedUsage } from '../style-contract';

export function checkFormsContracts(context: StorybookCheckContext): void {
  const { failures, buttonsStory, buttonsComponent, buttonPlayground, button, checkbox, confirmAction, errorText, field, input, label, radio, select, switchComponent, textarea } = context;

  for (const requiredText of [
    'export let tone: \'primary\' | \'danger\' = \'primary\'',
    'export let label = \'Slide to confirm\'',
    'export let hint = \'Slide or hold for 2 seconds\'',
    'export let completeLabel = \'Confirmed\'',
    'export let onconfirm: (() => void) | null = null',
    'if (disabled && active)',
    'if (disabled) {\n      cancelInteraction();',
    'resetTimer = window.setTimeout(reset, 1000);\n\n    try {\n      onconfirm?.();',
    'catch (error) {\n      reset();\n      throw error;',
    'class="zdp-confirm-action__glyph"',
    'stroke-width: 2.25',
    '--zdp-confirm-action-progress: 0',
    'width: calc(var(--zdp-confirm-action-progress) * 100%)',
    'touch-action: none',
    'border: var(--zdp-control-border-width) solid transparent',
    'background: var(--zdp-color-surface-raised)',
    'background: var(--zdp-color-accent-primary-soft)',
    'border-color: ButtonText',
    '.zdp-confirm-action--danger',
    'background: var(--zdp-color-accent-danger)',
    'opacity: 0.24',
    '.zdp-confirm-action[data-confirmed="true"]'
  ]) {
    if (!confirmAction.includes(requiredText)) {
      failures.push(`ConfirmAction component is missing ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'onclick: ((event: MouseEvent) => void) | null = null',
    'ariaLabel: string | null = null',
    'ariaControls: string | null = null',
    'ariaDescribedBy: string | null = null',
    'ariaExpanded: boolean | null = null',
    'ariaPressed: boolean | null = null',
    'ariaKeyShortcuts: string | null = null',
    'aria-label={ariaLabel ?? undefined}',
    'aria-controls={ariaControls ?? undefined}',
    'aria-describedby={ariaDescribedBy ?? undefined}',
    'aria-expanded={ariaExpanded ?? undefined}',
    'aria-pressed={ariaPressed ?? undefined}',
    'aria-keyshortcuts={ariaKeyShortcuts ?? undefined}',
    'onclick={onclick ?? undefined}',
    'font-family: var(--zdp-font-family-sans)',
    'font-weight: var(--zdp-font-weight-medium)',
    'border: var(--zdp-control-border-width) solid transparent',
    'border-color: transparent',
    'background: var(--zdp-color-accent-primary)',
    '.zdp-button--primary:hover:not(:disabled)',
    '.zdp-button--secondary:hover:not(:disabled)',
    '.zdp-button--danger:hover:not(:disabled)',
    '.zdp-button--text:hover:not(:disabled)',
    '.zdp-button--text:focus-visible::after',
    'padding-inline: var(--zdp-space-2)',
    'min-block-size: var(--zdp-control-focus-underline-width)',
    'background: var(--zdp-color-surface-raised)',
    '.zdp-button--primary:active:not(:disabled)',
    'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
    'border-color: var(--zdp-color-focus-line)',
    '.zdp-button:not(.zdp-button--text)',
    'border-color: ButtonText'
  ]) {
    if (!button.includes(requiredText)) {
      failures.push(`Button component is missing ${requiredText}.`);
    }
  }

  const textButtonHoverBlock = button.slice(
    button.indexOf('.zdp-button--text:hover:not(:disabled)::after'),
    button.indexOf('.zdp-button:focus-visible')
  );

  if (!textButtonHoverBlock.includes('min-block-size: var(--zdp-control-focus-underline-width)')) {
    failures.push('Button text variant hover must strengthen the underline in light and dark themes.');
  }

  const flatButtonBlock = button.slice(button.indexOf('.zdp-button {'), button.indexOf('.zdp-button:focus-visible'));

  for (const forbiddenText of [
    'border-color: var(--zdp-color-line-',
    'border-color: var(--zdp-color-accent-primary-strong)',
    'border-color: var(--zdp-color-accent-danger)'
  ]) {
    if (flatButtonBlock.includes(forbiddenText)) {
      failures.push(`Button visual variants must not restore visible borders: ${forbiddenText}.`);
    }
  }

  for (const requiredText of [
    '<Button variant="text">가격 보기</Button>',
    '<Button variant="text" disabled>가격 보기</Button>',
    'class="text-action-demo" aria-label="경계 없는 탐색 — 밝은 테마"',
    'class="text-action-demo" aria-label="경계 없는 탐색 — 어두운 테마"',
    'class="zdp-button zdp-button--text zdp-button--md"',
    '.text-action-demo',
    '.text-action-demo-shell'
  ]) {
    if (!buttonsComponent.includes(requiredText)) {
      failures.push(`Button states story is missing ${requiredText}.`);
    }
  }

  for (const requiredText of [
    "export let variant: 'primary' | 'secondary' | 'danger' | 'text' = 'primary'",
    "options: ['primary', 'secondary', 'danger', 'text']"
  ]) {
    if (!buttonPlayground.includes(requiredText) && !buttonsStory.includes(requiredText)) {
      failures.push(`Button playground contract is missing ${requiredText}.`);
    }
  }

  for (const requiredText of [
    '.zdp-field',
    '.zdp-field--sm',
    '.zdp-field--md',
    'data-disabled={disabled ?',
    'data-readonly={readonly ?',
    'data-required={required ?',
    '.zdp-field[data-disabled="true"]'
  ]) {
    if (!field.includes(requiredText)) {
      failures.push(`Field component is missing ${requiredText}.`);
    }
  }

  for (const requiredText of [
    '.zdp-label',
    "requiredLabel = 'Required'",
    'font-weight: var(--zdp-font-weight-medium)',
    '.zdp-label__required',
    '.zdp-label__required-text',
    'clip-path: inset(50%)'
  ]) {
    if (!label.includes(requiredText)) {
      failures.push(`Label component is missing ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'live:',
    "aria-live={live === 'off' ? undefined : live}"
  ]) {
    if (!errorText.includes(requiredText)) {
      failures.push(`ErrorText component is missing ${requiredText}.`);
    }
  }

  for (const [componentName, componentSource] of Object.entries({
    Input: input,
    Select: select,
    Textarea: textarea
  })) {
    for (const requiredText of [
      `class="zdp-${componentName.toLowerCase()}"`,
      'type DescribedBy = string | readonly string[] | null',
      'normalizeIdRefs',
      'aria-describedby={ariaDescribedBy ?? undefined}',
      'aria-errormessage={resolvedErrorMessageId ?? undefined}',
      "aria-invalid={invalid ? 'true' : undefined}",
      ':hover:not(:disabled)',
      ':focus-visible',
      'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
      '[aria-invalid="true"]'
    ]) {
      if (!componentSource.includes(requiredText)) {
        failures.push(`${componentName} component is missing ${requiredText}.`);
      }
    }
  }

  for (const [componentName, componentSource] of Object.entries({ Input: input, Textarea: textarea })) {
    for (const requiredText of [
      'border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong)',
      'background: var(--zdp-color-surface-panel)',
      'background: var(--zdp-color-surface-raised)',
      'border-color: var(--zdp-color-focus-line)',
      'border-color: var(--zdp-color-accent-danger)'
    ]) {
      if (!componentSource.includes(requiredText)) {
        failures.push(`${componentName} component is missing framed input contract text ${requiredText}.`);
      }
    }
  }

  for (const requiredText of [
    'border: var(--zdp-control-border-width) solid transparent',
    'background: var(--zdp-color-surface-raised)',
      'background: var(--zdp-color-accent-primary-soft)',
      '.zdp-select::picker(select)',
      '.zdp-select:focus-visible',
      '.zdp-select[aria-invalid="true"]',
      'border-color: ButtonText'
  ]) {
    if (!select.includes(requiredText)) {
      failures.push(`Select component is missing borderless surface contract text ${requiredText}.`);
    }
  }

  for (const [componentName, componentSource] of Object.entries({
    Input: input,
    Textarea: textarea
  })) {
    for (const requiredText of [
      'readonly = false',
      'readonly={readonly}',
      '[readonly]',
      'background: var(--zdp-color-surface-raised)',
      'color: var(--zdp-color-ink-normal)'
    ]) {
      if (!componentSource.includes(requiredText)) {
        failures.push(`${componentName} component is missing readonly state ${requiredText}.`);
      }
    }
  }

  for (const [componentName, componentSource] of Object.entries({
    Checkbox: checkbox,
    Radio: radio
  })) {
    for (const requiredText of [
      'class="zdp-choice__input"',
      'class="zdp-choice__mark"',
      'class="zdp-choice__body"',
      'class="zdp-choice__label"',
      'grid-template-columns: var(--zdp-control-choice-size) minmax(0, 1fr)',
      'height: var(--zdp-control-choice-size)',
      'width: var(--zdp-control-choice-size)',
      'aria-describedby={describedBy ?? undefined}',
      '.zdp-choice:hover .zdp-choice__input:not(:checked):not(:disabled) + .zdp-choice__mark',
      '.zdp-choice__input:checked + .zdp-choice__mark',
      '.zdp-choice__input:focus-visible + .zdp-choice__mark',
      'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
      'border-color: var(--zdp-color-focus-line)',
      'border-color: var(--zdp-color-accent-danger)'
    ]) {
      if (!componentSource.includes(requiredText)) {
        failures.push(`${componentName} component is missing ${requiredText}.`);
      }
    }
  }

  if (!checkbox.includes("aria-invalid={invalid ? 'true' : undefined}")) {
    failures.push('Checkbox component must keep aria-invalid for checkbox invalid state.');
  }

  for (const requiredText of [
    'border-bottom: 2px solid currentcolor',
    'border-left: 2px solid currentcolor'
  ]) {
    if (!checkbox.includes(requiredText)) {
      failures.push(`Checkbox component is missing thicker checkmark stroke ${requiredText}.`);
    }
  }

  if (!checkbox.includes('.zdp-choice__input[aria-invalid="true"] + .zdp-choice__mark')) {
    failures.push('Checkbox component must style aria-invalid on the native checkbox input.');
  }

  if (!radio.includes('.zdp-choice[data-invalid="true"] .zdp-choice__mark')) {
    failures.push('Radio component must keep wrapper invalid styling because the native radio role does not support aria-invalid.');
  }

  for (const requiredText of [
    'export let value: string',
    'export let selectedValue: string | null = null',
    'resolvedChecked = selectedValue === value',
    'selectedValue = value'
  ]) {
    if (!radio.includes(requiredText)) {
      failures.push(`Radio component is missing single-value group contract ${requiredText}.`);
    }
  }

  if (radio.includes('export let checked')) {
    failures.push('Radio component must not expose per-item checked state; groups bind one selectedValue.');
  }

  for (const requiredText of [
    'role="switch"',
    'type DescribedBy = string | readonly string[] | null',
    'errorMessageId: string | null = null',
    'invalid = false',
    'normalizeIdRefs',
    'class="zdp-switch__input"',
    'class="zdp-switch__track"',
    'class="zdp-switch__body"',
    'class="zdp-switch__label"',
    'grid-template-columns: var(--zdp-control-switch-width) minmax(0, 1fr)',
    'height: var(--zdp-control-switch-height)',
    'width: var(--zdp-control-switch-width)',
    'aria-describedby={ariaDescribedBy ?? undefined}',
    'aria-errormessage={resolvedErrorMessageId ?? undefined}',
    "aria-invalid={invalid ? 'true' : undefined}",
    '.zdp-switch:hover .zdp-switch__input:not(:checked):not(:disabled) + .zdp-switch__track',
    '.zdp-switch__input:checked + .zdp-switch__track',
    '.zdp-switch__input:focus-visible + .zdp-switch__track',
    '.zdp-switch__input[aria-invalid="true"] + .zdp-switch__track',
    'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
    'border-color: var(--zdp-color-focus-line)'
  ]) {
    if (!switchComponent.includes(requiredText)) {
      failures.push(`Switch component is missing ${requiredText}.`);
    }
  }
}

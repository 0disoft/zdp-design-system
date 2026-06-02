import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { assertNoDecorativeEffects, assertNoOverRoundedUsage } from './style-contract';

interface PackageJson {
  readonly scripts?: Record<string, string>;
  readonly devDependencies?: Record<string, string>;
  readonly exports?: Record<string, unknown>;
  readonly sideEffects?: readonly unknown[];
}

const root = process.cwd();
const packagePath = join(root, 'package.json');
const mainPath = join(root, '.storybook', 'main.ts');
const previewPath = join(root, '.storybook', 'preview.ts');
const storyPath = join(root, 'stories', 'DesignSystemOverview.stories.ts');
const componentPath = join(root, 'stories', 'DesignSystemOverview.svelte');
const badgePath = join(root, 'src', 'lib', 'components', 'Badge.svelte');
const breadcrumbPath = join(root, 'src', 'lib', 'components', 'Breadcrumb.svelte');
const buttonPath = join(root, 'src', 'lib', 'components', 'Button.svelte');
const calloutPath = join(root, 'src', 'lib', 'components', 'Callout.svelte');
const checkboxPath = join(root, 'src', 'lib', 'components', 'Checkbox.svelte');
const dialogPath = join(root, 'src', 'lib', 'components', 'Dialog.svelte');
const fieldPath = join(root, 'src', 'lib', 'components', 'Field.svelte');
const inputPath = join(root, 'src', 'lib', 'components', 'Input.svelte');
const labelPath = join(root, 'src', 'lib', 'components', 'Label.svelte');
const radioPath = join(root, 'src', 'lib', 'components', 'Radio.svelte');
const selectPath = join(root, 'src', 'lib', 'components', 'Select.svelte');
const switchPath = join(root, 'src', 'lib', 'components', 'Switch.svelte');
const tabsPath = join(root, 'src', 'lib', 'components', 'Tabs.svelte');
const textareaPath = join(root, 'src', 'lib', 'components', 'Textarea.svelte');
const iconButtonPath = join(root, 'src', 'lib', 'components', 'IconButton.svelte');
const surfacePath = join(root, 'src', 'lib', 'components', 'Surface.svelte');
const failures: string[] = [];

const [
  packageJson,
  main,
  preview,
  story,
  component,
  badge,
  breadcrumb,
  button,
  callout,
  checkbox,
  dialog,
  field,
  input,
  label,
  radio,
  select,
  switchComponent,
  tabs,
  textarea,
  iconButton,
  surface
] =
  await Promise.all([
    readPackageJson(packagePath),
    readFile(mainPath, 'utf8'),
    readFile(previewPath, 'utf8'),
    readFile(storyPath, 'utf8'),
    readFile(componentPath, 'utf8'),
    readFile(badgePath, 'utf8'),
    readFile(breadcrumbPath, 'utf8'),
    readFile(buttonPath, 'utf8'),
    readFile(calloutPath, 'utf8'),
    readFile(checkboxPath, 'utf8'),
    readFile(dialogPath, 'utf8'),
    readFile(fieldPath, 'utf8'),
    readFile(inputPath, 'utf8'),
    readFile(labelPath, 'utf8'),
    readFile(radioPath, 'utf8'),
    readFile(selectPath, 'utf8'),
    readFile(switchPath, 'utf8'),
    readFile(tabsPath, 'utf8'),
    readFile(textareaPath, 'utf8'),
    readFile(iconButtonPath, 'utf8'),
    readFile(surfacePath, 'utf8')
  ]);

for (const [scriptName, expectedCommand] of Object.entries({
  dev: 'storybook dev -p 6006',
  build: 'storybook build',
  storybook: 'bun run dev',
  'storybook:build': 'bun run build',
  'storybook:check': 'bun scripts/check-storybook.ts'
})) {
  if (packageJson.scripts?.[scriptName] !== expectedCommand) {
    failures.push(`Missing package script ${scriptName}.`);
  }
}

if (!packageJson.scripts?.check?.includes('bun scripts/check-storybook.ts')) {
  failures.push('Package check script must include Storybook contract validation.');
}

if (packageJson.exports?.['./locale-fonts.css'] !== './src/styles/locale-fonts.css') {
  failures.push('Package must expose ./locale-fonts.css for optional locale font loading.');
}

if (!packageJson.sideEffects?.includes('./src/styles/locale-fonts.css')) {
  failures.push('Package sideEffects must keep ./src/styles/locale-fonts.css.');
}

for (const dependencyName of ['@storybook/svelte-vite', 'storybook', 'svelte', 'vite']) {
  if (!packageJson.devDependencies?.[dependencyName]) {
    failures.push(`Missing devDependency ${dependencyName}.`);
  }
}

if (!packageJson.devDependencies?.['@sveltejs/vite-plugin-svelte']) {
  failures.push('Missing devDependency @sveltejs/vite-plugin-svelte.');
}

for (const requiredText of [
  "import { svelte } from '@sveltejs/vite-plugin-svelte'",
  "import type { StorybookConfig } from '@storybook/svelte-vite'",
  "'../stories/**/*.stories.@(js|ts|svelte)'",
  "name: '@storybook/svelte-vite'",
  'docgen: false',
  'async viteFinal(config)',
  'svelte()'
]) {
  if (!main.includes(requiredText)) {
    failures.push(`Storybook main config is missing ${requiredText}.`);
  }
}

if (!preview.includes("import '../src/styles/index.css';")) {
  failures.push('Storybook preview must import the shared style entry.');
}

for (const requiredText of [
  "title: 'Design System/Overview'",
  'DesignSystemOverview',
  "layout: 'fullscreen'"
]) {
  if (!story.includes(requiredText)) {
    failures.push(`Story definition is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  '../src/lib/components/Badge.svelte',
  '../src/lib/components/Breadcrumb.svelte',
  '../src/lib/components/Button.svelte',
  '../src/lib/components/Callout.svelte',
  '../src/lib/components/Checkbox.svelte',
  '../src/lib/components/Dialog.svelte',
  '../src/lib/components/ErrorText.svelte',
  '../src/lib/components/Field.svelte',
  '../src/lib/components/HelpText.svelte',
  '../src/lib/components/IconButton.svelte',
  '../src/lib/components/Input.svelte',
  '../src/lib/components/Label.svelte',
  '../src/lib/components/Radio.svelte',
  '../src/lib/components/Select.svelte',
  '../src/lib/components/Surface.svelte',
  '../src/lib/components/Switch.svelte',
  '../src/lib/components/Tabs.svelte',
  '../src/lib/components/Textarea.svelte',
  '<main class="storybook-preview zdp-surface-reset" lang="ko">',
  'data-zdp-theme="light"',
  'data-zdp-theme="dark"',
  'Pretendard-first multiscript text',
  'lang="zh"',
  'lang="hi"',
  'swatch__paint--primary',
  'swatch__paint--success',
  'swatch__paint--warning',
  'swatch__paint--danger',
  'Foundation tokens',
  '--zdp-type-body-size',
  '--zdp-type-body-small-size',
  '--zdp-type-caption-size',
  '--zdp-type-data-size',
  '--zdp-control-radius',
  '--zdp-control-border-width',
  '--zdp-control-focus-outline-width',
  '--zdp-i18n-overflow-wrap',
  'Search Design System',
  '출시 노트 보기',
  '업데이트 보기',
  '자세히 보기',
  'storybook-light-forms',
  'storybook-dark-forms',
  '공개 표기와 알림에 사용됩니다.',
  '다음 단계 전에 기준을 확인하세요.',
  '업데이트 받기',
  '알림 주기',
  '자동 저장',
  '작성 중인 내용을 임시 보관합니다.',
  'storybook-light-feedback',
  'storybook-dark-feedback',
  'storybook-light-breadcrumb',
  'storybook-dark-breadcrumb',
  '현재 위치',
  'storybook-light-tabs',
  'storybook-dark-tabs',
  'storybook-light-dialog',
  'storybook-dark-dialog',
  'storybook-light-dialog-title',
  'storybook-dark-dialog-title',
  '검토 열기',
  '변경 내용을 저장할까요?',
  '검토 중',
  '정상',
  '삭제 전에 다시 확인하세요.',
  '탭은 페이지 안의 가까운 정보 묶음을 바꿀 때 사용합니다.'
]) {
  if (!component.includes(requiredText)) {
    failures.push(`Storybook overview is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  '.zdp-badge',
  '.zdp-badge--primary',
  '.zdp-badge--success',
  '.zdp-badge--warning',
  '.zdp-badge--danger',
  'font-weight: var(--zdp-font-weight-medium)',
  'border-radius: var(--zdp-control-radius)',
  'background: var(--zdp-color-surface-panel)'
]) {
  if (!badge.includes(requiredText)) {
    failures.push(`Badge component is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  '.zdp-callout',
  '.zdp-callout__mark',
  '.zdp-callout__body',
  'aria-labelledby={labelledBy ?? undefined}',
  'role={semanticRole ?? undefined}',
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

for (const source of [badge, callout]) {
  assertNoDecorativeEffects(failures, 'Feedback component', source);
  assertNoOverRoundedUsage(failures, 'Feedback component', source);
}

for (const requiredText of [
  'export interface BreadcrumbItem',
  'readonly href?: string',
  'readonly current?: boolean',
  '<nav class="zdp-breadcrumb" aria-label={ariaLabel}>',
  '<ol class="zdp-breadcrumb__list">',
  'class="zdp-breadcrumb__item"',
  'class="zdp-breadcrumb__separator"',
  'aria-hidden="true"',
  'class="zdp-breadcrumb__link"',
  'href={item.href}',
  'class="zdp-breadcrumb__current"',
  "aria-current={item.current ? 'page' : undefined}",
  '.zdp-breadcrumb__link:focus-visible',
  'background: var(--zdp-color-focus-surface)',
  'border-bottom-color: var(--zdp-color-focus-line)',
  'color: var(--zdp-color-focus-text)'
]) {
  if (!breadcrumb.includes(requiredText)) {
    failures.push(`Breadcrumb component is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'Breadcrumb component', breadcrumb);
assertNoOverRoundedUsage(failures, 'Breadcrumb component', breadcrumb);

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
  'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
  'border-color: var(--zdp-color-focus-line)'
]) {
  if (!button.includes(requiredText)) {
    failures.push(`Button component is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  '.zdp-field',
  '.zdp-field--sm',
  '.zdp-field--md'
]) {
  if (!field.includes(requiredText)) {
    failures.push(`Field component is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  '.zdp-label',
  'font-weight: var(--zdp-font-weight-medium)',
  '.zdp-label__required'
]) {
  if (!label.includes(requiredText)) {
    failures.push(`Label component is missing ${requiredText}.`);
  }
}

for (const [componentName, componentSource] of Object.entries({
  Input: input,
  Select: select,
  Textarea: textarea
})) {
  for (const requiredText of [
    `class="zdp-${componentName.toLowerCase()}"`,
    'aria-describedby={describedBy ?? undefined}',
    "aria-invalid={invalid ? 'true' : undefined}",
    'border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong)',
    'background: var(--zdp-color-surface-panel)',
    ':hover:not(:disabled)',
    'background: var(--zdp-color-surface-raised)',
    ':focus-visible',
    'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
    'border-color: var(--zdp-color-focus-line)',
    '[aria-invalid="true"]',
    'border-color: var(--zdp-color-accent-danger)'
  ]) {
    if (!componentSource.includes(requiredText)) {
      failures.push(`${componentName} component is missing ${requiredText}.`);
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
    'aria-describedby={describedBy ?? undefined}',
    'onchange={handleChange}',
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

if (!checkbox.includes('.zdp-choice__input[aria-invalid="true"] + .zdp-choice__mark')) {
  failures.push('Checkbox component must style aria-invalid on the native checkbox input.');
}

if (!radio.includes('.zdp-choice[data-invalid="true"] .zdp-choice__mark')) {
  failures.push('Radio component must express invalid state on the wrapper, not the native radio input.');
}

for (const requiredText of [
  'role="switch"',
  'class="zdp-switch__input"',
  'class="zdp-switch__track"',
  'class="zdp-switch__body"',
  'class="zdp-switch__label"',
  'aria-describedby={describedBy ?? undefined}',
  'onchange={handleChange}',
  '.zdp-switch__input:checked + .zdp-switch__track',
  '.zdp-switch__input:focus-visible + .zdp-switch__track',
  'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
  'border-color: var(--zdp-color-focus-line)'
]) {
  if (!switchComponent.includes(requiredText)) {
    failures.push(`Switch component is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  'export interface TabItem',
  'role="tablist"',
  'tabindex="-1"',
  'role="tab"',
  'role="tabpanel"',
  '{#if selectedItem}',
  'id={panelId(selectedItem.id)}',
  'aria-labelledby={tabId(selectedItem.id)}',
  '<slot selectedId={selectedItem.id} selectedItem={selectedItem} />',
  'aria-selected={item.id === activeId}',
  'aria-controls={panelId(item.id)}',
  'tabindex={item.id === activeId ? 0 : -1}',
  'onkeydown={handleKeydown}',
  'onclick={() => selectTab(item)}',
  '.zdp-tabs__tab--active',
  '.zdp-tabs__tab:focus-visible',
  '.zdp-tabs__panel:focus-visible',
  'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
  'border-color: var(--zdp-color-focus-line)'
]) {
  if (!tabs.includes(requiredText)) {
    failures.push(`Tabs component is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'Tabs component', tabs);
assertNoOverRoundedUsage(failures, 'Tabs component', tabs);

for (const requiredText of [
  'role="dialog"',
  'aria-modal="true"',
  'aria-labelledby={labelledBy}',
  'aria-describedby={describedBy ?? undefined}',
  'onkeydown={handleKeydown}',
  'onclick={handleBackdropClick}',
  'bind:this={panelElement}',
  'closeOnEscape',
  'closeOnBackdrop',
  'getFocusableElements',
  '.zdp-dialog',
  '.zdp-dialog__backdrop',
  '.zdp-dialog__panel',
  '.zdp-dialog__panel:focus-visible',
  '.zdp-dialog__close:focus-visible',
  'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
  'border-color: var(--zdp-color-focus-line)'
]) {
  if (!dialog.includes(requiredText)) {
    failures.push(`Dialog component is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'Dialog component', dialog);
assertNoOverRoundedUsage(failures, 'Dialog component', dialog);

for (const source of [checkbox, field, input, label, radio, select, switchComponent, textarea]) {
  assertNoDecorativeEffects(failures, 'Form component', source);
  assertNoOverRoundedUsage(failures, 'Form component', source);
}

for (const requiredText of [
  '.zdp-icon-button--solid:active:not(:disabled)',
  '.zdp-icon-button--solid:hover:not(:disabled)',
  '.zdp-icon-button--ghost:hover:not(:disabled)',
  'border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong)',
  'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
  'border-color: var(--zdp-color-focus-line)',
  'align-items: center',
  'justify-content: center',
  'line-height: 1'
]) {
  if (!iconButton.includes(requiredText)) {
    failures.push(`IconButton component is missing centered glyph style ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'Button component', button);
assertNoDecorativeEffects(failures, 'IconButton component', iconButton);
assertNoDecorativeEffects(failures, 'Surface component', surface);
assertNoDecorativeEffects(failures, 'Storybook overview', component);
assertNoOverRoundedUsage(failures, 'Button component', button);
assertNoOverRoundedUsage(failures, 'IconButton component', iconButton);
assertNoOverRoundedUsage(failures, 'Surface component', surface);
assertNoOverRoundedUsage(failures, 'Storybook overview', component);

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(failure);
  }

  process.exitCode = 1;
}

async function readPackageJson(path: string): Promise<PackageJson> {
  const parsed: unknown = JSON.parse(await readFile(path, 'utf8'));

  if (!isRecord(parsed)) {
    throw new Error('package.json must be a JSON object.');
  }

  return {
    scripts: readOptionalStringRecord(parsed.scripts, 'scripts'),
    devDependencies: readOptionalStringRecord(parsed.devDependencies, 'devDependencies'),
    exports: isRecord(parsed.exports) ? parsed.exports : undefined,
    sideEffects: Array.isArray(parsed.sideEffects) ? parsed.sideEffects : undefined
  };
}

function readOptionalStringRecord(
  value: unknown,
  path: string
): Record<string, string> | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!isRecord(value)) {
    throw new Error(`package.json field ${path} must be an object.`);
  }

  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry !== 'string' || entry.trim().length === 0) {
      throw new Error(`package.json field ${path}.${key} must be a non-empty string.`);
    }
  }

  return value as Record<string, string>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

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
const buttonsStoryPath = join(root, 'stories', 'Buttons.stories.ts');
const buttonsComponentPath = join(root, 'stories', 'Buttons.svelte');
const buttonPlaygroundPath = join(root, 'stories', 'ButtonPlayground.svelte');
const dataDisplayStoryPath = join(root, 'stories', 'DataDisplay.stories.ts');
const dataDisplayComponentPath = join(root, 'stories', 'DataDisplay.svelte');
const feedbackStoryPath = join(root, 'stories', 'Feedback.stories.ts');
const feedbackComponentPath = join(root, 'stories', 'Feedback.svelte');
const formsStoryPath = join(root, 'stories', 'Forms.stories.ts');
const formsComponentPath = join(root, 'stories', 'Forms.svelte');
const interactionStoryPath = join(root, 'stories', 'Interaction.stories.ts');
const interactionComponentPath = join(root, 'stories', 'Interaction.svelte');
const interactionProbePath = join(root, 'stories', 'InteractionProbe.svelte');
const layoutStoryPath = join(root, 'stories', 'Layout.stories.ts');
const layoutComponentPath = join(root, 'stories', 'Layout.svelte');
const navigationStoryPath = join(root, 'stories', 'Navigation.stories.ts');
const navigationComponentPath = join(root, 'stories', 'Navigation.svelte');
const badgePath = join(root, 'src', 'lib', 'components', 'Badge.svelte');
const breadcrumbPath = join(root, 'src', 'lib', 'components', 'Breadcrumb.svelte');
const buttonPath = join(root, 'src', 'lib', 'components', 'Button.svelte');
const calloutPath = join(root, 'src', 'lib', 'components', 'Callout.svelte');
const checkboxPath = join(root, 'src', 'lib', 'components', 'Checkbox.svelte');
const confirmActionPath = join(root, 'src', 'lib', 'components', 'ConfirmAction.svelte');
const containerPath = join(root, 'src', 'lib', 'components', 'Container.svelte');
const dialogPath = join(root, 'src', 'lib', 'components', 'Dialog.svelte');
const dividerPath = join(root, 'src', 'lib', 'components', 'Divider.svelte');
const emptyStatePath = join(root, 'src', 'lib', 'components', 'EmptyState.svelte');
const errorTextPath = join(root, 'src', 'lib', 'components', 'ErrorText.svelte');
const fieldPath = join(root, 'src', 'lib', 'components', 'Field.svelte');
const gridPath = join(root, 'src', 'lib', 'components', 'Grid.svelte');
const inputPath = join(root, 'src', 'lib', 'components', 'Input.svelte');
const kbdPath = join(root, 'src', 'lib', 'components', 'Kbd.svelte');
const keyValuePath = join(root, 'src', 'lib', 'components', 'KeyValue.svelte');
const labelPath = join(root, 'src', 'lib', 'components', 'Label.svelte');
const linkPath = join(root, 'src', 'lib', 'components', 'Link.svelte');
const pagePath = join(root, 'src', 'lib', 'components', 'Page.svelte');
const pageHeaderPath = join(root, 'src', 'lib', 'components', 'PageHeader.svelte');
const radioPath = join(root, 'src', 'lib', 'components', 'Radio.svelte');
const sectionPath = join(root, 'src', 'lib', 'components', 'Section.svelte');
const selectPath = join(root, 'src', 'lib', 'components', 'Select.svelte');
const shareDockPath = join(root, 'src', 'lib', 'components', 'ShareDock.svelte');
const shortcutHintPath = join(root, 'src', 'lib', 'components', 'ShortcutHint.svelte');
const skipLinkPath = join(root, 'src', 'lib', 'components', 'SkipLink.svelte');
const stackPath = join(root, 'src', 'lib', 'components', 'Stack.svelte');
const switchPath = join(root, 'src', 'lib', 'components', 'Switch.svelte');
const tabsPath = join(root, 'src', 'lib', 'components', 'Tabs.svelte');
const tablePath = join(root, 'src', 'lib', 'components', 'Table.svelte');
const textareaPath = join(root, 'src', 'lib', 'components', 'Textarea.svelte');
const toolbarPath = join(root, 'src', 'lib', 'components', 'Toolbar.svelte');
const visuallyHiddenPath = join(root, 'src', 'lib', 'components', 'VisuallyHidden.svelte');
const iconPath = join(root, 'src', 'lib', 'components', 'Icon.svelte');
const iconButtonPath = join(root, 'src', 'lib', 'components', 'IconButton.svelte');
const inlinePath = join(root, 'src', 'lib', 'components', 'Inline.svelte');
const surfacePath = join(root, 'src', 'lib', 'components', 'Surface.svelte');
const failures: string[] = [];

const [
  packageJson,
  main,
  preview,
  story,
  component,
  buttonsStory,
  buttonsComponent,
  buttonPlayground,
  dataDisplayStory,
  dataDisplayComponent,
  feedbackStory,
  feedbackComponent,
  formsStory,
  formsComponent,
  interactionStory,
  interactionComponent,
  interactionProbe,
  layoutStory,
  layoutComponent,
  navigationStory,
  navigationComponent,
  badge,
  breadcrumb,
  button,
  callout,
  checkbox,
  confirmAction,
  container,
  dialog,
  divider,
  emptyState,
  errorText,
  field,
  grid,
  input,
  kbd,
  keyValue,
  label,
  link,
  page,
  pageHeader,
  radio,
  section,
  select,
  shareDock,
  shortcutHint,
  skipLink,
  stack,
  switchComponent,
  tabs,
  table,
  textarea,
  toolbar,
  visuallyHidden,
  icon,
  iconButton,
  inline,
  surface
] =
  await Promise.all([
    readPackageJson(packagePath),
    readFile(mainPath, 'utf8'),
    readFile(previewPath, 'utf8'),
    readFile(storyPath, 'utf8'),
    readFile(componentPath, 'utf8'),
    readFile(buttonsStoryPath, 'utf8'),
    readFile(buttonsComponentPath, 'utf8'),
    readFile(buttonPlaygroundPath, 'utf8'),
    readFile(dataDisplayStoryPath, 'utf8'),
    readFile(dataDisplayComponentPath, 'utf8'),
    readFile(feedbackStoryPath, 'utf8'),
    readFile(feedbackComponentPath, 'utf8'),
    readFile(formsStoryPath, 'utf8'),
    readFile(formsComponentPath, 'utf8'),
    readFile(interactionStoryPath, 'utf8'),
    readFile(interactionComponentPath, 'utf8'),
    readFile(interactionProbePath, 'utf8'),
    readFile(layoutStoryPath, 'utf8'),
    readFile(layoutComponentPath, 'utf8'),
    readFile(navigationStoryPath, 'utf8'),
    readFile(navigationComponentPath, 'utf8'),
    readFile(badgePath, 'utf8'),
    readFile(breadcrumbPath, 'utf8'),
    readFile(buttonPath, 'utf8'),
    readFile(calloutPath, 'utf8'),
    readFile(checkboxPath, 'utf8'),
    readFile(confirmActionPath, 'utf8'),
    readFile(containerPath, 'utf8'),
    readFile(dialogPath, 'utf8'),
    readFile(dividerPath, 'utf8'),
    readFile(emptyStatePath, 'utf8'),
    readFile(errorTextPath, 'utf8'),
    readFile(fieldPath, 'utf8'),
    readFile(gridPath, 'utf8'),
    readFile(inputPath, 'utf8'),
    readFile(kbdPath, 'utf8'),
    readFile(keyValuePath, 'utf8'),
    readFile(labelPath, 'utf8'),
    readFile(linkPath, 'utf8'),
    readFile(pagePath, 'utf8'),
    readFile(pageHeaderPath, 'utf8'),
    readFile(radioPath, 'utf8'),
    readFile(sectionPath, 'utf8'),
    readFile(selectPath, 'utf8'),
    readFile(shareDockPath, 'utf8'),
    readFile(shortcutHintPath, 'utf8'),
    readFile(skipLinkPath, 'utf8'),
    readFile(stackPath, 'utf8'),
    readFile(switchPath, 'utf8'),
    readFile(tabsPath, 'utf8'),
    readFile(tablePath, 'utf8'),
    readFile(textareaPath, 'utf8'),
    readFile(toolbarPath, 'utf8'),
    readFile(visuallyHiddenPath, 'utf8'),
    readFile(iconPath, 'utf8'),
    readFile(iconButtonPath, 'utf8'),
    readFile(inlinePath, 'utf8'),
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

for (const dependencyName of ['@storybook/addon-a11y', '@storybook/svelte-vite', 'storybook', 'svelte', 'vite']) {
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
  "addons: ['@storybook/addon-a11y']",
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
  'viewport',
  'zdpMobile',
  'ZDP Mobile',
  '390px',
  'zdpTablet',
  'ZDP Tablet',
  '768px',
  'zdpDesktop',
  'ZDP Desktop',
  '1280px',
  'zdpWide',
  'ZDP Wide',
  '1440px',
  'a11y',
  "test: 'todo'"
]) {
  if (!preview.includes(requiredText)) {
    failures.push(`Storybook preview config is missing ${requiredText}.`);
  }
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

for (const [storyName, source, requiredTexts] of [
  [
    'Button story definition',
    buttonsStory,
    [
      "title: 'Design System/Components/Button'",
      'Buttons',
      "layout: 'fullscreen'",
      'States',
      'ButtonPlayground',
      'Playground',
      "name: 'Controls'",
      'argTypes',
      "control: 'radio'",
      "control: 'boolean'",
      "control: 'text'"
    ]
  ],
  [
    'Data display story definition',
    dataDisplayStory,
    [
      "title: 'Design System/Components/Data Display'",
      'DataDisplay',
      "layout: 'fullscreen'",
      'States'
    ]
  ],
  [
    'Feedback story definition',
    feedbackStory,
    [
      "title: 'Design System/Components/Feedback'",
      'Feedback',
      "layout: 'fullscreen'",
      'States'
    ]
  ],
  [
    'Form controls story definition',
    formsStory,
    [
      "title: 'Design System/Components/Form Controls'",
      'Forms',
      "layout: 'fullscreen'",
      'States'
    ]
  ],
  [
    'Interaction story definition',
    interactionStory,
    [
      "title: 'Design System/Components/Interaction'",
      'Interaction',
      "layout: 'fullscreen'",
      'States',
      'InteractionProbe',
      'Probe',
      "name: 'Interaction tests'",
      'play: async',
      'tabs move selected state',
      'dialog opens and closes with Escape',
      'ConfirmAction confirms after keyboard hold',
      "fireEvent.keyDown(confirmButton, { key: 'Enter' })"
    ]
  ],
  [
    'Layout story definition',
    layoutStory,
    [
      "title: 'Design System/Components/Layout'",
      'Layout',
      "layout: 'fullscreen'",
      'PageStructure'
    ]
  ],
  [
    'Navigation story definition',
    navigationStory,
    [
      "title: 'Design System/Components/Navigation'",
      'Navigation',
      "layout: 'fullscreen'",
      'States'
    ]
  ]
] as const) {
  for (const requiredText of requiredTexts) {
    if (!source.includes(requiredText)) {
      failures.push(`${storyName} is missing ${requiredText}.`);
    }
  }
}

for (const requiredText of [
  '../src/lib/components/Badge.svelte',
  '../src/lib/components/Breadcrumb.svelte',
  '../src/lib/components/Button.svelte',
  '../src/lib/components/Callout.svelte',
  '../src/lib/components/Checkbox.svelte',
  '../src/lib/components/Container.svelte',
  '../src/lib/components/Dialog.svelte',
  '../src/lib/components/Divider.svelte',
  '../src/lib/components/EmptyState.svelte',
  '../src/lib/components/ErrorText.svelte',
  '../src/lib/components/Field.svelte',
  '../src/lib/components/HelpText.svelte',
  '../src/lib/components/Icon.svelte',
  '../src/lib/components/IconButton.svelte',
  '../src/lib/components/Inline.svelte',
  '../src/lib/components/Input.svelte',
  '../src/lib/components/KeyValue.svelte',
  '../src/lib/components/Label.svelte',
  '../src/lib/components/Link.svelte',
  '../src/lib/components/Page.svelte',
  '../src/lib/components/PageHeader.svelte',
  '../src/lib/components/Radio.svelte',
  '../src/lib/components/Section.svelte',
  '../src/lib/components/Select.svelte',
  '../src/lib/components/ShareDock.svelte',
  '../src/lib/components/SkipLink.svelte',
  '../src/lib/components/Stack.svelte',
  '../src/lib/components/Surface.svelte',
  '../src/lib/components/Switch.svelte',
  '../src/lib/components/Tabs.svelte',
  '../src/lib/components/Table.svelte',
  '../src/lib/components/Textarea.svelte',
  '../src/lib/components/VisuallyHidden.svelte',
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
  '--zdp-type-page-title-size',
  '--zdp-type-page-title-compact-size',
  '--zdp-type-page-title-line-height',
  '--zdp-type-caption-size',
  '--zdp-type-data-size',
  '--zdp-control-radius',
  '--zdp-control-border-width',
  '--zdp-control-choice-size',
  '--zdp-control-switch-width',
  '--zdp-control-scrollbar-size',
  '--zdp-control-focus-outline-width',
  '--zdp-i18n-overflow-wrap',
  'line-height: var(--zdp-type-title-line-height)',
  'font-size: var(--zdp-type-page-title-size)',
  'font-size: var(--zdp-type-page-title-compact-size)',
  'line-height: var(--zdp-type-page-title-line-height)',
  'Search Design System',
  '본문으로 건너뛰기',
  'VisuallyHidden',
  'ShareDock',
  'Stack',
  'Inline',
  'Divider',
  '<Divider />',
  '출시 노트 보기',
  '업데이트 보기',
  '자세히 보기',
  'storybook-light-forms',
  'storybook-dark-forms',
  '공개 표기와 알림에 사용됩니다.',
  '이미 발급된 값은 그대로 둡니다.',
  'readonly',
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
  'storybook-light-data',
  'storybook-dark-data',
  '보안 점검 목록',
  '<th scope="col">항목</th>',
  '<th scope="row">권한 분리</th>',
  '<KeyValue columns="two">',
  '아직 공개할 변경이 없습니다.',
  '대기 중인 알림이 없습니다.',
  'storybook-light-dialog',
  'storybook-dark-dialog',
  'storybook-light-dialog-title',
  'storybook-dark-dialog-title',
  'ariaControls="storybook-light-dialog-panel"',
  'ariaControls="storybook-dark-dialog-panel"',
  'ariaExpanded={lightDialogOpen}',
  'ariaExpanded={darkDialogOpen}',
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

for (const forbiddenText of [
  'storybook-preview__grid" aria-label=',
  '<section class="preview-section" aria-labelledby=',
  '<section class="motif-strip"',
  'motif-strip" aria-label=',
  'aria-label="Status badges"',
  '<Inline as="section" gap="sm" align="center" labelledBy="storybook-',
  '<span class="motif-strip__mark" aria-hidden="true">✦</span>'
]) {
  if (component.includes(forbiddenText)) {
    failures.push(`Storybook overview must not expose decorative preview structure through ${forbiddenText}.`);
  }
}

if (!component.includes('<div class="motif-strip" aria-hidden="true">')) {
  failures.push('Storybook overview decorative motif must be hidden from assistive technology.');
}

if (!component.includes('<span class="motif-strip__mark" aria-hidden="true"></span>')) {
  failures.push('Storybook overview decorative motif mark must be hidden from assistive technology.');
}

for (const requiredText of [
  '../src/lib/components/Button.svelte',
  '../src/lib/components/ConfirmAction.svelte',
  '../src/lib/components/Icon.svelte',
  '../src/lib/components/IconButton.svelte',
  '../src/lib/components/Inline.svelte',
  '../src/lib/components/Stack.svelte',
  '../src/lib/components/Surface.svelte',
  '../src/lib/components/VisuallyHidden.svelte',
  'Button states',
  'data-zdp-theme="light"',
  'data-zdp-theme="dark"',
  'line-height: var(--zdp-type-title-line-height)',
  'let lightActionCount = 0',
  'let lightConfirmCount = 0',
  'let lightIconPressed = false',
  'let darkActionCount = 0',
  'let darkConfirmCount = 0',
  'let darkIconPressed = false',
  '기본 작업',
  '비활성 작업',
  '저장',
  'onclick={() => (lightActionCount += 1)}',
  'onclick={() => (darkActionCount += 1)}',
  'ariaControls="buttons-light-status"',
  'ariaControls="buttons-dark-status"',
  'ariaExpanded={lightActionCount > 0}',
  'ariaExpanded={darkActionCount > 0}',
  'ariaDescribedBy="buttons-light-status"',
  'ariaDescribedBy="buttons-dark-status"',
  'ariaPressed={lightIconPressed}',
  'ariaPressed={darkIconPressed}',
  'onclick={() => (lightIconPressed = !lightIconPressed)}',
  'onclick={() => (darkIconPressed = !darkIconPressed)}',
  '밀어서 결제하기',
  '밀어서 삭제하기',
  '또는 2초간 누르기',
  'onconfirm={() => (lightConfirmCount += 1)}',
  'onconfirm={() => (darkConfirmCount += 1)}',
  'id="buttons-light-status"',
  'id="buttons-dark-status"',
  'story-status',
  '새 항목 ',
  '<Icon size="sm">+</Icon>',
  '추가',
  '삭제',
  'ariaLabel="추가"',
  'disabled',
  'zdp-surface-reset'
]) {
  if (!buttonsComponent.includes(requiredText)) {
    failures.push(`Buttons story surface is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  '../src/lib/components/Button.svelte',
  '../src/lib/components/Icon.svelte',
  '../src/lib/components/Stack.svelte',
  '../src/lib/components/Surface.svelte',
  '../src/lib/components/VisuallyHidden.svelte',
  'export let variant',
  'export let size',
  'export let label',
  'export let disabled',
  'export let showIcon',
  'export let ariaKeyShortcuts',
  'Button playground',
  'Controls에서 라벨, 크기, 상태를 바꿔',
  'ariaDescribedBy="button-playground-status"',
  'onclick={() => (clickCount += 1)}',
  'button-playground__control',
  'button-playground__status',
  'zdp-surface-reset'
]) {
  if (!buttonPlayground.includes(requiredText)) {
    failures.push(`Button controls story surface is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  '../src/lib/components/Button.svelte',
  '../src/lib/components/ConfirmAction.svelte',
  '../src/lib/components/Dialog.svelte',
  '../src/lib/components/Tabs.svelte',
  'Interaction probe',
  'ariaLabel="검토 섹션"',
  "selectedId = 'overview'",
  '기록이 선택되었습니다.',
  'ariaControls="interaction-probe-dialog"',
  'ariaExpanded={dialogOpen}',
  'onClose={() => (dialogOpen = false)}',
  'durationMs={600}',
  'onconfirm={() => (confirmCount += 1)}',
  '확인 {confirmCount}회',
  'zdp-surface-reset'
]) {
  if (!interactionProbe.includes(requiredText)) {
    failures.push(`Interaction probe story surface is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  '../src/lib/components/Badge.svelte',
  '../src/lib/components/Button.svelte',
  '../src/lib/components/EmptyState.svelte',
  '../src/lib/components/Inline.svelte',
  '../src/lib/components/KeyValue.svelte',
  '../src/lib/components/Stack.svelte',
  '../src/lib/components/Surface.svelte',
  '../src/lib/components/Table.svelte',
  'Operational information',
  'data-zdp-theme="light"',
  'data-zdp-theme="dark"',
  '보안 점검',
  '보안 점검 목록',
  '<th scope="col">항목</th>',
  '<th scope="row">권한 분리</th>',
  '<KeyValue columns="two"',
  '원장 경계',
  'zdp-money-platform',
  'zdp-products-lab',
  '아직 공개할 변경이 없습니다.',
  '대기 중인 알림이 없습니다.',
  'slot="actions"',
  'zdp-surface-reset'
]) {
  if (!dataDisplayComponent.includes(requiredText)) {
    failures.push(`Data display story surface is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  '../src/lib/components/Badge.svelte',
  '../src/lib/components/Callout.svelte',
  '../src/lib/components/Divider.svelte',
  '../src/lib/components/Inline.svelte',
  '../src/lib/components/Stack.svelte',
  '../src/lib/components/Surface.svelte',
  'Status and surfaces',
  'data-zdp-theme="light"',
  'data-zdp-theme="dark"',
  'line-height: var(--zdp-type-title-line-height)',
  '검토 중',
  '정상',
  '대기',
  '주의',
  '다음 단계가 준비됐습니다.',
  '삭제 전에 다시 확인하세요.',
  '작업 흐름이 준비됐습니다.',
  '위험 작업 전에 다시 확인하세요.',
  '<Divider />',
  'surface-pair',
  'Parchment',
  'Banner',
  'zdp-surface-reset'
]) {
  if (!feedbackComponent.includes(requiredText)) {
    failures.push(`Feedback story surface is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  '../src/lib/components/Checkbox.svelte',
  '../src/lib/components/ErrorText.svelte',
  '../src/lib/components/Field.svelte',
  '../src/lib/components/HelpText.svelte',
  '../src/lib/components/Input.svelte',
  '../src/lib/components/Label.svelte',
  '../src/lib/components/Radio.svelte',
  '../src/lib/components/Select.svelte',
  '../src/lib/components/Stack.svelte',
  '../src/lib/components/Surface.svelte',
  '../src/lib/components/Switch.svelte',
  '../src/lib/components/Textarea.svelte',
  'Control states',
  'data-zdp-theme="light"',
  'data-zdp-theme="dark"',
  'line-height: var(--zdp-type-title-line-height)',
  'forms-light-id',
  'forms-dark-id',
  'forms-light-email',
  'forms-dark-email',
  'readonly',
  'disabled',
  '이미 발급된 값은 그대로 둡니다.',
  "describedBy={['forms-light-status-help', 'forms-light-status-error']}",
  "describedBy={['forms-dark-status-help', 'forms-dark-status-error']}",
  'errorMessageId="forms-light-status-error"',
  'errorMessageId="forms-dark-status-error"',
  '현재 작업 상태를 선택하세요.',
  '다음 단계 전에 기준을 확인하세요.',
  '초대 기능이 열리면 수정할 수 있습니다.',
  '업데이트 받기',
  '알림 주기',
  '자동 저장',
  'role="radiogroup"',
  'zdp-surface-reset'
]) {
  if (!formsComponent.includes(requiredText)) {
    failures.push(`Forms story surface is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  '../src/lib/components/Button.svelte',
  '../src/lib/components/Container.svelte',
  '../src/lib/components/Grid.svelte',
  '../src/lib/components/Inline.svelte',
  '../src/lib/components/Page.svelte',
  '../src/lib/components/PageHeader.svelte',
  '../src/lib/components/Section.svelte',
  '../src/lib/components/Stack.svelte',
  '../src/lib/components/Surface.svelte',
  '../src/lib/components/Toolbar.svelte',
  '화면의 첫 장면',
  '작업을 모으는 폭',
  '읽기 좋은 본문 폭',
  '검토 흐름 정리',
  '<Page as="div" tone="canvas" labelledBy="layout-story-title">',
  '<Section spacing="xl">',
  '<Container size="lg" padding="lg">',
  '<PageHeader labelledBy="layout-story-title" align="center">',
  '<svelte:fragment slot="actions">',
  '<Grid columns="two" gap="md" labelledBy="layout-panel-title">',
  '<Toolbar labelledBy="layout-toolbar-title">',
  'zdp-surface-reset'
]) {
  if (!layoutComponent.includes(requiredText)) {
    failures.push(`Layout story surface is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'Layout story surface', layoutComponent);
assertNoOverRoundedUsage(failures, 'Layout story surface', layoutComponent);

for (const requiredText of [
  '../src/lib/components/Button.svelte',
  '../src/lib/components/Dialog.svelte',
  '../src/lib/components/Divider.svelte',
  '../src/lib/components/Inline.svelte',
  '../src/lib/components/Kbd.svelte',
  '../src/lib/components/ShareDock.svelte',
  '../src/lib/components/ShortcutHint.svelte',
  '../src/lib/components/Stack.svelte',
  '../src/lib/components/Surface.svelte',
  '../src/lib/components/Tabs.svelte',
  '../src/lib/share.ts',
  'Interaction states',
  'id="interaction-main"',
  'tabindex="-1"',
  'data-zdp-theme="light"',
  'data-zdp-theme="dark"',
  'line-height: var(--zdp-type-title-line-height)',
  'Tabs',
  'Shortcut hints',
  'Kbd',
  'ShortcutHint',
  'keydown 처리는 각 화면에 남깁니다',
  'Light shortcut hints',
  'Dark shortcut hints',
  'role="group" aria-label="Light shortcut hints"',
  'role="group" aria-label="Dark shortcut hints"',
  'Search',
  'Shortcuts',
  'Go to file',
  'Select',
  'Close',
  "keys={['/']}",
  "keys={['Shift', '?']}",
  'label="T"',
  'label="Enter"',
  'label="Esc"',
  'Dialog',
  'Light interaction sections',
  'Dark interaction sections',
  'idPrefix="interaction-light-tabs"',
  'idPrefix="interaction-dark-tabs"',
  'selectedId="overview"',
  'let:selectedId',
  'disabled: true',
  '<Divider />',
  'lightDialogOpen',
  'darkDialogOpen',
  'ariaControls="interaction-light-dialog"',
  'ariaControls="interaction-dark-dialog"',
  'ariaExpanded={lightDialogOpen}',
  'ariaExpanded={darkDialogOpen}',
  'onClose={() => (lightDialogOpen = false)}',
  'onClose={() => (darkDialogOpen = false)}',
  '검토 열기',
  '변경 내용을 저장할까요?',
  '삭제 전에 확인하세요.',
  '<Button variant="primary" onclick={() => (lightDialogOpen = false)}>저장</Button>',
  '<Button variant="danger" onclick={() => (darkDialogOpen = false)}>삭제</Button>',
  '<ShareDock placement="inline"',
  'Light share actions',
  'Dark share actions',
  '링크 복사',
  '기기 공유',
  '텔레그램',
  '라인',
  '왓츠앱',
  '레딧',
  'zdp-surface-reset'
]) {
  if (!interactionComponent.includes(requiredText)) {
    failures.push(`Interaction story surface is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  '../src/lib/components/Breadcrumb.svelte',
  '../src/lib/components/Inline.svelte',
  '../src/lib/components/Link.svelte',
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

for (const source of [badge, callout]) {
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

assertNoDecorativeEffects(failures, 'Kbd component', kbd);
assertNoDecorativeEffects(failures, 'ShortcutHint component', shortcutHint);
assertNoOverRoundedUsage(failures, 'Kbd component', kbd);
assertNoOverRoundedUsage(failures, 'ShortcutHint component', shortcutHint);

for (const requiredText of [
  '.zdp-skip-link',
  '.zdp-skip-link:focus-visible',
  'href =',
  'position: fixed',
  'pointer-events: none',
  'pointer-events: auto',
  'background: var(--zdp-color-focus-surface)',
  'border: var(--zdp-control-border-width) solid var(--zdp-color-focus-line)',
  'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
  'text-decoration-line: none'
]) {
  if (!skipLink.includes(requiredText)) {
    failures.push(`SkipLink component is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'SkipLink component', skipLink);
assertNoOverRoundedUsage(failures, 'SkipLink component', skipLink);

for (const requiredText of [
  '.zdp-visually-hidden',
  'clip: rect(0 0 0 0)',
  'clip-path: inset(50%)',
  'height: 1px',
  'position: absolute',
  'white-space: nowrap',
  'width: 1px'
]) {
  if (!visuallyHidden.includes(requiredText)) {
    failures.push(`VisuallyHidden component is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'VisuallyHidden component', visuallyHidden);
assertNoOverRoundedUsage(failures, 'VisuallyHidden component', visuallyHidden);

for (const requiredText of [
  '.zdp-page',
  'as:',
  'tone:',
  'aria-labelledby={labelledBy ?? undefined}',
  'zdp-surface-reset',
  'display: grid',
  'min-block-size: 100%',
  '.zdp-page--canvas',
  '.zdp-page--panel'
]) {
  if (!page.includes(requiredText)) {
    failures.push(`Page component is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'Page component', page);
assertNoOverRoundedUsage(failures, 'Page component', page);

for (const requiredText of [
  '.zdp-container',
  'as:',
  'size:',
  'padding:',
  'aria-labelledby={labelledBy ?? undefined}',
  'inline-size: 100%',
  'margin-inline: auto',
  '.zdp-container--sm',
  '.zdp-container--md',
  '.zdp-container--lg',
  '.zdp-container--xl',
  '.zdp-container--full',
  '.zdp-container--padding-lg'
]) {
  if (!container.includes(requiredText)) {
    failures.push(`Container component is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'Container component', container);
assertNoOverRoundedUsage(failures, 'Container component', container);

for (const requiredText of [
  '.zdp-section',
  'as:',
  'spacing:',
  'tone:',
  'aria-labelledby={labelledBy ?? undefined}',
  '.zdp-section--spacing-lg',
  '.zdp-section--spacing-xl',
  '.zdp-section--plain',
  '.zdp-section--panel',
  '.zdp-section--raised',
  'border-block: 1px solid var(--zdp-color-line-subtle)'
]) {
  if (!section.includes(requiredText)) {
    failures.push(`Section component is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'Section component', section);
assertNoOverRoundedUsage(failures, 'Section component', section);

for (const requiredText of [
  '.zdp-page-header',
  'as:',
  'align:',
  'labelledHeaderRole',
  'role={labelledHeaderRole}',
  'aria-labelledby={labelledBy ?? undefined}',
  'slot name="eyebrow"',
  'class="zdp-page-header__title"',
  'slot name="summary"',
  'class="zdp-page-header__actions"',
  'grid-template-columns: minmax(0, 1fr) auto',
  'flex-wrap: wrap',
  '@media (max-width: 48rem)'
]) {
  if (!pageHeader.includes(requiredText)) {
    failures.push(`PageHeader component is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'PageHeader component', pageHeader);
assertNoOverRoundedUsage(failures, 'PageHeader component', pageHeader);

for (const requiredText of [
  '.zdp-stack',
  'as:',
  'gap:',
  'align:',
  'aria-labelledby={labelledBy ?? undefined}',
  'display: grid',
  'gap: var(--zdp-space-4)',
  'min-width: 0',
  '.zdp-stack--gap-md',
  '.zdp-stack--align-start'
]) {
  if (!stack.includes(requiredText)) {
    failures.push(`Stack component is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'Stack component', stack);
assertNoOverRoundedUsage(failures, 'Stack component', stack);

for (const requiredText of [
  '.zdp-inline',
  'as:',
  'gap:',
  'align:',
  'justify:',
  "as === 'div' && labelledBy ? 'group' : undefined",
  'role={labelledGroupRole}',
  'aria-labelledby={labelledBy ?? undefined}',
  'display: flex',
  'flex-wrap: wrap',
  'gap: var(--zdp-space-3)',
  'min-width: 0',
  '.zdp-inline--gap-sm',
  '.zdp-inline--align-center',
  '.zdp-inline--justify-start'
]) {
  if (!inline.includes(requiredText)) {
    failures.push(`Inline component is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'Inline component', inline);
assertNoOverRoundedUsage(failures, 'Inline component', inline);

for (const requiredText of [
  '.zdp-grid',
  'as:',
  'columns:',
  'gap:',
  'aria-labelledby={labelledBy ?? undefined}',
  'display: grid',
  'grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr))',
  '.zdp-grid--columns-two',
  '.zdp-grid--columns-four',
  '.zdp-grid--columns-auto',
  '.zdp-grid--gap-md',
  '@media (max-width: 64rem)',
  '@media (max-width: 42rem)'
]) {
  if (!grid.includes(requiredText)) {
    failures.push(`Grid component is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'Grid component', grid);
assertNoOverRoundedUsage(failures, 'Grid component', grid);

for (const requiredText of [
  '.zdp-toolbar',
  'as:',
  'gap:',
  'align:',
  'aria-labelledby={labelledBy ?? undefined}',
  'class="zdp-toolbar__main"',
  'slot name="actions"',
  'class="zdp-toolbar__actions"',
  'display: flex',
  'flex-wrap: wrap',
  'justify-content: space-between',
  '.zdp-toolbar--gap-md',
  '.zdp-toolbar--align-center',
  '.zdp-toolbar__main',
  '.zdp-toolbar__actions',
  '@media (max-width: 42rem)'
]) {
  if (!toolbar.includes(requiredText)) {
    failures.push(`Toolbar component is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'Toolbar component', toolbar);
assertNoOverRoundedUsage(failures, 'Toolbar component', toolbar);

for (const requiredText of [
  '.zdp-divider',
  'orientation:',
  'tone:',
  'decorative = true',
  "role={decorative ? 'presentation' : 'separator'}",
  'aria-orientation={decorative ? undefined : orientation}',
  '.zdp-divider--horizontal',
  '.zdp-divider--vertical',
  '.zdp-divider--subtle',
  '.zdp-divider--strong',
  'border-block-start: 1px solid var(--zdp-color-line-subtle)',
  'border-inline-start: 1px solid var(--zdp-color-line-subtle)'
]) {
  if (!divider.includes(requiredText)) {
    failures.push(`Divider component is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'Divider component', divider);
assertNoOverRoundedUsage(failures, 'Divider component', divider);

for (const requiredText of [
  '.zdp-table-wrap',
  'caption:',
  'captionMode:',
  'density:',
  'aria-labelledby={labelledBy ?? undefined}',
  '<caption class={`zdp-table__caption zdp-table__caption--${captionMode}`}>',
  '.zdp-table :global(th)',
  '.zdp-table :global(td)',
  '.zdp-table :global(thead th)',
  'overflow-x: auto'
]) {
  if (!table.includes(requiredText)) {
    failures.push(`Table component is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'Table component', table);
assertNoOverRoundedUsage(failures, 'Table component', table);

for (const requiredText of [
  '.zdp-key-value',
  'columns:',
  'density:',
  'aria-labelledby={labelledBy ?? undefined}',
  '.zdp-key-value :global(dt)',
  '.zdp-key-value :global(dd)',
  'grid-template-columns: minmax(10rem, 0.42fr) minmax(0, 1fr)',
  '@media (max-width: 42rem)',
  'overflow-wrap: var(--zdp-i18n-overflow-wrap)'
]) {
  if (!keyValue.includes(requiredText)) {
    failures.push(`KeyValue component is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'KeyValue component', keyValue);
assertNoOverRoundedUsage(failures, 'KeyValue component', keyValue);

for (const requiredText of [
  '.zdp-empty-state',
  'align:',
  'tone:',
  'aria-labelledby={labelledBy ?? undefined}',
  'class="zdp-empty-state__body"',
  'slot name="actions"',
  '.zdp-empty-state__actions',
  'flex-wrap: wrap',
  'text-align: center'
]) {
  if (!emptyState.includes(requiredText)) {
    failures.push(`EmptyState component is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'EmptyState component', emptyState);
assertNoOverRoundedUsage(failures, 'EmptyState component', emptyState);

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
  'export let size: \'sm\' | \'md\' = \'md\'',
  'export let label: string | null = null',
  'role={label ? \'img\' : undefined}',
  'aria-hidden={label ? undefined : \'true\'}',
  '.zdp-icon--sm',
  '.zdp-icon--md',
  'font-size: var(--zdp-control-glyph-md)',
  'align-items: center',
  'justify-content: center',
  'line-height: 1',
  'text-align: center'
]) {
  if (!icon.includes(requiredText)) {
  failures.push(`Icon component is missing centered glyph contract ${requiredText}.`);
  }
}

for (const requiredText of [
  'zdpShareIcons',
  'ZdpShareDockItem',
  "placement: 'side' | 'rail' | 'bottom' | 'inline' = 'side'",
  'class={`zdp-share-dock zdp-share-dock--${placement}`}',
  'class="zdp-share-dock__list"',
  'class="zdp-share-action"',
  'class="zdp-share-action__mark"',
  'class={`zdp-share-icon zdp-share-icon--${item.icon}`}',
  'class="zdp-share-action__tooltip"',
  'aria-label={item.ariaLabel ?? item.label}',
  'data-share-id={item.id}',
  '.zdp-share-dock--side',
  '.zdp-share-dock--rail',
  '.zdp-share-dock--bottom',
  '.zdp-share-dock--inline',
  '.zdp-share-action:hover:not(:disabled)',
  '.zdp-share-action:focus-visible',
  'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
  'max-inline-size: calc(100vw - var(--zdp-space-6))'
]) {
  if (!shareDock.includes(requiredText)) {
    failures.push(`ShareDock component is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'ShareDock component', shareDock);
assertNoOverRoundedUsage(failures, 'ShareDock component', shareDock);

for (const requiredText of [
  'export let tone: \'primary\' | \'danger\' = \'primary\'',
  'export let label = \'밀어서 확인\'',
  'export let hint = \'밀거나 2초간 누르기\'',
  'export let completeLabel = \'확인됨\'',
  'export let onconfirm: (() => void) | null = null',
  'onpointerdown={handlePointerDown}',
  'onpointermove={handlePointerMove}',
  'onkeydown={handleKeydown}',
  'class="zdp-confirm-action__glyph"',
  'stroke-width: 2.25',
  '--zdp-confirm-action-progress: 0',
  'width: calc(var(--zdp-confirm-action-progress) * 100%)',
  'touch-action: none',
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
  'ariaControls: string | null = null',
  'ariaDescribedBy: string | null = null',
  'ariaExpanded: boolean | null = null',
  'ariaPressed: boolean | null = null',
  'ariaKeyShortcuts: string | null = null',
  'aria-controls={ariaControls ?? undefined}',
  'aria-describedby={ariaDescribedBy ?? undefined}',
  'aria-expanded={ariaExpanded ?? undefined}',
  'aria-pressed={ariaPressed ?? undefined}',
  'aria-keyshortcuts={ariaKeyShortcuts ?? undefined}',
  'onclick={onclick ?? undefined}',
  'font-family: var(--zdp-font-family-sans)',
  'font-weight: var(--zdp-font-weight-regular)',
  'border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong)',
  'border-color: var(--zdp-color-line-subtle)',
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
  "requiredLabel = '필수'",
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
    'onchange={handleChange}',
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
  failures.push('Radio component must express invalid state on the wrapper, not the native radio input.');
}

for (const requiredText of [
  'role="switch"',
  'class="zdp-switch__input"',
  'class="zdp-switch__track"',
  'class="zdp-switch__body"',
  'class="zdp-switch__label"',
  'grid-template-columns: var(--zdp-control-switch-width) minmax(0, 1fr)',
  'height: var(--zdp-control-switch-height)',
  'width: var(--zdp-control-switch-width)',
  'aria-describedby={describedBy ?? undefined}',
  'onchange={handleChange}',
  '.zdp-switch:hover .zdp-switch__input:not(:checked):not(:disabled) + .zdp-switch__track',
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
  'export let idPrefix: string | null = null',
  'fallbackIdPrefix',
  'resolvedIdPrefix',
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
  'display: inline-flex',
  'align-items: center',
  'justify-content: center',
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
  'id={id ?? undefined}',
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
  'onclick: ((event: MouseEvent) => void) | null = null',
  'ariaControls: string | null = null',
  'ariaDescribedBy: string | null = null',
  'ariaExpanded: boolean | null = null',
  'ariaPressed: boolean | null = null',
  'ariaKeyShortcuts: string | null = null',
  'aria-controls={ariaControls ?? undefined}',
  'aria-describedby={ariaDescribedBy ?? undefined}',
  'aria-expanded={ariaExpanded ?? undefined}',
  'aria-pressed={ariaPressed ?? undefined}',
  'aria-keyshortcuts={ariaKeyShortcuts ?? undefined}',
  'onclick={onclick ?? undefined}',
  '.zdp-icon-button--solid:active:not(:disabled)',
  '.zdp-icon-button--solid:hover:not(:disabled)',
  '.zdp-icon-button--ghost:hover:not(:disabled)',
  'border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong)',
  'border-color: var(--zdp-color-line-subtle)',
  'font-family: var(--zdp-font-family-sans)',
  'font-weight: var(--zdp-font-weight-regular)',
  'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
  'border-color: var(--zdp-color-focus-line)',
  'zdp-icon zdp-icon--${size} zdp-icon-button__glyph',
  'font-size: var(--zdp-control-glyph-md)',
  'text-align: center',
  'align-items: center',
  'justify-content: center',
  'line-height: 1'
]) {
  if (!iconButton.includes(requiredText)) {
    failures.push(`IconButton component is missing centered glyph style ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'Button component', button);
assertNoDecorativeEffects(failures, 'Icon component', icon);
assertNoDecorativeEffects(failures, 'IconButton component', iconButton);
assertNoDecorativeEffects(failures, 'Surface component', surface);
assertNoDecorativeEffects(failures, 'Storybook overview', component);
assertNoDecorativeEffects(failures, 'Buttons story', buttonsComponent);
assertNoDecorativeEffects(failures, 'Button controls story', buttonPlayground);
assertNoDecorativeEffects(failures, 'Data display story', dataDisplayComponent);
assertNoDecorativeEffects(failures, 'Feedback story', feedbackComponent);
assertNoDecorativeEffects(failures, 'Forms story', formsComponent);
assertNoDecorativeEffects(failures, 'Interaction story', interactionComponent);
assertNoDecorativeEffects(failures, 'Interaction probe story', interactionProbe);
assertNoDecorativeEffects(failures, 'Navigation story', navigationComponent);
assertNoOverRoundedUsage(failures, 'Button component', button);
assertNoOverRoundedUsage(failures, 'Icon component', icon);
assertNoOverRoundedUsage(failures, 'IconButton component', iconButton);
assertNoOverRoundedUsage(failures, 'Surface component', surface);
assertNoOverRoundedUsage(failures, 'Storybook overview', component);
assertNoOverRoundedUsage(failures, 'Buttons story', buttonsComponent);
assertNoOverRoundedUsage(failures, 'Button controls story', buttonPlayground);
assertNoOverRoundedUsage(failures, 'Data display story', dataDisplayComponent);
assertNoOverRoundedUsage(failures, 'Feedback story', feedbackComponent);
assertNoOverRoundedUsage(failures, 'Forms story', formsComponent);
assertNoOverRoundedUsage(failures, 'Interaction story', interactionComponent);
assertNoOverRoundedUsage(failures, 'Interaction probe story', interactionProbe);
assertNoOverRoundedUsage(failures, 'Navigation story', navigationComponent);

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

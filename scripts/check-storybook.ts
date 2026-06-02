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
const feedbackStoryPath = join(root, 'stories', 'Feedback.stories.ts');
const feedbackComponentPath = join(root, 'stories', 'Feedback.svelte');
const formsStoryPath = join(root, 'stories', 'Forms.stories.ts');
const formsComponentPath = join(root, 'stories', 'Forms.svelte');
const interactionStoryPath = join(root, 'stories', 'Interaction.stories.ts');
const interactionComponentPath = join(root, 'stories', 'Interaction.svelte');
const navigationStoryPath = join(root, 'stories', 'Navigation.stories.ts');
const navigationComponentPath = join(root, 'stories', 'Navigation.svelte');
const badgePath = join(root, 'src', 'lib', 'components', 'Badge.svelte');
const breadcrumbPath = join(root, 'src', 'lib', 'components', 'Breadcrumb.svelte');
const buttonPath = join(root, 'src', 'lib', 'components', 'Button.svelte');
const calloutPath = join(root, 'src', 'lib', 'components', 'Callout.svelte');
const checkboxPath = join(root, 'src', 'lib', 'components', 'Checkbox.svelte');
const dialogPath = join(root, 'src', 'lib', 'components', 'Dialog.svelte');
const dividerPath = join(root, 'src', 'lib', 'components', 'Divider.svelte');
const fieldPath = join(root, 'src', 'lib', 'components', 'Field.svelte');
const inputPath = join(root, 'src', 'lib', 'components', 'Input.svelte');
const labelPath = join(root, 'src', 'lib', 'components', 'Label.svelte');
const linkPath = join(root, 'src', 'lib', 'components', 'Link.svelte');
const radioPath = join(root, 'src', 'lib', 'components', 'Radio.svelte');
const selectPath = join(root, 'src', 'lib', 'components', 'Select.svelte');
const skipLinkPath = join(root, 'src', 'lib', 'components', 'SkipLink.svelte');
const stackPath = join(root, 'src', 'lib', 'components', 'Stack.svelte');
const switchPath = join(root, 'src', 'lib', 'components', 'Switch.svelte');
const tabsPath = join(root, 'src', 'lib', 'components', 'Tabs.svelte');
const textareaPath = join(root, 'src', 'lib', 'components', 'Textarea.svelte');
const visuallyHiddenPath = join(root, 'src', 'lib', 'components', 'VisuallyHidden.svelte');
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
  feedbackStory,
  feedbackComponent,
  formsStory,
  formsComponent,
  interactionStory,
  interactionComponent,
  navigationStory,
  navigationComponent,
  badge,
  breadcrumb,
  button,
  callout,
  checkbox,
  dialog,
  divider,
  field,
  input,
  label,
  link,
  radio,
  select,
  skipLink,
  stack,
  switchComponent,
  tabs,
  textarea,
  visuallyHidden,
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
    readFile(feedbackStoryPath, 'utf8'),
    readFile(feedbackComponentPath, 'utf8'),
    readFile(formsStoryPath, 'utf8'),
    readFile(formsComponentPath, 'utf8'),
    readFile(interactionStoryPath, 'utf8'),
    readFile(interactionComponentPath, 'utf8'),
    readFile(navigationStoryPath, 'utf8'),
    readFile(navigationComponentPath, 'utf8'),
    readFile(badgePath, 'utf8'),
    readFile(breadcrumbPath, 'utf8'),
    readFile(buttonPath, 'utf8'),
    readFile(calloutPath, 'utf8'),
    readFile(checkboxPath, 'utf8'),
    readFile(dialogPath, 'utf8'),
    readFile(dividerPath, 'utf8'),
    readFile(fieldPath, 'utf8'),
    readFile(inputPath, 'utf8'),
    readFile(labelPath, 'utf8'),
    readFile(linkPath, 'utf8'),
    readFile(radioPath, 'utf8'),
    readFile(selectPath, 'utf8'),
    readFile(skipLinkPath, 'utf8'),
    readFile(stackPath, 'utf8'),
    readFile(switchPath, 'utf8'),
    readFile(tabsPath, 'utf8'),
    readFile(textareaPath, 'utf8'),
    readFile(visuallyHiddenPath, 'utf8'),
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

for (const [storyName, source, requiredTexts] of [
  [
    'Button story definition',
    buttonsStory,
    [
      "title: 'Design System/Components/Button'",
      'Buttons',
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
      'States'
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
  '../src/lib/components/Dialog.svelte',
  '../src/lib/components/Divider.svelte',
  '../src/lib/components/ErrorText.svelte',
  '../src/lib/components/Field.svelte',
  '../src/lib/components/HelpText.svelte',
  '../src/lib/components/IconButton.svelte',
  '../src/lib/components/Inline.svelte',
  '../src/lib/components/Input.svelte',
  '../src/lib/components/Label.svelte',
  '../src/lib/components/Link.svelte',
  '../src/lib/components/Radio.svelte',
  '../src/lib/components/Select.svelte',
  '../src/lib/components/SkipLink.svelte',
  '../src/lib/components/Stack.svelte',
  '../src/lib/components/Surface.svelte',
  '../src/lib/components/Switch.svelte',
  '../src/lib/components/Tabs.svelte',
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
  '--zdp-type-caption-size',
  '--zdp-type-data-size',
  '--zdp-control-radius',
  '--zdp-control-border-width',
  '--zdp-control-focus-outline-width',
  '--zdp-i18n-overflow-wrap',
  'line-height: var(--zdp-type-title-line-height)',
  'Search Design System',
  '본문으로 건너뛰기',
  'VisuallyHidden',
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

for (const requiredText of [
  '../src/lib/components/Button.svelte',
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
  'let lightIconPressed = false',
  'let darkActionCount = 0',
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
  'id="buttons-light-status"',
  'id="buttons-dark-status"',
  'story-status',
  '작업 ',
  '취소',
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
  'readonly',
  '이미 발급된 값은 그대로 둡니다.',
  '다음 단계 전에 기준을 확인하세요.',
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
  '../src/lib/components/Dialog.svelte',
  '../src/lib/components/Divider.svelte',
  '../src/lib/components/Inline.svelte',
  '../src/lib/components/Stack.svelte',
  '../src/lib/components/Surface.svelte',
  '../src/lib/components/Tabs.svelte',
  'Interaction states',
  'id="interaction-main"',
  'tabindex="-1"',
  'data-zdp-theme="light"',
  'data-zdp-theme="dark"',
  'line-height: var(--zdp-type-title-line-height)',
  'Tabs',
  'Dialog',
  'Light interaction sections',
  'Dark interaction sections',
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
  '.zdp-link',
  '.zdp-link--primary',
  '.zdp-link--muted',
  'href: string',
  'aria-current={resolvedAriaCurrent}',
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
  'onclick: ((event: MouseEvent) => void) | null = null',
  'ariaControls: string | null = null',
  'ariaDescribedBy: string | null = null',
  'ariaExpanded: boolean | null = null',
  'ariaPressed: boolean | null = null',
  'aria-controls={ariaControls ?? undefined}',
  'aria-describedby={ariaDescribedBy ?? undefined}',
  'aria-expanded={ariaExpanded ?? undefined}',
  'aria-pressed={ariaPressed ?? undefined}',
  'onclick={onclick ?? undefined}',
  'font-family: var(--zdp-font-family-sans)',
  'font-weight: var(--zdp-font-weight-regular)',
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
  'aria-controls={ariaControls ?? undefined}',
  'aria-describedby={ariaDescribedBy ?? undefined}',
  'aria-expanded={ariaExpanded ?? undefined}',
  'aria-pressed={ariaPressed ?? undefined}',
  'onclick={onclick ?? undefined}',
  '.zdp-icon-button--solid:active:not(:disabled)',
  '.zdp-icon-button--solid:hover:not(:disabled)',
  '.zdp-icon-button--ghost:hover:not(:disabled)',
  'border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong)',
  'font-family: var(--zdp-font-family-sans)',
  'font-weight: var(--zdp-font-weight-regular)',
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
assertNoDecorativeEffects(failures, 'Buttons story', buttonsComponent);
assertNoDecorativeEffects(failures, 'Feedback story', feedbackComponent);
assertNoDecorativeEffects(failures, 'Forms story', formsComponent);
assertNoDecorativeEffects(failures, 'Interaction story', interactionComponent);
assertNoDecorativeEffects(failures, 'Navigation story', navigationComponent);
assertNoOverRoundedUsage(failures, 'Button component', button);
assertNoOverRoundedUsage(failures, 'IconButton component', iconButton);
assertNoOverRoundedUsage(failures, 'Surface component', surface);
assertNoOverRoundedUsage(failures, 'Storybook overview', component);
assertNoOverRoundedUsage(failures, 'Buttons story', buttonsComponent);
assertNoOverRoundedUsage(failures, 'Feedback story', feedbackComponent);
assertNoOverRoundedUsage(failures, 'Forms story', formsComponent);
assertNoOverRoundedUsage(failures, 'Interaction story', interactionComponent);
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

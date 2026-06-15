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
const previewStylePath = join(root, '.storybook', 'preview.css');
const brandFontStylePath = join(root, 'src', 'styles', 'brand-fonts.css');
const expressiveFontStylePath = join(root, 'src', 'styles', 'expressive-fonts.css');
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
const themeLocaleStressStoryPath = join(root, 'stories', 'ThemeLocaleStress.stories.ts');
const themeLocaleStressComponentPath = join(root, 'stories', 'ThemeLocaleStress.svelte');
const accordionPath = join(root, 'src', 'lib', 'components', 'Accordion.svelte');
const avatarPath = join(root, 'src', 'lib', 'components', 'Avatar.svelte');
const badgePath = join(root, 'src', 'lib', 'components', 'Badge.svelte');
const breadcrumbPath = join(root, 'src', 'lib', 'components', 'Breadcrumb.svelte');
const buttonPath = join(root, 'src', 'lib', 'components', 'Button.svelte');
const calloutPath = join(root, 'src', 'lib', 'components', 'Callout.svelte');
const checkboxPath = join(root, 'src', 'lib', 'components', 'Checkbox.svelte');
const codeBlockPath = join(root, 'src', 'lib', 'components', 'CodeBlock.svelte');
const comboboxPath = join(root, 'src', 'lib', 'components', 'Combobox.svelte');
const commandFieldPath = join(root, 'src', 'lib', 'components', 'CommandField.svelte');
const confirmActionPath = join(root, 'src', 'lib', 'components', 'ConfirmAction.svelte');
const containerPath = join(root, 'src', 'lib', 'components', 'Container.svelte');
const dialogPath = join(root, 'src', 'lib', 'components', 'Dialog.svelte');
const disclosurePath = join(root, 'src', 'lib', 'components', 'Disclosure.svelte');
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
const localeSwitcherPath = join(root, 'src', 'lib', 'components', 'LocaleSwitcher.svelte');
const menuPath = join(root, 'src', 'lib', 'components', 'Menu.svelte');
const pagePath = join(root, 'src', 'lib', 'components', 'Page.svelte');
const pageHeaderPath = join(root, 'src', 'lib', 'components', 'PageHeader.svelte');
const paginationPath = join(root, 'src', 'lib', 'components', 'Pagination.svelte');
const popoverPath = join(root, 'src', 'lib', 'components', 'Popover.svelte');
const progressPath = join(root, 'src', 'lib', 'components', 'Progress.svelte');
const radioPath = join(root, 'src', 'lib', 'components', 'Radio.svelte');
const sectionPath = join(root, 'src', 'lib', 'components', 'Section.svelte');
const selectPath = join(root, 'src', 'lib', 'components', 'Select.svelte');
const segmentedControlPath = join(root, 'src', 'lib', 'components', 'SegmentedControl.svelte');
const shareDockPath = join(root, 'src', 'lib', 'components', 'ShareDock.svelte');
const sheetPath = join(root, 'src', 'lib', 'components', 'Sheet.svelte');
const shortcutHintPath = join(root, 'src', 'lib', 'components', 'ShortcutHint.svelte');
const skeletonPath = join(root, 'src', 'lib', 'components', 'Skeleton.svelte');
const skipLinkPath = join(root, 'src', 'lib', 'components', 'SkipLink.svelte');
const sortHeaderPath = join(root, 'src', 'lib', 'components', 'SortHeader.svelte');
const stackPath = join(root, 'src', 'lib', 'components', 'Stack.svelte');
const statusToastPath = join(root, 'src', 'lib', 'components', 'StatusToast.svelte');
const spinnerPath = join(root, 'src', 'lib', 'components', 'Spinner.svelte');
const switchPath = join(root, 'src', 'lib', 'components', 'Switch.svelte');
const tabsPath = join(root, 'src', 'lib', 'components', 'Tabs.svelte');
const tablePath = join(root, 'src', 'lib', 'components', 'Table.svelte');
const tableToolbarPath = join(root, 'src', 'lib', 'components', 'TableToolbar.svelte');
const termSheetPath = join(root, 'src', 'lib', 'components', 'TermSheet.svelte');
const termTriggerPath = join(root, 'src', 'lib', 'components', 'TermTrigger.svelte');
const textareaPath = join(root, 'src', 'lib', 'components', 'Textarea.svelte');
const textScaleControlPath = join(root, 'src', 'lib', 'components', 'TextScaleControl.svelte');
const themeTogglePath = join(root, 'src', 'lib', 'components', 'ThemeToggle.svelte');
const tooltipPath = join(root, 'src', 'lib', 'components', 'Tooltip.svelte');
const toastPath = join(root, 'src', 'lib', 'components', 'Toast.svelte');
const toolbarPath = join(root, 'src', 'lib', 'components', 'Toolbar.svelte');
const visuallyHiddenPath = join(root, 'src', 'lib', 'components', 'VisuallyHidden.svelte');
const iconPath = join(root, 'src', 'lib', 'components', 'Icon.svelte');
const iconButtonPath = join(root, 'src', 'lib', 'components', 'IconButton.svelte');
const inlinePath = join(root, 'src', 'lib', 'components', 'Inline.svelte');
const inlineCodePath = join(root, 'src', 'lib', 'components', 'InlineCode.svelte');
const identityChipPath = join(root, 'src', 'lib', 'components', 'IdentityChip.svelte');
const surfacePath = join(root, 'src', 'lib', 'components', 'Surface.svelte');
const shortcutsPath = join(root, 'src', 'lib', 'shortcuts.ts');
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
  themeLocaleStressStory,
  themeLocaleStressComponent,
  accordion,
  avatar,
  badge,
  breadcrumb,
  button,
  callout,
  checkbox,
  codeBlock,
  combobox,
  commandField,
  confirmAction,
  container,
  dialog,
  disclosure,
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
  localeSwitcher,
  menu,
  page,
  pageHeader,
  pagination,
  popover,
  progress,
  radio,
  section,
  select,
  segmentedControl,
  shareDock,
  sheet,
  shortcutHint,
  shortcuts,
  skeleton,
  tooltip,
  skipLink,
  sortHeader,
  stack,
  statusToast,
  spinner,
  switchComponent,
  tabs,
  table,
  tableToolbar,
  termSheet,
  termTrigger,
  textarea,
  textScaleControl,
  themeToggle,
  toast,
  toolbar,
  visuallyHidden,
  icon,
  iconButton,
  inline,
  inlineCode,
  identityChip,
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
    readFile(themeLocaleStressStoryPath, 'utf8'),
    readFile(themeLocaleStressComponentPath, 'utf8'),
    readFile(accordionPath, 'utf8'),
    readFile(avatarPath, 'utf8'),
    readFile(badgePath, 'utf8'),
    readFile(breadcrumbPath, 'utf8'),
    readFile(buttonPath, 'utf8'),
    readFile(calloutPath, 'utf8'),
    readFile(checkboxPath, 'utf8'),
    readFile(codeBlockPath, 'utf8'),
    readFile(comboboxPath, 'utf8'),
    readFile(commandFieldPath, 'utf8'),
    readFile(confirmActionPath, 'utf8'),
    readFile(containerPath, 'utf8'),
    readFile(dialogPath, 'utf8'),
    readFile(disclosurePath, 'utf8'),
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
    readFile(localeSwitcherPath, 'utf8'),
    readFile(menuPath, 'utf8'),
    readFile(pagePath, 'utf8'),
    readFile(pageHeaderPath, 'utf8'),
    readFile(paginationPath, 'utf8'),
    readFile(popoverPath, 'utf8'),
    readFile(progressPath, 'utf8'),
    readFile(radioPath, 'utf8'),
    readFile(sectionPath, 'utf8'),
    readFile(selectPath, 'utf8'),
    readFile(segmentedControlPath, 'utf8'),
    readFile(shareDockPath, 'utf8'),
    readFile(sheetPath, 'utf8'),
    readFile(shortcutHintPath, 'utf8'),
    readFile(shortcutsPath, 'utf8'),
    readFile(skeletonPath, 'utf8'),
    readFile(tooltipPath, 'utf8'),
    readFile(skipLinkPath, 'utf8'),
    readFile(sortHeaderPath, 'utf8'),
    readFile(stackPath, 'utf8'),
    readFile(statusToastPath, 'utf8'),
    readFile(spinnerPath, 'utf8'),
    readFile(switchPath, 'utf8'),
    readFile(tabsPath, 'utf8'),
    readFile(tablePath, 'utf8'),
    readFile(tableToolbarPath, 'utf8'),
    readFile(termSheetPath, 'utf8'),
    readFile(termTriggerPath, 'utf8'),
    readFile(textareaPath, 'utf8'),
    readFile(textScaleControlPath, 'utf8'),
    readFile(themeTogglePath, 'utf8'),
    readFile(toastPath, 'utf8'),
    readFile(toolbarPath, 'utf8'),
    readFile(visuallyHiddenPath, 'utf8'),
    readFile(iconPath, 'utf8'),
    readFile(iconButtonPath, 'utf8'),
    readFile(inlinePath, 'utf8'),
    readFile(inlineCodePath, 'utf8'),
    readFile(identityChipPath, 'utf8'),
    readFile(surfacePath, 'utf8')
  ]);
const previewStyle = await readFile(previewStylePath, 'utf8');
const brandFontStyle = await readFile(brandFontStylePath, 'utf8');
const expressiveFontStyle = await readFile(expressiveFontStylePath, 'utf8');

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

if (!packageJson.scripts?.check?.includes('bun run storybook:check')) {
  failures.push('Package check script must include Storybook contract validation.');
}

if (packageJson.exports?.['./locale-fonts.css'] !== './dist/styles/locale-fonts.css') {
  failures.push('Package must expose ./locale-fonts.css for optional locale font loading.');
}

if (!packageJson.sideEffects?.includes('./dist/styles/locale-fonts.css')) {
  failures.push('Package sideEffects must keep ./dist/styles/locale-fonts.css.');
}

if (packageJson.exports?.['./brand-fonts.css'] !== './dist/styles/brand-fonts.css') {
  failures.push('Package must expose ./brand-fonts.css for optional brand wordmark font loading.');
}

if (!packageJson.sideEffects?.includes('./dist/styles/brand-fonts.css')) {
  failures.push('Package sideEffects must keep ./dist/styles/brand-fonts.css.');
}

if (packageJson.exports?.['./expressive-fonts.css'] !== './dist/styles/expressive-fonts.css') {
  failures.push('Package must expose ./expressive-fonts.css for optional expressive font loading.');
}

if (!packageJson.sideEffects?.includes('./dist/styles/expressive-fonts.css')) {
  failures.push('Package sideEffects must keep ./dist/styles/expressive-fonts.css.');
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

if (!preview.includes("import '../src/styles/brand-fonts.css';")) {
  failures.push('Storybook preview must import the brand font entry for wordmark review.');
}

if (!preview.includes("import '../src/styles/expressive-fonts.css';")) {
  failures.push('Storybook preview must import the expressive font entry for type specimen review.');
}

if (!preview.includes("import './preview.css';")) {
  failures.push('Storybook preview must import the Storybook-only preview CSS.');
}

for (const requiredText of [
  'font-family: "Playwrite AU VIC Guides"',
  'font-display: swap',
  'fontsource/fonts/playwrite-au-vic-guides@5.2.6/latin-400-normal.woff2'
]) {
  if (!brandFontStyle.includes(requiredText)) {
    failures.push(`Brand font style is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  'family=Cabin:ital,wght@0,400..700;1,400..700',
  'family=Caesar+Dressing',
  'family=Copse',
  'family=Fredericka+the+Great',
  'family=Google+Sans',
  'family=Libertinus+Keyboard',
  'family=Merriweather:ital,wght@0,400;0,700;1,400',
  'family=Tangerine:wght@400;700'
]) {
  if (!expressiveFontStyle.includes(requiredText)) {
    failures.push(`Expressive font style is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  'html,',
  'body,',
  '#storybook-root',
  'scrollbar-color: var(--zdp-color-scrollbar-thumb) var(--zdp-color-scrollbar-track)',
  'scrollbar-width: thin',
  'html::-webkit-scrollbar',
  'body::-webkit-scrollbar',
  '#storybook-root::-webkit-scrollbar',
  'height: var(--zdp-control-scrollbar-size)',
  'width: var(--zdp-control-scrollbar-size)',
  'background: var(--zdp-color-scrollbar-track)',
  'background-color: var(--zdp-color-scrollbar-thumb)',
  'background-color: var(--zdp-color-scrollbar-thumb-hover)',
  '::-webkit-scrollbar-corner'
]) {
  if (!previewStyle.includes(requiredText)) {
    failures.push(`Storybook preview CSS is missing themed root scrollbar contract ${requiredText}.`);
  }
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
  "test: 'error'"
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
      'States',
      'play: async',
      'select keeps error linkage and native change',
      'combobox keeps hidden submitted value in form story',
      "const statusSelect = lightPanel.getByLabelText('상태')",
      "await expect(statusSelect).toHaveAttribute('aria-errormessage', 'forms-light-status-error')",
      "await userEvent.selectOptions(statusSelect, 'ready')",
      "input[type=\"hidden\"][name=\"forms-light-owner\"]",
      "await expect(hiddenValue).toHaveValue('security')"
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
      'disclosure and accordion expose expanded state',
      'segmented control changes selected option',
      'command field exposes shortcut and consumer-owned result linkage',
      "const commandField = canvas.getByRole('searchbox', { name: '빠른 이동' })",
      "await expect(commandField).toHaveAttribute('aria-keyshortcuts', '/')",
      "await expect(commandField).toHaveAttribute('aria-autocomplete', 'list')",
      "'aria-describedby'",
      "'interaction-probe-command-help interaction-probe-command-state'",
      "await expect(commandField).toHaveAttribute('aria-expanded', 'false')",
      "await expect(commandField).not.toHaveAttribute('aria-controls')",
      "await userEvent.type(commandField, '설정')",
      "await expect(commandField).toHaveAttribute('aria-controls', 'interaction-probe-command-results')",
      "'interaction-probe-command-result-settings'",
      "canvas.getByRole('listbox', { name: '빠른 이동 결과' })",
      "canvas.getByRole('option', { name: '설정' })",
      "await userEvent.keyboard('{Enter}')",
      "await userEvent.keyboard('{Escape}')",
      'menu supports keyboard open, roving focus, disabled skip, and Escape focus return',
      "menuTrigger.focus()",
      "await userEvent.keyboard('{ArrowDown}')",
      "await userEvent.keyboard('{End}')",
      "await userEvent.keyboard('{Home}')",
      "await expect(menuTrigger).toHaveFocus()",
      'popover keeps trigger focus policy and closes on Escape and outside click',
      "const popoverTrigger = canvas.getByRole('button', { name: '필터 열기' })",
      "await expect(popoverTrigger).toHaveFocus()",
      "const outsideButton = canvas.getByRole('button', { name: '바깥 액션' })",
      'sheet opens as modal edge surface and restores trigger focus',
      "const sheetTrigger = canvas.getByRole('button', { name: '설정 열기' })",
      "await expect(canvas.getByRole('dialog', { name: '화면 설정' })).toBeVisible()",
      "await expect(sheetTrigger).toHaveFocus()",
      'combobox supports listbox navigation, disabled skip, selection, and Escape close',
      "const comboboxInput = canvas.getByRole('combobox', { name: '빠른 이동' })",
      "const comboboxToggle = canvas.getByRole('button', { name: '선택 열기' })",
      "input[type=\"hidden\"][name=\"interaction-probe-combobox\"]",
      'await userEvent.click(comboboxToggle)',
      "await expect(comboboxInput).toHaveAttribute('aria-controls', 'interaction-probe-combobox-listbox')",
      "await userEvent.type(comboboxInput, '프로')",
      "await expect(canvas.queryByRole('option', { name: /설정/ })).not.toBeInTheDocument()",
      "await userEvent.type(comboboxInput, '없는 항목')",
      "await expect(canvas.getByRole('status')).toHaveTextContent('결과 없음')",
      "await expect(comboboxInput).not.toHaveAttribute('aria-controls')",
      "await waitFor(() => expect(canvas.getByRole('listbox', { name: '빠른 이동 목록' })).toBeVisible())",
      "await userEvent.keyboard('{ArrowDown}')",
      "await userEvent.keyboard('{Enter}')",
      "await expect(hiddenValue).toHaveValue('settings')",
      "await userEvent.click(canvas.getByRole('button', { name: '선택 열기' }))",
      "await userEvent.keyboard('{Escape}')",
      "await expect(comboboxInput).toHaveValue('설정')",
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
  ],
  [
    'Theme locale stress story definition',
    themeLocaleStressStory,
    [
      "title: 'Design System/QA/Theme Locale Stress'",
      'ThemeLocaleStress',
      "layout: 'fullscreen'",
      'Stress'
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
  '../src/lib/components/Accordion.svelte',
  '../src/lib/components/Avatar.svelte',
  '../src/lib/components/Badge.svelte',
  '../src/lib/components/Breadcrumb.svelte',
  '../src/lib/components/Button.svelte',
  '../src/lib/components/Callout.svelte',
  '../src/lib/components/Checkbox.svelte',
  '../src/lib/components/CodeBlock.svelte',
  '../src/lib/components/CommandField.svelte',
  '../src/lib/components/Container.svelte',
  '../src/lib/components/Dialog.svelte',
  '../src/lib/components/Disclosure.svelte',
  '../src/lib/components/Divider.svelte',
  '../src/lib/components/EmptyState.svelte',
  '../src/lib/components/ErrorText.svelte',
  '../src/lib/components/Field.svelte',
  '../src/lib/components/HelpText.svelte',
  '../src/lib/components/Icon.svelte',
  '../src/lib/components/IconButton.svelte',
  '../src/lib/components/Inline.svelte',
  '../src/lib/components/Input.svelte',
  '../src/lib/components/IdentityChip.svelte',
  '../src/lib/components/InlineCode.svelte',
  '../src/lib/components/KeyValue.svelte',
  '../src/lib/components/Label.svelte',
  '../src/lib/components/Link.svelte',
  '../src/lib/components/Page.svelte',
  '../src/lib/components/PageHeader.svelte',
  '../src/lib/components/Pagination.svelte',
  '../src/lib/components/Progress.svelte',
  '../src/lib/components/Radio.svelte',
  '../src/lib/components/Section.svelte',
  '../src/lib/components/Select.svelte',
  '../src/lib/components/SegmentedControl.svelte',
  '../src/lib/components/ShareDock.svelte',
  '../src/lib/components/Skeleton.svelte',
  '../src/lib/components/SkipLink.svelte',
  '../src/lib/components/SortHeader.svelte',
  '../src/lib/components/Stack.svelte',
  '../src/lib/components/StatusToast.svelte',
  '../src/lib/components/Spinner.svelte',
  '../src/lib/components/Surface.svelte',
  '../src/lib/components/Switch.svelte',
  '../src/lib/components/Tabs.svelte',
  '../src/lib/components/Table.svelte',
  '../src/lib/components/TableToolbar.svelte',
  '../src/lib/components/Textarea.svelte',
  '../src/lib/components/Toast.svelte',
  '../src/lib/components/VisuallyHidden.svelte',
  '<main class="storybook-preview zdp-surface-reset" lang="ko">',
  'zdp-brand-lockup',
  'zdp-brand-lockup__mark',
  'zdp-brand-wordmark',
  '8ailors',
  'font-family: var(--zdp-font-family-brand)',
  'font-weight: var(--zdp-font-weight-semibold)',
  'type-specimen--script',
  '.type-specimen--script strong',
  'font-weight: var(--zdp-font-weight-bold)',
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
  '--zdp-color-selection-surface',
  '--zdp-color-selection-text',
  '--zdp-control-focus-outline-width',
  '--zdp-i18n-overflow-wrap',
  'line-height: var(--zdp-type-title-line-height)',
  'font-size: calc(var(--zdp-type-page-title-size) - 0.8rem)',
  'font-size: calc(var(--zdp-type-page-title-compact-size) - 0.5rem)',
  'line-height: var(--zdp-type-page-title-line-height)',
  'Search Design System',
  'CommandField',
  'storybook-light-command-help',
  'storybook-dark-command-help',
  '이 화면에서 찾을 항목을 입력하세요.',
  '필요한 항목으로 바로 이동하세요.',
  'storybook-light-code',
  'storybook-dark-code',
  '릴리스 기준',
  '보안 경계',
  '<InlineCode text="readonly" />',
  '<InlineCode text="server-only" />',
  '<CodeBlock',
  'code={lightCodeExample}',
  'code={darkCodeExample}',
  '본문으로 건너뛰기',
  'VisuallyHidden',
  'ShareDock',
  'Stack',
  'StatusToast',
  'Accordion',
  'Avatar',
  'CodeBlock',
  'Disclosure',
  'IdentityChip',
  'InlineCode',
  'Pagination',
  'Progress',
  'Spinner',
  'Skeleton',
  'SortHeader',
  'TableToolbar',
  'SegmentedControl',
  'Toast',
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
  '저장됐습니다.',
  '초안이 준비됐습니다.',
  '확인이 필요합니다.',
  '연결이 끊겼습니다.',
  'idPrefix="storybook-light-status-toast"',
  'idPrefix="storybook-dark-status-toast"',
  'storybook-light-progress-title',
  'storybook-dark-progress-title',
  'class="type-specimens" role="group" aria-label="표현용 폰트 샘플"',
  'class="loading-preview" role="group" aria-labelledby="storybook-light-progress-title"',
  'class="loading-preview" role="group" aria-labelledby="storybook-dark-progress-title"',
  '자료를 불러오는 중입니다.',
  '목록 확인 중',
  '응답을 기다리고 있습니다.',
  '응답 대기 중',
  '업데이트 받기',
  '알림 주기',
  '자동 저장',
  '작성 중인 내용을 임시 보관합니다.',
  'storybook-light-feedback',
  'storybook-dark-feedback',
  'storybook-light-identity',
  'storybook-dark-identity',
  'storybook-light-breadcrumb',
  'storybook-dark-breadcrumb',
  '현재 위치',
  'storybook-light-tabs',
  'storybook-dark-tabs',
  'storybook-light-disclosure',
  'storybook-dark-disclosure',
  'storybook-light-segmented-control',
  'storybook-dark-segmented-control',
  'storybook-light-data',
  'storybook-dark-data',
  '밝은 화면 점검 목록 페이지',
  '어두운 화면 점검 목록 페이지',
  '보안 점검 목록',
  'aria-sort="ascending"',
  'aria-sort="descending"',
  '<SortHeader label="항목" direction="ascending" />',
  '<SortHeader label="상태" direction="descending" />',
  '<TableToolbar',
  'selectedCount={2}',
  '표 밀도',
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
  'Identity',
  '홍길동',
  '김하늘',
  '검토 담당',
  '운영 담당',
  '삭제 전에 다시 확인하세요.',
  '탭은 페이지 안의 가까운 정보 묶음을 바꿀 때 사용합니다.',
  '검토 기준',
  '접힌 안내',
  '보기 방식',
  '목록'
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
  '../src/lib/components/Badge.svelte',
  '../src/lib/components/Button.svelte',
  '../src/lib/components/Callout.svelte',
  '../src/lib/components/CodeBlock.svelte',
  '../src/lib/components/CommandField.svelte',
  '../src/lib/components/InlineCode.svelte',
  '../src/lib/components/Pagination.svelte',
  '../src/lib/components/Progress.svelte',
  '../src/lib/components/Skeleton.svelte',
  '../src/lib/components/SortHeader.svelte',
  '../src/lib/components/Spinner.svelte',
  '../src/lib/components/Table.svelte',
  '../src/lib/components/TableToolbar.svelte',
  '../src/lib/components/Toast.svelte',
  '../src/lib/components/Tooltip.svelte',
  'Theme / Locale Stress',
  '긴 문장과 초점 확인',
  "id: 'light'",
  "id: 'dark'",
  'data-zdp-theme={theme.id}',
  '24.375rem',
  "lang: 'ko'",
  "lang: 'en'",
  "lang: 'zh'",
  "lang: 'hi'",
  '승인대기중인긴프로젝트이름',
  'Super-long audit trail names',
  '这是一个非常长的状态说明',
  'लंबे समीक्षा संदेश',
  'stress-force-focus',
  'stress-device',
  'stress-locale-card',
  'stress-focus-grid',
  'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
  'border-color: var(--zdp-color-focus-line)',
  '.stress-force-focus :global(.zdp-button)',
  '.stress-force-focus :global(.zdp-command-field)',
  '.stress-force-focus :global(.zdp-pagination__link:not(:disabled))',
  'aria-sort={theme.id ===',
  '<SortHeader',
  '<TableToolbar',
  '<Pagination',
  '<CommandField',
  '<Tooltip',
  '<Toast',
  '<Skeleton variant="text" lines={3} />',
  '<CodeBlock',
  'horizontalOverflowProbe',
  'overflow-wrap: var(--zdp-i18n-overflow-wrap)',
  'Tab으로 이동했을 때 테두리와 outline이 잘리지 않아야 합니다.',
  'A long status toast should stay readable without pretending to own queue timing.'
]) {
  if (!themeLocaleStressComponent.includes(requiredText)) {
    failures.push(`Theme locale stress story surface is missing ${requiredText}.`);
  }
}

for (const forbiddenText of [
  'code={codeExample}\n                  wrap',
  '.stress-panel :global(th)',
  '.stress-panel :global(td)'
]) {
  if (themeLocaleStressComponent.includes(forbiddenText)) {
    failures.push(`Theme locale stress story must not force fixed-format table/code content into wrapping: ${forbiddenText}.`);
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
  '../src/lib/components/CommandField.svelte',
  '../src/lib/components/Menu.svelte',
  '../src/lib/components/Popover.svelte',
  '../src/lib/components/Tabs.svelte',
  '../src/lib/menu.ts',
  'Interaction probe',
  'comboboxOptions',
  'filteredComboboxOptions',
  'commandQuery',
  'commandKeyState',
  'interaction-probe-command',
  'interaction-probe-command-help',
  'interaction-probe-command-results',
  'ariaKeyShortcuts="/"',
  'ariaAutocomplete="list"',
  'ariaActivedescendant={commandQuery ?',
  'onkeydown={(event) =>',
  'interaction-probe-combobox',
  'interaction-probe-combobox-state',
  'onQueryChange={(nextQuery) => (comboboxQuery = nextQuery)}',
  'onValueChange={(nextValue, option) =>',
  'ariaLabel="검토 섹션"',
  "selectedId = 'overview'",
  '기록이 선택되었습니다.',
  'ariaControls="interaction-probe-dialog"',
  'ariaExpanded={dialogOpen}',
  'onClose={() => (dialogOpen = false)}',
  'menuSelection',
  'interaction-probe-menu',
  'interaction-probe-menu-state',
  'onSelect={(_, item) => (menuSelection = item.label)}',
  '필터 저장',
  'popoverState',
  'interaction-probe-popover-title',
  'interaction-probe-popover',
  'interaction-probe-popover-state',
  'onOpenChange={(open) => (popoverState = open ?',
  '필터 열기',
  'Popover {popoverState}',
  '바깥 액션',
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
  '../src/lib/components/Avatar.svelte',
  '../src/lib/components/Button.svelte',
  '../src/lib/components/CodeBlock.svelte',
  '../src/lib/components/EmptyState.svelte',
  '../src/lib/components/IdentityChip.svelte',
  '../src/lib/components/Inline.svelte',
  '../src/lib/components/InlineCode.svelte',
  '../src/lib/components/KeyValue.svelte',
  '../src/lib/components/Stack.svelte',
  '../src/lib/components/SortHeader.svelte',
  '../src/lib/components/Surface.svelte',
  '../src/lib/components/Table.svelte',
  '../src/lib/components/TableToolbar.svelte',
  'Operational information',
  'data-zdp-theme="light"',
  'data-zdp-theme="dark"',
  '보안 점검',
  '보안 점검 목록',
  '담당자',
  '홍길동',
  '김하늘',
  '검토 담당',
  '운영 담당',
  '문서 조각',
  '승격 조건',
  '보안 기준',
  '<InlineCode text="readonly" />',
  '<InlineCode text="server-only" />',
  '<CodeBlock',
  'code={lightCodeExample}',
  'code={darkCodeExample}',
  '<TableToolbar',
  'selectedCount={2}',
  'aria-sort="ascending"',
  'aria-sort="descending"',
  '<SortHeader label="항목" direction="ascending" />',
  '<SortHeader label="상태" direction="descending" />',
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
  '../src/lib/components/Progress.svelte',
  '../src/lib/components/Skeleton.svelte',
  '../src/lib/components/Stack.svelte',
  '../src/lib/components/StatusToast.svelte',
  '../src/lib/components/Spinner.svelte',
  '../src/lib/components/Surface.svelte',
  '../src/lib/components/Toast.svelte',
  '../src/lib/toast.ts',
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
  '초안이 준비됐습니다.',
  '작업이 저장됐습니다.',
  '저장됐습니다.',
  '동기화가 끝났습니다.',
  '확인이 필요합니다.',
  '연결이 끊겼습니다.',
  'feedback-light-progress-title',
  'feedback-dark-progress-title',
  '자료를 불러오는 중입니다.',
  '목록 확인 중',
  '응답을 기다리고 있습니다.',
  '응답 대기 중',
  'variant="text"',
  'variant="block"',
  'variant="avatar"',
  'placement="inline"',
  'idPrefix="feedback-light-status-toast"',
  'idPrefix="feedback-dark-status-toast"',
  'onDismiss={(_, item) =>',
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
  '../src/lib/components/Combobox.svelte',
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
  'forms-light-owner',
  'forms-dark-owner',
  '<Combobox',
  '담당 팀 찾기',
  '가장 가까운 담당 팀을 선택하세요.',
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
  '../src/lib/components/Accordion.svelte',
  '../src/lib/components/Button.svelte',
  '../src/lib/components/Disclosure.svelte',
  '../src/lib/components/Dialog.svelte',
  '../src/lib/components/Divider.svelte',
  '../src/lib/components/Inline.svelte',
  '../src/lib/components/Kbd.svelte',
  '../src/lib/components/LocaleSwitcher.svelte',
  '../src/lib/components/CommandField.svelte',
  '../src/lib/components/Menu.svelte',
  '../src/lib/components/Popover.svelte',
  '../src/lib/components/SegmentedControl.svelte',
  '../src/lib/components/ShareDock.svelte',
  '../src/lib/components/ShortcutHint.svelte',
  '../src/lib/components/Stack.svelte',
  '../src/lib/components/Surface.svelte',
  '../src/lib/components/Tabs.svelte',
  '../src/lib/components/TermSheet.svelte',
  '../src/lib/components/TermTrigger.svelte',
  '../src/lib/components/TextScaleControl.svelte',
  '../src/lib/components/ThemeToggle.svelte',
  '../src/lib/components/Tooltip.svelte',
  '../src/lib/disclosure.ts',
  '../src/lib/menu.ts',
  '../src/lib/segmented.ts',
  '../src/lib/share.ts',
  '../src/lib/shortcuts.ts',
  '../src/lib/term.ts',
  '../src/lib/theme.ts',
  'Interaction states',
  'id="interaction-main"',
  'tabindex="-1"',
  'data-zdp-theme="light"',
  'data-zdp-theme="dark"',
  'line-height: var(--zdp-type-title-line-height)',
  'Tabs',
  'Command Field',
  'interaction-light-command',
  'interaction-dark-command',
  '프로젝트, 문서, 설정 검색',
  '검색어 없음',
  'Shortcut hints',
  'Locale Switcher',
  '<LocaleSwitcher',
  'lightLocale',
  'darkLocale',
  'localeOptions',
  'ariaLabel="Light locale"',
  'ariaLabel="Dark locale"',
  'Theme Toggle',
  '<ThemeToggle',
  'Text Scale Control',
  '<TextScaleControl',
  'lightTextScale',
  'darkTextScale',
  'ariaLabel="Light text scale"',
  'ariaLabel="Dark text scale"',
  'lightTheme',
  'darkTheme',
  "lightTheme === 'dark' ? 'light' : 'dark'",
  "darkTheme === 'dark' ? 'light' : 'dark'",
  'Tooltip',
  'Accordion and Disclosure',
  'Segmented Control',
  'Popover and Menu',
  'Term Sheet',
  'Kbd',
  'ShortcutHint',
  'zdpShortcutRecommendations',
  'zdpShortcutReservedExamples',
  'visibleShortcutRecommendations',
  'reservedShortcutPreview',
  'keydown 처리는 각 화면에 남깁니다',
  'Light shortcut hints',
  'Dark shortcut hints',
  'role="group" aria-label="Light shortcut hints"',
  'role="group" aria-label="Dark shortcut hints"',
  'Search',
  'Guide',
  'Open',
  'Previous',
  'Next',
  'Submit',
  'Close',
  'Typing',
  'IME',
  'Reserved',
  'shortcut-policy',
  'role="group" aria-label="Light shortcut guard examples"',
  'role="group" aria-label="Dark shortcut guard examples"',
  'Global shortcuts off while typing',
  'Global shortcuts off during IME composition',
  'text="새 항목"',
  'text="닫기"',
  'placement="right"',
  'let:describedBy',
  'ariaDescribedBy={describedBy}',
  'lightAccordionItems',
  'darkAccordionItems',
  'headingLevel={4}',
  'ariaLabel="Light disclosure sections"',
  'ariaLabel="Dark disclosure sections"',
  'lightSegmentedSelection',
  'darkSegmentedSelection',
  'lightTermOpen',
  'darkTermOpen',
  'lightSegmentedItems',
  'darkSegmentedItems',
  'termExample',
  'ZdpTermSheetTerm',
  'ariaLabel="Light view mode"',
  'ariaLabel="Dark view mode"',
  '보기 방식',
  '목록',
  '검토 기준',
  '접힌 안내',
  'idPrefix="interaction-light-popover"',
  'idPrefix="interaction-dark-popover"',
  'idPrefix="interaction-light-menu"',
  'idPrefix="interaction-dark-menu"',
  'triggerLabel="더보기"',
  'onSelect={(_, item) => (lightMenuSelection = item.label)}',
  'onSelect={(_, item) => (darkMenuSelection = item.label)}',
  '<TermTrigger',
  '<TermSheet',
  'controls="interaction-light-term-sheet"',
  'controls="interaction-dark-term-sheet"',
  'id="interaction-light-term-sheet"',
  'id="interaction-dark-term-sheet"',
  'onClose={() => (lightTermOpen = false)}',
  'onClose={() => (darkTermOpen = false)}',
  '운영 복원력',
  '용어 열림',
  '용어 닫힘',
  '설정 열기',
  '필터 저장',
  '연결 끊기',
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
  "type ZdpLocaleSwitcherOption",
  "type ZdpLocaleSwitcherSize",
  'role="radiogroup"',
  'role="radio"',
  'aria-checked={option.value === activeValue}',
  'data-zdp-locale-switcher',
  'data-zdp-locale-value={activeValue}',
  'data-zdp-locale-option-value={option.value}',
  'class={`zdp-locale-switcher zdp-locale-switcher--${size}`}',
  '.zdp-locale-switcher',
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
  "value: ZdpTextScale",
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
  "lightLabel = '라이트 모드로 전환'",
  "darkLabel = '다크 모드로 전환'",
  'aria-pressed={isDark}',
  'data-zdp-theme-toggle',
  'data-zdp-theme-state={theme}',
  'class={`zdp-theme-toggle zdp-theme-toggle--${size}`}',
  'zdp-theme-toggle__icon--sun',
  'zdp-theme-toggle__icon--moon',
  '.zdp-theme-toggle',
  '.zdp-theme-toggle:focus-visible',
  '.zdp-theme-toggle[data-zdp-theme-state=',
  'user-select: none'
]) {
  if (!themeToggle.includes(requiredText)) {
    failures.push(`ThemeToggle component is missing ${requiredText}.`);
  }
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
  "label = '사용자'",
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
  'items: readonly ZdpStatusToastItem[] = []',
  'placement:',
  'idPrefix =',
  'ariaLabel =',
  'onDismiss:',
  'function handleDismiss',
  'function handleAction',
  'function resolvedRel',
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
  'event.isComposing',
  'event.keyCode === 229',
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
  "copyLabel = '복사'",
  "copiedLabel = '복사됨'",
  "copyFailedLabel = '복사 실패'",
  '$: canCopy = showCopy && code.length > 0',
  'navigator.clipboard.writeText(code)',
  'onDestroy(() =>',
  'class={`zdp-code-block zdp-code-block--${size} zdp-code-block--${tone}`}',
  'data-wrap={wrap ?',
  'role="group"',
  'aria-labelledby={labelledBy ?? undefined}',
  'class="zdp-code-block__header"',
  'class="zdp-code-block__meta"',
  'class="zdp-code-block__title"',
  'class="zdp-code-block__language"',
  'class="zdp-code-block__copy"',
  'onclick={handleCopy}',
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
  "import type { ZdpCommandFieldSize }",
  "import ShortcutHint from './ShortcutHint.svelte'",
  'type DescribedBy = string | readonly string[] | null',
  "type AriaAutocomplete = 'none' | 'inline' | 'list' | 'both'",
  'id: string | null = null',
  'name: string | null = null',
  "type: HTMLInputAttributes['type'] = 'search'",
  "label: string | null = '검색'",
  'labelVisible = false',
  "placeholder: string | null = '검색어 입력'",
  "autocomplete: HTMLInputAttributes['autocomplete'] | null = 'off'",
  'describedBy: DescribedBy = null',
  'errorMessageId: string | null = null',
  'invalid = false',
  'disabled = false',
  'readonly = false',
  'required = false',
  "size: ZdpCommandFieldSize = 'md'",
  "shortcutKeys: readonly string[] = ['/']",
  'ariaKeyShortcuts: string | null = null',
  'ariaAutocomplete: AriaAutocomplete | null = null',
  'ariaControls: string | null = null',
  'ariaExpanded: boolean | null = null',
  'ariaActivedescendant: string | null = null',
  'onkeydown: ((event: KeyboardEvent) => void) | null = null',
  'normalizeIdRefs',
  'aria-describedby={ariaDescribedBy ?? undefined}',
  'aria-errormessage={resolvedErrorMessageId ?? undefined}',
  "aria-invalid={invalid ? 'true' : undefined}",
  'aria-keyshortcuts={ariaKeyShortcuts ?? undefined}',
  'aria-autocomplete={ariaAutocomplete ?? undefined}',
  'aria-controls={ariaControls ?? undefined}',
  'aria-expanded={ariaExpanded ?? undefined}',
  'aria-activedescendant={ariaActivedescendant ?? undefined}',
  'oninput={handleInput}',
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
  'id: string | null = null',
  'name: string | null = null',
  'value =',
  'query =',
  'options: readonly ZdpComboboxOption[] = []',
  "label: string | null = '검색'",
  'labelVisible = false',
  'ariaLabel: string | null = null',
  "placeholder: string | null = '검색어 입력'",
  "autocomplete: HTMLInputAttributes['autocomplete'] | null = 'off'",
  'describedBy: DescribedBy = null',
  'errorMessageId: string | null = null',
  'invalid = false',
  'disabled = false',
  'readonly = false',
  'required = false',
  "size: ZdpComboboxSize = 'md'",
  'onQueryChange: ((query: string) => void) | null = null',
  'onValueChange: ((value: string, option: ZdpComboboxOption | null) => void) | null = null',
  'onOpenChange: ((open: boolean) => void) | null = null',
  'enabledOptions = options.filter((option) => !option.disabled)',
  'role="combobox"',
  'aria-autocomplete="list"',
  'aria-haspopup="listbox"',
  'aria-expanded={open}',
  'aria-controls={open && hasOptions ? listboxId : undefined}',
  'aria-activedescendant={activeOptionDomId ?? undefined}',
  'aria-describedby={ariaDescribedBy ?? undefined}',
  'aria-errormessage={resolvedErrorMessageId ?? undefined}',
  "aria-invalid={invalid ? 'true' : undefined}",
  '<input type="hidden" {name} {value} />',
  'role="listbox"',
  'aria-label={listboxLabel}',
  'role="option"',
  'aria-selected={option.value === value}',
  'aria-disabled={option.disabled ?',
  'tabindex="-1"',
  'handleInputKeydown',
  'moveActiveOption',
  'selectOption',
  'resolveActiveOptionId',
  "let lastSelectedValue = ''",
  "let lastSelectedLabel = ''",
  'selectedOptionLabel = selectedOption?.label ??',
  'const nextQuery = selectedOptionLabel || query',
  'onQueryChange?.(query)',
  'onQueryChange?.(nextQuery)',
  "event.key === 'ArrowDown'",
  "event.key === 'ArrowUp'",
  "event.key === 'Enter'",
  "event.key === 'Escape'",
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
  "placement: 'top' | 'right' | 'bottom' | 'left' = 'top'",
  'disabled = false',
  'const fallbackId = `zdp-tooltip-${++tooltipIdCounter}`',
  '$: tooltipId = id ?? fallbackId',
  '$: describedBy = disabled ? null : tooltipId',
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
  'pointer-events: none',
  'white-space: nowrap'
]) {
  if (!tooltip.includes(requiredText)) {
    failures.push(`Tooltip component is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'Tooltip component', tooltip);
assertNoOverRoundedUsage(failures, 'Tooltip component', tooltip);

for (const requiredText of [
  "import type { ZdpDisclosureHeadingLevel }",
  'export let open = false',
  'export let disabled = false',
  "export let title = '자세히 보기'",
  'headingLevel: ZdpDisclosureHeadingLevel | null = null',
  'onOpenChange: ((open: boolean) => void) | null = null',
  'resolvedId',
  'triggerId',
  'panelId',
  'aria-expanded={open}',
  'aria-controls={panelId}',
  'disabled={disabled}',
  'onclick={handleToggle}',
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
  'items: readonly ZdpAccordionItem[] = []',
  "mode: ZdpAccordionMode = 'multiple'",
  "ariaLabel = '접힌 목록'",
  'headingLevel: ZdpDisclosureHeadingLevel | null = 3',
  'onOpenChange',
  'openIds: readonly string[] = []',
  'nextItemOpenSignature',
  'normalizeInitialOpenIds',
  'isItemOpen',
  'handleItemOpenChange',
  'resolveNextOpenIds',
  'role="list"',
  'aria-label={ariaLabel}',
  'class="zdp-accordion__item"',
  'role="listitem"',
  '<Disclosure',
  'open={isItemOpen(item.id)}',
  'disabled={item.disabled ?? false}',
  'onOpenChange={(nextOpen) => handleItemOpenChange(item, nextOpen)}',
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
  'items: readonly ZdpSegmentedControlItem[] = []',
  'selectedId: string | null = null',
  "ariaLabel = '선택 전환'",
  'idPrefix: string | null = null',
  "size: ZdpSegmentedControlSize = 'md'",
  'onChange',
  'selectedItem',
  'activeId',
  'selectItem',
  'handleKeydown',
  "['ArrowLeft', 'ArrowRight', 'Home', 'End']",
  'getNextIndex',
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

for (const requiredText of [
  "placement: 'top' | 'right' | 'bottom' | 'left' = 'bottom'",
  "align: 'start' | 'center' | 'end' = 'start'",
  "role: 'dialog' | 'group' | null = 'dialog'",
  'closeOnEscape',
  'closeOnOutside',
  'onOpenChange',
  '<svelte:document onclick={handleDocumentClick} onkeydown={handleDocumentKeydown} />',
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
  '.zdp-popover--align-start .zdp-popover__panel',
  'max-inline-size: min(22rem, calc(100vw - var(--zdp-space-6)))',
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
  'items: readonly ZdpMenuItem[] = []',
  'triggerLabel =',
  'onOpenChange',
  'onSelect',
  'handleTriggerKeydown',
  'handlePanelKeydown',
  'moveActiveItem',
  'focusActiveItem',
  'resolvedRel',
  '<svelte:document onclick={handleDocumentClick} />',
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
  '.zdp-menu--bottom .zdp-menu__panel',
  '.zdp-menu--align-end .zdp-menu__panel',
  'max-inline-size: min(18rem, calc(100vw - var(--zdp-space-6)))',
  'translate: -50% 0',
  'translate: 0 -50%'
]) {
  if (!menu.includes(requiredText)) {
    failures.push(`Menu component is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'Menu component', menu);
assertNoOverRoundedUsage(failures, 'Menu component', menu);

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
  'overflow-x: auto',
  'overscroll-behavior-inline: contain',
  'touch-action: pan-x pan-y',
  'overflow-wrap: normal',
  'white-space: nowrap',
  'word-break: normal'
]) {
  if (!table.includes(requiredText)) {
    failures.push(`Table component is missing ${requiredText}.`);
  }
}

if (/\.zdp-table-wrap\s*\{[\s\S]{0,360}scrollbar-gutter:\s*stable;/.test(table)) {
  failures.push('Table component must not reserve a permanent scrollbar gutter beside header rows.');
}

assertNoDecorativeEffects(failures, 'Table component', table);
assertNoOverRoundedUsage(failures, 'Table component', table);

for (const requiredText of [
  "import type { ZdpSortDirection }",
  "direction: ZdpSortDirection = 'none'",
  'onSort:',
  'nextDirection',
  'aria-label={resolvedAriaLabel}',
  'data-sort-direction={normalizedDirection}',
  'class="zdp-sort-header__label"',
  'class="zdp-sort-header__mark"',
  '.zdp-sort-header__mark::before',
  '.zdp-sort-header--ascending .zdp-sort-header__mark::before',
  '.zdp-sort-header--descending .zdp-sort-header__mark::before',
  '.zdp-sort-header',
  '.zdp-sort-header:hover:not(:disabled)',
  '.zdp-sort-header:focus-visible',
  '.zdp-sort-header--ascending .zdp-sort-header__mark'
]) {
  if (!sortHeader.includes(requiredText)) {
    failures.push(`SortHeader component is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'SortHeader component', sortHeader);
assertNoOverRoundedUsage(failures, 'SortHeader component', sortHeader);

for (const requiredText of [
  "import SegmentedControl from './SegmentedControl.svelte'",
  "ZdpTableDensity",
  "ZdpTableToolbarDensityItem",
  "selectedCount: number | null = null",
  "density: ZdpTableDensity = 'default'",
  'onDensityChange:',
  'normalizeCount',
  'normalizeDensity',
  '<div',
  'class="zdp-table-toolbar"',
  'role="group"',
  'aria-labelledby={labelledBy ?? undefined}',
  'class="zdp-table-toolbar__body"',
  'class="zdp-table-toolbar__controls"',
  'class="zdp-table-toolbar__actions"',
  'class="zdp-table-toolbar__density"',
  '<SegmentedControl',
  '.zdp-table-toolbar',
  'display: flex',
  'flex-wrap: wrap',
  'justify-content: space-between',
  'flex: 1 1 16rem',
  'min-inline-size: min(100%, 16rem)',
  '.zdp-table-toolbar__actions',
  'margin-inline-start: auto',
  '@media (max-width: 48rem)'
]) {
  if (!tableToolbar.includes(requiredText)) {
    failures.push(`TableToolbar component is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'TableToolbar component', tableToolbar);
assertNoOverRoundedUsage(failures, 'TableToolbar component', tableToolbar);

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
  'interface BreadcrumbItem',
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
  "import type { ZdpPaginationItem }",
  'export let currentPage = 1',
  'export let totalPages = 1',
  'export let siblingCount = 1',
  "export let ariaLabel = '페이지 이동'",
  "export let previousLabel = '이전'",
  "export let nextLabel = '다음'",
  'hrefForPage: ((page: number) => string | null) | null = null',
  'onPageChange: ((event: MouseEvent, page: number) => void) | null = null',
  'normalizePositiveInteger',
  'clampPage',
  'clampSiblingCount',
  'buildPaginationItems',
  '<nav class="zdp-pagination" aria-label={ariaLabel}>',
  '<ol class="zdp-pagination__list">',
  'class="zdp-pagination__item"',
  'class="zdp-pagination__link zdp-pagination__link--control"',
  'class="zdp-pagination__link"',
  'class="zdp-pagination__ellipsis"',
  'aria-current={item.page === activePage ? \'page\' : undefined}',
  'disabled={item.page === activePage}',
  '.zdp-pagination',
  '.zdp-pagination__list',
  '.zdp-pagination__item',
  '.zdp-pagination__link',
  '.zdp-pagination__link--control',
  'overflow-x: auto',
  'overscroll-behavior-inline: contain',
  '--zdp-pagination-focus-bleed',
  'padding-block: var(--zdp-pagination-focus-bleed)',
  'padding-inline: var(--zdp-pagination-focus-bleed)',
  'scrollbar-gutter: stable',
  'scroll-padding-inline: var(--zdp-pagination-focus-bleed)',
  'touch-action: pan-x pan-y',
  'flex-wrap: nowrap',
  'width: max-content',
  'flex: 0 0 auto',
  'white-space: nowrap',
  '.zdp-pagination__link:focus-visible',
  '.zdp-pagination__link[aria-current=\'page\']',
  '.zdp-pagination__link:disabled',
  '.zdp-pagination__ellipsis'
]) {
  if (!pagination.includes(requiredText)) {
    failures.push(`Pagination component is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'Pagination component', pagination);
assertNoOverRoundedUsage(failures, 'Pagination component', pagination);

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
  "import Tooltip from './Tooltip.svelte'",
  "placement: 'side' | 'rail' | 'bottom' | 'inline' = 'side'",
  'tooltipPlacement',
  'class={`zdp-share-dock zdp-share-dock--${placement}`}',
  'class="zdp-share-dock__list"',
  '<Tooltip text={item.label} placement={tooltipPlacement}',
  'disabled={item.disabled}',
  'class="zdp-share-action"',
  'class="zdp-share-action__mark"',
  'class={`zdp-share-icon zdp-share-icon--${item.icon}`}',
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
  'interface TabItem',
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

for (const requiredText of [
  "import type { ZdpSheetPlacement, ZdpSheetSize }",
  'export let open = false',
  'export let id: string | null = null',
  'export let labelledBy: string',
  "export let placement: ZdpSheetPlacement = 'right'",
  "export let size: ZdpSheetSize = 'md'",
  'export let closeOnEscape = true',
  'export let closeOnBackdrop = true',
  'onClose: (() => void) | null = null',
  'createZdpModalLayer',
  'modalLayer.setActive(open, layerElement)',
  'handleSheetOpened',
  'restorePreviousFocus',
  'handleBackdropClick',
  'getFocusableElements',
  'class="zdp-sheet__backdrop"',
  'class={`zdp-sheet zdp-sheet--${placement} zdp-sheet--${size}`}',
  'role="dialog"',
  'aria-modal="true"',
  'aria-labelledby={labelledBy}',
  'aria-describedby={describedBy ?? undefined}',
  'data-zdp-sheet-placement={placement}',
  'data-zdp-sheet-size={size}',
  'data-zdp-sheet-surface="sheet"',
  'onkeydown={handleKeydown}',
  'class="zdp-sheet__close"',
  '.zdp-sheet__backdrop',
  '.zdp-sheet--right',
  '.zdp-sheet--left',
  '.zdp-sheet--bottom',
  '.zdp-sheet:focus-visible',
  '.zdp-sheet__close:focus-visible',
  '-webkit-user-select: none',
  'user-select: none',
  '@media (max-width: 720px)'
]) {
  if (!sheet.includes(requiredText)) {
    failures.push(`Sheet component is missing ${requiredText}.`);
  }
}

assertNoDecorativeEffects(failures, 'Sheet component', sheet);
assertNoOverRoundedUsage(failures, 'Sheet component', sheet);

for (const requiredText of [
  "import type { ZdpTermSheetPlacement, ZdpTermSheetTerm }",
  'export let open = false',
  "export let id = 'zdp-term-sheet'",
  'export let term: ZdpTermSheetTerm | null = null',
  "export let placement: ZdpTermSheetPlacement = 'right'",
  'export let closeOnEscape = true',
  'export let closeOnBackdrop = true',
  'onClose: (() => void) | null = null',
  'onRelatedTerm: ((termId: string) => void) | null = null',
  'handleSheetOpened',
  'restorePreviousFocus',
  'handleBackdropClick',
  'getFocusableElements',
  'class="zdp-term-sheet__backdrop"',
  'class={`zdp-term-sheet zdp-term-sheet--${resolvedPlacement}`}',
  'role="dialog"',
  'aria-modal="true"',
  'aria-labelledby={titleId}',
  'aria-describedby={descriptionId}',
  'data-zdp-ad-exclude="true"',
  'onkeydown={handleKeydown}',
  'class="zdp-term-sheet__close"',
  'class="zdp-term-sheet__related-button"',
  'data-term-id={relatedTerm.id}',
  'class="zdp-term-sheet__detail-link"',
  '.zdp-term-sheet__backdrop',
  '.zdp-term-sheet--right',
  '.zdp-term-sheet--bottom',
  '.zdp-term-sheet:focus-visible',
  '.zdp-term-sheet__close:focus-visible',
  '.zdp-term-sheet__related-button:focus-visible',
  '-webkit-user-select: none',
  'user-select: none',
  '@media (max-width: 720px)'
]) {
  if (!termSheet.includes(requiredText)) {
    failures.push(`TermSheet component is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  'export let termId: string',
  'export let controls: string | null = null',
  'export let expanded = false',
  'export let disabled = false',
  'onopen: ((termId: string) => void) | null = null',
  '$: resolvedControls = controls !== null && expanded ? controls : null',
  'data-term-id={termId}',
  'aria-controls={resolvedControls ?? undefined}',
  'aria-expanded={controls === null ? undefined : expanded}',
  'aria-haspopup="dialog"',
  'onclick={handleClick}',
  '.zdp-term-trigger',
  'background: transparent',
  'padding: 0 0.2rem',
  '.zdp-term-trigger:hover:not(:disabled)',
  'background: var(--zdp-color-accent-primary-soft)',
  'color: inherit',
  '.zdp-term-trigger:focus-visible',
  'background: var(--zdp-color-focus-surface)',
  'color: var(--zdp-color-focus-text)'
]) {
  if (!termTrigger.includes(requiredText)) {
    failures.push(`TermTrigger component is missing ${requiredText}.`);
  }
}

if (termTrigger.includes('-webkit-user-select: none') || termTrigger.includes('user-select: none')) {
  failures.push('TermTrigger component must keep inline term text selectable.');
}

assertNoDecorativeEffects(failures, 'TermSheet component', termSheet);
assertNoDecorativeEffects(failures, 'TermTrigger component', termTrigger);
assertNoOverRoundedUsage(failures, 'TermSheet component', termSheet);
assertNoOverRoundedUsage(failures, 'TermTrigger component', termTrigger);

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

for (const [surfaceLabel, source] of [
  ['Avatar component initials', avatar],
  ['Breadcrumb component separator', breadcrumb],
  ['Button component', button],
  ['Checkbox component', checkbox],
  ['Callout component mark', callout],
  ['CodeBlock component copy action', codeBlock],
  ['Combobox component controls', combobox],
  ['CommandField component shortcut', commandField],
  ['ConfirmAction component', confirmAction],
  ['Dialog component close button', dialog],
  ['Disclosure component trigger', disclosure],
  ['Icon component', icon],
  ['IconButton component', iconButton],
  ['Kbd component', kbd],
  ['Label component required mark', label],
  ['LocaleSwitcher component controls', localeSwitcher],
  ['Menu component controls', menu],
  ['Pagination component controls', pagination],
  ['Popover component trigger', popover],
  ['Progress component marks', progress],
  ['Radio component', radio],
  ['SegmentedControl component items', segmentedControl],
  ['ShareDock component actions', shareDock],
  ['Sheet component controls', sheet],
  ['ShortcutHint component', shortcutHint],
  ['Skeleton component', skeleton],
  ['SortHeader component', sortHeader],
  ['Spinner component', spinner],
  ['Switch component', switchComponent],
  ['Tabs component tab', tabs],
  ['TermSheet component controls', termSheet],
  ['TextScaleControl component controls', textScaleControl],
  ['ThemeToggle component', themeToggle],
  ['Toast component controls', toast],
  ['Tooltip component content', tooltip]
] as const) {
  assertScopedSelectionBlocking(surfaceLabel, source);
}

for (const [surfaceLabel, source] of [
  ['CodeBlock component readable code', codeBlock],
  ['Table component readable cells', table],
  ['Toast component readable message', toast],
  ['IdentityChip component readable text', identityChip],
  ['KeyValue component readable values', keyValue],
  ['TermTrigger component readable inline text', termTrigger]
] as const) {
  assertNoReadableSelectionBlocking(surfaceLabel, source);
}

assertNoDecorativeEffects(failures, 'Button component', button);
assertNoDecorativeEffects(failures, 'Icon component', icon);
assertNoDecorativeEffects(failures, 'IconButton component', iconButton);
assertNoDecorativeEffects(failures, 'LocaleSwitcher component', localeSwitcher);
assertNoDecorativeEffects(failures, 'TextScaleControl component', textScaleControl);
assertNoDecorativeEffects(failures, 'ThemeToggle component', themeToggle);
assertNoDecorativeEffects(failures, 'Surface component', surface);
assertNoDecorativeEffects(failures, 'Storybook overview', component);
assertNoDecorativeEffects(failures, 'Storybook preview CSS', previewStyle);
assertNoDecorativeEffects(failures, 'Buttons story', buttonsComponent);
assertNoDecorativeEffects(failures, 'Button controls story', buttonPlayground);
assertNoDecorativeEffects(failures, 'Data display story', dataDisplayComponent);
assertNoDecorativeEffects(failures, 'Feedback story', feedbackComponent);
assertNoDecorativeEffects(failures, 'Forms story', formsComponent);
assertNoDecorativeEffects(failures, 'Interaction story', interactionComponent);
assertNoDecorativeEffects(failures, 'Interaction probe story', interactionProbe);
assertNoDecorativeEffects(failures, 'Navigation story', navigationComponent);
assertNoDecorativeEffects(failures, 'Theme locale stress story', themeLocaleStressComponent);
assertNoOverRoundedUsage(failures, 'Button component', button);
assertNoOverRoundedUsage(failures, 'Icon component', icon);
assertNoOverRoundedUsage(failures, 'IconButton component', iconButton);
assertNoOverRoundedUsage(failures, 'Surface component', surface);
assertNoOverRoundedUsage(failures, 'Storybook overview', component);
assertNoOverRoundedUsage(failures, 'Storybook preview CSS', previewStyle);
assertNoOverRoundedUsage(failures, 'Buttons story', buttonsComponent);
assertNoOverRoundedUsage(failures, 'Button controls story', buttonPlayground);
assertNoOverRoundedUsage(failures, 'Data display story', dataDisplayComponent);
assertNoOverRoundedUsage(failures, 'Feedback story', feedbackComponent);
assertNoOverRoundedUsage(failures, 'Forms story', formsComponent);
assertNoOverRoundedUsage(failures, 'Interaction story', interactionComponent);
assertNoOverRoundedUsage(failures, 'Interaction probe story', interactionProbe);
assertNoOverRoundedUsage(failures, 'Navigation story', navigationComponent);
assertNoOverRoundedUsage(failures, 'Theme locale stress story', themeLocaleStressComponent);

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(failure);
  }

  process.exitCode = 1;
}

function assertScopedSelectionBlocking(label: string, source: string): void {
  if (!source.includes('-webkit-user-select: none') || !source.includes('user-select: none')) {
    failures.push(`${label} must include prefixed and standard scoped user-select blocking for control/decorative surfaces.`);
  }
}

function assertNoReadableSelectionBlocking(label: string, source: string): void {
  for (const forbiddenText of [
    '.zdp-code-block__pre {\n    -webkit-user-select: none',
    '.zdp-code-block__pre {\n    user-select: none',
    '.zdp-table td {\n    -webkit-user-select: none',
    '.zdp-table td {\n    user-select: none',
    '.zdp-toast__message) {\n    -webkit-user-select: none',
    '.zdp-toast__message) {\n    user-select: none',
    '.zdp-identity-chip__label {\n    -webkit-user-select: none',
    '.zdp-identity-chip__label {\n    user-select: none',
    '.zdp-key-value dd {\n    -webkit-user-select: none',
    '.zdp-key-value dd {\n    user-select: none'
  ]) {
    if (source.includes(forbiddenText)) {
      failures.push(`${label} must remain selectable and must not include ${forbiddenText}.`);
    }
  }
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

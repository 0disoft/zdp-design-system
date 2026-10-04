import type { StorybookCheckContext } from './context';
import { assertNoDecorativeEffects, assertNoOverRoundedUsage } from '../style-contract';

export function checkConfigurationContracts(context: StorybookCheckContext): void {
  const { failures, packageJson, main, favicon, preview, story, component, buttonsStory, buttonsComponent, dataDisplayStory, dataDisplayComponent, feedbackStory, feedbackComponent, formsStory, formsComponent, interactionStory, interactionComponent, layoutStory, navigationStory, navigationComponent, themeLocaleStressStory, surface, previewStyle, brandFontStyle, expressiveFontStyle } = context;

  for (const requiredText of [
    'border: 1px solid transparent',
    'background: var(--zdp-color-surface-panel)',
    'background: var(--zdp-color-surface-raised)'
  ]) {
    if (!surface.includes(requiredText)) {
      failures.push(`Surface must keep the surface-first container contract text ${requiredText}.`);
    }
  }

  for (const [storyName, storySource] of [
    ['Buttons', buttonsComponent],
    ['DataDisplay', dataDisplayComponent],
    ['Feedback', feedbackComponent],
    ['Forms', formsComponent],
    ['Interaction', interactionComponent],
    ['Navigation', navigationComponent]
  ] as const) {
    if (!storySource.includes('align-content: start')) {
      failures.push(`${storyName} story must top-align light and dark preview panel content.`);
    }

    if (!storySource.includes('border: var(--zdp-control-border-width) solid transparent')) {
      failures.push(`${storyName} story must not add a visible border around its light and dark preview panels.`);
    }
  }

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

  if (!main.includes("staticDirs: [{ from: './public', to: '/' }]")) {
    failures.push('Storybook must publish its repository-owned favicon from the static public root.');
  }

  for (const requiredText of [
    '<svg viewBox="0 0 48 48"',
    'fill="#f7e9cf"',
    'fill="#e2c898"',
    'stroke="#b66a24"'
  ]) {
    if (!favicon.includes(requiredText)) {
      failures.push(`Storybook favicon must preserve the official detailed ship mark: ${requiredText}.`);
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

  if (!preview.includes("import '../src/styles/locale-fonts.css';")) {
    failures.push('Storybook preview must import the locale font entry for 12-locale review.');
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
        "await expect(popoverTrigger).toHaveFocus()",
        'sheet opens as modal edge surface and restores trigger focus',
        "await expect(canvas.getByRole('dialog', { name: '화면 설정' })).toBeVisible()",
        "await expect(sheetTrigger).toHaveFocus()",
        'combobox supports listbox navigation, disabled skip, selection, and Escape close',
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
    'storybook-preview__brand',
    'ship-mark-simple-mono.svg',
    'ZDP Design System',
    'Brand wordmark · optional',
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
}

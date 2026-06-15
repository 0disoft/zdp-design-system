import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

interface PackageJson {
  readonly version?: string;
  readonly exports?: Record<string, unknown>;
  readonly files?: readonly string[];
  readonly sideEffects?: readonly unknown[];
  readonly scripts?: Record<string, string>;
}

const root = process.cwd();
const failures: string[] = [];

const [
  packageJson,
  readme,
  contributing,
  serviceYaml,
  consumerContract,
  tokenDocument,
  publicEntry
] = await Promise.all([
  readPackageJson(join(root, 'package.json')),
  readFile(join(root, 'README.md'), 'utf8'),
  readFile(join(root, 'CONTRIBUTING.md'), 'utf8'),
  readFile(join(root, 'service.yaml'), 'utf8'),
  readFile(join(root, 'docs', 'CONSUMER_CONTRACT.md'), 'utf8'),
  readFile(join(root, 'tokens', 'zdp.tokens.json'), 'utf8'),
  readFile(join(root, 'src', 'lib', 'index.ts'), 'utf8')
]);

checkPackageSurface(packageJson);
checkConsumerContractDocument(consumerContract);
checkSynchronizedDocs(readme, contributing, serviceYaml);
checkTokenAndComponentSurface(tokenDocument, publicEntry);

if (failures.length > 0) {
  throw new Error(`Consumer contract check failed:\n- ${failures.join('\n- ')}`);
}

function checkPackageSurface(packageJson: PackageJson): void {
  if (packageJson.version !== '0.43.1') {
    failures.push('package.json version must be 0.43.1 for the current design-system package contract.');
  }

  if (packageJson.exports?.['./brand-fonts.css'] !== './dist/styles/brand-fonts.css') {
    failures.push('package.json exports must include ./brand-fonts.css.');
  }

  if (!packageJson.sideEffects?.includes('./dist/styles/brand-fonts.css')) {
    failures.push('package.json sideEffects must include ./dist/styles/brand-fonts.css.');
  }

  if (packageJson.exports?.['./expressive-fonts.css'] !== './dist/styles/expressive-fonts.css') {
    failures.push('package.json exports must include ./expressive-fonts.css.');
  }

  if (!packageJson.sideEffects?.includes('./dist/styles/expressive-fonts.css')) {
    failures.push('package.json sideEffects must include ./dist/styles/expressive-fonts.css.');
  }

  if (!packageJson.files?.includes('docs/')) {
    failures.push('package.json files must include docs/ so the consumer contract ships with the package.');
  }

  if (packageJson.scripts?.['consumer:check'] !== 'bun scripts/check-consumer-contract.ts') {
    failures.push('package.json scripts.consumer:check must run the consumer contract checker.');
  }

  if (!packageJson.scripts?.check?.includes('bun run consumer:check')) {
    failures.push('package.json check script must include the consumer contract checker.');
  }
}

function checkConsumerContractDocument(documentText: string): void {
  for (const requiredText of [
    '# Consumer Contract',
    "import 'zdp-design-system/styles.css';",
    "import 'zdp-design-system/brand-fonts.css';",
    "import 'zdp-design-system/expressive-fonts.css';",
    "import 'zdp-design-system/locale-fonts.css';",
    "from 'zdp-design-system'",
    'zdp-design-system/share',
    'Accordion',
    'Avatar',
    'Breadcrumb',
    'CodeBlock',
    'Combobox',
    'CommandField',
    'ConfirmAction',
    'Container',
    'Dialog',
    'Disclosure',
    'Divider',
    'EmptyState',
    'Grid',
    'Icon',
    'Inline',
    'InlineCode',
    'IdentityChip',
    'Kbd',
    'zdpShortcutRecommendations',
    'shouldZdpIgnoreShortcutEvent',
    'isZdpTextEntryTarget',
    'isZdpBrowserReservedShortcut',
    'KeyValue',
    'Link',
    'Menu',
    'Page',
    'PageHeader',
    'Pagination',
    'Popover',
    'Progress',
    'Section',
    'SegmentedControl',
    'ShareDock',
    'Sheet',
    'ShortcutHint',
    'Skeleton',
    'SkipLink',
    'SortHeader',
    'Stack',
    'StatusToast',
    'Spinner',
    'Table',
    'TableToolbar',
    'TermSheet',
    'TermTrigger',
    'LocaleSwitcher',
    'TextScaleControl',
    'ThemeToggle',
    'Tooltip',
    'Toast',
    'Toolbar',
    'VisuallyHidden',
    'tokens/zdp.tokens.json',
    '.zdp-surface-reset',
    '.zdp-page',
    '.zdp-container',
    '.zdp-section',
    '.zdp-page-header',
    '.zdp-brand-lockup',
    '.zdp-brand-wordmark',
    '.zdp-surface-reset .zdp-brand-wordmark',
    'font-size: calc(var(--zdp-type-page-title-size) - 0.8rem)',
    'font-size: calc(var(--zdp-type-page-title-compact-size) - 0.5rem)',
    'font-weight: var(--zdp-font-weight-semibold)',
    '.zdp-share-dock',
    '.zdp-visually-hidden',
    '.zdp-avatar',
    '.zdp-identity-chip',
    '.zdp-stack',
    '.zdp-inline',
    '.zdp-divider',
    '.zdp-grid',
    '.zdp-icon',
    '.zdp-toolbar',
    '.zdp-table',
    '.zdp-sort-header',
    '.zdp-table-toolbar',
    '.zdp-table-toolbar__actions',
    '.zdp-term-trigger',
    '.zdp-term-sheet',
    'data-zdp-ad-exclude',
    'data-zdp-term-id',
    'data-zdp-term-placement',
    'data-zdp-term-surface="sheet"',
    '.zdp-kbd',
    '.zdp-shortcut-hint',
    '.zdp-inline-code',
    '.zdp-code-block',
    '.zdp-code-block__copy',
    '.zdp-theme-toggle',
    '.zdp-locale-switcher',
    '.zdp-locale-switcher__item',
    '.zdp-text-scale-control',
    '.zdp-text-scale-control__item',
    '.zdp-tooltip',
    '.zdp-disclosure',
    '.zdp-accordion',
    '.zdp-segmented-control',
    '.zdp-sheet',
    '.zdp-popover',
    '.zdp-pagination',
    '.zdp-progress',
    '.zdp-spinner',
    '.zdp-skeleton',
    '.zdp-menu',
    '.zdp-toast',
    '.zdp-status-toast',
    '.zdp-command-field',
    '.zdp-command-field__input',
    '.zdp-combobox',
    '.zdp-combobox__control',
    '.zdp-combobox__input',
    '.zdp-combobox__listbox',
    '.zdp-combobox__option',
    '.zdp-user-select-control',
    '.zdp-user-select-decorative',
    '.zdp-user-select-dragging',
    'Astro',
    'Svelte',
    'Tauri',
    'Flutter',
    'hex',
    'oklch',
    'focus.surface',
    'font.family.brand',
    'font.family.expressionScript',
    'font.family.expressionSans',
    'control.heightMd',
    'control.glyphMd',
    'control.choiceSize',
    'control.choiceIndicatorSize',
    'control.switchWidth',
    'control.switchHeight',
    'control.scrollbarSize',
    'color.scrollbar',
    'color.selection',
    'readonly',
    'errorMessageId',
    'aria-errormessage',
    'onclick',
    'ariaLabel',
    'ariaControls',
    'ariaExpanded',
    'ariaPressed',
    'ariaKeyShortcuts',
    'ariaAutocomplete',
    'result id 연결',
    '입력 keydown callback',
    'aria-keyshortcuts',
    'ariaDescribedBy',
    'zdpShareIcons',
    'aria-current="page"',
    'focus trap',
    'keyboard focus',
    'Theme / Locale Stress story',
    '실제 keydown',
    'Button, IconButton, Link, CommandField',
    'Chrome과 브라우저가 기본 동작으로 가져가는 조합',
    'event.isComposing',
    'input, textarea, select, contenteditable',
    'Ctrl+K',
    'Table cell, code body, toast message',
    'selectstart',
    'public export',
    'opt-in',
    'zdp-design-system/src/...'
  ]) {
    if (!documentText.includes(requiredText)) {
      failures.push(`docs/CONSUMER_CONTRACT.md is missing ${requiredText}.`);
    }
  }
}

function checkSynchronizedDocs(readme: string, contributing: string, serviceYaml: string): void {
  for (const requiredText of [
    'docs/CONSUMER_CONTRACT.md',
    "import 'zdp-design-system/styles.css';",
    "import 'zdp-design-system/brand-fonts.css';",
    "import 'zdp-design-system/locale-fonts.css';",
    'tokens/zdp.tokens.json',
    'Breadcrumb는 현재 위치',
    'Button과 IconButton은 `onclick`',
    'ariaKeyShortcuts',
    'ariaAutocomplete',
    'result id 연결',
    '입력 keydown callback',
    'ConfirmAction은 중요한 액션',
    'Avatar와 IdentityChip은 사람',
    'CommandField는 검색',
    'Combobox는 검색 가능한 단일 선택',
    'InlineCode와 CodeBlock은 문서',
    'Icon은 장식용 glyph',
    'Link는 일반 텍스트',
    'ShareDock은 공유 도크',
    'CommandField는 검색',
    'Combobox는 검색 가능한 단일 선택',
    'Kbd와 ShortcutHint',
    'shortcut policy helper',
    'LocaleSwitcher는 언어 선택',
    'ThemeToggle은 light/dark',
    'TextScaleControl은 읽기 배율',
    'Tooltip은 짧은 보조 설명',
    'Accordion과 Disclosure는 접힌 안내',
    'SegmentedControl은 보기 방식',
    'SortHeader와 TableToolbar는 sortable column affordance',
    'Popover와 Menu는 설정',
    'Sheet는 설정',
    'Pagination은 목록 페이지 이동',
    'Progress, Spinner, Skeleton은 작업 진행',
    'Toast와 StatusToast는 저장',
    'brand-fonts.css',
    'expressive-fonts.css',
    'font.family.brand',
    'font.family.expressionEditorial',
    'zdp-brand-wordmark',
    'Text selection의 기본값은 선택 가능',
    'zdp-user-select-dragging',
    'Theme / Locale Stress story',
    '실제 keydown',
    'control이나 CommandField',
    'Chrome과 브라우저가 기본 동작으로 가져가는 조합',
    'SkipLink는 키보드',
    'VisuallyHidden은 스크린리더',
    'Stack',
    'Inline',
    'Divider',
    'Grid',
    'Icon',
    'Toolbar',
    'Pagination',
    'Table, KeyValue, EmptyState',
    'SortHeader와 TableToolbar는 sortable column affordance',
    'TermTrigger와 TermSheet는 용어 설명',
    'TermTrigger는 본문 안 의미 있는 단어',
    'stable `term_id`',
    'TermSheet에는 광고 slot을 넣지 않는다',
    'Dialog는 모달 레이어',
    'Page, Container, Section, PageHeader는 페이지 폭',
    '`describedBy`에 id 배열',
    '`errorMessageId`로 `aria-errormessage`',
    'Astro는 `styles.css`',
    'zdp-design-system/share',
    'Flutter는 Svelte 컴포넌트를 직접 쓰지 않고'
  ]) {
    if (!readme.includes(requiredText)) {
      failures.push(`README.md is missing consumer contract text ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'CONSUMER_CONTRACT.md',
    'public export',
    'font.family.brand',
    'brand-fonts.css',
    '내부 `src/` deep import',
    'Breadcrumb는 `nav`',
    'Button과 IconButton은 `onclick`',
    'ariaKeyShortcuts',
    'ariaAutocomplete',
    'result id 연결',
    '입력 keydown callback',
    'ConfirmAction은 `onconfirm`',
    'Avatar와 IdentityChip은 사람',
    'CommandField는 검색',
    'Combobox는 검색 가능한 단일 선택',
    'Link는 일반 텍스트',
    'ShareDock은 공유 도크',
    'SkipLink는 반복 탐색',
    'VisuallyHidden은 스크린리더',
    'Stack은 가까운 요소',
    'Inline은 가까운 버튼',
    'Divider는 가까운 내용',
    'Grid는 반복되는 카드',
    'Icon은 glyph',
    'Toolbar는 가까운 화면',
    'CommandField는 검색',
    'Combobox는 검색 가능한 단일 선택',
    'InlineCode와 CodeBlock은 문서',
    'Kbd와 ShortcutHint',
    'shortcut policy helper',
    'LocaleSwitcher는 언어 선택',
    'ThemeToggle은 light/dark',
    '글자 크기 선택',
    'Tooltip은 짧은 보조 설명',
    'Accordion과 Disclosure는 접힌 안내',
    'SegmentedControl은 보기 방식',
    'SortHeader와 TableToolbar는 sortable column affordance',
    'Popover와 Menu는 설정',
    'Sheet는 설정',
    'Pagination은 목록 페이지 이동',
    'Progress, Spinner, Skeleton은 작업 진행',
    'Toast와 StatusToast는 저장',
    'Selection blocking은 text color가 아니라 interaction policy',
    'Document body, code body, toast message',
    'Theme / Locale Stress story',
    '실제 keydown',
    'control이나 CommandField',
    'Chrome과 브라우저가 기본 동작으로 가져가는 조합',
    'Table은 표 형식 정보',
    'SortHeader와 TableToolbar는 sortable column affordance',
    'TermTrigger와 TermSheet는 용어 설명',
    'data-zdp-term-id',
    'data-zdp-ad-exclude',
    'KeyValue는 용어와 값',
    'EmptyState는 비어 있는 상태',
    'Dialog는 `role="dialog"`',
    'Page는 shared page root',
    'Container는 페이지 폭',
    'Section은 섹션 block rhythm',
    'PageHeader는 제목',
    '`errorMessageId`를 통해 `aria-errormessage`',
    '스크린리더용 필수 텍스트',
    'live-region 기본값',
    '대표 소비처'
  ]) {
    if (!contributing.includes(requiredText)) {
      failures.push(`CONTRIBUTING.md is missing consumer contract rule ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'consumer opt-in before broad adoption',
    'web, app, lab, and game surfaces can share token names without product-specific forks',
    'term explanation surfaces can preserve stable term_id identity without moving glossary manifest'
  ]) {
    if (!serviceYaml.includes(requiredText)) {
      failures.push(`service.yaml is missing consumer contract service text ${requiredText}.`);
    }
  }
}

function checkTokenAndComponentSurface(tokenDocument: string, publicEntry: string): void {
  for (const requiredText of [
    '"version": "0.6.10"',
    '"brand"',
    '"expressionScript"',
    '"expressionSans"',
    'Playwrite AU VIC Guides',
    '"pageTitleSize": "2.75rem"',
    '"pageTitleCompactSize": "2rem"',
    '"font"',
    '"breakpoint"',
    '"control"',
    '"glyphMd"',
    '"choiceSize"',
    '"choiceIndicatorSize"',
    '"switchWidth"',
    '"switchHeight"',
    '"scrollbarSize"',
    '"scrollbar"',
    '"selection"',
    '"i18n"',
    '"focus"',
    '"hex"',
    '"oklch"'
  ]) {
    if (!tokenDocument.includes(requiredText)) {
      failures.push(`tokens/zdp.tokens.json is missing consumer token surface ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'export { default as Accordion }',
    'export { default as Avatar }',
    'export { default as Button }',
    'export { default as Breadcrumb }',
    'export { default as CodeBlock }',
    'export { default as Combobox }',
    'export { default as CommandField }',
    'export { default as ConfirmAction }',
    'export { default as Container }',
    'export { default as Dialog }',
    'export { default as Disclosure }',
    'export { default as Divider }',
    'export { default as EmptyState }',
    'export { default as Field }',
    'export { default as Grid }',
    'export { default as Icon }',
    'export { default as Input }',
    'export { default as IdentityChip }',
    'export { default as Kbd }',
    'export { default as KeyValue }',
    'export { default as Label }',
    'export { default as Inline }',
    'export { default as InlineCode }',
    'export { default as Link }',
    'export { default as Menu }',
    'export { default as Page }',
    'export { default as PageHeader }',
    'export { default as Pagination }',
    'export { default as Popover }',
    'export { default as Progress }',
    'export { default as Section }',
    'export { default as SegmentedControl }',
    'export { default as ShareDock }',
    'export { default as Sheet }',
    'export { default as ShortcutHint }',
    'export { default as Skeleton }',
    'export { default as SkipLink }',
    'export { default as SortHeader }',
    'export { default as Stack }',
    'export { default as StatusToast }',
    'export { default as Spinner }',
    'export { default as Surface }',
    'export { default as Tabs }',
    'export { default as Table }',
    'export { default as TableToolbar }',
    'export { default as TermSheet }',
    'export { default as TermTrigger }',
    'export { default as LocaleSwitcher }',
    'export { default as TextScaleControl }',
    'export { default as ThemeToggle }',
    'export { default as Tooltip }',
    'export { default as Toast }',
    'export { default as Toolbar }',
    'export { default as VisuallyHidden }',
    'export { zdpShareIcons }',
    'export type { ZdpAccordionItem',
    'export type { ZdpCodeBlockSize',
    'export type { ZdpComboboxOption',
    'export type { ZdpCommandFieldSize',
    'ZdpAvatarSize',
    'export type { ZdpMenuItem }',
    'export type { ZdpPaginationItem }',
    'export type { ZdpProgressSize',
    'export type { ZdpSegmentedControlItem',
    'export type { ZdpSheetPlacement',
    'ZdpLocaleSwitcherOption',
    'zdpLocaleSwitcherOptions',
    'ZdpTextScale,',
    'zdpTextScaleControlOptions',
    'shouldZdpIgnoreShortcutEvent',
    'zdpShortcutRecommendations',
    'ZdpShortcutRecommendation',
    'export type { ZdpStatusToastItem',
    'export type { ZdpToastTone',
    'export type { ZdpThemeMode',
    'export type { ZdpSortDirection',
    'export type { ZdpTermRelatedTerm',
    'export { zdpTokenNames }'
  ]) {
    if (!publicEntry.includes(requiredText)) {
      failures.push(`src/lib/index.ts is missing consumer public entry ${requiredText}.`);
    }
  }
}

async function readPackageJson(path: string): Promise<PackageJson> {
  const parsed: unknown = JSON.parse(await readFile(path, 'utf8'));

  if (!isRecord(parsed)) {
    throw new Error('package.json must be a JSON object.');
  }

  return {
    version: typeof parsed.version === 'string' ? parsed.version : undefined,
    exports: isRecord(parsed.exports) ? parsed.exports : undefined,
    files: isStringArray(parsed.files) ? parsed.files : undefined,
    sideEffects: Array.isArray(parsed.sideEffects) ? parsed.sideEffects : undefined,
    scripts: isStringRecord(parsed.scripts) ? parsed.scripts : undefined
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === 'string');
}

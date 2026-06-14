import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { compile, type Warning } from 'svelte/compiler';

interface PackageJson {
  readonly version?: string;
  readonly exports?: Record<string, unknown>;
  readonly files?: readonly string[];
  readonly sideEffects?: readonly string[];
  readonly scripts?: Record<string, string>;
}

const root = process.cwd();
const packagePath = join(root, 'package.json');
const componentPaths = [
  'src/lib/components/Accordion.svelte',
  'src/lib/components/Avatar.svelte',
  'src/lib/components/Badge.svelte',
  'src/lib/components/Breadcrumb.svelte',
  'src/lib/components/Button.svelte',
  'src/lib/components/Callout.svelte',
  'src/lib/components/Checkbox.svelte',
  'src/lib/components/CodeBlock.svelte',
  'src/lib/components/Combobox.svelte',
  'src/lib/components/CommandField.svelte',
  'src/lib/components/ConfirmAction.svelte',
  'src/lib/components/Container.svelte',
  'src/lib/components/Dialog.svelte',
  'src/lib/components/Disclosure.svelte',
  'src/lib/components/Divider.svelte',
  'src/lib/components/EmptyState.svelte',
  'src/lib/components/ErrorText.svelte',
  'src/lib/components/Field.svelte',
  'src/lib/components/Grid.svelte',
  'src/lib/components/HelpText.svelte',
  'src/lib/components/Icon.svelte',
  'src/lib/components/IconButton.svelte',
  'src/lib/components/Inline.svelte',
  'src/lib/components/InlineCode.svelte',
  'src/lib/components/Input.svelte',
  'src/lib/components/IdentityChip.svelte',
  'src/lib/components/Kbd.svelte',
  'src/lib/components/KeyValue.svelte',
  'src/lib/components/Label.svelte',
  'src/lib/components/Link.svelte',
  'src/lib/components/Menu.svelte',
  'src/lib/components/Page.svelte',
  'src/lib/components/PageHeader.svelte',
  'src/lib/components/Pagination.svelte',
  'src/lib/components/Popover.svelte',
  'src/lib/components/Progress.svelte',
  'src/lib/components/Radio.svelte',
  'src/lib/components/Section.svelte',
  'src/lib/components/Select.svelte',
  'src/lib/components/SegmentedControl.svelte',
  'src/lib/components/ShareDock.svelte',
  'src/lib/components/Sheet.svelte',
  'src/lib/components/ShortcutHint.svelte',
  'src/lib/components/Skeleton.svelte',
  'src/lib/components/SkipLink.svelte',
  'src/lib/components/SortHeader.svelte',
  'src/lib/components/Stack.svelte',
  'src/lib/components/StatusToast.svelte',
  'src/lib/components/Spinner.svelte',
  'src/lib/components/Surface.svelte',
  'src/lib/components/Switch.svelte',
  'src/lib/components/Tabs.svelte',
  'src/lib/components/Table.svelte',
  'src/lib/components/TableToolbar.svelte',
  'src/lib/components/TermSheet.svelte',
  'src/lib/components/TermTrigger.svelte',
  'src/lib/components/Textarea.svelte',
  'src/lib/components/TextScaleControl.svelte',
  'src/lib/components/ThemeToggle.svelte',
  'src/lib/components/Tooltip.svelte',
  'src/lib/components/Toast.svelte',
  'src/lib/components/Toolbar.svelte',
  'src/lib/components/VisuallyHidden.svelte',
  'stories/Buttons.svelte',
  'stories/ButtonPlayground.svelte',
  'stories/DataDisplay.svelte',
  'stories/DesignSystemOverview.svelte',
  'stories/Feedback.svelte',
  'stories/Forms.svelte',
  'stories/Interaction.svelte',
  'stories/InteractionProbe.svelte',
  'stories/Layout.svelte',
  'stories/Navigation.svelte',
  'stories/ThemeLocaleStress.svelte'
] as const;
const expectedRootExport = './dist/index.ts';
const expectedSubpathExports = {
  './styles.css': './dist/styles/index.css',
  './brand-fonts.css': './dist/styles/brand-fonts.css',
  './expressive-fonts.css': './dist/styles/expressive-fonts.css',
  './locale-fonts.css': './dist/styles/locale-fonts.css',
  './tokens': './dist/tokens/zdp.tokens.json'
} as const;
const expectedShareExport = {
  types: './dist/share.d.ts',
  import: './dist/share.js',
  default: './dist/share.js'
} as const;
const expectedPackageFiles = [
  'dist/',
  'docs/',
  'README.md',
  'CHANGELOG.md',
  'THIRD_PARTY_NOTICES.md'
] as const;
const expectedSideEffects = [
  './dist/styles/index.css',
  './dist/styles/brand-fonts.css',
  './dist/styles/expressive-fonts.css',
  './dist/styles/locale-fonts.css',
  './dist/styles/tokens.css',
  './dist/styles/components.css'
] as const;
const expectedScripts = {
  'consumer:check': 'bun scripts/check-consumer-contract.ts',
  'share-icons:generate': 'bun scripts/generate-share.ts',
  'share-icons:check': 'bun scripts/generate-share.ts --check && bun scripts/check-share-icons.ts',
  'tokens:generate': 'bun scripts/generate-tokens.ts',
  'tokens:check': 'bun scripts/generate-tokens.ts --check && bun scripts/check-tokens.ts',
  'a11y:check': 'bun scripts/check-storybook-a11y.ts',
  'package:build': 'bun scripts/generate-tokens.ts && bun scripts/generate-share.ts && bun scripts/build-package.ts',
  'package:check': 'bun scripts/check-package.ts',
  'fixtures:check': 'bun scripts/check-consumer-fixtures.ts'
} as const;
const failures: string[] = [];

const packageJson = await readPackageJson(packagePath);

checkPackageScripts(packageJson);
checkPackageExports(packageJson);
checkPackageFiles(packageJson);
checkPackageSideEffects(packageJson);
await checkSvelteCompilation();
await checkShareContract();
await checkButtonContract();
await checkSharedFocusContract();
await checkModalLayerContract();
await checkDialogFocusContract();
await checkSheetContract();
await checkExternalAdoptionContract();
await checkInteractivePrimitiveAuditContract();
await checkComboboxContract();
await checkMenuPopoverInteractionContract();
await checkTermSheetContract();

if (failures.length > 0) {
  throw new Error(`Package check failed:\n- ${failures.join('\n- ')}`);
}

function checkPackageScripts(packageJson: PackageJson): void {
  for (const [scriptName, expectedCommand] of Object.entries(expectedScripts)) {
    if (packageJson.scripts?.[scriptName] !== expectedCommand) {
      failures.push(`package.json scripts.${scriptName} must be ${expectedCommand}.`);
    }
  }

  if (!packageJson.scripts?.check?.includes('bun run package:check')) {
    failures.push('package.json check script must include package artifact validation.');
  }

  if (!packageJson.scripts?.check?.includes('bun run consumer:check')) {
    failures.push('package.json check script must include consumer contract validation.');
  }

  if (!packageJson.scripts?.check?.includes('bun run share-icons:check')) {
    failures.push('package.json check script must include share icon brand validation.');
  }

  if (!packageJson.scripts?.check?.includes('bun run package:build')) {
    failures.push('package.json check script must build the dist package before package validation.');
  }

  if (!packageJson.scripts?.check?.includes('bun run fixtures:check')) {
    failures.push('package.json check script must build the consumer fixture against dist exports.');
  }
}

function checkPackageExports(packageJson: PackageJson): void {
  const rootExport = packageJson.exports?.['.'];

  if (!isRecord(rootExport)) {
    failures.push('package.json exports["."] must be an object.');
    return;
  }

  for (const condition of ['svelte', 'types', 'default'] as const) {
    if (rootExport[condition] !== expectedRootExport) {
      failures.push(`package.json exports["."].${condition} must be ${expectedRootExport}.`);
    }
  }

  for (const [subpath, expectedPath] of Object.entries(expectedSubpathExports)) {
    if (packageJson.exports?.[subpath] !== expectedPath) {
      failures.push(`package.json exports["${subpath}"] must be ${expectedPath}.`);
      continue;
    }

    assertExistingExportTarget(expectedPath);
  }

  assertExistingExportTarget(expectedRootExport);
}

function checkPackageFiles(packageJson: PackageJson): void {
  if (!Array.isArray(packageJson.files)) {
    failures.push('package.json files must be an array.');
    return;
  }

  for (const expectedPath of expectedPackageFiles) {
    if (!packageJson.files.includes(expectedPath)) {
      failures.push(`package.json files must include ${expectedPath}.`);
    }
  }

  const shareExport = packageJson.exports?.['./share'];

  if (!isRecord(shareExport)) {
    failures.push('package.json exports["./share"] must be an object.');
  } else {
    for (const [condition, expectedPath] of Object.entries(expectedShareExport)) {
      if (shareExport[condition] !== expectedPath) {
        failures.push(`package.json exports["./share"].${condition} must be ${expectedPath}.`);
      }

      assertExistingExportTarget(expectedPath);
    }
  }

  for (const exportTarget of [
    expectedRootExport,
    ...Object.values(expectedSubpathExports),
    ...Object.values(expectedShareExport)
  ]) {
    if (!isCoveredByPackageFiles(packageJson.files, exportTarget)) {
      failures.push(`package.json files does not include export target ${exportTarget}.`);
    }
  }
}

function checkPackageSideEffects(packageJson: PackageJson): void {
  if (!Array.isArray(packageJson.sideEffects)) {
    failures.push('package.json sideEffects must be an array.');
    return;
  }

  for (const expectedPath of expectedSideEffects) {
    if (!packageJson.sideEffects.includes(expectedPath)) {
      failures.push(`package.json sideEffects must include ${expectedPath}.`);
    }

    assertExistingExportTarget(expectedPath);
  }
}

async function checkSvelteCompilation(): Promise<void> {
  for (const relativePath of componentPaths) {
    const fullPath = join(root, relativePath);
    const source = await readFile(fullPath, 'utf8');
    const warnings: Warning[] = [];

    compile(source, {
      css: 'external',
      dev: true,
      filename: relativePath,
      generate: 'client',
      warningFilter(warning) {
        warnings.push(warning);
        return false;
      }
    });

    if (warnings.length > 0) {
      for (const warning of warnings) {
        failures.push(`${relativePath} has Svelte warning ${warning.code}: ${warning.message}`);
      }
    }
  }
}

async function checkTermSheetContract(): Promise<void> {
  const relativePath = 'src/lib/components/TermSheet.svelte';
  const source = await readFile(join(root, relativePath), 'utf8');

  for (const requiredText of [
    'createZdpModalLayer',
    'modalLayer.setActive(open && term !== null, layerElement)',
    '<div class="zdp-term-layer" bind:this={layerElement}>',
    'data-zdp-ad-exclude="true"',
    'data-term-id={term.id}',
    'data-zdp-term-id={term.id}',
    'data-zdp-term-placement={resolvedPlacement}',
    'data-zdp-term-surface="sheet"',
    'data-zdp-term-id={relatedTerm.id}',
    'zdpFocusableSelector',
    'isZdpFocusableElement'
  ]) {
    if (!source.includes(requiredText)) {
      failures.push(`${relativePath} is missing TermSheet contract text ${requiredText}.`);
    }
  }

  if (source.includes('offsetParent')) {
    failures.push(`${relativePath} must not use offsetParent to decide sheet focusability.`);
  }
}

async function checkModalLayerContract(): Promise<void> {
  const relativePath = 'src/lib/modal-layer.ts';
  const source = await readFile(join(root, relativePath), 'utf8');

  for (const requiredText of [
    'zdpModalLayerRootAttribute',
    'zdpModalLayerActiveAttribute',
    'zdpModalLayerLevelAttribute',
    'createZdpModalLayer',
    'activeLayerIds',
    'body.style.overflow =',
    "root.setAttribute('data-zdp-modal-layer-count'"
  ]) {
    if (!source.includes(requiredText)) {
      failures.push(`${relativePath} is missing modal layer contract text ${requiredText}.`);
    }
  }
}

async function checkShareContract(): Promise<void> {
  const shareTypesPath = 'share.d.ts';
  const shareSourcePath = 'src/lib/share.ts';
  const shareRuntimePath = 'share.js';
  const shareTypes = await readFile(join(root, shareTypesPath), 'utf8');
  const shareSource = await readFile(join(root, shareSourcePath), 'utf8');
  const shareRuntime = await readFile(join(root, shareRuntimePath), 'utf8');
  const targetContract = "readonly target?: '_blank' | '_self' | '_parent' | '_top';";

  if (!shareTypes.includes(targetContract)) {
    failures.push(`${shareTypesPath} must keep ZdpShareDockItem.target aligned with src/lib/share.ts.`);
  }

  if (!shareSource.includes(targetContract)) {
    failures.push(`${shareSourcePath} must keep the constrained share target contract.`);
  }

  if (shareRuntime.includes('src/lib/share') || shareRuntime.includes('from ')) {
    failures.push(`${shareRuntimePath} must stay a self-contained runtime export with no TypeScript source import.`);
  }
}

async function checkButtonContract(): Promise<void> {
  const buttonPath = 'src/lib/components/Button.svelte';
  const componentCssPath = 'src/styles/components.css';
  const button = await readFile(join(root, buttonPath), 'utf8');
  const componentCss = await readFile(join(root, componentCssPath), 'utf8');

  if (!button.includes('font-weight: var(--zdp-font-weight-medium);')) {
    failures.push(`${buttonPath} must use medium label weight.`);
  }

  if (!componentCss.includes('.zdp-button {\n')) {
    failures.push(`${componentCssPath} must keep static .zdp-button styles.`);
  }

  if (!componentCss.includes('font-weight: var(--zdp-font-weight-medium);')) {
    failures.push(`${componentCssPath} must expose medium .zdp-button label weight.`);
  }
}

async function checkSharedFocusContract(): Promise<void> {
  const focusablePath = 'src/lib/focusable.ts';
  const source = await readFile(join(root, focusablePath), 'utf8');

  for (const requiredText of [
    'zdpFocusableSelector',
    'isZdpFocusableElement',
    'getClientRects().length > 0',
    "closest('[hidden], [aria-hidden=\"true\"], [inert]')",
    "window.getComputedStyle(element)"
  ]) {
    if (!source.includes(requiredText)) {
      failures.push(`${focusablePath} is missing shared focusability contract text ${requiredText}.`);
    }
  }

  if (source.includes('offsetParent')) {
    failures.push(`${focusablePath} must not use offsetParent to decide focusability.`);
  }
}

async function checkDialogFocusContract(): Promise<void> {
  const relativePath = 'src/lib/components/Dialog.svelte';
  const source = await readFile(join(root, relativePath), 'utf8');

  for (const requiredText of [
    'zdpFocusableSelector',
    'isZdpFocusableElement',
    'createZdpModalLayer',
    'modalLayer.setActive(open, layerElement)',
    '<div class="zdp-dialog" bind:this={layerElement}>'
  ]) {
    if (!source.includes(requiredText)) {
      failures.push(`${relativePath} is missing shared focusability contract text ${requiredText}.`);
    }
  }

  if (source.includes('offsetParent')) {
    failures.push(`${relativePath} must not use offsetParent to decide dialog focusability.`);
  }
}

async function checkSheetContract(): Promise<void> {
  const relativePath = 'src/lib/components/Sheet.svelte';
  const source = await readFile(join(root, relativePath), 'utf8');
  const publicEntry = await readFile(join(root, 'src/lib/index.ts'), 'utf8');
  const consumerContract = await readFile(join(root, 'docs/CONSUMER_CONTRACT.md'), 'utf8');

  for (const requiredText of [
    "import type { ZdpSheetPlacement, ZdpSheetSize }",
    'createZdpModalLayer',
    'modalLayer.setActive(open, layerElement)',
    '<div class="zdp-sheet-layer" bind:this={layerElement}>',
    'class="zdp-sheet__backdrop"',
    'class={`zdp-sheet zdp-sheet--${placement} zdp-sheet--${size}`}',
    'role="dialog"',
    'aria-modal="true"',
    'aria-labelledby={labelledBy}',
    'aria-describedby={describedBy ?? undefined}',
    'data-zdp-sheet-placement={placement}',
    'data-zdp-sheet-size={size}',
    'data-zdp-sheet-surface="sheet"',
    'zdpFocusableSelector',
    'isZdpFocusableElement',
    'closeOnEscape',
    'closeOnBackdrop',
    'restorePreviousFocus',
    'handleBackdropClick',
    'getFocusableElements',
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
    if (!source.includes(requiredText)) {
      failures.push(`${relativePath} is missing Sheet contract text ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'export { default as Sheet }',
    'export type { ZdpSheetPlacement'
  ]) {
    if (!publicEntry.includes(requiredText)) {
      failures.push(`src/lib/index.ts is missing Sheet public entry ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'Sheet는 right, left, bottom edge panel',
    '설정, 필터, 보조 흐름',
    '저장, 권한, 데이터 fetch, 라우팅 판단은 소비 앱이 계속 소유한다.'
  ]) {
    if (!consumerContract.includes(requiredText)) {
      failures.push(`docs/CONSUMER_CONTRACT.md is missing Sheet consumer contract text ${requiredText}.`);
    }
  }

  if (source.includes('offsetParent')) {
    failures.push(`${relativePath} must not use offsetParent to decide sheet focusability.`);
  }
}

async function checkExternalAdoptionContract(): Promise<void> {
  const adoptionPath = 'docs/EXTERNAL_UI_ADOPTION.md';
  const noticesPath = 'THIRD_PARTY_NOTICES.md';
  const adoption = await readFile(join(root, adoptionPath), 'utf8');
  const notices = await readFile(join(root, noticesPath), 'utf8');

  for (const requiredText of [
    '외부 UI 라이브러리는 ZDP의 dependency source가 아니라 검증 source다.',
    'Runtime Dependency',
    'Source Adapted',
    'Prohibited',
    'bits-ui` 타입, prop 이름, store shape, Tailwind class, shadcn registry 파일 구조가 ZDP public export로 새면 실패다.',
    'Tailwind Plus / Tailwind UI',
    'Provenance Template',
    'consumer fixture build'
  ]) {
    if (!adoption.includes(requiredText)) {
      failures.push(`${adoptionPath} is missing external adoption contract text ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'No third-party source code is currently copied or adapted into the package source.',
    'docs/EXTERNAL_UI_ADOPTION.md',
    'Tailwind Plus and Tailwind UI',
    'If any third-party source code is copied, ported, or meaningfully adapted later, update this file in the same change.'
  ]) {
    if (!notices.includes(requiredText)) {
      failures.push(`${noticesPath} is missing third-party notice contract text ${requiredText}.`);
    }
  }
}

async function checkInteractivePrimitiveAuditContract(): Promise<void> {
  const auditPath = 'docs/INTERACTIVE_PRIMITIVE_AUDIT.md';
  const audit = await readFile(join(root, auditPath), 'utf8');

  for (const requiredText of [
    '`Select`와 `CommandField`는 native element를 중심으로 둔 현재 구현을 유지한다.',
    '`Combobox`는 searchable single-select를 ZDP-native로 제공하되 filtering, async search, command execution, permissions는 소비 앱에 남긴다.',
    '| Combobox | ZDP custom combobox/listbox | Medium |',
    '`Menu`와 `Popover`는 가장 높은 위험군이다.',
    '| Menu | ZDP custom menu | High |',
    '| Popover | ZDP custom non-modal overlay | High |',
    'InteractionProbe는 ArrowDown open, roving focus, disabled skip, Home/End, Escape close, focus return, click select를 계속 확인한다.',
    'InteractionProbe는 ArrowDown open, disabled skip, Enter select, Escape close, listbox label, selected value sync를 계속 확인한다.',
    'InteractionProbe는 trigger focus 유지, Escape close, focus return, outside click close를 계속 확인한다.',
    'Headless Spike Trigger',
    'public API, class, token, consumer setup에 외부 철학이 새면 spike는 실패다.',
    'typeahead',
    'collision detection, flip, shift',
    'portal target'
  ]) {
    if (!audit.includes(requiredText)) {
      failures.push(`${auditPath} is missing interactive primitive audit text ${requiredText}.`);
    }
  }
}

async function checkComboboxContract(): Promise<void> {
  const relativePath = 'src/lib/components/Combobox.svelte';
  const source = await readFile(join(root, relativePath), 'utf8');
  const publicEntry = await readFile(join(root, 'src/lib/index.ts'), 'utf8');
  const consumerContract = await readFile(join(root, 'docs/CONSUMER_CONTRACT.md'), 'utf8');

  for (const requiredText of [
    "import type { ZdpComboboxOption, ZdpComboboxSize }",
    'role="combobox"',
    'aria-autocomplete="list"',
    'aria-haspopup="listbox"',
    'aria-activedescendant={activeOptionDomId ?? undefined}',
    'role="listbox"',
    'role="option"',
    'aria-selected={option.value === value}',
    'aria-disabled={option.disabled ?',
    'handleInputKeydown',
    'moveActiveOption',
    'resolveActiveOptionId',
    "let lastSelectedValue = ''",
    "let lastSelectedLabel = ''",
    'selectedOptionLabel = selectedOption?.label ??',
    'onQueryChange?.(query)',
    'const nextQuery = selectedOptionLabel || query',
    'onQueryChange?.(nextQuery)',
    'onValueChange?.(value, option)',
    '<input type="hidden" {name} {value} />',
    '.zdp-combobox',
    '.zdp-combobox__control:focus-within',
    '.zdp-combobox__option[data-active="true"]',
    '-webkit-user-select: none',
    'user-select: none'
  ]) {
    if (!source.includes(requiredText)) {
      failures.push(`${relativePath} is missing combobox contract text ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'export { default as Combobox }',
    'export type { ZdpComboboxOption'
  ]) {
    if (!publicEntry.includes(requiredText)) {
      failures.push(`src/lib/index.ts is missing Combobox public entry ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'Combobox는 검색 가능한 단일 선택',
    '실제 필터링, async search, command 실행, 권한 판단은 소비 앱이 계속 소유한다.'
  ]) {
    if (!consumerContract.includes(requiredText)) {
      failures.push(`docs/CONSUMER_CONTRACT.md is missing Combobox consumer contract text ${requiredText}.`);
    }
  }
}

async function checkMenuPopoverInteractionContract(): Promise<void> {
  const menuPath = 'src/lib/components/Menu.svelte';
  const popoverPath = 'src/lib/components/Popover.svelte';
  const menu = await readFile(join(root, menuPath), 'utf8');
  const popover = await readFile(join(root, popoverPath), 'utf8');

  for (const requiredText of [
    'handleTriggerKeydown',
    "event.key === 'ArrowDown'",
    "event.key === 'ArrowUp'",
    "event.key === 'Escape'",
    "event.key === 'Tab'",
    "'ArrowDown', 'ArrowUp', 'Home', 'End'",
    'moveActiveItem',
    'focusActiveItem',
    'restorePreviousFocus',
    'enabledItems = items.filter((item) => !item.disabled)',
    'tabindex={item.id === activeItemId && !item.disabled ? 0 : -1}',
    '<svelte:document onclick={handleDocumentClick} />'
  ]) {
    if (!menu.includes(requiredText)) {
      failures.push(`${menuPath} is missing menu interaction contract text ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'closeOnEscape = true',
    'closeOnOutside = true',
    'capturePreviousFocus',
    'restorePreviousFocus',
    'handleDocumentClick',
    'handleDocumentKeydown',
    "event.key === 'Escape'",
    '<svelte:document onclick={handleDocumentClick} onkeydown={handleDocumentKeydown} />',
    'slot name="trigger" open={open} toggle={toggle} close={close} panelId={panelId} triggerId={triggerId}',
    'role={role ?? undefined}',
    'aria-labelledby={labelledBy ?? triggerId}',
    'tabindex="-1"'
  ]) {
    if (!popover.includes(requiredText)) {
      failures.push(`${popoverPath} is missing popover interaction contract text ${requiredText}.`);
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
    sideEffects: isStringArray(parsed.sideEffects) ? parsed.sideEffects : undefined,
    scripts: isStringRecord(parsed.scripts) ? parsed.scripts : undefined
  };
}

function assertExistingExportTarget(packagePath: string): void {
  const normalizedPath = normalizePackagePath(packagePath);

  if (!existsSync(join(root, normalizedPath))) {
    failures.push(`Package target ${packagePath} does not exist.`);
  }
}

function isCoveredByPackageFiles(files: readonly string[], packagePath: string): boolean {
  const normalizedPath = normalizePackagePath(packagePath);

  return files.some((entry) => {
    const normalizedEntry = normalizePackagePath(entry);

    if (entry.endsWith('/')) {
      return normalizedPath.startsWith(`${normalizedEntry}/`);
    }

    return normalizedPath === normalizedEntry;
  });
}

function normalizePackagePath(value: string): string {
  return relative(root, join(root, value.replace(/^\.\//, ''))).replaceAll('\\', '/');
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

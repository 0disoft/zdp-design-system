import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { compile, type Warning } from 'svelte/compiler';
import {
  expectedPackageExportTargets,
  expectedPackageExports,
  validatePackageExports
} from './package-exports';

interface PackageJson {
  readonly version?: string;
  readonly license?: string;
  readonly exports?: Record<string, unknown>;
  readonly files?: readonly string[];
  readonly sideEffects?: readonly string[];
  readonly scripts?: Record<string, string>;
}

const root = process.cwd();
const packagePath = join(root, 'package.json');
const publicComponentPaths = await readPublicComponentPaths();
const storyPaths = [
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
const componentPaths = [...publicComponentPaths, ...storyPaths];
const defaultLocaleSourcePaths = [
  'src/lib/preferences.ts',
  ...publicComponentPaths
];
const expectedPackageFiles = [
  'dist/',
  'docs/',
  'README.md',
  'LICENSE',
  'CHANGELOG.md',
  'SECURITY.md',
  'THIRD_PARTY_NOTICES.md'
] as const;
const expectedDistArtifactFiles = [
  './dist/schemas/design-tokens.schema.json'
] as const;
const runtimeArtifactPaths = [
  'dist/preferences.js',
  'dist/share.js',
  'dist/shortcuts.js',
  'dist/tokens.js'
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
  'preview:check': 'bun scripts/check-preview.ts && bun run styles:parity:check',
  'styles:parity:check': 'bun scripts/check-component-style-parity.ts',
  'a11y:check': 'bun scripts/check-storybook-a11y.ts',
  'a11y:runtime:check': 'node scripts/check-storybook-runtime-a11y.mjs',
  'ssr:hydration:check': 'node scripts/check-ssr-hydration.mjs',
  'type:check': 'svelte-check --tsconfig ./tsconfig.json',
  'package:build': 'bun scripts/generate-tokens.ts && bun scripts/generate-share.ts && bun scripts/build-package.ts',
  'package:check': 'bun scripts/check-package.ts',
  'publish:check': 'bun scripts/check-publish-readiness.ts',
  'fixtures:check': 'bun scripts/check-consumer-fixtures.ts'
} as const;
const failures: string[] = [];

const packageJson = await readPackageJson(packagePath);

checkPackageScripts(packageJson);
checkPackageLicense(packageJson);
checkPackageExportsValidatorSelfTest();
checkPackageExports(packageJson);
checkPackageFiles(packageJson);
checkPackageArtifactFiles(packageJson);
checkPackageSideEffects(packageJson);
checkRuntimeArtifactImports();
await checkSvelteCompilation();
await checkEnglishDefaultTextContract();
await checkUserFacingLabelOverrideContract();
await checkShareContract();
await checkButtonContract();
await checkCardContract();
await checkSharedFocusContract();
await checkDialogStructureContract();
await checkSheetContract();
await checkAdSlotContract();
await checkExternalAdoptionContract();
await checkInteractivePrimitiveAuditContract();
await checkComboboxContract();
await checkMenuPopoverInteractionContract();
await checkTermSheetContract();
await checkOverlayTokenContract();

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

  if (!packageJson.scripts?.check?.includes('bun run publish:check')) {
    failures.push('package.json check script must include publish-readiness validation.');
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

  if (!packageJson.scripts?.check?.includes('bun run type:check')) {
    failures.push('package.json check script must include Svelte type validation.');
  }

  if (!packageJson.scripts?.check?.includes('bun run fixtures:check')) {
    failures.push('package.json check script must build the consumer fixture against dist exports.');
  }
}

function checkRuntimeArtifactImports(): void {
  const nodeExecutable = process.platform === 'win32' ? 'node.exe' : 'node';

  for (const relativePath of runtimeArtifactPaths) {
    const moduleUrl = pathToFileURL(join(root, relativePath)).href;
    const result = spawnSync(
      nodeExecutable,
      ['--input-type=module', '--eval', `await import(${JSON.stringify(moduleUrl)})`],
      {
        cwd: root,
        encoding: 'utf8',
        shell: false
      }
    );

    if (result.error) {
      failures.push(`${relativePath} could not start the Node runtime import check: ${result.error.message}`);
      continue;
    }

    if (result.status !== 0) {
      const detail = (result.stderr || result.stdout || 'unknown import failure').trim();
      failures.push(`${relativePath} must be importable by Node: ${detail}`);
    }
  }
}

async function readPublicComponentPaths(): Promise<readonly string[]> {
  const publicEntryPath = 'src/lib/index.ts';
  const source = await readFile(join(root, publicEntryPath), 'utf8');
  const matches = [
    ...source.matchAll(/export \{ default as [A-Za-z0-9_]+ \} from '\.\/components\/([^']+\.svelte)';/g)
  ];
  const paths = matches.map((match) => `src/lib/components/${match[1]}`);
  const uniquePaths = [...new Set(paths)].sort((a, b) => a.localeCompare(b));

  if (uniquePaths.length === 0) {
    throw new Error(`${publicEntryPath} must export at least one public Svelte component.`);
  }

  if (uniquePaths.length !== paths.length) {
    throw new Error(`${publicEntryPath} must not export the same Svelte component path more than once.`);
  }

  return uniquePaths;
}

function checkPackageLicense(packageJson: PackageJson): void {
  if (packageJson.license !== 'MIT') {
    failures.push('package.json license must be MIT for public repository redistribution readiness.');
  }
}

function checkPackageExports(packageJson: PackageJson): void {
  failures.push(...validatePackageExports(packageJson.exports));

  for (const exportTarget of expectedPackageExportTargets) {
    assertExistingExportTarget(exportTarget);
  }
}

function checkPackageExportsValidatorSelfTest(): void {
  const invalidExports = {
    ...expectedPackageExports,
    './internal': './src/private.ts'
  };
  const actualFailures = validatePackageExports(invalidExports);
  const expectedFailures = [
    'package.json exports["./internal"] is not an intended public export.',
    'package.json exports["./internal"] target ./src/private.ts must resolve under ./dist/**.'
  ];

  if (JSON.stringify(actualFailures) !== JSON.stringify(expectedFailures)) {
    failures.push(
      `Package exports validator negative self-test returned ${JSON.stringify(actualFailures)} instead of ${JSON.stringify(expectedFailures)}.`
    );
  }
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

  for (const exportTarget of expectedPackageExportTargets) {
    if (!isCoveredByPackageFiles(packageJson.files, exportTarget)) {
      failures.push(`package.json files does not include export target ${exportTarget}.`);
    }
  }
}

function checkPackageArtifactFiles(packageJson: PackageJson): void {
  if (!Array.isArray(packageJson.files)) {
    return;
  }

  for (const artifactPath of expectedDistArtifactFiles) {
    assertExistingExportTarget(artifactPath);

    if (!isCoveredByPackageFiles(packageJson.files, artifactPath)) {
      failures.push(`package.json files does not include package artifact ${artifactPath}.`);
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

async function checkEnglishDefaultTextContract(): Promise<void> {
  const hangulPattern = /[\uac00-\ud7af]/;

  for (const relativePath of defaultLocaleSourcePaths) {
    const source = await readFile(join(root, relativePath), 'utf8');

    if (hangulPattern.test(source)) {
      failures.push(`${relativePath} must keep component default user-facing text in English.`);
    }
  }
}

async function checkUserFacingLabelOverrideContract(): Promise<void> {
  const componentContracts: readonly {
    readonly path: string;
    readonly requiredTexts: readonly string[];
  }[] = [
    {
      path: 'src/lib/components/AdSlot.svelte',
      requiredTexts: [
        "export let label = 'Advertisement'",
        'export let fallbackText: string | null = null',
        'aria-label={label}',
        'resolvedFallbackText = fallbackText ?? label',
        '{resolvedFallbackText}'
      ]
    },
    {
      path: 'src/lib/components/CodeBlock.svelte',
      requiredTexts: [
        "export let copyLabel = 'Copy'",
        "export let copiedLabel = 'Copied'",
        "export let copyFailedLabel = 'Copy failed'",
        'copyState ===',
        '{resolvedCopyLabel}'
      ]
    },
    {
      path: 'src/lib/components/Combobox.svelte',
      requiredTexts: [
        "label = 'Search'",
        "placeholder = 'Search query'",
        "noResultsText = 'No results'",
        'const componentId = $props.id()',
        "aria-label={open ? 'Close selection' : 'Open selection'}",
        'placeholder={placeholder ?? undefined}',
        '{noResultsText}'
      ]
    },
    {
      path: 'src/lib/components/CommandField.svelte',
      requiredTexts: [
        "export let label: string | null = 'Search'",
        "export let placeholder: string | null = 'Search query'",
        'placeholder={placeholder ?? undefined}',
        'aria-label={inputAriaLabel}',
        "role={hasComboboxContract ? 'combobox' : undefined}",
        'aria-expanded={resolvedAriaExpanded ?? undefined}'
      ]
    },
    {
      path: 'src/lib/components/Dialog.svelte',
      requiredTexts: [
        "export let closeLabel = 'Close'",
        'aria-label={closeLabel}'
      ]
    },
    {
      path: 'src/lib/components/Pagination.svelte',
      requiredTexts: [
        "export let ariaLabel = 'Pagination'",
        "export let previousLabel = 'Previous'",
        "export let nextLabel = 'Next'",
        'export let pageLabel: (page: number) => string',
        'export let currentLabel: (page: number) => string',
        'aria-label={ariaLabel}',
        'aria-label={previousLabel}',
        'aria-label={nextLabel}',
        'aria-label={labelForPage(item.page)}'
      ]
    },
    {
      path: 'src/lib/components/Sheet.svelte',
      requiredTexts: [
        "export let closeLabel = 'Close'",
        'aria-label={closeLabel}'
      ]
    },
    {
      path: 'src/lib/components/StatusToast.svelte',
      requiredTexts: [
        "ariaLabel = 'Status notifications'",
        'const componentId = $props.id()',
        "dismissLabel={item.dismissLabel ?? 'Dismiss notification'}",
        'aria-label={labelledBy ? undefined : ariaLabel}'
      ]
    },
    {
      path: 'src/lib/components/TermSheet.svelte',
      requiredTexts: [
        "closeLabel = 'Close'",
        "eyebrow = 'Term'",
        "detailLabel = 'View details'",
        "relatedLabel = 'Related terms'",
        "exampleLabel = 'Example'",
        'const componentId = $props.id()',
        'aria-label={closeLabel}',
        '{eyebrow}',
        '{detailLabel}',
        'aria-label={exampleLabel}',
        'aria-label={relatedLabel}'
      ]
    },
    {
      path: 'src/lib/components/ThemeToggle.svelte',
      requiredTexts: [
        "export let lightLabel = 'Switch to light mode'",
        "export let darkLabel = 'Switch to dark mode'",
        'aria-label={ariaLabel}'
      ]
    },
    {
      path: 'src/lib/components/Toast.svelte',
      requiredTexts: [
        "export let dismissLabel = 'Dismiss notification'",
        'aria-label={dismissLabel}'
      ]
    }
  ];

  for (const contract of componentContracts) {
    const source = await readFile(join(root, contract.path), 'utf8');

    for (const requiredText of contract.requiredTexts) {
      if (!source.includes(requiredText)) {
        failures.push(`${contract.path} is missing overrideable label contract text ${requiredText}.`);
      }
    }
  }
}

async function checkTermSheetContract(): Promise<void> {
  const relativePath = 'src/lib/components/TermSheet.svelte';
  const source = await readFile(join(root, relativePath), 'utf8');

  for (const requiredText of [
    '<div class="zdp-term-layer" bind:this={layerElement}>',
    'data-zdp-ad-exclude="true"',
    'data-term-id={term.id}',
    'data-zdp-term-id={term.id}',
    'data-zdp-term-placement={resolvedPlacement}',
    'data-zdp-term-surface="sheet"',
    'data-zdp-term-id={relatedTerm.id}'
  ]) {
    if (!source.includes(requiredText)) {
      failures.push(`${relativePath} is missing TermSheet contract text ${requiredText}.`);
    }
  }

  if (source.includes('offsetParent')) {
    failures.push(`${relativePath} must not use offsetParent to decide sheet focusability.`);
  }
}

async function checkOverlayTokenContract(): Promise<void> {
  const checkedPaths = [
    'src/lib/components/Combobox.svelte',
    'src/lib/components/ConfirmAction.svelte',
    'src/lib/components/Dialog.svelte',
    'src/lib/components/Menu.svelte',
    'src/lib/components/Popover.svelte',
    'src/lib/components/ShareDock.svelte',
    'src/lib/components/Sheet.svelte',
    'src/lib/components/SkipLink.svelte',
    'src/lib/components/StatusToast.svelte',
    'src/lib/components/TermSheet.svelte',
    'src/lib/components/Tooltip.svelte',
    'src/styles/components.css'
  ] as const;

  for (const relativePath of checkedPaths) {
    const source = await readFile(join(root, relativePath), 'utf8');

    if (/z-index:\s*-?\d+\s*;/.test(source)) {
      failures.push(`${relativePath} must use named --zdp-layer-* tokens instead of raw z-index numbers.`);
    }

    if (/\b100v[hw]\b/.test(source)) {
      failures.push(`${relativePath} must use --zdp-viewport-* tokens instead of raw 100vh/100vw sizing.`);
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

async function checkCardContract(): Promise<void> {
  const cardPath = 'src/lib/components/Card.svelte';
  const componentCssPath = 'src/styles/components.css';
  const storyPath = 'stories/Layout.svelte';
  const fixturePath = 'fixtures/consumer-svelte-vite/src/App.svelte';
  const consumerContractPath = 'docs/CONSUMER_CONTRACT.md';
  const card = await readFile(join(root, cardPath), 'utf8');
  const componentCss = await readFile(join(root, componentCssPath), 'utf8');
  const story = await readFile(join(root, storyPath), 'utf8');
  const fixture = await readFile(join(root, fixturePath), 'utf8');
  const consumerContract = await readFile(join(root, consumerContractPath), 'utf8');
  const cardCssStart = componentCss.indexOf('.zdp-card {');
  const cardCssEnd = componentCss.indexOf('.zdp-card-header {');
  const cardCss = componentCss.slice(cardCssStart, cardCssEnd);

  for (const requiredText of [
    "as === 'div' && Boolean(ariaLabel?.trim() || ariaLabelledBy?.trim()) ? 'region' : undefined",
    'class={`zdp-card zdp-card--${tone} zdp-card--padding-${padding} ${hover ? \'zdp-card--hover\' : \'\'}`}',
    '.zdp-card--hover:hover'
  ]) {
    if (!card.includes(requiredText)) {
      failures.push(`${cardPath} is missing non-interactive Card contract text ${requiredText}.`);
    }
  }

  if (cardCssStart === -1 || cardCssEnd === -1 || cardCssEnd <= cardCssStart) {
    failures.push(`${componentCssPath} must keep the static Card style boundary.`);
  }

  for (const [targetPath, source] of [
    [cardPath, card],
    [componentCssPath, cardCss]
  ] as const) {
    for (const forbiddenText of ['cursor: pointer', '.zdp-card--hover:focus-visible', 'tabindex=', 'onclick=', 'onkeydown=']) {
      if (source.includes(forbiddenText)) {
        failures.push(`${targetPath} must not make Card itself interactive through ${forbiddenText}.`);
      }
    }
  }

  for (const requiredText of [
    "import Card from '../src/lib/components/Card.svelte';",
    "import CardHeader from '../src/lib/components/CardHeader.svelte';",
    '<Card ',
    '<CardHeader '
  ]) {
    if (!story.includes(requiredText)) {
      failures.push(`${storyPath} is missing Card story evidence ${requiredText}.`);
    }
  }

  for (const requiredText of ['Card,', 'CardHeader,', '<Card ', '<CardHeader ']) {
    if (!fixture.includes(requiredText)) {
      failures.push(`${fixturePath} is missing Card public-package evidence ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'Card와 CardHeader는 비상호작용 콘텐츠 컨테이너다.',
    '전체 카드 이동이나 실행은 내부 Link 또는 Button으로 명시한다.'
  ]) {
    if (!consumerContract.includes(requiredText)) {
      failures.push(`${consumerContractPath} is missing Card consumer contract text ${requiredText}.`);
    }
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

async function checkDialogStructureContract(): Promise<void> {
  const relativePath = 'src/lib/components/Dialog.svelte';
  const source = await readFile(join(root, relativePath), 'utf8');

  for (const requiredText of [
    '<div class="zdp-dialog" bind:this={layerElement}>'
  ]) {
    if (!source.includes(requiredText)) {
      failures.push(`${relativePath} is missing dialog structure contract text ${requiredText}.`);
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

async function checkAdSlotContract(): Promise<void> {
  const relativePath = 'src/lib/components/AdSlot.svelte';
  const source = await readFile(join(root, relativePath), 'utf8');
  const publicEntry = await readFile(join(root, 'src/lib/index.ts'), 'utf8');
  const consumerContract = await readFile(join(root, 'docs/CONSUMER_CONTRACT.md'), 'utf8');

  for (const requiredText of [
    "import type { ZdpAdSlotPlacement, ZdpAdSlotState }",
    "export let placement: ZdpAdSlotPlacement = 'inline'",
    "export let state: ZdpAdSlotState = 'pending'",
    "export let label = 'Advertisement'",
    'export let fallbackText: string | null = null',
    'export let minHeight: string | null = null',
    'export let reserved = true',
    'data-zdp-ad-slot',
    'data-zdp-ad-placement={placement}',
    'data-zdp-ad-state={state}',
    'data-zdp-ad-reserved={reserved ?',
    'zdp-ad-slot--reserved',
    '.zdp-ad-slot--between-sections',
    '.zdp-ad-slot--rail',
    '.zdp-ad-slot--filled',
    '.zdp-ad-slot__fallback',
    '.zdp-ad-slot--blocked',
    'normalizeIdRefs'
  ]) {
    if (!source.includes(requiredText)) {
      failures.push(`${relativePath} is missing AdSlot contract text ${requiredText}.`);
    }
  }

  for (const forbiddenText of [
    'adsbygoogle',
    'data-ad-client',
    'data-ad-slot',
    'googlesyndication',
    'ads.txt',
    'PUBLIC_AD_CLIENT_ID',
    'PUBLIC_AD_PROVIDER',
    'consent'
  ]) {
    if (source.includes(forbiddenText)) {
      failures.push(`${relativePath} must not own ad provider or consent contract text ${forbiddenText}.`);
    }
  }

  for (const requiredText of [
    'export { default as AdSlot }',
    'export type { ZdpAdSlotPlacement'
  ]) {
    if (!publicEntry.includes(requiredText)) {
      failures.push(`src/lib/index.ts is missing AdSlot public entry ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'AdSlot은 광고나 후원 자리',
    'provider script, consent, slot id, ads.txt, personalized ads 판단은 소비 앱이 계속 소유한다.'
  ]) {
    if (!consumerContract.includes(requiredText)) {
      failures.push(`docs/CONSUMER_CONTRACT.md is missing AdSlot consumer contract text ${requiredText}.`);
    }
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
    '모바일 keyboard, 긴 옵션, async option, grouped option, virtualized list, collision 반복 요구는 `Menu`, `Popover`, `Combobox` 안에서 계속 키우지 않고 `Sheet` flow 또는 headless spike로 보낸다.',
    'InteractionProbe는 ArrowDown open, roving focus, disabled skip, Home/End, Escape close, focus return, click select를 계속 확인한다.',
    'InteractionProbe와 Chromium gate는 ArrowDown open, disabled skip, Enter select, Escape close, IME composition 보호, listbox label, selected value sync를 계속 확인한다.',
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
    'event.isComposing',
    'event.keyCode === 229',
    'moveActiveOption',
    'resolveActiveOptionId',
    "let lastSelectedValue = $state('')",
    "let lastSelectedLabel = $state('')",
    'const selectedOptionLabel = $derived(',
    "selectedOption?.label ?? (value === lastSelectedValue ? lastSelectedLabel : '')",
    'onQueryChange?.(query)',
    'const nextQuery = selectedOptionLabel || query',
    'onQueryChange?.(nextQuery)',
    'onValueChange?.(value, option)',
    '<input type="hidden" {name} {value} disabled={disabled} />',
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
    'const enabledItems = $derived(items.filter((item) => !item.disabled))',
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
    license: typeof parsed.license === 'string' ? parsed.license : undefined,
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

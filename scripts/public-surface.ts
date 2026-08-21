import { zdpBrandAssets } from '../src/lib/brand-assets';
import { zdpCreditAssets } from '../src/lib/credit-assets';

export type PackageExportNode = string | PackageExportMap;

export interface PackageExportMap {
  readonly [key: string]: PackageExportNode;
}

interface PublicComponent {
  readonly name: string;
  readonly fileName: `${string}.svelte`;
}

interface PublicModule {
  readonly source: `./${string}`;
  readonly values?: readonly string[];
  readonly types?: readonly string[];
}

interface PublicPackageEntry {
  readonly subpath: string;
  readonly category: 'component' | 'runtime' | 'style' | 'token';
  readonly description: string;
  readonly target: PackageExportNode;
}

interface PackageAsset {
  readonly packagePath: string;
}

/**
 * mf:anchor zdp.design-system.public-surface-manifest
 * purpose: Locate the single source of truth for public components, helper exports, package subpaths, and generated public-surface documentation.
 * search: public surface, package exports, public barrel, generated exports, component subpaths
 * invariant: package.json exports, src/lib/index.ts, docs/PUBLIC_SURFACE.md, and package checks derive from this manifest instead of hand-maintained copies.
 * risk: config, data_consistency
 */
export const publicComponents: readonly PublicComponent[] = Object.freeze([
  { name: 'Accordion', fileName: 'Accordion.svelte' },
  { name: 'AdSlot', fileName: 'AdSlot.svelte' },
  { name: 'Avatar', fileName: 'Avatar.svelte' },
  { name: 'Badge', fileName: 'Badge.svelte' },
  { name: 'Breadcrumb', fileName: 'Breadcrumb.svelte' },
  { name: 'Button', fileName: 'Button.svelte' },
  { name: 'Callout', fileName: 'Callout.svelte' },
  { name: 'Card', fileName: 'Card.svelte' },
  { name: 'CardHeader', fileName: 'CardHeader.svelte' },
  { name: 'Checkbox', fileName: 'Checkbox.svelte' },
  { name: 'CodeBlock', fileName: 'CodeBlock.svelte' },
  { name: 'Combobox', fileName: 'Combobox.svelte' },
  { name: 'CommandField', fileName: 'CommandField.svelte' },
  { name: 'ConfirmAction', fileName: 'ConfirmAction.svelte' },
  { name: 'Container', fileName: 'Container.svelte' },
  { name: 'Dialog', fileName: 'Dialog.svelte' },
  { name: 'Disclosure', fileName: 'Disclosure.svelte' },
  { name: 'Divider', fileName: 'Divider.svelte' },
  { name: 'EmptyState', fileName: 'EmptyState.svelte' },
  { name: 'ErrorText', fileName: 'ErrorText.svelte' },
  { name: 'Field', fileName: 'Field.svelte' },
  { name: 'Grid', fileName: 'Grid.svelte' },
  { name: 'HelpText', fileName: 'HelpText.svelte' },
  { name: 'Icon', fileName: 'Icon.svelte' },
  { name: 'IconButton', fileName: 'IconButton.svelte' },
  { name: 'Inline', fileName: 'Inline.svelte' },
  { name: 'InlineCode', fileName: 'InlineCode.svelte' },
  { name: 'Input', fileName: 'Input.svelte' },
  { name: 'IdentityChip', fileName: 'IdentityChip.svelte' },
  { name: 'Kbd', fileName: 'Kbd.svelte' },
  { name: 'KeyValue', fileName: 'KeyValue.svelte' },
  { name: 'Label', fileName: 'Label.svelte' },
  { name: 'Link', fileName: 'Link.svelte' },
  { name: 'LocaleSwitcher', fileName: 'LocaleSwitcher.svelte' },
  { name: 'Menu', fileName: 'Menu.svelte' },
  { name: 'Page', fileName: 'Page.svelte' },
  { name: 'PageHeader', fileName: 'PageHeader.svelte' },
  { name: 'Pagination', fileName: 'Pagination.svelte' },
  { name: 'Popover', fileName: 'Popover.svelte' },
  { name: 'Progress', fileName: 'Progress.svelte' },
  { name: 'Radio', fileName: 'Radio.svelte' },
  { name: 'ResizableSplitPane', fileName: 'ResizableSplitPane.svelte' },
  { name: 'Section', fileName: 'Section.svelte' },
  { name: 'Select', fileName: 'Select.svelte' },
  { name: 'SegmentedControl', fileName: 'SegmentedControl.svelte' },
  { name: 'ShareDock', fileName: 'ShareDock.svelte' },
  { name: 'Sheet', fileName: 'Sheet.svelte' },
  { name: 'ShortcutHint', fileName: 'ShortcutHint.svelte' },
  { name: 'Skeleton', fileName: 'Skeleton.svelte' },
  { name: 'SkipLink', fileName: 'SkipLink.svelte' },
  { name: 'SortHeader', fileName: 'SortHeader.svelte' },
  { name: 'Stack', fileName: 'Stack.svelte' },
  { name: 'StatusToast', fileName: 'StatusToast.svelte' },
  { name: 'Spinner', fileName: 'Spinner.svelte' },
  { name: 'Surface', fileName: 'Surface.svelte' },
  { name: 'Switch', fileName: 'Switch.svelte' },
  { name: 'Tabs', fileName: 'Tabs.svelte' },
  { name: 'Table', fileName: 'Table.svelte' },
  { name: 'TableToolbar', fileName: 'TableToolbar.svelte' },
  { name: 'TermSheet', fileName: 'TermSheet.svelte' },
  { name: 'TermTrigger', fileName: 'TermTrigger.svelte' },
  { name: 'Textarea', fileName: 'Textarea.svelte' },
  { name: 'TextScaleControl', fileName: 'TextScaleControl.svelte' },
  { name: 'ThemeToggle', fileName: 'ThemeToggle.svelte' },
  { name: 'Tooltip', fileName: 'Tooltip.svelte' },
  { name: 'Toast', fileName: 'Toast.svelte' },
  { name: 'Toolbar', fileName: 'Toolbar.svelte' },
  { name: 'VisuallyHidden', fileName: 'VisuallyHidden.svelte' }
]);

export const publicModules: readonly PublicModule[] = Object.freeze([
  { source: './combobox', types: ['ZdpComboboxOption', 'ZdpComboboxSize'] },
  { source: './command', types: ['ZdpCommandFieldSize', 'ZdpCommandFieldType'] },
  { source: './input', types: ['ZdpInputType'] },
  { source: './code', types: ['ZdpCodeBlockSize', 'ZdpCodeBlockTone'] },
  {
    source: './disclosure',
    types: ['ZdpAccordionItem', 'ZdpAccordionMode', 'ZdpDisclosureHeadingLevel']
  },
  { source: './ad-slot', types: ['ZdpAdSlotPlacement', 'ZdpAdSlotState'] },
  {
    source: './identity',
    types: ['ZdpAvatarSize', 'ZdpAvatarTone', 'ZdpIdentityChipAriaCurrent', 'ZdpIdentityChipSize']
  },
  { source: './menu', types: ['ZdpMenuItem'] },
  { source: './pagination', types: ['ZdpPaginationItem'] },
  {
    source: './preferences',
    values: ['isZdpTextScale', 'zdpLocaleSwitcherOptions', 'zdpTextScaleControlOptions'],
    types: [
      'ZdpLocaleSwitcherOption',
      'ZdpLocaleSwitcherSize',
      'ZdpTextScale',
      'ZdpTextScaleControlOption',
      'ZdpTextScaleControlSize'
    ]
  },
  {
    source: './progress',
    types: ['ZdpProgressSize', 'ZdpProgressTone', 'ZdpSkeletonVariant', 'ZdpSpinnerSize']
  },
  {
    source: './split-pane',
    values: [
      'clampZdpSplitPaneSize',
      'createZdpSplitPaneController',
      'createZdpSplitPaneSizePersistence'
    ],
    types: [
      'ZdpSplitPaneController',
      'ZdpSplitPaneControllerElements',
      'ZdpSplitPaneControllerOptions',
      'ZdpSplitPaneOrientation',
      'ZdpSplitPaneResizeEvent',
      'ZdpSplitPaneSizeBounds',
      'ZdpSplitPaneSizePersistence',
      'ZdpSplitPaneSizePersistenceOptions'
    ]
  },
  { source: './segmented', types: ['ZdpSegmentedControlItem', 'ZdpSegmentedControlSize'] },
  { source: './sheet', types: ['ZdpSheetPlacement', 'ZdpSheetSize'] },
  {
    source: './shortcuts',
    values: [
      'isZdpBrowserReservedShortcut',
      'isZdpTextEntryTarget',
      'shouldZdpIgnoreShortcutEvent',
      'zdpShortcutRecommendations',
      'zdpShortcutReservedExamples'
    ],
    types: [
      'ZdpShortcutGuardOptions',
      'ZdpShortcutIntent',
      'ZdpShortcutRecommendation',
      'ZdpShortcutRisk'
    ]
  },
  { source: './toast', types: ['ZdpStatusToastItem'] },
  { source: './toast', types: ['ZdpToastTone'] },
  { source: './theme', types: ['ZdpThemeMode', 'ZdpThemeToggleSize'] },
  {
    source: './table-tools',
    types: ['ZdpSortDirection', 'ZdpTableDensity', 'ZdpTableToolbarDensityItem']
  },
  {
    source: './term',
    types: ['ZdpTermRelatedTerm', 'ZdpTermSheetPlacement', 'ZdpTermSheetTerm']
  },
  {
    source: './share',
    values: ['zdpShareIcons'],
    types: ['ZdpShareDockItem', 'ZdpShareIconName', 'ZdpShareIconShape']
  },
  {
    source: './brand-assets',
    values: ['zdpBrandAssets'],
    types: [
      'ZdpBrandAsset',
      'ZdpBrandAssetCropPolicy',
      'ZdpBrandAssetFormat',
      'ZdpBrandAssetTheme'
    ]
  },
  {
    source: './credit-assets',
    values: ['zdpCreditAssets'],
    types: [
      'ZdpCreditAsset',
      'ZdpCreditAssetFormat',
      'ZdpCreditAssetKind',
      'ZdpCreditAssetTheme',
      'ZdpCreditPackId'
    ]
  },
  { source: './tokens', values: ['zdpTokenNames'], types: ['ZdpTokenName'] }
]);

export const publicRuntimeModuleNames = Object.freeze([
  'brand-assets',
  'credit-assets',
  'preferences',
  'shortcuts',
  'split-pane',
  'tokens'
] as const);

export const publicPackageEntries: readonly PublicPackageEntry[] = Object.freeze([
  {
    subpath: '.',
    category: 'runtime',
    description: 'Compatibility root barrel for Svelte components and helpers.',
    target: {
      svelte: './dist/index.js',
      types: './dist/index.d.ts',
      import: './dist/index.js',
      default: './dist/index.js'
    }
  },
  {
    subpath: './styles.css',
    category: 'style',
    description: 'Tokens plus framework-neutral component CSS.',
    target: './dist/styles/index.css'
  },
  {
    subpath: './tokens.css',
    category: 'style',
    description: 'Design tokens without the full component stylesheet.',
    target: './dist/styles/tokens.css'
  },
  {
    subpath: './brand-fonts.css',
    category: 'style',
    description: 'Optional brand wordmark font faces.',
    target: './dist/styles/brand-fonts.css'
  },
  {
    subpath: './expressive-fonts.css',
    category: 'style',
    description: 'Optional expressive display font faces.',
    target: './dist/styles/expressive-fonts.css'
  },
  {
    subpath: './locale-fonts.css',
    category: 'style',
    description: 'Optional multilingual webfont faces.',
    target: './dist/styles/locale-fonts.css'
  },
  {
    subpath: './components/*',
    category: 'component',
    description: 'Tree-shakeable direct Svelte component imports.',
    target: {
      svelte: './dist/components/*.svelte',
      default: './dist/components/*.svelte'
    }
  },
  {
    subpath: './share',
    category: 'runtime',
    description: 'Framework-neutral share icon definitions.',
    target: {
      types: './dist/share.d.ts',
      import: './dist/share.js',
      default: './dist/share.js'
    }
  },
  {
    subpath: './brand-assets',
    category: 'runtime',
    description: 'Brand asset metadata and integrity manifest.',
    target: {
      types: './dist/brand-assets.ts',
      import: './dist/brand-assets.js',
      default: './dist/brand-assets.js'
    }
  },
  {
    subpath: './credit-assets',
    category: 'runtime',
    description: 'Credit asset metadata and integrity manifest.',
    target: {
      types: './dist/credit-assets.ts',
      import: './dist/credit-assets.js',
      default: './dist/credit-assets.js'
    }
  },
  {
    subpath: './split-pane',
    category: 'runtime',
    description: 'Framework-neutral split-pane controller helpers.',
    target: {
      types: './dist/split-pane.ts',
      import: './dist/split-pane.js',
      default: './dist/split-pane.js'
    }
  },
  {
    subpath: './tokens',
    category: 'token',
    description: 'Raw design-token JSON for tooling consumers.',
    target: './dist/tokens/zdp.tokens.json'
  }
]);

export const publicComponentSourcePaths = Object.freeze(
  publicComponents.map(({ fileName }) => `src/lib/components/${fileName}`)
);

export const publicModuleSourcePaths = Object.freeze(
  [...new Set(publicModules.map(({ source }) => `src/lib/${source.slice(2)}.ts`))]
);

export const publicAssetEntries = Object.freeze(
  [...collectPackageAssets(zdpBrandAssets), ...collectPackageAssets(zdpCreditAssets)].map(
    ({ packagePath }) => createAssetEntry(packagePath)
  )
);

export const publicAssetSourcePaths = Object.freeze(
  publicAssetEntries.map(({ subpath }) => `src/lib/${subpath.slice(2)}`)
);

export const expectedPackageExports = Object.freeze(
  Object.fromEntries(
    [...publicPackageEntries, ...publicAssetEntries].map(({ subpath, target }) => [subpath, target])
  )
) as Readonly<Record<string, PackageExportNode>>;

assertUnique('component export name', publicComponents.map(({ name }) => name));
assertUnique('component file name', publicComponents.map(({ fileName }) => fileName));
assertUnique(
  'public value export',
  [
    ...publicComponents.map(({ name }) => name),
    ...publicModules.flatMap(({ values }) => values ?? [])
  ]
);
assertUnique(
  'public type export',
  publicModules.flatMap(({ types }) => types ?? [])
);
for (const { name, fileName } of publicComponents) {
  if (fileName !== `${name}.svelte`) {
    throw new Error(`Public component ${name} must use the matching ${name}.svelte file.`);
  }
}
assertUnique(
  'package export subpath',
  [...publicPackageEntries, ...publicAssetEntries].map(({ subpath }) => subpath)
);

export function renderPublicBarrel(): string {
  const header = `/**
 * mf:anchor zdp.design-system.public-barrel
 * purpose: Locate the generated package public Svelte component and helper export surface.
 * search: public exports, package surface, Svelte components, helper exports, barrel
 * invariant: This file is generated from scripts/public-surface.ts; consumers import through package exports instead of internal src paths.
 * risk: config
 */`;
  const componentExports = publicComponents.map(
    ({ name, fileName }) => `export { default as ${name} } from './components/${fileName}';`
  );
  const moduleExports = publicModules.flatMap(({ source, values, types }) => {
    const statements: string[] = [];

    if (values !== undefined) {
      statements.push(renderNamedExport('value', values, source));
    }

    if (types !== undefined) {
      statements.push(renderNamedExport('type', types, source));
    }

    return statements;
  });

  return `${[header, ...componentExports, ...moduleExports].join('\n')}\n`;
}

export function renderPublicSurfaceDocumentation(): string {
  const packageRows = publicPackageEntries
    .filter(({ subpath }) => subpath !== './components/*')
    .map(
      ({ subpath, category, description, target }) =>
        `| \`${formatConsumerImport(subpath)}\` | ${category} | ${description} | \`${formatTarget(target)}\` |`
    );
  const componentRows = publicComponents.map(
    ({ name, fileName }) =>
      `| \`zdp-design-system/components/${name}\` | \`./dist/components/${fileName}\` | \`src/lib/components/${fileName}\` |`
  );
  const assetRows = publicAssetEntries.map(
    ({ subpath, target }) =>
      `| \`${formatConsumerImport(subpath)}\` | \`${formatTarget(target)}\` |`
  );

  return `# Public package surface

This file is generated from \`scripts/public-surface.ts\`. Do not edit it directly. Run \`bun run surface:generate\` after changing the manifest.

## Stable package entries

| Consumer import | Kind | Purpose | Package target |
| --- | --- | --- | --- |
${packageRows.join('\n')}

## Svelte component subpaths

| Consumer import | Package target | Repository source |
| --- | --- | --- |
${componentRows.join('\n')}

## Asset subpaths

Asset exports derive from the package paths in \`src/lib/brand-assets.ts\` and \`src/lib/credit-assets.ts\`.

| Consumer import | Package target |
| --- | --- |
${assetRows.join('\n')}
`;
}

function renderNamedExport(
  kind: 'type' | 'value',
  names: readonly string[],
  source: string
): string {
  if (names.length === 0) {
    throw new Error(`Public module ${source} must not declare an empty ${kind} export.`);
  }

  const prefix = kind === 'type' ? 'export type' : 'export';
  const singleLine = `${prefix} { ${names.join(', ')} } from '${source}';`;

  if (singleLine.length <= 110) {
    return singleLine;
  }

  return `${prefix} {\n${names.map((name) => `  ${name}`).join(',\n')}\n} from '${source}';`;
}

function collectPackageAssets(value: unknown): PackageAsset[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => collectPackageAssets(entry));
  }

  if (!isRecord(value)) {
    return [];
  }

  if (typeof value.packagePath === 'string') {
    return [{ packagePath: value.packagePath }];
  }

  return Object.values(value).flatMap((entry) => collectPackageAssets(entry));
}

function createAssetEntry(packagePath: string): PublicPackageEntry {
  const packagePrefix = 'zdp-design-system/';

  if (!packagePath.startsWith(packagePrefix)) {
    throw new Error(`Public asset package path must start with ${packagePrefix}: ${packagePath}`);
  }

  const relativePath = packagePath.slice(packagePrefix.length);

  const pathSegments = relativePath.split('/');

  if (
    !relativePath.startsWith('assets/') ||
    relativePath.includes('\\') ||
    pathSegments.some((segment) => segment === '' || segment === '.' || segment === '..')
  ) {
    throw new Error(`Public asset package path is invalid: ${packagePath}`);
  }

  return {
    subpath: `./${relativePath}`,
    category: 'runtime',
    description: 'Static package asset.',
    target: `./dist/${relativePath}`
  };
}

function formatConsumerImport(subpath: string): string {
  return subpath === '.' ? 'zdp-design-system' : `zdp-design-system/${subpath.slice(2)}`;
}

function formatTarget(target: PackageExportNode): string {
  if (typeof target === 'string') {
    return target;
  }

  return Object.entries(target)
    .map(([condition, value]) => `${condition}: ${formatTarget(value)}`)
    .join('; ');
}

function assertUnique(label: string, values: readonly string[]): void {
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);

  if (duplicates.length > 0) {
    throw new Error(`Duplicate ${label}: ${[...new Set(duplicates)].join(', ')}`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

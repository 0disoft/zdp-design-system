import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

interface TokenDocument {
  readonly name: string;
  readonly version: string;
  readonly color: ColorTokenGroups;
  readonly space: Record<string, string>;
  readonly radius: Record<string, string>;
  readonly font: {
    readonly family: Record<string, string>;
    readonly size: Record<string, string>;
    readonly weight: Record<string, string>;
    readonly lineHeight: Record<string, string>;
  };
  readonly type: Record<string, string>;
  readonly breakpoint: Record<string, string>;
  readonly control: Record<string, string>;
  readonly i18n: Record<string, string>;
  readonly shadow: Record<string, string>;
  readonly motion: Record<string, string>;
}

interface ColorTokenValue {
  readonly hex: string;
  readonly oklch: string;
}

interface PackageJson {
  readonly version?: string;
  readonly exports?: Record<string, unknown>;
  readonly sideEffects?: readonly unknown[];
}

type ColorTokenGroups = Record<string, Record<string, ColorTokenValue>>;

const root = process.cwd();
const packagePath = join(root, 'package.json');
const tokenPath = join(root, 'tokens', 'zdp.tokens.json');
const cssPath = join(root, 'src', 'styles', 'tokens.css');
const brandFontsPath = join(root, 'src', 'styles', 'brand-fonts.css');
const expressiveFontsPath = join(root, 'src', 'styles', 'expressive-fonts.css');
const localeFontsPath = join(root, 'src', 'styles', 'locale-fonts.css');
const publicEntryPath = join(root, 'src', 'lib', 'index.ts');
const hexColorPattern = /^#[0-9a-fA-F]{6}$/;
const oklchColorPattern = /^oklch\([^)]+\)$/;

const packageJson = await readPackageJson(packagePath);
const tokenDocument = await readTokenDocument(tokenPath);
const css = await readFile(cssPath, 'utf8');
const brandFonts = await readFile(brandFontsPath, 'utf8');
const expressiveFonts = await readFile(expressiveFontsPath, 'utf8');
const localeFonts = await readFile(localeFontsPath, 'utf8');
const publicEntry = await readFile(publicEntryPath, 'utf8');
const tokenVariables = collectCssVariableNames(tokenDocument);
const colorTokens = collectColorTokens(tokenDocument);
const failures: string[] = [];

if (packageJson.version !== '0.41.15') {
  failures.push('package.json version must be 0.41.15 for the Storybook accessibility contract.');
}

if (tokenDocument.version !== '0.6.10') {
  failures.push('Token document version must be 0.6.10 for the expressive font token contract.');
}

if (packageJson.exports?.['./brand-fonts.css'] !== './src/styles/brand-fonts.css') {
  failures.push('package.json must export ./brand-fonts.css.');
}

if (!packageJson.sideEffects?.includes('./src/styles/brand-fonts.css')) {
  failures.push('package.json sideEffects must include ./src/styles/brand-fonts.css.');
}

if (packageJson.exports?.['./expressive-fonts.css'] !== './src/styles/expressive-fonts.css') {
  failures.push('package.json must export ./expressive-fonts.css.');
}

if (!packageJson.sideEffects?.includes('./src/styles/expressive-fonts.css')) {
  failures.push('package.json sideEffects must include ./src/styles/expressive-fonts.css.');
}

if (packageJson.exports?.['./locale-fonts.css'] !== './src/styles/locale-fonts.css') {
  failures.push('package.json must export ./locale-fonts.css.');
}

if (!packageJson.sideEffects?.includes('./src/styles/locale-fonts.css')) {
  failures.push('package.json sideEffects must include ./src/styles/locale-fonts.css.');
}

for (const variable of tokenVariables) {
  if (!css.includes(`--${variable}:`)) {
    failures.push(`Missing CSS variable --${variable}.`);
  }
}

for (const { variable, token } of colorTokens) {
  if (!hasCssDeclaration(css, variable, token.hex)) {
    failures.push(`Missing hex fallback declaration --${variable}: ${token.hex};`);
  }

  if (!hasCssDeclaration(css, variable, token.oklch)) {
    failures.push(`Missing OKLCH declaration --${variable}: ${token.oklch};`);
  }
}

for (const component of [
  'Accordion',
  'Avatar',
  'Badge',
  'Breadcrumb',
  'Button',
  'Callout',
  'Checkbox',
  'CodeBlock',
  'CommandField',
  'ConfirmAction',
  'Dialog',
  'Disclosure',
  'Divider',
  'ErrorText',
  'Field',
  'Grid',
  'HelpText',
  'Icon',
  'IconButton',
  'Inline',
  'InlineCode',
  'Input',
  'IdentityChip',
  'Kbd',
  'Label',
  'Link',
  'Menu',
  'Pagination',
  'Radio',
  'Select',
  'SegmentedControl',
  'Popover',
  'Progress',
  'ShortcutHint',
  'Skeleton',
  'SkipLink',
  'SortHeader',
  'Stack',
  'StatusToast',
  'Spinner',
  'Surface',
  'Switch',
  'Tabs',
  'Table',
  'Textarea',
  'TableToolbar',
  'Tooltip',
  'Toast',
  'Toolbar',
  'VisuallyHidden'
]) {
  if (!publicEntry.includes(`export { default as ${component} }`)) {
    failures.push(`Missing public export for ${component}.`);
  }
}

if (!publicEntry.includes("export { zdpTokenNames }")) {
  failures.push('Missing zdpTokenNames public export.');
}

if (
  !tokenDocument.font.family.sans.startsWith(
    '"Pretendard Variable", Pretendard, "Manrope Variable", Manrope, '
  )
) {
  failures.push('font.family.sans must be a Pretendard Variable-first stack.');
}

if (
  !tokenDocument.font.family.display.startsWith(
    '"Pretendard Variable", Pretendard, "Manrope Variable", Manrope, '
  )
) {
  failures.push('font.family.display must be a Pretendard Variable-first stack.');
}

if (
  !tokenDocument.font.family.brand?.startsWith(
    '"Playwrite AU VIC Guides", "Pretendard Variable", Pretendard, '
  )
) {
  failures.push('font.family.brand must be a Playwrite AU VIC Guides-first wordmark stack.');
}

if (tokenDocument.font.family.display.includes('Playwrite AU VIC Guides')) {
  failures.push('font.family.display must not use the brand wordmark font.');
}

for (const [familyName, expectedText] of Object.entries({
  latin: '"Manrope Variable", Manrope, "Inter Variable", Inter',
  korean: '"Pretendard Variable", Pretendard, "Apple SD Gothic Neo"',
  chinese: '"Noto Sans SC Variable", "Noto Sans SC", "PingFang SC"',
  devanagari: '"Noto Sans Devanagari Variable", "Noto Sans Devanagari", "Nirmala UI"',
  japanese: '"Noto Sans JP Variable", "Noto Sans JP", "Hiragino Sans"',
  multiscript: '"Pretendard Variable", Pretendard, "Manrope Variable", Manrope',
  expressionScript: 'Tangerine, "Playwrite AU VIC Guides", cursive',
  expressionInscription: '"Caesar Dressing", "Fredericka the Great", fantasy',
  expressionSketch: '"Fredericka the Great", "Caesar Dressing", fantasy',
  expressionEditorial: 'Merriweather, Copse, Cardo, Georgia',
  expressionSans: '"Google Sans", Cabin, "Pretendard Variable", Pretendard',
  expressionKeyboard: '"Libertinus Keyboard", "JetBrains Mono"'
})) {
  if (!tokenDocument.font.family[familyName]?.includes(expectedText)) {
    failures.push(`font.family.${familyName} must include ${expectedText}.`);
  }
}

if (
  !css.includes(
    '@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css");'
  )
) {
  failures.push('Token CSS must load Pretendard Variable dynamic subset.');
}

if (!css.includes('font-family: var(--zdp-font-family-sans);')) {
  failures.push('Surface reset must use the sans font family by default.');
}

if (!css.includes('--zdp-font-family-brand: "Playwrite AU VIC Guides"')) {
  failures.push('Token CSS must expose --zdp-font-family-brand.');
}

for (const requiredText of [
  'font-family: "Playwrite AU VIC Guides"',
  'font-display: swap',
  'fontsource/fonts/playwrite-au-vic-guides@5.2.6/latin-400-normal.woff2',
  'fontsource/fonts/playwrite-au-vic-guides@5.2.6/latin-400-normal.woff'
]) {
  if (!brandFonts.includes(requiredText)) {
    failures.push(`Brand font CSS export is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  'https://fonts.googleapis.com/css2?',
  'family=Cabin:ital,wght@0,400..700;1,400..700',
  'family=Caesar+Dressing',
  'family=Copse',
  'family=Fredericka+the+Great',
  'family=Google+Sans',
  'family=Libertinus+Keyboard',
  'family=Merriweather:ital,wght@0,400;0,700;1,400',
  'family=Tangerine:wght@400;700',
  'display=swap'
]) {
  if (!expressiveFonts.includes(requiredText)) {
    failures.push(`Expressive font CSS export is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  '--zdp-font-family-latin',
  '--zdp-font-family-korean',
  '--zdp-font-family-chinese',
  '--zdp-font-family-devanagari',
  '--zdp-font-family-japanese',
  '--zdp-font-family-multiscript',
  '--zdp-font-family-expression-script',
  '--zdp-font-family-expression-inscription',
  '--zdp-font-family-expression-sketch',
  '--zdp-font-family-expression-editorial',
  '--zdp-font-family-expression-sans',
  '--zdp-font-family-expression-keyboard',
  '.zdp-surface-reset:lang(en)',
  '.zdp-surface-reset:lang(ko)',
  '.zdp-surface-reset:lang(zh)',
  '.zdp-surface-reset:lang(hi)',
  '.zdp-surface-reset:lang(ja)',
  'word-break: keep-all',
  'line-break: strict'
]) {
  if (!css.includes(requiredText)) {
    failures.push(`Token CSS multiscript contract is missing ${requiredText}.`);
  }
}

for (const requiredText of [
  '@fontsource-variable/manrope@5.2.8/index.css',
  '@fontsource-variable/noto-sans-sc@5.2.10/index.css',
  '@fontsource-variable/noto-sans-devanagari@5.2.8/index.css',
  '@fontsource-variable/noto-sans-jp@5.2.10/index.css'
]) {
  if (!localeFonts.includes(requiredText)) {
    failures.push(`Locale font CSS export is missing ${requiredText}.`);
  }
}

if (tokenDocument.font.lineHeight.normal !== '1.6') {
  failures.push('font.lineHeight.normal must stay 1.6 for readable product text.');
}

if (tokenDocument.type.bodyLineHeight !== '1.6') {
  failures.push('type.bodyLineHeight must stay 1.6 for readable product text.');
}

for (const [tokenName, expectedValue] of Object.entries({
  bodySize: '1.125rem',
  bodySmallSize: '1rem',
  bodySmallLineHeight: '1.6',
  pageTitleSize: '2.75rem',
  pageTitleCompactSize: '2rem',
  pageTitleLineHeight: '1.15',
  titleSize: '1.375rem',
  labelSize: '0.875rem',
  captionSize: '0.875rem',
  captionLineHeight: '1.4',
  dataSize: '1rem',
  dataLineHeight: '1.4'
})) {
  if (tokenDocument.type[tokenName] !== expectedValue) {
    failures.push(`type.${tokenName} must stay ${expectedValue} for compact product text.`);
  }
}

if (tokenDocument.radius.md !== '0.375rem') {
  failures.push('radius.md must stay 0.375rem to keep controls squared off.');
}

if (tokenDocument.radius.lg !== '0.5rem') {
  failures.push('radius.lg must stay 0.5rem so flat card surfaces read as a higher layer without shadows.');
}

if (tokenDocument.control.radius !== '0.375rem') {
  failures.push('control.radius must stay 0.375rem to keep buttons squared off.');
}

if (tokenDocument.control.borderWidth !== '1px') {
  failures.push('control.borderWidth must stay 1px for thin framed action controls.');
}

for (const [tokenName, expectedValue] of Object.entries({
  choiceSize: '1.25rem',
  choiceIndicatorSize: '0.5rem',
  switchWidth: '2.25rem',
  switchHeight: '1.25rem',
  switchThumbSize: '0.875rem',
  switchThumbOffset: '0.125rem',
  switchThumbCheckedOffset: '1.125rem',
  glyphSm: '1rem',
  glyphMd: '1.25rem',
  scrollbarSize: '0.5rem'
})) {
  if (tokenDocument.control[tokenName] !== expectedValue) {
    failures.push(`control.${tokenName} must stay ${expectedValue} for shared control sizing.`);
  }
}

for (const [tokenName, expectedValue] of Object.entries({
  focusOutlineWidth: '3px',
  focusOutlineOffset: '2px',
  focusUnderlineWidth: '3px'
})) {
  if (tokenDocument.control[tokenName] !== expectedValue) {
    failures.push(`control.${tokenName} must stay ${expectedValue} for visible keyboard focus.`);
  }
}

for (const [tokenName, expectedValue] of Object.entries({
  track: '#f1e4cc',
  thumb: '#b89a6a',
  thumbHover: '#8b6f45'
})) {
  if (tokenDocument.color.scrollbar?.[tokenName]?.hex !== expectedValue) {
    failures.push(`color.scrollbar.${tokenName}.hex must stay ${expectedValue}.`);
  }
}

for (const [tokenName, expectedValue] of Object.entries({
  surface: '#e7c97a',
  text: '#1f160d'
})) {
  if (tokenDocument.color.selection?.[tokenName]?.hex !== expectedValue) {
    failures.push(`color.selection.${tokenName}.hex must stay ${expectedValue}.`);
  }
}

for (const [tokenName, expectedValue] of Object.entries({
  surface: '#e7c97a',
  text: '#1f160d',
  line: '#1f160d'
})) {
  if (tokenDocument.color.focus?.[tokenName]?.hex !== expectedValue) {
    failures.push(`color.focus.${tokenName}.hex must stay ${expectedValue}.`);
  }
}

for (const [tokenName, expectedValue] of Object.entries({
  primary: '#d8c8ac',
  primaryStrong: '#b89a6a',
  primarySoft: '#f1e4cc',
  success: '#8a9076',
  warning: '#a9824f',
  danger: '#8b5a4d'
})) {
  if (tokenDocument.color.accent?.[tokenName]?.hex !== expectedValue) {
    failures.push(`color.accent.${tokenName}.hex must stay ${expectedValue} for the unified parchment accent contract.`);
  }
}

for (const shadowName of ['focus', 'sm', 'md']) {
  if (tokenDocument.shadow[shadowName] !== 'none') {
    failures.push(`shadow.${shadowName} must stay none for flat UI surfaces.`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(failure);
  }

  process.exitCode = 1;
}

async function readTokenDocument(path: string): Promise<TokenDocument> {
  const parsed: unknown = JSON.parse(await readFile(path, 'utf8'));

  if (!isRecord(parsed)) {
    throw new Error('Token document must be a JSON object.');
  }

  if ('gradient' in parsed) {
    throw new Error('Token document must not define gradient tokens for core UI surfaces.');
  }

  assertString(parsed.name, 'name');
  assertString(parsed.version, 'version');

  return {
    name: parsed.name,
    version: parsed.version,
    color: assertColorGroups(parsed.color, 'color'),
    space: assertStringRecord(parsed.space, 'space'),
    radius: assertStringRecord(parsed.radius, 'radius'),
    font: {
      family: assertStringRecord(readRequiredRecord(parsed.font, 'font').family, 'font.family'),
      size: assertStringRecord(readRequiredRecord(parsed.font, 'font').size, 'font.size'),
      weight: assertStringRecord(readRequiredRecord(parsed.font, 'font').weight, 'font.weight'),
      lineHeight: assertStringRecord(
        readRequiredRecord(parsed.font, 'font').lineHeight,
        'font.lineHeight'
      )
    },
    type: assertStringRecord(parsed.type, 'type'),
    breakpoint: assertStringRecord(parsed.breakpoint, 'breakpoint'),
    control: assertStringRecord(parsed.control, 'control'),
    i18n: assertStringRecord(parsed.i18n, 'i18n'),
    shadow: assertStringRecord(parsed.shadow, 'shadow'),
    motion: assertStringRecord(parsed.motion, 'motion')
  };
}

async function readPackageJson(path: string): Promise<PackageJson> {
  const parsed: unknown = JSON.parse(await readFile(path, 'utf8'));

  if (!isRecord(parsed)) {
    throw new Error('package.json must be a JSON object.');
  }

  return {
    version: typeof parsed.version === 'string' ? parsed.version : undefined,
    exports: isRecord(parsed.exports) ? parsed.exports : undefined,
    sideEffects: Array.isArray(parsed.sideEffects) ? parsed.sideEffects : undefined
  };
}

function collectCssVariableNames(tokens: TokenDocument): readonly string[] {
  return [
    ...collectNestedNames('color', tokens.color),
    ...collectNames('space', tokens.space),
    ...collectNames('radius', tokens.radius),
    ...collectNames('font-family', tokens.font.family),
    ...collectNames('font-size', tokens.font.size),
    ...collectNames('font-weight', tokens.font.weight),
    ...collectNames('font-line-height', tokens.font.lineHeight),
    ...collectNames('type', tokens.type),
    ...collectNames('breakpoint', tokens.breakpoint),
    ...collectNames('control', tokens.control),
    ...collectNames('i18n', tokens.i18n),
    ...collectNames('shadow', tokens.shadow),
    ...collectNames('motion', tokens.motion)
  ];
}

function collectColorTokens(
  tokens: TokenDocument
): readonly { readonly variable: string; readonly token: ColorTokenValue }[] {
  return Object.entries(tokens.color).flatMap(([group, entries]) =>
    Object.entries(entries).map(([key, token]) => ({
      variable: `zdp-color-${toKebabCase(group)}-${toKebabCase(key)}`,
      token
    }))
  );
}

function collectNames(prefix: string, values: Record<string, string>): readonly string[] {
  return Object.keys(values).map((key) => `zdp-${prefix}-${toKebabCase(key)}`);
}

function collectNestedNames(
  prefix: string,
  values: Record<string, Record<string, unknown>>
): readonly string[] {
  return Object.entries(values).flatMap(([group, entries]) =>
    Object.keys(entries).map((key) => `zdp-${prefix}-${toKebabCase(group)}-${toKebabCase(key)}`)
  );
}

function assertString(value: unknown, path: string): asserts value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Token field ${path} must be a non-empty string.`);
  }
}

function assertStringRecord(value: unknown, path: string): Record<string, string> {
  const record = readRequiredRecord(value, path);

  for (const [key, entry] of Object.entries(record)) {
    if (typeof entry !== 'string' || entry.trim().length === 0) {
      throw new Error(`Token field ${path}.${key} must be a non-empty string.`);
    }
  }

  return record as Record<string, string>;
}

function assertColorGroups(
  value: unknown,
  path: string
): ColorTokenGroups {
  const record = readRequiredRecord(value, path);
  const output: ColorTokenGroups = {};

  for (const [key, entry] of Object.entries(record)) {
    output[key] = assertColorRecord(entry, `${path}.${key}`);
  }

  return output;
}

function assertColorRecord(value: unknown, path: string): Record<string, ColorTokenValue> {
  const record = readRequiredRecord(value, path);
  const output: Record<string, ColorTokenValue> = {};

  for (const [key, entry] of Object.entries(record)) {
    output[key] = assertColorTokenValue(entry, `${path}.${key}`);
  }

  return output;
}

function assertColorTokenValue(value: unknown, path: string): ColorTokenValue {
  const record = readRequiredRecord(value, path);
  const hex = record.hex;
  const oklch = record.oklch;

  assertString(hex, `${path}.hex`);
  assertString(oklch, `${path}.oklch`);

  if (!hexColorPattern.test(hex)) {
    throw new Error(`Token field ${path}.hex must be a six-digit hex color.`);
  }

  if (!oklchColorPattern.test(oklch)) {
    throw new Error(`Token field ${path}.oklch must be an oklch(...) color.`);
  }

  return { hex, oklch };
}

function readRequiredRecord(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`Token field ${path} must be a JSON object.`);
  }

  return value;
}

function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function hasCssDeclaration(cssText: string, variable: string, value: string): boolean {
  const pattern = new RegExp(`--${escapeRegExp(variable)}:\\s*${escapeRegExp(value)}\\s*;`);
  return pattern.test(cssText);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

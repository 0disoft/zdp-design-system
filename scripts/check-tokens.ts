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

type ColorTokenGroups = Record<string, Record<string, ColorTokenValue>>;

const root = process.cwd();
const tokenPath = join(root, 'tokens', 'zdp.tokens.json');
const cssPath = join(root, 'src', 'styles', 'tokens.css');
const publicEntryPath = join(root, 'src', 'lib', 'index.ts');
const hexColorPattern = /^#[0-9a-fA-F]{6}$/;
const oklchColorPattern = /^oklch\([^)]+\)$/;

const tokenDocument = await readTokenDocument(tokenPath);
const css = await readFile(cssPath, 'utf8');
const publicEntry = await readFile(publicEntryPath, 'utf8');
const tokenVariables = collectCssVariableNames(tokenDocument);
const colorTokens = collectColorTokens(tokenDocument);
const failures: string[] = [];

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

for (const component of ['Button', 'IconButton', 'Surface']) {
  if (!publicEntry.includes(`export { default as ${component} }`)) {
    failures.push(`Missing public export for ${component}.`);
  }
}

if (!publicEntry.includes("export { zdpTokenNames }")) {
  failures.push('Missing zdpTokenNames public export.');
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

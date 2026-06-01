import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

interface TokenDocument {
  readonly name: string;
  readonly version: string;
  readonly color: Record<string, Record<string, string>>;
  readonly space: Record<string, string>;
  readonly radius: Record<string, string>;
  readonly font: {
    readonly family: Record<string, string>;
    readonly size: Record<string, string>;
    readonly weight: Record<string, string>;
    readonly lineHeight: Record<string, string>;
  };
  readonly shadow: Record<string, string>;
  readonly motion: Record<string, string>;
}

const root = process.cwd();
const tokenPath = join(root, 'tokens', 'zdp.tokens.json');
const cssPath = join(root, 'src', 'styles', 'tokens.css');
const publicEntryPath = join(root, 'src', 'lib', 'index.ts');

const tokenDocument = await readTokenDocument(tokenPath);
const css = await readFile(cssPath, 'utf8');
const publicEntry = await readFile(publicEntryPath, 'utf8');
const tokenVariables = collectCssVariableNames(tokenDocument);
const failures: string[] = [];

for (const variable of tokenVariables) {
  if (!css.includes(`--${variable}:`)) {
    failures.push(`Missing CSS variable --${variable}.`);
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
    color: assertNestedStringRecord(parsed.color, 'color'),
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
    ...collectNames('shadow', tokens.shadow),
    ...collectNames('motion', tokens.motion)
  ];
}

function collectNames(prefix: string, values: Record<string, string>): readonly string[] {
  return Object.keys(values).map((key) => `zdp-${prefix}-${toKebabCase(key)}`);
}

function collectNestedNames(
  prefix: string,
  values: Record<string, Record<string, string>>
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

function assertNestedStringRecord(
  value: unknown,
  path: string
): Record<string, Record<string, string>> {
  const record = readRequiredRecord(value, path);
  const output: Record<string, Record<string, string>> = {};

  for (const [key, entry] of Object.entries(record)) {
    output[key] = assertStringRecord(entry, `${path}.${key}`);
  }

  return output;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

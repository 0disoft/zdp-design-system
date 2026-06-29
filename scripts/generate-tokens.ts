import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const tokenPath = resolve(repoRoot, 'tokens/zdp.tokens.json');
const outputPath = resolve(repoRoot, 'src/lib/tokens.ts');
const checkOnly = process.argv.includes('--check');

type TokenTree = Record<string, unknown>;

/**
 * mf:anchor zdp.design-system.token-name-generation
 * purpose: Locate the token JSON to generated token-name module boundary.
 * search: tokens, zdpTokenNames, token generation, design token source
 * invariant: Generated token names mirror tokens/zdp.tokens.json without hand edits.
 * risk: data_consistency
 */
function isRecord(value: unknown): value is TokenTree {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function flattenTokenNames(node: unknown, prefix: string[] = []): string[] {
  if (!isRecord(node)) {
    return prefix.length > 0 ? [prefix.join('.')] : [];
  }

  if ('$value' in node || ('hex' in node && 'oklch' in node)) {
    return [prefix.join('.')];
  }

  return Object.entries(node).flatMap(([key, value]) => {
    if (prefix.length === 0 && key.startsWith('$')) {
      return [];
    }

    if (prefix.length === 0 && (key === 'name' || key === 'version')) {
      return [];
    }

    return flattenTokenNames(value, [...prefix, key]);
  });
}

function renderTokenModule(tokenNames: readonly string[]): string {
  const body = tokenNames.map((name) => `  '${name}'`).join(',\n');

  return `export const zdpTokenNames = [\n${body}\n] as const;\n\nexport type ZdpTokenName = (typeof zdpTokenNames)[number];\n`;
}

const tokenJson = JSON.parse(await readFile(tokenPath, 'utf8')) as unknown;
const tokenNames = flattenTokenNames(tokenJson);
const nextContent = renderTokenModule(tokenNames);

if (checkOnly) {
  const currentContent = await readFile(outputPath, 'utf8');

  if (currentContent !== nextContent) {
    console.error('src/lib/tokens.ts is out of sync with tokens/zdp.tokens.json. Run `bun run tokens:generate`.');
    process.exit(1);
  }
} else {
  await writeFile(outputPath, nextContent);
}

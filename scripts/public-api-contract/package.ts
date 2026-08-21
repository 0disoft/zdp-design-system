import { isArrayLiteralExpression, isIdentifier, isStringLiteral, isVariableStatement } from 'typescript';
import { duplicates, isRecord, parseTs, unwrapExpression } from './ast';
import type { PackageExportLeaf } from './types';

interface PackageJsonShape {
  readonly name?: unknown;
  readonly version?: unknown;
  readonly exports?: unknown;
}

export function parsePackageJson(source: string, label: string): {
  readonly name: string;
  readonly version: string;
  readonly exports: readonly PackageExportLeaf[];
} {
  let value: PackageJsonShape;
  try {
    value = JSON.parse(source) as PackageJsonShape;
  } catch (error) {
    throw new Error(`Could not parse ${label}: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (typeof value.name !== 'string' || !value.name.trim()) {
    throw new Error(`${label} must contain a non-empty package name.`);
  }
  if (typeof value.version !== 'string') {
    throw new Error(`${label} must contain a string package version.`);
  }
  parseSemver(value.version);
  return { name: value.name, version: value.version, exports: flattenExports(value.exports) };
}

export function parseTokenNames(source: string, label: string): readonly string[] {
  const file = parseTs(label, source);
  for (const statement of file.statements) {
    if (!isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!isIdentifier(declaration.name) || declaration.name.text !== 'zdpTokenNames' || !declaration.initializer) {
        continue;
      }
      const initializer = unwrapExpression(declaration.initializer);
      if (!isArrayLiteralExpression(initializer)) throw new Error(`${label} zdpTokenNames must be an array literal.`);
      const tokens = initializer.elements.map((element) => {
        if (!isStringLiteral(element)) throw new Error(`${label} token names must be string literals.`);
        return element.text;
      });
      const repeated = duplicates(tokens);
      if (repeated.length) throw new Error(`${label} contains duplicate tokens: ${repeated.join(', ')}.`);
      return [...tokens].sort((a, b) => a.localeCompare(b));
    }
  }
  throw new Error(`${label} must declare zdpTokenNames.`);
}

export function parseSemver(version: string): { readonly major: number; readonly minor: number; readonly patch: number } {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.exec(version);
  if (!match?.[1] || !match[2] || !match[3]) throw new Error(`Invalid semantic version: ${version}.`);
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

function flattenExports(value: unknown): readonly PackageExportLeaf[] {
  if (!isRecord(value)) throw new Error('package.json exports must be an object.');
  const leaves: PackageExportLeaf[] = [];
  for (const exportPath of Object.keys(value).sort()) {
    if (exportPath !== '.' && !exportPath.startsWith('./')) {
      throw new Error(`Invalid package export key: ${exportPath}.`);
    }
    flattenNode(exportPath, [], value[exportPath], leaves);
  }
  return leaves.sort((a, b) => exportKey(a).localeCompare(exportKey(b)));
}

function flattenNode(
  exportPath: string,
  conditions: readonly string[],
  value: unknown,
  leaves: PackageExportLeaf[]
): void {
  if (typeof value === 'string') {
    leaves.push({ exportPath, conditions: [...conditions], target: value });
    return;
  }
  if (!isRecord(value)) {
    throw new Error(`Export ${exportPath}${conditions.map((item) => `[${item}]`).join('')} must resolve to a string or object.`);
  }
  for (const condition of Object.keys(value)) {
    flattenNode(exportPath, [...conditions, condition], value[condition], leaves);
  }
}

export function exportKey(entry: PackageExportLeaf): string {
  return [entry.exportPath, ...entry.conditions].join('\u0000');
}

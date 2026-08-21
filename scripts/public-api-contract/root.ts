import {
  NodeFlags,
  isClassDeclaration,
  isEnumDeclaration,
  isExportAssignment,
  isExportDeclaration,
  isFunctionDeclaration,
  isIdentifier,
  isInterfaceDeclaration,
  isNamedExports,
  isStringLiteral,
  isTypeAliasDeclaration,
  isVariableStatement,
  type SourceFile
} from 'typescript';
import { duplicates, normalize, parseTs, printNode } from './ast';
import type { RootExportContract, SourceReader } from './types';

export const componentSpecifierPattern = /^\.\/components\/([^/]+\.svelte)$/;

export function parseRootExports(source: string, label: string): readonly RootExportContract[] {
  const file = parseTs(label, source);
  const entries: RootExportContract[] = [];
  for (const statement of file.statements) {
    if (isExportAssignment(statement)) throw new Error(`${label} must not use export default assignments.`);
    if (!isExportDeclaration(statement)) continue;
    if (!statement.moduleSpecifier || !isStringLiteral(statement.moduleSpecifier)) {
      throw new Error(`${label} public exports need an explicit module source.`);
    }
    if (!statement.exportClause || !isNamedExports(statement.exportClause)) {
      throw new Error(`${label} must not use wildcard or namespace exports.`);
    }
    for (const item of statement.exportClause.elements) {
      entries.push({
        name: item.name.text,
        importedName: item.propertyName?.text ?? item.name.text,
        kind: statement.isTypeOnly || item.isTypeOnly ? 'type' : 'value',
        source: statement.moduleSpecifier.text,
        signature: null
      });
    }
  }
  const repeated = duplicates(entries.map((item) => `${item.kind}:${item.name}`));
  if (repeated.length) throw new Error(`${label} has duplicate public exports: ${repeated.join(', ')}.`);
  return entries.sort((a, b) => a.name.localeCompare(b.name) || a.kind.localeCompare(b.kind));
}

export async function resolveRootSignatures(
  reader: SourceReader,
  entries: readonly RootExportContract[]
): Promise<readonly RootExportContract[]> {
  const modules = new Map<string, Promise<{ readonly source: string; readonly file: SourceFile }>>();
  return Promise.all(entries.map(async (entry) => {
    if (componentSpecifierPattern.test(entry.source)) return entry;
    const path = modulePath(entry.source);
    let pending = modules.get(path);
    if (!pending) {
      pending = reader.readText(path).then((source) => ({ source, file: parseTs(`${reader.label}:${path}`, source) }));
      modules.set(path, pending);
    }
    const module = await pending;
    return { ...entry, signature: declarationSignature(module.source, module.file, entry) };
  }));
}

function modulePath(source: string): string {
  if (!source.startsWith('./') || source.includes('\\') || source.split('/').some((part) => part === '..')) {
    throw new Error(`Public source ${source} must be repository-local.`);
  }
  const relative = source.slice(2);
  if (!/^[A-Za-z0-9_./-]+$/.test(relative)) throw new Error(`Unsupported public source: ${source}.`);
  return `src/lib/${relative.endsWith('.ts') ? relative : `${relative}.ts`}`;
}

function declarationSignature(source: string, file: SourceFile, entry: RootExportContract): string {
  const signatures: string[] = [];
  for (const statement of file.statements) {
    if (entry.kind === 'value' && isVariableStatement(statement)) {
      const keyword = (statement.declarationList.flags & NodeFlags.Const) !== 0
        ? 'const'
        : (statement.declarationList.flags & NodeFlags.Let) !== 0 ? 'let' : 'var';
      for (const declaration of statement.declarationList.declarations) {
        if (isIdentifier(declaration.name) && declaration.name.text === entry.importedName) {
          signatures.push(`${keyword} ${printNode(declaration, file)}`);
        }
      }
      continue;
    }
    if (entry.kind === 'value' && isFunctionDeclaration(statement) && statement.name?.text === entry.importedName) {
      if (statement.body) {
        signatures.push(`${normalize(source.slice(statement.getStart(file), statement.body.getStart(file)))};`);
      } else {
        signatures.push(printNode(statement, file));
      }
      continue;
    }
    if (
      entry.kind === 'type' &&
      (isInterfaceDeclaration(statement) || isTypeAliasDeclaration(statement)) &&
      statement.name.text === entry.importedName
    ) {
      signatures.push(printNode(statement, file));
      continue;
    }
    if (
      entry.kind === 'value' &&
      (isClassDeclaration(statement) || isEnumDeclaration(statement)) &&
      statement.name?.text === entry.importedName
    ) {
      signatures.push(printNode(statement, file));
    }
  }
  if (!signatures.length) {
    throw new Error(`${file.fileName} must directly declare ${entry.kind} export ${entry.importedName}.`);
  }
  return signatures.join(' ');
}

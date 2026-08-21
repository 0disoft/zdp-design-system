import {
  EmitHint,
  ScriptKind,
  ScriptTarget,
  createPrinter,
  createSourceFile,
  isAsExpression,
  isParenthesizedExpression,
  isSatisfiesExpression,
  type Expression,
  type Node,
  type SourceFile,
  type TypeNode
} from 'typescript';

const printer = createPrinter({ removeComments: true });

export function parseTs(label: string, source: string): SourceFile {
  return createSourceFile(label, source, ScriptTarget.Latest, true, ScriptKind.TS);
}

export function printType(node: TypeNode, sourceFile: SourceFile): string {
  return normalize(printer.printNode(EmitHint.Unspecified, node, sourceFile));
}

export function printExpression(node: Expression, sourceFile: SourceFile): string {
  return normalize(printer.printNode(EmitHint.Expression, node, sourceFile));
}

export function printNode(node: Node, sourceFile: SourceFile): string {
  return normalize(printer.printNode(EmitHint.Unspecified, node, sourceFile));
}

export function unwrapExpression(expression: Expression): Expression {
  let current = expression;
  while (isParenthesizedExpression(current) || isAsExpression(current) || isSatisfiesExpression(current)) {
    current = current.expression;
  }
  return current;
}

export function normalize(value: string): string {
  return value.replace(/\s+/g, ' ').replace(/\s*([,;:?(){}<>|=&])\s*/g, '$1').trim();
}

export function containsIdentifier(source: string, identifier: string): boolean {
  const escaped = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`).test(source);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function duplicates(values: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const duplicate = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicate.add(value);
    seen.add(value);
  }
  return [...duplicate].sort((a, b) => a.localeCompare(b));
}

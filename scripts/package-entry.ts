import {
  DiagnosticCategory,
  ModuleKind,
  ScriptKind,
  ScriptTarget,
  SyntaxKind,
  canHaveModifiers,
  createSourceFile,
  flattenDiagnosticMessageText,
  getModifiers,
  isExportDeclaration,
  transpileModule,
  type Statement
} from 'typescript';

export function createPublicRuntimeEntry(source: string): string {
  return rewriteRuntimeExportSpecifiers(
    transpileTypescript(createPublicTypeEntry(source), 'src/lib/index.ts')
  );
}

export function createPublicTypeEntry(source: string): string {
  const sourceFile = createSourceFile(
    'src/lib/index.ts',
    source,
    ScriptTarget.Latest,
    true,
    ScriptKind.TS
  );

  return sourceFile.statements
    .filter(isPublicExportStatement)
    .map((statement) => source.slice(statement.getFullStart(), statement.end).trim())
    .join('\n');
}

export function createRuntimeModule(source: string, fileName: string): string {
  return transpileTypescript(source, fileName);
}

function isPublicExportStatement(statement: Statement): boolean {
  if (isExportDeclaration(statement)) {
    return true;
  }

  return canHaveModifiers(statement) && getModifiers(statement)?.some(
    (modifier) => modifier.kind === SyntaxKind.ExportKeyword
  ) === true;
}

function rewriteRuntimeExportSpecifiers(source: string): string {
  return source.replace(/from (["'])(\.[^"']+)\1/g, (_match, quote: string, specifier: string) => {
    if (specifier.endsWith('.svelte') || specifier.endsWith('.js')) {
      return `from ${quote}${specifier}${quote}`;
    }

    return `from ${quote}${specifier}.js${quote}`;
  });
}

function transpileTypescript(source: string, fileName: string): string {
  const result = transpileModule(source, {
    fileName,
    reportDiagnostics: true,
    compilerOptions: {
      module: ModuleKind.ESNext,
      target: ScriptTarget.ES2022,
      verbatimModuleSyntax: true
    }
  });
  const errors = result.diagnostics?.filter(
    (diagnostic) => diagnostic.category === DiagnosticCategory.Error
  ) ?? [];

  if (errors.length > 0) {
    const messages = errors.map((diagnostic) =>
      flattenDiagnosticMessageText(diagnostic.messageText, '\n')
    );
    throw new Error(`TypeScript transpilation failed for ${fileName}:\n- ${messages.join('\n- ')}`);
  }

  return result.outputText;
}

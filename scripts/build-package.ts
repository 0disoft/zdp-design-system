import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DiagnosticCategory,
  ModuleKind,
  ScriptKind,
  ScriptTarget,
  createSourceFile,
  flattenDiagnosticMessageText,
  isExportDeclaration,
  transpileModule
} from 'typescript';

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distRoot = resolve(repoRoot, 'dist');
const runtimeModuleNames = ['preferences', 'shortcuts', 'split-pane', 'tokens'] as const;

function assertInsideRepo(path: string): void {
  const normalizedRepo = repoRoot.endsWith(sep) ? repoRoot : `${repoRoot}${sep}`;

  if (path !== repoRoot && !path.startsWith(normalizedRepo)) {
    throw new Error(`Refusing to write outside repository: ${path}`);
  }
}

assertInsideRepo(distRoot);

await rm(distRoot, { force: true, recursive: true });
await mkdir(distRoot, { recursive: true });

await cp(resolve(repoRoot, 'src/lib'), distRoot, { recursive: true });
await cp(resolve(repoRoot, 'src/styles'), resolve(distRoot, 'styles'), { recursive: true });
await cp(resolve(repoRoot, 'tokens'), resolve(distRoot, 'tokens'), { recursive: true });
await cp(resolve(repoRoot, 'schemas'), resolve(distRoot, 'schemas'), { recursive: true });
await cp(resolve(repoRoot, 'share.js'), resolve(distRoot, 'share.js'));
await cp(resolve(repoRoot, 'share.d.ts'), resolve(distRoot, 'share.d.ts'));

const publicEntrySource = await readFile(resolve(repoRoot, 'src/lib/index.ts'), 'utf8');

/**
 * mf:anchor zdp.design-system.package-entry-generation
 * purpose: Locate generation of package runtime and type entrypoints from the public barrel.
 * search: package build, dist index, public entry, runtime module, type entry
 * invariant: Dist entrypoints preserve the public barrel contract and avoid exposing internal source paths.
 * risk: config
 */
await writeFile(resolve(distRoot, 'index.js'), createPublicRuntimeEntry(publicEntrySource));
await writeFile(resolve(distRoot, 'index.d.ts'), createPublicTypeEntry(publicEntrySource));

for (const moduleName of runtimeModuleNames) {
  const source = await readFile(resolve(repoRoot, `src/lib/${moduleName}.ts`), 'utf8');
  await writeFile(resolve(distRoot, `${moduleName}.js`), createRuntimeModule(source, moduleName));
}

function createPublicRuntimeEntry(source: string): string {
  return rewriteRuntimeExportSpecifiers(
    transpileTypescript(createPublicTypeEntry(source), 'src/lib/index.ts')
  );
}

function createPublicTypeEntry(source: string): string {
  const sourceFile = createSourceFile(
    'src/lib/index.ts',
    source,
    ScriptTarget.Latest,
    true,
    ScriptKind.TS
  );

  return sourceFile.statements
    .filter(isExportDeclaration)
    .map((statement) => source.slice(statement.getFullStart(), statement.end).trim())
    .join('\n');
}

function rewriteRuntimeExportSpecifiers(source: string): string {
  return source.replace(/from (["'])(\.\/[^"']+)\1/g, (_match, quote: string, specifier: string) => {
    if (specifier.endsWith('.svelte') || specifier.endsWith('.js')) {
      return `from ${quote}${specifier}${quote}`;
    }

    return `from ${quote}${specifier}.js${quote}`;
  });
}

function createRuntimeModule(source: string, moduleName: (typeof runtimeModuleNames)[number]): string {
  return transpileTypescript(source, `src/lib/${moduleName}.ts`);
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

for (const moduleName of runtimeModuleNames) {
  const outputPath = resolve(distRoot, `${moduleName}.js`);
  assertInsideRepo(outputPath);

  if (basename(outputPath) !== `${moduleName}.js`) {
    throw new Error(`Unexpected runtime module output path: ${outputPath}`);
  }
}

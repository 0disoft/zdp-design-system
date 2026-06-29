import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distRoot = resolve(repoRoot, 'dist');
const runtimeModuleNames = ['preferences', 'shortcuts', 'tokens'] as const;

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
  return parseExportStatements(source)
    .filter((statement) => !statement.startsWith('export type '))
    .map(rewriteRuntimeExportSpecifier)
    .join('\n');
}

function createPublicTypeEntry(source: string): string {
  return parseExportStatements(source).join('\n');
}

function parseExportStatements(source: string): readonly string[] {
  const statements: string[] = [];
  let current = '';

  for (const line of source.split(/\r?\n/)) {
    if (current.length === 0 && !line.startsWith('export ')) {
      continue;
    }

    current = current.length === 0 ? line : `${current}\n${line}`;

    if (line.trimEnd().endsWith(';')) {
      statements.push(current);
      current = '';
    }
  }

  if (current.trim().length > 0) {
    throw new Error('Unterminated export statement in src/lib/index.ts.');
  }

  return statements;
}

function rewriteRuntimeExportSpecifier(statement: string): string {
  return statement.replace(/from '(\.\/[^']+)'/g, (_match, specifier: string) => {
    if (specifier.endsWith('.svelte') || specifier.endsWith('.js')) {
      return `from '${specifier}'`;
    }

    return `from '${specifier}.js'`;
  });
}

function createRuntimeModule(source: string, moduleName: (typeof runtimeModuleNames)[number]): string {
  if (moduleName === 'preferences') {
    return stripPreferencesTypes(source);
  }

  if (moduleName === 'shortcuts') {
    return stripShortcutsTypes(source);
  }

  return stripTokenTypes(source);
}

function stripPreferencesTypes(source: string): string {
  return source
    .replace(/export type ZdpTextScale = [\s\S]*?;\n\n/g, '')
    .replace(/export type ZdpTextScaleControlSize = [\s\S]*?;\n\n/g, '')
    .replace(/export type ZdpLocaleSwitcherSize = [\s\S]*?;\n\n/g, '')
    .replace(/export interface ZdpLocaleSwitcherOption [\s\S]*?\n}\n\n/g, '')
    .replace(/export interface ZdpTextScaleControlOption [\s\S]*?\n}\n\n/g, '')
    .replace(/\] as const satisfies readonly ZdpTextScaleControlOption\[];/g, '];')
    .replace(/\] as const satisfies readonly ZdpLocaleSwitcherOption\[];/g, '];')
    .replace(
      /export function isZdpTextScale\(value: string \| null \| undefined\): value is ZdpTextScale/g,
      'export function isZdpTextScale(value)'
    );
}

function stripShortcutsTypes(source: string): string {
  return source
    .replace(/export type ZdpShortcutIntent =[\s\S]*?;\n\n/g, '')
    .replace(/export type ZdpShortcutRisk =[\s\S]*?;\n\n/g, '')
    .replace(/export interface ZdpShortcutRecommendation [\s\S]*?\n}\n\n/g, '')
    .replace(/export interface ZdpShortcutGuardOptions [\s\S]*?\n}\n\n/g, '')
    .replace(/\] as const satisfies readonly ZdpShortcutRecommendation\[];/g, '];')
    .replace(/\] as const;/g, '];')
    .replace(/export function isZdpTextEntryTarget\(target: EventTarget \| null\): boolean/g, 'export function isZdpTextEntryTarget(target)')
    .replace(/export function isZdpBrowserReservedShortcut\(event: KeyboardEvent\): boolean/g, 'export function isZdpBrowserReservedShortcut(event)')
    .replace(
      /export function shouldZdpIgnoreShortcutEvent\(\n  event: KeyboardEvent,\n  options: ZdpShortcutGuardOptions = {}\n\): boolean/g,
      'export function shouldZdpIgnoreShortcutEvent(\n  event,\n  options = {}\n)'
    );
}

function stripTokenTypes(source: string): string {
  return source
    .replace(/\] as const;/g, '];')
    .replace(/export type ZdpTokenName = [\s\S]*?;\n?$/g, '');
}

for (const moduleName of runtimeModuleNames) {
  const outputPath = resolve(distRoot, `${moduleName}.js`);
  assertInsideRepo(outputPath);

  if (basename(outputPath) !== `${moduleName}.js`) {
    throw new Error(`Unexpected runtime module output path: ${outputPath}`);
  }
}

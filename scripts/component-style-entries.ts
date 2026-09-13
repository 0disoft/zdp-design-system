import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { posix, resolve } from 'node:path';

export interface PublicComponentExport {
  readonly name: string;
  readonly fileName: string;
}

export interface WriteComponentStyleEntriesOptions {
  readonly componentDirectory: string;
  readonly outputDirectory: string;
  readonly publicEntrySource: string;
}

const componentExportPattern =
  /export\s*\{\s*default\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\}\s*from\s*['"]\.\/components\/([^'"]+\.svelte)['"]\s*;/g;
const styleBlockPattern = /<style([^>]*)>([\s\S]*?)<\/style>/g;
const svelteGlobalToken = ':global';

export function readPublicComponentExports(publicEntrySource: string): readonly PublicComponentExport[] {
  const components: PublicComponentExport[] = [];
  const names = new Set<string>();
  const fileNames = new Set<string>();

  for (const match of publicEntrySource.matchAll(componentExportPattern)) {
    const name = match[1];
    const fileName = match[2];

    if (!name || !fileName) {
      throw new Error('Public component export parser returned an incomplete match.');
    }

    assertSafeComponentFileName(fileName);

    const expectedName = fileName.slice(0, -'.svelte'.length);
    if (name !== expectedName) {
      throw new Error(
        `Public component export alias ${name} must match its Svelte file name ${expectedName}.`
      );
    }

    if (names.has(name)) {
      throw new Error(`Public component export ${name} is duplicated.`);
    }

    if (fileNames.has(fileName)) {
      throw new Error(`Public component source ${fileName} is exported more than once.`);
    }

    names.add(name);
    fileNames.add(fileName);
    components.push({ name, fileName });
  }

  if (components.length === 0) {
    throw new Error('Public entry must export at least one Svelte component.');
  }

  return components.sort(comparePublicComponents);
}

export function createComponentStyleEntry(
  component: PublicComponentExport,
  componentSource: string
): string {
  const styleBlocks = [...componentSource.matchAll(styleBlockPattern)].map((match) => {
    const attributes = match[1] ?? '';
    const content = match[2] ?? '';

    if (/\blang\s*=/.test(attributes)) {
      throw new Error(
        `${component.fileName} uses a preprocessed style block that cannot be published as framework-neutral CSS.`
      );
    }

    return unwrapSvelteGlobalSelectors(content).trim();
  });

  const generatedHeader =
    `/* Generated from src/lib/components/${component.fileName}; do not edit directly. */`;
  const generatedBody = styleBlocks.filter(Boolean).join('\n\n');

  return generatedBody.length === 0
    ? `${generatedHeader}\n`
    : `${generatedHeader}\n${generatedBody}\n`;
}

export async function writePublicComponentStyleEntries(
  options: WriteComponentStyleEntriesOptions
): Promise<readonly PublicComponentExport[]> {
  const components = readPublicComponentExports(options.publicEntrySource);

  await rm(options.outputDirectory, { force: true, recursive: true });
  await mkdir(options.outputDirectory, { recursive: true });

  await Promise.all(
    components.map(async (component) => {
      const sourcePath = resolve(options.componentDirectory, component.fileName);
      const outputPath = resolve(options.outputDirectory, `${component.name}.css`);
      const componentSource = await readFile(sourcePath, 'utf8');
      const css = createComponentStyleEntry(component, componentSource);
      await writeFile(outputPath, css, 'utf8');
    })
  );

  return components;
}

export function unwrapSvelteGlobalSelectors(css: string): string {
  let output = '';
  let cursor = 0;

  while (cursor < css.length) {
    if (css.startsWith('/*', cursor)) {
      const commentEnd = css.indexOf('*/', cursor + 2);
      if (commentEnd === -1) {
        throw new Error('Unterminated CSS comment while generating component style entry.');
      }

      output += css.slice(cursor, commentEnd + 2);
      cursor = commentEnd + 2;
      continue;
    }

    const character = css[cursor] ?? '';
    if (character === '"' || character === "'") {
      const stringEnd = findStringEnd(css, cursor);
      output += css.slice(cursor, stringEnd);
      cursor = stringEnd;
      continue;
    }

    if (css.startsWith(`${svelteGlobalToken}(`, cursor)) {
      const openParenthesis = cursor + svelteGlobalToken.length;
      const closeParenthesis = findMatchingParenthesis(css, openParenthesis);
      const innerSelector = css.slice(openParenthesis + 1, closeParenthesis);
      output += unwrapSvelteGlobalSelectors(innerSelector);
      cursor = closeParenthesis + 1;
      continue;
    }

    if (css.startsWith(svelteGlobalToken, cursor)) {
      throw new Error(
        'Only the :global(...) Svelte selector form can be converted to framework-neutral CSS.'
      );
    }

    output += character;
    cursor += 1;
  }

  return output;
}

function assertSafeComponentFileName(fileName: string): void {
  if (
    fileName.includes('\\') ||
    fileName.startsWith('/') ||
    posix.normalize(fileName) !== fileName ||
    posix.basename(fileName) !== fileName
  ) {
    throw new Error(`Unsafe public component source path: ${fileName}.`);
  }
}

function comparePublicComponents(left: PublicComponentExport, right: PublicComponentExport): number {
  if (left.name < right.name) return -1;
  if (left.name > right.name) return 1;
  return 0;
}

function findMatchingParenthesis(css: string, openParenthesis: number): number {
  let depth = 1;
  let cursor = openParenthesis + 1;

  while (cursor < css.length) {
    if (css.startsWith('/*', cursor)) {
      const commentEnd = css.indexOf('*/', cursor + 2);
      if (commentEnd === -1) {
        throw new Error('Unterminated CSS comment inside :global(...).');
      }

      cursor = commentEnd + 2;
      continue;
    }

    const character = css[cursor] ?? '';
    if (character === '"' || character === "'") {
      cursor = findStringEnd(css, cursor);
      continue;
    }

    if (character === '(') depth += 1;
    else if (character === ')') depth -= 1;

    if (depth === 0) {
      return cursor;
    }

    cursor += 1;
  }

  throw new Error('Unbalanced :global(...) selector while generating component style entry.');
}

function findStringEnd(css: string, start: number): number {
  const quote = css[start];
  let cursor = start + 1;

  while (cursor < css.length) {
    if (css[cursor] === '\\') {
      cursor += 2;
      continue;
    }

    if (css[cursor] === quote) {
      return cursor + 1;
    }

    cursor += 1;
  }

  throw new Error('Unterminated CSS string while generating component style entry.');
}

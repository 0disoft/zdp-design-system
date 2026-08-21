import { parseComponentProps } from './props';
import type { ComponentContract, RootExportContract, SourceReader } from './types';
import { componentSpecifierPattern } from './root';

export async function readComponents(
  reader: SourceReader,
  exports: readonly RootExportContract[]
): Promise<readonly ComponentContract[]> {
  const components = exports.filter(
    (entry) => entry.kind === 'value' && componentSpecifierPattern.test(entry.source)
  );
  return Promise.all(components.map(async (entry) => {
    const fileName = componentSpecifierPattern.exec(entry.source)?.[1];
    if (!fileName) throw new Error(`Invalid component export source ${entry.source}.`);
    const path = `src/lib/components/${fileName}`;
    const source = await reader.readText(path);
    const script = instanceScript(source, `${reader.label}:${path}`);
    const parsed = script ? parseComponentProps(script, `${reader.label}:${path}`) : { props: [], typeDeclarations: [] };
    return {
      name: entry.name,
      source: entry.source,
      props: parsed.props,
      slots: slots(source),
      typeDeclarations: parsed.typeDeclarations
    };
  })).then((items) => items.sort((a, b) => a.name.localeCompare(b.name)));
}

function instanceScript(source: string, label: string): string | null {
  const matches = [...source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter((match) => {
    const attributes = match[1] ?? '';
    return !/\bcontext\s*=\s*["']module["']/i.test(attributes) && !/\bmodule\b/i.test(attributes);
  });
  if (matches.length > 1) throw new Error(`${label} contains more than one instance script.`);
  return matches[0]?.[2] ?? null;
}

function slots(source: string): readonly string[] {
  const names = new Set<string>();
  for (const match of source.matchAll(/<slot\b([^>]*)>/gi)) {
    const name = /\bname\s*=\s*["']([^"']+)["']/i.exec(match[1] ?? '')?.[1];
    names.add(name ?? 'default');
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

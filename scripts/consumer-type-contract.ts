import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { publicComponents } from './public-surface';

/** Compile an installed tarball without inheriting the repository's tsconfig. */
export async function checkPackedTypeConsumers(consumerRoot: string, repoRoot: string): Promise<void> {
  const componentImports = publicComponents.map(({ name }) =>
    `import ${name} from 'zdp-design-system/components/${name}';`).join('\n');
  const source = `import type { ComponentProps } from 'svelte';
import { Button as RootButton, zdpBrandAssets as rootAssets } from 'zdp-design-system';
import { zdpBrandAssets } from 'zdp-design-system/brand-assets';
import { zdpCreditAssets } from 'zdp-design-system/credit-assets';
import { createZdpSplitPaneController } from 'zdp-design-system/split-pane';
import { zdpShareIcons } from 'zdp-design-system/share';
${componentImports}
export type ComponentTypes = [${publicComponents.map(({ name }) => `ComponentProps<typeof ${name}>`).join(', ')}];
type ButtonProps = ComponentProps<typeof Button>;
type NotAny = 0 extends (1 & ButtonProps) ? never : true;
const typed: NotAny = true;
const direct: ButtonProps = { variant: 'primary', loading: true, onclick: (event: MouseEvent) => event.preventDefault() };
const root: ComponentProps<typeof RootButton> = direct;
// @ts-expect-error invalid variants must fail through the component subpath
const invalid: ButtonProps = { variant: 'unknown' };
// @ts-expect-error undeclared props must not be accepted as any
const unknownProp: ButtonProps = { missingProp: true };
void [typed, direct, root, invalid, unknownProp, rootAssets, zdpBrandAssets, zdpCreditAssets, createZdpSplitPaneController, zdpShareIcons];
`;
  await writeFile(join(consumerRoot, 'type-contract.ts'), source);
  const compilers = [
    join(consumerRoot, 'node_modules/typescript-previous'),
    join(repoRoot, 'node_modules/typescript')
  ];

  for (const compilerRoot of compilers) {
    const { version } = JSON.parse(await readFile(join(compilerRoot, 'package.json'), 'utf8')) as { version: string };
    for (const mode of ['bundler', 'nodenext'] as const) {
      const configPath = join(consumerRoot, `tsconfig.${mode}.json`);
      await writeFile(configPath, JSON.stringify({
        compilerOptions: {
          module: mode === 'bundler' ? 'ESNext' : 'NodeNext',
          moduleResolution: mode,
          target: 'ES2022',
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          types: ['svelte'],
          strict: true,
          skipLibCheck: false,
          exactOptionalPropertyTypes: true,
          noUncheckedIndexedAccess: true,
          isolatedModules: true,
          verbatimModuleSyntax: true,
          noEmit: true
        },
        files: ['type-contract.ts']
      }, null, 2));
      const result = spawnSync(process.execPath, [join(compilerRoot, 'bin/tsc'), '-p', configPath], {
        cwd: consumerRoot, encoding: 'utf8', shell: false, windowsHide: true,
        timeout: 120_000, maxBuffer: 4 * 1024 * 1024
      });
      assert.ifError(result.error);
      assert.equal(result.status, 0, `TypeScript ${version} ${mode} declaration consumer failed:\n${result.stdout}${result.stderr}`);
      console.log(`Packed declaration consumer passed: TypeScript ${version}, ${mode}, ${publicComponents.length} component subpaths, skipLibCheck=false.`);
    }
  }
}

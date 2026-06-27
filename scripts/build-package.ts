import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distRoot = resolve(repoRoot, 'dist');

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

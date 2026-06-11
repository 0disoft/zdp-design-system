import { build } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const fixtureRoot = resolve(repoRoot, 'fixtures/consumer-svelte-vite');

await build({
  configFile: resolve(fixtureRoot, 'vite.config.ts'),
  logLevel: 'silent',
  root: fixtureRoot
});

console.log('Consumer fixture check passed.');

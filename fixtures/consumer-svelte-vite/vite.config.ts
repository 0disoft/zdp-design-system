import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

const fixtureRoot = fileURLToPath(new URL('.', import.meta.url));
const packageRoot = resolve(fixtureRoot, '../..');

export default defineConfig({
  plugins: [svelte()],
  build: {
    emptyOutDir: true,
    outDir: resolve(packageRoot, 'tmp/consumer-svelte-vite')
  }
});

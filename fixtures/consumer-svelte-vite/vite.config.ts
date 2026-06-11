import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

const fixtureRoot = fileURLToPath(new URL('.', import.meta.url));
const packageRoot = resolve(fixtureRoot, '../..');

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: [
      {
        find: /^zdp-design-system$/,
        replacement: resolve(packageRoot, 'dist/index.ts')
      },
      {
        find: /^zdp-design-system\/styles\.css$/,
        replacement: resolve(packageRoot, 'dist/styles/index.css')
      },
      {
        find: /^zdp-design-system\/brand-fonts\.css$/,
        replacement: resolve(packageRoot, 'dist/styles/brand-fonts.css')
      },
      {
        find: /^zdp-design-system\/expressive-fonts\.css$/,
        replacement: resolve(packageRoot, 'dist/styles/expressive-fonts.css')
      },
      {
        find: /^zdp-design-system\/locale-fonts\.css$/,
        replacement: resolve(packageRoot, 'dist/styles/locale-fonts.css')
      },
      {
        find: /^zdp-design-system\/share$/,
        replacement: resolve(packageRoot, 'dist/share.js')
      },
      {
        find: /^zdp-design-system\/tokens$/,
        replacement: resolve(packageRoot, 'dist/tokens/zdp.tokens.json')
      }
    ]
  },
  build: {
    emptyOutDir: true,
    outDir: resolve(packageRoot, 'tmp/consumer-svelte-vite')
  }
});

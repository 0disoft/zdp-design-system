import { svelte } from '@sveltejs/vite-plugin-svelte';
import type { StorybookConfig } from '@storybook/svelte-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|ts|svelte)'],
  addons: [],
  framework: {
    name: '@storybook/svelte-vite',
    options: {
      docgen: false
    }
  },
  async viteFinal(config) {
    return {
      ...config,
      plugins: [...(config.plugins ?? []), svelte()]
    };
  }
};

export default config;

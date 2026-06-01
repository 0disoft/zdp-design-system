import type { Preview } from '@storybook/svelte-vite';
import '../src/styles/index.css';

const preview: Preview = {
  parameters: {
    controls: {
      expanded: true
    },
    layout: 'fullscreen'
  }
};

export default preview;

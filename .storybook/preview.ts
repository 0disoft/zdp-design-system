import type { Preview } from '@storybook/svelte-vite';
import '../src/styles/index.css';
import '../src/styles/brand-fonts.css';
import '../src/styles/expressive-fonts.css';
import './preview.css';

const preview: Preview = {
  parameters: {
    controls: {
      expanded: true
    },
    layout: 'fullscreen',
    viewport: {
      options: {
        zdpMobile: {
          name: 'ZDP Mobile',
          styles: {
            width: '390px',
            height: '844px'
          },
          type: 'mobile'
        },
        zdpTablet: {
          name: 'ZDP Tablet',
          styles: {
            width: '768px',
            height: '1024px'
          },
          type: 'tablet'
        },
        zdpDesktop: {
          name: 'ZDP Desktop',
          styles: {
            width: '1280px',
            height: '900px'
          },
          type: 'desktop'
        },
        zdpWide: {
          name: 'ZDP Wide',
          styles: {
            width: '1440px',
            height: '960px'
          },
          type: 'desktop'
        }
      }
    },
    a11y: {
      test: 'error'
    }
  }
};

export default preview;

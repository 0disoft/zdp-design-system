import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ThemeLocaleStress from './ThemeLocaleStress.svelte';

const meta = {
  title: 'Design System/QA/Theme Locale Stress',
  component: ThemeLocaleStress,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof ThemeLocaleStress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Stress: Story = {};

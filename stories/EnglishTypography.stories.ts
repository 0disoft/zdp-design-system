import type { Meta, StoryObj } from '@storybook/svelte-vite';
import EnglishTypography from './EnglishTypography.svelte';

const meta = {
  title: 'Design System/QA/English Typography',
  component: EnglishTypography,
  parameters: { layout: 'fullscreen' }
} satisfies Meta<typeof EnglishTypography>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Comparison: Story = {};

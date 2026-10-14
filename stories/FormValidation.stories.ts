import type { Meta, StoryObj } from '@storybook/svelte-vite';
import FormValidation from './FormValidation.svelte';

const meta = {
  title: 'Design System/Components/Form Validation',
  component: FormValidation,
  parameters: { layout: 'fullscreen' }
} satisfies Meta<typeof FormValidation>;

export default meta;
type Story = StoryObj<typeof meta>;
export const States: Story = {};

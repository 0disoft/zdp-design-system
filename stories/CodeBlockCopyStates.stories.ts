import type { Meta, StoryObj } from '@storybook/svelte-vite';
import CodeBlockCopyStates from './CodeBlockCopyStates.svelte';

const meta = {
  title: 'Design System/Components/Code Block Copy',
  component: CodeBlockCopyStates,
  parameters: { layout: 'fullscreen' }
} satisfies Meta<typeof CodeBlockCopyStates>;

export default meta;
type Story = StoryObj<typeof meta>;
export const States: Story = {};

import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/svelte-vite';
import Interaction from './Interaction.svelte';
import InteractionProbe from './InteractionProbe.svelte';

const meta = {
  title: 'Design System/Components/Interaction',
  component: Interaction,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof Interaction>;

export default meta;

type Story = StoryObj<typeof meta>;

export const States: Story = {};

export const Probe: StoryObj<typeof InteractionProbe> = {
  name: 'Interaction tests',
  render: () => ({
    Component: InteractionProbe
  }),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('tabs move selected state', async () => {
      const historyTab = canvas.getByRole('tab', { name: '기록' });
      await userEvent.click(historyTab);
      await expect(historyTab).toHaveAttribute('aria-selected', 'true');
      await expect(canvas.getByText('기록이 선택되었습니다.')).toBeVisible();
    });

    await step('dialog opens and closes with Escape', async () => {
      await userEvent.click(canvas.getByRole('button', { name: '검토 열기' }));
      await expect(canvas.getByRole('dialog', { name: '변경 내용을 확인할까요?' })).toBeVisible();
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument());
    });

    await step('ConfirmAction confirms after keyboard hold', async () => {
      const confirmButton = canvas.getByRole('button', { name: /길게 눌러 확인/ });
      await fireEvent.keyDown(confirmButton, { key: 'Enter' });
      await waitFor(() => expect(canvas.getByText('확인 1회')).toBeVisible(), { timeout: 1200 });
      await fireEvent.keyUp(confirmButton, { key: 'Enter' });
    });
  }
};

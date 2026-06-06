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

    await step('disclosure and accordion expose expanded state', async () => {
      const disclosureTrigger = canvas.getByRole('button', { name: '검토 기준' });
      await userEvent.click(disclosureTrigger);
      await expect(disclosureTrigger).toHaveAttribute('aria-expanded', 'true');
      await expect(canvas.getByText('필요한 기준만 펼쳐서 확인합니다.')).toBeVisible();
      await expect(canvas.getByText('열림')).toBeVisible();

      const ownerTrigger = canvas.getByRole('button', { name: '소유자' });
      await userEvent.click(ownerTrigger);
      await expect(ownerTrigger).toHaveAttribute('aria-expanded', 'true');
      await expect(canvas.getByText('권한과 데이터 판단은 제품 저장소가 연결합니다.')).toBeVisible();
      await expect(canvas.getByText('선택 소유자')).toBeVisible();
    });

    await step('segmented control changes selected option', async () => {
      const cardOption = canvas.getByRole('radio', { name: '카드' });
      await userEvent.click(cardOption);
      await expect(cardOption).toHaveAttribute('aria-checked', 'true');
      await expect(canvas.getByText('보기 카드')).toBeVisible();

      await userEvent.keyboard('{ArrowRight}');
      await expect(canvas.getByRole('radio', { name: '요약' })).toHaveAttribute('aria-checked', 'true');
      await expect(canvas.getByText('보기 요약')).toBeVisible();
    });

    await step('menu opens and selects an item', async () => {
      await userEvent.click(canvas.getByRole('button', { name: '더보기' }));
      await expect(canvas.getByRole('menu', { name: '더보기' })).toBeVisible();
      await userEvent.click(canvas.getByRole('menuitem', { name: '필터 저장' }));
      await expect(canvas.getByText('필터 저장')).toBeVisible();
      await waitFor(() => expect(canvas.queryByRole('menu')).not.toBeInTheDocument());
    });

    await step('term sheet opens and closes with Escape', async () => {
      await userEvent.click(canvas.getByRole('button', { name: '운영 복원력' }));
      await expect(canvas.getByRole('dialog', { name: '운영 복원력' })).toBeVisible();
      await expect(canvas.getByText('용어 열림')).toBeVisible();
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(canvas.queryByRole('dialog', { name: '운영 복원력' })).not.toBeInTheDocument());
      await expect(canvas.getByText('용어 닫힘')).toBeVisible();
    });

    await step('ConfirmAction confirms after keyboard hold', async () => {
      const confirmButton = canvas.getByRole('button', { name: /길게 눌러 확인/ });
      await fireEvent.keyDown(confirmButton, { key: 'Enter' });
      await waitFor(() => expect(canvas.getByText('확인 1회')).toBeVisible(), { timeout: 1200 });
      await fireEvent.keyUp(confirmButton, { key: 'Enter' });
    });
  }
};

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

    await step('command field exposes shortcut and consumer-owned result linkage', async () => {
      const commandField = canvas.getByRole('searchbox', { name: '빠른 이동' });

      await expect(commandField).toHaveAttribute('aria-keyshortcuts', '/');
      await expect(commandField).toHaveAttribute('aria-autocomplete', 'list');
      await expect(commandField).toHaveAttribute(
        'aria-describedby',
        'interaction-probe-command-help interaction-probe-command-state'
      );
      await expect(commandField).toHaveAttribute('aria-expanded', 'false');
      await expect(commandField).not.toHaveAttribute('aria-controls');
      await expect(commandField).not.toHaveAttribute('aria-activedescendant');

      await userEvent.type(commandField, '설정');
      await expect(commandField).toHaveValue('설정');
      await expect(commandField).toHaveAttribute('aria-expanded', 'true');
      await expect(commandField).toHaveAttribute('aria-controls', 'interaction-probe-command-results');
      await expect(commandField).toHaveAttribute(
        'aria-activedescendant',
        'interaction-probe-command-result-settings'
      );
      await expect(canvas.getByRole('listbox', { name: '빠른 이동 결과' })).toBeVisible();
      await expect(canvas.getByRole('option', { name: '설정' })).toHaveAttribute('aria-selected', 'true');

      await userEvent.keyboard('{Enter}');
      await expect(canvas.getByText('Command 설정 · 키 Enter')).toBeVisible();
      await userEvent.keyboard('{Escape}');
      await expect(canvas.getByText('Command 설정 · 키 Escape')).toBeVisible();
    });

    await step('combobox supports listbox navigation, disabled skip, selection, and Escape close', async () => {
      const comboboxInput = canvas.getByRole('combobox', { name: '빠른 이동' });
      const comboboxToggle = canvas.getByRole('button', { name: '선택 열기' });
      const hiddenValue = canvasElement.querySelector<HTMLInputElement>(
        'input[type="hidden"][name="interaction-probe-combobox"]'
      );

      await userEvent.click(comboboxToggle);
      await waitFor(() => expect(canvas.getByRole('listbox', { name: '빠른 이동 목록' })).toBeVisible());
      await expect(comboboxInput).toHaveAttribute('aria-expanded', 'true');
      await expect(comboboxInput).toHaveAttribute('aria-controls', 'interaction-probe-combobox-listbox');

      await userEvent.type(comboboxInput, '프로');
      await expect(canvas.getByRole('option', { name: /프로젝트/ })).toBeVisible();
      await expect(canvas.queryByRole('option', { name: /설정/ })).not.toBeInTheDocument();

      await userEvent.clear(comboboxInput);
      await userEvent.type(comboboxInput, '없는 항목');
      await expect(canvas.getByRole('status')).toHaveTextContent('결과 없음');
      await expect(comboboxInput).not.toHaveAttribute('aria-controls');

      await userEvent.clear(comboboxInput);
      await waitFor(() => expect(canvas.getByRole('listbox', { name: '빠른 이동 목록' })).toBeVisible());

      await userEvent.keyboard('{ArrowDown}');
      await expect(comboboxInput).toHaveAttribute(
        'aria-activedescendant',
        'interaction-probe-combobox-option-settings'
      );

      await userEvent.keyboard('{ArrowDown}');
      await expect(comboboxInput).toHaveAttribute(
        'aria-activedescendant',
        'interaction-probe-combobox-option-project'
      );

      await userEvent.keyboard('{End}');
      await expect(comboboxInput).toHaveAttribute(
        'aria-activedescendant',
        'interaction-probe-combobox-option-settings'
      );

      await userEvent.keyboard('{Enter}');
      await waitFor(() => expect(canvas.queryByRole('listbox')).not.toBeInTheDocument());
      await expect(comboboxInput).toHaveValue('설정');
      await expect(canvas.getByText('선택 설정')).toBeVisible();
      await expect(hiddenValue).not.toBeNull();
      await expect(hiddenValue).toHaveValue('settings');
      await expect(comboboxInput).not.toHaveAttribute('aria-controls');

      await userEvent.click(canvas.getByRole('button', { name: '선택 열기' }));
      await waitFor(() => expect(canvas.getByRole('listbox', { name: '빠른 이동 목록' })).toBeVisible());
      await userEvent.clear(comboboxInput);
      await userEvent.type(comboboxInput, '없는 항목');
      await expect(canvas.getByRole('status')).toHaveTextContent('결과 없음');
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(canvas.queryByRole('status')).not.toBeInTheDocument());
      await expect(comboboxInput).toHaveFocus();
      await expect(comboboxInput).toHaveValue('설정');
    });

    await step('menu supports keyboard open, roving focus, disabled skip, and Escape focus return', async () => {
      const menuTrigger = canvas.getByRole('button', { name: '더보기' });

      menuTrigger.focus();
      await userEvent.keyboard('{ArrowDown}');
      await expect(canvas.getByRole('menu', { name: '더보기' })).toBeVisible();
      await expect(canvas.getByRole('menuitem', { name: '설정 열기' })).toHaveFocus();

      await userEvent.keyboard('{ArrowDown}');
      await expect(canvas.getByRole('menuitem', { name: '필터 저장' })).toHaveFocus();

      await userEvent.keyboard('{ArrowDown}');
      await expect(canvas.getByRole('menuitem', { name: '설정 열기' })).toHaveFocus();

      await userEvent.keyboard('{End}');
      await expect(canvas.getByRole('menuitem', { name: '필터 저장' })).toHaveFocus();

      await userEvent.keyboard('{Home}');
      await expect(canvas.getByRole('menuitem', { name: '설정 열기' })).toHaveFocus();

      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(canvas.queryByRole('menu')).not.toBeInTheDocument());
      await expect(menuTrigger).toHaveFocus();

      await userEvent.click(menuTrigger);
      await expect(canvas.getByRole('menu', { name: '더보기' })).toBeVisible();
      await userEvent.click(canvas.getByRole('menuitem', { name: '필터 저장' }));
      await waitFor(() => expect(canvas.queryByRole('menu')).not.toBeInTheDocument());
      await expect(canvas.getByText('필터 저장')).toBeVisible();
    });

    await step('popover keeps trigger focus policy and closes on Escape and outside click', async () => {
      const popoverTrigger = canvas.getByRole('button', { name: '필터 열기' });
      const outsideButton = canvas.getByRole('button', { name: '바깥 액션' });

      popoverTrigger.focus();
      await userEvent.click(popoverTrigger);
      await expect(canvas.getByRole('dialog', { name: '필터 열기' })).toBeVisible();
      await expect(popoverTrigger).toHaveFocus();
      await expect(canvas.getByText('Popover 열림')).toBeVisible();

      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(canvas.queryByRole('dialog', { name: '필터 열기' })).not.toBeInTheDocument());
      await expect(popoverTrigger).toHaveFocus();
      await expect(canvas.getByText('Popover 닫힘')).toBeVisible();

      await userEvent.click(popoverTrigger);
      await expect(canvas.getByRole('dialog', { name: '필터 열기' })).toBeVisible();
      await userEvent.click(outsideButton);
      await waitFor(() => expect(canvas.queryByRole('dialog', { name: '필터 열기' })).not.toBeInTheDocument());
      await expect(canvas.getByText('Popover 닫힘')).toBeVisible();
    });

    await step('sheet opens as modal edge surface and restores trigger focus', async () => {
      const sheetTrigger = canvas.getByRole('button', { name: '설정 열기' });

      sheetTrigger.focus();
      await userEvent.click(sheetTrigger);
      await expect(canvas.getByRole('dialog', { name: '화면 설정' })).toBeVisible();
      await expect(canvas.getByText('Sheet 열림')).toBeVisible();

      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(canvas.queryByRole('dialog', { name: '화면 설정' })).not.toBeInTheDocument());
      await expect(sheetTrigger).toHaveFocus();
      await expect(canvas.getByText('Sheet 닫힘')).toBeVisible();

      await userEvent.click(sheetTrigger);
      await expect(canvas.getByRole('dialog', { name: '화면 설정' })).toBeVisible();
      await userEvent.click(canvas.getAllByRole('button', { name: '닫기' })[0]);
      await waitFor(() => expect(canvas.queryByRole('dialog', { name: '화면 설정' })).not.toBeInTheDocument());
      await expect(canvas.getByText('Sheet 닫힘')).toBeVisible();
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

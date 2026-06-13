import { expect, userEvent, within } from 'storybook/test';
import Forms from './Forms.svelte';

export default {
  title: 'Design System/Components/Form Controls',
  component: Forms,
  parameters: {
    layout: 'fullscreen'
  }
};

export const States = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const lightPanel = within(canvas.getByRole('region', { name: 'Light' }));

    await step('select keeps error linkage and native change', async () => {
      const statusSelect = lightPanel.getByLabelText('상태');

      await expect(statusSelect).toHaveAttribute('aria-invalid', 'true');
      await expect(statusSelect).toHaveAttribute('aria-errormessage', 'forms-light-status-error');
      await expect(statusSelect).toHaveAttribute(
        'aria-describedby',
        'forms-light-status-help forms-light-status-error'
      );

      await userEvent.selectOptions(statusSelect, 'ready');
      await expect(statusSelect).toHaveValue('ready');
    });

    await step('combobox keeps hidden submitted value in form story', async () => {
      const ownerCombobox = lightPanel.getByRole('combobox', { name: '담당' });
      const hiddenValue = canvasElement.querySelector<HTMLInputElement>(
        'input[type="hidden"][name="forms-light-owner"]'
      );

      await userEvent.click(ownerCombobox);
      await expect(lightPanel.getByRole('listbox', { name: '담당 목록' })).toBeVisible();
      await userEvent.click(lightPanel.getByRole('option', { name: /보안 검토/ }));

      await expect(ownerCombobox).toHaveValue('보안 검토');
      await expect(hiddenValue).not.toBeNull();
      await expect(hiddenValue).toHaveValue('security');
    });
  }
};

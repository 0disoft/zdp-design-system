import ComboboxEdges from './ComboboxEdges.svelte';
export default {
  title: 'Design System/Components/Combobox Edges', component: ComboboxEdges,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    corner: { control: 'select', options: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'] },
    direction: { control: 'select', options: ['ltr', 'rtl'] },
    count: { control: { type: 'number', min: 1, max: 80 } }
  }
};
export const Corner = { args: { corner: 'bottom-right', count: 4 } };
export const LongList = { args: { corner: 'bottom-left', count: 40 } };

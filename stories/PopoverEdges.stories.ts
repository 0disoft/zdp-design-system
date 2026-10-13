import PopoverEdges from './PopoverEdges.svelte';
export default {
  title: 'Design System/Components/Popover Edges',
  component: PopoverEdges,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    placement: { control: 'select', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'select', options: ['start', 'center', 'end'] },
    corner: { control: 'select', options: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'] },
    direction: { control: 'select', options: ['ltr', 'rtl'] },
    count: { control: { type: 'number', min: 1, max: 80 } }
  }
};
export const Corner = { args: { corner: 'bottom-right', placement: 'bottom', align: 'end', count: 1 } };
export const LongContent = { args: { corner: 'bottom-left', placement: 'bottom', count: 40 } };

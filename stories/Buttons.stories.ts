import type { Meta, StoryObj } from '@storybook/svelte-vite';
import Buttons from './Buttons.svelte';
import ButtonPlayground from './ButtonPlayground.svelte';

const meta = {
  title: 'Design System/Components/Button',
  component: Buttons,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof Buttons>;

export default meta;

type Story = StoryObj<typeof meta>;

export const States: Story = {};

export const Playground: StoryObj<typeof ButtonPlayground> = {
  name: 'Controls',
  render: (args) => ({
    Component: ButtonPlayground,
    props: args
  }),
  args: {
    variant: 'primary',
    size: 'md',
    label: '저장',
    disabled: false,
    showIcon: false,
    ariaKeyShortcuts: null
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['primary', 'secondary', 'danger']
    },
    size: {
      control: 'radio',
      options: ['sm', 'md']
    },
    label: {
      control: 'text'
    },
    disabled: {
      control: 'boolean'
    },
    showIcon: {
      control: 'boolean'
    },
    ariaKeyShortcuts: {
      control: 'text'
    }
  }
};

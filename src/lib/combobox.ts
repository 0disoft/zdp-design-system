export type ZdpComboboxOption = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly description?: string;
  readonly disabled?: boolean;
};

export type ZdpComboboxSize = 'sm' | 'md';

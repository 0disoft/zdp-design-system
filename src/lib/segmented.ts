export type ZdpSegmentedControlSize = 'sm' | 'md';

export interface ZdpSegmentedControlItem {
  readonly id: string;
  readonly label: string;
  readonly ariaLabel?: string;
  readonly disabled?: boolean;
}

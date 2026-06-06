export type ZdpSortDirection = 'none' | 'ascending' | 'descending';

export type ZdpTableDensity = 'default' | 'compact';

export interface ZdpTableToolbarDensityItem {
  readonly id: ZdpTableDensity;
  readonly label: string;
  readonly ariaLabel?: string;
  readonly disabled?: boolean;
}

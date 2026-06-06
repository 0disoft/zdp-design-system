export type ZdpToastTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface ZdpStatusToastItem {
  readonly id: string;
  readonly tone?: ZdpToastTone;
  readonly title?: string;
  readonly message: string;
  readonly dismissLabel?: string;
  readonly actionLabel?: string;
  readonly href?: string;
  readonly target?: '_self' | '_blank' | '_parent' | '_top';
  readonly rel?: string;
  readonly onclick?: (event: MouseEvent, item: ZdpStatusToastItem) => void;
}

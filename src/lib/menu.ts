export interface ZdpMenuItem {
  readonly id: string;
  readonly label: string;
  readonly href?: string;
  readonly target?: '_self' | '_blank' | '_parent' | '_top';
  readonly rel?: string;
  readonly ariaLabel?: string;
  readonly disabled?: boolean;
  readonly tone?: 'normal' | 'danger';
  readonly separatorBefore?: boolean;
  readonly onclick?: (event: MouseEvent, item: ZdpMenuItem) => void;
}

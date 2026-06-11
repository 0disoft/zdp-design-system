export type ZdpShareIconName = 'copy' | 'device' | 'telegram' | 'line' | 'whatsapp' | 'x' | 'reddit';

export interface ZdpShareIconPath {
  readonly d: string;
  readonly fill?: boolean;
  readonly stroke?: boolean;
  readonly strokeLinecap?: 'round';
  readonly strokeLinejoin?: 'round';
  readonly strokeWidth?: string;
}

export interface ZdpShareIconCircle {
  readonly cx: string;
  readonly cy: string;
  readonly r: string;
  readonly fill?: boolean;
  readonly stroke?: boolean;
  readonly strokeWidth?: string;
}

export interface ZdpShareIconLine {
  readonly x1: string;
  readonly y1: string;
  readonly x2: string;
  readonly y2: string;
  readonly strokeWidth?: string;
}

export interface ZdpShareIconShape {
  readonly viewBox: string;
  readonly paths?: readonly ZdpShareIconPath[];
  readonly circles?: readonly ZdpShareIconCircle[];
  readonly lines?: readonly ZdpShareIconLine[];
}

export interface ZdpShareDockItem {
  readonly id: string;
  readonly label: string;
  readonly icon: ZdpShareIconName;
  readonly href?: string;
  readonly target?: '_blank' | '_self' | '_parent' | '_top';
  readonly rel?: string;
  readonly disabled?: boolean;
  readonly ariaLabel?: string;
  readonly onclick?: (event: MouseEvent, item: ZdpShareDockItem) => void;
}

export declare const zdpShareIcons: Record<ZdpShareIconName, ZdpShareIconShape>;

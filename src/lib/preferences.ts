export type ZdpTextScale = 'base' | 'large' | 'larger';

export type ZdpTextScaleControlSize = 'sm' | 'md';

export interface ZdpTextScaleControlOption {
  readonly value: ZdpTextScale;
  readonly label: string;
  readonly ariaLabel?: string;
  readonly disabled?: boolean;
}

export const zdpTextScaleControlOptions = [
  { value: 'base', label: '가', ariaLabel: '기본 글자 크기' },
  { value: 'large', label: '가+', ariaLabel: '큰 글자 크기' },
  { value: 'larger', label: '가++', ariaLabel: '더 큰 글자 크기' }
] as const satisfies readonly ZdpTextScaleControlOption[];

export function isZdpTextScale(value: string | null | undefined): value is ZdpTextScale {
  return value === 'base' || value === 'large' || value === 'larger';
}

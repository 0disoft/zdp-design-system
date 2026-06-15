export type ZdpTextScale = 'base' | 'large' | 'larger';

export type ZdpTextScaleControlSize = 'sm' | 'md';

export type ZdpLocaleSwitcherSize = 'sm' | 'md';

export interface ZdpLocaleSwitcherOption {
  readonly value: string;
  readonly label: string;
  readonly shortLabel?: string;
  readonly lang?: string;
  readonly ariaLabel?: string;
  readonly disabled?: boolean;
}

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

export const zdpLocaleSwitcherOptions = [
  { value: 'ko', label: '한국어', shortLabel: 'KO', lang: 'ko', ariaLabel: '한국어' }
] as const satisfies readonly ZdpLocaleSwitcherOption[];

export function isZdpTextScale(value: string | null | undefined): value is ZdpTextScale {
  return value === 'base' || value === 'large' || value === 'larger';
}

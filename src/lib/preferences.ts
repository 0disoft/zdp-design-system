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
  { value: 'base', label: 'A', ariaLabel: 'Default text size' },
  { value: 'large', label: 'A+', ariaLabel: 'Large text size' },
  { value: 'larger', label: 'A++', ariaLabel: 'Larger text size' }
] as const satisfies readonly ZdpTextScaleControlOption[];

export const zdpLocaleSwitcherOptions = [
  { value: 'en', label: 'English', shortLabel: 'EN', lang: 'en', ariaLabel: 'English' },
  { value: 'ko', label: 'Korean', shortLabel: 'KO', lang: 'ko', ariaLabel: 'Korean' }
] as const satisfies readonly ZdpLocaleSwitcherOption[];

export function isZdpTextScale(value: string | null | undefined): value is ZdpTextScale {
  return value === 'base' || value === 'large' || value === 'larger';
}

export interface ZdpTermRelatedTerm {
  readonly id: string;
  readonly label: string;
}

export interface ZdpTermSheetTerm {
  readonly id: string;
  readonly label: string;
  readonly short: string;
  readonly long?: string;
  readonly example?: string;
  readonly relatedTerms?: readonly ZdpTermRelatedTerm[];
}

export type ZdpTermSheetPlacement = 'right' | 'bottom';

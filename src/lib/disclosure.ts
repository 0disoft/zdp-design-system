export type ZdpDisclosureHeadingLevel = 2 | 3 | 4 | 5 | 6;

export type ZdpAccordionMode = 'multiple' | 'single';

export interface ZdpAccordionItem {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly open?: boolean;
  readonly disabled?: boolean;
}

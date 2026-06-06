export type ZdpPaginationItem =
  | {
      readonly type: 'page';
      readonly page: number;
      readonly key: string;
    }
  | {
      readonly type: 'ellipsis';
      readonly key: string;
    };

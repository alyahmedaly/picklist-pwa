
export interface FlexibleCategory {
  readonly id: string;
  readonly name: string;
  readonly parent_id?: string;
  readonly path: string;
  readonly depth: number;
  readonly left_bound: number;
  readonly right_bound: number;
  readonly product_count: number;
  readonly display_order: number;
}

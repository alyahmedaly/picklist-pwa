import type { ProductFlagType } from "./ProductFlagType.ts";


export interface FlexibleProductFlag {
  readonly product_id: string;
  readonly flag_type: ProductFlagType;
  readonly flag_value: boolean;
  readonly confidence: number;
  readonly source: string;
}

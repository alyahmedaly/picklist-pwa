import type { ProductScoreContext } from "./ProductScoreContext.ts";
import type { ProductScoreType } from "./ProductScoreType.ts";


export interface FlexibleProductScore {
  readonly product_id: string;
  readonly score_type: ProductScoreType;
  readonly score_value: number;
  readonly context?: ProductScoreContext;
  readonly computed_at: number;
  readonly metadata?: string;
}

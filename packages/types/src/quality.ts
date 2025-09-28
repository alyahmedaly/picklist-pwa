// Data quality and merging related types
import type { Product } from './product/product.ts';

export interface MergeResult {
  mergedProducts: Product[];
  duplicatesRemoved: number;
  conflicts: Array<{
    field: string;
    values: string[];
    resolution: string;
  }>;
}

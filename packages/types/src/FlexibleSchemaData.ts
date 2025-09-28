import type { FlexibleProduct } from "./FlexibleProduct.ts";
import type { FlexibleCategory } from "./FlexibleCategory.ts";
import type { FlexibleProductAdditive } from "./FlexibleProductAdditive.ts";
import type { FlexibleProductCategory } from "./FlexibleProductCategory.ts";
import type { FlexibleProductFlag } from "./FlexibleProductFlag.ts";
import type { FlexibleProductNutrition } from "./FlexibleProductNutrition.ts";
import type { FlexibleProductScore } from "./FlexibleProductScore.ts";
import type { FlexibleProductSearchTerm } from "./FlexibleProductSearchTerm.ts";


export interface FlexibleSchemaData {
  products: FlexibleProduct[];
  categories: FlexibleCategory[];
  productCategories: FlexibleProductCategory[];
  productNutrition: FlexibleProductNutrition[];
  productFlags: FlexibleProductFlag[];
  productScores: FlexibleProductScore[];
  productAdditives: FlexibleProductAdditive[];
  productSearchTerms: FlexibleProductSearchTerm[];
}

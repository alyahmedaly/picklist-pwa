// Flexible schema entity and enum types

export interface FlexibleProduct {
  readonly id: string;
  readonly name: string;
  readonly price_regular: number;
  readonly price_sale?: number;
  readonly unit_amount: number;
  readonly unit_type: 'g' | 'ml' | 'pieces' | 'kg' | 'l';
  readonly brand?: string;
  readonly created_at: number;
  readonly updated_at: number;
}

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

export interface FlexibleProductCategory {
  readonly product_id: string;
  readonly category_id: string;
  readonly is_primary: boolean;
  readonly relevance_score: number;
}

export interface FlexibleProductNutrition {
  readonly product_id: string;
  readonly kcal?: number;
  readonly kj?: number;
  readonly protein?: number;
  readonly carbs?: number;
  readonly sugars?: number;
  readonly fat?: number;
  readonly saturated_fat?: number;
  readonly fiber?: number;
  readonly salt?: number;
  readonly sodium?: number;
}

export interface FlexibleProductFlag {
  readonly product_id: string;
  readonly flag_type: ProductFlagType;
  readonly flag_value: boolean;
  readonly confidence: number;
  readonly source: string;
}

export interface FlexibleProductScore {
  readonly product_id: string;
  readonly score_type: ProductScoreType;
  readonly score_value: number;
  readonly context?: ProductScoreContext;
  readonly computed_at: number;
  readonly metadata?: string;
}

export interface FlexibleProductAdditive {
  readonly product_id: string;
  readonly e_number?: string;
  readonly additive_name: string;
  readonly functional_category: string;
  readonly dutch_category?: string;
  readonly safety_flags?: string;
  readonly is_natural: boolean;
}

export interface FlexibleProductSearchTerm {
  readonly product_id: string;
  readonly term: string;
  readonly term_type: SearchTermType;
  readonly weight: number;
  readonly language: 'nl' | 'en';
}

export type ProductFlagType =
  | 'is_vegan'
  | 'is_vegetarian'
  | 'is_gluten_free'
  | 'is_lactose_free'
  | 'is_halal'
  | 'is_kosher'
  | 'is_organic'
  | 'is_high_protein'
  | 'is_low_carb'
  | 'is_high_fiber'
  | 'has_artificial_colors'
  | 'has_preservatives'
  | 'has_sweeteners';

export type ProductScoreType =
  | 'protein_efficiency'
  | 'calorie_efficiency'
  | 'satiety_score'
  | 'nutri_score'
  | 'health_score'
  | 'sustainability_score'
  | 'post_workout_score'
  | 'fat_loss_score'
  | 'budget_score'
  | 'contextual_score';

export type ProductScoreContext =
  | 'training_day'
  | 'rest_day'
  | 'cutting'
  | 'bulking'
  | 'maintenance';

export type SearchTermType =
  | 'name'
  | 'brand'
  | 'ingredient'
  | 'category'
  | 'synonym'
  | 'alternative_name'
  | 'description'
  | 'nutritional_tag'
  | 'dietary_flag';

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

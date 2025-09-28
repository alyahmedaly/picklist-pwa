/**
 * Database Interface Contract: Kysely Migration
 * Feature: 020-migration-kysely
 * Purpose: TypeScript contract for Kysely database interface
 */

// Base table interfaces matching existing SQLite schema

export interface ProductTable {
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

export interface CategoryTable {
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

export interface ProductCategoryTable {
  readonly product_id: string;
  readonly category_id: string;
  readonly is_primary: boolean;
  readonly relevance_score: number;
}

export interface ProductNutritionTable {
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

export interface ProductFlagTable {
  readonly product_id: string;
  readonly flag_type: ProductFlagType;
  readonly flag_value: boolean;
  readonly confidence: number;
  readonly source: string;
}

export interface ProductScoreTable {
  readonly product_id: string;
  readonly score_type: ProductScoreType;
  readonly score_value: number;
  readonly context?: ProductScoreContext;
  readonly computed_at: number;
  readonly metadata?: string;
}

export interface ProductAdditiveTable {
  readonly product_id: string;
  readonly e_number?: string;
  readonly additive_name: string;
  readonly functional_category: string;
  readonly dutch_category?: string;
  readonly safety_flags?: string;
  readonly is_natural: boolean;
}

export interface ProductSearchTermTable {
  readonly product_id: string;
  readonly term: string;
  readonly term_type: SearchTermType;
  readonly weight: number;
  readonly language: 'nl' | 'en';
}

// Enum types
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

// Main database interface (conditional search table)
export interface FlexibleDatabaseBase {
  products: ProductTable;
  categories: CategoryTable;
  product_categories: ProductCategoryTable;
  product_nutrition: ProductNutritionTable;
  product_flags: ProductFlagTable;
  product_scores: ProductScoreTable;
  product_additives: ProductAdditiveTable;
}

export interface FlexibleDatabaseWithSearch extends FlexibleDatabaseBase {
  product_search_terms: ProductSearchTermTable;
}

// Union type for conditional database interface
export type FlexibleDatabase = FlexibleDatabaseBase | FlexibleDatabaseWithSearch;

// Type guards for runtime detection
export function hasSearchTables(db: FlexibleDatabase): db is FlexibleDatabaseWithSearch {
  return 'product_search_terms' in db;
}

// Query result types
export interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface QueryResult<T> {
  data: T[];
  totalCount: number;
  queryTimeMs: number;
  metadata: {
    searchPerformed: boolean;
    categoryHierarchyUsed: boolean;
    multiDimensionalFiltering: boolean;
    scoringContext?: string;
  };
}

// Filter criteria types (from existing implementation)
export interface FlexibleFilterCriteria {
  productIds?: string[];
  search?: string;
  priceRange?: { min?: number; max?: number };
  brands?: string[];
  categories?: string[];
  categoryIds?: string[];
  includeSubcategories?: boolean;
  nutrition?: {
    kcal?: { min?: number; max?: number };
    protein?: { min?: number; max?: number };
    carbs?: { min?: number; max?: number };
    fat?: { min?: number; max?: number };
    fiber?: { min?: number; max?: number };
    salt?: { min?: number; max?: number };
  };
  flags?: {
    isHalal?: boolean | 'strict';
    isVegan?: boolean;
    isVegetarian?: boolean;
    isGlutenFree?: boolean;
    isLactoseFree?: boolean;
    isHighProtein?: boolean;
    isLowCarb?: boolean;
    isHighFiber?: boolean;
  };
  scores?: {
    healthScore?: { min?: number; max?: number; context?: 'global' | 'category_relative' };
    proteinEfficiency?: { min?: number; max?: number };
    satietyScore?: { min?: number; max?: number };
    postWorkoutScore?: { min?: number; max?: number; context?: string };
    fatLossScore?: { min?: number; max?: number };
    calorieEfficiency?: { min?: number; max?: number };
  };
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'price' | 'protein' | 'health_score' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

// Repository interfaces
export interface ProductRepository {
  queryProducts(criteria: FlexibleFilterCriteria): Promise<QueryResult<any>>;
  getProductDetails(productId: string): Promise<any | null>;
  getProductsByCategory(categoryId: string): Promise<any[]>;
}

export interface CategoryRepository {
  queryCategoryHierarchy(categoryId?: string): Promise<QueryResult<any>>;
  getCategoryTree(): Promise<any[]>;
  getCategoryStats(): Promise<any>;
}

export interface SearchRepository {
  searchProducts(query: string, options?: any): Promise<QueryResult<any>>;
  isSearchAvailable(): boolean;
}
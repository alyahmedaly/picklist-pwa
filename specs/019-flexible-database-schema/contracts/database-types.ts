/**
 * Database Type Contracts: Flexible Product Schema
 * Feature: 019-flexible-database-schema
 * Date: 2025-09-22
 * Purpose: TypeScript interfaces for normalized database schema
 */

// ============================================================================
// CORE ENTITY INTERFACES
// ============================================================================

/**
 * Product: Core product identity and basic attributes
 */
export interface Product {
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

/**
 * Category: Hierarchical product categorization
 */
export interface Category {
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

/**
 * ProductCategory: Many-to-many product-category relationship
 */
export interface ProductCategory {
  readonly product_id: string;
  readonly category_id: string;
  readonly is_primary: boolean;
  readonly relevance_score: number;
}

/**
 * ProductNutrition: Structured nutritional data per 100g
 */
export interface ProductNutrition {
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

/**
 * ProductFlag: Boolean dietary and classification flags
 */
export interface ProductFlag {
  readonly product_id: string;
  readonly flag_type: ProductFlagType;
  readonly flag_value: boolean;
  readonly confidence: number;
  readonly source: string;
}

/**
 * ProductScore: Multi-dimensional scoring system
 */
export interface ProductScore {
  readonly product_id: string;
  readonly score_type: ProductScoreType;
  readonly score_value: number;
  readonly context?: ProductScoreContext;
  readonly computed_at: number;
  readonly metadata?: string; // JSON metadata
}

/**
 * ProductAdditive: E-number and food additive information
 */
export interface ProductAdditive {
  readonly product_id: string;
  readonly e_number?: string;
  readonly additive_name: string;
  readonly functional_category: string;
  readonly dutch_category?: string;
  readonly safety_flags?: string; // JSON array
  readonly is_natural: boolean;
}

/**
 * ProductSearchTerm: Pre-computed search optimization terms
 */
export interface ProductSearchTerm {
  readonly product_id: string;
  readonly term: string;
  readonly term_type: SearchTermType;
  readonly weight: number;
  readonly language: 'nl' | 'en';
}

// ============================================================================
// ENUM TYPES
// ============================================================================

/**
 * Product flag types for dietary and classification flags
 */
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

/**
 * Product score types for multi-dimensional scoring
 */
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

/**
 * Product score contexts for situational scoring
 */
export type ProductScoreContext =
  | 'training_day'
  | 'rest_day'
  | 'cutting'
  | 'bulking'
  | 'maintenance';

/**
 * Search term types for categorized search terms
 */
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

// ============================================================================
// COMPOSITE VIEW INTERFACES
// ============================================================================

/**
 * ProductSummary: Denormalized product view for common queries
 */
export interface ProductSummary {
  readonly id: string;
  readonly name: string;
  readonly price_regular: number;
  readonly price_sale?: number;
  readonly primary_category?: string;
  readonly category_path?: string;
  readonly protein?: number;
  readonly kcal?: number;
  readonly carbs?: number;
  readonly fat?: number;
  readonly is_halal: boolean;
  readonly is_vegan: boolean;
  readonly is_high_protein: boolean;
}

/**
 * CategoryHierarchy: Category with parent/child relationship data
 */
export interface CategoryHierarchy {
  readonly id: string;
  readonly name: string;
  readonly parent_id?: string;
  readonly parent_name?: string;
  readonly path: string;
  readonly depth: number;
  readonly product_count: number;
  readonly descendant_count: number;
}

/**
 * ProductWithScores: Product with associated scores for ranking
 */
export interface ProductWithScores {
  readonly product: Product;
  readonly nutrition?: ProductNutrition;
  readonly primary_category?: Category;
  readonly scores: ProductScore[];
  readonly flags: ProductFlag[];
}

// ============================================================================
// QUERY RESULT INTERFACES
// ============================================================================

/**
 * SearchResult: Full-text search result with relevance
 */
export interface SearchResult {
  readonly product: ProductSummary;
  readonly relevance_score: number;
  readonly matched_terms: string[];
}

/**
 * FilterResult: Multi-dimensional filter result
 */
export interface FilterResult {
  readonly product: ProductSummary;
  readonly rank: number;
  readonly scores: Record<ProductScoreType, number>;
  readonly matched_criteria: string[];
}

/**
 * CategoryStats: Category-level analytics
 */
export interface CategoryStats {
  readonly category: Category;
  readonly avg_protein?: number;
  readonly avg_price: number;
  readonly halal_count: number;
  readonly total_products: number;
}

/**
 * ScoreDistribution: Score statistics for algorithm validation
 */
export interface ScoreDistribution {
  readonly score_type: ProductScoreType;
  readonly context?: ProductScoreContext;
  readonly product_count: number;
  readonly min_score: number;
  readonly max_score: number;
  readonly avg_score: number;
  readonly p25_score: number;
  readonly median_score: number;
  readonly p75_score: number;
}

// ============================================================================
// FILTER CRITERIA INTERFACES
// ============================================================================

/**
 * ProductFilter: Comprehensive filter criteria for product queries
 */
export interface ProductFilter {
  // Text search
  readonly search_query?: string;
  readonly search_in_ingredients?: boolean;

  // Price filtering
  readonly min_price?: number;
  readonly max_price?: number;

  // Nutritional filtering
  readonly min_protein?: number;
  readonly max_kcal?: number;
  readonly min_fiber?: number;
  readonly carb_protein_ratio_min?: number;
  readonly carb_protein_ratio_max?: number;

  // Category filtering
  readonly category_ids?: string[];
  readonly category_paths?: string[];
  readonly exclude_categories?: string[];

  // Flag filtering
  readonly required_flags?: ProductFlagType[];
  readonly excluded_flags?: ProductFlagType[];
  readonly flag_confidence_min?: number;

  // Additive filtering
  readonly allowed_e_numbers?: string[];
  readonly excluded_e_numbers?: string[];
  readonly natural_additives_only?: boolean;
  readonly max_additive_count?: number;

  // Score filtering
  readonly score_filters?: ScoreFilter[];
  readonly score_context?: ProductScoreContext;

  // Result options
  readonly limit?: number;
  readonly offset?: number;
  readonly sort_by?: SortOption[];
}

/**
 * ScoreFilter: Filter by specific score values
 */
export interface ScoreFilter {
  readonly score_type: ProductScoreType;
  readonly min_value?: number;
  readonly max_value?: number;
  readonly context?: ProductScoreContext;
}

/**
 * SortOption: Sorting options for query results
 */
export interface SortOption {
  readonly field: 'name' | 'price_regular' | 'protein' | 'kcal' | 'score_value' | 'relevance';
  readonly direction: 'asc' | 'desc';
  readonly score_type?: ProductScoreType; // Required when field is 'score_value'
}

// ============================================================================
// DATABASE OPERATION INTERFACES
// ============================================================================

/**
 * DatabaseConnection: Database connection interface
 */
export interface DatabaseConnection {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  get<T = any>(sql: string, params?: any[]): Promise<T | undefined>;
  run(sql: string, params?: any[]): Promise<void>;
  close(): Promise<void>;
}

/**
 * QueryBuilder: Fluent query builder interface
 */
export interface QueryBuilder {
  select(columns: string[]): QueryBuilder;
  from(table: string): QueryBuilder;
  join(table: string, condition: string): QueryBuilder;
  leftJoin(table: string, condition: string): QueryBuilder;
  where(condition: string, ...params: any[]): QueryBuilder;
  whereExists(subquery: string, ...params: any[]): QueryBuilder;
  orderBy(column: string, direction?: 'asc' | 'desc'): QueryBuilder;
  limit(count: number): QueryBuilder;
  offset(count: number): QueryBuilder;
  build(): { sql: string; params: any[] };
}

/**
 * ProductRepository: Data access layer interface
 */
export interface ProductRepository {
  // Basic CRUD operations
  findById(id: string): Promise<Product | undefined>;
  findByIds(ids: string[]): Promise<Product[]>;
  create(product: Omit<Product, 'created_at' | 'updated_at'>): Promise<Product>;
  update(id: string, updates: Partial<Product>): Promise<Product>;

  // Complex queries
  search(filter: ProductFilter): Promise<FilterResult[]>;
  findByCategory(categoryId: string, includeSubcategories?: boolean): Promise<ProductSummary[]>;
  findByFlags(flags: ProductFlagType[], requireAll?: boolean): Promise<ProductSummary[]>;
  findByScores(scoreFilters: ScoreFilter[]): Promise<ProductWithScores[]>;

  // Full-text search
  fullTextSearch(query: string, limit?: number): Promise<SearchResult[]>;

  // Analytics
  getCategoryStats(): Promise<CategoryStats[]>;
  getScoreDistribution(scoreType: ProductScoreType): Promise<ScoreDistribution[]>;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Validation schema for Product entity
 */
export const ProductSchema = {
  id: { type: 'string', required: true, maxLength: 50 },
  name: { type: 'string', required: true, maxLength: 200 },
  price_regular: { type: 'number', required: true, min: 0, max: 999.99 },
  price_sale: { type: 'number', min: 0, max: 999.99 },
  unit_amount: { type: 'number', required: true, min: 0 },
  unit_type: { type: 'string', required: true, enum: ['g', 'ml', 'pieces', 'kg', 'l'] },
  brand: { type: 'string', maxLength: 100 },
} as const;

/**
 * Validation schema for ProductNutrition entity
 */
export const ProductNutritionSchema = {
  product_id: { type: 'string', required: true },
  kcal: { type: 'number', min: 0, max: 1000 },
  protein: { type: 'number', min: 0, max: 100 },
  carbs: { type: 'number', min: 0, max: 100 },
  fat: { type: 'number', min: 0, max: 100 },
  fiber: { type: 'number', min: 0, max: 100 },
  salt: { type: 'number', min: 0, max: 50 },
} as const;

/**
 * Validation schema for ProductScore entity
 */
export const ProductScoreSchema = {
  product_id: { type: 'string', required: true },
  score_type: { type: 'string', required: true, enum: [
    'protein_efficiency', 'calorie_efficiency', 'satiety_score',
    'nutri_score', 'health_score', 'sustainability_score',
    'post_workout_score', 'fat_loss_score', 'budget_score', 'contextual_score'
  ]},
  score_value: { type: 'number', required: true, min: 0, max: 100 },
  context: { type: 'string', enum: ['training_day', 'rest_day', 'cutting', 'bulking', 'maintenance'] },
  computed_at: { type: 'number', required: true },
} as const;

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Database operation errors
 */
export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * Validation errors for entity constraints
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Query performance errors
 */
export class PerformanceError extends Error {
  constructor(
    message: string,
    public readonly queryTime: number,
    public readonly threshold: number
  ) {
    super(message);
    this.name = 'PerformanceError';
  }
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Deep readonly utility type
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Optional utility type for partial updates
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Database entity with timestamps
 */
export type WithTimestamps<T> = T & {
  readonly created_at: number;
  readonly updated_at: number;
};

/**
 * Query result with metadata
 */
export type QueryResult<T> = {
  readonly data: T[];
  readonly total_count: number;
  readonly has_more: boolean;
  readonly query_time_ms: number;
};
/**
 * Database Interface Types: Kysely Migration
 * Feature: 020-migration-kysely
 *
 * TypeScript interfaces for all database tables matching the flexible schema.
 * These types define the exact structure expected by the Kysely query builder.
 */

import type { Generated } from 'kysely';

// =============================================================================
// CORE TABLE INTERFACES
// =============================================================================

/**
 * Products table interface
 * Core product identity and basic attributes
 */
export interface ProductTable {
  readonly id: string;
  readonly name: string;
  readonly price_regular: number;
  readonly price_sale: number | null;
  readonly unit_amount: number;
  readonly unit_type: 'g' | 'ml' | 'pieces' | 'kg' | 'l';
  readonly brand: string | null;
  readonly created_at: Generated<number>;
  readonly updated_at: Generated<number>;
}

/**
 * Categories table interface
 * Hierarchical product categorization using nested set model
 */
export interface CategoryTable {
  readonly id: string;
  readonly name: string;
  readonly parent_id: string | null;
  readonly path: string;
  readonly depth: number;
  readonly left_bound: number;
  readonly right_bound: number;
  readonly product_count: Generated<number>;
  readonly display_order: number;
}

/**
 * Product-Category junction table interface
 * Many-to-many relationship with primary category designation
 */
export interface ProductCategoryTable {
  readonly product_id: string;
  readonly category_id: string;
  readonly is_primary: boolean;
  readonly relevance_score: number;
}

/**
 * Product nutrition table interface
 * Structured nutritional data per 100g
 */
export interface ProductNutritionTable {
  readonly product_id: string;
  readonly kcal: number | null;
  readonly kj: number | null;
  readonly protein: number | null;
  readonly carbs: number | null;
  readonly sugars: number | null;
  readonly fat: number | null;
  readonly saturated_fat: number | null;
  readonly fiber: number | null;
  readonly salt: number | null;
  readonly sodium: number | null;
}

/**
 * Product flags table interface
 * Boolean dietary and classification flags
 */
export interface ProductFlagTable {
  readonly product_id: string;
  readonly flag_type: ProductFlagType;
  readonly flag_value: boolean;
  readonly confidence: number;
  readonly source: string;
}

/**
 * Product scores table interface
 * Extensible multi-dimensional scoring system
 */
export interface ProductScoreTable {
  readonly product_id: string;
  readonly score_type: ProductScoreType;
  readonly score_value: number;
  readonly context: ProductScoreContext | null;
  readonly computed_at: Generated<number>;
  readonly metadata: string | null;
}

/**
 * Product additives table interface
 * E-number and food additive information
 */
export interface ProductAdditiveTable {
  readonly product_id: string;
  readonly e_number: string | null;
  readonly additive_name: string;
  readonly functional_category: string;
  readonly dutch_category: string | null;
  readonly safety_flags: string | null;
  readonly is_natural: boolean;
}

/**
 * Product search terms table interface (conditional)
 * Pre-computed search optimization - only exists when search is enabled
 */
export interface ProductSearchTermTable {
  readonly product_id: string;
  readonly term: string;
  readonly term_type: SearchTermType;
  readonly weight: number;
  readonly language: 'nl' | 'en';
}

// =============================================================================
// ENUM TYPES
// =============================================================================

/**
 * Product flag types enum
 * All supported boolean dietary and classification flags
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
 * Product score types enum
 * All supported multi-dimensional scoring types
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
 * Product score context enum
 * Contextual scoring modifiers for body composition goals
 */
export type ProductScoreContext =
  | 'training_day'
  | 'rest_day'
  | 'cutting'
  | 'bulking'
  | 'maintenance';

/**
 * Search term types enum
 * All supported search term categorizations
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

// =============================================================================
// DATABASE INTERFACE DEFINITIONS
// =============================================================================

/**
 * Main database interface definition
 * Contains all core tables that are always present
 */
export interface Database {
  products: ProductTable;
  categories: CategoryTable;
  product_categories: ProductCategoryTable;
  product_nutrition: ProductNutritionTable;
  product_flags: ProductFlagTable;
  product_scores: ProductScoreTable;
  product_additives: ProductAdditiveTable;
}

/**
 * Extended database interface with search functionality
 * Includes search tables when search is enabled
 */
export interface DatabaseWithSearch extends Database {
  product_search_terms: ProductSearchTermTable;
}

/**
 * Union type for conditional database interface
 * Runtime detection determines which interface is available
 */
export type FlexibleDatabase = Database | DatabaseWithSearch;

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard to detect if search tables are available
 * @param db - Database interface to check
 * @returns True if search tables are present
 */
export function hasSearchTables(db: FlexibleDatabase): db is DatabaseWithSearch {
  return 'product_search_terms' in db;
}

/**
 * Runtime check for search table availability
 * @param tableNames - Array of table names from database introspection
 * @returns True if product_search_terms table exists
 */
export function isSearchEnabled(tableNames: string[]): boolean {
  return tableNames.includes('product_search_terms');
}

// =============================================================================
// QUERY RESULT TYPES
// =============================================================================

/**
 * Base query options for pagination and sorting
 */
export interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Query result wrapper with metadata
 * @template T - Type of data returned in results
 */
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

// =============================================================================
// FILTER CRITERIA TYPES
// =============================================================================

/**
 * Comprehensive filter criteria for multi-dimensional product queries
 * Maps directly to the existing FlexibleFilterCriteria from loadFlexibleDatabase.ts
 */
export interface FlexibleFilterCriteria {
  // Basic product filters
  productIds?: string[];
  search?: string;
  priceRange?: { min?: number; max?: number };
  brands?: string[];

  // Category filters (hierarchical structure)
  categories?: string[];
  categoryIds?: string[];
  includeSubcategories?: boolean;

  // Nutrition filters
  nutrition?: {
    kcal?: { min?: number; max?: number };
    protein?: { min?: number; max?: number };
    carbs?: { min?: number; max?: number };
    fat?: { min?: number; max?: number };
    fiber?: { min?: number; max?: number };
    salt?: { min?: number; max?: number };
  };

  // Dietary and flag filters
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

  // Advanced scoring filters
  scores?: {
    healthScore?: { min?: number; max?: number; context?: 'global' | 'category_relative' };
    proteinEfficiency?: { min?: number; max?: number };
    satietyScore?: { min?: number; max?: number };
    postWorkoutScore?: { min?: number; max?: number; context?: string };
    fatLossScore?: { min?: number; max?: number };
    calorieEfficiency?: { min?: number; max?: number };
  };

  // Result options
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'price' | 'protein' | 'health_score' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

// =============================================================================
// DATABASE SCHEMA VALIDATION
// =============================================================================

/**
 * Schema validation configuration
 * Defines expected tables and their requirements
 */
export interface SchemaValidationConfig {
  readonly requiredTables: string[];
  readonly optionalTables: string[];
  readonly minIndexCount: number;
  readonly minViewCount: number;
}

/**
 * Default schema configuration for validation
 */
export const DEFAULT_SCHEMA_CONFIG: SchemaValidationConfig = {
  requiredTables: [
    'products',
    'categories',
    'product_categories',
    'product_nutrition',
    'product_flags',
    'product_scores',
    'product_additives'
  ],
  optionalTables: [
    'product_search_terms'
  ],
  minIndexCount: 3, // Minimum required indexes for performance
  minViewCount: 2   // Minimum required views
};
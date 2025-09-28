/**
 * Flexible Schema TypeScript Definitions
 * Feature: 019-flexible-database-schema
 *
 * TypeScript interfaces and types for the flexible database schema
 * frontend integration, matching the normalized database structure.
 */

/**
 * Core flexible schema product entity
 */
export interface FlexibleProduct {
  id: string;
  name: string;
  price_regular: number;
  price_sale?: number;
  unit_amount?: number;
  unit_type?: string;
  brand?: string;
  created_at?: number;
  updated_at?: number;
}

/**
 * Category entity with hierarchical structure (nested set model)
 */
export interface FlexibleCategory {
  id: string;
  name: string;
  parent_id?: string;
  path?: string;
  depth: number;
  left_bound: number;
  right_bound: number;
  product_count: number;
  display_order?: number;
}

/**
 * Product-category relationship with relevance scoring
 */
export interface FlexibleProductCategory {
  product_id: string;
  category_id: string;
  is_primary: boolean;
  relevance_score?: number;
}

/**
 * Normalized nutrition data per 100g/100ml
 */
export interface FlexibleProductNutrition {
  product_id: string;
  kcal?: number;
  kj?: number;
  protein?: number;
  carbs?: number;
  sugars?: number;
  fat?: number;
  saturated_fat?: number;
  fiber?: number;
  salt?: number;
  sodium?: number;
}

/**
 * Product flags for dietary and classification information
 */
export interface FlexibleProductFlag {
  product_id: string;
  flag_type: FlexibleFlagType;
  flag_value: boolean;
  confidence?: number;
  source?: string;
}

/**
 * Valid flag types for product classification
 */
export type FlexibleFlagType =
  | 'is_food'
  | 'is_pet_food'
  | 'is_halal'
  | 'is_vegan'
  | 'is_vegetarian'
  | 'is_gluten_free'
  | 'is_lactose_free'
  | 'is_high_protein'
  | 'is_low_carb'
  | 'is_high_fiber'
  | 'is_organic'
  | 'is_kosher'
  | 'added_sugar_flag'
  | 'added_salt_flag'
  | 'artificial_sweeteners_flag';

/**
 * Contextual scoring system for multi-dimensional product evaluation
 */
export interface FlexibleProductScore {
  product_id: string;
  score_type: FlexibleScoreType;
  score_value: number; // 0-100 scale
  context?: FlexibleScoreContext;
  computed_at: number;
  metadata?: string; // JSON-encoded algorithm details
}

/**
 * Valid score types for product evaluation
 */
export type FlexibleScoreType =
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
 * Valid contexts for scoring algorithms
 */
export type FlexibleScoreContext =
  | 'training_day'
  | 'rest_day'
  | 'cutting'
  | 'bulking'
  | 'maintenance'
  | 'category_relative'
  | 'global';

/**
 * Food additive information with E-number classification
 */
export interface FlexibleProductAdditive {
  product_id: string;
  e_number?: string;
  additive_name?: string;
  functional_category?: string;
  dutch_category?: string;
  safety_flags?: string; // JSON-encoded safety information
  is_natural?: boolean;
}

/**
 * Pre-computed search terms for optimized full-text search
 */
export interface FlexibleProductSearchTerm {
  product_id: string;
  term: string;
  term_type: FlexibleSearchTermType;
  weight: number; // 0-100 relevance weight
  language: 'en' | 'nl';
}

/**
 * Valid search term types for categorized search
 */
export type FlexibleSearchTermType =
  | 'name'
  | 'brand'
  | 'ingredient'
  | 'category'
  | 'synonym'
  | 'alternative_name'
  | 'description'
  | 'nutritional_tag'
  | 'dietary_flag';

/**
 * Complete product with all related data for frontend display
 */
export interface FlexibleProductComplete extends FlexibleProduct {
  // Related data
  nutrition?: FlexibleProductNutrition;
  categories?: FlexibleCategory[];
  flags?: FlexibleProductFlag[];
  scores?: FlexibleProductScore[];
  additives?: FlexibleProductAdditive[];
  searchTerms?: FlexibleProductSearchTerm[];

  // Computed display fields
  primaryCategory?: FlexibleCategory;
  displayPrice: number;
  isOnSale: boolean;
  relevanceScore?: number;
  matchedTerms?: string[];

  // Ali-specific computed fields
  proteinPer100g?: number;
  caloriesPer100g?: number;
  isHalal?: boolean;
  halalConfidence?: number;
  healthGrade?: 'A' | 'B' | 'C' | 'D' | 'E';
  proteinEfficiencyScore?: number;
  postWorkoutScore?: number;
  fatLossScore?: number;
}

/**
 * Category tree node for hierarchical navigation
 */
export interface FlexibleCategoryNode extends FlexibleCategory {
  children?: FlexibleCategoryNode[];
  isExpanded?: boolean;
  isSelected?: boolean;
  isVisible?: boolean;
  productIds?: string[];
}

/**
 * Multi-dimensional filter criteria (from loadFlexibleDatabase.ts)
 */
export interface FlexibleFilterCriteria {
  // Basic product filters
  productIds?: string[];
  search?: string;
  priceRange?: { min?: number; max?: number };
  brands?: string[];

  // Category filters (leverages hierarchical structure)
  categories?: string[];
  categoryIds?: string[];
  includeSubcategories?: boolean;
  categoryDepth?: { min?: number; max?: number };

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

  // Additive filters
  additives?: {
    excludeENumbers?: string[];
    excludeCategories?: string[];
    allowNaturalOnly?: boolean;
    excludeSouthamptonSix?: boolean;
  };

  // Search and text filters
  searchTerms?: {
    terms?: string[];
    languages?: ('en' | 'nl')[];
    termTypes?: FlexibleSearchTermType[];
    minWeight?: number;
  };

  // Result options
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'price' | 'protein' | 'health_score' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Query result with comprehensive metadata
 */
export interface FlexibleQueryResult<T = any> {
  data: T[];
  totalCount: number;
  filteredCount: number;
  queryTimeMs: number;
  metadata: {
    searchPerformed: boolean;
    categoryHierarchyUsed: boolean;
    multiDimensionalFiltering: boolean;
    scoringContext?: string;
  };
}

/**
 * Ali-specific filter profiles for common use cases
 */
export type AliFilterProfile =
  | 'daily-protein'    // Halal + high protein for daily intake
  | 'post-workout'     // Recovery optimization with carb:protein ratios
  | 'cutting'          // Fat loss compatible foods
  | 'budget'           // Cost-efficient protein sources
  | 'training-day'     // Training day nutrition (higher carbs)
  | 'rest-day';        // Rest day nutrition (lower carbs, higher fat)

/**
 * Ali-specific filter configuration
 */
export interface AliFilterConfig {
  profile: AliFilterProfile;
  customOverrides?: Partial<FlexibleFilterCriteria>;
  enabled: boolean;
  autoRefresh?: boolean;
}

/**
 * Flexible schema statistics for monitoring and debugging
 */
export interface FlexibleSchemaStats {
  products: number;
  categories: number;
  productCategories: number;
  nutritionRecords: number;
  flags: number;
  scores: number;
  additives: number;
  searchTerms: number;
  lastUpdated?: number;
  schemaVersion?: string;
}

/**
 * UI state for flexible product queries
 */
export interface FlexibleProductsUIState {
  // Query state
  currentCriteria: FlexibleFilterCriteria;
  isLoading: boolean;
  error: string | null;

  // Results
  products: FlexibleProductComplete[];
  totalCount: number;
  queryTimeMs: number;

  // UI state
  selectedProducts: string[];
  expandedCategories: string[];
  currentView: 'list' | 'grid' | 'table';
  sortBy: string;
  sortOrder: 'asc' | 'desc';

  // Pagination
  currentPage: number;
  pageSize: number;

  // Filters UI
  activeFilters: string[];
  filterPanelOpen: boolean;
  searchQuery: string;
  searchSuggestions: string[];
}

/**
 * Component props for flexible schema components
 */
export interface FlexibleProductListProps {
  criteria?: FlexibleFilterCriteria;
  onProductSelect?: (product: FlexibleProductComplete) => void;
  onCriteriaChange?: (criteria: FlexibleFilterCriteria) => void;
  enableVirtualization?: boolean;
  pageSize?: number;
  enableSearch?: boolean;
  enableFilters?: boolean;
  viewMode?: 'list' | 'grid' | 'table';
}

export interface FlexibleCategoryTreeProps {
  onCategorySelect?: (category: FlexibleCategory) => void;
  enableMultiSelect?: boolean;
  showProductCounts?: boolean;
  expandByDefault?: boolean;
  maxDepth?: number;
}

export interface FlexibleSearchProps {
  onSearch?: (query: string, results: FlexibleQueryResult) => void;
  placeholder?: string;
  debounceMs?: number;
  minQueryLength?: number;
  enableSuggestions?: boolean;
  languages?: ('en' | 'nl')[];
}

/**
 * Flexible schema database connection status
 */
export interface FlexibleSchemaConnection {
  isConnected: boolean;
  isAvailable: boolean;
  schemaVersion?: string;
  lastChecked?: number;
  error?: string;
}

/**
 * Performance metrics for flexible schema operations
 */
export interface FlexibleSchemaPerformance {
  averageQueryTimeMs: number;
  slowQueries: Array<{
    sql: string;
    timeMs: number;
    timestamp: number;
  }>;
  indexUsage: Array<{
    indexName: string;
    usageCount: number;
    effectiveness: number;
  }>;
  cacheHitRate?: number;
}

/**
 * Flexible schema validation result
 */
export interface FlexibleSchemaValidation {
  isValid: boolean;
  version: string;
  timestamp: number;
  errors: string[];
  warnings: string[];
  tableCount: number;
  indexCount: number;
  recordCounts: FlexibleSchemaStats;
}

/**
 * Type guards for flexible schema entities
 */
export const isFlexibleProduct = (obj: any): obj is FlexibleProduct => {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
};

export const isFlexibleCategory = (obj: any): obj is FlexibleCategory => {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string' && typeof obj.depth === 'number';
};

export const isFlexibleProductComplete = (obj: any): obj is FlexibleProductComplete => {
  return isFlexibleProduct(obj) && typeof obj.displayPrice === 'number';
};

/**
 * Helper types for scoring contexts
 */
export type TrainingContext = 'training_day' | 'rest_day';
export type BodyCompositionContext = 'cutting' | 'bulking' | 'maintenance';
export type MealTimingContext = 'pre_workout' | 'post_workout' | 'general';

/**
 * Ali-specific nutrition targets
 */
export interface AliNutritionTargets {
  dailyProtein: number; // 170g default
  trainingDayCalories: number; // 2000 kcal
  trainingDayCarbs: number; // 220g
  restDayCalories: number; // 1750 kcal
  restDayCarbs: number; // 120g
  budgetPerWeek: number; // €50 default
  halalRequirement: boolean | 'strict';
}

/**
 * Default Ali nutrition targets
 */
export const DEFAULT_ALI_TARGETS: AliNutritionTargets = {
  dailyProtein: 170,
  trainingDayCalories: 2000,
  trainingDayCarbs: 220,
  restDayCalories: 1750,
  restDayCarbs: 120,
  budgetPerWeek: 50,
  halalRequirement: 'strict'
} as const;
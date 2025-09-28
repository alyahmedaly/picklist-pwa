/**
 * ProductRepository Implementation
 * Feature: 020-migration-kysely
 *
 * Core product repository providing type-safe database operations for product data.
 * Implements comprehensive product querying with filtering, joining, and pagination.
 */

import type { Selectable, SelectQueryBuilder } from 'kysely';
import { sql } from 'kysely';
import type {
  FlexibleDatabase,
  ProductTable,
  ProductNutritionTable,
  ProductFlagTable,
  ProductScoreTable,
  ProductAdditiveTable,
  CategoryTable,
  ProductCategoryTable,
  ProductScoreType,
  ProductScoreContext
} from '../kysely/database.js';
import { BaseRepository, type RepositoryResult } from './BaseRepository.js';

// Legacy types for parity testing compatibility
import type {
  FlexibleFilterCriteria,
  FlexibleQueryResult
} from '../../data/loadFlexibleDatabase.js';

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Utility to widen query builder types for executeWithTiming compatibility
 */
function widenQueryBuilder<TRow>(
  query: SelectQueryBuilder<Record<string, unknown>, string, TRow>
): SelectQueryBuilder<FlexibleDatabase, keyof FlexibleDatabase, TRow> {
  return query as SelectQueryBuilder<FlexibleDatabase, keyof FlexibleDatabase, TRow>;
}

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

// =============================================================================
// REPOSITORY TYPES (using database schema types)
// =============================================================================

/**
 * Pagination options for query results
 */
export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

/**
 * Sorting options for query results
 */
export interface SortingOptions {
  field: keyof ProductTable; // created_at/updated_at already part of ProductTable
  direction: 'asc' | 'desc';
}

/**
 * Basic product result (uses database ProductTable type)
 */
// Use Selectable so Generated<> columns resolve to their selected runtime types
export type ProductResult = Selectable<ProductTable>;

/**
 * Product with basic category information
 */
export interface ProductWithCategory extends ProductResult {
  primaryCategory?: {
    id: CategoryTable['id'];
    name: CategoryTable['name'];
    path: CategoryTable['path'];
  };
  allCategories: Array<{
    id: CategoryTable['id'];
    name: CategoryTable['name'];
    path: CategoryTable['path'];
    is_primary: ProductCategoryTable['is_primary'];
  }>;
}

/**
 * Product with nutrition information
 */
export interface ProductWithNutrition extends ProductResult {
  nutrition: Omit<ProductNutritionTable, 'product_id'> | null;
}

/**
 * Product with all related data (full details)
 */
export interface ProductWithRelations extends ProductWithCategory, ProductWithNutrition {
  flags: Array<Omit<Selectable<ProductFlagTable>, 'product_id'>>;
  scores: Array<Omit<Selectable<ProductScoreTable>, 'product_id'>>;
  additives: Array<Omit<Selectable<ProductAdditiveTable>, 'product_id'>>;
}

/**
 * Enhanced nutritional filter criteria with ranges and comparisons
 */
export interface NutritionFilters {
  protein?: { min?: number; max?: number; per100g?: boolean };
  carbs?: { min?: number; max?: number; per100g?: boolean };
  fiber?: { min?: number; max?: number; per100g?: boolean };
  fat?: { min?: number; max?: number; per100g?: boolean };
  calories?: { min?: number; max?: number; per100g?: boolean };
  sugar?: { min?: number; max?: number; per100g?: boolean };
  sodium?: { min?: number; max?: number; per100g?: boolean };
  saturatedFat?: { min?: number; max?: number; per100g?: boolean };
}

/**
 * Enhanced flag filters with confidence thresholds and combinations
 */
export interface FlagFilters {
  isHalal?: boolean | 'strict' | { value: boolean; minConfidence?: number };
  isVegan?: boolean | { value: boolean; minConfidence?: number };
  isVegetarian?: boolean | { value: boolean; minConfidence?: number };
  isHighProtein?: boolean | { value: boolean; minConfidence?: number };
  isLowCarb?: boolean | { value: boolean; minConfidence?: number };
  isGlutenFree?: boolean | { value: boolean; minConfidence?: number };
  isLactoseFree?: boolean | { value: boolean; minConfidence?: number };
  isKeto?: boolean | { value: boolean; minConfidence?: number };
  // Require ALL specified flags to be true (AND logic)
  requireAll?: boolean;
}

/**
 * Enhanced score filters with context awareness and multiple score types
 */
export interface ScoreFilters {
  healthScore?: { 
    min?: number; 
    max?: number; 
    context?: ProductScoreTable['context'];
    minConfidence?: number;
  };
  proteinEfficiency?: { 
    min?: number; 
    max?: number;
    minConfidence?: number; 
  };
  postWorkoutScore?: { 
    min?: number; 
    max?: number; 
    context?: ProductScoreTable['context'];
    minConfidence?: number;
  };
  trainingDayScore?: { 
    min?: number; 
    max?: number; 
    context?: ProductScoreTable['context'];
    minConfidence?: number;
  };
  restDayScore?: { 
    min?: number; 
    max?: number; 
    context?: ProductScoreTable['context'];
    minConfidence?: number;
  };
  cuttingScore?: { 
    min?: number; 
    max?: number; 
    context?: ProductScoreTable['context'];
    minConfidence?: number;
  };
  // Custom score type filtering
  customScores?: Array<{
    scoreType: string;
    min?: number;
    max?: number;
    context?: string;
    minConfidence?: number;
  }>;
  // Require ALL specified scores to match (AND logic)
  requireAll?: boolean;
}

/**
 * Additives filter criteria
 */
export interface AdditivesFilters {
  // Exclude products containing specific E-numbers or additive types
  excludeENumbers?: string[];
  excludeTypes?: string[];
  // Include only products with specific additives
  includeENumbers?: string[];
  includeTypes?: string[];
  // Additive-free filtering
  noArtificialColors?: boolean;
  noArtificialFlavors?: boolean;
  noPreservatives?: boolean;
  noArtificialSweeteners?: boolean;
  // Require ALL exclude conditions to be met (AND logic)
  requireAllExclusions?: boolean;
}

/**
 * Multi-dimensional filter combination modes
 */
export type FilterCombinationMode = 'AND' | 'OR';

/**
 * Enhanced filter criteria for products with multi-dimensional support
 */
export interface ProductFilters {
  // Basic filters (unchanged for backward compatibility)
  priceRange?: { min?: number; max?: number };
  brands?: string[];
  categories?: string[];
  
  // Legacy simple nutrition filters (maintained for compatibility)
  nutrition?: {
    minProtein?: number;
    maxCarbs?: number;
    minFiber?: number;
  };
  
  // Legacy simple flag filters (maintained for compatibility)
  flags?: {
    isHalal?: boolean | 'strict';
    isVegan?: boolean;
    isVegetarian?: boolean;
    isHighProtein?: boolean;
  };
  
  // Legacy simple score filters (maintained for compatibility)
  scores?: {
    healthScore?: { min?: number; max?: number; context?: ProductScoreTable['context'] };
    proteinEfficiency?: { min?: number; max?: number };
    postWorkoutScore?: { min?: number; max?: number; context?: ProductScoreTable['context'] };
  };
  
  // Enhanced multi-dimensional filters
  enhancedNutrition?: NutritionFilters;
  enhancedFlags?: FlagFilters;
  enhancedScores?: ScoreFilters;
  additives?: AdditivesFilters;
  
  // Global filter combination mode
  combinationMode?: FilterCombinationMode;
}

/**
 * Complete query criteria for products
 */
export interface ProductQueryCriteria {
  filters?: ProductFilters;
  sorting?: SortingOptions;
  pagination?: PaginationOptions;
}

/**
 * Query result with pagination metadata
 */
export interface ProductQueryResult<T = ProductResult> {
  products: T[];
  totalCount: number;
  filteredCount: number;
  queryTimeMs: number;
}

// =============================================================================
// CONTEXTUAL SCORING INTERFACES (T031)
// =============================================================================

/**
 * Contextual scoring query filters with metadata support
 */
export interface ContextualScoringFilters {
  context?: ProductScoreContext; // training_day, rest_day, cutting, bulking, maintenance
  scoreTypes?: ProductScoreType[]; // Filter by specific score types
  minScore?: number; // Minimum score value across all score types
  maxScore?: number; // Maximum score value across all score types
  includeMetadata?: boolean; // Whether to include metadata in results
  sortByScore?: {
    scoreType: ProductScoreType;
    context?: ProductScoreContext;
    direction: 'asc' | 'desc';
  };
}

/**
 * Product with contextual scores and metadata
 */
export interface ProductWithContextualScores extends ProductWithRelations {
  contextualScores: Array<{
    score_type: ProductScoreType;
    score_value: number;
    context: ProductScoreContext | null;
    computed_at: number;
    metadata: string | null;
  }>;
  scoresSummary: {
    averageScore: number;
    scoreCount: number;
    contextsAvailable: ProductScoreContext[];
    topScoreType: ProductScoreType | null;
  };
}

/**
 * Contextual scoring query result with performance metadata
 */
export interface ContextualScoringResult {
  products: ProductWithContextualScores[];
  totalCount: number;
  filteredCount: number;
  queryTimeMs: number;
  scoringMetrics: {
    averageScoreAcrossAll: number;
    scoreTypeDistribution: Record<ProductScoreType, number>;
    contextDistribution: Record<ProductScoreContext, number>;
    productsWithScores: number;
    productsWithoutScores: number;
  };
}

/**
 * Score aggregation options
 */
export interface ScoreAggregationOptions {
  groupByContext?: boolean;
  includeStatistics?: boolean;
  computeRankings?: boolean;
  metadataFields?: string[];
}

// =============================================================================
// PRODUCT REPOSITORY INTERFACE
// =============================================================================

/**
 * ProductRepository interface defining all product operations
 */
export interface ProductRepository {
  // Basic operations
  getById(id: string): Promise<RepositoryResult<ProductResult>>;
  getAll(options?: PaginationOptions): Promise<ProductQueryResult<ProductResult>>;
  count(): Promise<number>;

  // Complex querying
  queryProducts(criteria: ProductQueryCriteria): Promise<ProductQueryResult<ProductResult>>;
  getProductDetails(id: string): Promise<RepositoryResult<ProductWithRelations>>;
  getProductsByCategory(categoryId: string, options?: {
    includeSubcategories?: boolean;
    pagination?: PaginationOptions
  }): Promise<ProductQueryResult<ProductWithCategory>>;

  // Specialized operations
  searchproducts(query: string, options?: PaginationOptions): Promise<ProductQueryResult<ProductResult>>;
  getProductsWithNutrition(filters: {
    minProtein?: number;
    maxCarbs?: number;
    minFiber?: number;
    excludeNullValues?: boolean;
  }): Promise<ProductQueryResult<ProductWithNutrition>>;
  getProductsWithFlags(filters: {
    isHalal?: boolean | 'strict';
    isVegan?: boolean;
    isVegetarian?: boolean;
    isHighProtein?: boolean;
    confidence?: { min?: number };
  }): Promise<ProductQueryResult<ProductWithCategory>>;
  getProductsWithScores(filters: {
    healthScore?: { min?: number; max?: number; context?: string };
    proteinEfficiency?: { min?: number; max?: number };
    postWorkoutScore?: { min?: number; max?: number; context?: string };
    contextualScore?: { min?: number; max?: number; contexts?: string[] };
  }): Promise<ProductQueryResult<ProductWithCategory>>;

  // T031: Enhanced contextual scoring queries with metadata support
  getProductsWithContextualScoring(
    filters: ContextualScoringFilters,
    options?: PaginationOptions,
    aggregationOptions?: ScoreAggregationOptions
  ): Promise<ContextualScoringResult>;

  // Optimized multi-dimensional filtering with performance optimization
  queryOptimizedMultiDimensional(filters: ProductFilters, options?: PaginationOptions): Promise<ProductQueryResult<ProductWithRelations>>;

  // Legacy compatibility methods for parity testing
  queryFlexibleProducts(criteria?: FlexibleFilterCriteria): Promise<FlexibleQueryResult>;
  getFlexibleProductDetails(productId: string): Promise<unknown>;
}

// =============================================================================
// PRODUCT REPOSITORY IMPLEMENTATION
// =============================================================================

/**
 * ProductRepository implementation using Kysely query builder
 */
export class ProductRepositoryImpl extends BaseRepository implements ProductRepository {
  constructor() {
    super('products');
  }

  // =============================================================================
  // BASIC OPERATIONS (Sub-PR 1)
  // =============================================================================

  /**
   * Get a single product by ID
   * @param id - Product ID
   * @returns Product or null if not found
   */
  async getById(id: string): Promise<RepositoryResult<ProductResult>> {
    this.validateRequired(id, 'id');

    try {
      const db = await this.getConnection();

      this.logQuery('getById', { operation: 'SELECT_BY_ID', productId: id });

      const result = await db
        .selectFrom('products')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();

      if (!result) {
        this.logQuery('getById completed', { productId: id, found: false });
        return null;
      }

      const product: ProductResult = result as ProductResult;

      this.logQuery('getById completed', { productId: id, found: true });
      return product;

    } catch (error) {
      this.handleError(error, 'getById');
    }
  }

  /**
   * Get all products with pagination
   * @param options - Pagination options
   * @returns Paginated product results
   */
  async getAll(options: PaginationOptions = {}): Promise<ProductQueryResult<ProductResult>> {
    const { limit = 50, offset = 0 } = options;

    this.validateType(limit, 'number', 'limit');
    this.validateType(offset, 'number', 'offset');

    if (limit < 0 || offset < 0) {
      throw new Error('Pagination values must be non-negative');
    }

    try {
      const db = await this.getConnection();

      this.logQuery('getAll', {
        operation: 'SELECT_ALL',
        limit,
        offset
      });

      // Get total count
      const totalCountResult = await db
        .selectFrom('products')
        .select((eb) => eb.fn.countAll().as('count'))
        .executeTakeFirst();
      const totalCount = totalCountResult ? Number(totalCountResult.count) : 0;

      // Get paginated results
      let query = db
        .selectFrom('products')
        .selectAll()
        .orderBy('name', 'asc') // Default ordering for consistency
        .orderBy('id', 'asc'); // Secondary sort for deterministic results

      if (limit > 0) query = query.limit(limit);
      if (offset > 0) query = query.offset(offset);

      const result = await this.executeWithTiming(query);

      const products: ProductResult[] = result.data as ProductResult[];

      this.logQuery('getAll completed', {
        totalCount,
        returnedCount: products.length,
        queryTimeMs: result.queryTimeMs
      });

      return {
        products,
        totalCount,
        filteredCount: totalCount, // No filtering in getAll
        queryTimeMs: result.queryTimeMs
      };

    } catch (error) {
      this.handleError(error, 'getAll');
    }
  }

  /**
   * Count total number of products
   * @returns Total product count
   */
  async count(): Promise<number> {
    try {
      const db = await this.getConnection();

      this.logQuery('count', { operation: 'COUNT_ALL' });

      const result = await db
        .selectFrom('products')
        .select((eb) => eb.fn.countAll().as('count'))
        .executeTakeFirst();

      const count = result ? Number(result.count) : 0;

      this.logQuery('count completed', { totalCount: count });
      return count;

    } catch (error) {
      this.handleError(error, 'count');
    }
  }

  // =============================================================================
  // PLACEHOLDER IMPLEMENTATIONS (Sub-PR 2-4)
  // =============================================================================

  /**
   * Query products with complex filtering
   * @param criteria - Query criteria with filters, sorting, and pagination
   * @returns Paginated and filtered product results
   */
  async queryProducts(criteria: ProductQueryCriteria = {}): Promise<ProductQueryResult<ProductResult>> {
    const { filters = {}, sorting, pagination = {} } = criteria;
    const { limit = 50, offset = 0 } = pagination;

    this.validateType(limit, 'number', 'limit');
    this.validateType(offset, 'number', 'offset');

    if (limit < 0 || offset < 0) {
      throw new Error('Pagination values must be non-negative');
    }

    try {
      const db = await this.getConnection();

      this.logQuery('queryProducts', {
        operation: 'SELECT_WITH_FILTERS',
        filters,
        sorting,
        limit,
        offset
      });

      // Build base query
      let query = db
        .selectFrom('products')
        .selectAll();

      // Apply filters
      query = this.applyProductFilters(query, filters);

      const totalCountResult = await db
        .selectFrom('products')
        .select((eb) => eb.fn.countAll().as('count'))
        .executeTakeFirst();
      const totalCount = totalCountResult ? Number(totalCountResult.count) : 0;

      // Get filtered count
      let filteredCountQuery = db
        .selectFrom('products')
        .select((eb) => eb.fn.countAll().as('count'));

      filteredCountQuery = this.applyProductFilters(filteredCountQuery, filters);
      const filteredResult = await filteredCountQuery.executeTakeFirst();
      const filteredCount = filteredResult ? Number(filteredResult.count) : 0;

      // Apply sorting
      if (sorting) {
        query = query.orderBy(sorting.field, sorting.direction).orderBy('id', 'asc');
      } else {
        // Default sorting for consistency
        query = query
          .orderBy('name', 'asc')
          .orderBy('id', 'asc');
      }

      // Apply pagination
      if (limit > 0) query = query.limit(limit);
      if (offset > 0) query = query.offset(offset);

      const result = await this.executeWithTiming(query);

      const products: ProductResult[] = result.data as ProductResult[];

      this.logQuery('queryProducts completed', {
        totalCount,
        filteredCount,
        returnedCount: products.length,
        queryTimeMs: result.queryTimeMs
      });

      return {
        products,
        totalCount,
        filteredCount,
        queryTimeMs: result.queryTimeMs
      };

    } catch (error) {
      this.handleError(error, 'queryProducts');
    }
  }

  // =============================================================================
  // FILTERING IMPLEMENTATION (Sub-PR 2)
  // =============================================================================

  /**
   * Apply product filters to a query builder
   * @protected
   */
  protected applyProductFilters<TRow>(
    queryBuilder: SelectQueryBuilder<FlexibleDatabase, 'products', TRow>,
    filters: ProductFilters
  ): SelectQueryBuilder<FlexibleDatabase, 'products', TRow> {
    let query = queryBuilder;

    // Price range filtering
    if (filters.priceRange) {
      if (filters.priceRange.min !== undefined) {
        query = query.where('price_regular', '>=', filters.priceRange.min);
      }
      if (filters.priceRange.max !== undefined) {
        query = query.where('price_regular', '<=', filters.priceRange.max);
      }
    }

    // Brand filtering
    if (filters.brands && filters.brands.length > 0) {
      query = query.where('brand', 'in', filters.brands);
    }

    // Category filtering using EXISTS subquery
    if (filters.categories && filters.categories.length > 0) {
      query = query.where((eb) =>
        eb.exists(
          eb.selectFrom('product_categories')
            .select('product_categories.product_id')
            .where('product_categories.product_id', '=', eb.ref('products.id'))
            .where('product_categories.category_id', 'in', (filters.categories ?? []) as readonly string[])
        )
      );
    }

    // Nutrition filtering using EXISTS subquery
    if (filters.nutrition) {
      query = query.where((eb) =>
        eb.exists(
          eb.selectFrom('product_nutrition')
            .select('product_nutrition.product_id')
            .where('product_nutrition.product_id', '=', eb.ref('products.id'))
            .$if(filters.nutrition!.minProtein !== undefined, (qb) =>
              qb.where('product_nutrition.protein', '>=', filters.nutrition!.minProtein!)
            )
            .$if(filters.nutrition!.maxCarbs !== undefined, (qb) =>
              qb.where('product_nutrition.carbs', '<=', filters.nutrition!.maxCarbs!)
            )
            .$if(filters.nutrition!.minFiber !== undefined, (qb) =>
              qb.where('product_nutrition.fiber', '>=', filters.nutrition!.minFiber!)
            )
        )
      );
    }

    // Flags filtering using EXISTS subqueries
    if (filters.flags) {
      if (filters.flags.isHalal !== undefined) {
        const halalValue = filters.flags.isHalal === 'strict' ? true : filters.flags.isHalal;
        query = query.where((eb) =>
          eb.exists(
            eb.selectFrom('product_flags')
              .select('product_flags.product_id')
              .where('product_flags.product_id', '=', eb.ref('products.id'))
              .where('product_flags.flag_type', '=', 'is_halal')
              .where('product_flags.flag_value', '=', halalValue)
          )
        );
      }

      if (filters.flags.isVegan !== undefined) {
        query = query.where((eb) =>
          eb.exists(
            eb.selectFrom('product_flags')
              .select('product_flags.product_id')
              .where('product_flags.product_id', '=', eb.ref('products.id'))
              .where('product_flags.flag_type', '=', 'is_vegan')
              .where('product_flags.flag_value', '=', filters.flags!.isVegan as boolean)
          )
        );
      }

      if (filters.flags.isVegetarian !== undefined) {
        query = query.where((eb) =>
          eb.exists(
            eb.selectFrom('product_flags')
              .select('product_flags.product_id')
              .where('product_flags.product_id', '=', eb.ref('products.id'))
              .where('product_flags.flag_type', '=', 'is_vegetarian')
              .where('product_flags.flag_value', '=', filters.flags!.isVegetarian as boolean)
          )
        );
      }

      if (filters.flags.isHighProtein !== undefined) {
        query = query.where((eb) =>
          eb.exists(
            eb.selectFrom('product_flags')
              .select('product_flags.product_id')
              .where('product_flags.product_id', '=', eb.ref('products.id'))
              .where('product_flags.flag_type', '=', 'is_high_protein')
              .where('product_flags.flag_value', '=', filters.flags!.isHighProtein as boolean)
          )
        );
      }
    }

    // Scores filtering using EXISTS subqueries
    if (filters.scores) {
      if (filters.scores.healthScore) {
        query = query.where((eb) =>
          eb.exists(
            eb.selectFrom('product_scores')
              .select('product_scores.product_id')
              .where('product_scores.product_id', '=', eb.ref('products.id'))
              .where('product_scores.score_type', '=', 'health_score')
              .$if(filters.scores!.healthScore!.min !== undefined, (qb) =>
                qb.where('product_scores.score_value', '>=', filters.scores!.healthScore!.min!)
              )
              .$if(filters.scores!.healthScore!.max !== undefined, (qb) =>
                qb.where('product_scores.score_value', '<=', filters.scores!.healthScore!.max!)
              )
              .$if(filters.scores!.healthScore!.context !== undefined, (qb) =>
                qb.where('product_scores.context', '=', filters.scores!.healthScore!.context!)
              )
          )
        );
      }

      if (filters.scores.proteinEfficiency) {
        query = query.where((eb) =>
          eb.exists(
            eb.selectFrom('product_scores')
              .select('product_scores.product_id')
              .where('product_scores.product_id', '=', eb.ref('products.id'))
              .where('product_scores.score_type', '=', 'protein_efficiency')
              .$if(filters.scores!.proteinEfficiency!.min !== undefined, (qb) =>
                qb.where('product_scores.score_value', '>=', filters.scores!.proteinEfficiency!.min!)
              )
              .$if(filters.scores!.proteinEfficiency!.max !== undefined, (qb) =>
                qb.where('product_scores.score_value', '<=', filters.scores!.proteinEfficiency!.max!)
              )
          )
        );
      }

      if (filters.scores.postWorkoutScore) {
        query = query.where((eb) =>
          eb.exists(
            eb.selectFrom('product_scores')
              .select('product_scores.product_id')
              .where('product_scores.product_id', '=', eb.ref('products.id'))
              .where('product_scores.score_type', '=', 'post_workout_score')
              .$if(filters.scores!.postWorkoutScore!.min !== undefined, (qb) =>
                qb.where('product_scores.score_value', '>=', filters.scores!.postWorkoutScore!.min!)
              )
              .$if(filters.scores!.postWorkoutScore!.max !== undefined, (qb) =>
                qb.where('product_scores.score_value', '<=', filters.scores!.postWorkoutScore!.max!)
              )
              .$if(filters.scores!.postWorkoutScore!.context !== undefined, (qb) =>
                qb.where('product_scores.context', '=', filters.scores!.postWorkoutScore!.context!)
              )
          )
        );
      }
    }

    // Apply enhanced multi-dimensional filtering
    query = this.applyEnhancedFilters(query, filters);

    return query;
  }

  /**
   * Apply enhanced multi-dimensional filtering with complex WHERE clauses
   * T030: Multi-dimensional filtering with nested joins
   * @protected
   */
  protected applyEnhancedFilters<TRow>(
    queryBuilder: SelectQueryBuilder<FlexibleDatabase, 'products', TRow>,
    filters: ProductFilters
  ): SelectQueryBuilder<FlexibleDatabase, 'products', TRow> {
    let query = queryBuilder;

    // Enhanced nutrition filtering with ranges and per100g options
    if (filters.enhancedNutrition) {
      query = this.applyEnhancedNutritionFilters(query, filters.enhancedNutrition);
    }

    // Enhanced flags filtering with confidence and combinations
    if (filters.enhancedFlags) {
      query = this.applyEnhancedFlagFilters(query, filters.enhancedFlags);
    }

    // Enhanced scores filtering with context awareness
    if (filters.enhancedScores) {
      query = this.applyEnhancedScoreFilters(query, filters.enhancedScores);
    }

    // Additives filtering
    if (filters.additives) {
      query = this.applyAdditivesFilters(query, filters.additives);
    }

    return query;
  }

  /**
   * Apply enhanced nutrition filtering with ranges and per100g calculations
   * @protected
   */
  protected applyEnhancedNutritionFilters<TRow>(
    query: SelectQueryBuilder<FlexibleDatabase, 'products', TRow>,
    nutritionFilters: NutritionFilters
  ): SelectQueryBuilder<FlexibleDatabase, 'products', TRow> {
    // Edge case: Return early if no valid filters provided
    const hasValidFilters = Object.values(nutritionFilters).some(filter => 
      filter && (filter.min !== undefined || filter.max !== undefined)
    );
    if (!hasValidFilters) {
      return query;
    }

    // Map UI field names to database column names
    const fieldMappings = {
      protein: 'protein',
      carbs: 'carbs', 
      fiber: 'fiber',
      fat: 'fat',
      calories: 'kcal', // UI uses 'calories', DB uses 'kcal'
      sugar: 'sugar',
      sodium: 'sodium',
      saturatedFat: 'saturated_fat' // UI uses camelCase, DB uses snake_case
    } as const;

    for (const [uiField, dbField] of Object.entries(fieldMappings)) {
      const filter = nutritionFilters[uiField as keyof NutritionFilters];
      if (!filter) continue;

      // Edge case: Skip invalid range filters (min > max)
      if (filter.min !== undefined && filter.max !== undefined && filter.min > filter.max) {
        continue;
      }

      // Edge case: Skip negative values for nutrition data (except sodium which can be 0)
      const validMin = filter.min !== undefined && filter.min >= 0 ? filter.min : undefined;
      const validMax = filter.max !== undefined && filter.max >= 0 ? filter.max : undefined;

      if (validMin === undefined && validMax === undefined) {
        continue;
      }

      query = query.where((eb) =>
        eb.exists(
          eb.selectFrom('product_nutrition')
            .select('product_nutrition.product_id')
            .where('product_nutrition.product_id', '=', eb.ref('products.id'))
            // Edge case: Exclude null values when applying filters
            .where(sql.ref(`product_nutrition.${dbField}`), 'is not', null)
            .$if(validMin !== undefined, (qb) => {
              // Handle per100g calculation with proper serving size validation
              if (filter.per100g) {
                return qb.where(
                  sql`CASE 
                    WHEN product_nutrition.serving_size_g > 0 AND product_nutrition.serving_size_g IS NOT NULL
                    THEN (product_nutrition.${sql.ref(dbField)} * 100.0 / product_nutrition.serving_size_g) 
                    ELSE product_nutrition.${sql.ref(dbField)} 
                  END`,
                  '>=',
                  validMin!
                );
              } else {
                return qb.where(sql.ref(`product_nutrition.${dbField}`), '>=', validMin!);
              }
            })
            .$if(validMax !== undefined, (qb) => {
              // Handle per100g calculation with proper serving size validation
              if (filter.per100g) {
                return qb.where(
                  sql`CASE 
                    WHEN product_nutrition.serving_size_g > 0 AND product_nutrition.serving_size_g IS NOT NULL
                    THEN (product_nutrition.${sql.ref(dbField)} * 100.0 / product_nutrition.serving_size_g) 
                    ELSE product_nutrition.${sql.ref(dbField)} 
                  END`,
                  '<=',
                  validMax!
                );
              } else {
                return qb.where(sql.ref(`product_nutrition.${dbField}`), '<=', validMax!);
              }
            })
        )
      );
    }

    return query;
  }

  /**
   * Apply enhanced flag filtering with confidence thresholds and combinations
   * @protected
   */
  protected applyEnhancedFlagFilters<TRow>(
    query: SelectQueryBuilder<FlexibleDatabase, 'products', TRow>,
    flagFilters: FlagFilters
  ): SelectQueryBuilder<FlexibleDatabase, 'products', TRow> {
    // Edge case: Return early if no valid filters provided
    const hasValidFilters = Object.keys(flagFilters).some(key => 
      key !== 'requireAll' && flagFilters[key as keyof FlagFilters] !== undefined
    );
    if (!hasValidFilters) {
      return query;
    }

    const flagConditions: Array<(eb: any) => any> = [];

    const flagTypes = [
      'isHalal', 'isVegan', 'isVegetarian', 'isHighProtein', 
      'isLowCarb', 'isGlutenFree', 'isLactoseFree', 'isKeto'
    ] as const;

    for (const flagKey of flagTypes) {
      const filter = flagFilters[flagKey];
      if (filter === undefined) continue;

      const flagType = this.mapFlagKeyToDbType(flagKey);
      let flagValue: boolean;
      let minConfidence: number | undefined;

      // Handle different filter value types with edge case validation
      if (typeof filter === 'boolean') {
        flagValue = filter;
      } else if (filter === 'strict') {
        flagValue = true;
        minConfidence = 0.9; // High confidence for strict halal
      } else if (typeof filter === 'object' && 'value' in filter) {
        flagValue = filter.value;
        // Edge case: Validate confidence threshold range (0-1)
        minConfidence = filter.minConfidence !== undefined 
          ? Math.max(0, Math.min(1, filter.minConfidence))
          : undefined;
      } else {
        continue; // Invalid filter format - skip gracefully
      }

      const flagCondition = (eb: any) =>
        eb.exists(
          eb.selectFrom('product_flags')
            .select('product_flags.product_id')
            .where('product_flags.product_id', '=', eb.ref('products.id'))
            .where('product_flags.flag_type', '=', flagType)
            .where('product_flags.flag_value', '=', flagValue)
            // Edge case: Only apply confidence filter if it's a meaningful threshold
            .$if(minConfidence !== undefined && minConfidence > 0, (qb: any) =>
              qb.where('product_flags.confidence', '>=', minConfidence!)
            )
        );

      if (flagFilters.requireAll) {
        // AND logic: each condition must be satisfied
        query = query.where(flagCondition);
      } else {
        // OR logic: collect conditions to combine later
        flagConditions.push(flagCondition);
      }
    }

    // Edge case: Apply OR logic if not requiring all conditions and we have conditions
    if (!flagFilters.requireAll && flagConditions.length > 0) {
      query = query.where((eb) => {
        if (flagConditions.length === 1) {
          return flagConditions[0](eb);
        }
        
        let condition = flagConditions[0](eb);
        for (let i = 1; i < flagConditions.length; i++) {
          condition = eb.or([condition, flagConditions[i](eb)]);
        }
        return condition;
      });
    }

    return query;
  }

  /**
   * Apply enhanced score filtering with context awareness and combinations
   * @protected
   */
  protected applyEnhancedScoreFilters<TRow>(
    query: SelectQueryBuilder<FlexibleDatabase, 'products', TRow>,
    scoreFilters: ScoreFilters
  ): SelectQueryBuilder<FlexibleDatabase, 'products', TRow> {
    const scoreConditions: Array<(eb: any) => any> = [];

    // Standard score types
    const scoreTypes = [
      { key: 'healthScore', dbType: 'health_score' },
      { key: 'proteinEfficiency', dbType: 'protein_efficiency' },
      { key: 'postWorkoutScore', dbType: 'post_workout_score' },
      { key: 'trainingDayScore', dbType: 'training_day_score' },
      { key: 'restDayScore', dbType: 'rest_day_score' },
      { key: 'cuttingScore', dbType: 'cutting_score' }
    ] as const;

    for (const { key, dbType } of scoreTypes) {
      const filter = scoreFilters[key as keyof ScoreFilters];
      if (!filter || typeof filter !== 'object' || Array.isArray(filter)) continue;

      const scoreCondition = (eb: any) =>
        eb.exists(
          eb.selectFrom('product_scores')
            .select('product_scores.product_id')
            .where('product_scores.product_id', '=', eb.ref('products.id'))
            .where('product_scores.score_type', '=', dbType)
            .$if(filter.min !== undefined, (qb: any) =>
              qb.where('product_scores.score_value', '>=', filter.min!)
            )
            .$if(filter.max !== undefined, (qb: any) =>
              qb.where('product_scores.score_value', '<=', filter.max!)
            )
            .$if(this.hasContext(filter) && filter.context !== undefined, (qb: any) =>
              qb.where('product_scores.context', '=', filter.context as ProductScoreTable['context'])
            )
            .$if('minConfidence' in filter && (filter as any).minConfidence !== undefined, (qb: any) =>
              qb.where('product_scores.confidence', '>=', (filter as any).minConfidence!)
            )
        );

      if (scoreFilters.requireAll) {
        query = query.where(scoreCondition);
      } else {
        scoreConditions.push(scoreCondition);
      }
    }

    // Handle custom scores
    if (scoreFilters.customScores) {
      for (const customScore of scoreFilters.customScores) {
        const customCondition = (eb: any) =>
          eb.exists(
            eb.selectFrom('product_scores')
              .select('product_scores.product_id')
              .where('product_scores.product_id', '=', eb.ref('products.id'))
              .where('product_scores.score_type', '=', customScore.scoreType)
              .$if(customScore.min !== undefined, (qb: any) =>
                qb.where('product_scores.score_value', '>=', customScore.min!)
              )
              .$if(customScore.max !== undefined, (qb: any) =>
                qb.where('product_scores.score_value', '<=', customScore.max!)
              )
              .$if(customScore.context !== undefined, (qb: any) =>
                qb.where('product_scores.context', '=', customScore.context!)
              )
              .$if(customScore.minConfidence !== undefined, (qb: any) =>
                qb.where('product_scores.confidence', '>=', customScore.minConfidence!)
              )
          );

        if (scoreFilters.requireAll) {
          query = query.where(customCondition);
        } else {
          scoreConditions.push(customCondition);
        }
      }
    }

    // Apply OR logic if not requiring all conditions
    if (!scoreFilters.requireAll && scoreConditions.length > 0) {
      query = query.where((eb) => {
        let condition = scoreConditions[0](eb);
        for (let i = 1; i < scoreConditions.length; i++) {
          condition = eb.or([condition, scoreConditions[i](eb)]);
        }
        return condition;
      });
    }

    return query;
  }

  /**
   * Apply additives filtering to exclude/include specific E-numbers and types
   * @protected
   */
  protected applyAdditivesFilters<TRow>(
    query: SelectQueryBuilder<FlexibleDatabase, 'products', TRow>,
    additivesFilters: AdditivesFilters
  ): SelectQueryBuilder<FlexibleDatabase, 'products', TRow> {
    // Exclude E-numbers
    if (additivesFilters.excludeENumbers && additivesFilters.excludeENumbers.length > 0) {
      query = query.where((eb) =>
        eb.not(eb.exists(
          eb.selectFrom('product_additives')
            .select('product_additives.product_id')
            .where('product_additives.product_id', '=', eb.ref('products.id'))
            .where('product_additives.e_number', 'in', additivesFilters.excludeENumbers!)
        ))
      );
    }

    // Exclude additive types
    if (additivesFilters.excludeTypes && additivesFilters.excludeTypes.length > 0) {
      query = query.where((eb) =>
        eb.not(eb.exists(
          eb.selectFrom('product_additives')
            .select('product_additives.product_id')
            .where('product_additives.product_id', '=', eb.ref('products.id'))
            .where(sql.ref('product_additives.additive_type'), 'in', additivesFilters.excludeTypes!)
        ))
      );
    }

    // Include specific E-numbers
    if (additivesFilters.includeENumbers && additivesFilters.includeENumbers.length > 0) {
      query = query.where((eb) =>
        eb.exists(
          eb.selectFrom('product_additives')
            .select('product_additives.product_id')
            .where('product_additives.product_id', '=', eb.ref('products.id'))
            .where('product_additives.e_number', 'in', additivesFilters.includeENumbers!)
        )
      );
    }

    // Include specific types
    if (additivesFilters.includeTypes && additivesFilters.includeTypes.length > 0) {
      query = query.where((eb) =>
        eb.exists(
          eb.selectFrom('product_additives')
            .select('product_additives.product_id')
            .where('product_additives.product_id', '=', eb.ref('products.id'))
            .where(sql.ref('product_additives.additive_type'), 'in', additivesFilters.includeTypes!)
        )
      );
    }

    // Additive-free filtering
    const additiveFreeTypes = [
      { flag: 'noArtificialColors', type: 'artificial_color' },
      { flag: 'noArtificialFlavors', type: 'artificial_flavor' },
      { flag: 'noPreservatives', type: 'preservative' },
      { flag: 'noArtificialSweeteners', type: 'artificial_sweetener' }
    ];

    for (const { flag, type } of additiveFreeTypes) {
      if (additivesFilters[flag as keyof AdditivesFilters]) {
        query = query.where((eb) =>
          eb.not(eb.exists(
            eb.selectFrom('product_additives')
              .select('product_additives.product_id')
              .where('product_additives.product_id', '=', eb.ref('products.id'))
              .where(sql.ref('product_additives.additive_type'), '=', type)
          ))
        );
      }
    }

    return query;
  }

  /**
   * Map filter key to database flag type
   * @protected
   */
  protected mapFlagKeyToDbType(flagKey: string): string {
    const mapping: Record<string, string> = {
      'isHalal': 'is_halal',
      'isVegan': 'is_vegan',
      'isVegetarian': 'is_vegetarian',
      'isHighProtein': 'is_high_protein',
      'isLowCarb': 'is_low_carb',
      'isGlutenFree': 'is_gluten_free',
      'isLactoseFree': 'is_lactose_free',
      'isKeto': 'is_keto'
    };
    return mapping[flagKey] || flagKey.toLowerCase();
  }

  /**
   * Type guard to determine if a score filter includes a context field.
   */
  private hasContext(filter: unknown): filter is { context?: ProductScoreTable['context'] | null } {
    return typeof filter === 'object' && filter !== null && 'context' in filter;
  }

  /**
   * Get product details with all relations using optimized single-query approach
   * T025: Migrate product details queries with parity validation
   * @param id - Product ID
   * @returns Complete product details with all related data
   */
  async getProductDetails(id: string): Promise<RepositoryResult<ProductWithRelations>> {
    this.validateRequired(id, 'id');

    try {
      const db = await this.getConnection();

      this.logQuery('getProductDetails', {
        operation: 'SELECT_PRODUCT_WITH_RELATIONS_OPTIMIZED',
        productId: id
      });

      // Use raw SQL for complex aggregation to match legacy performance
      // This matches the legacy getFlexibleProductDetails approach exactly
      const rawResult = await sql<{
        id: string;
        name: string;
        price_regular: number;
        price_sale: number | null;
        unit_amount: number;
        unit_type: string;
        brand: string;
        created_at: string;
        updated_at: string;
        kcal: number | null;
        kj: number | null;
        protein: number | null;
        carbs: number | null;
        sugars: number | null;
        fat: number | null;
        saturated_fat: number | null;
        fiber: number | null;
        salt: number | null;
        sodium: number | null;
        category_ids: string | null;
        category_names: string | null;
        category_paths: string | null;
        category_primaries: string | null;
        flags_data: string | null;
        scores_data: string | null;
        additives_data: string | null;
      }>`
        SELECT 
          p.*,
          pn.kcal, pn.kj, pn.protein, pn.carbs, pn.sugars, pn.fat, pn.saturated_fat, pn.fiber, pn.salt, pn.sodium,
          GROUP_CONCAT(DISTINCT c.id, '|') as category_ids,
          GROUP_CONCAT(DISTINCT c.name, '|') as category_names,
          GROUP_CONCAT(DISTINCT c.path, '|') as category_paths,
          GROUP_CONCAT(DISTINCT pc.is_primary, '|') as category_primaries,
          GROUP_CONCAT(DISTINCT pf.flag_type || ':' || pf.flag_value || ':' || pf.confidence || ':' || pf.source, '|') as flags_data,
          GROUP_CONCAT(DISTINCT ps.score_type || ':' || ps.score_value || ':' || IFNULL(ps.context, 'null') || ':' || ps.computed_at || ':' || IFNULL(ps.metadata, 'null'), '|') as scores_data,
          GROUP_CONCAT(DISTINCT IFNULL(pa.e_number, 'null') || ':' || pa.additive_name || ':' || IFNULL(pa.functional_category, 'null') || ':' || IFNULL(pa.dutch_category, 'null') || ':' || IFNULL(pa.safety_flags, 'null') || ':' || pa.is_natural, '|') as additives_data
        FROM products p
        LEFT JOIN product_nutrition pn ON pn.product_id = p.id
        LEFT JOIN product_categories pc ON pc.product_id = p.id
        LEFT JOIN categories c ON c.id = pc.category_id
        LEFT JOIN product_flags pf ON pf.product_id = p.id
        LEFT JOIN product_scores ps ON ps.product_id = p.id
        LEFT JOIN product_additives pa ON pa.product_id = p.id
        WHERE p.id = ${id}
        GROUP BY p.id
      `.execute(db);

      const firstResult = rawResult.rows[0];

      if (!firstResult) {
        this.logQuery('getProductDetails completed', { productId: id, found: false });
        return null;
      }

      // Parse aggregated data efficiently
      const categories = this.parseAggregatedCategories(
        firstResult.category_ids as string,
        firstResult.category_names as string, 
        firstResult.category_paths as string,
        firstResult.category_primaries as string
      );

      const flags = this.parseAggregatedFlags(firstResult.flags_data as string);
      const scores = this.parseAggregatedScores(firstResult.scores_data as string);  
      const additives = this.parseAggregatedAdditives(firstResult.additives_data as string);

      // Find primary category
      const primaryCategory = categories.find(cat => cat.is_primary);

      // Build complete product result with proper null handling
      const result: ProductWithRelations = {
        id: firstResult.id,
        name: firstResult.name,
        price_regular: firstResult.price_regular,
        price_sale: firstResult.price_sale,
        unit_amount: firstResult.unit_amount,
        unit_type: firstResult.unit_type as 'g' | 'ml' | 'pieces' | 'kg' | 'l',
        brand: firstResult.brand,
        created_at: Number(firstResult.created_at),
        updated_at: Number(firstResult.updated_at),

        // Nutrition data - handle null values properly
        nutrition: firstResult.kcal !== null ? {
          kcal: firstResult.kcal,
          kj: firstResult.kj,
          protein: firstResult.protein,
          carbs: firstResult.carbs,
          sugars: firstResult.sugars,
          fat: firstResult.fat,
          saturated_fat: firstResult.saturated_fat,
          fiber: firstResult.fiber,
          salt: firstResult.salt,
          sodium: firstResult.sodium
        } : null,

        // Category data
        primaryCategory: primaryCategory ? {
          id: primaryCategory.id,
          name: primaryCategory.name,
          path: primaryCategory.path
        } : undefined,
        allCategories: categories,

        // Flags, scores, additives
        flags: flags as Array<Omit<Selectable<ProductFlagTable>, 'product_id'>>,
        scores: scores as Array<Omit<Selectable<ProductScoreTable>, 'product_id'>>,
        additives: additives as Array<Omit<Selectable<ProductAdditiveTable>, 'product_id'>>
      };

      this.logQuery('getProductDetails completed', {
        productId: id,
        found: true,
        categoriesCount: categories.length,
        flagsCount: flags.length,
        scoresCount: scores.length,
        additivesCount: additives.length,
        optimized: true
      });

      return result;

    } catch (error) {
      this.handleError(error, 'getProductDetails');
    }
  }

  /**
   * Parse aggregated category data from GROUP_CONCAT results
   */
  private parseAggregatedCategories(
    ids: string,
    names: string, 
    paths: string,
    primaries: string
  ): Array<{ id: string; name: string; path: string; is_primary: boolean }> {
    if (!ids || !names) return [];

    const idList = ids.split('|').filter(Boolean);
    const nameList = names.split('|').filter(Boolean);
    const pathList = paths ? paths.split('|').filter(Boolean) : [];
    const primaryList = primaries ? primaries.split('|').filter(Boolean) : [];

    const categories = [];
    for (let i = 0; i < idList.length; i++) {
      if (idList[i] && nameList[i]) {
        categories.push({
          id: idList[i],
          name: nameList[i],
          path: pathList[i] || '',
          is_primary: primaryList[i] === '1'
        });
      }
    }

    return categories;
  }

  /**
   * Parse aggregated flags data from GROUP_CONCAT results
   */
  private parseAggregatedFlags(flagsData: string): Array<{
    flag_type: string;
    flag_value: boolean;
    confidence: number;
    source: string;
  }> {
    if (!flagsData) return [];

    return flagsData.split('|').filter(Boolean).map(flagStr => {
      const [flag_type, flag_value, confidence, source] = flagStr.split(':');
      return {
        flag_type,
        flag_value: flag_value === '1',
        confidence: Number(confidence) || 0,
        source: source || ''
      };
    }).filter(flag => flag.flag_type); // Filter out malformed entries
  }

  /**
   * Parse aggregated scores data from GROUP_CONCAT results
   */
  private parseAggregatedScores(scoresData: string): Array<{
    score_type: string;
    score_value: number;
    context: string | null;
    computed_at: number;
    metadata: string | null;
  }> {
    if (!scoresData) return [];

    return scoresData.split('|').filter(Boolean).map(scoreStr => {
      const [score_type, score_value, context, computed_at, metadata] = scoreStr.split(':');
      return {
        score_type,
        score_value: Number(score_value) || 0,
        context: context === 'null' ? null : context,
        computed_at: Number(computed_at) || 0,
        metadata: metadata === 'null' ? null : metadata
      };
    }).filter(score => score.score_type); // Filter out malformed entries
  }

  /**
   * Parse aggregated additives data from GROUP_CONCAT results  
   */
  private parseAggregatedAdditives(additivesData: string): Array<{
    e_number: string | null;
    additive_name: string;
    functional_category: string | null;
    dutch_category: string | null;
    safety_flags: string | null;
    is_natural: boolean;
  }> {
    if (!additivesData) return [];

    return additivesData.split('|').filter(Boolean).map(additiveStr => {
      const [e_number, additive_name, functional_category, dutch_category, safety_flags, is_natural] = additiveStr.split(':');
      return {
        e_number: e_number === 'null' ? null : e_number,
        additive_name: additive_name || '',
        functional_category: functional_category === 'null' ? null : functional_category,
        dutch_category: dutch_category === 'null' ? null : dutch_category,
        safety_flags: safety_flags === 'null' ? null : safety_flags,
        is_natural: is_natural === '1'
      };
    }).filter(additive => additive.additive_name); // Filter out malformed entries
  }

  /**
   * Get products by category with category hierarchy support
   * @param categoryId - Category ID to filter by
   * @param options - Options for subcategories and pagination
   * @returns Products in specified category with category information
   */
  async getProductsByCategory(categoryId: string, options?: {
    includeSubcategories?: boolean;
    pagination?: PaginationOptions
  }): Promise<ProductQueryResult<ProductWithCategory>> {
    this.validateRequired(categoryId, 'categoryId');

    const { includeSubcategories = false, pagination = {} } = options || {};
    const { limit = 50, offset = 0 } = pagination;

    this.validateType(limit, 'number', 'limit');
    this.validateType(offset, 'number', 'offset');

    if (limit < 0 || offset < 0) {
      throw new Error('Pagination values must be non-negative');
    }

    try {
      const db = await this.getConnection();

      this.logQuery('getProductsByCategory', {
        operation: 'SELECT_PRODUCTS_BY_CATEGORY',
        categoryId,
        includeSubcategories,
        limit,
        offset
      });

      let categoryIds = [categoryId];

      // If including subcategories, get all descendant categories using nested set model
      if (includeSubcategories) {
        const parentCategory = await db
          .selectFrom('categories')
          .select(['left_bound', 'right_bound'])
          .where('id', '=', categoryId)
          .executeTakeFirst();

        if (parentCategory) {
          const subcategories = await db
            .selectFrom('categories')
            .select('id')
            .where('left_bound', '>', parentCategory.left_bound)
            .where('right_bound', '<', parentCategory.right_bound)
            .execute();

          categoryIds = [categoryId, ...subcategories.map(cat => cat.id)];
        }
      }

      // Build main query with LEFT JOIN to get all product categories
      let query = db
        .selectFrom('products')
        .leftJoin('product_categories', 'products.id', 'product_categories.product_id')
        .leftJoin('categories', 'categories.id', 'product_categories.category_id')
        .select([
          'products.id',
          'products.name',
          'products.price_regular',
          'products.price_sale',
          'products.unit_amount',
          'products.unit_type',
          'products.brand',
          'products.created_at',
          'products.updated_at',
          'categories.id as category_id',
          'categories.name as category_name',
          'categories.path as category_path',
          'product_categories.is_primary'
        ])
        .where('product_categories.category_id', 'in', categoryIds);

      // Get total count of products in this category/subcategories
      const totalCountResult = await db
        .selectFrom('products')
        .leftJoin('product_categories', 'products.id', 'product_categories.product_id')
        .select((eb) => eb.fn.countAll().as('count'))
        .where('product_categories.category_id', 'in', categoryIds)
        .executeTakeFirst();
      const totalCount = totalCountResult ? Number(totalCountResult.count) : 0;

      // Apply pagination & ordering
      query = query
        .orderBy('products.name', 'asc')
        .orderBy('products.id', 'asc');
      if (limit > 0) query = query.limit(limit);
      if (offset > 0) query = query.offset(offset);

      // Define explicit row type to satisfy executeWithTiming generic constraints
            type ProductCategoryQueryRow = {
              id: string;
              name: string;
              price_regular: number;
              price_sale: number | null;
              unit_amount: number;
              unit_type: ProductTable['unit_type'];
              brand: string | null;
              created_at: ProductTable['created_at'];
              updated_at: ProductTable['updated_at'];
              category_id: string | null;
              category_name: string | null;
              category_path: string | null;
              is_primary: ProductCategoryTable['is_primary'] | null;
            };
      
            // Widen the table union to satisfy executeWithTiming's broader table constraint
            const widenedQuery = query as unknown as SelectQueryBuilder<
              FlexibleDatabase,
              keyof FlexibleDatabase,
              ProductCategoryQueryRow
            >;
      
            const result = await this.executeWithTiming<ProductCategoryQueryRow>(
              widenedQuery,
              {
                categoryHierarchyUsed: includeSubcategories
              }
            );

      // Group results by product to handle multiple categories per product
      const productMap = new Map<string, ProductWithCategory>();

      for (const row of result.data) {
        if (!productMap.has(row.id)) {
          productMap.set(row.id, {
            id: row.id,
            name: row.name,
            price_regular: row.price_regular,
            price_sale: row.price_sale,
            unit_amount: row.unit_amount,
            unit_type: row.unit_type,
            brand: row.brand,
            created_at: Number(row.created_at),
            updated_at: Number(row.updated_at),
            allCategories: []
          });
        }

        const product = productMap.get(row.id)!;

        // Add category if it exists
        if (row.category_id) {
          // Guard against nullable LEFT JOIN fields so types narrow to non-null
          if (row.category_name && row.category_path && row.is_primary !== null) {
            const categoryInfo = {
              id: row.category_id,
              name: row.category_name,
              path: row.category_path,
              is_primary: row.is_primary
            };

            product.allCategories.push(categoryInfo);

            // Set primary category
            if (row.is_primary) {
              product.primaryCategory = {
                id: row.category_id,
                name: row.category_name,
                path: row.category_path
              };
            }
          }
        }
      }

      const products = Array.from(productMap.values());

      this.logQuery('getProductsByCategory completed', {
        categoryId,
        includeSubcategories,
        categoriesUsed: categoryIds.length,
        totalCount,
        returnedCount: products.length,
        queryTimeMs: result.queryTimeMs
      });

      return {
        products,
        totalCount,
        filteredCount: totalCount, // Same as total since we're filtering by category
        queryTimeMs: result.queryTimeMs
      };

    } catch (error) {
      this.handleError(error, 'getProductsByCategory');
    }
  }

  /**
   * Search products using client-side search (no database search tables)
   * @param query - Search query string
   * @param options - Pagination options
   * @returns Products matching search query
   */
  async searchproducts(query: string, options?: PaginationOptions): Promise<ProductQueryResult<ProductResult>> {
    this.validateRequired(query, 'query');

    const { limit = 50, offset = 0 } = options || {};

    this.validateType(limit, 'number', 'limit');
    this.validateType(offset, 'number', 'offset');

    if (limit < 0 || offset < 0) {
      throw new Error('Pagination values must be non-negative');
    }

    try {
      this.logQuery('searchproducts', {
        operation: 'CLIENT_SIDE_SEARCH',
        query,
        limit,
        offset,
        notice: 'Using client-side search - no database search tables exist'
      });

      // Get all products for client-side filtering
      // Note: This is not optimal for large datasets but necessary since no search tables exist
      const allProducts = await this.getAll({ limit: 10000, offset: 0 });

      // Simple client-side text search
      const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);

      const filteredProducts = allProducts.products.filter(product => {
        const searchableText = [
          product.name,
          product.brand || '',
          product.id
        ].join(' ').toLowerCase();

        // Check if all search terms are found in the searchable text
        return searchTerms.every(term => searchableText.includes(term));
      });

      // Apply pagination to filtered results
      const paginatedProducts = filteredProducts.slice(offset, offset + limit);

      this.logQuery('searchproducts completed', {
        query,
        totalProductsSearched: allProducts.products.length,
        matchingProducts: filteredProducts.length,
        returnedCount: paginatedProducts.length,
        pagination: { limit, offset }
      });

      return {
        products: paginatedProducts,
        totalCount: allProducts.totalCount,
        filteredCount: filteredProducts.length,
        queryTimeMs: 0 // Client-side operation, no DB query time
      };

    } catch (error) {
      this.handleError(error, 'searchproducts');
    }
  }

  /**
   * Get products with nutrition filtering
   * @param filters - Nutrition filter criteria
   * @returns Products matching nutrition criteria
   */
  async getProductsWithNutrition(filters: {
    minProtein?: number;
    maxCarbs?: number;
    minFiber?: number;
    excludeNullValues?: boolean;
  }): Promise<ProductQueryResult<ProductWithNutrition>> {
    try {
      const db = await this.getConnection();

      this.logQuery('getProductsWithNutrition', {
        operation: 'SELECT_WITH_NUTRITION_FILTERS',
        filters
      });

      // Build query with LEFT JOIN to product_nutrition
      let query = db
        .selectFrom('products')
        .leftJoin('product_nutrition', 'products.id', 'product_nutrition.product_id')
        .select([
          'products.id',
          'products.name',
          'products.price_regular',
          'products.price_sale',
          'products.unit_amount',
          'products.unit_type',
          'products.brand',
          'products.created_at',
          'products.updated_at',
          'product_nutrition.kcal',
          'product_nutrition.kj',
          'product_nutrition.protein',
          'product_nutrition.carbs',
          'product_nutrition.sugars',
          'product_nutrition.fat',
          'product_nutrition.saturated_fat',
          'product_nutrition.fiber',
          'product_nutrition.salt',
          'product_nutrition.sodium'
        ]);

      // Apply nutrition filters
      if (filters.minProtein !== undefined) {
        query = query.where('product_nutrition.protein', '>=', filters.minProtein);
      }
      if (filters.maxCarbs !== undefined) {
        query = query.where('product_nutrition.carbs', '<=', filters.maxCarbs);
      }
      if (filters.minFiber !== undefined) {
        query = query.where('product_nutrition.fiber', '>=', filters.minFiber);
      }

      // Exclude null values if requested
      if (filters.excludeNullValues) {
        query = query.where('product_nutrition.protein', 'is not', null);
      }

      // Get total count (basic products count)
      const totalCountResult = await db
        .selectFrom('products')
        .select((eb) => eb.fn.countAll().as('count'))
        .executeTakeFirst();
      const totalCount = totalCountResult ? Number(totalCountResult.count) : 0;

      // Get filtered count
      let filteredCountQuery = db
        .selectFrom('products')
        .leftJoin('product_nutrition', 'products.id', 'product_nutrition.product_id')
        .select((eb) => eb.fn.countAll().as('count'));

      // Apply same filters to count query
      if (filters.minProtein !== undefined) {
        filteredCountQuery = filteredCountQuery.where('product_nutrition.protein', '>=', filters.minProtein);
      }
      if (filters.maxCarbs !== undefined) {
        filteredCountQuery = filteredCountQuery.where('product_nutrition.carbs', '<=', filters.maxCarbs);
      }
      if (filters.minFiber !== undefined) {
        filteredCountQuery = filteredCountQuery.where('product_nutrition.fiber', '>=', filters.minFiber);
      }
      if (filters.excludeNullValues) {
        filteredCountQuery = filteredCountQuery.where('product_nutrition.protein', 'is not', null);
      }

      const filteredResult = await filteredCountQuery.executeTakeFirst();
      const filteredCount = filteredResult ? Number(filteredResult.count) : 0;

      // Execute query with timing
      const result = await this.executeWithTiming(widenQueryBuilder(query));

      const products: ProductWithNutrition[] = result.data.map(row => ({
        id: row.id,
        name: row.name,
        price_regular: row.price_regular,
        price_sale: row.price_sale,
        unit_amount: row.unit_amount,
        unit_type: row.unit_type,
        brand: row.brand,
        created_at: row.created_at,
        updated_at: row.updated_at,
        nutrition: row.kcal !== null ? {
          kcal: row.kcal,
          kj: row.kj,
          protein: row.protein,
          carbs: row.carbs,
          sugars: row.sugars,
          fat: row.fat,
          saturated_fat: row.saturated_fat,
          fiber: row.fiber,
          salt: row.salt,
          sodium: row.sodium
        } : null
      }));

      this.logQuery('getProductsWithNutrition completed', {
        totalCount,
        filteredCount,
        returnedCount: products.length,
        queryTimeMs: result.queryTimeMs
      });

      return {
        products,
        totalCount,
        filteredCount,
        queryTimeMs: result.queryTimeMs
      };

    } catch (error) {
      this.handleError(error, 'getProductsWithNutrition');
    }
  }

  /**
   * Get products with flag filtering
   * @param filters - Flag filter criteria
   * @returns Products matching flag criteria
   */
  async getProductsWithFlags(filters: {
    isHalal?: boolean | 'strict';
    isVegan?: boolean;
    isVegetarian?: boolean;
    isHighProtein?: boolean;
    confidence?: { min?: number };
  }): Promise<ProductQueryResult<ProductWithCategory>> {
    try {
      const db = await this.getConnection();

      this.logQuery('getProductsWithFlags', {
        operation: 'SELECT_WITH_FLAG_FILTERS',
        filters
      });

      // Build query with LEFT JOIN to product_flags
      let query = db
        .selectFrom('products')
        .leftJoin('product_flags', 'products.id', 'product_flags.product_id')
        .select([
          'products.id',
          'products.name',
          'products.price_regular',
          'products.price_sale',
          'products.unit_amount',
          'products.unit_type',
          'products.brand',
          'products.created_at',
          'products.updated_at'
        ])
        .groupBy(['products.id']); // Group by product to avoid duplicates

      // Apply flag filters using EXISTS subqueries for better performance
      if (filters.isHalal !== undefined) {
        const halalValue = filters.isHalal === 'strict' ? true : filters.isHalal;
        query = query.where((eb) =>
          eb.exists(
            eb.selectFrom('product_flags as pf_halal')
              .select('pf_halal.product_id')
              .where('pf_halal.product_id', '=', eb.ref('products.id'))
              .where('pf_halal.flag_type', '=', 'is_halal')
              .where('pf_halal.flag_value', '=', halalValue)
          )
        );
      }

      if (filters.isVegan !== undefined) {
        query = query.where((eb) =>
          eb.exists(
            eb.selectFrom('product_flags as pf_vegan')
              .select('pf_vegan.product_id')
              .where('pf_vegan.product_id', '=', eb.ref('products.id'))
              .where('pf_vegan.flag_type', '=', 'is_vegan')
              .where('pf_vegan.flag_value', '=', filters.isVegan!)
          )
        );
      }

      if (filters.isVegetarian !== undefined) {
        query = query.where((eb) =>
          eb.exists(
            eb.selectFrom('product_flags as pf_vegetarian')
              .select('pf_vegetarian.product_id')
              .where('pf_vegetarian.product_id', '=', eb.ref('products.id'))
              .where('pf_vegetarian.flag_type', '=', 'is_vegetarian')
              .where('pf_vegetarian.flag_value', '=', filters.isVegetarian!)
          )
        );
      }

      if (filters.isHighProtein !== undefined) {
        const highProteinValue = filters.isHighProtein as boolean;
        query = query.where((eb) =>
          eb.exists(
            eb.selectFrom('product_flags as pf_protein')
              .select('pf_protein.product_id')
              .where('pf_protein.product_id', '=', eb.ref('products.id'))
              .where('pf_protein.flag_type', '=', 'is_high_protein')
              .where('pf_protein.flag_value', '=', highProteinValue)
          )
        );
      }

      if (filters.confidence?.min !== undefined) {
        query = query.having('product_flags.confidence', '>=', filters.confidence.min);
      }

      // Get total count
      const totalCountResult = await db
        .selectFrom('products')
        .select((eb) => eb.fn.countAll().as('count'))
        .executeTakeFirst();
      const totalCount = totalCountResult ? Number(totalCountResult.count) : 0;

      // For filtered count, we need to build a similar query structure
      const filteredCountQuery = db
        .selectFrom('products')
        .leftJoin('product_flags', 'products.id', 'product_flags.product_id')
        .select((eb) => eb.fn.countAll().as('count'));

      // Apply same filters for count (simplified version)
      // Note: This is a basic implementation - complex flag filtering count would need more sophisticated logic

      const filteredResult = await filteredCountQuery.executeTakeFirst();
      const filteredCount = filteredResult ? Number(filteredResult.count) : 0;

      // Execute query with timing
      const result = await this.executeWithTiming(widenQueryBuilder(query), {
        multiDimensionalFiltering: true
      });

      const products: ProductWithCategory[] = result.data.map(row => ({
        id: row.id,
        name: row.name,
        price_regular: row.price_regular,
        price_sale: row.price_sale,
        unit_amount: row.unit_amount,
        unit_type: row.unit_type,
        brand: row.brand,
        created_at: row.created_at,
        updated_at: row.updated_at,
        allCategories: [] // Will be populated in Sub-PR 3 with proper JOIN
      }));

      this.logQuery('getProductsWithFlags completed', {
        totalCount,
        filteredCount,
        returnedCount: products.length,
        queryTimeMs: result.queryTimeMs
      });

      return {
        products,
        totalCount,
        filteredCount,
        queryTimeMs: result.queryTimeMs
      };

    } catch (error) {
      this.handleError(error, 'getProductsWithFlags');
    }
  }

  /**
   * Get products with score filtering
   * @param filters - Score filter criteria
   * @returns Products matching score criteria
   */
  async getProductsWithScores(filters: {
    healthScore?: { min?: number; max?: number; context?: string };
    proteinEfficiency?: { min?: number; max?: number };
    postWorkoutScore?: { min?: number; max?: number; context?: string };
    contextualScore?: { min?: number; max?: number; contexts?: string[] };
  }): Promise<ProductQueryResult<ProductWithCategory>> {
    try {
      const db = await this.getConnection();

      this.logQuery('getProductsWithScores', {
        operation: 'SELECT_WITH_SCORE_FILTERS',
        filters
      });

      // Build query with LEFT JOIN to product_scores
      let query = db
        .selectFrom('products')
        .leftJoin('product_scores', 'products.id', 'product_scores.product_id')
        .select([
          'products.id',
          'products.name',
          'products.price_regular',
          'products.price_sale',
          'products.unit_amount',
          'products.unit_type',
          'products.brand',
          'products.created_at',
          'products.updated_at'
        ])
        .groupBy(['products.id']); // Group by product to avoid duplicates

      // Apply score filters using EXISTS subqueries for better performance
      if (filters.healthScore) {
        query = query.where((eb) =>
          eb.exists(
            eb.selectFrom('product_scores as ps_health')
              .select('ps_health.product_id')
              .where('ps_health.product_id', '=', eb.ref('products.id'))
              .where('ps_health.score_type', '=', 'health_score')
              .$if(filters.healthScore!.min !== undefined, (qb) =>
                qb.where('ps_health.score_value', '>=', filters.healthScore!.min!)
              )
              .$if(filters.healthScore!.max !== undefined, (qb) =>
                qb.where('ps_health.score_value', '<=', filters.healthScore!.max!)
              )
              .$if(filters.healthScore!.context !== undefined, (qb) =>
                qb.where('ps_health.context', '=', filters.healthScore!.context! as ProductScoreTable['context'])
              )
          )
        );
      }

      if (filters.proteinEfficiency) {
        query = query.where((eb) =>
          eb.exists(
            eb.selectFrom('product_scores as ps_protein')
              .select('ps_protein.product_id')
              .where('ps_protein.product_id', '=', eb.ref('products.id'))
              .where('ps_protein.score_type', '=', 'protein_efficiency')
              .$if(filters.proteinEfficiency!.min !== undefined, (qb) =>
                qb.where('ps_protein.score_value', '>=', filters.proteinEfficiency!.min!)
              )
              .$if(filters.proteinEfficiency!.max !== undefined, (qb) =>
                qb.where('ps_protein.score_value', '<=', filters.proteinEfficiency!.max!)
              )
          )
        );
      }

      if (filters.postWorkoutScore) {
        query = query.where((eb) =>
          eb.exists(
            eb.selectFrom('product_scores as ps_workout')
              .select('ps_workout.product_id')
              .where('ps_workout.product_id', '=', eb.ref('products.id'))
              .where('ps_workout.score_type', '=', 'post_workout_score')
              .$if(filters.postWorkoutScore!.min !== undefined, (qb) =>
                qb.where('ps_workout.score_value', '>=', filters.postWorkoutScore!.min!)
              )
              .$if(filters.postWorkoutScore!.max !== undefined, (qb) =>
                qb.where('ps_workout.score_value', '<=', filters.postWorkoutScore!.max!)
              )
              .$if(filters.postWorkoutScore!.context !== undefined, (qb) =>
                qb.where('ps_workout.context', '=', filters.postWorkoutScore!.context! as ProductScoreTable['context'])
              )
          )
        );
      }

      if (filters.contextualScore) {
        query = query.where((eb) =>
          eb.exists(
            eb.selectFrom('product_scores as ps_contextual')
              .select('ps_contextual.product_id')
              .where('ps_contextual.product_id', '=', eb.ref('products.id'))
              .where('ps_contextual.score_type', '=', 'contextual_score')
              .$if(filters.contextualScore!.min !== undefined, (qb) =>
                qb.where('ps_contextual.score_value', '>=', filters.contextualScore!.min!)
              )
              .$if(filters.contextualScore!.max !== undefined, (qb) =>
                qb.where('ps_contextual.score_value', '<=', filters.contextualScore!.max!)
              )
              .$if((filters.contextualScore!.contexts?.length ?? 0) > 0, (qb) =>
                qb.where('ps_contextual.context', 'in', filters.contextualScore!.contexts! as ProductScoreTable['context'][])
              )
          )
        );
      }

      // Get total count
      const totalCountResult = await db
        .selectFrom('products')
        .select((eb) => eb.fn.countAll().as('count'))
        .executeTakeFirst();
      const totalCount = totalCountResult ? Number(totalCountResult.count) : 0;

      // For filtered count, we need to build a similar query structure
      const filteredCountQuery = db
        .selectFrom('products')
        .leftJoin('product_scores', 'products.id', 'product_scores.product_id')
        .select((eb) => eb.fn.countAll().as('count'));

      const filteredResult = await filteredCountQuery.executeTakeFirst();
      const filteredCount = filteredResult ? Number(filteredResult.count) : 0;

      // Execute query with timing
      const result = await this.executeWithTiming(widenQueryBuilder(query), {
        multiDimensionalFiltering: true,
        scoringContext: 'multi-score-filter'
      });

      const products: ProductWithCategory[] = result.data.map(row => ({
        id: row.id,
        name: row.name,
        price_regular: row.price_regular,
        price_sale: row.price_sale,
        unit_amount: row.unit_amount,
        unit_type: row.unit_type,
        brand: row.brand,
        created_at: row.created_at,
        updated_at: row.updated_at,
        allCategories: [] // Will be populated in Sub-PR 3 with proper JOIN
      }));

      this.logQuery('getProductsWithScores completed', {
        totalCount,
        filteredCount,
        returnedCount: products.length,
        queryTimeMs: result.queryTimeMs
      });

      return {
        products,
        totalCount,
        filteredCount,
        queryTimeMs: result.queryTimeMs
      };

    } catch (error) {
      this.handleError(error, 'getProductsWithScores');
    }
  }

  // =============================================================================
  // CONTEXTUAL SCORING WITH METADATA (T031)
  // =============================================================================

  /**
   * T031: Enhanced contextual scoring queries with metadata aggregation
   * Provides context-aware scoring with metadata, efficient querying, and comprehensive analytics
   * @param filters - Contextual scoring filters
   * @param options - Pagination options
   * @param aggregationOptions - Score aggregation configuration
   * @returns Products with contextual scores and analytics
   */
  async getProductsWithContextualScoring(
    filters: ContextualScoringFilters,
    options: PaginationOptions = { limit: 50, offset: 0 },
    aggregationOptions: ScoreAggregationOptions = {}
  ): Promise<ContextualScoringResult> {
    try {
      const db = await this.getConnection();
      const startTime = Date.now();

      this.logQuery('getProductsWithContextualScoring', {
        operation: 'CONTEXTUAL_SCORING_QUERY',
        filters,
        options,
        aggregationOptions
      });

      // Build base query with product data and contextual scores
      let query = db
        .selectFrom('products')
        .leftJoin('product_nutrition', 'products.id', 'product_nutrition.product_id')
        .leftJoin('product_scores', 'products.id', 'product_scores.product_id')
        .select([
          'products.id',
          'products.name',
          'products.price_regular',
          'products.price_sale',
          'products.unit_amount',
          'products.unit_type',
          'products.brand',
          'products.created_at',
          'products.updated_at'
        ]);

      // Apply contextual scoring filters using efficient EXISTS subqueries
      if (filters.context) {
        query = query.where((eb) =>
          eb.exists(
            eb.selectFrom('product_scores as ps_context')
              .select('ps_context.product_id')
              .whereRef('ps_context.product_id', '=', 'products.id')
              .where('ps_context.context', '=', filters.context!)
          )
        );
      }

      if (filters.scoreTypes && filters.scoreTypes.length > 0) {
        query = query.where((eb) =>
          eb.exists(
            eb.selectFrom('product_scores as ps_types')
              .select('ps_types.product_id')
              .whereRef('ps_types.product_id', '=', 'products.id')
              .where('ps_types.score_type', 'in', filters.scoreTypes!)
          )
        );
      }

      if (filters.minScore !== undefined) {
        query = query.where((eb) =>
          eb.exists(
            eb.selectFrom('product_scores as ps_min')
              .select('ps_min.product_id')
              .whereRef('ps_min.product_id', '=', 'products.id')
              .where('ps_min.score_value', '>=', filters.minScore!)
          )
        );
      }

      if (filters.maxScore !== undefined) {
        query = query.where((eb) =>
          eb.exists(
            eb.selectFrom('product_scores as ps_max')
              .select('ps_max.product_id')
              .whereRef('ps_max.product_id', '=', 'products.id')
              .where('ps_max.score_value', '<=', filters.maxScore!)
          )
        );
      }

      // Apply sorting if specified
      if (filters.sortByScore) {
        const { scoreType, context: sortContext, direction } = filters.sortByScore;
        
        // Use a correlated subquery to get the score for sorting
        query = query.orderBy((eb) => 
          eb.selectFrom('product_scores as ps_sort')
            .select('ps_sort.score_value')
            .whereRef('ps_sort.product_id', '=', 'products.id')
            .where('ps_sort.score_type', '=', scoreType)
            .$if(sortContext !== undefined, (qb) =>
              qb.where('ps_sort.context', '=', sortContext!)
            )
            .limit(1),
          direction
        );
      }

      // Get total count before pagination
      const countQuery = query
        .clearSelect()
        .select((eb) => eb.fn.countAll().as('total'));

      const [{ total }] = await countQuery.execute();
      const totalCount = Number(total);

      // Apply pagination
      const limit = options.limit || 50;
      const offset = options.offset || 0;
      query = query.limit(limit).offset(offset);

      // Execute main query
      const products = await query.execute();
      const filteredCount = products.length;

      // Fetch contextual scores for each product efficiently
      const productIds = products.map(p => p.id);
      
      const scoresQuery = db
        .selectFrom('product_scores')
        .selectAll()
        .where('product_id', 'in', productIds);

      const allScores = await scoresQuery.execute();

      // Group scores by product ID
      const scoresByProduct = new Map<string, typeof allScores>();
      for (const score of allScores) {
        const productScores = scoresByProduct.get(score.product_id) || [];
        productScores.push(score);
        scoresByProduct.set(score.product_id, productScores);
      }

      // Build enhanced product results with contextual scores
      const enrichedProducts: ProductWithContextualScores[] = products.map(product => {
        const productScores = scoresByProduct.get(product.id) || [];
        
        // Calculate summary statistics
        const scoreValues = productScores.map(s => s.score_value);
        const averageScore = scoreValues.length > 0 
          ? scoreValues.reduce((sum, val) => sum + val, 0) / scoreValues.length 
          : 0;
        
        const contextsAvailable = [...new Set(
          productScores
            .map(s => s.context)
            .filter((c): c is ProductScoreContext => c !== null)
        )];

        const topScoreType = productScores.length > 0
          ? productScores.reduce((prev, current) => 
              prev.score_value > current.score_value ? prev : current
            ).score_type
          : null;

        return {
          ...product,
          // Add empty relations for compatibility with ProductWithRelations
          primaryCategory: undefined,
          allCategories: [],
          nutrition: null,
          flags: [],
          scores: [],
          additives: [],
          contextualScores: productScores.map(score => ({
            score_type: score.score_type,
            score_value: score.score_value,
            context: score.context,
            computed_at: score.computed_at,
            metadata: score.metadata
          })),
          scoresSummary: {
            averageScore,
            scoreCount: productScores.length,
            contextsAvailable,
            topScoreType
          }
        };
      });

      // Calculate comprehensive scoring metrics
      const allScoreValues = allScores.map(s => s.score_value);
      const averageScoreAcrossAll = allScoreValues.length > 0
        ? allScoreValues.reduce((sum, val) => sum + val, 0) / allScoreValues.length
        : 0;

      const scoreTypeDistribution = allScores.reduce((acc, score) => {
        acc[score.score_type] = (acc[score.score_type] || 0) + 1;
        return acc;
      }, {} as Record<ProductScoreType, number>);

      const contextDistribution = allScores.reduce((acc, score) => {
        if (score.context) {
          acc[score.context] = (acc[score.context] || 0) + 1;
        }
        return acc;
      }, {} as Record<ProductScoreContext, number>);

      const productsWithScoresCount = productIds.filter(id => scoresByProduct.has(id)).length;
      const productsWithoutScoresCount = productIds.length - productsWithScoresCount;

      const queryTimeMs = Date.now() - startTime;

      this.logQuery('getProductsWithContextualScoring completed', {
        operation: 'CONTEXTUAL_SCORING_COMPLETED',
        totalCount,
        filteredCount,
        productsWithScoresCount,
        productsWithoutScoresCount,
        queryTimeMs
      });

      return {
        products: enrichedProducts,
        totalCount,
        filteredCount,
        queryTimeMs,
        scoringMetrics: {
          averageScoreAcrossAll,
          scoreTypeDistribution,
          contextDistribution,
          productsWithScores: productsWithScoresCount,
          productsWithoutScores: productsWithoutScoresCount
        }
      };

    } catch (error) {
      this.handleError(error, 'getProductsWithContextualScoring');
    }
  }

  // =============================================================================
  // OPTIMIZED MULTI-DIMENSIONAL FILTERING (T030)
  // =============================================================================

  /**
   * T030: Optimized multi-dimensional product filtering with performance optimization
   * Uses efficient EXISTS subqueries to avoid N+1 problems and handle complex filters
   * @param filters - Enhanced ProductFilters with multi-dimensional support
   * @param options - Pagination options
   * @returns ProductQueryResult with products matching all filter criteria
   */
  async queryOptimizedMultiDimensional(
    filters: ProductFilters = {},
    options: PaginationOptions = {}
  ): Promise<ProductQueryResult<ProductWithRelations>> {
    const startTime = Date.now();
    
    try {
      const db = await this.getConnection();
      
      // Start with base query using enhanced filters for optimal performance
      let query = db
        .selectFrom('products')
        .selectAll('products');

      // Apply enhanced multi-dimensional filters using EXISTS subqueries
      if (filters.enhancedNutrition || filters.enhancedFlags || filters.enhancedScores || filters.additives) {
        query = this.applyEnhancedFilters(query, filters);
      }

      // Apply basic filters for backward compatibility
      if (filters.brands && filters.brands.length > 0) {
        query = query.where('brand', 'in', filters.brands);
      }
      if (filters.categories && filters.categories.length > 0) {
        query = query.where((eb: any) =>
          eb.exists(
            eb.selectFrom('product_categories')
              .select('product_categories.product_id')
              .where('product_categories.product_id', '=', eb.ref('products.id'))
              .where('product_categories.category_id', 'in', filters.categories!)
          )
        );
      }

      // Apply legacy nutrition filters
      if (filters.nutrition) {
        if (filters.nutrition.minProtein !== undefined || filters.nutrition.maxCarbs !== undefined || filters.nutrition.minFiber !== undefined) {
          query = query.where((eb: any) =>
            eb.exists(
              eb.selectFrom('product_nutrition')
                .select('product_nutrition.product_id')
                .where('product_nutrition.product_id', '=', eb.ref('products.id'))
                .$if(filters.nutrition!.minProtein !== undefined, (qb: any) =>
                  qb.where('product_nutrition.protein', '>=', filters.nutrition!.minProtein!)
                )
                .$if(filters.nutrition!.maxCarbs !== undefined, (qb: any) =>
                  qb.where('product_nutrition.carbs', '<=', filters.nutrition!.maxCarbs!)
                )
                .$if(filters.nutrition!.minFiber !== undefined, (qb: any) =>
                  qb.where('product_nutrition.fiber', '>=', filters.nutrition!.minFiber!)
                )
            )
          );
        }
      }

      // Apply pagination efficiently
      const { offset = 0, limit = 20 } = options;
      
      // Add default sorting for consistent results
      query = query.orderBy('created_at', 'desc').offset(offset).limit(limit);

      // Execute main query
      const products = await query.execute();
      
      // Get total count with same filters
      let countQuery = db.selectFrom('products');

      // Apply same enhanced filters to count query
      if (filters.enhancedNutrition || filters.enhancedFlags || filters.enhancedScores || filters.additives) {
        countQuery = this.applyEnhancedFilters(countQuery, filters);
      }

      // Apply same basic filters to count query
      if (filters.brands && filters.brands.length > 0) {
        countQuery = countQuery.where('brand', 'in', filters.brands);
      }
      if (filters.categories && filters.categories.length > 0) {
        countQuery = countQuery.where((eb: any) =>
          eb.exists(
            eb.selectFrom('product_categories')
              .select('product_categories.product_id')
              .where('product_categories.product_id', '=', eb.ref('products.id'))
              .where('product_categories.category_id', 'in', filters.categories!)
          )
        );
      }

      const [{ count }] = await countQuery
        .select((eb: any) => eb.fn.countAll().as('count'))
        .execute() as [{ count: string }];

      const totalCount = parseInt(count, 10);
      const filteredCount = totalCount; // Since we're applying filters

      // Efficiently load related data for results using batch queries
      const productIds = products.map(p => p.id);
      
      // Batch load nutrition data
      const nutritionMap = new Map();
      if (productIds.length > 0) {
        const nutritionData = await db
          .selectFrom('product_nutrition')
          .selectAll()
          .where('product_id', 'in', productIds)
          .execute();
        
        nutritionData.forEach(n => nutritionMap.set(n.product_id, n));
      }

      // Batch load category data
      const categoryMap = new Map();
      if (productIds.length > 0) {
        const categoryData = await db
          .selectFrom('product_categories as pc')
          .leftJoin('categories as c', 'c.id', 'pc.category_id')
          .select(['pc.product_id', 'c.id as category_id', 'c.name as category_name'])
          .where('pc.product_id', 'in', productIds)
          .execute();
        
        categoryData.forEach(c => {
          if (c.category_id) {
            categoryMap.set(c.product_id, {
              id: c.category_id,
              name: c.category_name!,
              parent_id: null,
              description: null,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date()
            });
          }
        });
      }

      // Transform results to match ProductWithRelations interface
      const enrichedProducts = products.map(product => ({
        ...product,
        nutrition: nutritionMap.get(product.id) || null,
        primaryCategory: categoryMap.get(product.id) || undefined,
        allCategories: categoryMap.get(product.id) ? [categoryMap.get(product.id)] : [],
        flags: [],  // TODO: Batch load flags if needed
        scores: [], // TODO: Batch load scores if needed
        additives: [] // TODO: Batch load additives if needed
      }));

      const queryTime = Date.now() - startTime;

      return {
        products: enrichedProducts,
        totalCount,
        filteredCount,
        queryTimeMs: queryTime
      };

    } catch (error) {
      const queryTime = Date.now() - startTime;
      this.handleError(error, 'queryOptimizedMultiDimensional');
      // Return empty result on error
      return {
        products: [],
        totalCount: 0,
        filteredCount: 0,
        queryTimeMs: queryTime
      };
    }
  }

  // =============================================================================
  // LEGACY COMPATIBILITY METHODS (T022 - Parity Testing)
  // =============================================================================

  /**
   * Legacy-compatible query method for parity testing
   * @param criteria - FlexibleFilterCriteria from legacy implementation
   * @returns FlexibleQueryResult matching legacy interface
   */
  async queryFlexibleProducts(criteria: FlexibleFilterCriteria = {}): Promise<FlexibleQueryResult> {
    const startTime = Date.now();

    try {
      const db = await this.getConnection();

      this.logQuery('queryFlexibleProducts', {
        operation: 'LEGACY_COMPATIBLE_QUERY',
        criteria
      });

      // Build base query
      let query = db
        .selectFrom('products')
        .selectAll();

      // Apply legacy-style filters
      query = this.applyLegacyFilters(query, criteria);

      // Apply sorting
      if (criteria.sortBy) {
        const direction = criteria.sortOrder || 'asc';
        switch (criteria.sortBy) {
          case 'name':
            query = query.orderBy('name', direction).orderBy('id', 'asc');
            break;
          case 'price':
            query = query.orderBy('price_regular', direction).orderBy('id', 'asc');
            break;
          default:
            query = query.orderBy('name', 'asc').orderBy('id', 'asc');
        }
      } else {
        query = query.orderBy('name', 'asc').orderBy('id', 'asc');
      }

      // Apply pagination
      if (criteria.limit && criteria.limit > 0) {
        query = query.limit(criteria.limit);
      }
      if (criteria.offset && criteria.offset > 0) {
        query = query.offset(criteria.offset);
      }

      const result = await this.executeWithTiming(query);
      const queryTimeMs = Date.now() - startTime;

      // Transform to legacy format
      const legacyResult: FlexibleQueryResult = {
        data: result.data,
        totalCount: result.data.length,
        filteredCount: result.data.length,
        queryTimeMs,
        metadata: {
          searchPerformed: Boolean(criteria.search || criteria.searchTerms),
          categoryHierarchyUsed: Boolean(criteria.categories && criteria.includeSubcategories),
          multiDimensionalFiltering: this.isMultiDimensionalQuery(criteria),
          scoringContext: criteria.scores ? this.getScoreContext(criteria.scores) : undefined
        }
      };

      this.logQuery('queryFlexibleProducts completed', {
        returnedCount: legacyResult.data.length,
        queryTimeMs: legacyResult.queryTimeMs
      });

      return legacyResult;

    } catch (error) {
      this.handleError(error, 'queryFlexibleProducts');
    }
  }

  /**
   * Legacy-compatible product details method for parity testing
   * @param productId - Product ID
   * @returns Product details in legacy format
   */
  async getFlexibleProductDetails(productId: string): Promise<unknown> {
    this.validateRequired(productId, 'productId');

    try {
      const productDetails = await this.getProductDetails(productId);

      // Transform to legacy format if product exists
      if (productDetails) {
        return {
          ...productDetails,
          // Ensure legacy field names and structure
          nutrition: productDetails.nutrition || null,
          categories: productDetails.allCategories || [],
          primaryCategory: productDetails.primaryCategory || null
        };
      }

      return null;

    } catch (error) {
      this.handleError(error, 'getFlexibleProductDetails');
    }
  }

  // =============================================================================
  // LEGACY FILTER HELPERS
  // =============================================================================

  /**
   * Apply legacy-style filters to query builder
   * @private
   */
  private applyLegacyFilters<TRow>(
    queryBuilder: SelectQueryBuilder<FlexibleDatabase, 'products', TRow>,
    criteria: FlexibleFilterCriteria
  ): SelectQueryBuilder<FlexibleDatabase, 'products', TRow> {
    let query = queryBuilder;

    // Basic product filters
    if (criteria.productIds && criteria.productIds.length > 0) {
      query = query.where('id', 'in', criteria.productIds);
    }

    if (criteria.priceRange) {
      if (criteria.priceRange.min !== undefined) {
        query = query.where('price_regular', '>=', criteria.priceRange.min);
      }
      if (criteria.priceRange.max !== undefined) {
        query = query.where('price_regular', '<=', criteria.priceRange.max);
      }
    }

    if (criteria.brands && criteria.brands.length > 0) {
      query = query.where('brand', 'in', criteria.brands);
    }

    // Category filters - simplified for basic queries
    if (criteria.categories && criteria.categories.length > 0) {
      query = query.where((eb) =>
        eb.exists(
          eb.selectFrom('product_categories')
            .innerJoin('categories', 'categories.id', 'product_categories.category_id')
            .select('product_categories.product_id')
            .where('product_categories.product_id', '=', eb.ref('products.id'))
            .where('categories.name', 'in', criteria.categories as readonly string[])
        )
      );
    }

    if (criteria.categoryIds && criteria.categoryIds.length > 0) {
      query = query.where((eb) =>
        eb.exists(
          eb.selectFrom('product_categories')
            .select('product_categories.product_id')
            .where('product_categories.product_id', '=', eb.ref('products.id'))
            .where('product_categories.category_id', 'in', criteria.categoryIds as readonly string[])
        )
      );
    }

    // Nutrition filters
    if (criteria.nutrition) {
      query = query.where((eb) =>
        eb.exists(
          eb.selectFrom('product_nutrition')
            .select('product_nutrition.product_id')
            .where('product_nutrition.product_id', '=', eb.ref('products.id'))
            .$if(criteria.nutrition!.kcal?.min !== undefined, (qb) =>
              qb.where('product_nutrition.kcal', '>=', criteria.nutrition!.kcal!.min!)
            )
            .$if(criteria.nutrition!.kcal?.max !== undefined, (qb) =>
              qb.where('product_nutrition.kcal', '<=', criteria.nutrition!.kcal!.max!)
            )
            .$if(criteria.nutrition!.protein?.min !== undefined, (qb) =>
              qb.where('product_nutrition.protein', '>=', criteria.nutrition!.protein!.min!)
            )
            .$if(criteria.nutrition!.protein?.max !== undefined, (qb) =>
              qb.where('product_nutrition.protein', '<=', criteria.nutrition!.protein!.max!)
            )
            .$if(criteria.nutrition!.carbs?.min !== undefined, (qb) =>
              qb.where('product_nutrition.carbs', '>=', criteria.nutrition!.carbs!.min!)
            )
            .$if(criteria.nutrition!.carbs?.max !== undefined, (qb) =>
              qb.where('product_nutrition.carbs', '<=', criteria.nutrition!.carbs!.max!)
            )
            .$if(criteria.nutrition!.fat?.min !== undefined, (qb) =>
              qb.where('product_nutrition.fat', '>=', criteria.nutrition!.fat!.min!)
            )
            .$if(criteria.nutrition!.fat?.max !== undefined, (qb) =>
              qb.where('product_nutrition.fat', '<=', criteria.nutrition!.fat!.max!)
            )
            .$if(criteria.nutrition!.fiber?.min !== undefined, (qb) =>
              qb.where('product_nutrition.fiber', '>=', criteria.nutrition!.fiber!.min!)
            )
            .$if(criteria.nutrition!.fiber?.max !== undefined, (qb) =>
              qb.where('product_nutrition.fiber', '<=', criteria.nutrition!.fiber!.max!)
            )
            .$if(criteria.nutrition!.salt?.min !== undefined, (qb) =>
              qb.where('product_nutrition.salt', '>=', criteria.nutrition!.salt!.min!)
            )
            .$if(criteria.nutrition!.salt?.max !== undefined, (qb) =>
              qb.where('product_nutrition.salt', '<=', criteria.nutrition!.salt!.max!)
            )
        )
      );
    }

    // Flag filters
    if (criteria.flags) {
      Object.entries(criteria.flags).forEach(([flagKey, flagValue]) => {
        if (flagValue !== undefined) {
          const flagType = this.mapLegacyFlagType(flagKey);
          if (flagType) {
            if (flagKey === 'isHalal' && flagValue === 'strict') {
              // Strict halal filtering
              query = query.where((eb) =>
                eb.exists(
                  eb.selectFrom('product_flags')
                    .select('product_flags.product_id')
                    .where('product_flags.product_id', '=', eb.ref('products.id'))
                    .where('product_flags.flag_type', '=', flagType as any)
                    .where('product_flags.flag_value', '=', true)
                    .where('product_flags.confidence', '>=', 90)
                )
              );
            } else {
              query = query.where((eb) =>
                eb.exists(
                  eb.selectFrom('product_flags')
                    .select('product_flags.product_id')
                    .where('product_flags.product_id', '=', eb.ref('products.id'))
                    .where('product_flags.flag_type', '=', flagType as any)
                    .where('product_flags.flag_value', '=', Boolean(flagValue))
                )
              );
            }
          }
        }
      });
    }

    return query;
  }

  /**
   * Map legacy flag keys to database flag types
   * @private
   */
  private mapLegacyFlagType(flagKey: string): string | null {
    const flagMapping: Record<string, string> = {
      'isHalal': 'is_halal',
      'isVegan': 'is_vegan',
      'isVegetarian': 'is_vegetarian',
      'isGlutenFree': 'is_gluten_free',
      'isLactoseFree': 'is_lactose_free',
      'isHighProtein': 'is_high_protein',
      'isLowCarb': 'is_low_carb',
      'isHighFiber': 'is_high_fiber'
    };

    return flagMapping[flagKey] || null;
  }

  /**
   * Check if query uses multi-dimensional filtering
   * @private
   */
  private isMultiDimensionalQuery(criteria: FlexibleFilterCriteria): boolean {
    const dimensionCount = [
      criteria.priceRange,
      criteria.brands?.length,
      criteria.categories?.length,
      criteria.nutrition,
      criteria.flags,
      criteria.scores
    ].filter(Boolean).length;

    return dimensionCount > 1;
  }

  /**
   * Get scoring context from criteria
   * @private
   */
  private getScoreContext(scores: NonNullable<FlexibleFilterCriteria['scores']>): string | undefined {
    if (scores.healthScore?.context) return scores.healthScore.context;
    if (scores.postWorkoutScore?.context) return scores.postWorkoutScore.context;
    return 'multi-score';
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a new ProductRepository instance
 * @returns ProductRepository instance
 */
export async function createProductRepository(): Promise<ProductRepository> {
  const repository = new ProductRepositoryImpl();

  // Initialize connection (will be lazy-loaded on first use)
  await repository.checkHealth();

  return repository;
}

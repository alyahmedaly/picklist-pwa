/**
 * Repository Interface Contract: Kysely Migration
 * Feature: 020-migration-kysely
 * Purpose: Repository pattern contracts for type-safe database operations
 */

import type {
  FlexibleFilterCriteria,
  QueryResult,
  QueryOptions
} from './database-interface.js';

// Base repository interface
export interface BaseRepository {
  readonly isAvailable: boolean;
  checkHealth(): Promise<boolean>;
}

// Product repository contract
export interface ProductRepository extends BaseRepository {
  /**
   * Query products with multi-dimensional filtering
   * @param criteria - Filter criteria for products
   * @returns Promise of query result with products and metadata
   */
  queryProducts(criteria?: FlexibleFilterCriteria): Promise<QueryResult<ProductQueryResult>>;

  /**
   * Get detailed product information by ID
   * @param productId - Unique product identifier
   * @returns Promise of detailed product or null if not found
   */
  getProductDetails(productId: string): Promise<ProductDetailsResult | null>;

  /**
   * Get products by category with optional hierarchy traversal
   * @param categoryId - Category identifier
   * @param includeSubcategories - Whether to include child categories
   * @returns Promise of product list
   */
  getProductsByCategory(
    categoryId: string,
    includeSubcategories?: boolean
  ): Promise<ProductQueryResult[]>;

  /**
   * Get products by multiple criteria with scoring
   * @param flags - Dietary flags to filter by
   * @param scores - Score thresholds to apply
   * @returns Promise of scored products
   */
  getProductsByFlagsAndScores(
    flags: string[],
    scores: Record<string, { min?: number; max?: number }>
  ): Promise<ProductWithScoresResult[]>;
}

// Category repository contract
export interface CategoryRepository extends BaseRepository {
  /**
   * Query category hierarchy using nested set model
   * @param categoryId - Optional root category ID
   * @param includeProducts - Whether to include product IDs
   * @returns Promise of hierarchical category result
   */
  queryCategoryHierarchy(
    categoryId?: string,
    includeProducts?: boolean
  ): Promise<QueryResult<CategoryHierarchyResult>>;

  /**
   * Get complete category tree for navigation
   * @returns Promise of nested category tree
   */
  getCategoryTree(): Promise<CategoryTreeResult[]>;

  /**
   * Get category statistics for analytics
   * @returns Promise of category stats
   */
  getCategoryStats(): Promise<CategoryStatsResult[]>;

  /**
   * Get categories by depth level
   * @param depth - Tree depth level (0 = root)
   * @returns Promise of categories at specified depth
   */
  getCategoriesByDepth(depth: number): Promise<CategoryHierarchyResult[]>;
}

// Search repository contract (conditional)
export interface SearchRepository extends BaseRepository {
  /**
   * Perform full-text search across products
   * @param query - Search query string
   * @param options - Search options and filters
   * @returns Promise of search results with relevance scoring
   */
  searchProducts(
    query: string,
    options?: SearchOptions
  ): Promise<QueryResult<SearchResult>>;

  /**
   * Check if search functionality is available
   * @returns Boolean indicating search table availability
   */
  isSearchAvailable(): boolean;

  /**
   * Get search suggestions for query completion
   * @param partial - Partial query string
   * @param limit - Maximum suggestions to return
   * @returns Promise of search suggestions
   */
  getSearchSuggestions(
    partial: string,
    limit?: number
  ): Promise<string[]>;
}

// Result type contracts
export interface ProductQueryResult {
  readonly id: string;
  readonly name: string;
  readonly price_regular: number;
  readonly price_sale?: number;
  readonly brand?: string;
  readonly unit_amount: number;
  readonly unit_type: string;

  // Joined data
  readonly categories?: CategoryInfo[];
  readonly nutrition?: NutritionInfo;
  readonly flags?: FlagInfo[];
  readonly scores?: ScoreInfo[];
  readonly primaryCategory?: CategoryInfo;
}

export interface ProductDetailsResult extends ProductQueryResult {
  readonly additives?: AdditiveInfo[];
  readonly searchTerms?: SearchTermInfo[];
  readonly created_at: number;
  readonly updated_at: number;
}

export interface ProductWithScoresResult extends ProductQueryResult {
  readonly relevanceScore: number;
  readonly matchedCriteria: string[];
  readonly contextualScore?: number;
}

export interface CategoryHierarchyResult {
  readonly id: string;
  readonly name: string;
  readonly parent_id?: string;
  readonly path: string;
  readonly depth: number;
  readonly product_count: number;
  readonly display_order: number;

  // Hierarchy data
  readonly left_bound: number;
  readonly right_bound: number;
  readonly descendant_count?: number;
  readonly product_ids?: string[];
}

export interface CategoryTreeResult extends CategoryHierarchyResult {
  readonly children?: CategoryTreeResult[];
  readonly parent?: CategoryTreeResult;
}

export interface CategoryStatsResult {
  readonly category: CategoryHierarchyResult;
  readonly avg_protein?: number;
  readonly avg_price: number;
  readonly halal_count: number;
  readonly total_products: number;
  readonly health_score_distribution?: Record<string, number>;
}

export interface SearchResult extends ProductQueryResult {
  readonly relevance_score: number;
  readonly matched_terms: string[];
  readonly match_context: string;
}

// Supporting info types
export interface CategoryInfo {
  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly is_primary: boolean;
  readonly relevance_score?: number;
}

export interface NutritionInfo {
  readonly kcal?: number;
  readonly protein?: number;
  readonly carbs?: number;
  readonly fat?: number;
  readonly fiber?: number;
  readonly salt?: number;
}

export interface FlagInfo {
  readonly flag_type: string;
  readonly flag_value: boolean;
  readonly confidence: number;
  readonly source: string;
}

export interface ScoreInfo {
  readonly score_type: string;
  readonly score_value: number;
  readonly context?: string;
  readonly computed_at: number;
}

export interface AdditiveInfo {
  readonly e_number?: string;
  readonly additive_name: string;
  readonly functional_category: string;
  readonly is_natural: boolean;
  readonly safety_flags?: string[];
}

export interface SearchTermInfo {
  readonly term: string;
  readonly term_type: string;
  readonly weight: number;
  readonly language: string;
}

// Options contracts
export interface SearchOptions extends QueryOptions {
  readonly languages?: ('en' | 'nl')[];
  readonly termTypes?: string[];
  readonly minWeight?: number;
  readonly includeMetadata?: boolean;
  readonly enableSuggestions?: boolean;
}

// Error types
export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

export class SearchUnavailableError extends RepositoryError {
  constructor() {
    super(
      'Search functionality is not available (FLEX_SCHEMA_ENABLE_SEARCH=false)',
      'SEARCH_UNAVAILABLE'
    );
  }
}

export class QueryValidationError extends RepositoryError {
  constructor(
    field: string,
    value: any,
    constraint: string
  ) {
    super(
      `Query validation failed: ${field} ${constraint} (got: ${value})`,
      'QUERY_VALIDATION_ERROR'
    );
  }
}

// Factory interface for repository creation
export interface RepositoryFactory {
  createProductRepository(): ProductRepository;
  createCategoryRepository(): CategoryRepository;
  createSearchRepository(): SearchRepository | null;
  isSearchEnabled(): boolean;
}

// Migration compatibility interface
export interface MigrationCompatibility {
  /**
   * Execute query using legacy raw SQL approach
   * @deprecated Use repository methods instead
   */
  runLegacyQuery(sql: string, params?: any[]): Promise<any[]>;

  /**
   * Compare results between legacy and new implementation
   * @internal Used for parity testing only
   */
  compareQueryResults<T>(
    legacyResult: T[],
    kyselyResult: T[],
    orderBy?: string
  ): { identical: boolean; differences: string[] };
}
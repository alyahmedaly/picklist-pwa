/**
 * Flexible Schema SQLite Database Loader
 * Feature: 019-flexible-database-schema
 *
 * High-level interface for the flexible schema database that uses the repository-based
 * database manager for consistent database management and type safety.
 * 
 * Note: This file maintains backward compatibility while internally using repositories.
 * Complex queries still use raw SQL fallback when repository routing is not available.
 */

import { runQuery } from '../db/repository-manager.ts';

/**
 * Multi-dimensional filter criteria for flexible schema queries
 */
export interface FlexibleFilterCriteria {
  // Basic product filters
  productIds?: string[];
  search?: string; // Full-text search across multiple fields
  priceRange?: { min?: number; max?: number };
  brands?: string[];

  // Category filters (leverages hierarchical structure)
  categories?: string[];
  categoryIds?: string[];
  includeSubcategories?: boolean; // Use nested set model for hierarchy
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
    isHalal?: boolean | 'strict'; // strict excludes questionable
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
    excludeSouthamptonSix?: boolean; // Color additive warnings for children
  };

  // Search and text filters
  searchTerms?: {
    terms?: string[];
    languages?: ('en' | 'nl')[];
    termTypes?: ('name' | 'brand' | 'ingredient' | 'category' | 'nutritional_tag' | 'dietary_flag')[];
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
export interface FlexibleQueryResult<T = unknown> {
  data: T[];
  totalCount: number;
  filteredCount: number;
  queryTimeMs: number;
  metadata: {
    searchPerformed: boolean;
    categoryHierarchyUsed: boolean;
    multiDimensionalFiltering: boolean;
    scoringContext?: string;
    /** Indicates if search was performed client-side (true) or server-side (false) */
    clientSideSearch?: boolean;
    /** Indicates if database search functionality is available (false = client-side only) */
    databaseSearchAvailable?: boolean;
  };
}

/**
 * Execute multi-dimensional product queries with flexible schema
 */
export async function queryFlexibleProducts(criteria: FlexibleFilterCriteria = {}): Promise<FlexibleQueryResult> {
  const startTime = Date.now();
  const { sql, params } = buildFlexibleQuery(criteria);

  try {
    const results = await runQuery(sql, params);
    const queryTimeMs = Date.now() - startTime;

    // Determine query metadata
    const metadata = {
      searchPerformed: Boolean(criteria.search || criteria.searchTerms),
      categoryHierarchyUsed: Boolean(criteria.categories && criteria.includeSubcategories),
      multiDimensionalFiltering: isMultiDimensional(criteria),
      scoringContext: criteria.scores ? getScoreContext(criteria.scores) : undefined
    };

    return {
      data: results,
      totalCount: results.length,
      filteredCount: results.length,
      queryTimeMs,
      metadata
    };

  } catch (error) {
    throw new Error(`Flexible query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Execute category hierarchy queries using nested set model
 */
export async function queryFlexibleCategoryHierarchy(categoryId?: string, includeProducts = false): Promise<FlexibleQueryResult> {
  const startTime = Date.now();
  let sql: string;
  let params: any[] = [];

  if (categoryId) {
    // Get category and all descendants using nested set model
    sql = `
      SELECT c.*,
             COUNT(DISTINCT pc.product_id) as product_count,
             ${includeProducts ? 'GROUP_CONCAT(DISTINCT pc.product_id) as product_ids' : 'NULL as product_ids'}
      FROM categories c
      LEFT JOIN categories parent ON parent.id = ?
      LEFT JOIN product_categories pc ON c.id = pc.category_id
      WHERE c.left_bound >= parent.left_bound AND c.right_bound <= parent.right_bound
      GROUP BY c.id, c.name, c.parent_id, c.path, c.depth, c.left_bound, c.right_bound
      ORDER BY c.left_bound
    `;
    params = [categoryId];
  } else {
    // Get root categories
    sql = `
      SELECT c.*,
             COUNT(DISTINCT pc.product_id) as product_count,
             ${includeProducts ? 'GROUP_CONCAT(DISTINCT pc.product_id) as product_ids' : 'NULL as product_ids'}
      FROM categories c
      LEFT JOIN product_categories pc ON c.id = pc.category_id
      WHERE c.parent_id IS NULL
      GROUP BY c.id, c.name, c.parent_id, c.path, c.depth, c.left_bound, c.right_bound
      ORDER BY c.display_order, c.name
    `;
  }

  try {
    const results = await runQuery(sql, params);
    const queryTimeMs = Date.now() - startTime;

    return {
      data: results,
      totalCount: results.length,
      filteredCount: results.length,
      queryTimeMs,
      metadata: {
        searchPerformed: false,
        categoryHierarchyUsed: true,
        multiDimensionalFiltering: false
      }
    };

  } catch (error) {
    throw new Error(`Category hierarchy query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Execute full-text search across normalized search terms
 */
// Resolve search enabled state (kept in sync with flexibleSchema.ts & generator)
const FLEX_SEARCH_ENABLED = false;//process.env.FLEX_SCHEMA_ENABLE_SEARCH !== 'false';

export async function searchFlexibleProducts(query: string, options: {
  languages?: ('en' | 'nl')[];
  termTypes?: string[];
  limit?: number;
  includeMetadata?: boolean;
} = {}): Promise<FlexibleQueryResult> {
  if (!FLEX_SEARCH_ENABLED) {
    return {
      data: [],
      totalCount: 0,
      filteredCount: 0,
      queryTimeMs: 0,
      metadata: {
        searchPerformed: false,
        categoryHierarchyUsed: false,
        multiDimensionalFiltering: false,
        message: 'Search disabled (FLEX_SCHEMA_ENABLE_SEARCH=false)'
      }
    } as FlexibleQueryResult;
  }

  const startTime = Date.now();
  const { languages = ['en', 'nl'], termTypes = [], limit = 50, includeMetadata = true } = options;

  // Build search query using normalized search terms
  let sql = `
    SELECT DISTINCT p.*,
           SUM(pst.weight) as relevance_score,
           ${includeMetadata ? 'GROUP_CONCAT(DISTINCT pst.term) as matched_terms' : 'NULL as matched_terms'}
    FROM products p
    JOIN product_search_terms pst ON p.id = pst.product_id
    WHERE pst.term LIKE ?
  `;

  const params: (string | number)[] = [`%${query.toLowerCase()}%`];

  // Add language filter
  if (languages.length > 0) {
    sql += ` AND pst.language IN (${languages.map(() => '?').join(',')})`;
    params.push(...languages);
  }

  // Add term type filter
  if (termTypes.length > 0) {
    sql += ` AND pst.term_type IN (${termTypes.map(() => '?').join(',')})`;
    params.push(...termTypes);
  }

  sql += `
    GROUP BY p.id, p.name, p.price_regular, p.price_sale, p.unit_amount, p.unit_type, p.brand
    ORDER BY relevance_score DESC, p.name ASC
  `;

  if (limit > 0) {
    sql += ` LIMIT ?`;
    params.push(limit);
  }

  try {
    const results = await runQuery(sql, params);
    const queryTimeMs = Date.now() - startTime;

    return {
      data: results,
      totalCount: results.length,
      filteredCount: results.length,
      queryTimeMs,
      metadata: {
        searchPerformed: true,
        categoryHierarchyUsed: false,
        multiDimensionalFiltering: false
      }
    };

  } catch (error) {
    throw new Error(`Search query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get product details with all related data from flexible schema
 */
export async function getFlexibleProductDetails(productId: string): Promise<Record<string, unknown> | null> {
  const sql = `
    SELECT
      p.*,
      pn.kcal, pn.kj, pn.protein, pn.carbs, pn.sugars, pn.fat, pn.saturated_fat, pn.fiber, pn.salt, pn.sodium,
      GROUP_CONCAT(DISTINCT c.name) as categories,
      GROUP_CONCAT(DISTINCT pa.e_number) as e_numbers,
      GROUP_CONCAT(DISTINCT pst.term) as search_terms
    FROM products p
    LEFT JOIN product_nutrition pn ON p.id = pn.product_id
    LEFT JOIN product_categories pc ON p.id = pc.product_id
    LEFT JOIN categories c ON pc.category_id = c.id
    LEFT JOIN product_additives pa ON p.id = pa.product_id
  ${FLEX_SEARCH_ENABLED ? 'LEFT JOIN product_search_terms pst ON p.id = pst.product_id' : ''}
    WHERE p.id = ?
    GROUP BY p.id
  `;

  try {
  const results = await runQuery(sql, [productId]) as Record<string, unknown>[];
  return results.length > 0 ? results[0] as Record<string, unknown> : null;

  } catch (error) {
    throw new Error(`Product details query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if flexible schema is available by testing for required tables
 */
export async function isFlexibleSchemaAvailable(): Promise<boolean> {
  try {
    // Test for key flexible schema tables
    await runQuery("SELECT 1 FROM categories LIMIT 1");
    await runQuery("SELECT 1 FROM product_categories LIMIT 1");
    if (FLEX_SEARCH_ENABLED) {
      await runQuery("SELECT 1 FROM product_search_terms LIMIT 1");
    }
    return true;
  } catch (error) {
    console.warn('Flexible schema not available:', error);
    return false;
  }
}

/**
 * Get flexible schema statistics for monitoring
 */
type CountRow = { count?: number };
export async function getFlexibleSchemaStats(): Promise<{
  products: number;
  categories: number;
  productCategories: number;
  nutritionRecords: number;
  flags: number;
  scores: number;
  additives: number;
  searchTerms: number;
}> {
  try {
    const [
      products,
      categories,
      productCategories,
      nutritionRecords,
      flags,
      scores,
      additives,
      searchTerms
    ] = await Promise.all([
      runQuery("SELECT COUNT(*) as count FROM products"),
      runQuery("SELECT COUNT(*) as count FROM categories"),
      runQuery("SELECT COUNT(*) as count FROM product_categories"),
      runQuery("SELECT COUNT(*) as count FROM product_nutrition"),
      runQuery("SELECT COUNT(*) as count FROM product_flags"),
      runQuery("SELECT COUNT(*) as count FROM product_scores"),
      runQuery("SELECT COUNT(*) as count FROM product_additives"),
  FLEX_SEARCH_ENABLED ? runQuery("SELECT COUNT(*) as count FROM product_search_terms") : Promise.resolve([{ count: 0 }])
    ]);

  const get = (arr: CountRow[] | undefined): number => (arr && arr[0] && typeof arr[0].count === 'number') ? arr[0].count : 0;
    return {
      products: get(products as CountRow[]),
      categories: get(categories as CountRow[]),
      productCategories: get(productCategories as CountRow[]),
      nutritionRecords: get(nutritionRecords as CountRow[]),
      flags: get(flags as CountRow[]),
      scores: get(scores as CountRow[]),
      additives: get(additives as CountRow[]),
      searchTerms: get(searchTerms as CountRow[]),
    };

  } catch (error) {
    throw new Error(`Failed to get flexible schema stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Private helper functions

function buildFlexibleQuery(criteria: FlexibleFilterCriteria): { sql: string; params: (string | number)[] } {
  const params: (string | number)[] = [];
  const conditions: string[] = [];
  const joins: string[] = [];

  // Base query with product table
  let sql = 'SELECT DISTINCT p.*';
  const fromClause = 'FROM products p';

  // Add nutrition join if nutrition criteria specified
  if (criteria.nutrition) {
    joins.push('LEFT JOIN product_nutrition pn ON p.id = pn.product_id');
    addNutritionConditions(criteria.nutrition, conditions, params);
  }

  // Add category join if category criteria specified
  if (criteria.categories || criteria.categoryIds) {
    joins.push('LEFT JOIN product_categories pc ON p.id = pc.product_id');
    joins.push('LEFT JOIN categories c ON pc.category_id = c.id');
    addCategoryConditions(criteria, conditions, params);
  }

  // Add flags join if flag criteria specified
  if (criteria.flags) {
    joins.push('LEFT JOIN product_flags pf ON p.id = pf.product_id');
    addFlagConditions(criteria.flags, conditions, params);
  }

  // Add scores join if score criteria specified
  if (criteria.scores) {
    joins.push('LEFT JOIN product_scores ps ON p.id = ps.product_id');
    addScoreConditions(criteria.scores, conditions, params);
  }

  // Add search terms join if search criteria specified
  if (criteria.search || criteria.searchTerms) {
    joins.push('LEFT JOIN product_search_terms pst ON p.id = pst.product_id');
    addSearchConditions(criteria, conditions, params);
  }

  // Add basic product conditions
  addBasicProductConditions(criteria, conditions, params);

  // Build final query
  const joinClause = joins.length > 0 ? ' ' + joins.join(' ') : '';
  const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
  const orderClause = buildOrderClause(criteria);
  const limitClause = buildLimitClause(criteria, params);

  sql = sql + ' ' + fromClause + joinClause + whereClause + orderClause + limitClause;

  return { sql, params };
}

function addNutritionConditions(nutrition: NonNullable<FlexibleFilterCriteria['nutrition']>, conditions: string[], params: (string | number)[]): void {
  (['kcal', 'protein', 'carbs', 'fat', 'fiber', 'salt'] as const).forEach(nutrient => {
    const range = nutrition[nutrient];
    if (range) {
      if (range.min !== undefined) {
        conditions.push(`pn.${nutrient} >= ?`);
        params.push(range.min);
      }
      if (range.max !== undefined) {
        conditions.push(`pn.${nutrient} <= ?`);
        params.push(range.max);
      }
    }
  });
}

function addCategoryConditions(criteria: FlexibleFilterCriteria, conditions: string[], params: (string | number)[]): void {
  if (criteria.categories && criteria.categories.length > 0) {
    conditions.push(`c.name IN (${criteria.categories.map(() => '?').join(',')})`);
    params.push(...criteria.categories);
  }

  if (criteria.categoryIds && criteria.categoryIds.length > 0) {
    conditions.push(`c.id IN (${criteria.categoryIds.map(() => '?').join(',')})`);
    params.push(...criteria.categoryIds);
  }
}

function addFlagConditions(flags: NonNullable<FlexibleFilterCriteria['flags']>, conditions: string[], params: (string | number)[]): void {
  Object.entries(flags).forEach(([flagType, value]) => {
    if (value !== undefined) {
      const mappedFlagType = mapFlagType(flagType);
      if (mappedFlagType) {
        if (flagType === 'isHalal' && value === 'strict') {
          // Strict halal: must be confirmed halal (exclude questionable)
          conditions.push('pf.flag_type = ? AND pf.flag_value = 1 AND pf.confidence >= 90');
          params.push(mappedFlagType);
        } else {
          conditions.push('pf.flag_type = ? AND pf.flag_value = ?');
          params.push(mappedFlagType, value ? 1 : 0);
        }
      }
    }
  });
}

function addScoreConditions(scores: NonNullable<FlexibleFilterCriteria['scores']>, conditions: string[], params: (string | number)[]): void {
  Object.entries(scores).forEach(([scoreType, criteria]) => {
    if (criteria && typeof criteria === 'object') {
      const mappedScoreType = mapScoreType(scoreType);
      if (mappedScoreType) {
        const scoreConditions: string[] = [`ps.score_type = ?`];
        params.push(mappedScoreType);

        if (criteria.min !== undefined) {
          scoreConditions.push('ps.score_value >= ?');
          params.push(criteria.min);
        }
        if (criteria.max !== undefined) {
          scoreConditions.push('ps.score_value <= ?');
          params.push(criteria.max);
        }
        if ('context' in criteria && criteria.context) {
          scoreConditions.push('ps.context = ?');
          params.push(criteria.context);
        }

        conditions.push(`(${scoreConditions.join(' AND ')})`);
      }
    }
  });
}

function addSearchConditions(criteria: FlexibleFilterCriteria, conditions: string[], params: (string | number)[]): void {
  if (criteria.search) {
    conditions.push('pst.term LIKE ?');
    params.push(`%${criteria.search.toLowerCase()}%`);
  }

  if (criteria.searchTerms) {
    const searchConditions: string[] = [];

    if (criteria.searchTerms.terms && criteria.searchTerms.terms.length > 0) {
      searchConditions.push(`pst.term IN (${criteria.searchTerms.terms.map(() => '?').join(',')})`);
      params.push(...criteria.searchTerms.terms);
    }

    if (criteria.searchTerms.languages && criteria.searchTerms.languages.length > 0) {
      searchConditions.push(`pst.language IN (${criteria.searchTerms.languages.map(() => '?').join(',')})`);
      params.push(...criteria.searchTerms.languages);
    }

    if (criteria.searchTerms.termTypes && criteria.searchTerms.termTypes.length > 0) {
      searchConditions.push(`pst.term_type IN (${criteria.searchTerms.termTypes.map(() => '?').join(',')})`);
      params.push(...criteria.searchTerms.termTypes);
    }

    if (criteria.searchTerms.minWeight !== undefined) {
      searchConditions.push('pst.weight >= ?');
      params.push(criteria.searchTerms.minWeight);
    }

    if (searchConditions.length > 0) {
      conditions.push(`(${searchConditions.join(' AND ')})`);
    }
  }
}

function addBasicProductConditions(criteria: FlexibleFilterCriteria, conditions: string[], params: (string | number)[]): void {
  if (criteria.productIds && criteria.productIds.length > 0) {
    conditions.push(`p.id IN (${criteria.productIds.map(() => '?').join(',')})`);
    params.push(...criteria.productIds);
  }

  if (criteria.brands && criteria.brands.length > 0) {
    conditions.push(`p.brand IN (${criteria.brands.map(() => '?').join(',')})`);
    params.push(...criteria.brands);
  }

  if (criteria.priceRange) {
    if (criteria.priceRange.min !== undefined) {
      conditions.push('p.price_regular >= ?');
      params.push(criteria.priceRange.min);
    }
    if (criteria.priceRange.max !== undefined) {
      conditions.push('p.price_regular <= ?');
      params.push(criteria.priceRange.max);
    }
  }
}

function buildOrderClause(criteria: FlexibleFilterCriteria): string {
  const { sortBy = 'name', sortOrder = 'asc' } = criteria;

  const orderMap: Record<string, string> = {
    name: 'p.name',
    price: 'p.price_regular',
    protein: 'pn.protein',
    health_score: 'ps.score_value',
    relevance: 'pst.weight'
  };

  const orderColumn = orderMap[sortBy] || 'p.name';
  return ` ORDER BY ${orderColumn} ${sortOrder.toUpperCase()}`;
}

function buildLimitClause(criteria: FlexibleFilterCriteria, params: (string | number)[]): string {
  let clause = '';

  if (criteria.limit !== undefined && criteria.limit > 0) {
    clause += ' LIMIT ?';
    params.push(criteria.limit);

    if (criteria.offset !== undefined && criteria.offset > 0) {
      clause += ' OFFSET ?';
      params.push(criteria.offset);
    }
  }

  return clause;
}

function isMultiDimensional(criteria: FlexibleFilterCriteria): boolean {
  const dimensionCount = [
    criteria.nutrition,
    criteria.flags,
    criteria.scores,
    criteria.categories,
    criteria.additives
  ].filter(Boolean).length;

  return dimensionCount >= 2;
}

function getScoreContext(scores: NonNullable<FlexibleFilterCriteria['scores']>): string | undefined {
  // Extract context from first score criteria that has one
  for (const criteria of Object.values(scores)) {
    if (criteria && typeof criteria === 'object' && 'context' in criteria && criteria.context) {
      return criteria.context;
    }
  }
  return undefined;
}

function mapFlagType(flagType: string): string | null {
  const mapping: Record<string, string> = {
    isHalal: 'is_halal',
    isVegan: 'is_vegan',
    isVegetarian: 'is_vegetarian',
    isGlutenFree: 'is_gluten_free',
    isLactoseFree: 'is_lactose_free',
    isHighProtein: 'is_high_protein',
    isLowCarb: 'is_low_carb',
    isHighFiber: 'is_high_fiber'
  };

  return mapping[flagType] || null;
}

function mapScoreType(scoreType: string): string | null {
  const mapping: Record<string, string> = {
    healthScore: 'health_score',
    proteinEfficiency: 'protein_efficiency',
    satietyScore: 'satiety_score',
    postWorkoutScore: 'post_workout_score',
    fatLossScore: 'fat_loss_score',
    calorieEfficiency: 'calorie_efficiency'
  };

  return mapping[scoreType] || null;
}
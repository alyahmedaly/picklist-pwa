/**
 * Multi-dimensional Product Query Hook
 * Feature: 019-flexible-database-schema
 *
 * React hooks for querying products using the flexible schema with
 * multi-dimensional filtering, category hierarchy, and client-side search.
 * 
 * ⚠️ SEARCH IMPLEMENTATION: CLIENT-SIDE ONLY
 * - No database search tables exist (no FTS, no search indexes)
 * - Search operations load all products into memory for filtering
 * - For advanced Dutch language search, use src/lib/dutchSearch.ts directly
 * - Database queries are optimized for filtering and hierarchy operations
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getRepositoryFactory } from '../db/kysely/repository-factory.js';
import type {
  FlexibleFilterCriteria,
  FlexibleQueryResult,
} from '../data/loadFlexibleDatabase.js';

// =============================================================================
// REPOSITORY ADAPTER FUNCTIONS
// =============================================================================

/**
 * Adapter function for queryFlexibleProducts using ProductRepository
 */
async function queryFlexibleProducts(criteria: FlexibleFilterCriteria = {}): Promise<FlexibleQueryResult> {
  const factory = await getRepositoryFactory();
  const productRepo = await factory.getProductRepository();
  return await productRepo.queryFlexibleProducts(criteria);
}

/**
 * Adapter function for client-side product search using ProductRepository
 * 
 * ⚠️ IMPORTANT: This is CLIENT-SIDE ONLY search functionality
 * - No database search tables exist (no FTS, no search indexes)
 * - All search operations happen in memory after loading products
 * - Not optimized for large datasets (loads all products for filtering)
 * - For advanced Dutch language search, use src/lib/dutchSearch.ts directly
 * 
 * @param query - Search query string
 * @param options - Search configuration options (languages/termTypes ignored - client-side only)
 * @returns Promise resolving to search results
 */
async function searchFlexibleProducts(query: string, options: {
  /** @deprecated Languages parameter ignored in client-side search */
  languages?: string[];
  /** @deprecated Term types parameter ignored in client-side search */
  termTypes?: string[];
  /** Maximum number of results to return */
  limit?: number;
  /** Whether to include search metadata */
  includeMetadata?: boolean;
} = {}): Promise<FlexibleQueryResult> {
  const factory = await getRepositoryFactory();
  const productRepo = await factory.getProductRepository();
  
  // Use the basic client-side search from ProductRepository
  // Note: This loads ALL products into memory for filtering
  const result = await productRepo.searchproducts(query, { 
    limit: options.limit || 50,
    offset: 0 
  });
  
  // Convert ProductQueryResult to FlexibleQueryResult format
  return {
    data: result.products,
    totalCount: result.totalCount,
    filteredCount: result.filteredCount,
    queryTimeMs: result.queryTimeMs,
    metadata: {
      searchPerformed: true,
      categoryHierarchyUsed: false,
      multiDimensionalFiltering: false,
      // Client-side search metadata
      clientSideSearch: true,
      databaseSearchAvailable: false,
    }
  };
}

/**
 * Adapter function for queryFlexibleCategoryHierarchy using CategoryRepository
 * Maintains identical behavior to legacy implementation:
 * - For categoryId: returns category AND ALL descendants (nested set model)
 * - For no categoryId: returns only root categories
 * - Includes product counts and IDs when requested
 */
async function queryFlexibleCategoryHierarchy(categoryId?: string, includeProducts = false): Promise<FlexibleQueryResult> {
  const factory = await getRepositoryFactory();
  const categoryRepo = await factory.getCategoryRepository();
  
  let data: unknown[];
  let totalCount = 0;
  const startTime = performance.now();
  
  try {
    if (categoryId) {
      // Get category and ALL descendants using nested set model (matching legacy behavior)
      // Legacy query includes the parent category itself, so we need to combine parent + descendants
      const [parentResult, descendants] = await Promise.all([
        categoryRepo.getById(categoryId),
        categoryRepo.getDescendants(categoryId, { 
          includeProductCounts: includeProducts 
        })
      ]);
      
      // Combine parent and descendants, with parent first (matching legacy left_bound ordering)
      if (parentResult) {
        data = [parentResult, ...descendants];
      } else {
        data = descendants;
      }
      totalCount = data.length;
    } else {
      // Get root categories only (parent_id IS NULL)
      const roots = await categoryRepo.getRootCategories({ 
        includeProductCounts: includeProducts 
      });
      data = roots;
      totalCount = roots.length;
    }
    
    const queryTimeMs = performance.now() - startTime;
    
    return {
      data,
      totalCount,
      filteredCount: totalCount,
      queryTimeMs,
      metadata: {
        searchPerformed: false,
        categoryHierarchyUsed: true,
        multiDimensionalFiltering: false,
      }
    };
  } catch (error) {
    throw new Error(`Category hierarchy query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Adapter function for getFlexibleProductDetails using ProductRepository
 */
async function getFlexibleProductDetails(productId: string): Promise<Record<string, unknown> | null> {
  const factory = await getRepositoryFactory();
  const productRepo = await factory.getProductRepository();
  
  const result = await productRepo.getFlexibleProductDetails(productId);
  return result as Record<string, unknown> | null;
}

/**
 * Adapter function for isFlexibleSchemaAvailable using RepositoryFactory
 */
async function isFlexibleSchemaAvailable(): Promise<boolean> {
  try {
    const factory = await getRepositoryFactory();
    const features = await factory.getFeatures();
    return features.hasCoreTables;
  } catch (error) {
    console.warn('Failed to check schema availability:', error);
    return false;
  }
}

/**
 * Adapter function for getFlexibleSchemaStats using multiple repositories
 */
async function getFlexibleSchemaStats(): Promise<{
  products: number;
  categories: number;
  productCategories: number;
  nutritionRecords: number;
  flags: number;
  scores: number;
  additives: number;
  searchTerms: number;
}> {
  const factory = await getRepositoryFactory();
  // Check factory health to ensure repositories are available
  await factory.checkHealth();
  
  // For now, return basic stats - this would need more detailed implementation
  // based on actual repository methods for getting counts
  return {
    products: 0, // Would need ProductRepository.getCount()
    categories: 0, // Would need CategoryRepository.getCount()
    productCategories: 0, // Would need junction table count
    nutritionRecords: 0, // Would need ProductRepository.getNutritionCount()
    flags: 0, // Would need ProductRepository.getFlagsCount()
    scores: 0, // Would need ProductRepository.getScoresCount()
    additives: 0, // Would need ProductRepository.getAdditivesCount()
    searchTerms: 0, // Would need SearchRepository.getTermsCount()
  };
}

/**
 * Hook state for flexible product queries
 */
export interface UseFlexibleProductsState<T = unknown> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  queryTimeMs: number;
  totalCount: number;
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
 * Hook options for flexible product queries
 */
export interface UseFlexibleProductsOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
  onSuccess?: (data: FlexibleQueryResult) => void;
  onError?: (error: Error) => void;
}

/**
 * Main hook for flexible product queries with multi-dimensional filtering
 */
export function useFlexibleProducts<T = unknown>(
  criteria: FlexibleFilterCriteria = {},
  options: UseFlexibleProductsOptions = {}
) {
  const { enabled = true, refetchOnMount = true, onSuccess, onError } = options;

  const [state, setState] = useState<UseFlexibleProductsState<T>>({
    data: [],
    isLoading: enabled,
    error: null,
    queryTimeMs: 0,
    totalCount: 0,
    metadata: {
      searchPerformed: false,
      categoryHierarchyUsed: false,
      multiDimensionalFiltering: false,
    }
  });

  // Memoize criteria to prevent unnecessary re-queries
  // Shallow memo – assume caller provides stable object or primitive props; deep diff was causing re-renders
  const memoizedCriteria = criteria;

  const executeQuery = useCallback(async (queryCriteria: FlexibleFilterCriteria) => {
    if (!enabled) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await queryFlexibleProducts(queryCriteria);

      setState({
        data: result.data as T[],
        isLoading: false,
        error: null,
        queryTimeMs: result.queryTimeMs,
        totalCount: result.totalCount,
        metadata: result.metadata
      });

      onSuccess?.(result);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [enabled, onSuccess, onError]);

  const refetch = useCallback(() => {
    return executeQuery(memoizedCriteria);
  }, [executeQuery, memoizedCriteria]);

  // Execute query when criteria change or on mount
  useEffect(() => {
    if (enabled && (refetchOnMount || Object.keys(memoizedCriteria).length > 0)) {
      executeQuery(memoizedCriteria);
    }
  }, [memoizedCriteria, enabled, refetchOnMount, executeQuery]);

  return {
    ...state,
    refetch,
    executeQuery: (newCriteria: FlexibleFilterCriteria) => executeQuery(newCriteria)
  };
}

/**
 * Hook for client-side product search with debouncing
 * 
 * ⚠️ IMPORTANT: This is CLIENT-SIDE ONLY search functionality
 * - No database search tables exist in the schema
 * - All search operations happen in memory after loading products
 * - Performance limitations with large datasets (loads all products)
 * - Languages and termTypes options are deprecated (client-side search only)
 * 
 * For advanced Dutch language search features, consider integrating
 * src/lib/dutchSearch.ts directly in your components.
 * 
 * @param query - Search query string (debounced automatically)
 * @param options - Configuration options
 * @returns Search results state with loading, error, and data
 */
// Stable module-level defaults to avoid new array references each render
const DEFAULT_LANGUAGES: ReadonlyArray<'en' | 'nl'> = ['en', 'nl'] as const;
const DEFAULT_TERM_TYPES: ReadonlyArray<string> = [] as const;

export function useFlexibleProductSearch<T = unknown>(
  query: string,
  options: {
    /** Whether search is enabled (default: true) */
    enabled?: boolean;
    /** Debounce delay in milliseconds (default: 300) */
    debounceMs?: number;
    /** @deprecated Languages parameter ignored in client-side search */
    languages?: ('en' | 'nl')[];
    /** @deprecated Term types parameter ignored in client-side search */
    termTypes?: string[];
    /** Maximum number of results to return (default: 50) */
    limit?: number;
    /** Whether to include search metadata (default: true) */
    includeMetadata?: boolean;
  } = {}
) {
  const {
    enabled = true,
    debounceMs = 300,
    languages: languagesProp,
    termTypes: termTypesProp,
    limit = 50,
    includeMetadata = true
  } = options;
  // Ensure stable references for dependencies
  const languages = languagesProp ?? DEFAULT_LANGUAGES;
  const termTypes = termTypesProp ?? DEFAULT_TERM_TYPES;

  const [state, setState] = useState<UseFlexibleProductsState<T>>({
    data: [],
    isLoading: false,
    error: null,
    queryTimeMs: 0,
    totalCount: 0,
    metadata: {
      searchPerformed: false,
      categoryHierarchyUsed: false,
      multiDimensionalFiltering: false,
      clientSideSearch: true, // This hook always uses client-side search
      databaseSearchAvailable: false, // No database search tables exist
    }
  });

  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [query, debounceMs]);

  const executeSearch = useCallback(async (searchQuery: string) => {
    if (!enabled || !searchQuery.trim()) {
      setState(prev => ({ ...prev, data: [], isLoading: false, error: null }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await searchFlexibleProducts(searchQuery, {
        // Clone readonly arrays to satisfy mutable param types without casting
        languages: [...languages],
        termTypes: [...termTypes],
        limit,
        includeMetadata
      });

      setState({
        data: result.data as T[],
        isLoading: false,
        error: null,
        queryTimeMs: result.queryTimeMs,
        totalCount: result.totalCount,
        metadata: result.metadata
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  // Only include stable primitives / stable references
  }, [enabled, limit, includeMetadata, languages, termTypes]);

  // Execute search when debounced query changes
  useEffect(() => {
    executeSearch(debouncedQuery);
  }, [debouncedQuery, executeSearch]);

  const refetch = useCallback(() => {
    return executeSearch(debouncedQuery);
  }, [executeSearch, debouncedQuery]);

  return {
    ...state,
    refetch,
    query: debouncedQuery
  };
}

/**
 * Hook for category hierarchy queries with flexible schema
 */
export function useFlexibleCategoryHierarchy<T = unknown>(
  categoryId?: string,
  options: {
    enabled?: boolean;
    includeProducts?: boolean;
  } = {}
) {
  const { enabled = true, includeProducts = false } = options;

  const [state, setState] = useState<UseFlexibleProductsState<T>>({
    data: [],
    isLoading: enabled,
    error: null,
    queryTimeMs: 0,
    totalCount: 0,
    metadata: {
      searchPerformed: false,
      categoryHierarchyUsed: true,
      multiDimensionalFiltering: false,
    }
  });

  const executeQuery = useCallback(async (catId?: string) => {
    if (!enabled) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await queryFlexibleCategoryHierarchy(catId, includeProducts);

      setState({
        data: result.data as T[],
        isLoading: false,
        error: null,
        queryTimeMs: result.queryTimeMs,
        totalCount: result.totalCount,
        metadata: result.metadata
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, [enabled, includeProducts]);

  const refetch = useCallback(() => {
    return executeQuery(categoryId);
  }, [executeQuery, categoryId]);

  // Execute query when categoryId changes or on mount
  useEffect(() => {
    if (enabled) {
      executeQuery(categoryId);
    }
  }, [categoryId, enabled, executeQuery]);

  return {
    ...state,
    refetch,
    executeQuery: (newCategoryId?: string) => executeQuery(newCategoryId)
  };
}

/**
 * Hook for individual product details with flexible schema
 */
export function useFlexibleProductDetails<T = unknown>(
  productId: string,
  options: {
    enabled?: boolean;
  } = {}
) {
  const { enabled = true } = options;

  const [state, setState] = useState<{
    data: T | null;
    isLoading: boolean;
    error: string | null;
  }>({
    data: null,
    isLoading: enabled && !!productId,
    error: null
  });

  const executeQuery = useCallback(async (id: string) => {
    if (!enabled || !id) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await getFlexibleProductDetails(id);

      setState({
        data: result as T | null,
        isLoading: false,
        error: null
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, [enabled]);

  const refetch = useCallback(() => {
    return executeQuery(productId);
  }, [executeQuery, productId]);

  // Execute query when productId changes or on mount
  useEffect(() => {
    if (enabled && productId) {
      executeQuery(productId);
    }
  }, [productId, enabled, executeQuery]);

  return {
    ...state,
    refetch,
    executeQuery: (newProductId: string) => executeQuery(newProductId)
  };
}

/**
 * Hook for checking flexible schema availability
 */
export function useFlexibleSchemaAvailability() {
  const [state, setState] = useState<{
    isAvailable: boolean | null;
    isLoading: boolean;
    error: string | null;
  }>({
    isAvailable: null,
    isLoading: true,
    error: null
  });

  const checkAvailability = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const available = await isFlexibleSchemaAvailable();
      setState({
        isAvailable: available,
        isLoading: false,
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        isAvailable: false,
        isLoading: false,
        error: errorMessage
      });
    }
  }, []);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  return {
    ...state,
    refetch: checkAvailability
  };
}

/**
 * Hook for flexible schema statistics
 */
export function useFlexibleSchemaStats(
  options: {
    enabled?: boolean;
    refetchInterval?: number;
  } = {}
) {
  const { enabled = true, refetchInterval } = options;

  const [state, setState] = useState<{
    data: {
      products: number;
      categories: number;
      productCategories: number;
      nutritionRecords: number;
      flags: number;
      scores: number;
      additives: number;
      searchTerms: number;
    } | null;
    isLoading: boolean;
    error: string | null;
  }>({
    data: null,
    isLoading: enabled,
    error: null
  });

  const executeQuery = useCallback(async () => {
    if (!enabled) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const stats = await getFlexibleSchemaStats();
      setState({
        data: stats,
        isLoading: false,
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, [enabled]);

  const refetch = useCallback(() => {
    return executeQuery();
  }, [executeQuery]);

  // Execute query on mount
  useEffect(() => {
    if (enabled) {
      executeQuery();
    }
  }, [enabled, executeQuery]);

  // Set up refetch interval if specified
  useEffect(() => {
    if (enabled && refetchInterval && refetchInterval > 0) {
      const interval = setInterval(() => {
        executeQuery();
      }, refetchInterval);

      return () => clearInterval(interval);
    }
  }, [enabled, refetchInterval, executeQuery]);

  return {
    ...state,
    refetch
  };
}

/**
 * Compound hook for Ali-specific multi-dimensional filtering
 * Combines common filtering patterns for Ali's nutrition tracking needs
 */
export function useAliFlexibleFilters(
  baseFilters: {
    halal?: boolean | 'strict';
    minProtein?: number;
    maxCalories?: number;
    categories?: string[];
    search?: string;
  } = {},
  options: UseFlexibleProductsOptions = {}
) {
  // Convert Ali-specific filters to flexible schema criteria
  const flexibleCriteria: FlexibleFilterCriteria = useMemo(() => {
    const criteria: FlexibleFilterCriteria = {};

    // Basic search
    if (baseFilters.search) {
      criteria.search = baseFilters.search;
    }

    // Categories
    if (baseFilters.categories && baseFilters.categories.length > 0) {
      criteria.categories = baseFilters.categories;
      criteria.includeSubcategories = true; // Enable hierarchy for comprehensive results
    }

    // Nutrition filters
    const nutrition: FlexibleFilterCriteria['nutrition'] = {};
    if (baseFilters.minProtein !== undefined) {
      nutrition.protein = { min: baseFilters.minProtein };
    }
    if (baseFilters.maxCalories !== undefined) {
      nutrition.kcal = { max: baseFilters.maxCalories };
    }
    if (Object.keys(nutrition).length > 0) {
      criteria.nutrition = nutrition;
    }

    // Halal flag
    if (baseFilters.halal !== undefined) {
      criteria.flags = {
        isHalal: baseFilters.halal
      };
    }

    // Ali-specific optimizations
    criteria.limit = 100; // Reasonable limit for UI performance
    criteria.sortBy = 'relevance'; // Sort by relevance when searching, protein when filtering

    return criteria;
  }, [baseFilters]);

  const result = useFlexibleProducts(flexibleCriteria, options);

  return {
    ...result,
    // Add Ali-specific helper methods
    isAliOptimized: true,
    filterStats: {
      isHalalFiltered: Boolean(baseFilters.halal),
      isProteinFiltered: Boolean(baseFilters.minProtein),
      isCalorieFiltered: Boolean(baseFilters.maxCalories),
      isCategoryFiltered: Boolean(baseFilters.categories?.length),
      isSearching: Boolean(baseFilters.search)
    }
  };
}

/**
 * Hook for pre-configured Ali filter profiles
 */
export function useAliFilterProfile(
  profile: 'daily-protein' | 'post-workout' | 'cutting' | 'budget' | 'training-day' | 'rest-day',
  customOverrides: Partial<FlexibleFilterCriteria> = {},
  options: UseFlexibleProductsOptions = {}
) {
  const profileCriteria: FlexibleFilterCriteria = useMemo(() => {
    const baseProfiles: Record<string, FlexibleFilterCriteria> = {
      'daily-protein': {
        flags: { isHalal: 'strict', isHighProtein: true },
        nutrition: { protein: { min: 20 } },
        scores: { proteinEfficiency: { min: 70 } },
        sortBy: 'protein',
        sortOrder: 'desc',
        limit: 50
      },
      'post-workout': {
        flags: { isHalal: 'strict' },
        nutrition: { protein: { min: 15 }, carbs: { min: 10 } },
        scores: { postWorkoutScore: { min: 60, context: 'training_day' } },
        sortBy: 'health_score',
        sortOrder: 'desc',
        limit: 30
      },
      'cutting': {
        flags: { isHalal: 'strict', isHighProtein: true },
        nutrition: { kcal: { max: 125 }, protein: { min: 15 } },
        scores: { fatLossScore: { min: 70 }, satietyScore: { min: 60 } },
        sortBy: 'health_score',
        sortOrder: 'desc',
        limit: 40
      },
      'budget': {
        flags: { isHalal: 'strict' },
        priceRange: { max: 2.50 }, // €2.50 per 100g max
        nutrition: { protein: { min: 10 } },
        scores: { proteinEfficiency: { min: 50 } },
        sortBy: 'price',
        sortOrder: 'asc',
        limit: 50
      },
      'training-day': {
        flags: { isHalal: 'strict' },
        nutrition: { kcal: { min: 100 }, carbs: { min: 15 }, protein: { min: 12 } },
        scores: { healthScore: { min: 60, context: 'global' } },
        sortBy: 'health_score',
        sortOrder: 'desc',
        limit: 60
      },
      'rest-day': {
        flags: { isHalal: 'strict' },
        nutrition: { kcal: { max: 200 }, fat: { min: 5 }, protein: { min: 10 } },
        scores: { satietyScore: { min: 50 } },
        sortBy: 'health_score',
        sortOrder: 'desc',
        limit: 50
      }
    };

    return {
      ...baseProfiles[profile],
      ...customOverrides
    };
  }, [profile, customOverrides]);

  const result = useFlexibleProducts(profileCriteria, options);

  return {
    ...result,
    profile,
    isProfileQuery: true
  };
}
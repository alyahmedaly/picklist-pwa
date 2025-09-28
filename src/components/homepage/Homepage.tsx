/**
 * Homepage Component
 *
 * Main homepage component integrating FilterCard, SearchControls, and ProductList
 * Manages state for Ali's 6 filter categories and product browsing experience
 */

import React, {
  useReducer,
  useEffect,
  useTransition,
  useDeferredValue,
  Suspense,
  startTransition,
  useCallback,
  useMemo,
  memo
} from 'react';
import FilterCard from './FilterCard';
import SearchControls from './SearchControls';
import ProductList from './ProductList';
import { dataManager, getDataManagerMetrics } from '../../lib/homepage/dataManager';
import { usePerformanceMonitoring, recordFilterLoad, getPerformanceInsights } from '../../lib/homepage/performanceMonitor';
import type { HomepageProps, HomepageState, FilterCategory, ProductDisplay, SortOption } from '../../types/homepage';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

// Homepage state management with React 19 optimizations
type HomepageAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ACTIVE_FILTER'; payload: FilterCategory }
  | { type: 'SET_PRODUCTS'; payload: { products: any[]; displayProducts: ProductDisplay[] } }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SORT'; payload: { sortBy: SortOption; sortDirection: 'asc' | 'desc' } }
  | { type: 'SET_FILTERED_PRODUCTS'; payload: ProductDisplay[] }
  | { type: 'UPDATE_VIRTUAL_SCROLL'; payload: { offset: number; range: { start: number; end: number } } }
  | { type: 'SET_TRANSITIONING'; payload: boolean }
  | { type: 'BATCH_UPDATE'; payload: Partial<HomepageState> };

const initialState: HomepageState = {
  activeFilter: {} as FilterCategory,
  availableFilters: [],
  products: [],
  displayProducts: [],
  loading: true,
  error: null,
  virtualScrollOffset: 0,
  visibleRange: { start: 0, end: 0 },
  containerHeight: 600,
  itemHeight: 120,
  searchQuery: '',
  sortBy: 'protein-desc',
  sortDirection: 'desc',
  renderCount: 0,
  transitioning: false
};

const homepageReducer = (state: HomepageState, action: HomepageAction): HomepageState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'SET_ACTIVE_FILTER':
      return { ...state, activeFilter: action.payload };

    case 'SET_PRODUCTS':
      return {
        ...state,
        products: action.payload.products,
        displayProducts: action.payload.displayProducts,
        loading: false,
        error: null,
        renderCount: state.renderCount + 1
      };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'SET_SORT':
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortDirection: action.payload.sortDirection
      };

    case 'SET_FILTERED_PRODUCTS':
      return { ...state, displayProducts: action.payload };

    case 'UPDATE_VIRTUAL_SCROLL':
      return {
        ...state,
        virtualScrollOffset: action.payload.offset,
        visibleRange: action.payload.range
      };

    case 'SET_TRANSITIONING':
      return {
        ...state,
        transitioning: action.payload
      };

    case 'BATCH_UPDATE':
      return {
        ...state,
        ...action.payload,
        renderCount: state.renderCount + 1
      };

    default:
      return state;
  }
};

export const Homepage: React.FC<HomepageProps> = memo(({
  initialCategories,
  defaultCategory,
  className = ''
}) => {
  const [state, dispatch] = useReducer(homepageReducer, {
    ...initialState,
    activeFilter: defaultCategory,
    availableFilters: initialCategories
  });

  const [isPending, startTransition] = useTransition();
  const deferredSearchQuery = useDeferredValue(state.searchQuery);

  // Performance monitoring
  const performanceHook = usePerformanceMonitoring('Homepage');
  const performanceMetrics = React.useRef(getDataManagerMetrics());

  // Load products for active filter using DataManager with React 19 concurrent features
  const loadFilterProducts = useCallback(async (category: FilterCategory) => {
    const loadTimer = performanceHook.startTiming('filter-load');

    // Batch initial state updates for better performance
    dispatch({
      type: 'BATCH_UPDATE',
      payload: {
        loading: true,
        error: null,
        transitioning: true
      }
    });

    try {
      // Use DataManager for coordinated loading and caching
      const startTime = performance.now();
      const displayProducts = await dataManager.loadCategoryProducts(category.id);
      const loadTime = performance.now() - startTime;

      // Record performance metrics
      recordFilterLoad(loadTime, displayProducts.length, false); // fromCache would be determined by DataManager

      // Use concurrent-safe batch update
      startTransition(() => {
        dispatch({
          type: 'BATCH_UPDATE',
          payload: {
            products: [], // Raw products no longer needed with DataManager
            displayProducts,
            loading: false,
            transitioning: false
          }
        });
      });

      // Update performance metrics
      performanceMetrics.current = getDataManagerMetrics();
      loadTimer();

    } catch (error) {
      console.error('Failed to load products:', error);
      dispatch({
        type: 'BATCH_UPDATE',
        payload: {
          error: error instanceof Error ? error.message : 'Failed to load products',
          loading: false,
          transitioning: false
        }
      });
      loadTimer();
    }
  }, [performanceHook]);

  // Handle filter change with enhanced concurrent features
  const handleFilterChange = useCallback((category: FilterCategory) => {
    // Use React 19's startTransition for non-urgent updates
    startTransition(() => {
      dispatch({ type: 'SET_TRANSITIONING', payload: true });
      dispatch({ type: 'SET_ACTIVE_FILTER', payload: category });
      loadFilterProducts(category);
    });
  }, [loadFilterProducts]);

  // Handle search change with concurrent features
  const handleSearchChange = useCallback((query: string) => {
    // Use startTransition for search queries to keep UI responsive
    startTransition(() => {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    });
  }, []);

  // Handle sort change with concurrent features
  const handleSortChange = useCallback((sortBy: SortOption, direction: 'asc' | 'desc') => {
    startTransition(() => {
      dispatch({ type: 'SET_SORT', payload: { sortBy, sortDirection: direction } });
    });
  }, []);

  // Apply search and sort filters using DataManager with concurrent features
  const applyFiltersAndSort = useCallback(async () => {
    if (!state.activeFilter.id) return;

    try {
      // Use DataManager for coordinated search and sort
      const filteredProducts = await dataManager.searchAndSortProducts(
        state.activeFilter.id,
        deferredSearchQuery,
        state.sortBy,
        state.sortDirection
      );

      // Use startTransition for UI updates to maintain responsiveness
      startTransition(() => {
        dispatch({ type: 'SET_FILTERED_PRODUCTS', payload: filteredProducts });
      });

      // Update performance metrics
      performanceMetrics.current = getDataManagerMetrics();

    } catch (error) {
      console.error('Failed to apply filters and sort:', error);
    }
  }, [state.activeFilter.id, deferredSearchQuery, state.sortBy, state.sortDirection]);

  // Apply filters when dependencies change
  useEffect(() => {
    if (state.activeFilter.id) {
      applyFiltersAndSort();
    }
  }, [applyFiltersAndSort]);

  // Load initial data
  useEffect(() => {
    if (defaultCategory) {
      loadFilterProducts(defaultCategory);
    }
  }, [defaultCategory, loadFilterProducts]);

  // Retry failed operation
  const handleRetry = () => {
    loadFilterProducts(state.activeFilter);
  };

  // Clear cache and reset using DataManager (available for future use)
  // const handleReset = React.useCallback(() => {
  //   dataManager.clearCache();
  //   dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
  //   dispatch({ type: 'SET_SORT', payload: { sortBy: 'protein-desc', sortDirection: 'desc' } });
  //   loadFilterProducts(state.activeFilter);
  // }, [loadFilterProducts, state.activeFilter]);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      <main role="main" className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Ali's Nutrition Hub
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Discover high-protein foods tailored to your fitness goals
          </p>
        </div>

        {/* Filter Navigation */}
        <nav
          role="navigation"
          aria-label="Filter categories"
          className="mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
            {initialCategories.map((category: FilterCategory) => (
              <FilterCard
                key={category.id}
                data-testid={`filter-card-${category.id}`}
                category={category}
                isActive={state.activeFilter.id === category.id}
                onClick={handleFilterChange}
              />
            ))}
          </div>
        </nav>

        {/* Search and Sort Controls */}
        <div role="search" className="mb-6">
          <SearchControls
            data-testid="search-controls"
            searchQuery={state.searchQuery}
            onSearchChange={handleSearchChange}
            sortBy={state.sortBy}
            sortDirection={state.sortDirection}
            onSortChange={handleSortChange}
            resultCount={state.loading ? -1 : state.displayProducts.length}
          />
        </div>

        {/* Error State */}
        {state.error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription data-testid="error-message">
              <div className="flex items-center justify-between">
                <span>{state.error}</span>
                <Button
                  data-testid="retry-button"
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="ml-4"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Product List with React 19 Concurrent Features */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>Loading products...</span>
                </div>
              </div>
            }
          >
            <ProductList
              products={state.displayProducts}
              loading={state.loading || isPending || state.transitioning}
              virtualScrolling={state.displayProducts.length > 50}
            />
          </Suspense>
        </div>

        {/* Live Region for Screen Readers */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {state.activeFilter.name} filter active with {state.displayProducts.length} products
        </div>

        {/* Debug Info (Development Only) */}
        {process.env.NODE_ENV === 'development' && (() => {
          const insights = getPerformanceInsights();
          return (
            <div className="mt-8 space-y-4">
              {/* Basic Metrics */}
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
                <div>Active Filter: {state.activeFilter.name}</div>
                <div>Products: {state.displayProducts.length} displayed</div>
                <div>Search: "{state.searchQuery}" | Sort: {state.sortBy} ({state.sortDirection})</div>
                <div>Render Count: {state.renderCount}</div>
                <div>Concurrent Status: isPending={isPending}, transitioning={state.transitioning || false}</div>
                <div>DataManager Cache: {performanceMetrics.current.cacheSize || 0} categories</div>
                <div>Cache Hit Rate: {((performanceMetrics.current.cacheHitRate || 0)).toFixed(1)}%</div>
                <div>Memory Usage: {((performanceMetrics.current.memoryUsage || 0) / 1024 / 1024).toFixed(1)}MB</div>
                <div>Avg Load Time: {(performanceMetrics.current.filterLoadTime || 0).toFixed(0)}ms</div>
              </div>

              {/* Performance Insights */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded text-xs">
                <div className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Performance Score: {insights.score}/100
                </div>
                {insights.bottlenecks.length > 0 && (
                  <div className="mb-2">
                    <div className="font-medium text-red-700 dark:text-red-300">Bottlenecks:</div>
                    {insights.bottlenecks.map((bottleneck, i) => (
                      <div key={i} className="text-red-600 dark:text-red-400">• {bottleneck}</div>
                    ))}
                  </div>
                )}
                {insights.recommendations.length > 0 && (
                  <div>
                    <div className="font-medium text-green-700 dark:text-green-300">Recommendations:</div>
                    {insights.recommendations.map((rec, i) => (
                      <div key={i} className="text-green-600 dark:text-green-400">• {rec}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </main>
    </div>
  );
});

export default Homepage;
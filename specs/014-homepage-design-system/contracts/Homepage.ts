/**
 * Homepage Component Contract
 *
 * Main homepage component integrating FilterNavigation, SearchControls, and ProductList.
 * Manages state for Ali's 6 filter categories and product browsing experience.
 */

import { FilterCategory } from './FilterCard';
import { ProductDisplay, SortOption } from './ProductList';

export interface HomepageProps {
  initialCategories: FilterCategory[];
  defaultCategory: FilterCategory;
  className?: string;
}

export interface HomepageState {
  // Filter management
  activeFilter: FilterCategory;
  availableFilters: FilterCategory[];

  // Product data
  products: any[]; // Raw FilteredProduct from JSONL
  displayProducts: ProductDisplay[];

  // UI state
  loading: boolean;
  error: string | null;

  // Virtual scrolling
  virtualScrollOffset: number;
  visibleRange: { start: number; end: number };

  // Client-side filtering
  searchQuery: string;
  sortBy: SortOption;
  sortDirection: 'asc' | 'desc';
}

// Main component behavior
export interface HomepageBehavior {
  // Filter navigation
  handleFilterChange(category: FilterCategory): Promise<void>;
  loadFilterData(categoryId: string): Promise<any[]>;
  transformToDisplayProducts(products: any[], context: FilterCategory): ProductDisplay[];

  // Search and sort
  handleSearchChange(query: string): void;
  handleSortChange(sortBy: SortOption, direction: 'asc' | 'desc'): void;
  applyFiltersAndSort(): ProductDisplay[];

  // State management
  updateHomepageState(updates: Partial<HomepageState>): void;
  resetToDefaultState(): void;

  // Error handling
  handleLoadingError(error: Error): void;
  retryFailedOperation(): void;
}

// Data transformation pipeline
export interface ProductTransformer {
  // Core transformation
  toDisplayProduct(product: any, context: FilterCategory): ProductDisplay;
  batchTransform(products: any[], context: FilterCategory): ProductDisplay[];

  // Context-specific calculations
  calculateDailyTargetContribution(protein: number, targetProtein: number): string;
  determineContextScore(product: any, filterType: string): number | undefined;
  generateContextLabel(product: any, filterType: string): string | undefined;

  // Data validation
  validateProduct(product: any): boolean;
  sanitizeProductData(product: any): any;
}

// Performance monitoring for homepage
export interface HomepagePerformance {
  // Load time tracking
  trackFilterLoadTime(categoryId: string, duration: number): void;
  trackSearchPerformance(query: string, resultCount: number, duration: number): void;
  trackVirtualScrolling(itemsRendered: number, duration: number): void;

  // Memory monitoring
  trackMemoryUsage(operation: string, heapUsed: number): void;
  detectMemoryLeaks(): void;

  // User experience metrics
  trackUserInteraction(action: string, timestamp: number): void;
  calculateResponseTimes(): {
    averageFilterSwitch: number;
    averageSearch: number;
    averageScroll: number;
  };

  // Performance alerts
  shouldShowPerformanceWarning(): boolean;
  getPerformanceRecommendations(): string[];
}

// Data loading and caching strategy
export interface DataManager {
  // Category management
  loadAllCategories(): Promise<FilterCategory[]>;
  getDefaultCategory(): FilterCategory;

  // Product data loading
  loadProductsForCategory(categoryId: string): Promise<any[]>;
  preloadAdjacentCategories(currentCategoryId: string): void;

  // Caching
  cacheProductData(categoryId: string, products: any[]): void;
  getCachedProducts(categoryId: string): any[] | null;
  clearCache(): void;

  // Error recovery
  retryFailedLoad(categoryId: string, maxRetries: number): Promise<any[]>;
  fallbackToCache(categoryId: string): any[];
}
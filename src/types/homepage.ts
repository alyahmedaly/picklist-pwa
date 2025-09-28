/**
 * Homepage Component Type Definitions
 *
 * TypeScript interfaces for FilterCategory, ProductDisplay, and HomepageState
 * Supporting Ali's 6 filter categories and 11k+ product browsing with virtual scrolling
 */

import type { Product } from "@picklist/types";

// Core filter category interface
export interface FilterCategory {
  id: string;
  name: string;
  description: string;
  coverage: number;
  isActive?: boolean;
  dataFile: string; // Path to filtered JSONL file
  targetProtein?: number;
  context?: string;
}

// Product display interface optimized for UI rendering
export interface ProductDisplay {
  // Core product data
  id: string;
  name: string;
  brand: string;
  price: number;
  currency: string;

  // Nutrition data
  protein: number;
  carbs: number;
  fat: number;
  calories: number;

  // Health and compliance
  healthGrade: 'A' | 'B' | 'C' | 'D' | 'E';
  healthScore: number;
  isHalal: boolean;

  // Context-specific scoring
  contextScore?: number;
  contextLabel?: string;
  targetContribution?: string;

  // Virtual scrolling optimization
  displayHeight: number;
  isVisible: boolean;
  offsetTop?: number; // For virtual scrolling positioning

  // UI state
  isHighlighted?: boolean;
  matchedTerms?: string[];
}

// Sort options for product list
export type SortOption =
  | 'protein-desc'
  | 'protein-asc'
  | 'price-asc'
  | 'price-desc'
  | 'health-grade'
  | 'global-health-score'
  | 'category-health-score'
  | 'category-health-grade'
  | 'calories-asc'
  | 'calories-desc'
  | 'name';

// Main homepage state interface
export interface HomepageState {
  // Filter management
  activeFilter: FilterCategory;
  availableFilters: FilterCategory[];

  // Product data
  products: Product[]; // Raw FilteredProduct from JSONL
  displayProducts: ProductDisplay[];

  // UI state
  loading: boolean;
  error: string | null;

  // Virtual scrolling state
  virtualScrollOffset: number;
  visibleRange: { start: number; end: number };
  containerHeight: number;
  itemHeight: number;

  // Client-side filtering and search
  searchQuery: string;
  sortBy: SortOption;
  sortDirection: 'asc' | 'desc';

  // Performance tracking
  lastLoadTime?: number;
  renderCount: number;

  // React 19 concurrent features
  transitioning?: boolean;
}

// Props for filter card component
export interface FilterCardProps {
  category: FilterCategory;
  isActive: boolean;
  onClick: (category: FilterCategory) => void;
  className?: string;
}

// Props for product card component
export interface ProductCardProps {
  product: Product;
  variant?: 'compact' | 'detailed' | 'minimal';
  onSelect?: (product: Product) => void;
  className?: string;
}

// Props for search controls component
export interface SearchControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  sortDirection: 'asc' | 'desc';
  onSortChange: (sortBy: SortOption, direction: 'asc' | 'desc') => void;
  resultCount: number;
  className?: string;
}

// Props for product list component
export interface ProductListProps {
  products: ProductDisplay[];
  loading: boolean;
  onLoadMore?: () => void;
  virtualScrolling?: boolean;
  className?: string;
}

// Virtual scrolling hook return type
export interface VirtualScrollingHookReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  visibleItems: (ProductDisplay & { virtualIndex?: number; offsetTop?: number })[];
  visibleRange: { start: number; end: number };
  totalHeight: number;
  scrollOffset: number;
  isScrolling: boolean;
}

// Data loading result
export interface DataLoadResult {
  products: Product[];
  category: FilterCategory;
  loadTime: number;
  fromCache: boolean;
}

// Performance metrics
export interface PerformanceMetrics {
  filterLoadTime: number;
  searchTime: number;
  renderTime: number;
  memoryUsage: number;
  scrollFps: number;
}

// Props for homepage component
export interface HomepageProps {
  initialCategories: FilterCategory[];
  defaultCategory: FilterCategory;
  className?: string;
}

// Error types
export type HomepageError =
  | 'FILTER_LOAD_FAILED'
  | 'PRODUCTS_LOAD_FAILED'
  | 'SEARCH_FAILED'
  | 'RENDER_ERROR'
  | 'NETWORK_ERROR';

export interface ErrorState {
  type: HomepageError;
  message: string;
  canRetry: boolean;
  timestamp: number;
}
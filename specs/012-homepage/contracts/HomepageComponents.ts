/**
 * Homepage Component Interface Contracts
 *
 * Component prop interfaces and state management contracts for the homepage implementation.
 * Defines the API between React components for Ali's product visualization webapp.
 */

import { FilterCategory } from './FilterCategory';
import { FilteredProduct } from './FilteredProduct';

/**
 * UI-optimized product display entity
 */
export interface ProductDisplay {
  id: string;
  name: string;
  category: string;

  /** Essential Ali metrics for quick scanning */
  proteinPer100g: number;
  pricePerEuro: number;
  dailyTargetContribution: string; // e.g., "12% of 170g target"

  /** Quick visual indicators */
  halalStatus: 'confirmed' | 'check-needed';
  healthGrade: 'A' | 'B' | 'C' | 'D' | 'E';

  /** Context-specific optimization scores */
  contextScore?: number;
  contextLabel?: string; // e.g., "Post-workout ready", "Budget-friendly"

  /** UI optimization */
  imageUrl?: string;
  isHighlighted: boolean;
}

/**
 * Homepage application state
 */
export interface HomepageState {
  /** Current filter selection */
  activeFilter: FilterCategory;
  availableFilters: FilterCategory[];

  /** Product data */
  products: FilteredProduct[];
  displayProducts: ProductDisplay[];

  /** UI state */
  loading: boolean;
  error: string | null;

  /** Virtual scrolling optimization */
  virtualScrollOffset: number;
  visibleRange: { start: number; end: number };

  /** Client-side search and sorting */
  searchQuery: string;
  sortBy: 'protein' | 'price' | 'health-score' | 'relevance';
  sortDirection: 'asc' | 'desc';
}

/**
 * Main Homepage component props
 */
export interface HomepageProps {
  /** Initial filter categories (loaded at build time) */
  initialCategories: FilterCategory[];
  /** Default category to display on first load */
  defaultCategory: FilterCategory;
}

/**
 * Product list component props
 */
export interface ProductListProps {
  products: ProductDisplay[];
  loading: boolean;
  error: string | null;
  onProductClick?: (product: ProductDisplay) => void;

  /** Virtual scrolling configuration */
  virtualScrolling?: {
    itemHeight: number;
    containerHeight: number;
    overscan?: number;
  };
}

/**
 * Individual product card component props
 */
export interface ProductCardProps {
  product: ProductDisplay;
  onClick?: (product: ProductDisplay) => void;
  variant?: 'compact' | 'detailed';
  showContextInfo?: boolean;
}

/**
 * Search and filter controls component props
 */
export interface SearchControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;

  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (sortBy: string, direction: 'asc' | 'desc') => void;

  availableSorts: Array<{
    value: string;
    label: string;
  }>;
}

/**
 * Data transformation contracts
 */
export interface ProductTransformer {
  /** Transform FilteredProduct to ProductDisplay for UI optimization */
  toDisplayProduct(product: FilteredProduct, context: FilterCategory): ProductDisplay;

  /** Apply client-side filtering */
  filterProducts(products: ProductDisplay[], query: string): ProductDisplay[];

  /** Apply client-side sorting */
  sortProducts(
    products: ProductDisplay[],
    sortBy: string,
    direction: 'asc' | 'desc'
  ): ProductDisplay[];
}

/**
 * Performance monitoring contract
 */
export interface PerformanceMonitor {
  /** Track load time for filter switching */
  trackFilterLoadTime(categoryId: string, duration: number): void;

  /** Track search performance */
  trackSearchPerformance(query: string, resultCount: number, duration: number): void;

  /** Track virtual scrolling performance */
  trackScrollingPerformance(itemsRendered: number, duration: number): void;
}
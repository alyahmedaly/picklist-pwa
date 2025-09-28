/**
 * Category Index Page Component Contract
 *
 * Defines the interface for the main category index page component
 * following constitutional principles and functional requirements.
 */

import type { CategoryNode } from '../../../src/types/category-tree';

// Extended category interface with Ali-specific metrics
export interface CategoryWithMetrics extends CategoryNode {
  aliMetrics: {
    halalCompliance: number;        // 0-100% ratio of halal products
    averageProtein: number;         // g/100g average protein density
    priceEfficiency: number;        // protein-per-euro score
    recommendedFor: AliContext[];   // nutrition context recommendations
  };
}

// Ali nutrition context types
export type AliContext =
  | 'daily-protein'     // High protein for 170g target
  | 'post-workout'      // Recovery nutrition
  | 'cutting'           // Fat loss compatible
  | 'budget'            // Cost-efficient protein
  | 'training-day'      // High carb for training
  | 'rest-day';         // Lower carb for rest

// Category sorting options
export type CategorySortOption =
  | 'product-count-desc'    // Most products first
  | 'product-count-asc'     // Fewest products first
  | 'name-asc'              // Alphabetical A-Z
  | 'name-desc'             // Alphabetical Z-A
  | 'protein-desc'          // Highest protein first
  | 'halal-compliance-desc' // Highest halal % first
  | 'price-efficiency-desc'; // Best value first

// Filter criteria for Ali-specific filtering
export interface AliFilterCriteria {
  minHalalCompliance?: number;    // 0-100% minimum halal ratio
  minProtein?: number;            // g/100g minimum protein density
  maxPricePerProtein?: number;    // maximum price per protein gram
  contexts?: AliContext[];        // recommended nutrition contexts
  minProductCount?: number;       // minimum products in category
}

// Main component props interface
export interface CategoryIndexPageProps {
  initialData?: CategoryWithMetrics[];
  className?: string;
}

// Component state interface
export interface CategoryIndexState {
  // Data
  categories: CategoryWithMetrics[];
  filteredCategories: CategoryWithMetrics[];
  selectedCategory: CategoryWithMetrics | null;

  // UI state
  loading: boolean;
  error: string | null;
  searchQuery: string;
  sortBy: CategorySortOption;
  activeFilters: AliFilterCriteria;

  // Performance
  virtualScrolling: boolean;
  visibleRange: { start: number; end: number };
}

// Contract tests must verify:
export interface CategoryIndexPageContract {
  // FR-001: Display all categories in grid/card layout
  displaysAllCategories(categories: CategoryWithMetrics[]): boolean;

  // FR-002: Show product count for each category
  showsProductCounts(category: CategoryWithMetrics): boolean;

  // FR-003: Navigate to product list on category click
  navigatesOnCategoryClick(category: CategoryWithMetrics): string; // returns URL

  // FR-005: Display halal compliance percentage
  displaysHalalCompliance(category: CategoryWithMetrics): string; // returns percentage

  // FR-006: Show average protein density
  displaysProteinDensity(category: CategoryWithMetrics): string; // returns protein info

  // FR-007: Provide price efficiency indicators
  displaysPriceEfficiency(category: CategoryWithMetrics): string; // returns efficiency info

  // FR-008: Search categories by name (Dutch/English)
  searchesCategories(query: string, categories: CategoryWithMetrics[]): CategoryWithMetrics[];

  // FR-009: Filter by Ali-specific criteria
  filtersCategories(criteria: AliFilterCriteria, categories: CategoryWithMetrics[]): CategoryWithMetrics[];

  // FR-010: Sort categories by specified option
  sortsCategories(sortBy: CategorySortOption, categories: CategoryWithMetrics[]): CategoryWithMetrics[];

  // FR-012: Handle responsive design
  isResponsive(): boolean;
}

// Event handlers interface
export interface CategoryIndexEventHandlers {
  onCategoryClick: (category: CategoryWithMetrics) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (sortBy: CategorySortOption) => void;
  onFilterChange: (filters: AliFilterCriteria) => void;
  onClearSearch: () => void;
  onResetFilters: () => void;
}

// Performance requirements interface
export interface CategoryIndexPerformance {
  maxLoadTime: 2000;          // <2s page load on 3G
  maxSearchResponseTime: 100; // <100ms search response
  maxBundleSize: 1048576;     // <1MB bundle size
  virtualScrollThreshold: 100; // Enable virtual scrolling above this count
}

// Accessibility requirements interface
export interface CategoryIndexAccessibility {
  hasKeyboardNavigation: boolean;
  hasScreenReaderSupport: boolean;
  hasProperContrastRatios: boolean;
  hasTouchFriendlyTargets: boolean; // 44px minimum
}

// Error states interface
export interface CategoryIndexErrorStates {
  loadingError: {
    message: string;
    canRetry: boolean;
    retryAction?: () => void;
  };
  searchError: {
    message: string;
    clearAction: () => void;
  };
  navigationError: {
    message: string;
    fallbackUrl: string;
  };
}
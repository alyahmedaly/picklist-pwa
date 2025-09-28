/**
 * Category Index Page Type Definitions
 *
 * TypeScript interfaces for the category index page with Ali-specific metrics
 * and filtering capabilities for CrossFit athlete nutrition optimization.
 */

import type { CategoryNode } from './category-tree.ts';

// Ali nutrition context types for categorizing food recommendations
export type AliContext =
  | 'daily-protein'     // High protein for 170g target
  | 'post-workout'      // Recovery nutrition
  | 'cutting'           // Fat loss compatible
  | 'budget'            // Cost-efficient protein
  | 'training-day'      // High carb for training
  | 'rest-day';         // Lower carb for rest

// Ali-specific metrics computed from product data within a category
export interface AliMetrics {
  halalCompliance: number;        // 0-100% ratio of halal products
  averageProtein: number;         // g/100g average protein density
  priceEfficiency: number;        // protein-per-euro score
  recommendedFor: AliContext[];   // nutrition context recommendations
}

// Extended category interface with Ali-specific metrics (T002)
export interface CategoryWithMetrics extends CategoryNode {
  // Ali-specific metrics (pre-computed in transform pipeline)
  aliMetrics: AliMetrics;
}

// Category sorting options including Ali-specific metrics
export type CategorySortOption =
  | 'product-count-desc'    // Most products first
  | 'product-count-asc'     // Fewest products first
  | 'name-asc'              // Alphabetical A-Z
  | 'name-desc'             // Alphabetical Z-A
  | 'protein-desc'          // Highest protein first
  | 'halal-compliance-desc' // Highest halal % first
  | 'price-efficiency-desc'; // Best value first

// Filter criteria for Ali-specific category filtering (T003)
export interface AliFilterCriteria {
  minHalalCompliance?: number;    // 0-100% minimum halal ratio
  minProtein?: number;            // g/100g minimum protein density
  maxPricePerProtein?: number;    // maximum price per protein gram
  contexts?: AliContext[];        // recommended nutrition contexts
  minProductCount?: number;       // minimum products in category
}

// Client-side state management for the category index page
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

// Extended state for CategoryIndexPage with expansion support
export interface ExpandedCategoryIndexState extends CategoryIndexState {
  // Expansion management
  expansionState: import('../types/expansion-state').CategoryExpansionState;
  expansionConfig: import('../types/expansion-state').ExpansionConfig;

  // Performance tracking
  expandedItemHeights: Map<string, number>; // Cache measured heights for virtual scrolling
  lastExpansionUpdate: number;              // Timestamp of last expansion change

  // Search integration
  searchExpandedCategories: string[];       // Categories expanded due to search matches

  // Bulk operations
  bulkExpansionInProgress: boolean;         // Whether bulk expand/collapse is in progress
}

// Category index page component props
export interface CategoryIndexPageProps {
  initialData?: CategoryWithMetrics[];
  className?: string;
}

// Event handlers for category index interactions
export interface CategoryIndexEventHandlers {
  onCategoryClick: (category: CategoryWithMetrics) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (sortBy: CategorySortOption) => void;
  onFilterChange: (filters: AliFilterCriteria) => void;
  onClearSearch: () => void;
  onResetFilters: () => void;
}

// Performance requirements for category index
export interface CategoryIndexPerformance {
  maxLoadTime: 2000;          // <2s page load on 3G
  maxSearchResponseTime: 100; // <100ms search response
  maxBundleSize: 1048576;     // <1MB bundle size
  virtualScrollThreshold: 100; // Enable virtual scrolling above this count
}

// Accessibility requirements for category index
export interface CategoryIndexAccessibility {
  hasKeyboardNavigation: boolean;
  hasScreenReaderSupport: boolean;
  hasProperContrastRatios: boolean;
  hasTouchFriendlyTargets: boolean; // 44px minimum
}

// Error states for category index
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

// Category card display variants
export type CategoryCardVariant = 'compact' | 'detailed';

// Category card component props
export interface CategoryCardProps {
  category: CategoryWithMetrics;
  isSelected?: boolean;
  onClick: (category: CategoryWithMetrics) => void;
  showMetrics?: boolean;
  variant?: CategoryCardVariant;
  className?: string;
}

// Enhanced CategoryCard props with expansion capabilities
export interface ExpandableCategoryCardProps extends CategoryCardProps {
  // Expansion state
  isExpanded?: boolean;                   // Whether this category is currently expanded
  expansionState?: import('../types/expansion-state').CategoryExpansionState; // Global expansion state for hierarchy

  // Expansion controls
  onToggleExpansion?: (categoryPath: string) => void;  // Handle expand/collapse
  onSubcategorySelect?: (category: CategoryWithMetrics) => void; // Handle subcategory selection

  // Display options
  showSubcategoryCount?: boolean;         // Show "N subcategories" indicator
  maxVisibleChildren?: number;            // Limit visible children before "Show more"
  enableKeyboardNav?: boolean;            // Enable keyboard tree navigation

  // Performance options
  virtualScrolling?: boolean;             // Whether parent uses virtual scrolling
  onHeightChange?: (newHeight: number) => void; // Notify parent of height changes
}

// Subcategory tree node component props
export interface CategoryTreeNodeProps {
  category: CategoryWithMetrics;          // Category data with children
  level: number;                          // Tree depth level (0 = root)
  isExpanded: boolean;                    // Current expansion state
  isSelected: boolean;                    // Whether this category is selected

  // Interaction handlers
  onToggle: (categoryPath: string) => void; // Handle expand/collapse
  onSelect: (category: CategoryWithMetrics) => void; // Handle category selection

  // Display configuration
  maxChildren: number;                    // Maximum children to show initially
  showMetrics: boolean;                   // Whether to show Ali metrics
  enableKeyboardNav: boolean;             // Enable keyboard navigation

  // Performance props
  onHeightChange?: (height: number) => void; // Height change notification
}

// Category search component props
export interface CategorySearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: CategorySortOption;
  onSortChange: (sortBy: CategorySortOption) => void;
  activeFilters: AliFilterCriteria;
  onFilterChange: (filters: AliFilterCriteria) => void;
  resultCount: number;
  totalCount: number;
  onClearAll: () => void;
  className?: string;
}

// Dutch language search support interface
export interface DutchLanguageSupport {
  normalizeQuery(query: string): string;           // Handle Dutch characters
  createSearchTerms(query: string): string[];      // Split into search terms
  matchesCategory(terms: string[], category: CategoryWithMetrics): boolean;
  highlightMatches(text: string, terms: string[]): string; // For display
}

// Badge configuration for Ali metrics display
export interface BadgeConfig {
  halal: {
    thresholds: {
      high: 80;    // >80% = green
      medium: 50;  // 50-80% = yellow
      low: 0;      // <50% = red
    };
    colors: {
      high: 'bg-green-100 text-green-800 border-green-200';
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200';
      low: 'bg-red-100 text-red-800 border-red-200';
    };
  };
  protein: {
    highProteinThreshold: 15; // g/100g
    colors: {
      high: 'bg-blue-100 text-blue-800 border-blue-200';
      normal: 'bg-gray-100 text-gray-800 border-gray-200';
    };
  };
  efficiency: {
    goodValueThreshold: 0.50; // €/g protein
    colors: {
      good: 'bg-emerald-100 text-emerald-800 border-emerald-200';
      normal: 'bg-gray-100 text-gray-800 border-gray-200';
    };
  };
  context: {
    colors: {
      'daily-protein': 'bg-purple-100 text-purple-800';
      'post-workout': 'bg-orange-100 text-orange-800';
      'cutting': 'bg-pink-100 text-pink-800';
      'budget': 'bg-green-100 text-green-800';
      'training-day': 'bg-red-100 text-red-800';
      'rest-day': 'bg-blue-100 text-blue-800';
    };
  };
}

// Ali metrics calculation configuration for transform pipeline
export interface AliMetricsConfig {
  halalCompliance: {
    countHalalProducts: boolean;
    excludeQuestionable: boolean;
  };
  proteinDensity: {
    weightByProductCount: boolean;
    excludeZeroProtein: boolean;
  };
  priceEfficiency: {
    useProteinPerEuro: boolean;
    excludeMissingPrices: boolean;
  };
  contextRecommendations: {
    proteinThresholds: {
      'daily-protein': 15;    // g/100g minimum
      'post-workout': 20;     // g/100g minimum
    };
    halalRequirements: {
      strict: 100;            // % for strict halal contexts
      standard: 80;           // % for standard contexts
    };
    efficiencyThresholds: {
      'budget': 0.50;         // €/g maximum for budget
    };
  };
}
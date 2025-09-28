/**
 * Category Card Component Contract
 *
 * Defines the interface for individual category card display
 * with Ali-specific metrics and interaction handling.
 */

import type { CategoryWithMetrics, AliContext } from './CategoryIndexPage';

// Category card component props
export interface CategoryCardProps {
  category: CategoryWithMetrics;
  isSelected?: boolean;
  onClick: (category: CategoryWithMetrics) => void;
  showMetrics?: boolean;
  variant?: 'compact' | 'detailed';
  className?: string;
}

// Category card display data
export interface CategoryCardDisplay {
  // Basic information
  name: string;
  breadcrumbs: string;
  productCount: number;
  depth: number;

  // Ali metrics display
  halalBadge: {
    percentage: number;
    color: 'green' | 'yellow' | 'red'; // >80%, 50-80%, <50%
    text: string; // "85% Halal"
  };
  proteinBadge: {
    density: number;
    isHighProtein: boolean; // >15g/100g
    text: string; // "18g protein"
  };
  efficiencyBadge: {
    score: number;
    isGoodValue: boolean;
    text: string; // "€0.45/g protein"
  };
  contextBadges: {
    context: AliContext;
    label: string;
    color: string;
  }[];

  // Hierarchy indicators
  hasSubcategories: boolean;
  subcategoryCount: number;
  levelIndicator: string; // "Level 2"
}

// Category card states
export type CategoryCardState =
  | 'default'     // Normal display
  | 'hover'       // Mouse hover state
  | 'selected'    // Currently selected
  | 'loading'     // Loading metrics
  | 'error';      // Failed to load data

// Category card interaction contract
export interface CategoryCardContract {
  // Display requirements
  displaysName(category: CategoryWithMetrics): string;
  displaysBreadcrumbs(category: CategoryWithMetrics): string;
  displaysProductCount(category: CategoryWithMetrics): string;

  // Ali metrics display
  displaysHalalBadge(category: CategoryWithMetrics): string;
  displaysProteinBadge(category: CategoryWithMetrics): string;
  displaysEfficiencyBadge(category: CategoryWithMetrics): string;
  displaysContextBadges(category: CategoryWithMetrics): string[];

  // Hierarchy information
  displaysSubcategoryCount(category: CategoryWithMetrics): string;
  displaysLevelIndicator(category: CategoryWithMetrics): string;

  // Interaction behavior
  handlesCategoryClick(category: CategoryWithMetrics): void;
  handlesKeyboardNavigation(): boolean;
  providesAccessibleLabels(): boolean;

  // Visual states
  showsHoverState(): boolean;
  showsSelectedState(): boolean;
  showsLoadingState(): boolean;
  showsErrorState(): boolean;
}

// Badge configuration interface
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

// Category card accessibility interface
export interface CategoryCardAccessibility {
  ariaLabel: string;          // Descriptive label for screen readers
  ariaDescription: string;    // Detailed description including metrics
  roleButton: boolean;        // Has button role for interaction
  tabIndex: number;          // Keyboard navigation support
  keyboardHandlers: {
    onEnter: () => void;
    onSpace: () => void;
    onArrowKeys: (direction: 'up' | 'down' | 'left' | 'right') => void;
  };
}

// Category card performance interface
export interface CategoryCardPerformance {
  shouldUseMemo: boolean;     // Memoize expensive calculations
  shouldUseCallback: boolean; // Memoize event handlers
  lazyLoadMetrics: boolean;   // Load metrics on viewport entry
  virtualScrollOptimized: boolean; // Optimized for virtual scrolling
}

// Error handling interface
export interface CategoryCardErrorHandling {
  missingMetrics: {
    showPlaceholder: boolean;
    fallbackText: string;
  };
  invalidData: {
    showError: boolean;
    errorMessage: string;
  };
  loadingFailure: {
    showRetry: boolean;
    retryAction: () => void;
  };
}
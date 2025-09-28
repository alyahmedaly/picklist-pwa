/**
 * CategoryCard Component Contract
 *
 * Defines the contract for the enhanced CategoryCard component with expansion capabilities.
 * This contract must be implemented and all tests must pass before the feature is complete.
 */

import { CategoryWithMetrics, AliFilterCriteria } from '../../../src/types/category-index';

// Enhanced CategoryCard component contract
export interface CategoryCardContract {
  // Basic category display (existing functionality)
  displayCategoryName(category: CategoryWithMetrics): string;
  displayProductCount(count: number): string;
  displayAliMetrics(metrics: AliMetrics): {
    halalCompliance: string;
    proteinDensity: string;
    priceEfficiency: string;
  };

  // Expansion functionality (new)
  renderExpansionIndicator(hasChildren: boolean, isExpanded: boolean): React.ReactElement;
  handleExpansionToggle(categoryPath: string): void;
  calculateExpandedHeight(subcategoryCount: number): number;

  // Subcategory tree rendering
  renderSubcategoryTree(
    subcategories: CategoryWithMetrics[],
    level: number,
    maxVisible?: number
  ): React.ReactElement;

  // Interaction handlers
  handleCategorySelection(category: CategoryWithMetrics, preserveFilters: boolean): void;
  handleSubcategorySelection(subcategory: CategoryWithMetrics, preserveFilters: boolean): void;

  // Accessibility support
  getAriaProps(category: CategoryWithMetrics, level: number, isExpanded: boolean): {
    role: string;
    'aria-expanded'?: boolean;
    'aria-level'?: number;
    'aria-label': string;
  };

  // Performance optimization
  shouldComponentUpdate(
    prevProps: CategoryCardProps,
    nextProps: CategoryCardProps
  ): boolean;
}

// Expansion state management contract
export interface ExpansionStateContract {
  // State queries
  isExpanded(categoryPath: string): boolean;
  getExpandedCategories(): string[];
  getExpansionCount(): number;

  // State mutations
  expandCategory(categoryPath: string): void;
  collapseCategory(categoryPath: string): void;
  toggleCategory(categoryPath: string): void;

  // Bulk operations
  expandAll(maxDepth?: number): void;
  collapseAll(): void;
  collapseAllExcept(categoryPaths: string[]): void;

  // Search integration
  expandCategoriesForSearch(searchQuery: string, categories: CategoryWithMetrics[]): void;
  clearSearchExpansions(): void;

  // Performance constraints
  enforceMaxExpansions(maxCount: number): void;
  getPerformanceMetrics(): {
    expandedCount: number;
    maxAllowed: number;
    memoryUsage: number;
  };
}

// Virtual scrolling integration contract
export interface VirtualScrollContract {
  // Height management
  measureItemHeight(categoryPath: string): number;
  estimateExpandedHeight(subcategoryCount: number): number;
  updateHeightCache(categoryPath: string, height: number): void;

  // Visibility calculations
  calculateVisibleRange(
    scrollTop: number,
    containerHeight: number,
    expandedItems: Map<string, number>
  ): {
    startIndex: number;
    endIndex: number;
    startOffset: number;
    endOffset: number;
  };

  // Performance optimization
  optimizeRenderList(
    categories: CategoryWithMetrics[],
    expandedPaths: Set<string>,
    visibleRange: { start: number; end: number }
  ): CategoryWithMetrics[];

  // Scroll position management
  maintainScrollPosition(
    previousExpandedPaths: Set<string>,
    newExpandedPaths: Set<string>
  ): void;
}

// Keyboard navigation contract
export interface KeyboardNavigationContract {
  // Focus management
  focusCategory(categoryPath: string): void;
  getFocusedCategory(): string | null;
  moveFocus(direction: 'up' | 'down' | 'left' | 'right'): void;

  // Tree navigation
  expandFocused(): void;
  collapseFocused(): void;
  selectFocused(): void;

  // Navigation state
  enterTreeMode(): void;
  exitTreeMode(): void;
  isInTreeMode(): boolean;

  // Event handling
  handleKeyDown(event: KeyboardEvent): boolean; // Returns true if handled
  getKeyboardHelpText(): string[];
}

// Mobile interaction contract
export interface MobileInteractionContract {
  // Touch targets
  getTouchTargetSize(): { width: number; height: number };
  validateTouchTargetCompliance(): boolean;

  // Gesture support
  handleTouchStart(event: TouchEvent): void;
  handleTouchEnd(event: TouchEvent): void;
  handleTouchMove(event: TouchEvent): void;

  // Responsive design
  getLayoutForScreenSize(screenWidth: number): 'compact' | 'comfortable' | 'spacious';
  adjustSpacingForTouch(baseSpacing: number): number;

  // Performance on mobile
  optimizeForMobile(): {
    reduceAnimations: boolean;
    limitExpansions: number;
    enableTouchOptimizations: boolean;
  };
}

// Integration contracts with existing systems
export interface CategoryIndexIntegrationContract {
  // Search integration
  highlightSearchTerms(text: string, searchQuery: string): string;
  shouldExpandForSearch(category: CategoryWithMetrics, searchQuery: string): boolean;

  // Filter integration
  applyFiltersToTree(
    categories: CategoryWithMetrics[],
    filters: AliFilterCriteria
  ): CategoryWithMetrics[];

  // Navigation integration
  buildNavigationUrl(
    category: CategoryWithMetrics,
    currentFilters: AliFilterCriteria,
    currentSearch: string
  ): string;

  // State synchronization
  syncWithCategoryIndexState(
    indexState: CategoryIndexState,
    expansionState: CategoryExpansionState
  ): void;
}

// Performance monitoring contract
export interface PerformanceContract {
  // Metrics collection
  recordExpansionTime(categoryPath: string, durationMs: number): void;
  recordRenderTime(componentName: string, durationMs: number): void;
  recordMemoryUsage(timestamp: number, memoryMB: number): void;

  // Performance thresholds
  validateExpansionPerformance(durationMs: number): boolean; // Should be < 100ms
  validateRenderPerformance(durationMs: number): boolean;    // Should be < 16ms (60fps)
  validateMemoryUsage(memoryMB: number): boolean;            // Should be reasonable

  // Performance reporting
  getPerformanceReport(): {
    averageExpansionTime: number;
    slowestExpansions: { path: string; time: number }[];
    memoryTrend: { timestamp: number; usage: number }[];
    renderingPerformance: {
      average: number;
      p95: number;
      frameDrops: number;
    };
  };
}

// Error handling contract
export interface ErrorHandlingContract {
  // Error types
  handleExpansionError(error: ExpansionError, categoryPath: string): void;
  handleVirtualScrollError(error: VirtualScrollError): void;
  handleAccessibilityError(error: AccessibilityError): void;

  // Recovery strategies
  recoverFromExpansionFailure(categoryPath: string): void;
  recoverFromHeightMeasurementFailure(categoryPath: string): void;
  recoverFromKeyboardNavigationFailure(): void;

  // Error reporting
  logError(error: Error, context: string, metadata?: Record<string, any>): void;
  getErrorReport(): {
    recentErrors: Array<{
      type: string;
      message: string;
      timestamp: number;
      context: string;
    }>;
    errorCounts: Record<string, number>;
  };
}

// Testing utilities contract
export interface TestingContract {
  // Test helpers
  createMockCategoryWithChildren(childCount: number): CategoryWithMetrics;
  createMockExpansionState(expandedPaths: string[]): CategoryExpansionState;
  simulateUserInteraction(
    action: 'expand' | 'collapse' | 'select' | 'keypress',
    target: string,
    metadata?: any
  ): void;

  // Assertion helpers
  assertExpansionState(expectedPaths: string[]): void;
  assertAriaCompliance(element: HTMLElement): void;
  assertPerformanceWithinLimits(metrics: PerformanceMetrics): void;

  // Mock data generation
  generateCategoryHierarchy(maxDepth: number, childrenPerLevel: number): CategoryWithMetrics[];
  generateAliMetrics(): AliMetrics;
}

// Type definitions for contracts
export type ExpansionError =
  | 'INVALID_CATEGORY_PATH'
  | 'MAX_EXPANSIONS_EXCEEDED'
  | 'CATEGORY_NOT_FOUND'
  | 'CIRCULAR_REFERENCE';

export type VirtualScrollError =
  | 'HEIGHT_MEASUREMENT_FAILED'
  | 'SCROLL_POSITION_INVALID'
  | 'VISIBLE_RANGE_CALCULATION_ERROR';

export type AccessibilityError =
  | 'FOCUS_MANAGEMENT_FAILED'
  | 'ARIA_ATTRIBUTES_INVALID'
  | 'KEYBOARD_NAVIGATION_BLOCKED';

export interface PerformanceMetrics {
  expansionTime: number;
  renderTime: number;
  memoryUsage: number;
  frameRate: number;
}

// Main contract aggregation
export interface ExpandableCategoryCardContracts {
  categoryCard: CategoryCardContract;
  expansionState: ExpansionStateContract;
  virtualScroll: VirtualScrollContract;
  keyboardNavigation: KeyboardNavigationContract;
  mobileInteraction: MobileInteractionContract;
  categoryIndexIntegration: CategoryIndexIntegrationContract;
  performance: PerformanceContract;
  errorHandling: ErrorHandlingContract;
  testing: TestingContract;
}
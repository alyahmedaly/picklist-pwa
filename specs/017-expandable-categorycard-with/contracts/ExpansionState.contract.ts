/**
 * Expansion State Management Contract
 *
 * Defines the API contract for managing expansion state across the category tree.
 * This contract ensures consistent state management and provides interfaces for
 * testing expansion behavior.
 */

// Core expansion state interface
export interface ExpansionStateAPI {
  // State queries
  isExpanded(categoryPath: string): boolean;
  getExpandedCategories(): readonly string[];
  getAutoExpandedCategories(): readonly string[];
  getExpansionCount(): number;
  getMaxExpansions(): number;

  // Basic expansion operations
  expand(categoryPath: string): Promise<boolean>;
  collapse(categoryPath: string): Promise<boolean>;
  toggle(categoryPath: string): Promise<boolean>;

  // Bulk operations
  expandAll(options?: { maxDepth?: number; maxCount?: number }): Promise<string[]>;
  collapseAll(): Promise<void>;
  collapseAllExcept(preservePaths: string[]): Promise<void>;

  // Search-driven expansion
  expandForSearch(
    searchQuery: string,
    categories: CategoryWithMetrics[]
  ): Promise<string[]>;
  clearSearchExpansions(): Promise<void>;

  // Performance management
  enforcePerformanceLimits(): Promise<void>;
  getPerformanceMetrics(): ExpansionPerformanceMetrics;

  // Event subscription
  onExpansionChange(callback: ExpansionChangeCallback): () => void;
  onPerformanceWarning(callback: PerformanceWarningCallback): () => void;
}

// State change events
export interface ExpansionChangeEvent {
  type: 'expand' | 'collapse' | 'bulk_expand' | 'bulk_collapse' | 'search_expand' | 'search_collapse';
  categoryPath: string;
  previousState: boolean;
  newState: boolean;
  timestamp: number;
  trigger: 'user' | 'search' | 'bulk' | 'system';
  metadata?: Record<string, any>;
}

export type ExpansionChangeCallback = (event: ExpansionChangeEvent) => void;

// Performance monitoring
export interface ExpansionPerformanceMetrics {
  totalExpanded: number;
  maxAllowedExpansions: number;
  averageExpansionTime: number;
  memoryUsage: {
    expansionState: number;    // Bytes used by expansion state
    heightCache: number;       // Bytes used by height cache
    total: number;             // Total memory footprint
  };
  operationCounts: {
    expansions: number;
    collapses: number;
    bulkOperations: number;
    searchOperations: number;
  };
  performanceWarnings: Array<{
    type: string;
    message: string;
    timestamp: number;
  }>;
}

export type PerformanceWarningCallback = (warning: {
  type: 'MAX_EXPANSIONS' | 'SLOW_OPERATION' | 'MEMORY_USAGE' | 'RENDER_PERFORMANCE';
  message: string;
  categoryPath?: string;
  metrics: Partial<ExpansionPerformanceMetrics>;
}) => void;

// Configuration interface
export interface ExpansionConfiguration {
  // Performance limits
  maxSimultaneousExpansions: number;      // Default: 50
  maxAutoExpansionsPerSearch: number;     // Default: 20
  maxExpansionDepth: number;              // Default: 6

  // Timing constraints
  expansionTimeoutMs: number;             // Default: 100
  bulkOperationTimeoutMs: number;         // Default: 500
  debounceMs: number;                     // Default: 50

  // Memory management
  maxMemoryUsageMB: number;               // Default: 10
  heightCacheMaxEntries: number;          // Default: 1000
  heightCacheTTLMs: number;               // Default: 300000 (5 minutes)

  // Features
  enableSessionPersistence: boolean;       // Default: true
  enablePerformanceMonitoring: boolean;   // Default: true
  enableBulkOperations: boolean;          // Default: true
  enableSearchAutoExpansion: boolean;     // Default: true
}

// Session persistence interface
export interface SessionPersistence {
  saveExpansionState(state: ExpansionStateSnapshot): Promise<void>;
  loadExpansionState(): Promise<ExpansionStateSnapshot | null>;
  clearExpansionState(): Promise<void>;
  isSupported(): boolean;
}

export interface ExpansionStateSnapshot {
  expandedCategories: string[];
  timestamp: number;
  version: string;                        // For migration compatibility
  metadata: {
    totalCategories: number;
    expansionCount: number;
    sessionId: string;
  };
}

// Error handling interface
export interface ExpansionErrorHandler {
  handleExpansionError(error: ExpansionError): void;
  handlePerformanceError(error: PerformanceError): void;
  getErrorRecoveryStrategy(error: Error): 'retry' | 'skip' | 'reset' | 'fallback';
}

export class ExpansionError extends Error {
  constructor(
    message: string,
    public readonly code: ExpansionErrorCode,
    public readonly categoryPath?: string,
    public readonly metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'ExpansionError';
  }
}

export class PerformanceError extends Error {
  constructor(
    message: string,
    public readonly metric: keyof ExpansionPerformanceMetrics,
    public readonly currentValue: number,
    public readonly threshold: number
  ) {
    super(message);
    this.name = 'PerformanceError';
  }
}

export type ExpansionErrorCode =
  | 'INVALID_CATEGORY_PATH'
  | 'CATEGORY_NOT_FOUND'
  | 'MAX_EXPANSIONS_EXCEEDED'
  | 'EXPANSION_TIMEOUT'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'CIRCULAR_DEPENDENCY'
  | 'INVALID_STATE'
  | 'PERSISTENCE_FAILED';

// Hook interface for React integration
export interface UseExpansionStateHook {
  // State
  expandedCategories: readonly string[];
  autoExpandedCategories: readonly string[];
  isExpanded: (categoryPath: string) => boolean;
  expansionCount: number;
  isLoading: boolean;
  error: ExpansionError | null;

  // Actions
  expand: (categoryPath: string) => Promise<void>;
  collapse: (categoryPath: string) => Promise<void>;
  toggle: (categoryPath: string) => Promise<void>;
  expandAll: (options?: { maxDepth?: number }) => Promise<void>;
  collapseAll: () => Promise<void>;
  expandForSearch: (query: string) => Promise<void>;
  clearSearchExpansions: () => Promise<void>;

  // Performance
  performanceMetrics: ExpansionPerformanceMetrics;
  resetPerformanceMetrics: () => void;

  // Configuration
  updateConfiguration: (config: Partial<ExpansionConfiguration>) => void;
}

// Testing interface
export interface ExpansionStateTestAPI {
  // Test state setup
  setExpansionState(expandedPaths: string[]): void;
  setAutoExpansionState(autoExpandedPaths: string[]): void;
  setConfiguration(config: Partial<ExpansionConfiguration>): void;

  // Mock operations
  mockExpansionDelay(delayMs: number): void;
  mockMemoryConstraints(maxMemoryMB: number): void;
  mockPerformanceFailure(categoryPath: string): void;

  // Assertions
  assertExpansionState(expectedPaths: string[]): void;
  assertPerformanceWithinLimits(): void;
  assertNoMemoryLeaks(): void;
  assertEventSequence(expectedEvents: ExpansionChangeEvent[]): void;

  // Utilities
  generateMockCategories(depth: number, childrenPerLevel: number): CategoryWithMetrics[];
  simulateSearchQuery(query: string): Promise<string[]>;
  measureExpansionPerformance(categoryPath: string): Promise<number>;
}

// Integration with virtual scrolling
export interface VirtualScrollExpansionBridge {
  // Height management
  onExpansionChange(
    categoryPath: string,
    isExpanded: boolean,
    newHeight: number
  ): void;

  requestHeightMeasurement(categoryPath: string): Promise<number>;
  invalidateHeightCache(categoryPath?: string): void;

  // Scroll position management
  maintainScrollPosition(expansionChanges: Array<{
    categoryPath: string;
    wasExpanded: boolean;
    isExpanded: boolean;
    heightDelta: number;
  }>): void;

  // Performance optimization
  shouldRenderExpanded(categoryPath: string, visibleRange: {
    start: number;
    end: number;
  }): boolean;
}

// Search integration interface
export interface SearchExpansionIntegration {
  // Search matching
  findMatchingCategories(
    query: string,
    categories: CategoryWithMetrics[]
  ): Array<{
    category: CategoryWithMetrics;
    matchType: 'name' | 'subcategory' | 'breadcrumb';
    matchStrength: number;
  }>;

  // Auto-expansion logic
  determineExpansionsForSearch(
    matches: Array<{ category: CategoryWithMetrics; matchType: string }>,
    maxExpansions: number
  ): string[];

  // Highlighting
  getHighlightedText(text: string, query: string): Array<{
    text: string;
    isHighlighted: boolean;
  }>;

  // Search state management
  trackSearchExpansions(query: string, expandedPaths: string[]): void;
  clearSearchTracking(): void;
}

// Default implementation requirements
export const EXPANSION_STATE_DEFAULTS: Required<ExpansionConfiguration> = {
  maxSimultaneousExpansions: 50,
  maxAutoExpansionsPerSearch: 20,
  maxExpansionDepth: 6,
  expansionTimeoutMs: 100,
  bulkOperationTimeoutMs: 500,
  debounceMs: 50,
  maxMemoryUsageMB: 10,
  heightCacheMaxEntries: 1000,
  heightCacheTTLMs: 300000,
  enableSessionPersistence: true,
  enablePerformanceMonitoring: true,
  enableBulkOperations: true,
  enableSearchAutoExpansion: true
};

// Contract validation
export interface ExpansionStateContractValidator {
  validateConfiguration(config: ExpansionConfiguration): string[];
  validateExpansionOperation(categoryPath: string, operation: 'expand' | 'collapse'): boolean;
  validatePerformanceConstraints(metrics: ExpansionPerformanceMetrics): string[];
  validateStateConsistency(state: ExpansionStateSnapshot): boolean;
}
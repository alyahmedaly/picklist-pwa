/**
 * Expansion State Type Definitions
 *
 * Types for managing category expansion state across the tree hierarchy.
 * Supports manual and search-driven expansion with performance monitoring.
 */

// Core expansion state interface
export interface CategoryExpansionState {
  expandedCategories: Set<string>;        // Category paths that are expanded
  autoExpandedCategories: Set<string>;    // Categories expanded by search (auto-collapse on clear)
  expansionMode: 'manual' | 'search';     // Current expansion trigger mode
  maxAutoDepth: number;                   // Maximum depth for auto-expansion (default: 2)
}

// Expansion configuration options
export interface ExpansionConfig {
  maxInitialDepth: number;                // Maximum depth to show initially (default: 2)
  maxChildrenPerLevel: number;            // Maximum children to show before pagination (default: 10)
  enableKeyboardNavigation: boolean;      // Enable ARIA tree keyboard navigation (default: true)
  enableBulkOperations: boolean;          // Enable expand/collapse all buttons (default: true)
  sessionPersistence: boolean;            // Persist expansion state in session (default: true)
  maxSimultaneousExpansions: number;      // Performance limit for expansions (default: 50)
  expansionTimeoutMs: number;             // Timeout for expansion operations (default: 100)
  debounceMs: number;                     // Debounce time for expansion updates (default: 50)
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
export type PerformanceWarningCallback = (warning: {
  type: 'MAX_EXPANSIONS' | 'SLOW_OPERATION' | 'MEMORY_USAGE' | 'RENDER_PERFORMANCE';
  message: string;
  categoryPath?: string;
  metrics: Partial<ExpansionPerformanceMetrics>;
}) => void;

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

// Session persistence
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

// Error handling
export class ExpansionError extends Error {
  code: ExpansionErrorCode;
  categoryPath?: string;
  metadata?: Record<string, any>;

  constructor(
    message: string,
    code: ExpansionErrorCode,
    categoryPath?: string,
    metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'ExpansionError';
    this.code = code;
    this.categoryPath = categoryPath;
    this.metadata = metadata;
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

// React hook interface
export interface UseExpansionStateReturn {
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
  updateConfiguration: (config: Partial<ExpansionConfig>) => void;
}

// Default configuration
export const EXPANSION_STATE_DEFAULTS: Required<ExpansionConfig> = {
  maxInitialDepth: 2,
  maxChildrenPerLevel: 10,
  enableKeyboardNavigation: true,
  enableBulkOperations: true,
  sessionPersistence: true,
  maxSimultaneousExpansions: 50,
  expansionTimeoutMs: 100,
  debounceMs: 50
};

// Performance limits
export const EXPANSION_PERFORMANCE_LIMITS = {
  maxExpandedCategories: 50,              // Limit simultaneous expansions
  maxAutoExpansions: 20,                  // Limit search auto-expansions
  heightMeasurementTimeout: 100,          // Max time for height measurement (ms)
  expansionAnimationDuration: 200,        // CSS transition duration (ms)
  heightCacheExpiry: 300000               // Height cache TTL (5 minutes)
};

// Validation utilities
export const ExpansionStateValidation = {
  categoryPath: {
    required: true,
    pattern: /^[^>]+(?:\s>\s[^>]+)*$/,    // Breadcrumb format validation
    maxLength: 500                        // Prevent extremely long paths
  },
  maxDepth: {
    min: 1,
    max: 6,                               // Match existing category tree depth
    default: 6
  },
  maxChildren: {
    min: 1,
    max: 100,                             // Prevent performance issues
    default: 10
  }
};
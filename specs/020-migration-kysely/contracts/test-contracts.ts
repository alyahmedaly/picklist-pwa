/**
 * Test Contracts: Kysely Migration
 * Feature: 020-migration-kysely
 * Purpose: Test specifications for parity testing and migration validation
 */

// Parity test contract
export interface ParityTestCase {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly legacyQuery: {
    sql: string;
    params: any[];
  };
  readonly kyselyQuery: {
    repository: string;
    method: string;
    args: any[];
  };
  readonly expectedShape: Record<string, string>; // field -> type mapping
  readonly sortBy?: string;
  readonly orderBy?: 'asc' | 'desc';
  readonly tolerance?: number; // for numeric comparisons
}

export interface ParityTestResult {
  readonly testId: string;
  readonly passed: boolean;
  readonly executionTime: {
    legacy: number;
    kysely: number;
  };
  readonly resultComparison: {
    identical: boolean;
    rowCountMatch: boolean;
    differences: string[];
  };
  readonly performance: {
    regressionPercentage: number;
    acceptable: boolean;
  };
}

export interface ParityTestSuite {
  readonly name: string;
  readonly tests: ParityTestCase[];
  run(): Promise<ParityTestResult[]>;
  generateReport(): string;
}

// Migration test contracts
export interface MigrationTestCase {
  readonly phase: 'dual-layer' | 'repository-migration' | 'hook-integration' | 'legacy-cleanup';
  readonly testName: string;
  readonly preconditions: string[];
  readonly steps: MigrationTestStep[];
  readonly expectedOutcome: string;
  readonly rollbackSteps?: string[];
}

export interface MigrationTestStep {
  readonly action: string;
  readonly parameters?: Record<string, any>;
  readonly expectedResult?: any;
  readonly validation: ValidationCheck[];
}

export interface ValidationCheck {
  readonly type: 'query-result' | 'performance' | 'bundle-size' | 'type-safety' | 'feature-flag';
  readonly assertion: string;
  readonly threshold?: number;
  readonly errorMessage: string;
}

// Feature flag test contracts
export interface FeatureFlagTestCase {
  readonly flagConfiguration: {
    FLEX_SCHEMA_ENABLE_SEARCH: boolean;
    FLEX_SCHEMA_INDEX_TIER: 'full' | 'core' | 'min';
  };
  readonly testScenarios: FeatureFlagScenario[];
}

export interface FeatureFlagScenario {
  readonly name: string;
  readonly operation: 'product-query' | 'category-query' | 'search-query';
  readonly parameters: any;
  readonly expectedBehavior: 'success' | 'error' | 'fallback';
  readonly expectedError?: string;
}

// Performance test contracts
export interface PerformanceTestCase {
  readonly name: string;
  readonly query: string;
  readonly parameters: any[];
  readonly dataSize: 'small' | 'medium' | 'large'; // Based on product count
  readonly benchmarks: {
    legacy: PerformanceBenchmark;
    kysely: PerformanceBenchmark;
  };
  readonly acceptableRegressionPercentage: number;
}

export interface PerformanceBenchmark {
  readonly averageTimeMs: number;
  readonly p95TimeMs: number;
  readonly memoryUsageMB: number;
  readonly samples: number;
}

// Bundle size test contracts
export interface BundleSizeTestCase {
  readonly phase: 'baseline' | 'dual-layer' | 'kysely-only';
  readonly measurements: BundleSizeMeasurement;
  readonly thresholds: BundleSizeThresholds;
}

export interface BundleSizeMeasurement {
  readonly totalSizeKB: number;
  readonly gzippedSizeKB: number;
  readonly jsChunkSizes: Record<string, number>;
  readonly treeshakingEfficiency: number;
}

export interface BundleSizeThresholds {
  readonly maxIncreaseTotalKB: number;
  readonly maxIncreaseGzippedKB: number;
  readonly maxTotalSizeKB: number;
  readonly minTreeshakingEfficiency: number;
}

// Integration test contracts for hooks
export interface HookIntegrationTestCase {
  readonly hookName: string;
  readonly testScenarios: HookTestScenario[];
}

export interface HookTestScenario {
  readonly name: string;
  readonly props: any;
  readonly expectedState: {
    isLoading: boolean;
    error: string | null;
    data: any;
    metadata: any;
  };
  readonly interactions?: HookInteraction[];
}

export interface HookInteraction {
  readonly action: 'refetch' | 'updateCriteria' | 'executeQuery';
  readonly parameters?: any;
  readonly expectedStateChange: Partial<HookTestScenario['expectedState']>;
}

// Test data contracts
export interface TestDataSet {
  readonly name: string;
  readonly size: number;
  readonly features: {
    hasNutrition: boolean;
    hasFlags: boolean;
    hasScores: boolean;
    hasAdditives: boolean;
    hasSearchTerms: boolean;
  };
  readonly categories: number;
  readonly maxDepth: number;
  readonly generate(): Promise<void>;
  readonly cleanup(): Promise<void>;
}

// Validation contracts
export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: ValidationError[];
  readonly warnings: ValidationWarning[];
}

export interface ValidationError {
  readonly code: string;
  readonly message: string;
  readonly context?: Record<string, any>;
}

export interface ValidationWarning {
  readonly code: string;
  readonly message: string;
  readonly suggestion?: string;
}

// Test runner contracts
export interface TestRunner {
  runParityTests(suite: ParityTestSuite): Promise<ParityTestResult[]>;
  runMigrationTests(cases: MigrationTestCase[]): Promise<ValidationResult>;
  runPerformanceTests(cases: PerformanceTestCase[]): Promise<PerformanceBenchmark[]>;
  runFeatureFlagTests(cases: FeatureFlagTestCase[]): Promise<ValidationResult>;
  runIntegrationTests(cases: HookIntegrationTestCase[]): Promise<ValidationResult>;
  generateReport(): string;
}

// Constants for test configuration
export const TEST_CONFIGURATIONS = {
  PARITY_TOLERANCE: 0.001, // For floating point comparisons
  PERFORMANCE_REGRESSION_THRESHOLD: 10, // Percentage
  BUNDLE_SIZE_INCREASE_LIMIT: 25, // KB gzipped
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  LARGE_DATASET_SIZE: 30000,
  MEDIUM_DATASET_SIZE: 10000,
  SMALL_DATASET_SIZE: 1000,
} as const;

export const REQUIRED_PARITY_TESTS = [
  'product-query-basic',
  'product-query-with-nutrition',
  'product-query-with-flags',
  'product-query-with-scores',
  'product-query-complex-join',
  'category-hierarchy-root',
  'category-hierarchy-subtree',
  'category-hierarchy-with-products',
  'search-query-basic',
  'search-query-with-filters',
  'search-query-relevance',
  'product-details-complete',
] as const;
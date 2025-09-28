/**
 * Parity Test Framework for Kysely Migration
 * Feature: 020-migration-kysely
 *
 * Utility classes for capturing baselines and validating query migration parity
 */

import type { FlexibleQueryResult } from '../data/loadFlexibleDatabase.js';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface BaselineMetadata {
  description: string;
  category: 'basic-queries' | 'filtered-queries' | 'nutrition-queries' | 'flag-queries' | 'category-queries' | 'complex-queries' | 'search-queries' | 'edge-cases' | 'performance-cases' | 'test';
  complexity: 'low' | 'medium' | 'high' | 'very-high';
  expectedResultCount: 'empty' | 'single-or-null' | 'limited' | 'variable' | 'large';
  includesJoins: boolean;
}

export interface ProductQueryBaseline {
  patternId: string;
  queryName: string;
  parameters: any[];
  result: FlexibleQueryResult | any;
  executionTime: number;
  timestamp: string;
  metadata: BaselineMetadata;
}

export interface BaselineCapture {
  patternId: string;
  queryName: string;
  parameters: any[];
  result: FlexibleQueryResult | any;
  metadata: BaselineMetadata;
}

export interface QueryPattern {
  id: string;
  name: string;
  category: string;
  complexity: string;
  description: string;
}

export interface ParityTestResult {
  patternId: string;
  passed: boolean;
  legacyResult: any;
  kyselyResult: any;
  executionTimes: {
    legacy: number;
    kysely: number;
  };
  differences: string[];
  performanceRegression: number;
  timestamp: string;
}

export interface ParityComparisonOptions {
  tolerance?: number;
  ignoreFields?: string[];
  sortBy?: string;
  strictOrder?: boolean;
}

// =============================================================================
// BASELINE STORAGE
// =============================================================================

const BASELINE_STORAGE = new Map<string, ProductQueryBaseline>();

export async function storeBaseline(baseline: ProductQueryBaseline): Promise<void> {
  BASELINE_STORAGE.set(baseline.patternId, baseline);

  // In a real implementation, this might write to filesystem or database
  console.log(`📝 Stored baseline for pattern: ${baseline.patternId}`);
}

export async function getStoredBaseline(patternId: string): Promise<ProductQueryBaseline | null> {
  return BASELINE_STORAGE.get(patternId) || null;
}

export async function clearStoredBaselines(): Promise<void> {
  BASELINE_STORAGE.clear();
  console.log('🧹 Cleared all stored baselines');
}

// =============================================================================
// BASELINE CAPTURE
// =============================================================================

export async function captureProductQueryBaseline(capture: BaselineCapture): Promise<ProductQueryBaseline> {
  const startTime = Date.now();

  // Simulate query execution time measurement
  const executionTime = Date.now() - startTime;

  const baseline: ProductQueryBaseline = {
    ...capture,
    executionTime,
    timestamp: new Date().toISOString()
  };

  await storeBaseline(baseline);

  return baseline;
}

// =============================================================================
// BASELINE VALIDATION
// =============================================================================

export async function validateBaseline(baseline: ProductQueryBaseline): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required fields
  if (!baseline.patternId || baseline.patternId.trim() === '') {
    errors.push('patternId is required');
  }

  if (!baseline.queryName || baseline.queryName.trim() === '') {
    errors.push('queryName is required');
  }

  if (!Array.isArray(baseline.parameters)) {
    errors.push('parameters must be an array');
  }

  if (!baseline.result) {
    errors.push('result is required');
  }

  if (typeof baseline.executionTime !== 'number' || baseline.executionTime < 0) {
    errors.push('executionTime must be a non-negative number');
  }

  if (!baseline.timestamp) {
    errors.push('timestamp is required');
  }

  if (!baseline.metadata) {
    errors.push('metadata is required');
  } else {
    // Validate metadata
    if (!baseline.metadata.description) {
      errors.push('metadata.description is required');
    }

    if (!baseline.metadata.category) {
      errors.push('metadata.category is required');
    }

    if (!baseline.metadata.complexity) {
      errors.push('metadata.complexity is required');
    }

    if (baseline.metadata.includesJoins === undefined) {
      errors.push('metadata.includesJoins is required');
    }
  }

  // Performance warnings
  if (baseline.executionTime > 1000) {
    warnings.push(`Query execution time ${baseline.executionTime}ms may be slow`);
  }

  // Result validation warnings
  if (baseline.result && Array.isArray(baseline.result.data)) {
    if (baseline.result.data.length === 0 && baseline.metadata.expectedResultCount !== 'empty') {
      warnings.push('Query returned empty results but expected non-empty');
    }

    if (baseline.result.data.length > 1000) {
      warnings.push('Large result set may impact performance');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// =============================================================================
// PARITY COMPARISON
// =============================================================================

export function compareQueryResults(
  legacyResult: any,
  kyselyResult: any,
  options: ParityComparisonOptions = {}
): {
  identical: boolean;
  differences: string[];
  stats: {
    legacyCount: number;
    kyselyCount: number;
    matchingRows: number;
  };
} {
  const differences: string[] = [];
  const { tolerance = 0.001, ignoreFields = [], sortBy, strictOrder = false } = options;

  // Basic structure validation
  if (!legacyResult || !kyselyResult) {
    differences.push('One or both results are null/undefined');
    return {
      identical: false,
      differences,
      stats: { legacyCount: 0, kyselyCount: 0, matchingRows: 0 }
    };
  }

  // Extract data arrays
  const legacyData = legacyResult.data || legacyResult;
  const kyselyData = kyselyResult.data || kyselyResult;

  if (!Array.isArray(legacyData) || !Array.isArray(kyselyData)) {
    differences.push('Results are not arrays');
    return {
      identical: false,
      differences,
      stats: { legacyCount: 0, kyselyCount: 0, matchingRows: 0 }
    };
  }

  // Count comparison
  const legacyCount = legacyData.length;
  const kyselyCount = kyselyData.length;

  if (legacyCount !== kyselyCount) {
    differences.push(`Row count mismatch: legacy ${legacyCount}, kysely ${kyselyCount}`);
  }

  // Sort data for comparison if needed
  let sortedLegacy = [...legacyData];
  let sortedKysely = [...kyselyData];

  if (sortBy && !strictOrder) {
    const sortFn = (a: any, b: any) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
      return 0;
    };

    sortedLegacy.sort(sortFn);
    sortedKysely.sort(sortFn);
  }

  // Row-by-row comparison
  let matchingRows = 0;
  const maxRows = Math.max(legacyCount, kyselyCount);

  for (let i = 0; i < maxRows; i++) {
    const legacyRow = sortedLegacy[i];
    const kyselyRow = sortedKysely[i];

    if (!legacyRow && !kyselyRow) {
      matchingRows++;
      continue;
    }

    if (!legacyRow || !kyselyRow) {
      differences.push(`Row ${i}: missing in ${!legacyRow ? 'legacy' : 'kysely'}`);
      continue;
    }

    // Compare each field
    const rowDifferences = compareRowFields(legacyRow, kyselyRow, ignoreFields, tolerance, i);
    differences.push(...rowDifferences);

    if (rowDifferences.length === 0) {
      matchingRows++;
    }
  }

  return {
    identical: differences.length === 0,
    differences,
    stats: {
      legacyCount,
      kyselyCount,
      matchingRows
    }
  };
}

function compareRowFields(
  legacyRow: any,
  kyselyRow: any,
  ignoreFields: string[],
  tolerance: number,
  rowIndex: number
): string[] {
  const differences: string[] = [];

  // Get all unique field names
  const legacyKeys = Object.keys(legacyRow || {});
  const kyselyKeys = Object.keys(kyselyRow || {});
  const allFields = [...new Set([...legacyKeys, ...kyselyKeys])];

  for (const field of allFields) {
    if (ignoreFields.includes(field)) continue;

    const legacyValue = legacyRow[field];
    const kyselyValue = kyselyRow[field];

    // Handle missing fields
    if (!(field in legacyRow)) {
      differences.push(`Row ${rowIndex}: field '${field}' missing in legacy`);
      continue;
    }

    if (!(field in kyselyRow)) {
      differences.push(`Row ${rowIndex}: field '${field}' missing in kysely`);
      continue;
    }

    // Compare values
    if (!valuesEqual(legacyValue, kyselyValue, tolerance)) {
      differences.push(`Row ${rowIndex}: field '${field}' differs: legacy=${JSON.stringify(legacyValue)}, kysely=${JSON.stringify(kyselyValue)}`);
    }
  }

  return differences;
}

function valuesEqual(a: any, b: any, tolerance: number): boolean {
  // Handle null/undefined
  if (a === null && b === null) return true;
  if (a === undefined && b === undefined) return true;
  if (a === null || a === undefined || b === null || b === undefined) return false;

  // Handle numbers with tolerance
  if (typeof a === 'number' && typeof b === 'number') {
    if (Math.abs(a - b) <= tolerance) return true;
  }

  // Handle strings
  if (typeof a === 'string' && typeof b === 'string') {
    return a === b;
  }

  // Handle booleans
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return a === b;
  }

  // Handle arrays (shallow comparison)
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => valuesEqual(item, b[index], tolerance));
  }

  // Handle objects (shallow comparison)
  if (typeof a === 'object' && typeof b === 'object') {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) return false;

    return aKeys.every(key =>
      bKeys.includes(key) && valuesEqual(a[key], b[key], tolerance)
    );
  }

  // Default equality
  return a === b;
}

// =============================================================================
// PARITY TEST EXECUTION
// =============================================================================

export async function runParityTest(
  patternId: string,
  legacyQuery: () => Promise<any>,
  kyselyQuery: () => Promise<any>,
  options: ParityComparisonOptions = {}
): Promise<ParityTestResult> {
  const startTime = Date.now();

  try {
    // Execute legacy query
    const legacyStart = Date.now();
    const legacyResult = await legacyQuery();
    const legacyTime = Date.now() - legacyStart;

    // Execute Kysely query
    const kyselyStart = Date.now();
    const kyselyResult = await kyselyQuery();
    const kyselyTime = Date.now() - kyselyStart;

    // Compare results
    const comparison = compareQueryResults(legacyResult, kyselyResult, options);

    // Calculate performance regression
    const performanceRegression = kyselyTime > 0 ?
      ((kyselyTime - legacyTime) / legacyTime) * 100 : 0;

    return {
      patternId,
      passed: comparison.identical,
      legacyResult,
      kyselyResult,
      executionTimes: {
        legacy: legacyTime,
        kysely: kyselyTime
      },
      differences: comparison.differences,
      performanceRegression,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    return {
      patternId,
      passed: false,
      legacyResult: null,
      kyselyResult: null,
      executionTimes: {
        legacy: 0,
        kysely: 0
      },
      differences: [`Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      performanceRegression: 0,
      timestamp: new Date().toISOString()
    };
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function generateTestReport(results: ParityTestResult[]): string {
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;

  const avgLegacyTime = results.reduce((sum, r) => sum + r.executionTimes.legacy, 0) / totalTests;
  const avgKyselyTime = results.reduce((sum, r) => sum + r.executionTimes.kysely, 0) / totalTests;
  const avgRegression = results.reduce((sum, r) => sum + r.performanceRegression, 0) / totalTests;

  let report = `\n📊 Parity Test Report\n`;
  report += `${'='.repeat(50)}\n`;
  report += `Total Tests: ${totalTests}\n`;
  report += `✅ Passed: ${passedTests}\n`;
  report += `❌ Failed: ${failedTests}\n`;
  report += `Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n\n`;

  report += `⏱️  Performance Summary:\n`;
  report += `Average Legacy Time: ${avgLegacyTime.toFixed(2)}ms\n`;
  report += `Average Kysely Time: ${avgKyselyTime.toFixed(2)}ms\n`;
  report += `Average Regression: ${avgRegression.toFixed(1)}%\n\n`;

  if (failedTests > 0) {
    report += `❌ Failed Tests:\n`;
    results.filter(r => !r.passed).forEach(result => {
      report += `\n• ${result.patternId}:\n`;
      result.differences.slice(0, 3).forEach(diff => {
        report += `  - ${diff}\n`;
      });
      if (result.differences.length > 3) {
        report += `  - ... and ${result.differences.length - 3} more differences\n`;
      }
    });
  }

  return report;
}

export function isPerformanceAcceptable(result: ParityTestResult, threshold: number = 10): boolean {
  return Math.abs(result.performanceRegression) <= threshold;
}

export function hasAcceptableResultDifferences(result: ParityTestResult, maxDifferences: number = 0): boolean {
  return result.differences.length <= maxDifferences;
}
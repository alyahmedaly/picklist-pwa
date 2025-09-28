/**
 * @picklist/parser - CSV Parser Package
 *
 * Provides CSV parsing utilities extracted from transform-data.ts
 * for reuse across applications while preserving behavioral identity.
 */

export { createStatsAccumulator } from './stats.ts';

// Core parsing functions
export { readCSV, createRows } from './parser.ts';

// Legacy helper functions for backward compatibility
export { createCSVRow, csvRowToRecord } from './legacy.ts';

// Main transform function
export { transformCSV, convertCSVToProduct } from './transform.ts';

// Type definitions
export type { CSVRow, ParsedCSVResult, CSVParseError, CSVParseOptions } from './types.ts';

// Re-exports for backward compatibility
export type { CSVRow as CSVRowType } from './types.ts';
export type { ParsedCSVResult as CSVParseResult } from './types.ts';

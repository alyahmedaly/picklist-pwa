/**
 * Sparsity analysis for CSV columns.
 * Counts non-empty cell occurrences per column and decides which columns to exclude
 * based on a missing ratio threshold (default: exclude if >90% rows are empty).
 */

import type { SparsityAnalysis } from '@picklist/types';

export interface SparsityOptions {
  /** Exclude when missingRatio > this (0.9 means >90% missing excluded). */
  maxMissingRatio?: number;
  /** Treat these header names as always-keep regardless of sparsity. */
  protectedColumns?: string[];
  /** Cells matching these (case-insensitive) are considered empty. */
  emptyTokens?: string[];
}

export interface SparsityResult {
  rowCount: number;
  headers: string[];
  nonEmptyCounts: number[];
  excludedColumns: string[]; // header names excluded
  excludedIndices: number[]; // their indices
  keptColumns: string[];
}

const DEFAULT_EMPTY = ['', 'na', 'n/a', 'null', 'undefined', '-', '--'];

/**
 * Compute sparsity metrics.
 * Complexity: O(R * C) where R = number of rows scanned, C = number of columns.
 * Memory: O(C) for counters plus small result arrays.
 */
export function computeSparsity(
  headers: string[],
  rows: string[][],
  opts: SparsityOptions = {},
): SparsityResult {
  const { maxMissingRatio = 0.9, protectedColumns = [], emptyTokens = DEFAULT_EMPTY } = opts;
  const emptySet = new Set(emptyTokens.map((t) => t.toLowerCase()));
  const protectedSet = new Set(protectedColumns.map((c) => c.toLowerCase()));

  const counts = new Array(headers.length).fill(0);
  let rowCount = 0;

  for (const row of rows) {
    rowCount++;
    for (let i = 0; i < headers.length; i++) {
      const cell = (row[i] ?? '').trim();
      if (cell && !emptySet.has(cell.toLowerCase())) counts[i]++;
    }
  }

  const excludedIndices: number[] = [];
  const excludedColumns: string[] = [];
  const keptColumns: string[] = [];

  for (let i = 0; i < headers.length; i++) {
    const missingRatio = rowCount === 0 ? 1 : 1 - counts[i] / rowCount;
    const headerLc = headers[i].toLowerCase();
    if (!protectedSet.has(headerLc) && missingRatio > maxMissingRatio) {
      excludedIndices.push(i);
      excludedColumns.push(headers[i]);
    } else {
      keptColumns.push(headers[i]);
    }
  }

  return {
    rowCount,
    headers: [...headers],
    nonEmptyCounts: counts,
    excludedColumns,
    excludedIndices,
    keptColumns,
  };
}

/**
 * Calculate sparsity analysis for CSV data matching the contract interface
 * @param csvData - Array of CSV row objects
 * @returns SparsityAnalysis result
 */
export function calculateSparsity(csvData: Record<string, string>[]): SparsityAnalysis {
  if (csvData.length === 0) {
    return {
      totalColumns: 0,
      emptyColumns: [],
      sparsityThreshold: 0.9,
      recommendedExclusions: [],
    };
  }

  // Extract headers from first row
  const headers = Object.keys(csvData[0]);

  // Convert csvData to string array format for computeSparsity
  const rows = csvData.map((row) => headers.map((header) => row[header] || ''));
  const sparsityResult = computeSparsity(headers, rows, {
    maxMissingRatio: 0.9,
  });

  return {
    totalColumns: headers.length,
    emptyColumns: sparsityResult.excludedColumns,
    sparsityThreshold: 0.9,
    recommendedExclusions: sparsityResult.excludedColumns,
  };
}

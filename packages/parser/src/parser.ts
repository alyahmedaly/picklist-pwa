/**
 * Core CSV parsing functions
 *
 * Implements the main parsing functionality extracted from transform-data.ts
 */

import { parse } from '@std/csv';
import type { CSVRow, ParsedCSVResult, CSVParseError, CSVHeader } from './types.ts';

/**
 * Parse CSV text into headers and data matrix.
 *
 * @param csvText - Raw CSV content as string
 * @param options - Parse options (separator, etc.)
 * @returns Parsed result with headers, matrix, and row count
 * @throws Error if CSV is malformed or empty
 */
export function readCSV(csvText: string, options: { separator?: string } = {}): ParsedCSVResult {
  // Handle empty input
  if (!csvText || csvText.trim() === '') {
    const error = new Error('CSV text is empty') as CSVParseError;
    error.type = 'EMPTY_CSV';
    throw error;
  }

  try {
    // Parse CSV using @std/csv with custom separator support
    const parseOptions: Parameters<typeof parse>[1] = { skipFirstRow: false };
    if (options.separator) {
      parseOptions.separator = options.separator;
    }
    const parsedCsv = parse(csvText, parseOptions) as string[][];

    if (parsedCsv.length === 0) {
      const error = new Error('Empty CSV file') as CSVParseError;
      error.type = 'EMPTY_CSV';
      throw error;
    }

    // Extract headers and matrix (same as transform-data.ts:188-189)
    const headers = parsedCsv[0] as string[];
    const matrix = parsedCsv.slice(1) as string[][];

    // Validate headers
    if (!headers || headers.length === 0) {
      const error = new Error('CSV has no headers') as CSVParseError;
      error.type = 'MISSING_HEADERS';
      throw error;
    }

    return {
      headers,
      matrix,
      rowCount: matrix.length,
    };
  } catch (err) {
    if (err instanceof Error && 'type' in err) {
      // Re-throw our custom errors
      throw err;
    }

    // Convert @std/csv errors to our format
    const error = new Error(
      `Malformed CSV: ${err instanceof Error ? err.message : String(err)}`,
    ) as CSVParseError;
    error.type = 'MALFORMED_CSV';
    throw error;
  }
}

/**
 * Convert headers and matrix into typed CSVRow objects.
 *
 * @param headers - Column names from CSV header row
 * @param matrix - Data rows as string arrays
 * @returns Array of typed CSVRow objects
 * @throws Error if headers are empty or matrix is malformed
 */
export function createRows(headers: CSVHeader[] | string[], matrix: string[][]): CSVRow[] {
  if (!headers || headers.length === 0) {
    throw new Error('Headers array cannot be empty');
  }

  return matrix.map((row) => {
    const csvRow: CSVRow = {};

    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      if (header !== undefined) {
        // Same logic as current createCSVRow (transform-data.ts:85)
        csvRow[header as CSVHeader] = row[i] ?? '';
      }
    }

    return csvRow;
  });
}

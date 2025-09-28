/**
 * Legacy helper functions
 *
 * These functions maintain backward compatibility with the existing
 * transform-data.ts implementation. Extracted from lines 79-90 and 96-106.
 */

import type { CSVHeader, CSVRow } from './types.ts';

/**
 * Creates a type-safe CSV row from headers and values.
 * Handles missing values and provides proper typing.
 *
 * @param headers - Column names
 * @param values - Cell values (may contain undefined)
 * @returns Single typed CSVRow object
 */
export function createCSVRow(headers: CSVHeader[], values: (string | undefined)[]): CSVRow {
  const csvRow: CSVRow = {};

  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    if (header !== undefined) {
      csvRow[header] = values[i] ?? '';
    }
  }

  return csvRow;
}

/**
 * Converts CSVRow to Record<string, string> for legacy functions.
 * Filters out undefined values to maintain string type consistency.
 *
 * @param csvRow - Single CSVRow object
 * @returns Record with string keys and values
 */
export function csvRowToRecord(csvRow: CSVRow): Record<string, string> {
  const record: Record<string, string> = {};

  for (const [key, value] of Object.entries(csvRow)) {
    if (value !== undefined) {
      record[key] = value;
    }
  }

  return record;
}

/**
 * API Contract: @picklist/parser
 *
 * This file defines the type contracts for the CSV parser package.
 * These interfaces must be implemented by the extracted parser functions.
 */

/**
 * Type-safe representation of CSV row data for Dutch food products.
 * Supports multiple column naming conventions (PascalCase, camelCase, snake_case).
 */
export interface CSVRow {
  // Product identification
  ProductId?: string;
  id?: string;
  ID?: string;
  sku?: string;

  // Product details
  ProductName?: string;
  name?: string;
  product_name?: string;

  // Pricing
  PriceRegular?: string;
  price_regular?: string;
  price?: string;
  PriceSale?: string;
  price_sale?: string;

  // Product specifications
  ProductUnitSize?: string;
  size?: string;
  unit?: string;

  // Content
  Ingredients?: string;
  ingredients?: string;

  // Allergens
  ContainedAllergens?: string;
  MayContainAllergens?: string;

  // Categories (dynamic, up to 6 levels)
  Category1?: string;
  Category2?: string;
  Category3?: string;
  Category4?: string;
  Category5?: string;
  Category6?: string;

  // Allow other CSV columns
  [key: string]: string | undefined;
}

/**
 * Result of CSV parsing operation containing headers and data matrix.
 */
export interface ParsedCSVResult {
  /** Column headers from first row */
  headers: string[];
  /** Data rows excluding header (each row is array of cell values) */
  matrix: string[][];
  /** Number of data rows */
  rowCount: number;
}

/**
 * Result of CSVRow to Record conversion for sparsity analysis.
 */
export interface ConversionResult {
  /** Array of records with undefined values filtered out */
  records: Record<string, string>[];
  /** Total number of input rows processed */
  totalRows: number;
  /** Count of undefined fields removed during conversion */
  emptyFieldsFiltered: number;
}

/**
 * Parse CSV text into headers and data matrix.
 *
 * @param csvText - Raw CSV content as string
 * @returns Parsed result with headers, matrix, and row count
 * @throws Error if CSV is malformed or empty
 */
export declare function readCSV(csvText: string): ParsedCSVResult;

/**
 * Convert headers and matrix into typed CSVRow objects.
 *
 * @param headers - Column names from CSV header row
 * @param matrix - Data rows as string arrays
 * @returns Array of typed CSVRow objects
 * @throws Error if headers are empty or matrix is malformed
 */
export declare function createRows(headers: string[], matrix: string[][]): CSVRow[];

/**
 * Convert CSVRow objects to Record format for legacy compatibility.
 * Filters out undefined values to maintain string type consistency.
 *
 * @param csvRows - Array of typed CSVRow objects
 * @returns Conversion result with records and statistics
 */
export declare function convertTypes(csvRows: CSVRow[]): ConversionResult;

/**
 * Legacy helper: Create CSVRow from headers and values (single row).
 * Handles missing values and provides proper typing.
 *
 * @param headers - Column names
 * @param values - Cell values (may contain undefined)
 * @returns Single typed CSVRow object
 */
export declare function createCSVRow(headers: string[], values: (string | undefined)[]): CSVRow;

/**
 * Legacy helper: Convert single CSVRow to Record format.
 * Filters out undefined values to maintain string type consistency.
 *
 * @param csvRow - Single CSVRow object
 * @returns Record with string keys and values
 */
export declare function csvRowToRecord(csvRow: CSVRow): Record<string, string>;

/**
 * Error types that may be thrown by parser functions.
 */
export interface CSVParseError extends Error {
  /** Error type for categorization */
  type: 'EMPTY_CSV' | 'MALFORMED_CSV' | 'MISSING_HEADERS' | 'INVALID_ROW';
  /** Line number where error occurred (if applicable) */
  line?: number;
  /** Column where error occurred (if applicable) */
  column?: string;
}

/**
 * Configuration options for CSV parsing (future extensibility).
 */
export interface CSVParseOptions {
  /** Skip first row as header (default: false, first row contains headers) */
  skipFirstRow?: boolean;
  /** Delimiter character (default: comma) */
  delimiter?: string;
  /** Handle empty cells as empty strings vs undefined (default: empty strings) */
  emptyAsUndefined?: boolean;
}

// Re-export for backward compatibility
export type { CSVRow as CSVRowType };
export type { ParsedCSVResult as CSVParseResult };
export type { ConversionResult as CSVConversionResult };
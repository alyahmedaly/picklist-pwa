# @picklist/parser

A robust CSV parser for Dutch food product data, extracted from the Picklist data transformation pipeline.

## Overview

The `@picklist/parser` package provides type-safe CSV parsing specifically designed for processing Dutch food product datasets. It handles the complexities of real-world CSV data including sparse columns, inconsistent row lengths, and Dutch naming conventions.

## Features

- **Type-safe parsing** with TypeScript interfaces
- **Dutch food product support** with extensive column mapping
- **Robust error handling** with categorized error types
- **Performance optimized** for large datasets (10k+ products)
- **Behavioral identity** with existing transform-data.ts pipeline
- **Legacy compatibility** with existing helper functions

## Installation

```bash
npm install @picklist/parser
```

## Quick Start

```typescript
import { readCSV, createRows } from '@picklist/parser';

const csvText = `ProductId,ProductName,PriceRegular
NL1001,Organic Milk,2.49
NL1002,Whole Wheat Bread,1.99`;

// Parse CSV text into structured data
const parsed = readCSV(csvText);
const rows = createRows(parsed.headers, parsed.matrix);
const { records } = convertTypes(rows);

console.log(records);
// [
//   { ProductId: 'NL1001', ProductName: 'Organic Milk', PriceRegular: '2.49' },
//   { ProductId: 'NL1002', ProductName: 'Whole Wheat Bread', PriceRegular: '1.99' }
// ]
```

## API Reference

### Core Functions

#### `readCSV(csvText: string): ParsedCSVResult`

Parses CSV text into headers and data matrix using the `@std/csv` library.

**Parameters:**

- `csvText` - Raw CSV content as string

**Returns:**

- `ParsedCSVResult` object with headers, matrix, and row count

**Throws:**

- `CSVParseError` for empty/malformed CSV data

```typescript
const result = readCSV(csvText);
console.log(result.headers); // ['ProductId', 'ProductName', 'PriceRegular']
console.log(result.rowCount); // 2
console.log(result.matrix); // [['NL1001', 'Organic Milk', '2.49'], ...]
```

#### `createRows(headers: string[], matrix: string[][]): CSVRow[]`

Converts headers and matrix into typed CSVRow objects with Dutch food product column support.

**Parameters:**

- `headers` - Column names from CSV header row
- `matrix` - Data rows as string arrays

**Returns:**

- Array of `CSVRow` objects

**Throws:**

- `Error` if headers array is empty

```typescript
const rows = createRows(parsed.headers, parsed.matrix);
console.log(rows[0].ProductId); // 'NL1001'
console.log(rows[0].ProductName); // 'Organic Milk'
console.log(rows[0].PriceRegular); // '2.49'
```

#### `convertTypes(csvRows: CSVRow[]): ConversionResult`

Converts CSVRow objects to Record format for legacy compatibility, filtering undefined values.

**Parameters:**

- `csvRows` - Array of typed CSVRow objects

**Returns:**

- `ConversionResult` with records and statistics

```typescript
const { records, totalRows, emptyFieldsFiltered } = convertTypes(rows);
console.log(records); // Array of Record<string, string>
console.log(totalRows); // 2
console.log(emptyFieldsFiltered); // Number of undefined fields removed
```

### Legacy Helper Functions

#### `createCSVRow(headers: string[], row: string[]): CSVRow`

Creates a single CSVRow from headers and data row. Maintains compatibility with existing transform-data.ts usage.

```typescript
import { createCSVRow } from '@picklist/parser';

const csvRow = createCSVRow(['ProductId', 'ProductName'], ['NL1001', 'Milk']);
console.log(csvRow.ProductId); // 'NL1001'
```

#### `csvRowToRecord(csvRow: CSVRow): Record<string, string>`

Converts a CSVRow to a plain Record object, filtering out undefined values.

```typescript
import { csvRowToRecord } from '@picklist/parser';

const record = csvRowToRecord(csvRow);
console.log(record); // { ProductId: 'NL1001', ProductName: 'Milk' }
```

## Type Definitions

### `CSVRow`

Interface representing a row of Dutch food product CSV data with comprehensive column support:

```typescript
interface CSVRow {
  // Primary identifiers
  ProductId?: string;
  id?: string;
  ID?: string;
  sku?: string;

  // Product information
  ProductName?: string;
  name?: string;
  product_name?: string;

  // Pricing
  PriceRegular?: string;
  price_regular?: string;
  price?: string;
  PriceSale?: string;
  price_sale?: string;

  // Physical properties
  ProductUnitSize?: string;
  size?: string;
  unit?: string;

  // Ingredients and allergens
  Ingredients?: string;
  ingredients?: string;
  ContainedAllergens?: string;
  MayContainAllergens?: string;

  // Categories (up to 6 levels)
  Category1?: string;
  Category2?: string;
  Category3?: string;
  Category4?: string;
  Category5?: string;
  Category6?: string;

  // Flexible string indexing for additional columns
  [key: string]: string | undefined;
}
```

### `ParsedCSVResult`

Result of CSV parsing operation:

```typescript
interface ParsedCSVResult {
  headers: string[]; // Column names from first row
  matrix: string[][]; // Data rows as string arrays
  rowCount: number; // Number of data rows (excluding header)
}
```

### `ConversionResult`

Result of type conversion with statistics:

```typescript
interface ConversionResult {
  records: Record<string, string>[]; // Converted data records
  totalRows: number; // Total number of input rows
  emptyFieldsFiltered: number; // Count of undefined fields removed
}
```

### `CSVParseError`

Enhanced error type with categorization:

```typescript
interface CSVParseError extends Error {
  type: 'EMPTY_CSV' | 'MISSING_HEADERS' | 'MALFORMED_CSV';
}
```

## Error Handling

The parser provides robust error handling with categorized error types:

```typescript
try {
  const result = readCSV(csvText);
} catch (error) {
  const csvError = error as CSVParseError;

  switch (csvError.type) {
    case 'EMPTY_CSV':
      console.error('CSV file is empty or contains only whitespace');
      break;
    case 'MISSING_HEADERS':
      console.error('CSV file has no header row');
      break;
    case 'MALFORMED_CSV':
      console.error('CSV format is invalid:', csvError.message);
      break;
  }
}
```

## Dutch Food Product Support

The parser is specifically designed for Dutch food product datasets with comprehensive column mapping:

- **Multiple ID formats**: `ProductId`, `id`, `ID`, `sku`
- **Flexible naming**: `ProductName`, `name`, `product_name`
- **Dutch pricing**: `PriceRegular`, `PriceSale` with EUR currency
- **Ingredient handling**: Support for `Ingredients` and allergen fields
- **Multi-level categories**: Up to 6 category levels for hierarchical classification
- **Unit parsing**: `ProductUnitSize`, `size`, `unit` for product measurements

## Performance

The parser is optimized for large datasets with the following characteristics:

- **Linear performance scaling** - tested up to 10,000 products
- **Memory efficient** - handles sparse data without excessive memory usage
- **Behavioral parity** - maintains performance comparable to @std/csv baseline
- **Deterministic output** - identical input produces identical results

Performance benchmarks (1000 products × 20 columns):

- Parse time: ~50ms
- Memory usage: <10MB
- Scaling factor: ~10x for 10x larger datasets

## Integration Example

Complete integration with data transformation pipeline:

```typescript
import { calculateSparsity } from '@picklist/core';
import { readCSV, createRows, convertTypes } from '@picklist/parser';

async function processProductData(csvText: string) {
  // Parse CSV
  const parsed = readCSV(csvText);
  const rows = createRows(parsed.headers, parsed.matrix);
  const { records } = convertTypes(rows);

  // Analyze sparsity for column filtering
  const sparsity = calculateSparsity(records);
  console.log(`Excluding ${sparsity.emptyColumns.length} sparse columns`);

  // Process each product record
  const products = records.map((record) => ({
    id: record.ProductId || record.id,
    name: record.ProductName || record.name,
    price: parseFloat(record.PriceRegular || record.price || '0'),
    // ... additional processing
  }));

  return products;
}
```

## Migration Guide

If migrating from direct `@std/csv` usage:

### Before:

```typescript
import { parse } from '@std/csv';

const parsedCsv = parse(csvText, { skipFirstRow: false });
const headers = parsedCsv[0] as string[];
const matrix = parsedCsv.slice(1) as string[][];

const records = matrix.map((row) => {
  const record: Record<string, string> = {};
  headers.forEach((header, i) => {
    record[header] = row[i] || '';
  });
  return record;
});
```

### After:

```typescript
import { readCSV, createRows, convertTypes } from '@picklist/parser';

const parsed = readCSV(csvText);
const rows = createRows(parsed.headers, parsed.matrix);
const { records } = convertTypes(rows);
```

## Testing

The package includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run specific test suites
npm test readCSV.contract.test.ts
npm test error-handling.test.ts
npm test performance.test.ts

# Run tests in watch mode
npm test -- --watch
```

Test categories:

- **Contract tests** - Verify function interfaces and behavior
- **Integration tests** - Test compatibility with @picklist/core
- **Error handling tests** - Edge cases and malformed data
- **Performance tests** - Benchmark against baseline implementation
- **Behavioral identity tests** - Ensure output matches transform-data.ts

## Contributing

This package was extracted from the main Picklist transform-data.ts pipeline to enable reusability and better testing. When contributing:

1. Maintain behavioral identity with the original implementation
2. Add comprehensive tests for new functionality
3. Update TypeScript interfaces for new column types
4. Follow the existing code style and conventions

## License

MIT License - see LICENSE file for details.

## Changelog

### 1.0.0 (2025-01-24)

- Initial release
- Extracted CSV parsing logic from transform-data.ts
- Added comprehensive TypeScript interfaces
- Implemented robust error handling
- Added performance optimization for large datasets
- Full test coverage with 54 test cases
- Behavioral identity validation with baseline implementation

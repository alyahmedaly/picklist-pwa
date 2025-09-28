# Data Model: CSV Parser Package

## Core Entities

### CSVRow Interface
**Purpose**: Type-safe representation of Dutch food product CSV data
**Location**: Currently `src/scripts/transform-data.ts:31-73`, will move to `@picklist/parser`

```typescript
interface CSVRow {
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
```

**Fields**:
- All fields are optional strings to handle varying CSV formats
- Index signature allows for additional columns not explicitly defined
- Field naming supports multiple conventions (PascalCase, camelCase, snake_case)

**Validation Rules**:
- No field-level validation (handled by downstream transform pipeline)
- Empty strings are preserved (not converted to undefined)
- Undefined values represent missing columns

**State Transitions**: None (immutable data structure)

### ParsedCSVResult
**Purpose**: Result type for CSV parsing operations
**New Entity**: To be created in `@picklist/parser`

```typescript
interface ParsedCSVResult {
  headers: string[];
  matrix: string[][];
  rowCount: number;
}
```

**Fields**:
- `headers`: Column names from first row of CSV
- `matrix`: Data rows as string arrays (excluding header row)
- `rowCount`: Number of data rows (excluding header)

**Validation Rules**:
- `headers` must be non-empty array
- `matrix` length must equal `rowCount`
- Each row in `matrix` should have same length as `headers` (or be padded)

### ConversionResult
**Purpose**: Result type for CSVRow to Record conversion
**New Entity**: To be created in `@picklist/parser`

```typescript
interface ConversionResult {
  records: Record<string, string>[];
  totalRows: number;
  emptyFieldsFiltered: number;
}
```

**Fields**:
- `records`: Array of string records with undefined values filtered out
- `totalRows`: Total number of input CSVRow objects processed
- `emptyFieldsFiltered`: Count of undefined fields removed during conversion

**Validation Rules**:
- `records` array length must equal `totalRows`
- `emptyFieldsFiltered` must be non-negative integer
- Record values must be non-empty strings (undefined filtered out)

## Entity Relationships

```
CSV Text Input
      ↓
ParsedCSVResult (headers + matrix)
      ↓
CSVRow[] (typed objects)
      ↓
ConversionResult (records for sparsity analysis)
```

**Flow**:
1. Raw CSV text → `readCSV()` → `ParsedCSVResult`
2. `ParsedCSVResult` → `createRows()` → `CSVRow[]`
3. `CSVRow[]` → `convertTypes()` → `ConversionResult`

**Dependencies**:
- `CSVRow` has no dependencies (pure interface)
- `ParsedCSVResult` depends on successful CSV parsing
- `ConversionResult` depends on `CSVRow[]` input

## Integration Contracts

### Sparsity Analysis Integration
The parser must produce data compatible with `calculateSparsity` from `@picklist/core`:

```typescript
// Current integration point in transform-data.ts
const csvData = matrix.map(row => {
  const record: Record<string, string> = {};
  headerCols.forEach((header, i) => {
    record[header] = row[i] || '';
  });
  return record;
});
const sparsity = calculateSparsity(csvData);
```

**Contract**: `convertTypes()` must produce `Record<string, string>[]` format that can be passed directly to `calculateSparsity()`.

### Transform Pipeline Integration
The parser must integrate with existing transform-data.ts workflow:

**Current State**: Inline parsing logic in `runTransform()` function
**Future State**: Import and use parser functions

```typescript
// Before extraction
const parsedCsv = parse(csvText, { skipFirstRow: false });
const headerCols = parsedCsv[0] as string[];
const matrix = parsedCsv.slice(1) as string[][];

// After extraction
import { readCSV, createRows, convertTypes } from '@picklist/parser';
const { headers, matrix } = readCSV(csvText);
const csvRows = createRows(headers, matrix);
const { records } = convertTypes(csvRows);
```

**Contract**: Parser functions must produce identical data structures to current implementation.

## Migration Considerations

### Backward Compatibility
- `CSVRow` interface must remain unchanged
- Helper function signatures must be preserved
- Output data structures must be identical
- Error handling behavior must be maintained

### Performance Characteristics
- In-memory processing model preserved
- Two-pass approach supported
- No additional memory overhead introduced
- Processing time must remain equivalent

### Error Handling
- Malformed CSV → throw descriptive error
- Missing required columns → throw descriptive error
- Unparsable data → throw descriptive error
- No partial outputs on errors

This data model ensures seamless extraction of CSV parsing logic while maintaining all existing functionality and integration points.
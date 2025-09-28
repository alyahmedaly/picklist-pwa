# @picklist/core

Shared utilities, types, and helper functions for the picklist ecosystem.

## Installation

```bash
npm install @picklist/core
```

## Overview

@picklist/core provides essential utilities for data processing, validation, and manipulation within the picklist monorepo. This package contains pure functions without side effects (except for I/O operations) and serves as the foundation for other picklist packages.

## API Reference

### Data Manipulation

#### `mergeDuplicates(products: Product[]): MergeResult`

Merges duplicate products based on name, combining their properties intelligently.

```typescript
import { mergeDuplicates } from '@picklist/core';

const products = [
  { id: '1', name: 'Product A', protein: 10 },
  { id: '2', name: 'Product A', protein: 12 }, // Duplicate name
];

const result = mergeDuplicates(products);
console.log(result.mergedProducts); // 1 product with merged data
console.log(result.duplicatesRemoved); // 1
console.log(result.conflicts); // Array of merge conflicts
```

#### `calculateSparsity(csvData: Record<string, string>[]): SparsityAnalysis`

Analyzes CSV data for column sparsity to identify empty columns for exclusion.

```typescript
import { calculateSparsity } from '@picklist/core';

const csvData = [
  { name: 'Product 1', price: '10', description: '' },
  { name: 'Product 2', price: '20', description: '' },
];

const analysis = calculateSparsity(csvData);
console.log(analysis.emptyColumns); // ['description']
console.log(analysis.sparsityThreshold); // 0.9
```

#### `canonicalOrderProducts(products: Product[]): Product[]`

Sorts products in canonical order (by ID numerically if possible, then by name).

```typescript
import { canonicalOrderProducts } from '@picklist/core';

const products = [
  { id: '2', name: 'B Product' },
  { id: '1', name: 'A Product' },
  { id: '10', name: 'C Product' },
];

const sorted = canonicalOrderProducts(products);
// Result: [{ id: '1', ... }, { id: '2', ... }, { id: '10', ... }]
```

### File I/O

#### `writeJsonl(data: unknown[], outputPath: string): Promise<void>`

Writes data as line-delimited JSON (JSONL) format.

```typescript
import { writeJsonl } from '@picklist/core';

const products = [
  { id: '1', name: 'Product A' },
  { id: '2', name: 'Product B' },
];

await writeJsonl(products, './output/products.jsonl');
```

#### `writeIndexFile(products: Product[], outputPath: string): Promise<void>`

Creates a search-optimized index file with essential product fields.

```typescript
import { writeIndexFile } from '@picklist/core';

await writeIndexFile(products, './output/products-index.json');
```

#### `writeSchemaDoc(schema: Record<string, unknown>, outputPath: string): Promise<void>`

Writes schema documentation as formatted JSON.

```typescript
import { writeSchemaDoc } from '@picklist/core';

const schema = { version: '1.0', fields: ['id', 'name'] };
await writeSchemaDoc(schema, './output/schema.json');
```

### String Processing

#### `normalizeText(text: string): string`

Trims whitespace and converts to lowercase.

```typescript
import { normalizeText } from '@picklist/core';

console.log(normalizeText('  Hello World  ')); // 'hello world'
```

#### `removePlaceholders(text: string): string`

Removes common placeholder values like "NA", "n/a", "null".

```typescript
import { removePlaceholders } from '@picklist/core';

console.log(removePlaceholders('N/A')); // ''
console.log(removePlaceholders('Valid Content')); // 'Valid Content'
```

#### `splitAndTrim(text: string, delimiter: string): string[]`

Splits text by delimiter and trims each element, filtering out empty strings.

```typescript
import { splitAndTrim } from '@picklist/core';

console.log(splitAndTrim('apple, banana, cherry', ','));
// ['apple', 'banana', 'cherry']
```

#### `sanitizeForFilename(text: string): string`

Sanitizes text for safe use as filename by removing invalid characters.

```typescript
import { sanitizeForFilename } from '@picklist/core';

console.log(sanitizeForFilename('Product: Data/Report'));
// 'product-data-report'
```

### Validation

#### `validateProduct(product: Partial<Product>): { isValid: boolean; errors: string[] }`

Validates product data for required fields and structure.

```typescript
import { validateProduct } from '@picklist/core';

const product = { id: 'test-1', name: 'Test Product', categories: [] };
const result = validateProduct(product);

if (!result.isValid) {
  console.log('Validation errors:', result.errors);
}
```

#### `validateNutrition(nutrition: Partial<NutritionInfo>): { isValid: boolean; errors: string[] }`

Validates nutrition information for reasonable ranges and types.

```typescript
import { validateNutrition } from '@picklist/core';

const nutrition = { energy: -50, protein: 8.5 }; // Invalid: negative energy
const result = validateNutrition(nutrition);
console.log(result.errors); // ['Energy must be a non-negative number']
```

#### `isValidSemver(version: string): boolean`

Validates semantic version string format.

```typescript
import { isValidSemver } from '@picklist/core';

console.log(isValidSemver('1.0.0')); // true
console.log(isValidSemver('v1.0.0')); // false
```

#### `isValidPackageName(name: string): boolean`

Validates @picklist/\* package name format.

```typescript
import { isValidPackageName } from '@picklist/core';

console.log(isValidPackageName('@picklist/core')); // true
console.log(isValidPackageName('@other/core')); // false
```

### Nutrition Utilities

#### `extractNutritionValue(nutrition: NutritionInfo, field: keyof NutritionInfo): number | undefined`

Safely extracts numeric nutrition values.

```typescript
import { extractNutritionValue } from '@picklist/core';

const nutrition = { energy: 150, protein: 8.5, perServing: false };
const protein = extractNutritionValue(nutrition, 'protein'); // 8.5
```

#### `hasRequiredNutrition(nutrition: NutritionInfo): boolean`

Checks if nutrition info contains all required fields.

```typescript
import { hasRequiredNutrition } from '@picklist/core';

const nutrition = {
  energy: 150,
  protein: 8.5,
  carbohydrates: 12,
  fat: 6.2,
  perServing: false,
};

console.log(hasRequiredNutrition(nutrition)); // true
```

### Type Constructors

#### `createProduct(data: Partial<Product>): Product`

Creates a complete Product object with default values.

```typescript
import { createProduct } from '@picklist/core';

const product = createProduct({
  id: 'test-1',
  name: 'Test Product',
});
// Returns Product with all required fields filled with defaults
```

#### `createNutritionInfo(data: Partial<NutritionInfo>): NutritionInfo`

Creates a complete NutritionInfo object with default values.

```typescript
import { createNutritionInfo } from '@picklist/core';

const nutrition = createNutritionInfo({
  energy: 150,
  protein: 8.5,
});
// Returns NutritionInfo with defaults for missing fields
```

## Package Scope

### Included

- Pure utility functions
- Type definitions and interfaces
- String processing utilities
- Basic validation functions
- File I/O operations
- Data manipulation helpers

### Excluded

- Parsing logic (parseIngredients, parseAllergens) → `@picklist/parser`
- Complex scoring algorithms → `@picklist/scoring`
- UI components → `@picklist/web`
- Database operations → `@picklist/database`
- CLI tools → `@picklist/cli`

## Performance

- **Import time**: <10ms
- **Memory usage**: Optimized for large datasets (1000+ products)
- **Deterministic**: Identical input produces identical output
- **Pure functions**: No side effects except I/O operations

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import {
  Product,
  NutritionInfo,
  SparsityAnalysis,
  MergeResult,
  ParsedIngredients,
  ParsedAllergens,
  AdditiveInfo,
  Price,
} from '@picklist/core';
```

## Contributing

This package is part of the picklist monorepo. See the main repository for contributing guidelines.

## License

See LICENSE in the repository root.

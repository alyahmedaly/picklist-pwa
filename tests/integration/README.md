# Integration Testing Guide

This document explains how to write and maintain integration tests for the CSV → JSONL product transformer.

## Overview

Integration tests validate the complete transformation pipeline from CSV input to final output files. They test the entire system working together, including data parsing, transformation logic, classification, and output generation.

## Race-Condition-Free Architecture

### The Problem We Solved
Previously, integration tests suffered from race conditions because multiple tests ran `runTransformForTest()` in parallel, all writing to the same `out-test/` directory. This caused:
- Flaky test failures
- File system contention
- Non-deterministic results
- Slow execution due to redundant transforms

### The Solution: Pre-Computed Fixture Approach

We now use a **"build once, test many"** pattern:

```
Real Production Data Pipeline:
data/2024-10-23.csv → grep → integration-real-data.csv → transform → integration-output/
                                      ↓
                      [9 curated real products]
                                      ↓
npm run pretest → scripts/build-integration-fixture.js
                                      ↓
tests/fixtures/integration-output/
├── products.jsonl         # Pre-computed products
├── stats.json            # Pre-computed statistics
├── products-index.json   # Pre-computed index
└── schema.md            # Pre-computed schema
```

## How to Write Integration Tests

### ✅ Modern Approach (Race-Free)

Use the shared integration fixture for all new tests:

```typescript
import { describe, test, expect } from 'vitest';
import { readIntegrationProducts, readIntegrationStats } from '../test-utils';
import type { Product } from '../../src/data/transform/types';

describe('My Integration Test', () => {
  test('validates transform behavior', () => {
    // Read from pre-computed fixture (no race conditions)
    const products = readIntegrationProducts() as Product[];
    const stats = readIntegrationStats() as { myCounter: number };

    // Test your logic
    expect(products.length).toBeGreaterThan(0);
    expect(stats.myCounter).toBeGreaterThanOrEqual(0);
  });
});
```

### ❌ Legacy Approach (Race-Prone)

**Do not use this pattern for new tests:**

```typescript
// DON'T DO THIS - causes race conditions
import { runTransformForTest } from '../test-utils';
import fs from 'node:fs';

test('legacy pattern', async () => {
  await runTransformForTest({ fixture: 'sample-nl.csv' }); // Race condition!
  const products = JSON.parse(fs.readFileSync('out-test/products.jsonl', 'utf8')); // File contention!
});
```

## Available Test Utilities

### Core Functions

```typescript
// Read pre-computed products (eliminates race conditions)
readIntegrationProducts(): unknown[]

// Read pre-computed statistics
readIntegrationStats(): unknown

// Read pre-computed index
readIntegrationIndex(): unknown
```

### Integration Fixture Contents

Our `integration-real-data.csv` contains **9 carefully selected real products** covering:

- **E-numbers**: E300, E270, E330, E223, E100, etc.
- **Dutch allergens**: Lupine (Dutch-only allergen)
- **Food classification**: Bakery, dairy, household items
- **Nutritional profiles**: Complete nutrition data for 7 products
- **Added sugars**: Products with "Waarvan toegevoegde suikers" patterns
- **Various categories**: Food vs non-food classification scenarios

## Pre-Test Setup

The `npm run pretest` command automatically:

1. Extracts real production data via `scripts/build-integration-fixture.js`
2. Transforms it once to `tests/fixtures/integration-output/`
3. Makes results available to all integration tests

**This happens automatically** - you don't need to call it manually.

## Test Categories by Conversion Status

### ✅ Race-Free Tests (Converted)
These tests use the shared integration fixture:
- `additives.integration.test.ts` - E-number analysis
- `allergens.nl-only.test.ts` - Dutch allergen counting
- `added-sugars.nl.test.ts` - Added sugar extraction
- `decimal-comma.test.ts` - Decimal comma normalization
- `classify.food-positive-nl.test.ts` - Food classification
- `classify.household-vs-food.test.ts` - Food vs non-food
- `nutritional-stats.test.ts` - Statistics validation
- `nutritional-tags-pipeline.test.ts` - Nutritional tagging
- `schema.nutritional-tags.test.ts` - Schema validation
- `schema.localization-section.test.ts` - Localization docs
- `stats.localization.test.ts` - Dutch localization statistics

### ✅ Legacy Tests (All Converted!)
**All legacy tests have been successfully converted to the race-free approach.** 🎉

### ✅ Specialized Tests (Keep As-Is)
These have specific requirements and use appropriate fixtures:
- `transform-small-fixture.test.ts` - Uses temp directories (deterministic)
- Performance tests - May use dedicated fixtures

## Adding New Test Data

### When to Update the Integration Fixture

When creating or updating integration tests, you may need to add more products to our fixture. This is necessary when:
- Testing new features that require specific product patterns
- Validating edge cases not covered by current data
- Converting legacy tests that expect particular product characteristics

### How to Update `integration-real-data.csv`

**⚠️ Important**: Always use `grep` to extract data from `data/2024-10-23.csv` - never read the entire file as it's huge (30K+ lines) and may cause memory issues.

```bash
# Find products with specific patterns
grep -i "pattern" data/2024-10-23.csv | head -5

# Extract by product ID (most common)
grep -E "^(123|456|789)," data/2024-10-23.csv >> temp-products.csv

# Find products with specific categories
grep -i "category" data/2024-10-23.csv | head -3

# Find products with E-numbers
grep -i "E[0-9][0-9][0-9]" data/2024-10-23.csv | head -2
```

### Adding Products to the Fixture

**⚠️ Critical**: Always **append** to existing fixture - never replace it completely. Removing existing data will break other tests.

1. **Add specific products** using grep patterns:
   ```bash
   # ✅ APPEND to existing fixture (preserves existing tests)
   grep -E "^(productId1|productId2)," data/2024-10-23.csv >> tests/fixtures/integration-real-data.csv

   # ❌ DON'T replace - this breaks existing tests
   # head -1 data/2024-10-23.csv > tests/fixtures/integration-real-data.csv
   ```

2. **Check for duplicates** (optional but recommended):
   ```bash
   # Remove duplicate lines while preserving order
   awk '!seen[$0]++' tests/fixtures/integration-real-data.csv > temp.csv
   mv temp.csv tests/fixtures/integration-real-data.csv
   ```

3. **Regenerate fixture**:
   ```bash
   npm run pretest  # Rebuilds integration-output/
   ```

4. **Test impact**:
   ```bash
   npm test  # Some existing tests may break - this is expected!
   ```

### Expected Test Breakage

**This is normal and beneficial!** When you add new products to the fixture:

- ✅ **Tests may break** - this reveals gaps in our test assumptions
- ✅ **Exact counts change** - statistics will reflect new data
- ✅ **New edge cases surface** - helps improve test robustness

**How to handle broken tests:**
1. Update assertions to be more flexible (`toBeGreaterThan(0)` vs exact counts)
2. Fix tests that made incorrect assumptions about data
3. Improve test logic to handle real-world data variety

### Example: Adding Products for E-Number Testing

```bash
# Don't do this - reads entire file
# cat data/2024-10-23.csv | grep "E220"  ❌

# Don't do this - replaces existing fixture (breaks other tests)
# head -1 data/2024-10-23.csv > new-fixture.csv  ❌

# ✅ Do this - append to existing fixture
grep -i "E220" data/2024-10-23.csv | head -2 >> tests/fixtures/integration-real-data.csv
grep -i "E100" data/2024-10-23.csv | head -2 >> tests/fixtures/integration-real-data.csv

# Optional: Remove duplicates while preserving existing data
awk '!seen[$0]++' tests/fixtures/integration-real-data.csv > temp.csv
mv temp.csv tests/fixtures/integration-real-data.csv

# Regenerate and test
npm run pretest
npm test
```

## Writing Meaningful Integration Tests

### Focus on Product Features, Not Infrastructure

Integration tests should validate **actual business value and user-facing functionality**, not internal implementation details or infrastructure concerns.

#### ✅ Good Integration Tests
```typescript
// Tests actual product feature: E-number analysis for food safety
test('identifies allergens in Dutch products for consumer warnings', () => {
  const products = readIntegrationProducts() as Product[];
  const roomkaas = products.find(p => p.name.includes('Roomkaas'));

  // Business value: Consumer can see allergen warnings
  expect(roomkaas?.additiveFlags?.containsAllergenicAdditives).toBe(true);
  expect(roomkaas?.additiveInfo?.eNumbers).toContain('E223'); // Sulfite
});

// Tests actual user feature: Food classification for filtering
test('correctly classifies household vs food products for user filtering', () => {
  const products = readIntegrationProducts() as Product[];

  const foodProducts = products.filter(p => p.flags?.isFood);
  const householdProducts = products.filter(p => !p.flags?.isFood);

  // Business value: Users can filter by product type
  expect(foodProducts.length).toBeGreaterThan(0);
  expect(householdProducts.length).toBeGreaterThan(0);
});
```

#### ❌ Avoid Infrastructure Fluff
```typescript
// Bad - tests file structure, not business value
test('stats.json exists and is valid JSON', () => {
  const stats = readIntegrationStats();
  expect(typeof stats).toBe('object');
  expect(stats).not.toBeNull();
});

// Bad - tests implementation details, not user value
test('products have duplicate_conflicts array field', () => {
  const products = readIntegrationProducts() as Product[];
  products.forEach(p => {
    expect(Array.isArray(p.duplicate_conflicts)).toBe(true);
  });
});

// Bad - tests data types instead of business logic
test('all counters are numbers', () => {
  const stats = readIntegrationStats() as any;
  expect(typeof stats.totalRows).toBe('number');
  expect(typeof stats.nutritionalTagsComputed).toBe('number');
});
```

### Test User-Facing Features

Ask: **"What value does this provide to end users?"**

#### Product Features Worth Testing:
- **Food Safety**: E-number analysis, allergen warnings, additive classification
- **Dietary Information**: Nutritional tags, vegan/gluten-free identification
- **Search & Filtering**: Product classification, category detection
- **Data Quality**: Accurate parsing of Dutch ingredients, price normalization
- **Localization**: Dutch language support, decimal comma handling

#### Infrastructure Concerns to Avoid:
- File formats and JSON structure
- Internal field names and data types
- Implementation-specific counters
- Determinism of identical inputs (should be unit tested)
- Memory usage or performance metrics (belongs in perf tests)

### Make Tests Actionable

Each test should validate something that:
1. **Users care about** - affects their experience
2. **Could realistically break** - represents a real failure mode
3. **Has clear business impact** - missing feature vs missing field

#### ✅ Actionable Test
```typescript
test('Dutch added sugars extraction enables nutrition filtering', () => {
  const products = readIntegrationProducts() as Product[];

  // Business value: Users can filter by added sugar content
  const withAddedSugars = products.filter(p =>
    typeof p.addedSugarsPer100 === 'number' && p.addedSugarsPer100 > 0
  );

  expect(withAddedSugars.length).toBeGreaterThan(0);
  // Validates real Dutch parsing works for user filtering
});
```

#### ❌ Non-Actionable Test
```typescript
test('stats include all expected field names', () => {
  const stats = readIntegrationStats() as any;
  const expectedFields = ['totalRows', 'mergedDuplicates', 'nullRates'];

  expectedFields.forEach(field => {
    expect(stats).toHaveProperty(field);
  });
  // Tests implementation details, not user value
});
```

## Best Practices

### 1. Use Type Assertions
```typescript
const products = readIntegrationProducts() as Product[];
const stats = readIntegrationStats() as { myField: number };
```

### 2. Test Real Data Patterns
Since our fixture uses real production data, test realistic scenarios:
```typescript
// Good - tests realistic product distribution
const householdProducts = products.filter(p =>
  p.categories.some(cat => cat.includes('Huishouden'))
);
expect(householdProducts.length).toBeGreaterThan(0);
```

### 3. Cross-Validate Statistics
Verify statistics against actual product data:
```typescript
const productsWithTags = products.filter(p => p.nutritionalTags);
expect(stats.nutritionalTagsComputed).toBe(productsWithTags.length);
```

### 4. Use Flexible Assertions
Our fixture has specific data, so use flexible expectations:
```typescript
// Good - flexible with real data
expect(stats.veganProducts).toBeGreaterThanOrEqual(0);

// Avoid - too specific for real data
expect(stats.veganProducts).toBe(42);
```

## Converting Legacy Tests

To convert a legacy test using `runTransformForTest`:

1. **Replace imports**:
   ```typescript
   // Before
   import { runTransformForTest } from '../test-utils';
   import fs from 'node:fs';

   // After
   import { readIntegrationProducts, readIntegrationStats } from '../test-utils';
   ```

2. **Replace transform calls**:
   ```typescript
   // Before
   await runTransformForTest({ fixture: 'sample-nl.csv' });
   const stats = JSON.parse(fs.readFileSync('out-test/stats.json', 'utf8'));

   // After
   const stats = readIntegrationStats() as { myField: number };
   ```

3. **Update test expectations** to work with our specific fixture data

4. **Remove async/await** since fixture reading is synchronous

## Benefits of This Approach

- ✅ **No Race Conditions**: Each test reads from shared, immutable fixture
- ⚡ **Much Faster**: Single transform per test suite instead of N transforms
- 📊 **Real Data**: Tests validate against actual production data patterns
- 🔒 **Deterministic**: Pre-computed results are always identical
- 🧹 **Cleaner**: No temporary files or cleanup needed
- 🎯 **Reliable**: 100% consistent test results

## Troubleshooting

### Test Failing After Conversion?
1. Check if the required data exists in our fixture
2. Use flexible assertions (`toBeGreaterThan(0)` vs exact counts)
3. Verify product IDs exist in our curated dataset

### Need Additional Test Data?
1. Add products to `integration-real-data.csv` using production data
2. Update `scripts/build-integration-fixture.js` if needed
3. Run `npm run pretest` to regenerate fixture

### Performance Issues?
- Integration tests should be fast (~200ms total)
- If slow, check if test is using legacy `runTransformForTest`

## Summary

**For all new integration tests**: Use the race-free shared fixture approach with `readIntegrationProducts()` and `readIntegrationStats()`. This ensures fast, reliable, deterministic tests with real production data.

## Quick Reference Checklist

### ✅ Creating a New Integration Test

**Before you start:**
- [ ] **Business Value Check**: Does this test validate a user-facing feature?
- [ ] **Feature Gap**: Is this functionality not already covered by existing tests?
- [ ] **Integration Scope**: Does this require testing the full transform pipeline?

**Test setup:**
- [ ] Use modern imports: `import { readIntegrationProducts, readIntegrationStats } from '../test-utils'`
- [ ] Avoid legacy imports: ~~`runTransformForTest`~~, ~~`fs`~~
- [ ] Check if current fixture data supports your test (see Troubleshooting below)

**Writing the test:**
- [ ] **Test name describes user value**: `'enables nutrition filtering'` not `'has nutritional fields'`
- [ ] **Focus on business logic**: What can users do with this feature?
- [ ] **Use flexible assertions**: `toBeGreaterThan(0)` rather than exact counts
- [ ] **Type your data**: `as Product[]` or `as { myField: number }`
- [ ] **Avoid infrastructure fluff**: No JSON structure, field existence, or data type tests

**Example pattern:**
```typescript
test('feature enables user capability', () => {
  const products = readIntegrationProducts() as Product[];
  // Test business logic that affects users
  expect(products.filter(p => userRelevantCondition)).toBeGreaterThan(0);
});
```

### ✅ Adding Test Data (When Current Fixture Isn't Enough)

**Data extraction:**
- [ ] **Use grep patterns**: Never read entire `data/2024-10-23.csv` file
- [ ] **Identify specific products**: Find by ID, category, or content pattern
- [ ] **Limit results**: Use `head -N` to avoid excessive data

**Safe fixture update:**
- [ ] **Always append**: Use `>>` not `>` to preserve existing data
- [ ] **Never replace fixture**: Existing tests depend on current products
- [ ] **Check for duplicates**: Use `awk '!seen[$0]++'` if needed

**Commands:**
```bash
# ✅ Safe: Append new products
grep -E "^(123|456)," data/2024-10-23.csv >> tests/fixtures/integration-real-data.csv

# ❌ Dangerous: Replace fixture
# grep pattern data/2024-10-23.csv > tests/fixtures/integration-real-data.csv
```

**After updating fixture:**
- [ ] **Regenerate**: Run `npm run pretest`
- [ ] **Test impact**: Run `npm test` (some tests may break - this is good!)
- [ ] **Fix broken tests**: Update assertions to handle new data variety

### ✅ Converting Legacy Tests

**Identify legacy patterns:**
- [ ] Uses `runTransformForTest({ fixture: 'sample-nl.csv' })`
- [ ] Reads files with `fs.readFileSync('out-test/...')`
- [ ] Has `async` test functions with `await`

**Conversion steps:**
1. [ ] **Update imports**: Replace `runTransformForTest` and `fs` with fixture utilities
2. [ ] **Replace transform calls**: `runTransformForTest()` → `readIntegrationProducts()`
3. [ ] **Replace file reads**: `fs.readFileSync('out-test/stats.json')` → `readIntegrationStats()`
4. [ ] **Remove async**: Tests are now synchronous
5. [ ] **Update assertions**: Handle real data variety with flexible expectations
6. [ ] **Test with new fixture**: Verify test passes with real production data

### ✅ Pre-Submit Checklist

**Code quality:**
- [ ] **No race conditions**: Uses shared fixture, not `runTransformForTest`
- [ ] **Tests user value**: Focuses on business features, not infrastructure
- [ ] **Clean code**: Proper TypeScript types, clear test names
- [ ] **No fluff**: Avoids testing JSON structure, field existence, data types

**Verification:**
- [ ] **Test passes**: `npm test path/to/your/test.ts`
- [ ] **Integration test suite passes**: `npm test tests/integration/`
- [ ] **Fast execution**: Test completes quickly (no transform overhead)

**Documentation:**
- [ ] **Clear test name**: Describes what user capability is being validated
- [ ] **Comments explain business value**: Why this test matters to users
- [ ] **Update this guide**: If you discovered new patterns or edge cases

### ❌ Common Pitfalls to Avoid

- **Using exact counts**: Real data changes, use `toBeGreaterThan(0)`
- **Testing infrastructure**: JSON validity, field types, file structure
- **Legacy patterns**: `runTransformForTest`, `out-test/` file reads
- **Replacing fixture**: Always append, never replace existing data
- **Reading entire data file**: Use targeted grep patterns
- **Async when unnecessary**: Fixture reading is synchronous

### 🆘 Troubleshooting

**Test failing after conversion?**
1. Check if required data exists in fixture: `grep "pattern" tests/fixtures/integration-real-data.csv`
2. Use flexible assertions instead of exact matches
3. Verify product IDs exist in our curated dataset

**Need different test data?**
1. Add products to fixture using append (`>>`) pattern above
2. Run `npm run pretest` to regenerate
3. Update test assertions to handle new data variety

**Test too slow?**
- Likely using legacy `runTransformForTest` - convert to fixture approach
- Should complete in ~1ms, not hundreds of milliseconds
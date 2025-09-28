# Quickstart: Kysely Migration Validation

**Date**: 2025-01-27
**Feature**: 020-migration-kysely
**Purpose**: Rapid validation guide for Kysely migration implementation

## Prerequisites

### Environment Setup
```bash
# Ensure Kysely is available (already installed)
npm list kysely  # Should show v0.28.7

# Verify existing flexible database works
npm test -- --grep "flexible-database"

# Check feature flags are set
echo $FLEX_SCHEMA_ENABLE_SEARCH  # Should be true/false
echo $FLEX_SCHEMA_INDEX_TIER     # Should be full/core/min
```

### Database State Verification
```bash
# Generate test database
node src/scripts/transform-data.ts --input tests/fixtures/sample-small.csv --outDir out-test --generate-flexible-schema

# Verify tables exist
sqlite3 out-test/products-flexible.db ".tables"
# Expected: products, categories, product_categories, product_nutrition, product_flags, product_scores, product_additives, [product_search_terms]

# Check record counts
sqlite3 out-test/products-flexible.db "SELECT COUNT(*) FROM products;"
```

## Phase 1: Direct Migration Implementation

### 1. Kysely Connection Setup
**Objective**: Establish Kysely instance to replace existing raw SQL queries

```typescript
// Test: Can create Kysely instance
import { createKyselyInstance } from '../src/db/kysely/connection.js';

const kysely = await createKyselyInstance();
expect(kysely).toBeDefined();
```

**Validation Commands**:
```bash
# Run connection test
npm test -- --grep "kysely-connection"

# Verify no regression in existing queries
npm test -- tests/contract/DatabaseSchema.contract.test.ts
```

### 2. Basic Query Migration
**Objective**: Migrate simplest query (product count) to Kysely

```typescript
// Test: Product count with Kysely
const kyselyCount = await kysely.selectFrom('products').select(eb => eb.fn.count('id').as('count')).executeTakeFirst();
const expectedCount = 30498; // From schema baseline

expect(kyselyCount.count).toBe(expectedCount);
```

**Validation Commands**:
```bash
# Run parity test for basic queries
npm test -- --grep "parity-basic"

# Performance check (should be neutral)
time npm test -- tests/integration/BasicQueries.test.ts
```

## Phase 2: Repository Pattern

### 3. Product Repository Implementation
**Objective**: Create `ProductRepository` with core query methods

```typescript
// Test: Repository basic functionality
import { ProductRepository } from '../src/db/repositories/ProductRepository.js';

const repo = new ProductRepository(kysely);
const products = await repo.queryProducts({ limit: 10 });

expect(products.data).toHaveLength(10);
expect(products.metadata.queryTimeMs).toBeGreaterThan(0);
```

**Validation Commands**:
```bash
# Test repository functionality
npm test -- tests/contract/ProductRepository.contract.test.ts

# Verify hook integration works
npm test -- tests/integration/HookIntegration.test.ts
```

### 4. Complex Query Migration
**Objective**: Migrate multi-table joins and filtering

```typescript
// Test: Complex filtering with Kysely
const criteria = {
  nutrition: { protein: { min: 20 } },
  flags: { isHalal: true },
  limit: 5
};

const kyselyResult = await repo.queryProducts(criteria);

expect(kyselyResult.data).toHaveLength(5);
expect(kyselyResult.data.every(p => p.nutrition?.protein >= 20)).toBe(true);
expect(kyselyResult.metadata.multiDimensionalFiltering).toBe(true);
```

**Validation Commands**:
```bash
# Run comprehensive parity suite
npm test -- tests/parity/

# Check performance hasn't regressed
npm run test:performance -- --baseline
```

## Phase 3: Feature Flag Validation

### 5. Search Functionality Testing
**Objective**: Verify conditional search behavior

```bash
# Test with search enabled
FLEX_SCHEMA_ENABLE_SEARCH=true npm test -- --grep "search"

# Test with search disabled
FLEX_SCHEMA_ENABLE_SEARCH=false npm test -- --grep "search-disabled"
```

```typescript
// Test: Search availability detection
import { isSearchAvailable } from '../src/db/repositories/SearchRepository.js';

if (process.env.FLEX_SCHEMA_ENABLE_SEARCH === 'true') {
  expect(isSearchAvailable()).toBe(true);
} else {
  expect(isSearchAvailable()).toBe(false);
}
```

### 6. Index Tier Compatibility
**Objective**: Ensure queries work across all index tiers

```bash
# Test minimal indexes
FLEX_SCHEMA_INDEX_TIER=min npm test -- tests/integration/

# Test core indexes (default)
FLEX_SCHEMA_INDEX_TIER=core npm test -- tests/integration/

# Test full indexes
FLEX_SCHEMA_INDEX_TIER=full npm test -- tests/integration/
```

## Phase 4: Integration Validation

### 7. React Hook Integration
**Objective**: Verify hooks work with new repository layer

```typescript
// Test: Hook behavior unchanged
import { renderHook, waitFor } from '@testing-library/react';
import { useFlexibleProducts } from '../src/hooks/useFlexibleProductQueries.js';

const { result } = renderHook(() => useFlexibleProducts({ limit: 5 }));

await waitFor(() => expect(result.current.isLoading).toBe(false));
expect(result.current.data).toHaveLength(5);
```

**Validation Commands**:
```bash
# Test all hooks
npm test -- tests/contract/hooks/

# Verify TypeScript compilation
npm run typecheck
```

### 8. Bundle Size Verification
**Objective**: Ensure bundle size increase is within limits

```bash
# Build and measure bundle size
npm run build

# Analyze bundle composition (optional - install if needed)
# npm install --save-dev vite-bundle-analyzer
# npx vite-bundle-analyzer dist/

# Basic bundle size check
echo "Bundle size check:"
du -h dist/assets/*.js | sort -hr

# Compare with baseline (should be <25KB increase)
# Use source-map-explorer if available: npm install --save-dev source-map-explorer
# npx source-map-explorer dist/assets/*.js
```

## Phase 5: Performance & Regression Testing

### 9. Performance Benchmarking
**Objective**: Verify no performance regressions

```bash
# Run performance benchmarks
npm run test:performance

# Compare query execution times
npm test -- tests/performance/QueryBenchmarks.test.ts --verbose
```

**Expected Results**:
- Query performance within 10% of baseline
- Memory usage unchanged
- Bundle size increase <25KB gzipped

### 10. End-to-End Validation
**Objective**: Comprehensive system test

```bash
# Full test suite
npm test

# Build and verify production bundle
npm run build && npm run preview

# Test with production database
FLEX_SCHEMA_ENABLE_SEARCH=true FLEX_SCHEMA_INDEX_TIER=core npm run transform:production
```

## Rollback Procedure

If any validation step fails:

```bash
# 1. Stop migration immediately
git stash  # Save work in progress

# 2. Return to pre-migration state
git checkout $(git describe --tags --abbrev=0 pre-kysely-migration)

# 3. Verify system works
npm test && npm run build

# 4. Document failure reason
echo "Migration failed at: [STEP]" >> migration-log.md
echo "Failure reason: [REASON]" >> migration-log.md

# 5. Reset and plan fix
git checkout 020-migration-kysely
git reset --hard HEAD~1  # If needed
```

## Success Criteria Checklist

- [ ] ✅ All parity tests pass (100% identical results)
- [ ] ✅ Performance within 10% of baseline
- [ ] ✅ Bundle size increase <25KB gzipped
- [ ] ✅ Feature flags work correctly (search enabled/disabled)
- [ ] ✅ All index tiers supported (min/core/full)
- [ ] ✅ React hooks maintain identical interfaces
- [ ] ✅ TypeScript compilation with zero errors
- [ ] ✅ All existing contract tests pass
- [ ] ✅ Production build succeeds
- [ ] ✅ End-to-end validation passes

## Troubleshooting Common Issues

### Query Result Differences
```bash
# Debug parity test failures
npm test -- --grep "parity" --verbose

# Compare raw SQL outputs
sqlite3 out-test/products-flexible.db < debug-query.sql > legacy-output.txt
# Then compare with Kysely output
```

### Performance Regressions
```bash
# Profile query execution
npm test -- tests/performance/ --detectSlowQueries

# Check for missing indexes
EXPLAIN QUERY PLAN your-slow-query
```

### Bundle Size Issues
```bash
# Analyze bundle composition (install if needed)
# npm install --save-dev webpack-bundle-analyzer
# npx webpack-bundle-analyzer dist/

# Check for unused imports (install if needed)
# npm install --save-dev unimported
# npx unimported

# Basic bundle analysis with built-in tools
ls -lh dist/assets/
```

### Type Safety Issues
```bash
# Strict TypeScript check
npx tsc --noEmit --strict

# Check for any type assertions
grep -r "as " src/ | grep -v test
```

---

**Quickstart Status**: ✅ COMPLETE
**Estimated Completion Time**: 2-3 hours for full validation
**Prerequisites**: All phases pass before production deployment
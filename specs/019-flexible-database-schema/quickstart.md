# Quickstart: Flexible Database Schema

**Feature**: 019-flexible-database-schema
**Date**: 2025-09-22
**Purpose**: Step-by-step guide to validate the flexible database schema implementation

## Prerequisites

- Node.js 18+ installed
- Repository cloned and dependencies installed (`npm ci`)
- Access to sample CSV data file (data/2024-10-23.csv)
- SQLite3 CLI tools installed (optional, for manual validation)

## Quick Validation Steps

### 1. Generate New Schema Database (2 minutes)

```bash
# Transform sample data with new flexible schema
node src/scripts/transform-data.ts \
  --input tests/fixtures/sample-small.csv \
  --outDir out \
  --log human \
  --generate-flexible-schema

# Expected output:
# ✅ Schema generated: out/products-flexible.db
# ✅ Schema validation: 8 tables created
# ✅ Index validation: 25 indexes created
# ✅ Sample data: 100 products inserted
```

### 2. Validate Schema Structure (30 seconds)

```bash
# Check database schema
sqlite3 out/products-flexible.db ".schema" | head -20

# Expected: Table definitions matching contracts/database-schema.sql
# Verify core tables exist:
# - products, categories, product_categories
# - product_nutrition, product_flags, product_scores
# - product_additives, product_search_terms
```

### 3. Test Basic Queries (1 minute)

```bash
# Test 1: Basic product count
sqlite3 out/products-flexible.db "SELECT COUNT(*) FROM products;"
# Expected: > 0 products

# Test 2: Nutrition data integrity
sqlite3 out/products-flexible.db "
  SELECT COUNT(*) as products_with_nutrition
  FROM product_nutrition
  WHERE protein IS NOT NULL;"
# Expected: > 0 products with nutrition data

# Test 3: Category hierarchy
sqlite3 out/products-flexible.db "
  SELECT name, depth, product_count
  FROM categories
  WHERE depth <= 2
  ORDER BY depth, name
  LIMIT 10;"
# Expected: Hierarchical categories with product counts
```

### 4. Test Multi-dimensional Filtering (2 minutes)

```bash
# Test complex filter query (Ali's common pattern)
sqlite3 out/products-flexible.db "
  SELECT
    p.name,
    p.price_regular,
    pn.protein,
    c.name as category
  FROM products p
  LEFT JOIN product_nutrition pn ON p.id = pn.product_id
  LEFT JOIN product_categories pc ON p.id = pc.product_id AND pc.is_primary = TRUE
  LEFT JOIN categories c ON pc.category_id = c.id
  WHERE EXISTS (
    SELECT 1 FROM product_flags pf
    WHERE pf.product_id = p.id
      AND pf.flag_type = 'is_halal'
      AND pf.flag_value = TRUE
  )
  AND pn.protein >= 15
  AND p.price_regular <= 5.0
  ORDER BY pn.protein DESC
  LIMIT 10;"

# Expected: Products matching all criteria, sorted by protein content
```

### 5. Performance Validation (1 minute)

```bash
# Test query performance with timing
sqlite3 out/products-flexible.db "
  .timer ON
  EXPLAIN QUERY PLAN
  SELECT COUNT(*)
  FROM products p
  JOIN product_flags pf ON p.id = pf.product_id
  WHERE pf.flag_type = 'is_halal' AND pf.flag_value = TRUE;
  .timer OFF"

# Expected: Query plan shows index usage (USING INDEX)
# Expected: Execution time < 50ms for sample data
```

## Frontend Integration Test (3 minutes)

### 1. Load Database in Browser

```bash
# Start development server
npm run dev

# Open browser console and test WASM loading:
```

```javascript
// Browser console test
const db = await window.loadFlexibleDatabase();
console.log('Database loaded:', db);

// Test basic query
const products = await db.query(`
  SELECT id, name, price_regular
  FROM products
  LIMIT 5
`);
console.log('Sample products:', products);
```

### 2. Test Filter Components

```bash
# Navigate to localhost:3000 in browser
# Open developer tools
# Test filter interactions in UI:
# - Category dropdown should populate from categories table
# - Dietary flags should filter using product_flags table
# - Price slider should use indexed price_regular column
# - Search should use product_search_terms table
```

### 3. Validate Performance

```javascript
// Browser console performance test
const startTime = performance.now();
const results = await db.query(`
  SELECT p.*, pn.protein, c.name as category
  FROM products p
  LEFT JOIN product_nutrition pn ON p.id = pn.product_id
  LEFT JOIN product_categories pc ON p.id = pc.product_id AND pc.is_primary = TRUE
  LEFT JOIN categories c ON pc.category_id = c.id
  WHERE pn.protein >= 20
  ORDER BY pn.protein DESC
  LIMIT 50
`);
const queryTime = performance.now() - startTime;
console.log(`Query completed in ${queryTime.toFixed(2)}ms`);
console.log(`Results: ${results.length} products`);

// Expected: Query time < 200ms
// Expected: Results array with proper data structure
```

## Contract Test Execution (2 minutes)

### 1. Run Schema Contract Tests

```bash
# Run contract tests for database schema
npm test -- tests/contract/DatabaseSchema.contract.test.ts

# Expected output:
# ✅ Database schema contract tests
#   ✅ All required tables exist
#   ✅ All required indexes exist
#   ✅ Foreign key constraints working
#   ✅ Check constraints enforced
#   ✅ Triggers functioning correctly
```

### 2. Run Query Pattern Tests

```bash
# Run contract tests for query patterns
npm test -- tests/contract/QueryPatterns.contract.test.ts

# Expected output:
# ✅ Query pattern contract tests
#   ✅ Multi-dimensional filtering works
#   ✅ Category hierarchy queries work
#   ✅ Full-text search functional
#   ✅ Performance targets met
#   ✅ Index usage validated
```

### 3. Run Integration Tests

```bash
# Run full integration test suite
npm test -- tests/integration/FlexibleSchema.test.ts

# Expected output:
# ✅ Integration tests
#   ✅ Data transformation pipeline
#   ✅ Frontend database loading
#   ✅ Complex query combinations
#   ✅ Performance benchmarks
#   ✅ Memory usage within limits
```

## Expected Results Summary

### ✅ Success Criteria

1. **Schema Creation**: 8 tables created with proper relationships
2. **Data Import**: Sample products successfully normalized and imported
3. **Query Performance**: All test queries execute < 2000ms
4. **Index Usage**: EXPLAIN QUERY PLAN shows proper index utilization
5. **Frontend Loading**: Database loads in browser < 5 seconds
6. **Multi-dimensional Filtering**: Complex filters return accurate results
7. **Memory Usage**: Browser memory usage < 150MB during queries
8. **Contract Tests**: All contract tests pass

### ❌ Failure Indicators

1. **Schema Errors**: Missing tables, incorrect column types, failed constraints
2. **Data Import Failures**: Constraint violations, foreign key errors
3. **Performance Issues**: Queries > 2000ms, missing index usage
4. **Frontend Errors**: Database loading failures, WASM compatibility issues
5. **Memory Problems**: Browser crashes, excessive memory usage
6. **Test Failures**: Any contract or integration test failures

## Troubleshooting Guide

### Common Issues

**Issue**: Schema creation fails with constraint errors
```bash
# Solution: Check source data quality
sqlite3 out/products-flexible.db "
  SELECT * FROM schema_integrity
  WHERE violations > 0;"
```

**Issue**: Query performance below expectations
```bash
# Solution: Analyze query plans
sqlite3 out/products-flexible.db "
  EXPLAIN QUERY PLAN
  [your slow query here];"
```

**Issue**: Frontend database loading fails
```bash
# Solution: Check WASM file accessibility and OPFS support
# Open browser console, check for CORS or file access errors
```

**Issue**: Memory usage too high
```bash
# Solution: Check query result size limits
# Implement pagination, reduce result set sizes
```

### Performance Optimization

If performance targets aren't met:

1. **Add missing indexes** based on EXPLAIN QUERY PLAN output
2. **Reduce result set sizes** with proper LIMIT clauses
3. **Optimize query patterns** using EXISTS instead of IN subqueries
4. **Enable query result caching** for repeated filter combinations
5. **Consider query batching** for complex multi-table operations

## Success Validation Checklist

- [ ] Schema generation completes without errors
- [ ] All 8 core tables created with proper structure
- [ ] Sample data imported successfully (>50 products)
- [ ] Basic queries return expected results
- [ ] Multi-dimensional filtering works correctly
- [ ] Query performance meets constitutional requirements (<2s)
- [ ] Frontend database loading successful
- [ ] Browser queries execute within memory limits
- [ ] All contract tests pass
- [ ] Integration tests validate end-to-end functionality

**Time Investment**: ~10 minutes total
**Success Rate**: Should achieve 100% success on properly implemented schema

---

## Next Steps After Validation

1. **Full Data Import**: Run transform on complete dataset (30k products)
2. **Performance Tuning**: Optimize indexes based on real query patterns
3. **Frontend Integration**: Update UI components to use new schema
4. **Migration Testing**: Validate data consistency vs old schema
5. **Production Deployment**: Deploy schema to production environment

This quickstart provides rapid validation that the flexible database schema meets all functional and performance requirements before proceeding with full implementation.
# Research: Flexible Database Schema Design

**Feature**: 019-flexible-database-schema
**Date**: 2025-09-22
**Status**: Complete

## Research Objectives

1. **SQLite Schema Normalization**: Best practices for normalized schema design with complex relationships
2. **Multi-dimensional Indexing**: Optimizing indexes for complex filter combinations
3. **WASM SQLite Performance**: wa-sqlite optimization strategies for browser environments
4. **Hierarchical Data Patterns**: Category tree storage and querying patterns
5. **Extensible Scoring Systems**: Schema patterns for dynamic scoring algorithms

---

## Research Findings

### 1. SQLite Schema Normalization

**Decision**: Use hybrid normalization approach with core entities normalized and complex nested data in JSON columns

**Rationale**:
- Normalized tables (products, categories, ingredients, nutrition) enable efficient joins and indexing
- JSON columns for complex structures (additiveInfo, scoring data) maintain flexibility
- SQLite JSON functions enable querying nested data without performance penalties
- Balances query performance with schema flexibility

**Alternatives Considered**:
- Full normalization: Too many joins, complex queries for nested data
- Full denormalization: Inflexible, difficult to maintain, large storage overhead
- EAV pattern: Poor performance for complex queries, difficult to index

### 2. Multi-dimensional Indexing Strategy

**Decision**: Composite indexes on frequently combined filter dimensions with covering indexes for hot paths

**Rationale**:
- Composite indexes on common filter combinations (halal_status, protein_per_100g)
- Covering indexes include all columns needed for queries (avoiding table lookups)
- Partial indexes for boolean flags reduce index size
- SQLite query planner efficiently uses multiple indexes for complex queries

**Key Index Patterns**:
```sql
-- Hot path: halal + protein filtering
CREATE INDEX idx_halal_protein_covering ON products(halal_status, protein_per_100g, id, name, price_regular);

-- Category hierarchy traversal
CREATE INDEX idx_category_path ON categories(path, depth);

-- Boolean flag combinations (partial indexes)
CREATE INDEX idx_dietary_flags ON products(is_vegan, is_gluten_free) WHERE is_vegan = 1 OR is_gluten_free = 1;

-- Full-text search with filtering
CREATE INDEX idx_search_combined ON product_search_terms(term, product_id, weight);
```

**Alternatives Considered**:
- Single column indexes: Poor performance for multi-dimensional queries
- Expression indexes: Limited SQLite support, maintenance complexity
- Materialized views: Extra storage, complex update logic

### 3. WASM SQLite Performance Optimization

**Decision**: Use OPFS VFS with strategic query optimization and result pagination

**Rationale**:
- OPFS (Origin Private File System) provides best performance for large databases
- Query result streaming prevents memory exhaustion with large result sets
- Prepared statements with parameter binding optimize query execution
- Database connection pooling reduces initialization overhead

**Performance Strategies**:
- Limit result sets to 100-500 items with pagination
- Use EXPLAIN QUERY PLAN to validate index usage
- Implement query result caching for identical filter combinations
- Pre-warm database connection during app initialization

**Alternatives Considered**:
- IndexedDB VFS: Slower for large datasets, complex transaction handling
- In-memory loading: Exceeds browser memory limits with 30k products
- Server-side querying: Violates Static Generation First principle

### 4. Hierarchical Category Storage

**Decision**: Nested Set Model with path materialization for efficient tree operations

**Rationale**:
- Nested Set Model enables single-query subtree retrieval
- Materialized paths support breadcrumb navigation and LIKE queries
- Depth column enables level-based filtering
- Hybrid approach balances query performance with update complexity

**Schema Pattern**:
```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT REFERENCES categories(id),
  path TEXT NOT NULL,           -- 'parent/child/grandchild'
  depth INTEGER NOT NULL,       -- 0 = root, 1 = child, etc.
  left_bound INTEGER NOT NULL,  -- Nested set left boundary
  right_bound INTEGER NOT NULL, -- Nested set right boundary
  product_count INTEGER DEFAULT 0
);

-- Efficient subtree queries
SELECT * FROM categories
WHERE left_bound >= ? AND right_bound <= ?;

-- Breadcrumb queries
SELECT * FROM categories
WHERE path LIKE 'dairy/milk/%';
```

**Alternatives Considered**:
- Adjacency List: Requires recursive queries, poor performance
- Path Enumeration only: Difficult to maintain, no efficient subtree operations
- Closure Table: Extra storage overhead, complex maintenance

### 5. Extensible Scoring System

**Decision**: Key-value scoring table with typed score values and contextual metadata

**Rationale**:
- Single table supports unlimited scoring algorithms without schema changes
- Strongly typed score_value with validation constraints
- Context field enables situational scoring (training vs rest day)
- Efficient indexing on score_type enables fast filtering by score category

**Schema Pattern**:
```sql
CREATE TABLE product_scores (
  product_id TEXT NOT NULL REFERENCES products(id),
  score_type TEXT NOT NULL,     -- 'protein_efficiency', 'satiety_score', etc.
  score_value REAL NOT NULL,    -- Normalized 0-100 score
  context TEXT,                 -- 'training_day', 'cutting_phase', null
  computed_at INTEGER NOT NULL, -- Unix timestamp for cache invalidation
  metadata TEXT,                -- JSON for algorithm-specific data
  PRIMARY KEY (product_id, score_type, context)
);

-- Context-aware scoring queries
SELECT p.*, ps.score_value
FROM products p
JOIN product_scores ps ON p.id = ps.product_id
WHERE ps.score_type = 'protein_efficiency'
  AND ps.context = 'cutting_phase'
ORDER BY ps.score_value DESC;
```

**Alternatives Considered**:
- Column per score type: Schema changes required for new algorithms
- JSON document storage: Poor indexing, difficult to query efficiently
- Separate table per score type: Schema proliferation, complex union queries

---

## Implementation Dependencies

### Required Libraries
- **wa-sqlite**: WASM SQLite for browser execution
- **sql.js** (fallback): Backup WASM SQLite implementation
- No additional dependencies (constitutional compliance)

### Database Features Used
- **JSON functions**: JSON_EXTRACT, JSON_EACH for nested data queries
- **Generated columns**: Computed metrics (protein_efficiency, etc.)
- **Partial indexes**: Boolean flag optimization
- **Full-text search**: FTS5 virtual tables for text search
- **Window functions**: Percentile calculations for scoring

### Performance Benchmarks Required
- Query response time: <2s on 3G connection
- Transform pipeline: <10s for 30k products
- Memory usage: <150MB peak during queries
- Bundle size impact: <50KB additional WASM overhead

---

## Risk Assessment

### High Risk
- **WASM compatibility**: Browser support variations for OPFS/VFS
- **Memory constraints**: Large result sets in browser environment
- **Query complexity**: 8+ dimension filters may exceed SQLite optimizer limits

### Medium Risk
- **Schema migration**: Transforming existing monolithic data
- **Index maintenance**: Keeping indexes optimized as data changes
- **Search relevance**: Balancing full-text search with structured filtering

### Low Risk
- **Constitutional compliance**: Design aligns with all principles
- **Technology stack**: Proven SQLite + TypeScript combination
- **Testing strategy**: Clear contract and integration test patterns

---

## Next Steps

**Phase 1 Ready**: All technical unknowns resolved, ready for data model and contract design.

**Key Decisions Validated**:
- ✅ Hybrid normalization approach confirmed
- ✅ Multi-dimensional indexing strategy defined
- ✅ WASM performance optimization path clear
- ✅ Hierarchical category pattern selected
- ✅ Extensible scoring system designed

**No Blockers**: Implementation can proceed to Phase 1 design activities.
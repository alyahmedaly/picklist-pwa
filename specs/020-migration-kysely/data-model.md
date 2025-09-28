# Data Model: Kysely Database Query Layer

**Date**: 2025-01-27
**Feature**: 020-migration-kysely
**Source**: Derived from existing flexible schema and feature requirements

## Core Entities

**Schema Authority**: Based on introspection of `out/products-flexible.db` (see schema-baseline.md)
**Current State**: 7 core tables present, product_search_terms absent (search disabled)

### DatabaseInterface
**Purpose**: TypeScript interface representing the actual database schema for Kysely
**Relationships**: Contains all existing table definitions with conditional search tables

```typescript
interface FlexibleDatabaseBase {
  products: ProductTable;
  categories: CategoryTable;
  product_categories: ProductCategoryTable;
  product_nutrition: ProductNutritionTable;
  product_flags: ProductFlagTable;
  product_scores: ProductScoreTable;
  product_additives: ProductAdditiveTable;
}

interface FlexibleDatabaseWithSearch extends FlexibleDatabaseBase {
  product_search_terms: ProductSearchTermTable; // Only when FLEX_SCHEMA_ENABLE_SEARCH=true
}

type FlexibleDatabase = FlexibleDatabaseBase | FlexibleDatabaseWithSearch;
```

**Validation Rules**:
- All table interfaces match existing SQLite schema exactly (validated against schema-baseline.md)
- Conditional search table typing based on runtime table existence detection
- Readonly properties for immutable database fields

### ProductTable
**Purpose**: Core product entity with pricing and basic attributes
**Fields**: id (PK), name, price_regular, price_sale, unit_amount, unit_type, brand, created_at, updated_at
**Validation Rules**:
- id: Required string primary key
- name: Required string, max 200 characters
- price_regular: Required number, > 0, <= 999.99
- price_sale: Optional number, > 0, <= 999.99
- unit_amount: Required number, > 0
- unit_type: Required enum ('g', 'ml', 'pieces', 'kg', 'l')

### CategoryTable
**Purpose**: Hierarchical category structure using nested set model
**Fields**: id (PK), name, parent_id, path, depth, left_bound, right_bound, product_count, display_order
**Relationships**: Self-referencing parent-child hierarchy
**Validation Rules**:
- id: Required string primary key
- name: Required string, max 100 characters
- parent_id: Optional foreign key to categories.id
- depth: Required number, >= 0, <= 6
- left_bound/right_bound: Required numbers for nested set operations
- product_count: Required number, >= 0

### ProductNutritionTable
**Purpose**: Normalized nutritional data per 100g/100ml
**Fields**: product_id (PK/FK), kcal, kj, protein, carbs, sugars, fat, saturated_fat, fiber, salt, sodium
**Relationships**: One-to-one with Product (product_id FK)
**Validation Rules**:
- product_id: Required foreign key to products.id
- All nutrition values: Optional numbers with range constraints (0-100 for most)
- Business rules: sugars <= carbs, saturated_fat <= fat

### ProductFlagTable
**Purpose**: Boolean dietary and classification flags with confidence
**Fields**: product_id (FK), flag_type, flag_value, confidence, source
**Relationships**: Many-to-one with Product
**Validation Rules**:
- product_id, flag_type: Composite primary key
- flag_type: Required enum (is_vegan, is_halal, is_high_protein, etc.)
- flag_value: Required boolean
- confidence: Required number, 0-100
- source: Required string, max 50 characters

### ProductScoreTable
**Purpose**: Multi-dimensional scoring with contextual variants
**Fields**: product_id (FK), score_type, score_value, context, computed_at, metadata
**Relationships**: Many-to-one with Product, supports contextual scoring
**Validation Rules**:
- product_id, score_type, context: Composite primary key (context nullable)
- score_type: Required enum (protein_efficiency, health_score, etc.)
- score_value: Required number, 0-100
- context: Optional enum (training_day, rest_day, cutting, etc.)
- computed_at: Required timestamp

### ProductAdditiveTable
**Purpose**: E-number and food additive information
**Fields**: product_id (FK), e_number, additive_name, functional_category, dutch_category, safety_flags, is_natural
**Relationships**: Many-to-one with Product
**Validation Rules**:
- product_id, e_number, additive_name: Composite primary key
- e_number: Optional string matching E-number pattern
- additive_name: Required string, max 200 characters
- functional_category: Required string, max 100 characters
- is_natural: Required boolean

### ProductSearchTermTable (Conditional - Currently Absent)
**Purpose**: Pre-computed search terms for optimization
**Fields**: product_id (FK), term, term_type, weight, language
**Relationships**: Many-to-one with Product
**Current Status**: ❌ Table does not exist in current database (FLEX_SCHEMA_ENABLE_SEARCH=false)
**Conditional Existence**: Only exists when FLEX_SCHEMA_ENABLE_SEARCH=true during build
**Validation Rules** (when present):
- product_id, term, term_type: Composite primary key
- term: Required string, max 100 characters
- term_type: Required enum (name, brand, ingredient, category, etc.)
- weight: Required number, 0-100
- language: Required enum ('nl', 'en')

**Migration Impact**: Search-related queries must handle table absence gracefully with runtime detection

## State Transitions

### Migration States
**Purpose**: Track progress of query migration from raw SQL to Kysely

1. **Legacy State**: Raw SQL queries via `runQuery()`
2. **Dual State**: Both raw SQL and Kysely implementations available
3. **Kysely State**: Only Kysely implementation active
4. **Rollback State**: Temporary return to legacy if issues detected

**Transition Rules**:
- Migration proceeds incrementally per query type
- Parity testing required before state transition
- Rollback must be atomic and immediate

### Feature Flag States
**Purpose**: Handle conditional search functionality

1. **Search Enabled**: Full database interface with search tables
2. **Search Disabled**: Database interface without search tables
3. **Runtime Detection**: Dynamic type narrowing based on table existence

**Validation Rules**:
- Type guards must validate table existence before query execution
- Compile-time errors for search queries when search disabled
- Clear error messages for unsupported operations

## Relationships and Dependencies

### Query Repository Dependencies
```
ProductRepository
├── Depends on: DatabaseInterface, ProductTable
├── Uses: CategoryTable (for joins), ProductNutritionTable (for filtering)
└── Integrates with: FeatureDetection for search capabilities

CategoryRepository
├── Depends on: DatabaseInterface, CategoryTable
├── Uses: ProductCategoryTable (for product counts)
└── Supports: Nested set model operations

SearchRepository (Conditional)
├── Depends on: DatabaseInterface, ProductSearchTermTable
├── Requires: FLEX_SCHEMA_ENABLE_SEARCH=true
└── Uses: Raw SQL for FTS5 virtual table queries
```

### Hook Integration Dependencies
```
useFlexibleProducts
├── Consumes: ProductRepository queries
├── Maintains: Existing interface compatibility
└── Provides: Type-safe result objects

useFlexibleCategoryHierarchy
├── Consumes: CategoryRepository queries
├── Supports: Tree traversal operations
└── Handles: Nested set model results

useFlexibleProductSearch (Conditional)
├── Consumes: SearchRepository queries
├── Requires: Runtime search detection
└── Provides: Relevance-scored results
```

## Performance Considerations

### Query Optimization
- Repository pattern enables query result caching
- Kysely query compilation happens once per query type
- Database connection pooling handled by SQLocal layer
- Index utilization preserved from existing schema

### Bundle Size Impact
- Kysely tree-shaking reduces unused query builder features
- Type definitions have zero runtime cost
- Repository pattern prevents code duplication
- Custom driver minimizes adapter overhead

### Memory Usage
- Query result objects maintain existing memory footprint
- Type safety adds no runtime memory overhead
- Repository instances are lightweight and reusable
- Connection management unchanged from current implementation

## Data Source Authority

**Schema Source**: Canonicalized from `flexibleSchema.ts` generator output
**Validation**: Introspected against `out/products-flexible.db` (see schema-baseline.md)
**Update Requirement**: This document MUST be regenerated if schema generator changes
**Row Count Validation**: All table interfaces validated against actual record counts:
- products: 30,498 records
- categories: 3,201 records
- product_nutrition: 30,312 records
- product_flags: 151,523 records
- product_scores: 133,978 records
- product_additives: 27,850 records

**Critical Schema Elements Confirmed**:
✅ Nested set model uses left_bound/right_bound (not lft/rgt)
✅ Price fields are price_regular/price_sale (not price_cents)
✅ All nutrition data in separate normalized table
✅ Complex composite primary keys on junction tables
✅ Extensive check constraints and validation rules

---

**Data Model Status**: ✅ COMPLETE (Validated against actual schema)
**Next**: Contract generation and test scenarios
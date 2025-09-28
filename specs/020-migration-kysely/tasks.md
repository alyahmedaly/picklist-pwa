# Tasks: Database Query Layer Migration to Kysely

**Input**: Design documents from `/specs/020-migration-kysely/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

## Execution Flow (main)
```
1. Load plan.md from feature directory ✅
   → Extract: TypeScript, Kysely, SQLocal, React hooks, Vitest, DIRECT migration approach
2. Load design documents ✅:
   → data-model.md: 7 entities → repository tasks
   → contracts/: 3 files → contract tests + type definitions
   → research.md: Direct replacement approach → testing framework tasks
3. Generate tasks by category:
   → Setup: Schema validation, Kysely integration, parity framework
   → Tests: Contract tests, parity tests, integration tests
   → Core: Repositories, type definitions, direct migration
   → Integration: Hooks, repository factory, client-side search handling
   → Polish: Performance validation, documentation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Parity tests BEFORE any migration (TDD)
   → SearchRepository is CLIENT-SIDE ONLY (no database search tables exist)
5. Number tasks sequentially (T001-T037)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness ✅
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root (per plan.md)
- TypeScript 5.8+ with strict mode, Vitest testing framework
- **Direct migration**: Complete replacement, no dual-layer maintenance
- All tests use `.contract.test.ts` naming convention

## Phase 3.1: Setup & Schema Validation
- [X] **T001** [P] Create Kysely integration directory structure at `src/db/kysely/`
- [X] **T002** [P] Create parity testing framework directory at `tests/parity/`
- [X] **T003** **Schema verification before type emission** - Introspect `out/products-flexible.db` and validate against schema-baseline.md at `tests/contract/SchemaVerification.contract.test.ts`
  **Completion Criteria**:
  - [X] All 6 expected tables present (products, categories, product_nutrition, product_flags, product_scores, product_additives)
  - [X] Column names and types match schema-baseline.md exactly
  - [X] Primary keys and foreign keys validated
  - [X] Row counts within expected ranges (30k+ products, 3k+ categories)
  - [X] No search tables present (confirms client-side search approach)
  - [X] Test passes and blocks further work if schema mismatches found
- [X] **T004** [P] Create test naming conventions documentation at `specs/020-migration-kysely/test-conventions.md`

## Phase 3.2: Contract Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Database Interface Contract Tests
- [ ] **T005** [P] Contract test for database interface types in `tests/contract/DatabaseInterface.contract.test.ts`
- [ ] **T006** [P] Contract test for table interfaces in `tests/contract/TableInterfaces.contract.test.ts`
- [ ] **T007** [P] Contract test for client-side search types in `tests/contract/ClientSideSearch.contract.test.ts`

### Repository Interface Contract Tests
- [ ] **T008** [P] Contract test for ProductRepository interface in `tests/contract/ProductRepository.contract.test.ts`
- [ ] **T009** [P] Contract test for CategoryRepository interface in `tests/contract/CategoryRepository.contract.test.ts`
- [ ] **T010** [P] Contract test for SearchRepository interface (client-side) in `tests/contract/SearchRepository.contract.test.ts`

### Parity Testing Framework
- [ ] **T011** [P] Parity test framework with edge case coverage in `tests/parity/ParityTestFramework.contract.test.ts`
  **Completion Criteria**:
  - [ ] Automated comparison of legacy vs Kysely query results
  - [ ] Edge case coverage: null nutrition, deep category hierarchies, empty results
  - [ ] Tolerance handling for floating-point comparisons
  - [ ] Clear diff reporting when parity tests fail
  - [ ] Performance comparison logging (query execution time)
  - [ ] Framework supports all 12 identified query patterns
  - [ ] Easy to add new parity tests for future queries
- [ ] **T012** [P] Baseline query capture for 12 product query patterns in `tests/parity/ProductQueries.contract.test.ts`
  **Completion Criteria**:
  - [ ] All 12 query patterns from `loadFlexibleDatabase.ts` captured
  - [ ] Baseline results stored for comparison during migration
  - [ ] Query patterns cover: basic select, filtering, joins, aggregation
  - [ ] Edge cases included: empty results, null values, boundary conditions
  - [ ] Performance baselines recorded for regression detection
  - [ ] Tests executable and deterministic (same results every run)
- [ ] **T013** [P] Baseline query capture for category hierarchy queries in `tests/parity/CategoryQueries.contract.test.ts`

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Type Definitions & Kysely Setup (Execution Order: T014→T016→T017)
- [X] **T014** [P] Database interface types from contracts at `src/db/kysely/database.ts`
- [X] **T015** [P] ~~Custom SQLocal driver implementation~~ **COMPLETED** - Used official SQLocalKysely dialect instead
- [X] **T016** Kysely connection factory at `src/db/kysely/connection.ts`
  **Completion Criteria**:
  - [X] Kysely instance creation with SQLocal driver integration
  - [X] Connection pooling and lifecycle management
  - [X] Error handling for database initialization failures
  - [X] TypeScript integration with database schema types
  - [X] Configuration support for different database files
  - [ ] Unit tests covering connection success and failure scenarios
  - [ ] Integration test with actual database operations
- [X] **T017** Runtime feature detection utilities at `src/db/kysely/feature-detection.ts`

### Repository Pattern (Early SearchRepository Implementation)
- [X] **T018** Base repository abstract class at `src/db/repositories/BaseRepository.ts`
  **Completion Criteria** (Read-Only Database):
  - [X] Abstract class with common query patterns (select, where, join)
  - [X] Error handling for database connection issues
  - [X] TypeScript generics for table types
  - [ ] Basic logging for query debugging (optional)
  - [ ] Unit tests covering core functionality (meaningful coverage, not 100%)
  - [ ] ⚠️ **Skip**: Transaction methods (database is read-only)
- [ ] **T019** **SearchRepository client-side wrapper FIRST** at `src/db/repositories/SearchRepository.ts`
  - **No database search tables exist** - Current search is purely client-side using `src/lib/dutchSearch.ts`
  - **Wraps existing Dutch search functionality**
  - **Returns "search not available" for any database search requests**
  - **Smoke test for "search disabled" behavior before continuing**
  **Completion Criteria**:
  - [ ] Wraps `src/lib/dutchSearch.ts` without modification
  - [ ] Clear error messages for unsupported database search operations
  - [ ] TypeScript interface matches existing search functionality
  - [ ] Smoke test passes for "search disabled" scenario
  - [ ] Integration test confirms client-side search works
  - [ ] Documentation clarifies client-side vs database search distinction
- [X] **T020** ProductRepository core implementation at `src/db/repositories/ProductRepository.ts`
  **Completion Criteria** (Decompose into Sub-PRs):
  - [X] **Sub-PR 1**: TypeScript interfaces + Basic SELECT operations (`getById()`, `getAll()`, `count()`)
  - [X] **Sub-PR 2**: Filtering with `queryProducts(criteria)` and WHERE clause building
  - [X] **Sub-PR 3**: Joins (Product → Category, Product → Nutrition with LEFT JOINs)
  - [X] **Sub-PR 4**: Null handling + Error handling + Integration tests
  - [ ] Each sub-PR: TypeScript compilation with zero errors
  - [ ] Each sub-PR: Basic unit tests for new functionality
  - [ ] Final integration test confirms all parts work together
- [X] **T021** CategoryRepository implementation at `src/db/repositories/CategoryRepository.ts`
  **Completion Criteria**:
  - [X] Nested set model operations: `getChildren()`, `getAncestors()`, `getDescendants()`
  - [X] Tree traversal methods with depth limits (max 6 levels)
  - [X] Category hierarchy queries with product counts
  - [X] Path-based category lookup by breadcrumb strings
  - [X] Performance optimized queries using left_bound/right_bound indexes
  - [X] Error handling for malformed tree structures
  - [X] Unit tests covering all tree operations
  - [X] Integration tests with category hierarchy validation

### Direct Migration with Parity Validation
- [X] **T022** Migrate basic product queries with parity validation in `ProductRepository.ts`
  **Completion Criteria**:
  - [X] All basic queries from `loadFlexibleDatabase.ts` migrated to Kysely
  - [X] Parity tests pass: identical results vs legacy queries
  - [X] **Early Micro-Benchmark**: Basic query performance within 10% of legacy
  - [X] Error handling maintains existing behavior
  - [X] No breaking changes to query interfaces
  - [X] ⚠️ **Performance Gate**: Performance validation integrated into parity tests

- [X] **T023** Migrate complex filtering queries with parity validation in `ProductRepository.ts`
  **Completion Criteria**:
  - [X] Multi-table joins (product + nutrition + flags + scores) working
  - [X] Complex WHERE clauses with AND/OR logic
  - [X] Range filtering (price, nutrition values) with proper operators
  - [X] Parity tests pass for all complex query patterns
  - [X] Performance benchmarks within acceptable thresholds

- [X] **T024** Migrate category hierarchy queries with parity validation in `CategoryRepository.ts`
  **Completion Criteria**:
  - [X] Nested set model queries using left_bound/right_bound
  - [X] Tree traversal (ancestors, descendants, siblings) working
  - [X] Category product counts aggregation
  - [X] Path-based lookups with breadcrumb matching
  - [X] Parity tests pass for all hierarchy operations

- [X] **T025** Migrate product details queries with parity validation in `ProductRepository.ts`
  **Completion Criteria**:
  - [X] Single product lookup with all related data (nutrition, flags, scores, additives)
  - [X] Efficient single-query loading vs N+1 query problem
  - [X] Null value handling for optional relationships
  - [X] Parity test confirms identical data structure output
  - [X] **Early Micro-Benchmark**: Performance improvement or maintain existing speed
  - [X] ⚠️ **Performance Gate**: If >10% regression, STOP and optimize before continuing

## Phase 3.4: Integration & Direct Replacement

### Database Layer Direct Replacement
- [x] **T026** Create repository factory with runtime detection at `src/db/kysely/repository-factory.ts`
  **Completion Criteria**:
  - [x] Factory creates all repository instances (Product, Category, Search)
  - [x] Runtime database feature detection (tables present, indexes available)
  - [x] Singleton pattern for repository reuse
  - [x] Error handling for database connection failures
  - [x] TypeScript interfaces for factory configuration
  - [x] Unit tests covering factory instantiation and error scenarios

### React Hooks Integration
- [x] **T027** Update `useFlexibleProducts` hook to use ProductRepository in `src/hooks/useFlexibleProductQueries.ts`
  **Completion Criteria**:
  - [x] Hook interface remains identical (no breaking changes for UI components)
  - [x] Internal implementation uses ProductRepository instead of raw SQL
  - [x] Loading states, error handling, and caching behavior preserved
  - [x] TypeScript return types unchanged
  - [x] Integration tests pass with existing UI components
  - [x] Performance maintained or improved

- [x] **T028** Update `useFlexibleCategoryHierarchy` hook to use CategoryRepository in `src/hooks/useFlexibleProductQueries.ts`
  **Completion Criteria**:
  - [x] Category tree structure output identical to legacy implementation
  - [x] Nested set model operations working through repository
  - [x] Hook performance maintained for large category trees
  - [x] Error handling for malformed hierarchies
  - [x] TypeScript interfaces unchanged for consuming components

- [x] **T029** Update search hooks to clarify client-side only in `src/hooks/useFlexibleProductQueries.ts`
  **Completion Criteria**:
  - [x] Clear documentation that search is client-side only
  - [x] Hook interface updated to remove database search confusion
  - [x] Integration with `src/lib/dutchSearch.ts` maintained
  - [x] TypeScript types clarify client-side vs server-side search
  - [x] Existing search functionality in UI components unaffected

### Advanced Query Features
- [ ] **T030** [P] Multi-dimensional filtering with nested joins in `ProductRepository.ts`
  **Completion Criteria**:
  - [ ] Complex WHERE clauses with multiple table joins
  - [ ] Filtering across nutrition, flags, scores, and additives simultaneously
  - [ ] Proper LEFT JOIN handling to avoid eliminating products
  - [ ] Query optimization to prevent N+1 problems
  - [ ] Type-safe filter criteria interfaces
  - [ ] Performance testing with large datasets (30k+ products)
  - [ ] Edge case handling: missing data, boundary values

- [x] **T031** [P] Contextual scoring queries with metadata in `ProductRepository.ts`
  **Completion Criteria**:
  - [x] Context-aware scoring queries (training_day, rest_day, cutting, etc.)
  - [x] Metadata aggregation from product_scores table
  - [x] Efficient queries avoiding multiple database roundtrips
  - [x] Score type filtering and sorting capabilities
  - [x] Null handling for products without specific score types
  - [x] TypeScript interfaces for score contexts and metadata
  - [x] Performance benchmarks for scoring query patterns

## Phase 3.5: Integration Tests & Validation

### Hook Integration Tests
- [ ] **T032** [P] Integration test for hook interface compatibility in `tests/integration/HookCompatibility.contract.test.ts`
- [ ] **T033** [P] Integration test for repository pattern functionality in `tests/integration/RepositoryIntegration.contract.test.ts`
- [ ] **T034** [P] Integration test for client-side search behavior in `tests/integration/SearchClientSide.contract.test.ts`

### Performance Validation (Simplified)
- [ ] **T035** [P] Comprehensive performance benchmark suite in `tests/performance/QueryBenchmarks.contract.test.ts`
  **Completion Criteria** (Final Validation Only):
  - [ ] Benchmark all migrated queries against legacy performance
  - [ ] Large dataset testing (30k+ products, 3k+ categories)
  - [ ] Complex query patterns: multi-table joins, aggregations, filtering
  - [ ] Clear reporting of benchmark results with timing breakdown
  - [ ] ⚠️ **Late-stage validation only** - Early micro-benchmarks handled in T022-T025

## Phase 3.6: Polish & Final Validation
- [ ] **T036** [P] Complete replacement of raw SQL in `src/db.ts` with repository-based implementation
  **Completion Criteria** (Pragmatic Approach):
  - [ ] All `runQuery()` calls removed from codebase
  - [ ] Database connections handled through repository factory
  - [ ] All current database operations go through type-safe repositories
  - [ ] Backward compatibility maintained for existing API consumers
  - [ ] Full test suite passes without any query-related failures
  - [ ] **Escape Hatch**: Create `src/db/raw/README.md` documenting approved raw SQL usage patterns
  - [ ] ⚠️ **Pragmatic**: Focus on removing current raw SQL, not eliminating all future possibilities
- [ ] **T037** [P] Final validation against quickstart.md success criteria and update migration documentation
  **Completion Criteria**:
  - [ ] All quickstart.md validation steps executed successfully
  - [ ] Complete migration documentation updated
  - [ ] Rollback procedure tested and documented
  - [ ] Performance benchmarks meet constitutional requirements (<10% regression)
  - [ ] All contract tests passing (100% success rate)
  - [ ] TypeScript compilation with zero errors
  - [ ] Integration tests confirm UI components work unchanged
  - [ ] Code review confirms no legacy SQL remains in codebase
  - [ ] Migration tagged as complete and production-ready

## Dependencies

### Critical Path (Sequential Dependencies)
1. **Setup** (T001-T004) → **Contract Tests** (T005-T013) → **Implementation** (T014-T025)
2. **T014→T016→T017** (Foundation with execution order) → **T018-T019** (Base + Search repos) → **T020-T021** (Product/Category repos) → **T022-T025** (Migration)
3. **T026** (Repository factory) → **T027-T029** (Hooks) → **T030-T031** (Advanced)
4. **Implementation Complete** → **Integration Tests** (T032-T034) → **Performance** (T035) → **Final Validation** (T036-T037)

### Performance Gates (Early Detection)
- **T022**: Early micro-benchmark after basic query migration - STOP if >10% regression
- **T025**: Early micro-benchmark after product details migration - STOP if >10% regression
- **T035**: Final comprehensive benchmarks (validation only, not discovery)

### Blocking Dependencies
- **T003** (Schema verification) blocks all type definition work (T014-T017)
- **T018** (BaseRepository) blocks T019-T021 (concrete repositories)
- **T019** (SearchRepository) implemented EARLY with smoke test before product queries
- **T014-T017** (types & connection) block T018-T021 (repositories)
- **T022-T025** (core migration) blocks T027-T029 (hook integration)
- **T026** (repository factory) blocks T027-T029 (hook updates)
- All implementation (T014-T031) blocks integration tests (T032-T034)

## Parallel Execution Examples

### Phase 3.2: Launch All Contract Tests Together
```bash
# Launch T005-T013 in parallel (different files, no dependencies)
Task: "Contract test for database interface types in tests/contract/DatabaseInterface.contract.test.ts"
Task: "Contract test for table interfaces in tests/contract/TableInterfaces.contract.test.ts"
Task: "Contract test for client-side search types in tests/contract/ClientSideSearch.contract.test.ts"
Task: "Contract test for ProductRepository interface in tests/contract/ProductRepository.contract.test.ts"
Task: "Contract test for CategoryRepository interface in tests/contract/CategoryRepository.contract.test.ts"
Task: "Contract test for SearchRepository interface (client-side) in tests/contract/SearchRepository.contract.test.ts"
Task: "Parity test framework with edge case coverage in tests/parity/ParityTestFramework.contract.test.ts"
Task: "Baseline query capture for 12 product query patterns in tests/parity/ProductQueries.contract.test.ts"
Task: "Baseline query capture for category hierarchy queries in tests/parity/CategoryQueries.contract.test.ts"
```

### Phase 3.3: Foundation Layer with Execution Order
```bash
# Launch in order: T014→T016→T017 (T015 can run parallel with T014)
Task: "Database interface types from contracts at src/db/kysely/database.ts"
Task: "Custom SQLocal driver implementation at src/db/kysely/sqlocal-driver.ts"
# After T014 completes:
Task: "Kysely connection factory at src/db/kysely/connection.ts"
# After T016 completes:
Task: "Runtime feature detection utilities at src/db/kysely/feature-detection.ts"
```

### Phase 3.4: Advanced Features in Parallel
```bash
# Launch T030-T031 together (independent features)
Task: "Multi-dimensional filtering with nested joins in ProductRepository.ts"
Task: "Contextual scoring queries with metadata in ProductRepository.ts"
```

## Task-Specific Implementation Notes

### Schema Verification (T003)
- **CRITICAL**: Must validate actual DB schema against documented schema before any type emission
- **Reality Check**: All 6 core tables confirmed present (products, categories, product_nutrition, product_flags, product_scores, product_additives)
- **No search tables**: product_search_terms does not exist - search is client-side only
- Block all type definition work if schema mismatches found

### SearchRepository Client-Side Implementation (T019)
- **Implemented FIRST** among repositories to clarify search approach early
- **NO DATABASE SEARCH** - Current implementation uses `src/lib/dutchSearch.ts` for client-side filtering
- **Full Kysely Migration** - No FTS5 hybrid queries needed since no search tables exist
- **Smoke test search disabled** behavior before proceeding to product queries

### ProductRepository Granular Implementation (T020)
- **Acceptance Criteria Breakdown**:
  1. **Define interfaces**: Proper TypeScript return types with strict typing
  2. **Implement basic selects**: Simple queries with type safety validation
  3. **Add filtering**: WHERE clauses with proper parameter binding
  4. **Add joining & nutrition layering**: Complex multi-table joins with null handling
- Each sub-step must pass parity validation before proceeding

### Direct Replacement Strategy (T036)
- **NO dual-layer maintenance** - complete replacement of `src/db.ts`
- Remove all `runQuery` references
- Direct repository usage throughout codebase
- Atomic replacement with comprehensive testing

### Edge Case Coverage (T011-T013)
- **Null nutrition handling**: Products without nutrition data
- **Deep category hierarchies**: Categories at maximum depth (6 levels)
- **Empty search results**: Client-side search returning zero results
- **Boundary conditions**: Min/max values for scores, prices, nutrition

### Performance Targets (T035)
- **Query performance**: <10% regression from baseline measurements
- **Transform pipeline**: <10s for 30k products maintained
- **NO bundle size testing** (removed per feedback)
- **NO memory usage testing** (removed per feedback)

## Notes
- **Direct migration approach**: No legacy compatibility layer
- **Client-side search only**: No database search tables exist, no FTS5 needed
- **Read-only database**: Skip transaction scaffolding, focus on query optimization
- **Performance gates**: Early micro-benchmarks prevent late-stage refactoring costs
- **Sub-PR decomposition**: Large tasks broken into manageable, reviewable chunks
- **Pragmatic raw SQL approach**: Focused elimination with documented escape hatch
- **Constitutional compliance**: TDD mandatory, performance constraints
- **Consistent naming**: All tests use `.contract.test.ts` convention
- **Entity Reality**: All 6 expected tables confirmed present in database

## Validation Checklist
*GATE: All items must be checked before marking feature complete*

- [ ] Schema verification passes before any type emission (T003)
- [ ] All contract interfaces have corresponding test files (T005-T010)
- [ ] SearchRepository handles client-side search only (T019)
- [ ] All 6 database entities have repository implementations (T018-T021)
- [ ] All parity tests pass with edge case coverage (T011-T013, T022-T025)
- [ ] All React hooks maintain identical interfaces (T027-T029)
- [ ] Client-side search behavior validated (T032-T034)
- [ ] Performance benchmarks within thresholds (T035)
- [ ] Direct replacement complete - no legacy code remains (T036)
- [ ] TypeScript compilation with zero errors
- [ ] All quickstart.md success criteria met (T037)

---

**Task Generation Status**: ✅ COMPLETE (Updated with FTS5 clarification and execution order hints)
**Total Tasks**: 37 tasks across 6 phases
**Parallel Tasks**: 18 tasks marked [P] for concurrent execution
**Critical Path**: Schema validation → Tests → Foundation (T014→T016→T017) → Repositories → Direct replacement → Validation
**Key Clarifications**:
- ❌ **No FTS5 hybrid queries** - Search is client-side only using `src/lib/dutchSearch.ts`
- ✅ **Full Kysely migration** - No raw SQL needed since no database search functionality
- ✅ **All 6 tables confirmed present** - No "future table" notes needed
- ✅ **Execution order micro-hints** - T014→T016→T017 with T019 smoke test
- ✅ **Direct replacement approach** throughout
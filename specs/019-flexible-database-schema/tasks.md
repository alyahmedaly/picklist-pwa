# Tasks: Flexible Database Schema Redesign

**Input**: Design documents from `/specs/019-flexible-database-schema/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Tech stack: TypeScript, SQLite, wa-sqlite WASM, Vitest
   → Structure: Web app (transform pipeline + React frontend)
2. Load design documents:
   → data-model.md: 8 core entities (products, categories, etc.)
   → contracts/: database-schema.sql, query-patterns.sql, database-types.ts
   → quickstart.md: 10-minute validation workflow
3. Generate tasks by category:
   → Setup: schema creation, transform pipeline integration
   → Tests: contract tests for schema, query patterns, performance
   → Core: data models, repository layer, query builder
   → Integration: transform pipeline, WASM loading, UI updates
   → Polish: benchmarks, quickstart validation
4. Apply TDD ordering: Tests before implementation
5. Mark [P] for parallel tasks (different files, no dependencies)
6. Generated 32 numbered tasks across 5 phases
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Transform Pipeline**: `src/data/transform/`, `src/scripts/`
- **Frontend**: `src/data/`, `src/hooks/`, `src/components/`
- **Tests**: `tests/contract/`, `tests/integration/`, `tests/unit/`
- **Types**: `src/types/`, `src/data/transform/types.ts`

## Phase 3.1: Setup & Schema Foundation
- [x] T001 Create flexible database schema implementation in `src/data/transform/flexibleSchema.ts`
- [x] T002 [P] Add flexible schema generation flag to CLI in `src/scripts/transform-data.ts`
- [x] T003 [P] Update transform pipeline types in `src/data/transform/types.ts` with schema entities

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T004 [P] Contract test database schema creation in `tests/contract/DatabaseSchema.contract.test.ts`
- [x] T005 [P] Contract test query patterns performance in `tests/contract/QueryPatterns.contract.test.ts`
- [x] T006 [P] Contract test TypeScript type validation in `tests/contract/DatabaseTypes.contract.test.ts`
- [x] T007 [P] Integration test basic product queries in `tests/integration/BasicQueries.test.ts`
- [x] T008 [P] Integration test multi-dimensional filtering in `tests/integration/MultiDimensionalFiltering.test.ts`
- [x] T009 [P] Integration test category hierarchy navigation in `tests/integration/CategoryHierarchy.test.ts`
- [x] T010 [P] Integration test full-text search functionality in `tests/integration/FullTextSearch.test.ts`
- [x] T011 [P] Integration test contextual scoring queries in `tests/integration/ContextualScoring.test.ts`
- [x] T012 [P] Performance benchmark tests in `tests/integration/PerformanceBenchmarks.test.ts`

## Phase 3.3: Core Schema Implementation (ONLY after tests are failing)
- [x] T013 [P] Implement Product entity normalization in `src/data/transform/entities/productEntity.ts`
- [x] T014 [P] Implement Category entity with hierarchy in `src/data/transform/entities/categoryEntity.ts`
- [x] T015 [P] Implement ProductNutrition entity in `src/data/transform/entities/nutritionEntity.ts`
- [x] T016 [P] Implement ProductFlags entity in `src/data/transform/entities/flagsEntity.ts`
- [x] T017 [P] Implement ProductScores entity in `src/data/transform/entities/scoresEntity.ts`
- [x] T018 [P] Implement ProductAdditives entity in `src/data/transform/entities/additivesEntity.ts`
- [x] T019 [P] Implement ProductSearchTerms entity in `src/data/transform/entities/searchTermsEntity.ts`
- [x] T020 Database schema creation with indexes and triggers in `src/data/transform/createFlexibleSchema.ts`
- [x] T021 Data normalization pipeline in `src/data/transform/normalizeProductData.ts`
- [x] T022 Query builder for complex filtering in `src/data/transform/queryBuilder.ts`

## Phase 3.4: Transform Pipeline Integration
- [x] T023 Integrate flexible schema into main transform pipeline in `src/scripts/transform-data.ts`
- [x] T024 Update existing product transformation to feed normalized schema in `src/data/transform/enhanceScoringPipeline.ts`
- [x] T025 Generate schema validation and integrity checks in `src/data/transform/validateFlexibleSchema.ts`
- [x] T026 Update CLI arguments and help text for flexible schema options in `src/scripts/transform-data.ts`

## Phase 3.5: Frontend Integration
- [x] T027 Create WASM SQLite database loader in `src/data/loadFlexibleDatabase.ts`
- [x] T028 Implement multi-dimensional product query hook in `src/hooks/useFlexibleProductQueries.ts`
- [x] T029 Update existing product loading to support flexible schema in `src/data/loadSQLiteData.ts`
- [x] T030 [P] Add flexible schema TypeScript definitions to frontend types in `src/types/flexible-schema.ts`

## Phase 3.6: Polish & Validation
- [x] T031 [P] Run quickstart validation scenarios from `quickstart.md`
- [ ] T032 [P] Performance optimization and index tuning based on benchmark results

## Dependencies
- Schema foundation (T001-T003) before tests (T004-T012)
- Tests (T004-T012) before implementation (T013-T022)
- Core entities (T013-T019) before schema creation (T020)
- Schema creation (T020) before pipeline integration (T023-T026)
- Pipeline integration before frontend integration (T027-T030)
- Implementation before polish (T031-T032)

## Parallel Example
```bash
# Phase 3.2: Launch all contract tests together (T004-T006):
Task: "Contract test database schema creation in tests/contract/DatabaseSchema.contract.test.ts"
Task: "Contract test query patterns performance in tests/contract/QueryPatterns.contract.test.ts"
Task: "Contract test TypeScript type validation in tests/contract/DatabaseTypes.contract.test.ts"

# Phase 3.3: Launch all entity implementations together (T013-T019):
Task: "Implement Product entity normalization in src/data/transform/entities/productEntity.ts"
Task: "Implement Category entity with hierarchy in src/data/transform/entities/categoryEntity.ts"
Task: "Implement ProductNutrition entity in src/data/transform/entities/nutritionEntity.ts"
Task: "Implement ProductFlags entity in src/data/transform/entities/flagsEntity.ts"
Task: "Implement ProductScores entity in src/data/transform/entities/scoresEntity.ts"
Task: "Implement ProductAdditives entity in src/data/transform/entities/additivesEntity.ts"
Task: "Implement ProductSearchTerms entity in src/data/transform/entities/searchTermsEntity.ts"
```

## Key Implementation Notes

### Database Schema (T020)
- Create all 8 tables from `contracts/database-schema.sql`
- Implement 25+ performance indexes for query optimization
- Add business logic triggers (single primary category, product counts)
- Create materialized views for common queries

### Entity Normalization (T013-T019)
- Each entity extracts data from existing monolithic product structure
- Maintain referential integrity across all relationships
- Implement validation rules from data model specifications
- Support incremental updates for existing data

### Query Builder (T022)
- Implement all 13 query patterns from `contracts/query-patterns.sql`
- Support dynamic filter combinations (halal + protein + price + category)
- Optimize for <2 second response time on 30k products
- Include query plan validation for proper index usage

### Frontend Integration (T027-T030)
- Load SQLite database via WASM in browser OPFS
- Maintain compatibility with existing UI components
- Support real-time filtering without backend dependencies
- Implement query result pagination and caching

### Performance Requirements
- Transform pipeline: <10 seconds for 30k products
- Query response time: <2 seconds on 3G connection
- Memory usage: <150MB during complex queries
- Bundle size impact: <50KB additional WASM overhead

## Success Criteria Validation

### Contract Tests Must Verify:
- All 8 tables created with correct structure
- All indexes exist and are being used by query planner
- Foreign key constraints working properly
- Performance benchmarks meet constitutional requirements
- TypeScript interfaces match database schema exactly

### Integration Tests Must Verify:
- Multi-dimensional filtering returns accurate results
- Category hierarchy queries work with nested set model
- Full-text search integrates with structured filtering
- Contextual scoring queries support training/rest day contexts
- Complex Ali filter combinations execute within time limits

### Quickstart Validation Must Pass:
- Schema generation completes without errors
- Sample data imports successfully with referential integrity
- All quickstart query examples return expected results
- Frontend database loading works in browser environment
- Performance targets met on test dataset

## Notes
- [P] tasks target different files with no shared dependencies
- All tests must fail initially (TDD compliance)
- Commit after each task for granular progress tracking
- Use existing constitutional patterns (Transform Pipeline First)
- Maintain backwards compatibility with current JSONL output
- Constitutional compliance verified at each phase boundary

## Task Generation Rules Applied

1. **From Contracts**:
   - `database-schema.sql` → T004 (schema contract test) + T020 (schema implementation)
   - `query-patterns.sql` → T005 (query contract test) + T022 (query builder implementation)
   - `database-types.ts` → T006 (types contract test) + T030 (types implementation)

2. **From Data Model**:
   - 8 core entities → T013-T019 (parallel entity implementation tasks)
   - Entity relationships → T021 (normalization pipeline)
   - Validation rules → T025 (schema validation)

3. **From Quickstart Scenarios**:
   - Validation steps → T007-T012 (integration tests)
   - Performance benchmarks → T012 (performance tests)
   - End-to-end workflow → T031 (quickstart validation)

4. **From Plan Technical Context**:
   - Transform pipeline integration → T023-T026
   - WASM frontend integration → T027-T029
   - Constitutional compliance → Performance requirements embedded in all tasks

## Validation Checklist ✅

- [x] All contracts have corresponding tests (T004-T006)
- [x] All 8 entities have model tasks (T013-T019)
- [x] All tests come before implementation (T004-T012 → T013-T022)
- [x] Parallel tasks truly independent (different files, no shared state)
- [x] Each task specifies exact file path
- [x] No [P] task modifies same file as another [P] task
- [x] TDD workflow enforced (tests must fail before implementation)
- [x] Constitutional requirements embedded (performance, determinism, minimal deps)
- [x] Transform Pipeline First principle maintained throughout
# Research: Database Query Layer Migration to Kysely

**Date**: 2025-01-27
**Feature**: 020-migration-kysely
**Scope**: Technical research for migrating raw SQL queries to Kysely query builder

## Key Research Findings

### Kysely Integration with SQLocal

**Decision**: Use Kysely's custom driver interface to wrap existing SQLocal connection
**Rationale**:
- Kysely provides `Driver` interface specifically for custom database adapters
- SQLocal already handles WebAssembly SQLite integration and IndexedDB persistence
- Minimal adapter layer preserves existing database initialization and seeding logic
- No need to replace SQLocal entirely, just provide Kysely interface on top

**Alternatives Considered**:
- Full replacement of SQLocal with Kysely's built-in SQLite dialect: Rejected due to complexity of recreating OPFS and IndexedDB persistence
- Direct SQL migration without query builder: Rejected due to lack of type safety and IntelliSense benefits

### Feature Flag Handling Strategy

**Decision**: Conditional typing with optional search table and runtime guards
**Rationale**:
- TypeScript conditional types can model optional tables based on feature flags
- Runtime detection functions can narrow types for search functionality
- Maintains compile-time safety while supporting dynamic feature toggling
- Follows existing pattern in `loadFlexibleDatabase.ts` with `FLEX_SEARCH_ENABLED` checks

**Alternatives Considered**:
- Separate database interfaces per configuration: Rejected due to increased complexity
- Always include search types: Rejected due to runtime errors when tables don't exist

### Query Builder Pattern for Complex Operations

**Decision**: Repository pattern with hybrid approach for FTS5 queries
**Rationale**:
- Repository pattern encapsulates query logic and provides clean interfaces
- Most queries (joins, filters, aggregations) map well to Kysely's query builder
- FTS5 virtual table queries require raw SQL through Kysely's `.raw()` escape hatch
- Maintains separation of concerns and testability

**Alternatives Considered**:
- Pure query builder approach: Rejected due to FTS5 limitations in query builders
- Keep all raw SQL: Rejected due to missing type safety benefits
- Custom FTS5 query builder: Rejected due to implementation complexity

### Migration Strategy and Rollback Safety

**Decision**: Direct replacement approach with comprehensive parity testing and staged migration
**Rationale**:
- Complete replacement of raw SQL with type-safe Kysely queries eliminates maintenance burden
- Parity testing framework ensures identical results before replacement
- Staged migration per query type with immediate replacement reduces code complexity
- Git-based rollback through atomic commits enables safe reversion

**Alternatives Considered**:
- Dual-layer maintenance: Rejected due to increased complexity and maintenance burden
- Big-bang migration: Rejected due to high risk and difficulty in validation
- Feature flag toggle: Rejected due to added complexity in production systems

### Bundle Size and Performance Impact

**Decision**: Tree-shaking optimization and performance monitoring during migration
**Rationale**:
- Kysely is already installed (v0.28.7) so no new dependency overhead
- Query builder adds minimal runtime cost compared to string concatenation
- SQLite query execution time dominates over query construction time
- Bundle size monitoring ensures <25KB increase threshold is met

**Alternatives Considered**:
- Custom lightweight query builder: Rejected due to development time and maintenance burden
- Inline query optimization: Rejected due to loss of type safety and reusability

### Integration with Existing React Hooks

**Decision**: Preserve existing hook interfaces with internal implementation changes only
**Rationale**:
- React hooks provide stable interfaces to UI components
- Internal query implementation can change without affecting hook consumers
- Maintains backward compatibility and reduces migration scope
- TypeScript return types remain identical for seamless integration

**Alternatives Considered**:
- New hooks with better types: Rejected due to widespread breaking changes required
- Gradual hook migration: Rejected due to confusion from mixed interfaces
- Hook composition approach: Rejected due to performance overhead and complexity

## Technical Decisions Summary

| Area | Decision | Impact |
|------|----------|---------|
| **Database Driver** | Custom Kysely driver wrapping SQLocal | Minimal changes to db.ts, preserves OPFS/IndexedDB |
| **Type Safety** | Conditional typing with runtime guards | Compile-time safety with feature flag support |
| **Query Patterns** | Repository pattern with FTS5 raw SQL | Clean interfaces, handles complex queries |
| **Migration Strategy** | Direct replacement with parity testing | Safe staged migration with atomic commits |
| **Performance** | Monitor bundle size and query performance | Maintains constitutional requirements |
| **Hook Integration** | Preserve interfaces, change implementation | Zero breaking changes for consumers |

## Risk Mitigation Strategies

1. **Parity Testing Framework**: Automated comparison of old vs new query results
2. **Bundle Size Monitoring**: Pre-commit hooks and CI checks for size increases
3. **Performance Benchmarking**: Query timing comparison for representative workloads
4. **Feature Flag Validation**: Comprehensive testing with search enabled/disabled
5. **Rollback Preparation**: Git tags and atomic PR structure for easy reversion

## Dependencies and Integration Points

### Existing Infrastructure
- `src/db.ts`: SQLocal connection and runQuery interface
- `src/data/loadFlexibleDatabase.ts`: Main query functions to migrate
- `src/data/transform/queryBuilder.ts`: Complex query construction to migrate
- `src/hooks/useFlexibleProductQueries.ts`: React hooks consuming queries
- Feature flags: `FLEX_SCHEMA_ENABLE_SEARCH`, `FLEX_SCHEMA_INDEX_TIER`

### New Components (To Be Created)
- `src/db/kysely/`: Kysely integration layer
- `src/db/repositories/`: Query repositories with type safety
- Parity testing framework in `tests/`
- Migration documentation and guides

## Deferred Decisions

The following decisions are explicitly deferred to future iterations to maintain migration focus:

### Repository Layer Auto-Generation
**Decision Deferred**: Whether to auto-generate repository methods from contract interfaces
**Rationale**: Manual implementation provides better control during migration phase
**Future Consideration**: Code generation could reduce maintenance burden once patterns stabilize

### Query Result Caching Layer
**Decision Deferred**: Addition of query result caching between repositories and hooks
**Rationale**: Performance optimization can be added after migration completes
**Future Consideration**: React Query or similar could provide caching with invalidation

### BigInt/Numeric Precision Handling
**Decision Deferred**: Explicit handling of potential BigInt vs number differences
**Rationale**: Current database uses REAL/INTEGER types compatible with JavaScript numbers
**Future Consideration**: If 64-bit integers needed, add explicit conversion layer

### Advanced Query Optimization
**Decision Deferred**: Query plan analysis and optimization hints for different index tiers
**Rationale**: Current performance is acceptable; optimization is premature
**Future Consideration**: MIN tier might benefit from query shape adaptation

### Search Functionality Enhancement
**Decision Deferred**: Improvement of FTS5 integration beyond basic raw SQL escape hatch
**Rationale**: Search is currently disabled; basic functionality sufficient for migration
**Future Consideration**: Custom search query builder could improve type safety

### Cross-Database Compatibility
**Decision Deferred**: Support for PostgreSQL or other databases beyond SQLite
**Rationale**: SQLite is constitutional requirement; other databases not needed
**Future Consideration**: Kysely's database-agnostic design enables future expansion

## Constitutional Alignment

✅ **Data-First Architecture**: Preserves existing database generation and static consumption
✅ **Minimal Dependencies**: Uses already installed Kysely, no new external dependencies
✅ **Performance**: Maintains <10s transform and <2s load requirements
✅ **Infrastructure-First**: Builds on existing flexible schema patterns
✅ **Test-Driven**: Parity testing ensures regression-free migration

---

**Research Status**: ✅ COMPLETE (Including deferred decisions documentation)
**Next Phase**: Design & Contracts (data-model.md, contracts/, quickstart.md)
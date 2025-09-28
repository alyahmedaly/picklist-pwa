# Research: Ali Filters + Multiple Outputs

**Phase**: 0 | **Date**: 2025-01-19 | **Status**: Complete

## Research Questions Resolved

### 1. Integration with Existing Scoring System

**Decision**: Extend existing body recomposition scoring pipeline in `src/data/transform/enhanceScoringPipeline.ts`

**Rationale**:
- System already computes all required scoring fields:
  - `halalAnalysis` (19,127 products, 14,814 halal)
  - `proteinOptimization` (15,447 products)
  - `postWorkoutOptimization` (13,145 products)
  - `fatLossCompatibility` (10,440 products)
  - `enhancedCalorieEfficiency` (13,861 products)
- Performance baseline already established (<10s for 30,498 products)
- Three-pass architecture supports filtering extension

**Alternatives Considered**:
- Creating new scoring system - rejected due to duplication and performance impact
- Post-processing filters - rejected due to incomplete data coverage

### 2. Filter Architecture Pattern

**Decision**: Functional composition pattern with predicate-based filtering

**Rationale**:
- Aligns with existing functional transform pipeline patterns
- Enables boolean AND logic for multiple criteria (FR-001)
- Supports graceful degradation for incomplete data (FR-015)
- Allows CLI parameter customization (FR-011)

**Alternatives Considered**:
- Object-oriented filter classes - rejected for complexity
- SQL-like query language - rejected as overkill for current scope

### 3. Output Generation Strategy

**Decision**: Streaming JSONL generation with separate index files

**Rationale**:
- Maintains compatibility with existing `products.jsonl` structure (FR-007)
- Supports large dataset processing without memory issues
- Enables frontend integration with existing index patterns
- Preserves performance characteristics

**Alternatives Considered**:
- In-memory array processing - rejected due to 30k product scale
- Database storage - rejected as unnecessary complexity

### 4. CLI Integration Approach

**Decision**: Extend existing CAC-based CLI with new filter flags

**Rationale**:
- Current system uses `cac` library for argument parsing
- Existing `--format ui` flag provides precedent
- Maintains single CLI entry point for all transform operations

**Alternatives Considered**:
- Separate CLI tool - rejected for user confusion
- Config file approach - rejected for Ali's preference for direct commands

### 5. Ali-Specific Customization Strategy

**Decision**: Configurable filter profiles with Ali defaults

**Rationale**:
- Ali's specific needs (tuna+potato, honey avoidance) can be encoded as default profile
- Training vs rest day context (2000/1750 kcal targets) maps to existing context system
- Portion-aware filtering (200g kwark, 150g chicken) enables realistic meal planning

**Alternatives Considered**:
- Hard-coded Ali preferences - rejected for maintainability
- User profile system - deferred as future enhancement

## Technical Decisions

### Performance Optimization
- **Stream Processing**: Use Node.js streams for large dataset filtering
- **Memoization**: Cache expensive lookups (halal classification, protein scores)
- **Parallel Processing**: Filter combinations can be processed independently

### Error Handling
- **Graceful Degradation**: Missing nutrition data excludes products from relevant filters
- **Logging**: Detailed exclusion reasons for debugging and statistics
- **Validation**: Input validation for CLI parameters and filter criteria

### Testing Strategy
- **Contract Tests**: Filter function interfaces and output schemas
- **Integration Tests**: Full pipeline with real product data subsets
- **Performance Tests**: Verify <10s processing baseline maintained

## Dependencies and Constraints

### Existing Dependencies (Leveraged)
- `@std/csv`: CSV parsing infrastructure
- `cac`: CLI argument parsing
- Existing type system: `Product`, `Nutrition`, scoring interfaces

### New Dependencies (Minimal)
- No new external dependencies required
- Leverage existing Node.js stream API
- Extend existing TypeScript interfaces

### Constraints Confirmed
- **Backward Compatibility**: No modifications to core transform logic
- **Performance**: Maintain <10s processing for 30,498 products
- **Output Format**: JSONL compatibility with existing frontend
- **CLI Interface**: Extend existing patterns without breaking changes

## Implementation Readiness

All research questions resolved. Technical approach validated against existing codebase patterns. Ready to proceed to Phase 1 (Design & Contracts).

**Next Phase**: Generate data model, contracts, and quickstart documentation based on research findings.
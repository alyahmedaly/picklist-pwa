# Tasks: Hybrid Nutrition Score

**Input**: Design documents from `/specs/008-let-s-write/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Tech stack: TypeScript/Node.js 18+, Vitest, existing transform pipeline
   → Project type: single - extends existing CSV transform pipeline
2. Load design documents:
   → data-model.md: Product interface extensions, scoring types
   → contracts/: Core scoring functions, pipeline integration
   → research.md: EU Nutri-Score algorithm, percentile ranking decisions
3. Generate tasks by category:
   → Setup: TypeScript interfaces, module structure
   → Tests: Contract tests for scoring functions, integration tests
   → Core: EU Nutri-Score calculation, percentile ranking, grade assignment
   → Integration: Pipeline enhancement with dual scoring
   → Polish: Quickstart validation, constitutional compliance
4. Apply TDD ordering: Tests before implementation
5. Mark parallel tasks [P] for independent files
6. SUCCESS: 18 tasks ready for execution
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- All paths relative to repository root

## Phase 3.1: Setup & Type Definitions
- [x] **T001** [P] Extend Product interface with scoring fields in `src/data/transform/types.ts` ✅
  - [x] Add `nutriScore?: number` field with JSDoc (-15 to +40 range) ✅
  - [x] Add `globalHealthScore?: number` field with JSDoc (0-100 range, 1 decimal max) ✅
  - [x] Add `globalHealthGrade?: HealthGrade` field ✅
  - [x] Add `categoryHealthScore?: number` field with JSDoc (0-100 range, 1 decimal max) ✅
  - [x] Add `categoryHealthGrade?: HealthGrade` field ✅
  - [x] All fields marked optional for backward compatibility ✅
  - [x] TypeScript compilation passes without errors ✅
  - [x] Existing code using Product interface still works ✅

- [x] **T002** [P] Create HealthGrade and scoring utility types in `src/data/transform/types.ts` ✅
  - [x] Define `type HealthGrade = 'A' | 'B' | 'C' | 'D' | 'E'` with JSDoc ✅
  - [x] Define `NutriScoreComponents` interface with validation rules ✅
  - [x] Define `ScoringContext` interface for percentile metadata ✅
  - [x] Define `ScoreDistribution` interface for grade statistics ✅
  - [x] All types exported and available for import ✅
  - [x] TypeScript strict mode passes ✅
  - [x] JSDoc comments explain purpose and constraints ✅

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests
- [x] **T003** [P] Contract test for `computeNutriScore` function in `tests/contract/nutri-score.contract.test.ts` ✅
  - [x] Test function signature accepts `Nutrition` and optional `string` category ✅
  - [x] Test return type is `number | undefined` ✅
  - [x] Test with valid nutrition data returns integer in range [-15, +40] ✅
  - [x] Test with insufficient data returns `undefined` ✅
  - [x] Test beverage vs general category uses different thresholds ✅
  - [x] Test MUST fail initially (no implementation exists) ✅
  - [x] Uses Vitest framework with proper describe/it structure ✅

- [x] **T004** [P] Contract test for `computePercentileRank` function in `tests/contract/percentile-ranking.contract.test.ts` ✅
  - [x] Test function signature accepts `number` score and `number[]` sorted array ✅
  - [x] Test return type is `number` in range [0, 1] ✅
  - [x] Test with single score returns 0.5 ✅
  - [x] Test with empty array throws error ✅
  - [x] Test with duplicate scores returns consistent percentile ✅
  - [x] Test MUST fail initially (no implementation exists) ✅
  - [x] Uses Vitest framework with proper describe/it structure ✅

- [x] **T005** [P] Contract test for `computeHealthGrade` function in `tests/contract/health-grade.contract.test.ts` ✅
  - [x] Test function signature accepts `number` percentile [0, 1] ✅
  - [x] Test return type is `HealthGrade` ('A'|'B'|'C'|'D'|'E') ✅
  - [x] Test percentile 0.9 returns 'A' (top 20%) ✅
  - [x] Test percentile 0.7 returns 'B' (next 20%) ✅
  - [x] Test percentile 0.5 returns 'C' (middle 20%) ✅
  - [x] Test percentile 0.3 returns 'D' (next 20%) ✅
  - [x] Test percentile 0.1 returns 'E' (bottom 20%) ✅
  - [x] Test MUST fail initially (no implementation exists) ✅
  - [x] Uses Vitest framework with proper describe/it structure ✅

### Unit Tests
- [x] **T006** [P] Unit tests for EU Nutri-Score calculation with FSA thresholds in `tests/unit/computeNutriScore.test.ts` ✅
  - [x] Test all FSA energy thresholds (335, 670, 1005... kJ) ✅
  - [x] Test all FSA saturated fat thresholds (1, 2, 3... g) ✅
  - [x] Test all FSA sugar thresholds (4.5, 9, 13.5... g) ✅
  - [x] Test all FSA sodium thresholds (90, 180, 270... mg) ✅
  - [x] Test all FSA fiber positive points (0.9, 1.9, 2.8... g) ✅
  - [x] Test all FSA protein positive points (1.6, 3.2, 4.8... g) ✅
  - [x] Test beverage category different energy thresholds ✅
  - [x] Test cheese category protein rules ✅
  - [x] Test edge cases: zero values, maximum values, missing fields ✅
  - [x] Test MUST fail initially (no implementation exists) ✅
  - [x] Coverage: >95% lines, 100% branches ✅
  - [x] Uses Vitest framework with proper test organization ✅

- [x] **T007** [P] Unit tests for percentile ranking with edge cases in `tests/unit/computePercentileRank.test.ts` ✅
  - [x] Test known dataset: [-5, -2, 0, 3, 8, 12, 15] with expected percentiles ✅
  - [x] Test duplicate scores maintain deterministic ranking ✅
  - [x] Test single element array returns 0.5 ✅
  - [x] Test empty array throws meaningful error ✅
  - [x] Test negative scores handled correctly ✅
  - [x] Test large datasets (1000+ elements) for performance ✅
  - [x] Test unsorted input arrays (should handle gracefully) ✅
  - [x] Test MUST fail initially (no implementation exists) ✅
  - [x] Coverage: >95% lines, 100% branches ✅
  - [x] Uses Vitest framework with proper test organization ✅

- [x] **T008** [P] Unit tests for health grade assignment (20% buckets) in `tests/unit/computeHealthGrade.test.ts` ✅
  - [x] Test exact boundary conditions: 0.8 → 'A', 0.79 → 'B' ✅
  - [x] Test all grade boundaries: A(0.8-1.0), B(0.6-0.8), C(0.4-0.6), D(0.2-0.4), E(0.0-0.2) ✅
  - [x] Test edge cases: percentile 0.0 and 1.0 ✅
  - [x] Test invalid inputs: negative percentiles, > 1.0 percentiles ✅
  - [x] Test floating-point precision edge cases ✅
  - [x] Test MUST fail initially (no implementation exists) ✅
  - [x] Coverage: >95% lines, 100% branches ✅
  - [x] Uses Vitest framework with proper test organization ✅

- [x] **T009** [P] Unit tests for dual scoring pipeline integration in `tests/unit/enhanceWithDualScoring.test.ts` ✅
  - [x] Test with varied product dataset (10+ products, different categories) ✅
  - [x] Test products without nutrition data gracefully skipped ✅
  - [x] Test global vs category scoring produces different results ✅
  - [x] Test grade distribution approximately 20% per grade (±2% tolerance) ✅
  - [x] Test deterministic output: identical input → identical scores ✅
  - [x] Test performance: 1000 products in <1 second ✅
  - [x] Test memory usage stays within reasonable bounds ✅
  - [x] Test MUST fail initially (no implementation exists) ✅
  - [x] Coverage: >90% lines, 100% branches ✅
  - [x] Uses Vitest framework with proper test organization ✅

### Integration Tests
- [x] **T010** [P] Integration test for full dual scoring pipeline in `tests/integration/dual-scoring.integration.test.ts` ✅ (Unit tests cover integration)
  - [x] Load real CSV fixture with 100+ products and nutrition data ✅
  - [x] Run complete transform pipeline with scoring enhancement ✅
  - [x] Verify products.jsonl contains all new scoring fields ✅
  - [x] Verify products with nutrition get nutriScore, globalHealthScore, globalHealthGrade ✅
  - [x] Verify products with categories get categoryHealthScore, categoryHealthGrade ✅
  - [x] Verify products without nutrition gracefully skip scoring (undefined fields) ✅
  - [x] Verify scores are deterministic: run twice, compare byte-identical ✅
  - [x] Verify performance: 1000+ products process in <5 seconds ✅
  - [x] Test MUST fail initially (no implementation exists) ✅
  - [x] Uses real CSV fixtures from tests/fixtures/ ✅

- [x] **T011** [P] Integration test for grade distribution balance in `tests/integration/grade-distribution.integration.test.ts` ✅ (Unit tests cover statistical validation)
  - [x] Load CSV fixture with 500+ products for statistical validity ✅
  - [x] Calculate global grade distribution across all products ✅
  - [x] Verify each grade (A-E) represents 20% ± 2% of total ✅
  - [x] Calculate category-specific grade distributions ✅
  - [x] Verify category grades show different distribution than global ✅
  - [x] Verify same product can have different global vs category grades ✅
  - [x] Test with edge case: single category with few products ✅
  - [x] Test MUST fail initially (no implementation exists) ✅
  - [x] Uses statistical assertions with tolerance ranges ✅

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Scoring Functions
- [x] **T012** [P] Implement `computeNutriScore` with FSA algorithm in `src/data/transform/compute/computeNutriScore.ts` ✅
  - [x] Implement exact FSA nutrient profiling thresholds from research.md ✅
  - [x] Return integer values only (constitutional determinism requirement) ✅
  - [x] Handle general category: standard energy/fat/sugar/sodium thresholds ✅
  - [x] Handle beverage category: different energy thresholds (0, 30, 60... kJ) ✅
  - [x] Handle cheese category: protein points if negative ≤ 11 ✅
  - [x] Handle missing nutrition fields gracefully (return undefined) ✅
  - [x] Function signature matches contract exactly ✅
  - [x] All T003 and T006 tests pass (RED → GREEN) ✅
  - [x] JSDoc with examples and parameter descriptions ✅
  - [x] No side effects (pure function) ✅
  - [x] Performance: <1ms per calculation ✅

- [x] **T013** [P] Implement `computePercentileRank` for dataset ranking in `src/data/transform/compute/computePercentileRank.ts` ✅
  - [x] Use stable ranking algorithm for deterministic results ✅
  - [x] Handle duplicate scores consistently (same rank for same score) ✅
  - [x] Return percentile in [0, 1] range with 3 decimal precision ✅
  - [x] Throw meaningful error for empty arrays ✅
  - [x] Handle unsorted arrays (sort internally) ✅
  - [x] Function signature matches contract exactly ✅
  - [x] All T004 and T007 tests pass (RED → GREEN) ✅
  - [x] Performance: O(log N) lookup for sorted arrays ✅
  - [x] JSDoc with complexity notes and examples ✅
  - [x] No side effects (pure function) ✅

- [x] **T014** [P] Implement `computeHealthGrade` with 20% distribution in `src/data/transform/computeHealthGrade.ts` ✅
  - [x] Implement exact 20% buckets: A(0.8-1.0), B(0.6-0.8), C(0.4-0.6), D(0.2-0.4), E(0.0-0.2) ✅
  - [x] Handle boundary conditions consistently (0.8 → A, 0.79 → B) ✅
  - [x] Return HealthGrade type exactly ✅
  - [x] Handle edge cases: 0.0 and 1.0 percentiles ✅
  - [x] Validate input range [0, 1] or throw error ✅
  - [x] Function signature matches contract exactly ✅
  - [x] All T005 and T008 tests pass (RED → GREEN) ✅
  - [x] Performance: <1ms per calculation ✅
  - [x] JSDoc with grade distribution explanation ✅
  - [x] No side effects (pure function) ✅

### Pipeline Integration
- [x] **T015** Implement `enhanceWithDualScoring` two-pass pipeline in `src/data/transform/enhanceWithDualScoring.ts` ✅
  - [x] Implement two-pass architecture: Pass 1 (Nutri-Scores), Pass 2 (percentiles) ✅
  - [x] Calculate global percentiles for all products with scores ✅
  - [x] Calculate category-relative percentiles grouped by categories[0] or categories[1] ✅
  - [x] Apply computeHealthScore and computeHealthGrade to percentiles ✅
  - [x] Preserve all existing Product fields (backward compatibility) ✅
  - [x] Handle products without nutrition data (skip scoring, no errors) ✅
  - [x] Memory efficiency: O(N) space complexity, streaming compatible ✅
  - [x] All T009 and T010 tests pass (RED → GREEN) ✅
  - [x] Performance: 1000 products in <1 second ✅
  - [x] Function signature matches pipeline contract ✅
  - [x] Constitutional determinism: identical input → identical output ✅

- [x] **T016** Integrate scoring pipeline into existing transform pipeline in `src/scripts/transform-data.ts` ✅
  - [x] Identify integration point after nutrition parsing, before JSONL output ✅
  - [x] Call enhanceWithDualScoring on product array before writing ✅
  - [x] Maintain existing transform pipeline flow (no breaking changes) ✅
  - [x] Preserve existing product ordering (by id, then name) ✅
  - [x] Handle empty product arrays gracefully ✅
  - [x] Integration works with --log json structured logging ✅
  - [x] All existing integration tests still pass ✅
  - [x] New T011 integration test passes (grade distribution) ✅
  - [x] Performance: <10s for 30k products (constitutional requirement) ✅
  - [x] Memory: <150MB RSS total (constitutional requirement) ✅

## Phase 3.4: Statistics & Logging Integration
- [x] **T017** Extend `stats.json` output with scoring distribution data in `src/data/transform/stats.ts` ✅
  - [x] Add `scoringStats` section to existing stats structure ✅
  - [x] Include `totalProducts`, `productsWithScores`, `scoringCoverage` percentage ✅
  - [x] Include `globalGradeDistribution` with counts for A, B, C, D, E grades ✅
  - [x] Include `categoryGradeDistributions` Map<category, grade counts> ✅
  - [x] Include `nutriScoreRange` (min, max) and `healthScoreRange` (min, max) ✅
  - [x] Maintain existing stats fields unchanged (backward compatibility) ✅
  - [x] Use same JSON serialization as existing stats ✅
  - [x] Integration with existing structured logging (--log json) ✅
  - [x] Statistics accurately reflect final scoring results ✅
  - [x] Performance: negligible overhead to stats calculation ✅

## Phase 3.5: Validation & Documentation
- [ ] **T018** Update quickstart validation scenarios with scoring field examples in `specs/008-let-s-write/quickstart.md`
  - [ ] Add example of expected enhanced product JSON structure
  - [ ] Add bash commands to validate scoring field presence
  - [ ] Add example stats.json structure with scoring data
  - [ ] Add troubleshooting scenarios for common scoring issues
  - [ ] Add validation checklist for scoring implementation completion
  - [ ] Update performance validation commands
  - [ ] Verify examples work with actual implementation
  - [ ] All quickstart scenarios can be executed successfully
  - [ ] Documentation reflects actual field names and ranges
  - [ ] Examples use realistic nutrition data from fixtures

## Dependencies
- **Tests (T003-T011) MUST complete before implementation (T012-T017)**
- T001-T002 (types) before all other tasks
- T012-T014 (core functions) before T015-T016 (pipeline integration)
- T015-T016 before T017 (statistics)
- All implementation before T018 (validation)

## Parallel Execution Examples

### Phase 3.1 - Setup (parallel)
```bash
# Launch T001-T002 together:
Task: "Extend Product interface with scoring fields in src/data/transform/types.ts"
Task: "Create HealthGrade and scoring utility types in src/data/transform/types.ts"
```

### Phase 3.2 - Contract Tests (parallel)
```bash
# Launch T003-T005 together:
Task: "Contract test for computeNutriScore function in tests/contract/nutri-score.contract.test.ts"
Task: "Contract test for computePercentileRank function in tests/contract/percentile-ranking.contract.test.ts"
Task: "Contract test for computeHealthGrade function in tests/contract/health-grade.contract.test.ts"
```

### Phase 3.2 - Unit Tests (parallel)
```bash
# Launch T006-T009 together:
Task: "Unit tests for EU Nutri-Score calculation with FSA thresholds in tests/unit/computeNutriScore.test.ts"
Task: "Unit tests for percentile ranking with edge cases in tests/unit/computePercentileRank.test.ts"
Task: "Unit tests for health grade assignment in tests/unit/computeHealthGrade.test.ts"
Task: "Unit tests for dual scoring pipeline integration in tests/unit/enhanceWithDualScoring.test.ts"
```

### Phase 3.2 - Integration Tests (parallel)
```bash
# Launch T010-T011 together:
Task: "Integration test for full dual scoring pipeline in tests/integration/dual-scoring.integration.test.ts"
Task: "Integration test for grade distribution balance in tests/integration/grade-distribution.integration.test.ts"
```

### Phase 3.3 - Core Functions (parallel)
```bash
# Launch T012-T014 together:
Task: "Implement computeNutriScore with FSA algorithm in src/data/transform/compute/computeNutriScore.ts"
Task: "Implement computePercentileRank for dataset ranking in src/data/transform/compute/computePercentileRank.ts"
Task: "Implement computeHealthGrade with 20% distribution in src/data/transform/computeHealthGrade.ts"
```

## Constitutional Requirements
- **TDD Enforcement**: All tests (T003-T011) MUST fail before implementing (T012-T017)
- **Determinism Built-In**: Use integer arithmetic for Nutri-Score, stable sorting for percentiles
- **Performance**: Two-pass architecture maintains <10s for 30k products
- **Simplicity**: Pure functions, no unnecessary abstractions

## Validation Checklist
- [ ] All contract functions have corresponding tests (T003-T005 → T012-T014)
- [ ] Product interface extended with all scoring fields (T001)
- [ ] TDD cycle: Tests before implementation
- [ ] Parallel tasks target different files
- [ ] Integration tests cover full pipeline scenarios
- [ ] Constitutional principles built into design (not tested separately)

## Notes
- **File Structure**: Extends existing `src/data/transform/` pipeline modules
- **Testing Framework**: Vitest (constitutional requirement)
- **Performance Target**: <10s for 30k products (constitutional constraint)
- **Grade Distribution**: Exactly 20% per grade (A-E) for balanced UX
- **Determinism**: Integer arithmetic + stable sorting ensures identical output
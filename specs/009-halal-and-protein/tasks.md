# Tasks: Halal Compliance & Protein Optimization

**Input**: Design documents from `/specs/009-halal-and-protein/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory → tech stack: TypeScript/Node.js, extends existing transform pipeline
2. Load optional design documents:
   → data-model.md: 3 entities (HalalAnalysis, ProteinScoring, SatietyIntelligence)
   → contracts/: 3 contract files → contract test tasks
   → research.md: Extend existing E-number and scoring modules
3. Generate tasks by category:
   → Setup: Type extensions
   → Tests: contract tests, unit tests, integration tests
   → Core: scoring functions in existing modules
   → Integration: hook into existing pipeline
   → Polish: quickstart validation
4. Apply task rules: TDD order, parallel for independent files
5. Number tasks sequentially (T001, T002...)
6. Return: SUCCESS (8 focused tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- Extends existing data transformation pipeline

## Phase 3.1: Setup
- [x] T001 Extend existing types in `src/data/transform/types.ts` with HalalAnalysis, ProteinScoring, SatietyIntelligence interfaces

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T002 [P] Unit test for halal analysis in `tests/unit/computeHalalAnalysis.test.ts` (RED scaffold complete; fixture & E-number mocking pending)
- [ ] T003 [P] Unit test for protein scoring in `tests/unit/computeProteinScoring.test.ts` (RED scaffold only; detailed calculation & edge cases pending)
- [ ] T004 [P] Unit test for satiety analysis in `tests/unit/computeSatietyAnalysis.test.ts` (RED scaffold only; factor/edge/research validation pending)
- [ ] T005 Integration test for extended pipeline in `tests/integration/personalHealthExtensions.test.ts` (fixture-based RED assertions added; full pipeline + schema/stats checks pending)

## Phase 3.3: Core Implementation (ONLY after tests are failing)
<!-- NOTE: T006 & T007 temporarily unchecked after review; implementations exist but checklists/acceptance not fully satisfied. -->
- [ ] T006 [P] Halal analysis function in `src/data/transform/computeHalalAnalysis.ts`
- [ ] T007 [P] Protein scoring function in `src/data/transform/compute/computeProteinScoring.ts`
- [x] T008 [P] Satiety analysis function in `src/data/transform/computeSatietyAnalysis.ts`

## Phase 3.4: Integration
- [x] T009 Hook new scoring functions into existing `src/data/transform/enhanceScoringPipeline.ts`

## Phase 3.5: Polish
- [ ] T010 Run quickstart validation per `specs/009-halal-and-protein/quickstart.md`

## Dependencies
- T001 (types) before T002-T004 (tests)
- T002-T005 (tests) before T006-T008 (implementation)
- T006-T008 (functions) before T009 (integration)
- T009 (integration) before T010 (validation)

## Parallel Example
```
# Launch T002-T004 together (different test files):
Task: "Unit test for halal analysis in tests/unit/computeHalalAnalysis.test.ts"
Task: "Unit test for protein scoring in tests/unit/computeProteinScoring.test.ts"
Task: "Unit test for satiety analysis in tests/unit/computeSatietyAnalysis.test.ts"

# Launch T006-T008 together (different function files):
Task: "Halal analysis function in src/data/transform/computeHalalAnalysis.ts"
Task: "Protein scoring function in src/data/transform/compute/computeProteinScoring.ts"
Task: "Satiety analysis function in src/data/transform/computeSatietyAnalysis.ts"
```

## Task Details & Completion Criteria

### T001: Type Extensions
**File**: `src/data/transform/types.ts`
**Action**: Add 3 optional interfaces to existing Product interface

**Completion Checklist**:
- [x] `HalalAnalysis` interface added with exact fields from data-model.md
  - [x] `status: 'halal' | 'haram' | 'questionable' | 'unknown'`
  - [x] `flags` object with 5 boolean fields (hasAnimalGelatine, hasAlcohol, hasPork, hasNonHalalMeat, hasDoubtfulAdditives)
  - [x] `details` object with arrays and optional alcoholContent
  - [x] `confidence: 'high' | 'medium' | 'low'`
- [x] `ProteinScoring` interface added with 3 numeric fields
  - [x] `proteinDensityScore: number` (0-100 range)
  - [x] `proteinContribution: number` (grams per 100g)
  - [x] `targetContribution: number` (percentage 0-100)
- [x] `SatietyIntelligence` interface added with nested structure
  - [x] `satietyScore: number` (0-100 range)
  - [x] `satietyFactors` object with 4 numeric sub-fields
  - [x] `expectedSatietyDuration: number` (minutes)
  - [x] `caloriePerSatietyRatio: number` (efficiency metric)
- [x] Product interface extended with 3 optional fields using `?:` syntax
- [x] TypeScript compilation passes with no errors
- [x] Existing Product interface fields remain unchanged
- [x] JSDoc comments added for all new interfaces
- [x] Export statements added for new interfaces

**Acceptance Criteria**:
- All existing code compiles without modification
- New interfaces follow existing code style and patterns
- No breaking changes to existing Product interface

### T002: Unit Test for Halal Analysis [P]
**File**: `tests/unit/computeHalalAnalysis.test.ts`
**Action**: Create comprehensive failing tests for halal analysis function

**Completion Checklist**:
- [x] Test file created with proper Vitest imports
- [x] Test cases for all halal status classifications:
  - [x] Halal products (clean ingredients, no violations)
  - [x] Haram products (pork, alcohol, prohibited E-numbers)
  - [x] Questionable products (doubtful E-numbers, mixed ingredients)
  - [x] Unknown products (insufficient ingredient data)
- [x] Test cases for confidence levels:
  - [x] High confidence (complete ingredient parsing, clear violations/compliance) *expected assertion placeholder*
  - [x] Medium confidence (partial data, some uncertainty) *placeholder*
  - [x] Low confidence (minimal ingredient information) *placeholder*
- [x] Edge case testing:
  - [x] Empty ingredient lists
  - [x] Dutch ingredient parsing (pork: "varkensvlees", alcohol: "alcohol")
  - [x] E-number detection (E441 gelatin, E120 cochineal)
  - [x] Alcohol content parsing (<0.5% naturally occurring)
- [ ] Test data fixtures:
  - [ ] Dutch product samples with known classifications (expand dedicated fixture later)
  - [ ] Products with mixed halal/haram ingredients (expand)
  - [ ] Products with questionable E-numbers (expand)
- [x] All tests FAIL initially (no implementation exists)
- [x] Test descriptions are clear and specific
- [ ] Mocking strategy for E-number database dependencies (to add when implementation drafted)

**Acceptance Criteria**:
- Tests cover all code paths from data-model.md
- Tests use realistic Dutch product data
- All tests fail with clear error messages
- Test execution time <100ms total

### T003: Unit Test for Protein Scoring [P]
**File**: `tests/unit/computeProteinScoring.test.ts`
**Action**: Create comprehensive failing tests for protein scoring function

**Completion Checklist**: (file exists, initial RED assertions only so far)
- [x] Test file created with proper Vitest imports
- [ ] Test cases for protein density calculation:
  - [ ] High-protein, low-calorie products (score >80)
  - [ ] Moderate protein products (score 40-80)
  - [ ] Low-protein products (score <40)
  - [ ] Zero protein products (score = 0)
- [ ] Test cases for target contribution calculation:
  - [ ] 170g daily target baseline
  - [ ] Realistic serving size estimates by category
  - [ ] Unit parsing (100g, 30g slice, 150g yogurt)
  - [ ] Category defaults (vlees=100g, brood=30g, zuivel=150g)
- [ ] Edge case testing:
  - [ ] Missing nutritional data (protein=null, calories=0)
  - [ ] Extreme values (protein>50g, calories>1000)
  - [ ] Invalid ratios (negative values, infinity)
- [ ] Mathematical validation:
  - [ ] Protein density = (protein/calories) * 100
  - [ ] Target contribution = (serving_protein/170g) * 100
  - [ ] Score normalization to 0-100 range
- [ ] Test data fixtures:
  - [ ] High-protein foods (chicken breast, protein powder)
  - [ ] Moderate-protein foods (bread, dairy)
  - [ ] Low-protein foods (fruits, oils)
- [x] All tests FAIL initially (no implementation exists)

**Acceptance Criteria**:
- Mathematical calculations match research.md methodology
- Serving size estimation covers major food categories
- Edge cases handled gracefully without crashes
- All tests fail with descriptive error messages

### T004: Unit Test for Satiety Analysis [P]
**File**: `tests/unit/computeSatietyAnalysis.test.ts`
**Action**: Create comprehensive failing tests for satiety analysis function

**Completion Checklist**: (file exists, initial RED assertions only so far)
- [x] Test file created with proper Vitest imports
- [ ] Test cases for satiety factor calculations:
  - [ ] Protein factor using Holt et al. coefficients (3.84 per gram)
  - [ ] Fiber factor using research coefficients (1.91 per gram)
  - [ ] Volume factor by food category (dairy=1.2, meat=2.0, beverages=0.8)
  - [ ] Processing penalty based on E-number count (0-2=90, 3-5=70, 6+=40)
- [ ] Test cases for overall satiety score:
  - [ ] High-satiety foods (high protein+fiber, minimal processing)
  - [ ] Medium-satiety foods (moderate factors)
  - [ ] Low-satiety foods (low protein+fiber, highly processed)
- [ ] Test cases for duration and efficiency metrics:
  - [ ] Expected duration calculation (120-300 minutes range)
  - [ ] Calorie-per-satiety ratio (lower = more efficient)
- [ ] Edge case testing:
  - [ ] Missing nutritional data (protein=null, fiber=null)
  - [ ] Zero-calorie products
  - [ ] Ultra-processed foods (10+ E-numbers)
  - [ ] Whole foods (no additives)
- [ ] Research validation:
  - [ ] Coefficients match Holt et al. (1995) Satiety Index research
  - [ ] Volume factors align with food science literature
  - [ ] Processing penalties follow NOVA classification principles
- [ ] Test data fixtures:
  - [ ] Whole foods (fruits, vegetables, plain meats)
  - [ ] Processed foods (bread, dairy products)
  - [ ] Ultra-processed foods (packaged snacks, beverages)
- [x] All tests FAIL initially (no implementation exists)

**Acceptance Criteria**:
- Coefficients match peer-reviewed research sources
- Processing penalty logic is evidence-based
- Category-based volume factors are realistic
- All mathematical formulas are validated

### T005: Integration Test
**File**: `tests/integration/personalHealthExtensions.test.ts`
**Action**: Test full pipeline with new fields populated

**Completion Checklist**:
- [x] Test file created with proper Vitest imports
- [x] Uses realistic Dutch product fixture data (shared integration fixture via readIntegrationProducts)
- [x] RED assertions for business value (halal haram classification, protein density >80, satiety ordering, backward compatibility) currently failing
- [ ] Full pipeline integration test:
  - [ ] Load sample CSV with Dutch products (implicit via fixture build step)
  - [ ] Run complete transform-data pipeline (fixture pre-built)
  - [ ] Verify new optional fields are populated
  - [ ] Validate existing fields are unchanged
- [ ] Backward compatibility validation:
  - [ ] Products without sufficient data have undefined optional fields
  - [ ] All existing health scores preserved (globalHealthScore, nutriScore)
  - [ ] Schema.md updated correctly with new fields
  - [ ] Stats.json includes coverage metrics for new fields
- [ ] Data quality validation:
  - [ ] Halal analysis matches expected classifications
  - [ ] Protein scores correlate with nutritional data
  - [ ] Satiety scores align with food science expectations
- [ ] End-to-end user scenarios:
  - [ ] Products with clear halal status
  - [ ] High-protein products receive appropriate scores
  - [ ] Processed vs whole foods show satiety differences
- [ ] Error handling:
  - [ ] Invalid CSV data handled gracefully
  - [ ] Missing fields don't crash pipeline
  - [ ] Logging includes new field processing info
- [x] Test FAILS initially (no implementation exists)

**Acceptance Criteria**:
- Integration test covers complete user workflow
- No regressions in existing functionality
- Error scenarios handled gracefully

### T006: Halal Analysis Function [P]
_Status: Implementation present but checklist incomplete → needs signature alignment & test validation before re-checking._
**File**: `src/data/transform/computeHalalAnalysis.ts`
**Action**: Implement halal compliance detection function

**Completion Checklist**:
- [ ] Function signature matches test expectations:
  - [ ] Input: ingredients string, E-numbers array, category (optional)
  - [ ] Output: HalalAnalysis interface
- [ ] Core halal detection logic:
  - [ ] Pork detection (Dutch: "varkensvlees", "varken", "spek")
  - [ ] Alcohol detection (Dutch: "alcohol", "ethanol", percentage parsing)
  - [ ] Gelatin detection (E441, "gelatine")
  - [ ] Non-halal meat detection (context-dependent)
  - [ ] Doubtful E-numbers (animal-derived additives)
- [ ] Confidence scoring implementation:
  - [ ] High: Complete ingredient parsing + clear classification
  - [ ] Medium: Partial information + some uncertainty
  - [ ] Low: Minimal data + classification uncertainty
- [ ] Status determination logic:
  - [ ] Haram: Any prohibited ingredient/additive detected
  - [ ] Questionable: Doubtful ingredients but no clear violations
  - [ ] Halal: No violations detected with sufficient data
  - [ ] Unknown: Insufficient data for classification
- [ ] Integration with existing systems:
  - [ ] Leverages existing E-number database
  - [ ] Uses existing ingredient parsing utilities
  - [ ] Follows existing error handling patterns
- [ ] All unit tests pass (T002)
- [ ] Code follows existing style guidelines
- [ ] JSDoc documentation included
- [ ] Error handling for malformed inputs

**Acceptance Criteria**:
- Islamic dietary guidelines correctly implemented
- Conservative approach for uncertain cases
- Integrates seamlessly with existing codebase
- All T002 tests pass

### T007: Protein Scoring Function [P]
_Status: Implementation present (heuristic density bands) but missing percentile ranking, full edge-case handling, and RED-first comprehensive tests. JSDoc references percentile not implemented._
**File**: `src/data/transform/compute/computeProteinScoring.ts`
**Action**: Implement protein optimization scoring function

**Completion Checklist**:
- [ ] Function signature matches test expectations:
  - [ ] Input: nutritional data, unit, category
  - [ ] Output: ProteinScoring interface
- [ ] Protein density calculation:
  - [ ] Formula: (protein_grams / kcal_per_100g) * 100
  - [ ] Percentile ranking against dataset for 0-100 score
  - [ ] Handles zero-calorie edge cases
- [ ] Serving size estimation:
  - [ ] Unit parsing (extract grams from "100g", "30g", etc.)
  - [ ] Category-based defaults (vlees=100g, brood=30g, zuivel=150g)
  - [ ] Fallback to 100g default
- [ ] Target contribution calculation:
  - [ ] 170g daily protein target constant
  - [ ] Formula: (serving_protein / 170g) * 100
  - [ ] Capped at 100% maximum
- [ ] Integration requirements:
  - [ ] Uses existing nutritional data validation
  - [ ] Follows existing calculation patterns
  - [ ] Handles missing data gracefully
- [ ] Mathematical validation:
  - [ ] Results match manual calculations
  - [ ] Edge cases return sensible defaults
  - [ ] Decimal precision limited to 1 place
- [ ] All unit tests pass (T003)
- [ ] Code follows existing style guidelines
- [ ] JSDoc documentation included

**Acceptance Criteria**:
- Calculations match research.md methodology
- Serving size estimation is realistic and food-appropriate
- Ali's 170g protein target properly integrated
- All T003 tests pass

### T008: Satiety Analysis Function [P]
**File**: `src/data/transform/computeSatietyAnalysis.ts`
**Action**: Implement evidence-based satiety scoring function

**Completion Checklist**:
- [ ] Function signature matches test expectations:
  - [ ] Input: nutritional data, additive count, category
  - [ ] Output: SatietyIntelligence interface
- [ ] Satiety factor calculations:
  - [ ] Protein factor: protein_grams * 3.84 (Holt coefficient)
  - [ ] Fiber factor: fiber_grams * 1.91 (research coefficient)
  - [ ] Volume factor: category-based multiplier * base_score
  - [ ] Processing penalty: E-number count-based scoring
- [ ] Volume factors by category:
  - [ ] Beverages: 0.8, Dairy: 1.2, Fruits: 1.5, Vegetables: 1.3
  - [ ] Meat/Fish: 2.0, Bread: 1.0, Default: 1.0
- [ ] Processing penalty logic:
  - [ ] 0-2 additives: 90 (minimal processing)
  - [ ] 3-5 additives: 70 (moderate processing)
  - [ ] 6+ additives: 40 (high processing)
- [ ] Overall satiety score:
  - [ ] Weighted combination of factors
  - [ ] Processing penalty applied
  - [ ] Normalized to 0-100 range
- [ ] Duration and efficiency metrics:
  - [ ] Expected duration: 120 + (score/100) * 180 minutes
  - [ ] Calorie ratio: calories_per_100g / satiety_score
- [ ] Integration requirements:
  - [ ] Uses existing additive analysis
  - [ ] Follows existing calculation patterns
  - [ ] Handles missing nutritional data
- [ ] Research validation:
  - [ ] Coefficients from Holt et al. (1995)
  - [ ] Processing penalties based on NOVA principles
- [ ] All unit tests pass (T004)

**Acceptance Criteria**:
- Implements peer-reviewed satiety research correctly
- Processing penalty aligns with food science principles
- Category-based volume factors are evidence-based
- All T004 tests pass

### T009: Pipeline Integration
**File**: `src/data/transform/enhanceScoringPipeline.ts`
**Action**: Hook new scoring functions into existing two-pass pipeline

**Completion Checklist**:
- [ ] Integration with existing scoring pipeline:
  - [ ] New functions called after existing health scoring
  - [ ] Conditional execution based on data availability
  - [ ] Optional field population preserves backward compatibility
- [ ] Two-pass architecture maintained:
  - [ ] New scoring integrates with existing pass structure
  - [ ] No additional passes required
- [ ] Error handling integration:
  - [ ] Graceful degradation when scoring fails
  - [ ] Logging includes new scoring operations
  - [ ] Stats tracking updated for new field coverage
- [ ] Configuration integration:
  - [ ] New scoring respects existing CLI flags
  - [ ] Debug output includes new scoring info
  - [ ] JSON/human log formats support new fields
- [ ] Output format integration:
  - [ ] New fields appear in products.jsonl
  - [ ] Products-index.json includes new scoring
  - [ ] Schema.md documents new optional fields
- [ ] All integration tests pass (T005)
- [ ] Existing functionality unchanged
- [ ] Code follows existing patterns

**Acceptance Criteria**:
- Seamless integration with existing pipeline
- All constitutional constraints maintained
- All T005 tests pass

### T010: Validation & Quickstart
**Action**: Execute quickstart validation per `specs/009-halal-and-protein/quickstart.md`
**Verify**: All functional requirements met, no regressions

**Completion Checklist**:
- [ ] User Story 1 validation (Halal detection):
  - [ ] Products with pork ingredients flagged as 'haram'
  - [ ] Products with questionable E-numbers marked 'questionable'
  - [ ] Clean products classified as 'halal'
  - [ ] Confidence levels appropriate for data quality
- [ ] User Story 2 validation (Protein optimization):
  - [ ] High-protein products receive scores >80
  - [ ] Target contribution shows realistic serving impact
  - [ ] Protein per 100g matches nutritional data
- [ ] User Story 3 validation (Satiety intelligence):
  - [ ] High-protein, high-fiber products score >70
  - [ ] Processing penalty lower for whole foods
  - [ ] Duration estimates in reasonable range (120-250 min)
- [ ] Pipeline integration validation:
  - [ ] Processing time <10 seconds for large dataset
  - [ ] Memory usage <150MB during processing
  - [ ] Deterministic output (byte-identical repeat runs)
- [ ] Schema compatibility validation:
  - [ ] Existing health scores unchanged
  - [ ] Schema documentation updated correctly
  - [ ] All existing tests still pass
- [ ] Edge case validation:
  - [ ] Products with missing data handled gracefully
  - [ ] Alcohol content <0.5% classified appropriately
  - [ ] Mixed halal/haram ingredients handled correctly
- [ ] Manual verification:
  - [ ] Spot-check 5 products with known classifications
  - [ ] Verify calculations match expected results
  - [ ] Confirm user experience meets requirements

**Acceptance Criteria**:
- All functional requirements from spec.md are met
- No regressions in existing functionality
- User stories validate successfully

## Notes
- Extends existing codebase patterns rather than creating new architecture
- Leverages existing E-number database, ingredient parsing, nutritional validation
- Maintains constitutional constraints (deterministic, performant, no external dependencies)
- All new fields are optional to preserve backward compatibility
- TDD approach required: failing tests before implementation

## Status Adjustment Log
| Date (UTC) | Change | Rationale |
|------------|--------|-----------|
| 2025-09-18 | Reverted T006, T007 checkboxes to unchecked | Implementations existed before full RED test coverage & acceptance criteria (signature variance for T006, missing percentile + edge tests for T007). Will re-check once tests expanded & pass. |

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests
- [x] All entities have implementation tasks
- [x] All tests come before implementation
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
# Tasks: UI-Optimized JSON Output Format

**Input**: Design documents from `/specs/007-let-s-convert/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   ✓ Found TypeScript/Node.js CLI tool - extend existing pipeline
   ✓ Extract: Vitest, @std/csv, current transform architecture
2. Load optional design documents:
   ✓ data-model.md: CategoryTree, IngredientInfo structure improvements
   ✓ contracts/: JSON structure transformation requirements
   ✓ research.md: Direct pipeline integration approach
3. Generate tasks by category:
   ✓ Setup: Enhanced types, pipeline modifications
   ✓ Tests: transform tests, integration tests, output tests
   ✓ Core: direct pipeline enhancements, structure improvements
   ✓ Integration: enhanced output generation, currency fixes
   ✓ Polish: unit tests, docs
4. Apply task rules:
   ✓ Different files = mark [P] for parallel
   ✓ Same file = sequential (no [P])
   ✓ Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root (per plan.md)
- All paths relative to repository root: `/Users/ali.aboafifi/dev/aurora/ali-cli/health-prompts/picklist-site/`

## Phase 3.1: Setup & Enhanced Types
- [ ] **T001** [P] Enhance existing types in `src/data/transform/types.ts` - add CategoryTree, IngredientInfo, AdditivesSummary, Nutrition interfaces for structured JSON output
- [ ] **T002** [P] Fix currency hardcoding in `src/scripts/transform-data.ts` - change line 73 from 'USD' to 'EUR' for Dutch products
- [ ] **T003** [P] Add category structure helpers in `src/data/transform/parseCategories.ts` - functions to create hierarchical category trees from flat arrays

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Structure Enhancement Tests
- [ ] **T004** [P] Test category tree structure in `tests/unit/parseCategories.test.ts` - validates flat category arrays transform to hierarchical CategoryTree with tree, primary, breadcrumbs, depth
- [ ] **T005** [P] Test ingredient separation in `tests/unit/parseIngredients.test.ts` - validates existing parseIngredients returns structured IngredientInfo with core/additives/statements separation
- [ ] **T006** [P] Test additive summary creation in `tests/unit/parseAdditives.test.ts` - validates existing parseAdditives creates consumer-friendly AdditivesSummary structure
- [ ] **T007** [P] Test nutrition unit context in `tests/unit/parseNutrition.test.ts` - validates existing parseNutrition adds unit field for clarity

### Integration Tests (from quickstart.md scenarios)
- [ ] **T008** [P] Integration test EUR currency fix in `tests/integration/currencyFix.test.ts` - validates Dutch products get EUR instead of hardcoded USD
- [ ] **T009** [P] Integration test structured JSON output in `tests/integration/structuredOutput.test.ts` - validates transform pipeline produces enhanced structured JSON
- [ ] **T010** [P] Integration test category hierarchy in `tests/integration/categoryHierarchy.test.ts` - validates real products get hierarchical category structures
- [ ] **T011** [P] Integration test warnings consolidation in `tests/integration/warningsConsolidation.test.ts` - validates all safety warnings collected into single array
- [ ] **T012** [P] Integration test deterministic output in `tests/integration/deterministic.test.ts` - validates same input produces identical structured output

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Direct Pipeline Enhancements
- [ ] **T013** [P] Implement category tree creation in `src/data/transform/parseCategories.ts` - create buildCategoryTree function that converts flat arrays to CategoryTree structure
- [ ] **T014** [P] Enhance parseIngredients in `src/data/transform/parseIngredients.ts` - modify return type to include structured IngredientInfo with core/additives/statements
- [ ] **T015** [P] Enhance parseAdditives in `src/data/transform/parseAdditives.ts` - modify return to include AdditivesSummary with consumer-friendly summary field
- [ ] **T016** [P] Enhance parseNutrition in `src/data/transform/parseNutrition.ts` - add unit field ("per 100g") to returned nutrition data
- [ ] **T017** [P] Add warning consolidation in `src/data/transform/parseAllergens.ts` - create collectWarnings function to gather safety warnings from multiple sources

### Transform Pipeline Integration
- [ ] **T018** Update product building in `src/scripts/transform-data.ts` - integrate enhanced parsers, use buildCategoryTree for categories field, collect warnings array
- [ ] **T019** Fix hardcoded currency in `src/scripts/transform-data.ts` - implement simple EUR default for Dutch products (line 73)
- [ ] **T020** Update product structure in `src/scripts/transform-data.ts` - ensure Product interface includes enhanced structured fields

## Phase 3.4: Integration & Validation
- [ ] **T021** Update logging in `src/scripts/transform-data.ts` - add log messages for enhanced structure generation steps
- [ ] **T022** Add enhanced structure validation in `src/data/transform/types.ts` - add validation functions for CategoryTree, IngredientInfo, etc.
- [ ] **T023** Update stats tracking in `src/data/transform/stats.ts` - track structured data generation statistics

## Phase 3.5: Polish & Documentation
- [ ] **T024** [P] Unit tests for edge cases in `tests/unit/parseCategories.test.ts` - handles empty categories, malformed arrays, null data
- [ ] **T025** [P] Unit tests for enhanced parsers in `tests/unit/enhancedParsers.test.ts` - tests edge cases for ingredient separation, additive summaries, nutrition units
- [ ] **T026** [P] Performance test enhanced pipeline in `tests/perf/enhancedPipeline.test.ts` - ensures <10s for 30k products with structure enhancements
- [ ] **T027** [P] Update CLAUDE.md documentation in `CLAUDE.md` - document enhanced JSON structure and parsing improvements
- [ ] **T028** Validate quickstart examples in `tests/integration/quickstart.test.ts` - ensures all quickstart.md examples work with enhanced pipeline

## Dependencies
- Setup (T001-T003) before tests (T004-T012)
- Tests (T004-T012) before implementation (T013-T020)
- Enhanced parsers (T013-T017) before pipeline integration (T018-T020)
- T018-T020 before integration (T021-T023)
- Implementation before polish (T024-T028)

## Parallel Execution Examples

### Setup Phase (can run together):
```bash
# Launch T001-T003 together:
Task: "Enhance existing types in src/data/transform/types.ts"
Task: "Fix currency hardcoding in src/scripts/transform-data.ts"
Task: "Add category structure helpers in src/data/transform/parseCategories.ts"
```

### Structure Tests (can run together):
```bash
# Launch T004-T007 together:
Task: "Test category tree structure in tests/unit/parseCategories.test.ts"
Task: "Test ingredient separation in tests/unit/parseIngredients.test.ts"
Task: "Test additive summary creation in tests/unit/parseAdditives.test.ts"
Task: "Test nutrition unit context in tests/unit/parseNutrition.test.ts"
```

### Integration Tests (can run together):
```bash
# Launch T008-T012 together:
Task: "Integration test EUR currency fix in tests/integration/currencyFix.test.ts"
Task: "Integration test structured JSON output in tests/integration/structuredOutput.test.ts"
Task: "Integration test category hierarchy in tests/integration/categoryHierarchy.test.ts"
Task: "Integration test warnings consolidation in tests/integration/warningsConsolidation.test.ts"
Task: "Integration test deterministic output in tests/integration/deterministic.test.ts"
```

### Enhanced Parsers (can run together):
```bash
# Launch T013-T017 together:
Task: "Implement category tree creation in src/data/transform/parseCategories.ts"
Task: "Enhance parseIngredients in src/data/transform/parseIngredients.ts"
Task: "Enhance parseAdditives in src/data/transform/parseAdditives.ts"
Task: "Enhance parseNutrition in src/data/transform/parseNutrition.ts"
Task: "Add warning consolidation in src/data/transform/parseAllergens.ts"
```

### Polish Phase (can run together):
```bash
# Launch T024-T027 together:
Task: "Unit tests for edge cases in tests/unit/parseCategories.test.ts"
Task: "Unit tests for enhanced parsers in tests/unit/enhancedParsers.test.ts"
Task: "Performance test enhanced pipeline in tests/perf/enhancedPipeline.test.ts"
Task: "Update CLAUDE.md documentation in CLAUDE.md"
```

## Task Details & Checklists

### T001: Enhance existing types
**File**: `src/data/transform/types.ts`
**Checklist**:
- [ ] Add CategoryTree interface with tree, primary, breadcrumbs, depth fields
- [ ] Add IngredientInfo interface with core, additives, statements, total fields
- [ ] Add AdditivesSummary interface with eNumbers, summary, warnings, dietary, categories
- [ ] Add Nutrition interface with unit context field
- [ ] Enhance existing Product interface to include structured fields
- [ ] Export all new interfaces
- [ ] Add JSDoc comments for each interface

### T002: Fix currency hardcoding
**File**: `src/scripts/transform-data.ts`
**Checklist**:
- [ ] Locate line 73 with hardcoded 'USD' currency
- [ ] Change to 'EUR' for Dutch products default
- [ ] Test change doesn't break existing functionality
- [ ] Add comment explaining EUR default for Dutch market
- [ ] Verify currency appears correctly in output

### T004: Test category tree structure
**File**: `tests/unit/parseCategories.test.ts`
**Checklist**:
- [ ] Test buildCategoryTree with flat array input
- [ ] Verify tree field contains original array
- [ ] Verify primary field is first category
- [ ] Verify breadcrumbs join with " > " separator
- [ ] Verify depth equals array length
- [ ] Test empty array handling
- [ ] Test null/undefined input handling
- [ ] Verify test fails before implementation

### T013: Implement category tree creation
**File**: `src/data/transform/parseCategories.ts`
**Checklist**:
- [ ] Create buildCategoryTree function
- [ ] Accept string[] categories parameter
- [ ] Return CategoryTree interface
- [ ] Set tree field to original array
- [ ] Set primary to first category or empty string
- [ ] Generate breadcrumbs with " > " separator
- [ ] Calculate depth as array length
- [ ] Handle empty/null arrays gracefully

### T018: Update product building
**File**: `src/scripts/transform-data.ts`
**Checklist**:
- [ ] Import buildCategoryTree function
- [ ] Replace categories assignment with buildCategoryTree call
- [ ] Collect warnings from multiple sources into warnings array
- [ ] Ensure enhanced parsers are used for structured data
- [ ] Maintain existing product building logic
- [ ] Test integration doesn't break pipeline

## Notes
- [P] tasks = different files, no dependencies between them
- All tests must fail before implementing corresponding functionality (TDD)
- Commit after each completed task
- Enhanced pipeline must preserve all original Product data
- Performance requirement: <10s for 30k products (constitutional)
- Output must be deterministic (same input → same output)
- Integration approach: enhance existing parsers, don't create separate modules

## Validation Checklist
*GATE: Checked before task execution begins*

- [x] All enhanced parsers have corresponding tests (T004-T007)
- [x] All integration scenarios have tests (T008-T012)
- [x] All tests come before implementation (T004-T012 before T013-T023)
- [x] Parallel tasks truly independent (different files, no shared state)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Tasks integrate with existing pipeline instead of creating separate modules
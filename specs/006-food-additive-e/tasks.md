# Tasks: Food Additive & E-Number Analysis

**Input**: Design documents from `/specs/006-food-additive-e/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Tech stack: TypeScript/Node.js 18+, Vitest, @std/csv
   → Structure: Single project extending existing CSV→JSONL transformer
2. Load design documents:
   → data-model.md: AdditiveInfo, AdditiveFlags, ENumberDefinition entities
   → contracts/: parseAdditives function contract
   → research.md: Regex patterns, Dutch E-number database decisions
3. Generate tasks by category:
   → Setup: TypeScript interfaces, E-number database
   → Tests: contract tests, integration tests with real data
   → Core: parsing modules, database lookups, flag generation
   → Integration: transformer pipeline integration
   → Polish: validation, documentation updates
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Tests before implementation (TDD)
   → Skip performance tests (per user request)
5. Number tasks sequentially (T001, T002...)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Use data/2024-10-23.csv for real data tests (avoid reading entire file)
- Include exact file paths in descriptions

## Phase 3.1: Setup
- [ ] T001 Create TypeScript interfaces in src/data/transform/types.ts (extend existing Product interface with AdditiveInfo and AdditiveFlags)
- [ ] T002 [P] Create E-number database in src/data/transform/eNumberDatabase.ts (static const objects with 300+ E-numbers)
- [ ] T003 [P] Create FunctionalCategory enum in src/data/transform/types.ts (27 Dutch categories)

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T004 [P] Contract test parseAdditives function signature in tests/unit/parseAdditives.contract.test.ts
- [ ] T005 [P] Integration test Dutch E-number parsing in tests/integration/additives.integration.test.ts (use small CSV fixture)
- [ ] T006 [P] Integration test real data processing in tests/integration/realData.integration.test.ts (grep sample from data/2024-10-23.csv, avoid reading full file)
- [ ] T007 [P] Unit test E-number database lookups in tests/unit/eNumberDatabase.test.ts
- [ ] T008 [P] Unit test additive flags generation in tests/unit/additiveFlags.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T009 [P] Implement parseAdditives function in src/data/transform/parseAdditives.ts (regex patterns from research.md)
- [ ] T010 [P] Implement E-number database lookups in src/data/transform/eNumberLookup.ts
- [ ] T011 [P] Implement Dutch category mapping in src/data/transform/dutchCategoryMapper.ts
- [ ] T012 Implement additive flags generation in src/data/transform/additiveFlags.ts (safety warnings, dietary restrictions)
- [ ] T013 Integrate parseAdditives into existing transform pipeline in src/scripts/transform-data.ts

## Phase 3.4: Integration
- [ ] T014 Add additive statistics to existing stats.ts (additive prevalence counters)
- [ ] T015 Update existing JSONL writer to include additive fields in src/data/transform/writer.ts
- [ ] T016 Add additive analysis to schema documentation generation in src/data/transform/writer.ts

## Phase 3.5: Polish
- [ ] T017 [P] Unit tests for regex patterns in tests/unit/patterns.test.ts
- [ ] T018 [P] Unit tests for edge cases in tests/unit/edgeCases.test.ts (malformed E-numbers, unknown additives)
- [ ] T019 [P] Update CLAUDE.md with additive analysis capabilities
- [ ] T020 [P] Update existing documentation with feature description
- [ ] T021 Run quickstart validation using data/2024-10-23.csv (grep samples only)
- [ ] T022 Final cleanup and code review

## Dependencies
- Setup (T001-T003) before tests (T004-T008)
- Tests (T004-T008) before implementation (T009-T013)
- T009-T011 can run parallel (different files)
- T012 depends on T010 (E-number lookups)
- T013 depends on T009, T012 (parseAdditives, flags)
- T014-T016 depend on T013 (integration complete)
- Polish (T017-T022) after all implementation

## Parallel Example
```bash
# Launch T004-T008 together (test phase):
Task: "Contract test parseAdditives function signature in tests/unit/parseAdditives.contract.test.ts"
Task: "Integration test Dutch E-number parsing in tests/integration/additives.integration.test.ts"
Task: "Integration test real data processing in tests/integration/realData.integration.test.ts"
Task: "Unit test E-number database lookups in tests/unit/eNumberDatabase.test.ts"
Task: "Unit test additive flags generation in tests/unit/additiveFlags.test.ts"

# Launch T009-T011 together (core implementation):
Task: "Implement parseAdditives function in src/data/transform/parseAdditives.ts"
Task: "Implement E-number database lookups in src/data/transform/eNumberLookup.ts"
Task: "Implement Dutch category mapping in src/data/transform/dutchCategoryMapper.ts"
```

## Special Instructions
- **Real Data**: Use `grep "E[0-9]" data/2024-10-23.csv | head -20` for samples, never read entire file
- **Performance**: Skip performance testing tasks as requested
- **E-numbers**: Focus on top frequencies: E330 (1,726×), E202 (1,156×), E300 (1,053×)
- **Patterns**: Use validated regex from research.md: `\[E(\d{3,4}[a-z]?)\]`
- **Testing**: Use Vitest (constitutional requirement)
- **Integration**: Follow existing `computeNutritionalTags.ts` pattern

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Maintain <10s processing for 30,499 products
- All additive assessments must align with Voedingscentrum guidelines

## Validation Checklist
*GATE: Checked before execution*

- [x] All contracts have corresponding tests (T004 covers parseAdditives contract)
- [x] All entities have implementation tasks (AdditiveInfo/Flags in T009-T012)
- [x] All tests come before implementation (T004-T008 before T009-T013)
- [x] Parallel tasks truly independent (different files marked [P])
- [x] Each task specifies exact file path
- [x] Real data usage avoids reading full CSV file
- [x] Documentation cleanup included (T019-T020)
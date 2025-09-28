# Tasks: CSV Parser Package

**Input**: Design documents from `/Users/ali.aboafifi/dev/aurora/ali-cli/health-prompts/picklist-site/specs/022-csv-parser-package/`
**Prerequisites**: plan.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓)

## Execution Flow (main)
```
1. Load plan.md from feature directory ✓
   → Extract: TypeScript 5.8+, @std/csv, NPM workspaces, Vitest
2. Load design documents ✓:
   → data-model.md: CSVRow, ParsedCSVResult, ConversionResult entities
   → contracts/: parser-api.ts contracts, parser-api.contract.test.ts
   → research.md: Extract from transform-data.ts lines 31-106, 183-199
3. Generate tasks by category:
   → Setup: NPM workspace, package structure, dependencies
   → Tests: Contract tests for 5 parser functions (TDD)
   → Core: Extract CSVRow interface, implement parser functions
   → Integration: Update transform-data.ts to use @picklist/parser
   → Polish: Unit tests, performance validation, documentation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → TDD: Tests before implementation
   → Sequential for shared files
5. Number tasks T001-T028
6. Generate dependency graph and parallel execution examples
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: NPM workspace package extraction
- Parser package: `packages/parser/`
- Paths assume monorepo structure with existing @picklist/core

## Phase 3.1: Setup

- [x] **T001** Create NPM workspace package structure at `packages/parser/` with package.json, tsconfig.json, and vitest.config.ts following @picklist/core patterns
- [x] **T002** Configure package.json with @std/csv dependency, TypeScript 5.8+ build scripts, and workspace integration
- [x] **T003** [P] Setup ESLint and TypeScript strict mode configuration in `packages/parser/tsconfig.json`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [x] **T004** [P] Contract test for readCSV function in `packages/parser/tests/readCSV.contract.test.ts` - test CSV text parsing to headers/matrix
- [x] **T005** [P] Contract test for createRows function in `packages/parser/tests/createRows.contract.test.ts` - test headers/matrix to CSVRow conversion
- [x] **T006** [P] Contract test for convertTypes function in `packages/parser/tests/convertTypes.contract.test.ts` - test CSVRow to Record conversion
- [x] **T007** [P] Contract test for createCSVRow legacy helper in `packages/parser/tests/createCSVRow.contract.test.ts` - test single row creation
- [x] **T008** [P] Contract test for csvRowToRecord legacy helper in `packages/parser/tests/csvRowToRecord.contract.test.ts` - test single row conversion
- [x] **T009** [P] Integration test for @picklist/core sparsity compatibility in `packages/parser/tests/sparsity-integration.test.ts`
- [x] **T010** [P] Behavioral identity validation test in `packages/parser/tests/behavioral-identity.test.ts` - compare with transform-data.ts baseline

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [x] **T011** [P] Extract CSVRow interface from `src/scripts/transform-data.ts:31-73` to `packages/parser/src/types.ts`
- [x] **T012** [P] Extract ParsedCSVResult and ConversionResult interfaces to `packages/parser/src/types.ts`
- [x] **T013** Implement readCSV function in `packages/parser/src/parser.ts` using @std/csv parse() function
- [x] **T014** Implement createRows function in `packages/parser/src/parser.ts` for headers/matrix to CSVRow conversion
- [x] **T015** Implement convertTypes function in `packages/parser/src/parser.ts` for CSVRow to Record conversion with filtering
- [x] **T016** [P] Extract createCSVRow legacy helper from `src/scripts/transform-data.ts:79-90` to `packages/parser/src/legacy.ts`
- [x] **T017** [P] Extract csvRowToRecord legacy helper from `src/scripts/transform-data.ts:96-106` to `packages/parser/src/legacy.ts`
- [x] **T018** Create main export file `packages/parser/src/index.ts` exporting all parser functions and types

## Phase 3.4: Integration

- [x] **T019** Update `src/scripts/transform-data.ts` to import readCSV, createRows, convertTypes from @picklist/parser
- [x] **T020** Remove extracted CSV parsing code (lines 31-106, 183-199) from `src/scripts/transform-data.ts`
- [x] **T021** Verify transform-data.ts produces identical output using structural comparison validation
- [x] **T022** Update package-lock.json and ensure all dependencies resolve correctly

## Phase 3.5: Polish

- [ ] **T023** [P] Create comprehensive unit tests for error handling in `packages/parser/tests/error-handling.test.ts`
- [ ] **T024** [P] Performance validation test in `packages/parser/tests/performance.test.ts` - ensure parity with baseline
- [ ] **T025** [P] Create README.md for @picklist/parser package with API documentation and usage examples
- [ ] **T026** [P] Update root CLAUDE.md to reflect parser package extraction completion
- [ ] **T027** Execute quickstart validation scenarios from `specs/022-csv-parser-package/quickstart.md`
- [ ] **T028** Run lint and typecheck on parser package: `npm run lint --workspace=@picklist/parser && npm run typecheck --workspace=@picklist/parser`

## Dependencies

**Critical Dependencies**:
- Setup (T001-T003) before everything
- Tests (T004-T010) before implementation (T011-T018) - **TDD MANDATORY**
- T011-T012 (types) before T013-T017 (implementations)
- T018 (exports) after all implementations
- Integration (T019-T022) after core implementation complete
- Polish (T023-T028) after integration verified

**Sequential Dependencies**:
- T019-T020: Same file (transform-data.ts) modifications
- T021: After T019-T020 complete
- T013-T015: Same file (parser.ts) implementations

## Parallel Example

```bash
# Launch T004-T008 together (contract tests):
Task: "Contract test for readCSV function in packages/parser/tests/readCSV.contract.test.ts"
Task: "Contract test for createRows function in packages/parser/tests/createRows.contract.test.ts"
Task: "Contract test for convertTypes function in packages/parser/tests/convertTypes.contract.test.ts"
Task: "Contract test for createCSVRow legacy helper in packages/parser/tests/createCSVRow.contract.test.ts"
Task: "Contract test for csvRowToRecord legacy helper in packages/parser/tests/csvRowToRecord.contract.test.ts"

# Launch T011-T012 together (type extraction):
Task: "Extract CSVRow interface from src/scripts/transform-data.ts:31-73 to packages/parser/src/types.ts"
Task: "Extract ParsedCSVResult and ConversionResult interfaces to packages/parser/src/types.ts"

# Launch T023-T026 together (polish tasks):
Task: "Create comprehensive unit tests for error handling in packages/parser/tests/error-handling.test.ts"
Task: "Performance validation test in packages/parser/tests/performance.test.ts"
Task: "Create README.md for @picklist/parser package with API documentation"
Task: "Update root CLAUDE.md to reflect parser package extraction completion"
```

## Key Implementation Notes

### From Research Document
- **Source Location**: `src/scripts/transform-data.ts:31-73` (CSVRow interface), `79-90` (createCSVRow), `96-106` (csvRowToRecord), `183-199` (parsing logic)
- **Dependencies**: Must maintain @std/csv integration and @picklist/core calculateSparsity compatibility
- **Behavior**: Fail-fast on malformed CSV, in-memory processing, deterministic output

### From Data Model
- **Core Entities**: CSVRow (Dutch food products), ParsedCSVResult (headers+matrix), ConversionResult (records+stats)
- **Integration Contract**: convertTypes() output must be compatible with calculateSparsity() from @picklist/core

### From Contracts
- **API Functions**: readCSV(), createRows(), convertTypes() (new), createCSVRow(), csvRowToRecord() (legacy)
- **Error Types**: CSVParseError with type categorization
- **Backward Compatibility**: Legacy helpers for smooth migration

## Validation Checklist
*GATE: Checked before task execution*

- [x] All contracts have corresponding tests (T004-T010)
- [x] All entities have extraction/implementation tasks (T011-T018)
- [x] All tests come before implementation (T004-T010 before T011-T018)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] TDD approach enforced (failing tests required first)
- [x] Integration validates behavioral identity (T021)
- [x] Performance parity validated (T024)

## Success Criteria

Upon completion:
1. **@picklist/parser package** functional at version 1.0.0
2. **transform-data.ts** uses parser package with identical behavior
3. **All contract tests pass** with extracted implementation
4. **Performance parity** maintained (no regression)
5. **Quickstart scenarios** validate end-to-end functionality

**Total Tasks**: 28 tasks (T001-T028: 8 parallel-eligible in tests phase, 4 parallel-eligible in polish phase)
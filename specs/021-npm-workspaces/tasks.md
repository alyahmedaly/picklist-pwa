# Tasks: NPM Workspaces Migration - Phase 1 (@picklist/core)

**Input**: Design documents from `/specs/021-npm-workspaces/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Extract: TypeScript 5.8+, NPM workspaces, core utilities only
   → Structure: Single @picklist/core package extraction
2. Load design documents:
   → data-model.md: Workspace Package, Dependency Relationship entities
   → contracts/: core-interface.ts, parser-interface.ts, scoring-interface.ts
   → research.md: NPM workspaces best practices
   → quickstart.md: 6-step validation scenarios
3. Generate tasks by category:
   → Setup: workspace structure, TypeScript config
   → Tests: contract tests for package interfaces
   → Core: utility function implementation
   → Integration: package building and exports
   → Polish: parity tests, documentation
4. Apply task rules:
   → Different packages = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Focus: Phase 1 utilities only (NOT parsing or scoring)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Workspace root**: `/Users/ali.aboafifi/dev/aurora/ali-cli/health-prompts/picklist-site/`
- **Core package**: `packages/core/src/`
- **Tests**: `tests/parity/` for workspace-specific tests

## Phase 3.1: Setup
- [x] T001 Create workspace structure: `packages/core/src/{utils,types}/`
- [x] T002 Initialize @picklist/core package.json with dependencies
- [x] T003 [P] Configure TypeScript project references in root tsconfig.json
- [x] T004 [P] Update root package.json with workspace configuration

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T005 [P] Contract test for CorePackageExports in tests/contract/core-interface.contract.test.ts
- [x] T006 [P] Integration test for mergeDuplicates function in tests/integration/core-merge.test.ts
- [x] T007 [P] Integration test for sparsity analysis in tests/integration/core-sparsity.test.ts
- [x] T008 [P] Integration test for file I/O utilities in tests/integration/core-io.test.ts
- [x] T009 [P] Parity test: original vs @picklist/core imports in tests/parity/core-package.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T010 [P] Move mergeDuplicate.ts to packages/core/src/utils/mergeDuplicate.ts
- [x] T011 [P] Move sparsity.ts to packages/core/src/utils/sparsity.ts
- [x] T012 [P] Move ordering.ts to packages/core/src/utils/ordering.ts
- [x] T013 [P] Move writer.ts to packages/core/src/utils/writer.ts
- [x] T014 [P] Move types.ts to packages/core/src/types/index.ts
- [x] T015 Create utils index: packages/core/src/utils/index.ts
- [x] T016 Create string utilities: packages/core/src/utils/stringUtils.ts
- [x] T017 Create validation utilities: packages/core/src/utils/validation.ts
- [x] T018 Create core barrel export: packages/core/src/index.ts

## Phase 3.4: Integration
- [x] T019 Configure TypeScript build for @picklist/core package
- [x] T020 Update import paths in existing code to use @picklist/core
- [x] T021 Test package compilation and exports
- [x] T022 Verify backward compatibility with existing transform pipeline

## Phase 3.5: Polish
- [x] T023 [P] Unit tests for string utilities in tests/unit/stringUtils.test.ts
- [x] T024 [P] Unit tests for validation utilities in tests/unit/validation.test.ts
- [x] T025 Performance test: ensure <10s transform pipeline with new imports
- [x] T026 [P] Update CLAUDE.md with @picklist/core workspace information
- [x] T027 Run quickstart.md validation steps
- [x] T028 Document package API and usage examples

## Dependencies
- Setup (T001-T004) before tests (T005-T009)
- Tests (T005-T009) before implementation (T010-T018)
- Implementation (T010-T018) before integration (T019-T022)
- Integration before polish (T023-T028)
- T015 depends on T010-T014 (utils files must exist)
- T018 depends on T015-T017 (index depends on sub-indices)
- T020 depends on T019 (compilation before import updates)

## Parallel Example
```
# Launch T005-T009 together (all different test files):
Task: "Contract test for CorePackageExports in tests/contract/core-interface.contract.test.ts"
Task: "Integration test for mergeDuplicates in tests/integration/core-merge.test.ts"
Task: "Integration test for sparsity analysis in tests/integration/core-sparsity.test.ts"
Task: "Integration test for file I/O utilities in tests/integration/core-io.test.ts"
Task: "Parity test: original vs @picklist/core imports in tests/parity/core-package.test.ts"

# Launch T010-T014 together (all different source files):
Task: "Move mergeDuplicate.ts to packages/core/src/utils/mergeDuplicate.ts"
Task: "Move sparsity.ts to packages/core/src/utils/sparsity.ts"
Task: "Move ordering.ts to packages/core/src/utils/ordering.ts"
Task: "Move writer.ts to packages/core/src/utils/writer.ts"
Task: "Move types.ts to packages/core/src/types/index.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Only utilities in Phase 1 (parsing & scoring stay in src/data/transform/)
- Maintain 100% backward compatibility
- Focus on establishing workspace foundation

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - core-interface.ts → contract test task [P]
   - parser-interface.ts & scoring-interface.ts → documentation only (future phases)

2. **From Data Model**:
   - Workspace Package entity → package creation tasks [P]
   - Dependency Relationship → import/export validation

3. **From Quickstart**:
   - Each validation step → integration test [P]
   - Success criteria → validation tasks

4. **Ordering**:
   - Setup → Tests → File moves → Index creation → Integration → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked before task execution*

- [x] Core contract has corresponding test (T005)
- [x] All utility entities have move tasks (T010-T014)
- [x] All tests come before implementation (T005-T009 before T010-T018)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Phase 1 scope respected (utilities only, no parsing/scoring)

## Success Criteria
Upon completion, this phase should achieve:
1. ✅ @picklist/core package builds and exports utilities
2. ✅ Existing functionality preserved (no breaking changes)
3. ✅ Workspace foundation established for future phases
4. ✅ <10s transform pipeline performance maintained
5. ✅ TypeScript project references working
6. ✅ All tests passing with new package structure
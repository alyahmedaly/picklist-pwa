# Tasks: Category Index Page

**Input**: Design documents from `/Users/ali.aboafifi/dev/aurora/ali-cli/health-prompts/picklist-site/specs/016-category-index-page/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Tech stack: TypeScript 5.8+, React 19+, Vite 7+, TailwindCSS 4+, shadcn/ui
   → Structure: Web app frontend-only consuming static data
2. Load optional design documents:
   → data-model.md: CategoryWithMetrics, AliContext, CategoryIndexState → type tasks
   → contracts/: CategoryIndexPage.ts, CategoryCard.ts, CategorySearch.ts → test tasks
   → research.md: Ali metrics pre-computation, virtual scrolling → setup tasks
3. Generate tasks by category:
   → Setup: Transform pipeline Ali metrics, type definitions
   → Tests: Contract tests for components, integration tests
   → Core: Components (CategoryCard, CategorySearch, CategoryIndexPage)
   → Integration: Routing, navigation, performance optimization
   → Polish: Accessibility, responsive design, Storybook stories
4. Apply task rules:
   → Different components = mark [P] for parallel
   → Same page file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Frontend project**: `src/`, `tests/` at repository root
- Transform pipeline: `src/data/transform/`
- Components: `src/components/`, `src/pages/`

## Phase 3.1: Setup & Transform Pipeline
- [x] T001 Extend category-tree transform pipeline with Ali metrics calculation in `src/data/transform/categoryTreeBuilder.ts`
- [x] T002 [P] Create CategoryWithMetrics interface in `src/types/category-index.ts`
- [x] T003 [P] Create AliContext and filter types in `src/types/category-index.ts`
- [x] T004 Add halal compliance calculation to transform pipeline in `src/data/transform/aliMetricsCalculator.ts`
- [x] T005 Add protein density aggregation to transform pipeline in `src/data/transform/aliMetricsCalculator.ts`
- [x] T006 Add price efficiency scoring to transform pipeline in `src/data/transform/aliMetricsCalculator.ts`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T007 [P] Contract test CategoryCard component in `tests/contract/CategoryCard.test.tsx`
- [x] T008 [P] Contract test CategorySearch component in `tests/contract/CategorySearch.test.tsx`
- [x] T009 [P] Contract test CategoryIndexPage component in `tests/contract/CategoryIndexPage.test.tsx`
- [x] T010 [P] Integration test category display and metrics in `tests/integration/categoryDisplay.test.tsx`
- [x] T011 [P] Integration test search and filtering functionality in `tests/integration/searchAndFilter.test.tsx`
- [x] T012 [P] Integration test category navigation in `tests/integration/categoryNavigation.test.tsx`
- [x] T013 [P] Integration test responsive design in `tests/integration/categoryIndexResponsive.test.tsx`

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T014 [P] CategoryCard component with Ali metrics display in `src/components/category-index/CategoryCard.tsx`
- [ ] T015 [P] CategorySearch component with Dutch language support in `src/components/category-index/CategorySearch.tsx`
- [ ] T016 CategoryIndexPage main component with virtual scrolling in `src/pages/CategoryIndexPage.tsx`
- [ ] T017 Category filtering utilities with Ali-specific criteria in `src/lib/categoryFilters.ts`
- [ ] T018 Category sorting utilities with multiple options in `src/lib/categorySorting.ts`
- [ ] T019 Dutch language search support utilities in `src/lib/dutchSearch.ts`

## Phase 3.4: Integration
- [ ] T020 Update App.tsx routing to include CategoryIndexPage
- [ ] T021 Add category click navigation with URL parameters
- [ ] T022 Implement virtual scrolling performance optimization
- [ ] T023 Add error handling for data loading failures
- [ ] T024 Add loading states with skeleton components

## Phase 3.5: Polish
- [ ] T025 [P] Storybook stories for CategoryCard component in `src/stories/category-index/CategoryCard.stories.tsx`
- [ ] T026 [P] Storybook stories for CategorySearch component in `src/stories/category-index/CategorySearch.stories.tsx`
- [ ] T027 [P] Storybook stories for CategoryIndexPage component in `src/stories/category-index/CategoryIndexPage.stories.tsx`
- [ ] T028 [P] Accessibility testing with axe-core in `tests/integration/accessibility.test.tsx`
- [ ] T029 Performance testing for <2s load time and <100ms search
- [ ] T030 Mobile responsiveness validation across breakpoints
- [ ] T031 Update existing CategoryTreePage to redirect to CategoryIndexPage
- [ ] T032 Run quickstart.md validation scenarios

## Dependencies
- Transform pipeline (T001, T004-T006) before component tests (T007-T013)
- Type definitions (T002-T003) before component tests (T007-T013)
- Tests (T007-T013) before implementation (T014-T019)
- Core components (T014-T016) before integration (T020-T024)
- Implementation before polish (T025-T032)

## Parallel Example
```
# Launch T002-T003 together (type definitions):
Task: "Create CategoryWithMetrics interface in src/types/category-index.ts"
Task: "Create AliContext and filter types in src/types/category-index.ts"

# Launch T007-T013 together (contract tests):
Task: "Contract test CategoryCard component in tests/contract/CategoryCard.test.tsx"
Task: "Contract test CategorySearch component in tests/contract/CategorySearch.test.tsx"
Task: "Contract test CategoryIndexPage component in tests/contract/CategoryIndexPage.test.tsx"
Task: "Integration test category display in tests/integration/categoryDisplay.test.tsx"
Task: "Integration test search and filtering in tests/integration/searchAndFilter.test.tsx"
Task: "Integration test category navigation in tests/integration/categoryNavigation.test.tsx"
Task: "Integration test responsive design in tests/integration/responsive.test.tsx"

# Launch T014-T015 together (independent components):
Task: "CategoryCard component with Ali metrics display in src/components/category-index/CategoryCard.tsx"
Task: "CategorySearch component with Dutch language support in src/components/category-index/CategorySearch.tsx"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Follow constitutional principles (early returns, design system first)
- Ali metrics MUST be pre-computed in transform pipeline
- Use existing shadcn/ui components where possible
- Maintain <2s load time and <100ms search response requirements

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - CategoryIndexPage.ts → T009 contract test, T016 implementation
   - CategoryCard.ts → T007 contract test, T014 implementation
   - CategorySearch.ts → T008 contract test, T015 implementation

2. **From Data Model**:
   - CategoryWithMetrics → T002 interface definition
   - AliContext → T003 type definition
   - Ali metrics → T004-T006 transform pipeline tasks

3. **From User Stories (quickstart.md)**:
   - Category display → T010 integration test
   - Search functionality → T011 integration test
   - Navigation → T012 integration test
   - Responsive design → T013 integration test

4. **Ordering**:
   - Transform pipeline → Types → Tests → Components → Integration → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (T007-T009)
- [x] All entities have type definition tasks (T002-T003)
- [x] All tests come before implementation (T007-T013 before T014-T019)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Transform pipeline tasks follow constitutional principles
- [x] Ali metrics pre-computation enforced
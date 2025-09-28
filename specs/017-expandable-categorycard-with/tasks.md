# Tasks: Expandable CategoryCard with Subcategory Tree Display

**Input**: Design documents from `/specs/017-expandable-categorycard-with/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Extract: React 19+, TypeScript 5.8+, TailwindCSS 4+, shadcn/ui, Vitest
   → Structure: Single frontend project enhancing existing CategoryIndexPage
2. Load design documents:
   → data-model.md: CategoryExpansionState, ExpandableCategoryCardProps, VirtualScrolling
   → contracts/: CategoryCard.contract.ts, ExpansionState.contract.ts, VirtualScrolling.contract.ts
   → research.md: Virtual scrolling, keyboard navigation, mobile touch, performance
3. Generate tasks by category:
   → Setup: TypeScript types, expansion state management
   → Tests: Contract tests for all interfaces, integration tests for user scenarios
   → Core: CategoryCard enhancement, expansion state hook, virtual scrolling
   → Integration: Search auto-expansion, keyboard navigation, mobile optimization
   → Polish: Performance optimization, bulk operations, accessibility testing
4. Apply TDD rules:
   → Contract tests before implementation
   → Different files marked [P] for parallel execution
   → Same file modifications sequential
5. Number tasks T001-T040 following dependency order
6. CategoryCard enhancement without breaking existing functionality
7. Virtual scrolling performance maintained with dynamic heights
8. All constitutional principles followed (TDD, minimal deps, performance)
9. Return: SUCCESS (tasks ready for /implement execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- Frontend-only enhancement to existing React application
- Paths assume existing CategoryIndexPage structure in `src/pages/`

## Phase 3.1: Setup and Type Definitions

- [x] **T001** [P] Create expansion state types in `src/types/expansion-state.ts`
- [x] **T002** [P] Create virtual scrolling types in `src/types/virtual-scrolling.ts`
- [x] **T003** [P] Enhance existing category-index types in `src/types/category-index.ts` with expansion props

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests (Parallel Execution)
- [x] **T004** [P] CategoryCard contract test in `tests/contract/CategoryCard.contract.test.tsx`
- [x] **T005** [P] ExpansionState contract test in `tests/contract/ExpansionState.contract.test.ts`
- [x] **T006** [P] VirtualScrolling contract test in `tests/contract/VirtualScrolling.contract.test.ts`

### Integration Tests (Parallel Execution)
- [x] **T007** [P] Category expansion integration test in `tests/integration/CategoryExpansion.test.tsx`
- [x] **T008** [P] Search auto-expansion integration test in `tests/integration/SearchExpansion.test.tsx`
- [x] **T009** [P] Keyboard navigation integration test in `tests/integration/KeyboardNavigation.test.tsx`
- [ ] **T010** [P] Mobile interaction integration test in `tests/integration/MobileInteraction.test.tsx`
- [ ] **T011** [P] Virtual scrolling with expansion test in `tests/integration/VirtualScrollExpansion.test.tsx`

### User Scenario Tests (Parallel Execution)
- [ ] **T012** [P] Quickstart scenario test in `tests/integration/QuickstartScenarios.test.tsx`

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Expansion State Management
- [ ] **T013** [P] Expansion state hook in `src/hooks/useExpansionState.ts`
- [ ] **T014** [P] Expansion state utilities in `src/lib/expansionStateUtils.ts`
- [ ] **T015** [P] Session persistence for expansion state in `src/lib/expansionPersistence.ts`

### Enhanced CategoryCard Component
- [ ] **T016** Read existing CategoryCard component in `src/components/category-index/CategoryCard.tsx`
- [ ] **T017** Create CategoryTreeNode component in `src/components/category-index/CategoryTreeNode.tsx`
- [ ] **T018** Create CategorySubTree component in `src/components/category-index/CategorySubTree.tsx`
- [ ] **T019** Enhance CategoryCard with expansion functionality in `src/components/category-index/CategoryCard.tsx`

### Virtual Scrolling Enhancement
- [ ] **T020** [P] Dynamic height measurement utilities in `src/lib/heightMeasurement.ts`
- [ ] **T021** [P] Virtual scrolling expansion bridge in `src/lib/virtualScrollExpansion.ts`
- [ ] **T022** Enhance CategoryIndexPage virtual scrolling in `src/pages/CategoryIndexPage.tsx`

## Phase 3.4: Integration and User Experience

### Search Integration
- [ ] **T023** [P] Search expansion utilities in `src/lib/searchExpansion.ts`
- [ ] **T024** Integrate search auto-expansion in existing Dutch search in `src/lib/dutchSearch.ts`

### Keyboard Navigation
- [ ] **T025** [P] ARIA tree navigation hook in `src/hooks/useKeyboardNavigation.ts`
- [ ] **T026** [P] Keyboard navigation utilities in `src/lib/keyboardNavigation.ts`
- [ ] **T027** Integrate keyboard navigation in CategoryCard expansion

### Mobile Optimization
- [ ] **T028** [P] Touch interaction utilities in `src/lib/touchInteraction.ts`
- [ ] **T029** [P] Mobile responsive expansion styling in `src/styles/expansionStyles.css`
- [ ] **T030** Integrate mobile touch handling in CategoryCard

### Performance Optimization
- [ ] **T031** [P] Expansion performance monitoring in `src/lib/expansionPerformance.ts`
- [ ] **T032** [P] Memory management utilities in `src/lib/memoryManagement.ts`
- [ ] **T033** Optimize CategoryIndexPage for expansion performance

## Phase 3.5: Polish and Advanced Features

### Bulk Operations
- [ ] **T034** [P] Bulk expansion utilities in `src/lib/bulkExpansion.ts`
- [ ] **T035** Add bulk expand/collapse controls to CategorySearch component in `src/components/category-index/CategorySearch.tsx`

### Accessibility and Testing
- [ ] **T036** [P] Accessibility compliance testing in `tests/accessibility/ExpansionAccessibility.test.tsx`
- [ ] **T037** [P] Performance benchmarking in `tests/performance/ExpansionPerformance.test.ts`
- [ ] **T038** [P] Cross-browser compatibility testing in `tests/compatibility/BrowserCompatibility.test.tsx`

### Documentation and Validation
- [ ] **T039** [P] Update Storybook stories for expanded CategoryCard in `src/stories/CategoryCard.stories.tsx`
- [ ] **T040** Execute quickstart validation scenarios from `specs/017-expandable-categorycard-with/quickstart.md`

## Dependencies

### Sequential Dependency Chains
- **Setup**: T001-T003 (type definitions) → all other tasks
- **TDD**: T004-T012 (all tests) → T013+ (implementation)
- **Core Implementation**: T013-T015 (state management) → T016-T019 (CategoryCard)
- **Component Chain**: T016 (read existing) → T017-T018 (new components) → T019 (enhancement)
- **Virtual Scrolling**: T020-T021 (utilities) → T022 (integration)
- **Integration**: T023-T033 depend on core implementation completion
- **Polish**: T034-T040 depend on all core features

### Blocking Dependencies
- T004-T012 MUST complete and FAIL before any T013+ implementation
- T016 (read existing CategoryCard) blocks T017-T019
- T013-T015 (expansion state) blocks T019, T022, T027, T030, T033
- T019 (CategoryCard enhancement) blocks T027, T030
- T022 (virtual scrolling) blocks T033
- All core (T013-T033) blocks polish (T034-T040)

## Parallel Execution Examples

### Phase 3.1: Setup (All Parallel)
```
Task: "Create expansion state types in src/types/expansion-state.ts"
Task: "Create virtual scrolling types in src/types/virtual-scrolling.ts"
Task: "Enhance existing category-index types in src/types/category-index.ts"
```

### Phase 3.2: Contract Tests (All Parallel)
```
Task: "CategoryCard contract test in tests/contract/CategoryCard.contract.test.tsx"
Task: "ExpansionState contract test in tests/contract/ExpansionState.contract.test.ts"
Task: "VirtualScrolling contract test in tests/contract/VirtualScrolling.contract.test.ts"
```

### Phase 3.2: Integration Tests (All Parallel)
```
Task: "Category expansion integration test in tests/integration/CategoryExpansion.test.tsx"
Task: "Search auto-expansion integration test in tests/integration/SearchExpansion.test.tsx"
Task: "Keyboard navigation integration test in tests/integration/KeyboardNavigation.test.tsx"
Task: "Mobile interaction integration test in tests/integration/MobileInteraction.test.tsx"
Task: "Virtual scrolling with expansion test in tests/integration/VirtualScrollExpansion.test.tsx"
```

### Phase 3.3: Core Utilities (Selected Parallel Tasks)
```
Task: "Expansion state hook in src/hooks/useExpansionState.ts"
Task: "Expansion state utilities in src/lib/expansionStateUtils.ts"
Task: "Session persistence for expansion state in src/lib/expansionPersistence.ts"
```

### Phase 3.4: Integration Utilities (Selected Parallel Tasks)
```
Task: "Search expansion utilities in src/lib/searchExpansion.ts"
Task: "ARIA tree navigation hook in src/hooks/useKeyboardNavigation.ts"
Task: "Touch interaction utilities in src/lib/touchInteraction.ts"
Task: "Mobile responsive expansion styling in src/styles/expansionStyles.css"
```

### Phase 3.5: Polish (Most Tasks Parallel)
```
Task: "Bulk expansion utilities in src/lib/bulkExpansion.ts"
Task: "Accessibility compliance testing in tests/accessibility/ExpansionAccessibility.test.tsx"
Task: "Performance benchmarking in tests/performance/ExpansionPerformance.test.ts"
Task: "Cross-browser compatibility testing in tests/compatibility/BrowserCompatibility.test.tsx"
Task: "Update Storybook stories for expanded CategoryCard in src/stories/CategoryCard.stories.tsx"
```

## Notes

### TDD Compliance
- [P] tasks = different files, no dependencies
- Verify T004-T012 tests fail before implementing T013+
- Commit after each task completion
- Follow constitutional principle II (TDD NON-NEGOTIABLE)

### Performance Requirements
- Maintain <2s page load on 3G connection
- Keep search response time <100ms
- Virtual scrolling must handle 3,195+ categories smoothly
- Expansion animations should be 200ms duration
- Touch targets must be ≥44px for mobile compliance

### Constitutional Compliance
- **Data-First**: Leverages existing category-tree.json static data
- **Minimal Dependencies**: Only React, TypeScript, TailwindCSS, shadcn/ui
- **Static Generation**: No backend changes, pure frontend enhancement
- **Design System First**: Extends existing CategoryCard, reuses shadcn/ui
- **Component Composition**: Early returns for expansion states
- **Transform Pipeline First**: Consumes pre-computed category hierarchy

### File Modification Constraints
- Tasks modifying same file cannot run in parallel (no [P] marking)
- T019 (CategoryCard enhancement) cannot be parallel with others touching same file
- T022 (CategoryIndexPage enhancement) sequential due to existing file modification
- T024 (Dutch search integration) sequential as it modifies existing file

## Validation Checklist
*GATE: Checked before task execution*

- [x] All contracts (CategoryCard, ExpansionState, VirtualScrolling) have corresponding tests
- [x] All entities (CategoryExpansionState, VirtualScrolling) have implementation tasks
- [x] All tests (T004-T012) come before implementation (T013+)
- [x] Parallel tasks are truly independent (different files, no shared dependencies)
- [x] Each task specifies exact file path for implementation
- [x] No [P] task modifies same file as another [P] task
- [x] TDD methodology strictly followed (tests fail before implementation)
- [x] Constitutional principles maintained throughout task structure
- [x] Performance requirements integrated into task definitions
- [x] Accessibility and mobile requirements included
- [x] Integration with existing CategoryIndexPage architecture preserved
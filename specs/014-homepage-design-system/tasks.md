# Tasks: Homepage Design System Components

**Input**: Design documents from `/specs/014-homepage-design-system/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → ✅ React 19 + TypeScript components extending existing shadcn/ui design system
   → Extract: TypeScript 5.8+, React 19, shadcn/ui, TailwindCSS 4+, Vitest testing
2. Load optional design documents:
   → data-model.md: FilterCategory, ProductDisplay, HomepageState entities
   → contracts/: 5 component contracts (FilterCard, ProductList, ProductCard, SearchControls, Homepage)
   → research.md: Virtual scrolling, React 19 concurrent features, mobile-first design
3. Generate tasks by category:
   → Setup: TypeScript types, data utilities
   → Tests: Component tests, integration tests
   → Core: 4 homepage components + main Homepage component
   → Integration: Data loading, virtual scrolling, state management
   → Polish: Performance optimization, mobile responsiveness
4. Apply task rules:
   → Component files = mark [P] for parallel
   → Shared utilities = sequential
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests? ✅
   → All entities have types? ✅
   → All components implemented? ✅
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Frontend components**: `src/components/homepage/` for new components
- **Types**: `src/types/homepage.ts` for component interfaces
- **Utilities**: `src/lib/homepage/` for data loading and transformation
- **Tests**: `tests/contract/`, `tests/integration/` following existing structure

## Phase 3.1: Setup & Types
- [x] T001 Create TypeScript interfaces in src/types/homepage.ts for FilterCategory, ProductDisplay, HomepageState
- [x] T002 [P] Create data utilities in src/lib/homepage/filterCategoryLoader.ts for loading filter metadata
- [x] T003 [P] Create data utilities in src/lib/homepage/productTransformer.ts for ProductDisplay transformation

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T004 [P] Component test FilterCard in tests/contract/FilterCard.test.tsx
- [x] T005 [P] Component test ProductList in tests/contract/ProductList.test.tsx
- [x] T006 [P] Component test ProductCard in tests/contract/ProductCard.test.tsx
- [x] T007 [P] Component test SearchControls in tests/contract/SearchControls.test.tsx
- [x] T008 [P] Component test Homepage in tests/contract/Homepage.test.tsx
- [x] T009 [P] Integration test filter navigation in tests/integration/filterNavigation.test.tsx
- [x] T010 [P] Integration test product browsing in tests/integration/productBrowsing.test.tsx
- [x] T011 [P] Integration test search and sort in tests/integration/searchAndSort.test.tsx

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T012 [P] FilterCard component in src/components/homepage/FilterCard.tsx
- [x] T013 [P] ProductCard component in src/components/homepage/ProductCard.tsx
- [x] T014 [P] SearchControls component in src/components/homepage/SearchControls.tsx
- [x] T015 ProductList component with virtual scrolling in src/components/homepage/ProductList.tsx
- [x] T016 Virtual scrolling hook in src/lib/homepage/useVirtualScrolling.ts
- [x] T017 Search and filter utilities in src/lib/homepage/searchEngine.ts
- [x] T018 Homepage component with state management in src/components/homepage/Homepage.tsx

## Phase 3.4: Integration & Performance
- [x] T019 Data loading integration in src/lib/homepage/dataManager.ts
- [x] T020 React 19 concurrent features integration (useDeferredValue, useTransition)
- [x] T021 Mobile-first responsive styling for all components
- [x] T022 Performance monitoring utilities in src/lib/homepage/performanceMonitor.ts

## Phase 3.5: Polish & Optimization
- [ ] T023 [P] Virtual scrolling performance optimization
- [ ] T024 [P] Bundle size optimization and code splitting
- [ ] T025 [P] Mobile touch interactions and accessibility
- [ ] T026 [P] Error handling and loading states
- [ ] T027 Execute quickstart.md validation scenarios

## Dependencies
- Types (T001-T003) before tests (T004-T011)
- Tests (T004-T011) before implementation (T012-T018)
- T015 (ProductList) depends on T016 (virtual scrolling hook)
- T017 (search utilities) before T014 (SearchControls)
- T018 (Homepage) depends on all component implementations (T012-T017)
- Integration (T019-T022) before polish (T023-T027)

## Parallel Example
```
# Launch T004-T008 together (component tests):
Task: "Component test FilterCard in tests/contract/FilterCard.test.tsx"
Task: "Component test ProductList in tests/contract/ProductList.test.tsx"
Task: "Component test ProductCard in tests/contract/ProductCard.test.tsx"
Task: "Component test SearchControls in tests/contract/SearchControls.test.tsx"
Task: "Component test Homepage in tests/contract/Homepage.test.tsx"

# Launch T012-T014 together (independent components):
Task: "FilterCard component in src/components/homepage/FilterCard.tsx"
Task: "ProductCard component in src/components/homepage/ProductCard.tsx"
Task: "SearchControls component in src/components/homepage/SearchControls.tsx"
```

## Component Implementation Details

### T012 - FilterCard Component
- Extend existing Card component from shadcn/ui
- Display filter category with coverage statistics
- Active state styling with existing design system colors
- Touch-friendly interactions for mobile
- Props: FilterCardProps from contract

### T013 - ProductCard Component
- Use existing Badge and Button components
- Display nutrition metrics (protein, health grade, halal status)
- Compact and detailed variants for virtual scrolling
- Memoized for performance with 11k+ items
- Props: ProductCardProps from contract

### T014 - SearchControls Component
- Use existing Input component for search
- Custom dropdown for sort options
- Debounced search with useDeferredValue
- Mobile-optimized layout
- Props: SearchControlsProps from contract

### T015 - ProductList Component
- Custom virtual scrolling implementation
- Fixed item height for performance
- Intersection Observer for viewport detection
- Memory-efficient rendering (only visible items + buffer)
- Props: ProductListProps from contract

### T018 - Homepage Component
- State management with useReducer
- Filter category switching
- Data loading with Suspense boundaries
- Error handling and loading states
- Props: HomepageProps from contract

## Performance Requirements
- Initial load: <2s on 3G connection
- Bundle size: <1MB gzipped
- Virtual scrolling: 60fps on mobile
- Memory usage: Constant regardless of product count
- Search responsiveness: <100ms filter updates

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Use existing design system components where possible
- Follow mobile-first responsive design
- Maintain constitutional compliance (no external dependencies)

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Each component contract → component test task [P]
   - Each component → implementation task

2. **From Data Model**:
   - Each entity → TypeScript interface [P]
   - Data relationships → utility functions

3. **From User Stories**:
   - Filter navigation → integration test [P]
   - Product browsing → integration test [P]
   - Search/sort → integration test [P]

4. **Ordering**:
   - Setup → Tests → Components → Integration → Polish
   - Virtual scrolling utilities before ProductList
   - All components before Homepage integration

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (T004-T008)
- [x] All entities have TypeScript interfaces (T001)
- [x] All tests come before implementation (T004-T011 before T012-T018)
- [x] Parallel tasks truly independent (different component files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Performance requirements clearly specified
- [x] Constitutional compliance maintained (shadcn/ui + core stack only)
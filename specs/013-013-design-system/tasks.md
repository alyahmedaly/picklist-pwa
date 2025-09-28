# Tasks: Design System

**Input**: Design documents from `/specs/013-013-design-system/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → ✅ Found: TypeScript + React + shadcn/ui + TailwindCSS component library
   → Extract: 15-20 components, nutrition-focused, mobile-first
2. Load optional design documents:
   → data-model.md: Extract entities → DesignToken, BaseComponent, NutritionComponent
   → contracts/: 3 files → DesignTokens.ts, BaseComponents.ts, NutritionComponents.ts
   → research.md: Extract decisions → shadcn/ui foundation, Storybook, accessibility-first
3. Generate tasks by category:
   → Setup: Storybook setup, design token implementation, shadcn/ui config
   → Tests: contract tests for all component interfaces, Storybook stories
   → Core: base UI components, nutrition components, layout components
   → Integration: design token integration, accessibility testing
   → Polish: performance optimization, documentation, visual regression tests
4. Apply task rules:
   → Different components = mark [P] for parallel
   → Same component = sequential (test → implementation)
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001-T025)
6. Generate dependency graph: tokens → base → nutrition → layout → polish
7. Create parallel execution examples for independent components
8. Validate task completeness: All components have tests and implementation
9. Return: SUCCESS (design system tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Frontend component library**: `src/components/`, `src/lib/`, `src/styles/`, `tests/`, `stories/`
- Paths assume repository root structure from plan.md

## Phase 3.1: Setup & Foundation ✅ COMPLETE

- [x] T001 Configure Storybook for component development and visual testing
- [x] T002 [P] Setup design tokens implementation in src/lib/design-tokens.ts
- [x] T003 [P] Configure TailwindCSS with nutrition-focused color palette in tailwind.config.js
- [x] T004 [P] Setup component testing utilities in tests/utils/component-test-utils.tsx

## Phase 3.2: Tests First (TDD) ✅ COMPLETE
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Design Token Tests
- [x] T005 [P] Contract test design tokens interface in tests/contract/design-tokens.test.ts
- [x] T006 [P] Contract test nutrition color system in tests/contract/nutrition-colors.test.ts

### Base Component Tests
- [x] T007 [P] Contract test Button component interface in tests/contract/button.test.tsx
- [x] T008 [P] Contract test Card component interface in tests/contract/card.test.ts
- [x] T009 [P] Contract test Badge component interface in tests/contract/badge.test.ts
- [x] T010 [P] Contract test Input component interface in tests/contract/input.test.ts
- [x] T011 [P] Contract test Skeleton component interface in tests/contract/skeleton.test.ts

### Nutrition Component Tests
- [x] T012 [P] Contract test ProteinMeter component interface in tests/contract/protein-meter.test.ts
- [x] T013 [P] Contract test NutritionCard component interface in tests/contract/nutrition-card.test.ts
- [x] T014 [P] Contract test HealthGrade component interface in tests/contract/health-grade.test.ts
- [x] T015 [P] Contract test HalalBadge component interface in tests/contract/halal-badge.test.ts

### Integration & Accessibility Tests
- [x] T016 [P] Integration test component accessibility in tests/integration/accessibility.test.ts
- [x] T017 [P] Integration test mobile responsiveness in tests/integration/responsive.test.ts
- [x] T018 [P] Integration test design system consistency in tests/integration/design-consistency.test.ts

## Phase 3.3: Core Implementation ✅ COMPLETE

### Design System Foundation
- [x] T019 Implement design tokens system in src/lib/design-tokens.ts (implements DesignTokens contract)
- [x] T020 Implement utility functions in src/lib/utils.ts (cn helper, design token access)
- [x] T021 Setup global CSS with design tokens in src/styles/globals.css

### Base Components (shadcn/ui enhanced)
- [x] T022 [P] Implement Button component in src/components/ui/button.tsx
- [x] T023 [P] Implement Card component in src/components/ui/card.tsx
- [x] T024 [P] Implement Badge component in src/components/ui/badge.tsx
- [x] T025 [P] Implement Input component in src/components/ui/input.tsx
- [x] T026 [P] Implement Skeleton component in src/components/ui/skeleton.tsx

### Ali-Specific Nutrition Components
- [x] T027 [P] Implement ProteinMeter component in src/components/nutrition/protein-meter.tsx
- [x] T028 [P] Implement NutritionCard component in src/components/nutrition/nutrition-card.tsx
- [x] T029 [P] Implement HealthGrade component in src/components/nutrition/health-grade.tsx
- [x] T030 [P] Implement HalalBadge component in src/components/nutrition/halal-badge.tsx

### Layout Components
- [x] T031 [P] Implement Container component in src/components/layout/container.tsx
- [x] T032 [P] Implement Stack component in src/components/layout/stack.tsx
- [x] T033 [P] Implement Grid component in src/components/layout/grid.tsx

## Phase 3.4: Integration & Documentation

### Storybook Stories (Visual Testing)
- [ ] T034 [P] Create Button stories in stories/ui/Button.stories.tsx
- [ ] T035 [P] Create Card stories in stories/ui/Card.stories.tsx
- [ ] T036 [P] Create Badge stories in stories/ui/Badge.stories.tsx
- [ ] T037 [P] Create ProteinMeter stories in stories/nutrition/ProteinMeter.stories.tsx
- [ ] T038 [P] Create HealthGrade stories in stories/nutrition/HealthGrade.stories.tsx
- [ ] T039 [P] Create HalalBadge stories in stories/nutrition/HalalBadge.stories.tsx

### Component Integration
- [ ] T040 Create design system provider in src/components/design-system-provider.tsx
- [ ] T041 Setup component exports in src/components/index.ts
- [ ] T042 Validate component prop forwarding and ref handling across all components

## Phase 3.5: Polish & Optimization

### Performance & Bundle Optimization
- [ ] T043 [P] Optimize component bundle sizes with tree-shaking validation
- [ ] T044 [P] Performance test component rendering speed in tests/performance/rendering.test.ts
- [ ] T045 [P] Memory usage optimization for large product lists

### Accessibility & Quality Assurance
- [ ] T046 [P] Comprehensive accessibility audit using axe-core in tests/accessibility/audit.test.ts
- [ ] T047 [P] Keyboard navigation testing for all interactive components
- [ ] T048 [P] Screen reader compatibility testing with NVDA/JAWS simulation

### Documentation & Examples
- [ ] T049 [P] Create component usage documentation in docs/components.md
- [ ] T050 [P] Generate design token documentation in docs/design-tokens.md
- [ ] T051 [P] Update CLAUDE.md with design system usage patterns
- [ ] T052 [P] Create component migration guide from external UI libraries

## Dependencies

**Phase Dependencies:**
- Setup (T001-T004) before Tests (T005-T018)
- Tests (T005-T018) before Implementation (T019-T042)
- Implementation before Integration (T034-T042)
- Integration before Polish (T043-T052)

**Critical Dependencies:**
- T002 (design tokens) blocks T019, T021, T022-T033
- T019 (design tokens implementation) blocks T022-T033 (all components)
- T001 (Storybook setup) blocks T034-T039 (all stories)
- T022-T033 (component implementation) blocks T034-T039 (stories)

**No Dependencies (Pure Parallel):**
- T005-T018 (all contract tests can run together)
- T022-T026 (base components after design tokens ready)
- T027-T030 (nutrition components after design tokens ready)
- T031-T033 (layout components after design tokens ready)
- T034-T039 (all Storybook stories after components ready)
- T043-T052 (all polish tasks after implementation complete)

## Parallel Execution Examples

### Phase 3.2: All Contract Tests Together
```bash
# Launch T005-T018 in parallel (all tests, different files):
Task: "Contract test design tokens interface in tests/contract/design-tokens.test.ts"
Task: "Contract test Button component interface in tests/contract/button.test.ts"
Task: "Contract test ProteinMeter component interface in tests/contract/protein-meter.test.ts"
Task: "Integration test component accessibility in tests/integration/accessibility.test.ts"
# ... all 14 test tasks can run simultaneously
```

### Phase 3.3: Base Components Parallel Implementation
```bash
# Launch T022-T026 in parallel (after T019 design tokens complete):
Task: "Implement Button component in src/components/ui/button.tsx"
Task: "Implement Card component in src/components/ui/card.tsx"
Task: "Implement Badge component in src/components/ui/badge.tsx"
Task: "Implement Input component in src/components/ui/input.tsx"
Task: "Implement Skeleton component in src/components/ui/skeleton.tsx"
```

### Phase 3.3: Nutrition Components Parallel Implementation
```bash
# Launch T027-T030 in parallel (after T019 design tokens complete):
Task: "Implement ProteinMeter component in src/components/nutrition/protein-meter.tsx"
Task: "Implement HealthGrade component in src/components/nutrition/health-grade.tsx"
Task: "Implement HalalBadge component in src/components/nutrition/halal-badge.tsx"
```

### Phase 3.5: All Polish Tasks Together
```bash
# Launch T043-T052 in parallel (final optimization phase):
Task: "Optimize component bundle sizes with tree-shaking validation"
Task: "Comprehensive accessibility audit using axe-core in tests/accessibility/audit.test.ts"
Task: "Create component usage documentation in docs/components.md"
Task: "Update CLAUDE.md with design system usage patterns"
# ... all polish tasks can run simultaneously
```

## Validation Checklist
*GATE: Checked before task execution*

- [x] All contracts have corresponding tests (T005-T015 cover all 3 contract files)
- [x] All entities have implementation tasks (DesignToken→T019, BaseComponent→T022-T026, NutritionComponent→T027-T030)
- [x] All tests come before implementation (T005-T018 before T019-T042)
- [x] Parallel tasks truly independent (verified file paths and dependencies)
- [x] Each task specifies exact file path (all tasks include full file paths)
- [x] No task modifies same file as another [P] task (verified no conflicts)

## Notes
- **[P] tasks** = different files, no dependencies between them
- **TDD Critical**: Verify tests fail before implementing components
- **Constitutional Compliance**: shadcn/ui permitted by v1.1.0 amendment
- **Performance Target**: <100KB total bundle, <50ms component render time
- **Accessibility**: WCAG 2.1 AA compliance required for all components
- **Mobile-First**: All components must work on 320px+ screens
- **Nutrition Focus**: Color coding and layout optimized for Ali's use cases

## Success Criteria
- All 15+ components implemented with full TypeScript support
- Comprehensive Storybook with all component variations
- 100% accessibility compliance via automated testing
- Bundle size under constitutional limits (<100KB)
- Ready for integration with homepage (012-homepage) feature
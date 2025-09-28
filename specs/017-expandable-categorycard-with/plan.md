
# Implementation Plan: Expandable CategoryCard with Subcategory Tree Display

**Branch**: `017-expandable-categorycard-with` | **Date**: 2025-09-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/017-expandable-categorycard-with/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Transform CategoryCard component from simple card display into expandable tree structure showing hierarchical subcategories up to 6 levels deep. Users can expand category cards to see subcategories with Ali nutrition metrics, select any category level for navigation, and maintain search/filter state. Key features include keyboard navigation, mobile optimization, virtual scrolling performance optimization, and bulk expand/collapse operations. Technical approach leverages existing CategoryNode hierarchical data structure with children relationships and enhances the current CategoryIndexPage implementation.

## Technical Context
**Language/Version**: TypeScript 5.8+ with React 19+ functional components and hooks
**Primary Dependencies**: React, Vite 7+, TailwindCSS 4+, shadcn/ui components (zero runtime deps)
**Storage**: Static JSONL files (category-tree.json), no backend dependencies
**Testing**: Vitest for unit/integration testing, contract tests for component APIs
**Target Platform**: Web browsers (SSG static files, CDN-ready)
**Project Type**: web (single frontend consuming static data)
**Performance Goals**: <2s page load on 3G, <100ms search response, virtual scrolling for 3k+ categories
**Constraints**: <1MB bundle size, maintain virtual scrolling performance with expanded trees, 44px minimum touch targets
**Scale/Scope**: 3,195+ categories, 6-level hierarchy depth, CategoryCard enhancement with expansion state management

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Data-First Architecture
- **Status**: PASS - Leverages existing CategoryNode hierarchical data structure from category-tree.json
- **Compliance**: Feature consumes pre-generated static data, no backend dependencies required

### ✅ II. Test-Driven Development (NON-NEGOTIABLE)
- **Status**: PASS - Contract tests required for CategoryCard expansion APIs, integration tests for navigation
- **Approach**: Red-Green-Refactor cycle with failing tests before implementation

### ✅ III. Minimal Dependencies
- **Status**: PASS - Uses only constitutional stack: TypeScript, React, TailwindCSS, shadcn/ui
- **Justification**: No additional dependencies required, enhances existing components

### ✅ IV. Static Generation First
- **Status**: PASS - Frontend enhancement consuming existing static category-tree.json
- **Compliance**: No runtime server dependencies, purely client-side expansion state management

### ✅ V. Performance & Determinism
- **Status**: PASS - Virtual scrolling optimization maintains <2s load time, expansion state deterministic
- **Compliance**: Meets performance goals with dynamic height calculations for expanded trees

### ✅ VI. Design System First
- **Status**: PASS - Extends existing CategoryCard component, reuses shadcn/ui primitives
- **Approach**: Enhance existing component rather than create new one, compose with existing UI components

### ✅ VII. Component Composition Over Conditional Rendering
- **Status**: PASS - Expansion states will use early returns pattern for clear separation
- **Pattern**: Separate rendering paths for collapsed/expanded/loading states

### ✅ VIII. Transform Pipeline First
- **Status**: PASS - Leverages existing pre-computed category hierarchy and Ali metrics
- **Compliance**: No client-side tree building required, consumes optimized static data structure

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 1 (Single project) - Frontend-only enhancement to existing React application consuming static data

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate TDD tasks from contracts (CategoryCard.contract.ts, ExpansionState.contract.ts, VirtualScrolling.contract.ts)
- Create test tasks for each contract interface before implementation
- Data model tasks for expansion state management and virtual scrolling integration
- Component enhancement tasks for CategoryCard, CategoryIndexPage, and related utilities
- Integration tasks for search, keyboard navigation, and mobile responsiveness

**Ordering Strategy**:
- **Phase 0**: Contract test creation (must fail before implementation) [P]
- **Phase 1**: Data model and state management implementation [P]
- **Phase 2**: Core component enhancement (CategoryCard expansion functionality)
- **Phase 3**: Integration with existing systems (search, virtual scrolling, navigation)
- **Phase 4**: Accessibility and mobile optimization
- **Phase 5**: Performance optimization and bulk operations
- Mark [P] for parallel execution where dependencies allow

**Key Task Categories**:
1. **Contract Tests**: 9 test files for all contract interfaces
2. **State Management**: ExpansionState hook and performance monitoring
3. **Component Enhancement**: CategoryCard with expansion, subcategory tree rendering
4. **Virtual Scrolling**: Dynamic height calculation and scroll position management
5. **Accessibility**: ARIA tree navigation and keyboard controls
6. **Mobile**: Touch-friendly interaction and responsive design
7. **Integration**: Search auto-expansion and filter preservation
8. **Performance**: Bulk operations and memory optimization

**Estimated Output**: 35-40 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command) - research.md created
- [x] Phase 1: Design complete (/plan command) - data-model.md, contracts/, quickstart.md, CLAUDE.md updated
- [x] Phase 2: Task planning complete (/plan command - describe approach only) - Task generation strategy defined
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS - All principles satisfied
- [x] Post-Design Constitution Check: PASS - No violations introduced
- [x] All NEEDS CLARIFICATION resolved - No ambiguities in technical context
- [x] Complexity deviations documented - No deviations required

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*

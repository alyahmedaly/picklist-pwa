
# Implementation Plan: Category Index Page

**Branch**: `016-category-index-page` | **Date**: 2025-01-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/Users/ali.aboafifi/dev/aurora/ali-cli/health-prompts/picklist-site/specs/016-category-index-page/spec.md`

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
Transform the category tree visualization into a comprehensive category index for product discovery and navigation. Users should be able to browse all 3,195 categories in a clear grid/card layout and click any category to navigate to a filtered product list page. The page will include Ali-specific metrics (halal compliance %, protein density, price efficiency) and search/filtering capabilities optimized for CrossFit athlete nutrition goals.

## Technical Context
**Language/Version**: TypeScript 5.8+ with React 19+
**Primary Dependencies**: React, Vite 7+, TailwindCSS 4+, shadcn/ui components
**Storage**: Static JSON files (category-tree.json), pre-computed Ali metrics
**Testing**: Vitest for unit/integration tests, Storybook for component testing
**Target Platform**: Web browsers (mobile-first responsive design)
**Project Type**: web - frontend only (consumes static data)
**Performance Goals**: <2s page load on 3G, <100ms search response, <1MB bundle
**Constraints**: No backend dependencies, static site generation (SSG), Ali metrics pre-computed
**Scale/Scope**: 3,195 categories, 24,401 products, virtual scrolling for performance

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ **Data-First Architecture**: Consumes pre-computed category-tree.json with Ali metrics
- ✅ **Test-Driven Development**: Will write component tests before implementation
- ✅ **Minimal Dependencies**: Uses only React, Vite, TailwindCSS, shadcn/ui (constitutionally approved)
- ✅ **Static Generation First**: Frontend-only consuming static JSON, no server dependencies
- ✅ **Performance & Determinism**: Target <2s load, virtual scrolling for large datasets
- ✅ **Design System First**: Will use existing ui/ and nutrition/ components, extend only if needed
- ✅ **Component Composition**: Will use early returns for loading/error/data states
- ✅ **Transform Pipeline First**: Ali metrics will be pre-computed in transform pipeline, not client-side

**Status**: ✅ PASS - No constitutional violations detected

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

**Structure Decision**: Option 2 (Web application) - Frontend-only React app consuming static data

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
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- CategoryIndexPage contract → component test task [P]
- CategoryCard contract → component test task [P]
- CategorySearch contract → component test task [P]
- CategoryWithMetrics interface → type definition task [P]
- Ali metrics calculation → transform pipeline task
- Each acceptance scenario → integration test task
- Implementation tasks to make tests pass (TDD order)

**Ordering Strategy**:
- TDD order: Contract tests → Integration tests → Implementation
- Dependency order: Types → Components → Page → Integration
- Transform pipeline tasks first (Ali metrics pre-computation)
- Mark [P] for parallel execution (independent components)

**Specific Task Categories**:
1. **Transform Pipeline Tasks** (Dependency: none)
   - Extend category-tree generation with Ali metrics
   - Add halal compliance calculation
   - Add protein density aggregation
   - Add price efficiency scoring

2. **Type Definition Tasks** [P] (Dependency: none)
   - CategoryWithMetrics interface
   - AliContext types
   - Filter and sort types

3. **Component Test Tasks** [P] (Dependency: types)
   - CategoryCard component tests
   - CategorySearch component tests
   - CategoryIndexPage component tests

4. **Component Implementation Tasks** [P] (Dependency: tests)
   - CategoryCard component
   - CategorySearch component
   - CategoryIndexPage component

5. **Integration Tasks** (Dependency: components)
   - Page routing integration
   - Navigation functionality
   - Performance optimization
   - Accessibility compliance

**Estimated Output**: 18-22 numbered, ordered tasks in tasks.md

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
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none required)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*

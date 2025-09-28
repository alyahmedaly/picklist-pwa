
# Implementation Plan: Homepage Design System Components

**Branch**: `014-homepage-design-system` | **Date**: 2025-09-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/Users/ali.aboafifi/dev/aurora/ali-cli/health-prompts/picklist-site/specs/014-homepage-design-system/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → ✅ Loaded homepage design system components specification
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → ✅ Web application frontend detected (React components consuming static data)
   → ✅ Structure Decision: Frontend components extending existing design system
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → ✅ Research complete - all technical unknowns resolved
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
   → ✅ Design complete - data model, contracts, quickstart, CLAUDE.md updated
7. Re-evaluate Constitution Check section
   → ✅ Post-design review - no new violations, full compliance maintained
   → ✅ Progress Tracking: Post-Design Constitution Check PASS
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
   → ✅ Task generation strategy defined
9. STOP - Ready for /tasks command
   → ✅ Plan complete, ready for task generation
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Primary requirement: Complete Ali's product visualization webapp homepage with 4 missing design system components (FilterCard, ProductList, ProductCard, SearchControls) to enable navigation between 6 filter categories and browsing 11k+ products with virtual scrolling performance. Technical approach: React 19 + TypeScript components extending existing shadcn/ui design system, consuming pre-generated JSONL data files, optimized for mobile-first responsive design with <2s load time on 3G.

## Technical Context
**Language/Version**: TypeScript 5.8+ with strict mode
**Primary Dependencies**: React 19, shadcn/ui components, TailwindCSS 4+, Vite 7+
**Storage**: Static JSONL/JSON files (filtered-ali-*.jsonl, *-index.json, *-stats.json)
**Testing**: Vitest for unit and integration testing, React Testing Library
**Target Platform**: Static Site Generation (SSG) deployable to CDN
**Project Type**: web - frontend components extending existing design system
**Performance Goals**: <2s initial load on 3G, <1MB gzipped bundle, smooth virtual scrolling for 11k+ items
**Constraints**: Static site only, mobile-first responsive, no backend dependencies
**Scale/Scope**: 4 new components, 6 filter categories, 11k+ products per filter, single homepage view

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Principle I - Data-First Architecture**: ✅ PASS
- Consumes pre-generated JSONL data files as static assets
- No backend dependencies, deterministic data consumption

**Principle II - Test-Driven Development**: ✅ PASS
- Component tests with realistic data scenarios required
- Integration tests for filter navigation and product display

**Principle III - Minimal Dependencies**: ✅ PASS
- Core stack: TypeScript + React + Vite + TailwindCSS only
- shadcn/ui components permitted by constitutional exception
- No additional external libraries required

**Principle IV - Static Generation First**: ✅ PASS
- SSG via Vite build, CDN-ready output
- Client-side JavaScript consuming pre-generated data

**Principle V - Performance & Determinism**: ✅ PASS
- <2s load time target on 3G connection
- <1MB gzipped bundle requirement
- Virtual scrolling for predictable large list performance

**Constitutional Compliance**: FULL COMPLIANCE - No violations detected

## Project Structure

### Documentation (this feature)
```
specs/014-homepage-design-system/
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

**Structure Decision**: Web application frontend - Extending existing src/components/ structure with homepage-specific components

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - Virtual scrolling implementation for 11k+ products
   - React 19 concurrent features for homepage performance
   - shadcn/ui extension patterns for custom components
   - Mobile-first responsive design for filter navigation

2. **Generate and dispatch research agents**:
   ```
   Task: "Research React virtual scrolling solutions for 11k+ product lists"
   Task: "Find React 19 concurrent features for homepage performance optimization"
   Task: "Research shadcn/ui component extension patterns"
   Task: "Find mobile-first responsive design patterns for filter navigation"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all technical unknowns resolved

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
- Each component contract → component test task [P]
- Each data entity → type definition task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass
- Performance optimization tasks

**Ordering Strategy**:
- TDD order: Component tests before implementation
- Dependency order: Types → Data loading → Components → Homepage
- Mark [P] for parallel execution (independent components)
- Performance tasks at end (virtual scrolling, bundle optimization)

**Estimated Output**: 20-25 numbered, ordered tasks in tasks.md

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
- [x] Complexity deviations documented (none - full compliance)

---
*Based on Constitution v1.2.0 - See `.specify/memory/constitution.md`*

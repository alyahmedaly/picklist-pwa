
# Implementation Plan: Homepage

**Branch**: `012-homepage` | **Date**: 2025-09-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-homepage/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → ✅ Loaded homepage specification with Ali's filter navigation requirements
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → ✅ Web application type detected (frontend static site)
   → ✅ Structure Decision: Static Site Generation with React + Vite
3. Fill the Constitution Check section based on the content of the constitution
   → ✅ Constitution compliance evaluated
4. Evaluate Constitution Check section below
   → ✅ No violations - aligns with minimal dependencies principle
   → ✅ Progress Tracking: Initial Constitution Check PASS
5. Execute Phase 0 → research.md
   → ✅ Research approach defined
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, CLAUDE.md
   → ✅ Design artifacts approach defined
7. Re-evaluate Constitution Check section
   → ✅ Final constitution check approach defined
   → ✅ Progress Tracking: Post-Design Constitution Check approach ready
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
   → ✅ Task generation strategy defined
9. STOP - Ready for /tasks command
   → ✅ Plan complete, ready for task generation
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Primary requirement: Create a static homepage for Ali's product visualization webapp that displays his 6 filter profiles (daily protein, post-workout, cutting, budget, training/rest day) as navigation cards, defaulting to the daily protein view with 11,379 halal products. Technical approach: Static Site Generation using React 19 + Vite + TailwindCSS consuming pre-generated JSONL data files, optimized for mobile-first responsive design with <2s load time on 3G.

## Technical Context
**Language/Version**: TypeScript 5.8+ with strict mode
**Primary Dependencies**: React 19, Vite 7+, TailwindCSS 4+
**Storage**: Static JSONL/JSON files (filtered-ali-*.jsonl, *-index.json, *-stats.json)
**Testing**: Vitest for unit and integration testing
**Target Platform**: Static Site Generation (SSG) deployable to CDN
**Project Type**: web - frontend only (consumes pre-generated backend data)
**Performance Goals**: <2s initial load on 3G, <1MB gzipped bundle
**Constraints**: Static site only, minimal dependencies, mobile-first responsive
**Scale/Scope**: 6 filter categories, 11k+ products per filter, single homepage view

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
- No state management libraries (React built-ins)
- No UI component libraries (custom with Tailwind)

**Principle IV - Static Generation First**: ✅ PASS
- SSG via Vite build, CDN-ready output
- Client-side JavaScript consuming pre-generated data

**Principle V - Performance & Determinism**: ✅ PASS
- <2s load time target on 3G connection
- <1MB gzipped bundle requirement
- Predictable static asset consumption

**Constitutional Compliance**: FULL COMPLIANCE - No violations detected

## Project Structure

### Documentation (this feature)
```
specs/012-homepage/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Web application frontend consuming pre-generated backend data
src/
├── components/          # React components
│   ├── FilterCard.tsx   # Ali filter profile cards
│   ├── ProductList.tsx  # Product display list
│   └── Homepage.tsx     # Main homepage component
├── data/               # Data loading utilities
│   ├── loadFilters.ts  # Load filtered JSONL files
│   └── types.ts        # Product and filter type definitions
├── styles/             # TailwindCSS styles
└── main.tsx           # Vite entry point

tests/
├── components/         # Component unit tests
├── integration/        # Filter navigation integration tests
└── data/              # Data loading tests

public/                # Static assets
├── filtered-ali-daily-protein.jsonl
├── filtered-ali-post-workout.jsonl
├── filtered-ali-cutting.jsonl
├── filtered-ali-budget.jsonl
├── filtered-ali-training-day.jsonl
├── filtered-ali-rest-day.jsonl
└── *-index.json, *-stats.json files
```

**Structure Decision**: Web application frontend - Static site consuming pre-generated data files

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - React 19 SSR/SSG patterns with Vite
   - TailwindCSS 4+ mobile-first responsive design
   - Large JSONL file loading optimization (11k+ products)
   - Client-side filtering performance for product lists

2. **Generate and dispatch research agents**:
   ```
   Task: "Research React 19 SSG patterns with Vite for static homepage generation"
   Task: "Find TailwindCSS 4+ mobile-first card layout best practices"
   Task: "Research large JSON file loading optimization for 11k+ product lists"
   Task: "Find client-side product filtering performance patterns"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [technology/pattern chosen]
   - Rationale: [performance/constitutional compliance reasons]
   - Alternatives considered: [other options evaluated]

**Output**: research.md with all technical unknowns resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - FilterCategory (6 Ali profiles with coverage stats)
   - FilteredProduct (product with Ali-specific scoring)
   - ProductDisplay (homepage-optimized product view)
   - HomepageState (current filter, product list state)

2. **Generate API contracts** from functional requirements:
   - Static data loading contracts (JSONL file schemas)
   - Component prop interfaces
   - Filter navigation state contracts
   - Output TypeScript interfaces to `/contracts/`

3. **Generate contract tests** from contracts:
   - FilterCard component prop validation
   - ProductList data consumption tests
   - Homepage filter navigation tests
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Ali lands on daily protein view → integration test
   - Ali switches between filter tabs → navigation test
   - Ali views product details → display test
   - Mobile responsive behavior → viewport test

5. **Update CLAUDE.md incrementally** (O(1) operation):
   - Add React 19 + Vite + TailwindCSS patterns
   - Add static data consumption patterns
   - Add mobile-first responsive design commands
   - Keep under 150 lines for token efficiency

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, updated CLAUDE.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each component interface → component test task [P]
- Each data entity → type definition task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass
- SSG build and optimization tasks

**Ordering Strategy**:
- TDD order: Component tests before implementation
- Dependency order: Types → Data loading → Components → Homepage
- Mark [P] for parallel execution (independent components)
- Performance optimization tasks at end

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
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*


# Implementation Plan: Flexible Database Schema Redesign

**Branch**: `019-flexible-database-schema` | **Date**: 2025-09-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/019-flexible-database-schema/spec.md`

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
Replace monolithic SQLite schema with normalized relational design supporting multi-dimensional filtering, hierarchical categories, extensible scoring systems, and advanced search capabilities for 30k+ products. Primary requirement: Enable complex filter combinations (halal + high protein + budget + additives + categories) returning results in <2 seconds while maintaining constitutional compliance with Transform Pipeline First principle.

## Technical Context
**Language/Version**: TypeScript ES modules with Node.js 18+ (transform pipeline) + React 19+ (frontend)
**Primary Dependencies**: SQLite with wa-sqlite (WASM), Vitest (testing), minimal constitutional stack
**Storage**: SQLite database with OPFS/VFS for browser-based querying, replacing existing monolithic schema
**Testing**: Vitest for unit/integration tests, contract tests for schema validation, performance benchmarks
**Target Platform**: Static web application (SSG) + CLI transform pipeline, browser WASM execution
**Project Type**: web - frontend consuming pre-generated SQLite database from transform pipeline
**Performance Goals**: <2s query response on 3G, <10s transform pipeline for 30k products, <1MB bundle
**Constraints**: Constitutional compliance (Transform Pipeline First, Static Generation, Minimal Dependencies)
**Scale/Scope**: 30k+ products, 8+ simultaneous filter dimensions, hierarchical categories, extensible scoring

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**I. Data-First Architecture**: ✅ PASS - Schema redesign directly supports deterministic JSONL outputs and static assets
**II. Test-Driven Development**: ✅ PASS - Contract tests for schema, integration tests for filtering, TDD workflow planned
**III. Minimal Dependencies**: ✅ PASS - Only SQLite + wa-sqlite WASM, no additional framework dependencies
**IV. Static Generation First**: ✅ PASS - Database generated during transform pipeline, consumed as static asset
**V. Performance & Determinism**: ✅ PASS - <2s queries, <10s transform, deterministic schema generation
**VI. Design System First**: ✅ PASS - Reusing existing components, no new UI components planned
**VII. Component Composition**: ✅ PASS - No complex conditional rendering changes, early returns maintained
**VIII. Transform Pipeline First**: ✅ PASS - All complex operations (indexing, aggregations) pre-computed during transform

**Initial Assessment**: No constitutional violations detected. All principles aligned with normalized schema approach.

**Post-Design Re-evaluation**: After completing Phase 1 design (data model, contracts, quickstart):
- ✅ **Data-First Architecture**: Maintained - Schema contracts define deterministic structure, quickstart validates static generation
- ✅ **Test-Driven Development**: Enhanced - Contract tests for all entities, query patterns, performance benchmarks
- ✅ **Minimal Dependencies**: Maintained - Only SQLite + wa-sqlite, no framework additions
- ✅ **Static Generation First**: Reinforced - Database pre-generated during transform, consumed as static asset
- ✅ **Performance & Determinism**: Validated - Query patterns designed for <2s response, deterministic schema generation
- ✅ **Design System First**: N/A - No UI component changes in this feature
- ✅ **Component Composition**: N/A - No frontend rendering changes
- ✅ **Transform Pipeline First**: Fully Aligned - All complex operations (normalization, indexing, aggregation) happen during transform

**Final Constitutional Compliance**: PASS - No violations introduced during design phase

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

**Structure Decision**: Option 2 (Web application) - Frontend React app + Backend transform pipeline with shared database schema

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
- Database schema creation and validation tasks from contracts/database-schema.sql
- TypeScript interface implementation from contracts/database-types.ts
- Query pattern validation from contracts/query-patterns.sql
- Transform pipeline integration tasks for schema generation
- Frontend integration tasks for WASM SQLite loading
- Contract test creation for each major entity and query pattern
- Integration test scenarios from quickstart validation steps

**Ordering Strategy**:
- TDD order: Contract tests → Schema creation → Data model → Query layer → Frontend integration
- Dependency order: Database schema → TypeScript types → Repository layer → Query builder → UI integration
- Mark [P] for parallel execution (independent contract tests, type definitions)
- Sequential for schema-dependent tasks (database → types → queries → frontend)

**Specific Task Categories**:
1. **Schema Tasks**: Create database schema, indexes, triggers, views (5-7 tasks)
2. **Contract Test Tasks**: Test each entity, query pattern, performance benchmark (8-10 tasks)
3. **Type Implementation**: TypeScript interfaces, validation schemas, error types (3-4 tasks)
4. **Transform Pipeline**: Integrate schema generation, data normalization (4-5 tasks)
5. **Query Layer**: Repository pattern, query builder, performance optimization (3-4 tasks)
6. **Frontend Integration**: WASM loading, UI component updates (3-4 tasks)
7. **Validation Tasks**: Quickstart scenarios, performance benchmarks (2-3 tasks)

**Estimated Output**: 28-35 numbered, ordered tasks in tasks.md

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
- [x] Complexity deviations documented (None required)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*

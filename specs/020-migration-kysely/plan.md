
# Implementation Plan: Database Query Layer Migration to Kysely

**Branch**: `020-migration-kysely` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/020-migration-kysely/spec.md`

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
**Primary Requirement**: Migrate existing raw SQL queries in the flexible database system to type-safe Kysely query builder with compile-time validation, while maintaining zero functional regressions and backward compatibility during transition.

**Technical Approach**: Implement direct migration strategy with repository pattern for query encapsulation, and comprehensive parity testing to ensure identical functionality. Complete replacement of raw SQL with type-safe Kysely queries.

## Technical Context
**Language/Version**: TypeScript 5.8+ with strict mode, Node.js 22+ for transform pipeline
**Primary Dependencies**: Kysely 0.28.7 (already installed), SQLocal 0.14.2, React 19+, Vite 7+
**Storage**: SQLite via SQLocal (browser) with IndexedDB persistence (wa-sqlite legacy, now replaced by SQLocal)
**Testing**: Vitest for unit/integration testing, explicit parity test artifacts in tests/parity/*.test.ts for regression validation
**Target Platform**: Browser (frontend) + Node.js (transform pipeline), static site generation
**Project Type**: Web application with frontend consumption of pre-generated database
**Performance Goals**: Query performance parity with existing raw SQL, <10s transform pipeline, <2s frontend load
**Constraints**: Bundle size increase <25KB gzipped, zero functional regressions, backward compatibility during migration
**Scale/Scope**: 30k+ products, 7 normalized tables, feature flag support (search conditional), existing React hooks integration

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**✅ Data-First Architecture**: Migration maintains existing deterministic data outputs and SQLite database generation. No changes to transform pipeline data models.

**✅ Test-Driven Development**: TDD approach with parity testing framework to ensure zero regressions. All queries must pass existing contract tests.

**✅ Minimal Dependencies**: Kysely is already installed (v0.28.7). No new dependencies added. Uses existing TypeScript, React, Vite stack.

**✅ Static Generation First**: No changes to static generation approach. Frontend continues consuming pre-generated SQLite database files.

**✅ Performance & Determinism**: Migration must maintain <10s transform time and <2s frontend load. Identical outputs for identical inputs preserved.

**✅ Infrastructure-First Development**: Migration examines existing flexible schema infrastructure in `src/data/`, leveraging established patterns and integration points.

**Constitutional Compliance**: PASS - Migration aligns with all constitutional principles without requiring amendments or deviations.

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

**Structure Decision**: Option 1 (Single project) - Migration affects existing `src/` structure with new database query layer components, maintaining current architecture

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
- Load `.specify/templates/tasks-template.md` as base structure
- Generate tasks from Phase 1 design artifacts (data model, contracts, quickstart validation steps)
- **Parity Testing First**: Create parity test framework before any migration
- **Incremental Migration**: Each repository gets dedicated test → implement cycle
- **Feature Flag Testing**: Separate tasks for search enabled/disabled scenarios
- **Hook Integration**: Dedicated tasks for React hook compatibility validation

**Ordering Strategy** (Direct Migration Approach):
- **Phase 1**: Schema validation + parity testing framework [P] - BEFORE any migration
- **Phase 2**: Kysely foundation (driver, connection, types) [P] - Infrastructure setup
- **Phase 3**: Repository pattern with immediate parity validation [Sequential] - Test → Implement → Replace
- **Phase 4**: Search repository (conditional on table existence) [P] - Handle graceful fallback
- **Phase 5**: Hook integration with preserved interfaces [Sequential] - Direct replacement
- **Phase 6**: Performance validation [P] - Regression detection
- **Phase 7**: Final documentation and validation [P] - Complete migration

**Task Categories**:
1. **Contract Tests** (from contracts/): Database interface, repository patterns, test specifications [P]
2. **Foundation Tasks**: Kysely driver, type definitions, connection setup [P]
3. **Migration Tasks**: Repository implementations with parity validation [Sequential - dependency order]
4. **Integration Tasks**: Hook updates, feature flag handling [Sequential]
5. **Validation Tasks**: Performance testing, bundle analysis, regression checks [P]

**Specific Task Focus Areas**:
- Parity test cases for all 12 identified query patterns from existing `loadFlexibleDatabase.ts`
- Repository pattern implementation following existing query signatures
- Feature flag conditional logic for search functionality (FLEX_SCHEMA_ENABLE_SEARCH)
- React hook interface preservation with internal implementation changes
- Bundle size monitoring with <25KB increase constraint
- Performance benchmarking with 10% regression threshold
- Rollback procedure validation and documentation

**Test-Driven Approach**:
- Each task includes failing test creation before implementation
- Parity tests compare legacy vs Kysely results for identical outputs
- Contract tests validate TypeScript interfaces and repository patterns
- Integration tests ensure hook behavior remains unchanged
- Performance tests establish regression detection

**Estimated Output**: 35-40 numbered, ordered tasks in tasks.md
- Foundation: 8-10 tasks (types, driver, connection, basic repository)
- Migration: 12-15 tasks (query migration with parity testing)
- Integration: 8-10 tasks (hooks, feature flags, search handling)
- Validation: 7-10 tasks (performance, bundle size, documentation)

**Parallel Execution Markers**: [P] indicates tasks that can run independently
**Critical Path**: Parity framework → Repository migration → Hook integration → Validation

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| **Query Result Differences** | Medium | High | Comprehensive parity testing framework with 12 baseline queries | Implementation Team |
| **Search Table Absence** | High | Medium | Runtime detection with graceful fallback, conditional typing | Architecture Team |
| **Bundle Size Creep** | Medium | Medium | Pre-commit size monitoring, tree-shaking optimization | Build Team |
| **Performance Regression** | Low | High | Benchmark-driven development, 10% threshold monitoring | Performance Team |
| **FTS5 Raw SQL Mismatch** | Medium | High | Hybrid repository approach, maintain legacy search path until parity | Search Team |
| **Feature Flag State Mismatch** | Medium | Medium | Test matrix across all flag combinations (enabled/disabled × tiers) | Testing Team |
| **TypeScript Inference Issues** | Low | Medium | Explicit return type annotations, conditional type guards | Type Safety Team |
| **Direct Migration Risk** | Medium | High | Comprehensive parity testing, schema validation, staged replacement | Implementation Team |

## Phase Exit Criteria

| Phase | Exit Criteria | Validation Method |
|-------|---------------|-------------------|
| **Phase 1: Parity Framework** | All 12 baseline queries captured and executable | Automated parity test suite passes |
| **Phase 2: Kysely Foundation** | Type-safe queries compile and execute | Unit tests + TypeScript compilation |
| **Phase 3: Repository Migration** | 100% parity with legacy queries | Parity tests pass for all migrated queries |
| **Phase 4: Search Implementation** | Graceful handling of search enabled/disabled | Feature flag test matrix passes |
| **Phase 5: Hook Integration** | React hooks maintain identical interfaces | Integration tests + interface compatibility |
| **Phase 6: Performance Validation** | <10% performance regression, <25KB bundle increase | Automated benchmarks + size monitoring |
| **Phase 7: Legacy Cleanup** | All legacy code removed, documentation complete | Code review + final test sweep |

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

**No constitutional violations identified** - Migration aligns with all constitutional principles without requiring amendments or deviations.


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
*Based on Constitution v1.5.0 - See `.specify/memory/constitution.md`*

# Implementation Plan: Hybrid Nutrition Score


**Branch**: `008-let-s-write` | **Date**: 2025-09-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-let-s-write/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Implement hybrid nutrition scoring system that combines EU Nutri-Score scientific foundation with AliScore percentile ranking enhancement. System calculates dual scoring (global + category-relative) for each product, providing both absolute nutritional assessment and dataset-relative positioning for optimal product comparison and recommendation.

## Technical Context
**Language/Version**: TypeScript/Node.js 18+ (existing transform pipeline)
**Primary Dependencies**: Existing transform pipeline, Vitest testing framework
**Storage**: JSONL file output (existing pipeline), no database required
**Testing**: Vitest (constitutional requirement), RED-GREEN-REFACTOR TDD cycle
**Target Platform**: Node.js CLI environment (existing pipeline)
**Project Type**: single - extends existing CSV transform pipeline
**Constraints**: Deterministic output, no network access, streaming/chunked processing
**Scale/Scope**: 30k+ products, dual scoring calculations, percentile ranking across full dataset

**User Context**: let's break this down into plan

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (extends existing transform pipeline only)
- Using framework directly? YES (no wrapper classes for scoring)
- Single data model? YES (extends existing Product interface)
- Avoiding patterns? YES (direct scoring functions, no unnecessary abstraction)

**Architecture**:
- EVERY feature as library? YES (scoring as pure functions in transform modules)
- Libraries listed:
  * computeNutriScore - EU Nutri-Score calculation
  * computeAliScore - Percentile ranking enhancement
  * computeHealthGrades - Grade classification
- CLI per library: Extends existing transform-data.ts CLI
- Library docs: Will update existing CLAUDE.md

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? YES (test MUST fail first)
- Git commits show tests before implementation? YES
- Order: Contract→Integration→E2E→Unit strictly followed? YES
- Real dependencies used? YES (actual CSV fixtures, no mocks)
- Integration tests for: Scoring pipeline, dual score output, grade distribution
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:
- Structured logging included? YES (extends existing --log json)
- Frontend logs → backend? N/A (CLI only)
- Error context sufficient? YES (scoring validation errors)

**Versioning**:
- Version number assigned? Extends existing pipeline version
- BUILD increments on every change? YES
- Breaking changes handled? YES (additive fields to Product interface)

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

**Structure Decision**: Option 1 (Single project) - Extends existing transform pipeline structure

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
   - Run `/scripts/bash/update-agent-context.sh cursor` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)

**Contract-Based Task Generation**:
- `computeNutriScore` function → contract test + unit test + implementation [P]
- `computePercentileRank` function → contract test + unit test + implementation [P]
- `computeHealthGrade` function → contract test + unit test + implementation [P]
- `enhanceWithDualScoring` pipeline → integration test + implementation
- Extended Product interface → type definition + validation

**TDD Test Ordering (Constitutional Requirement)**:
1. **Contract Tests First**: Function signatures and I/O contracts (MUST fail initially)
2. **Integration Tests**: Full pipeline with dual scoring output (MUST fail initially)
3. **Unit Tests**: Individual scoring functions with edge cases (MUST fail initially)
4. **Implementation Tasks**: Make tests pass (RED→GREEN→REFACTOR cycle)

**Dependency-Based Ordering**:
1. **Foundation**: Extend Product interface with scoring fields
2. **Core Functions**: EU Nutri-Score calculation (independent) [P]
3. **Enhancement Functions**: Percentile ranking and grade assignment [P]
4. **Pipeline Integration**: Two-pass scoring integration with existing transform
5. **Statistics Enhancement**: Extend stats.json with scoring distribution data

**Parallel Execution Opportunities [P]**:
- Nutri-Score and percentile functions (independent implementations)
- Unit tests for different scoring functions (independent test files)
- Contract tests for each function signature (independent validation)

**Constitutional Compliance Built-In**:
- Determinism guaranteed by design (stable sorting, fixed precision arithmetic)
- TDD cycle enforcement (all tests MUST fail before implementation)
- Structured logging integration (extend existing --log json)

**Expected Task Categories**:
- Type definitions: 2 tasks (Product interface extensions, scoring types)
- Contract tests: 3 tasks (core scoring functions)
- Unit tests: 6 tasks (covering edge cases, error conditions, boundary values)
- Integration tests: 2 tasks (full pipeline, grade distribution)
- Implementation: 4 tasks (core functions + pipeline integration)
- Documentation: 1 task (update quickstart validation)

**Estimated Output**: 18 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md)

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
- [x] Complexity deviations documented (none - follows constitutional principles)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
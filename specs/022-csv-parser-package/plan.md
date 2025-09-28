
# Implementation Plan: CSV Parser Package

**Branch**: `022-csv-parser-package` | **Date**: September 24, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/Users/ali.aboafifi/dev/aurora/ali-cli/health-prompts/picklist-site/specs/022-csv-parser-package/spec.md`

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
Extract existing CSV parsing logic from transform-data.ts to a dedicated @picklist/parser package to enable code reuse across applications while preserving all current functionality and behavioral identity. This involves moving CSVRow interface, helper functions (createCSVRow, csvRowToRecord), and @std/csv integration to a new workspace package with semantic versioning at 1.0.0.

## Technical Context
**Language/Version**: TypeScript 5.8+ with ES modules in Node.js 22+
**Primary Dependencies**: @std/csv library for CSV parsing, NPM workspaces
**Storage**: N/A (parser operates on in-memory data structures)
**Testing**: Vitest for unit testing, structural comparison validation
**Target Platform**: Node.js server-side transformation pipeline
**Project Type**: single (NPM workspace package extraction)
**Performance Goals**: No explicit target beyond subjective parity with current implementation
**Constraints**: Must preserve behavioral identity, fail-fast on malformed data, fully in-memory parsing
**Scale/Scope**: Parse Dutch food product CSVs, maintain compatibility with sparsity calculation from @picklist/core

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**✅ Minimal Dependencies**: Package extraction maintains existing @std/csv dependency without adding new external libraries. Follows constitutional requirement for minimal dependencies.

**✅ Test-Driven Development**: Specification requires structural comparison validation and unit tests, compatible with TDD mandate.

**✅ Performance & Determinism**: Package preserves deterministic behavior and performance parity requirements aligned with <10s transform pipeline goal.

**✅ Infrastructure-First Development**: Extraction builds on existing NPM workspace infrastructure from @picklist/core, following established patterns.

**✅ SOLID Principles**: Single Responsibility (focused on CSV parsing), Open/Closed (extensible through separate functions), minimal interfaces for ISP compliance.

**No Constitutional Violations Detected** - Package extraction aligns with existing architectural principles and infrastructure patterns.

**Post-Design Constitution Re-evaluation** ✅:
- **TDD Compliance**: Contract tests created that will fail until implementation (parser-api.contract.test.ts)
- **Minimal Dependencies**: Design maintains existing @std/csv dependency without additions
- **Infrastructure-First**: Builds on established NPM workspace patterns from @picklist/core
- **SOLID Principles**: API design follows SRP (focused CSV parsing), ISP (minimal interfaces), DIP (dependency injection through imports)
- **Performance**: Design preserves in-memory processing and two-pass approach for <10s pipeline requirement
- **Determinism**: Maintains identical output behavior through structural validation approach

**Final Gate Status**: ✅ PASS - Ready for task generation

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

**Structure Decision**: Option 1 (Single project) - NPM workspace package extraction within existing monorepo structure

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
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
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
- Package setup tasks: NPM workspace configuration, TypeScript setup, dependencies
- Contract test tasks: Create failing tests for each API function [P]
- Implementation tasks: Extract and move existing code from transform-data.ts
- Integration tasks: Update transform-data.ts to use @picklist/parser
- Validation tasks: Structural comparison tests, performance parity verification

**Ordering Strategy**:
- **Phase 1**: Package infrastructure setup (workspace, dependencies, TypeScript)
- **Phase 2**: Contract tests creation (fail-first TDD approach) [P]
- **Phase 3**: Core function extraction from transform-data.ts [Sequential due to dependencies]
- **Phase 4**: Integration with existing transform pipeline
- **Phase 5**: Validation and documentation completion [P]

**Specific Task Categories**:
1. **Setup Tasks**: NPM workspace, package.json, tsconfig.json, dependencies
2. **Contract Tasks**: API contract tests for readCSV, createRows, convertTypes, legacy helpers
3. **Extraction Tasks**: Move CSVRow interface, createCSVRow function, csvRowToRecord function
4. **Implementation Tasks**: Implement readCSV, createRows, convertTypes with @std/csv
5. **Integration Tasks**: Update transform-data.ts imports, verify identical behavior
6. **Validation Tasks**: Structural comparison tests, performance benchmarks, quickstart execution

**Estimated Output**: 18-22 numbered, ordered tasks in tasks.md

**TDD Approach**:
- Contract tests created first (will fail)
- Implementation makes tests pass
- Integration validates behavior identity
- Quickstart provides end-to-end validation

**Parallel Execution Opportunities** [P]:
- Contract test creation (independent test files)
- Documentation tasks (README, API docs)
- Validation test setup (can be prepared while implementation proceeds)

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
- [x] Phase 1: Design complete (/plan command) - data-model.md, contracts/, quickstart.md created
- [x] Phase 2: Task planning complete (/plan command - describe approach only) - strategy documented
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS - No violations detected
- [x] Post-Design Constitution Check: PASS - TDD compliance, minimal dependencies confirmed
- [x] All NEEDS CLARIFICATION resolved - Comprehensive clarifications session completed
- [x] Complexity deviations documented - No deviations required

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*

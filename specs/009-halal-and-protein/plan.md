# Implementation Plan: Halal Compliance & Protein Optimization

**Branch**: `009-halal-and-protein` | **Date**: 2025-09-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-halal-and-protein/spec.md`

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
Extend the existing product transformation pipeline with Halal compliance detection and protein optimization features. The system will analyze product ingredients and E-numbers to determine Halal status, calculate protein density scores for body recomposition goals, and generate satiety intelligence using evidence-based factors. This builds on the existing hybrid nutrition scoring system without disrupting current functionality.

## Technical Context
**Language/Version**: TypeScript/Node.js 18+ (existing codebase)
**Primary Dependencies**: Existing CSV parsing, Vitest testing framework, existing E-number database
**Storage**: File-based JSONL output (existing pattern)
**Testing**: Vitest (constitutional requirement - existing framework)
**Target Platform**: Node.js CLI tool (existing architecture)
**Project Type**: single (extends existing data transformation pipeline)
**Constraints**: Deterministic output, byte-identical results, streaming processing, no external dependencies
**Scale/Scope**: 30k products (Dutch AH dataset), 3 new scoring interfaces, existing transform pipeline integration

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (extending existing data transformation pipeline)
- Using framework directly? Yes (existing Vitest framework, no wrappers)
- Single data model? Yes (extending existing Product interface with optional fields)
- Avoiding patterns? Yes (no Repository/UoW - direct transformation functions)

**Architecture**:
- EVERY feature as library? Yes (extending existing transform modules)
- Libraries listed: parseHalal, proteinScoring, satietyAnalysis (integrate with existing transform pipeline)
- CLI per library: Extends existing transform-data.ts CLI (no new CLIs)
- Library docs: Updates to existing CLAUDE.md

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? Yes (constitutional requirement)
- Git commits show tests before implementation? Yes (will follow TDD)
- Order: Contract→Integration→E2E→Unit strictly followed? Yes
- Real dependencies used? Yes (actual CSV fixtures, no mocks)
- Integration tests for: new scoring modules, contract changes, extended schemas? Yes
- FORBIDDEN: Implementation before test, skipping RED phase - Will be enforced

**Observability**:
- Structured logging included? Yes (extends existing JSON logging)
- Frontend logs → backend? N/A (CLI tool only)
- Error context sufficient? Yes (halal confidence levels, protein calculation errors)

**Versioning**:
- Version number assigned? Extends existing versioning scheme
- BUILD increments on every change? Yes (existing pattern)
- Breaking changes handled? No breaking changes (additive optional fields only)

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

**Structure Decision**: Option 1 (Single project - extending existing data transformation pipeline)

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
- Contract validation tasks for each interface (HalalAnalysis, ProteinScoring, SatietyIntelligence) [P]
- Integration tests for existing pipeline extension [P]
- Type definition tasks extending existing Product interface
- Implementation tasks for scoring modules integrated with existing transform pipeline

**Ordering Strategy** (TDD Constitutional Requirement):
1. **Contract Tests First**: Validate interface contracts (failing tests)
2. **Type Extensions**: Extend existing Product interface with optional fields
3. **Integration Tests**: Full pipeline tests with new scoring (failing tests)
4. **Unit Tests**: Individual scoring module tests (failing tests)
5. **Implementation**: Make contract tests pass
6. **Implementation**: Make integration tests pass
7. **Implementation**: Make unit tests pass

**Dependency Mapping**:
- Halal analysis → leverages existing E-number and ingredient parsing
- Protein scoring → requires nutritional data validation
- Satiety analysis → depends on both nutritional and additive data
- Pipeline integration → extends existing `enhanceScoringPipeline.ts`

**Parallel Execution Markers**:
- [P] Contract test files (independent interfaces)
- [P] Unit test files (independent scoring modules)
- [P] Type definition files (separate interface files)

**Estimated Output**: 20-25 numbered, ordered tasks in tasks.md

**Task Categories**:
- 3 Contract validation tasks
- 4 Integration test tasks
- 6 Unit test tasks
- 3 Type/interface tasks
- 6 Implementation tasks
- 3 validation tasks

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
- [ ] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
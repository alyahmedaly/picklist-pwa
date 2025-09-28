# Implementation Plan: Personal Health Extensions (Halal & Protein)

**Branch**: `008-let-s-write` | **Date**: 2025-09-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-let-s-write/spec.md`

**Extension Context**: Building upon existing hybrid nutrition scoring system to add personal health optimization layers:
- Halal compliance detection and structured analysis
- Protein density optimization for Ali's 170g daily target
- Satiety intelligence using evidence-based Satiety Index research

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
Extend the existing hybrid nutrition scoring system (EU Nutri-Score + AliScore percentile enhancement) with personal health optimization layers focused on Ali's specific needs: Halal compliance detection, protein density optimization for 170g daily target, and evidence-based satiety intelligence using Satiety Index research. These additions will be implemented as separate scoring objects appended to the existing Product interface, allowing the UI to filter and compare different scoring perspectives without disrupting the current scoring system.

## Technical Context
**Language/Version**: TypeScript/Node.js 18+
**Primary Dependencies**: Vitest testing framework, existing transform pipeline modules
**Storage**: File-based CSV→JSONL transformation pipeline, no database
**Testing**: Vitest framework with TDD approach (existing constitutional requirement)
**Target Platform**: Node.js CLI environment, MacOS/Linux development
**Project Type**: single - extends existing CSV transform pipeline
**Performance Goals**: <10s for 30k products (constitutional requirement), maintain existing performance
**Constraints**: <150MB RSS memory usage, deterministic output, streaming compatible
**Scale/Scope**: 30k Dutch products from Albert Heijn dataset, extend existing Product interface

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (extends existing transform pipeline)
- Using framework directly? YES (Vitest, existing modules)
- Single data model? YES (extends existing Product interface)
- Avoiding patterns? YES (no Repository/UoW - pure functions only)

**Architecture**:
- EVERY feature as library? YES (pure transform functions)
- Libraries listed:
  - computeHalalCompliance.ts (Halal detection)
  - computeProteinOptimization.ts (protein density scoring)
  - computeSatietyAnalysis.ts (satiety intelligence)
- CLI per library: NO (extends existing transform-data.ts CLI)
- Library docs: YES (JSDoc + existing patterns)

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? YES (TDD required)
- Git commits show tests before implementation? YES (will enforce)
- Order: Contract→Integration→E2E→Unit strictly followed? YES
- Real dependencies used? YES (no mocks, real product data)
- Integration tests for: YES (new scoring fields in transform pipeline)
- FORBIDDEN: Implementation before test, skipping RED phase - ENFORCED

**Observability**:
- Structured logging included? YES (extends existing --log json)
- Frontend logs → backend? N/A (CLI tool)
- Error context sufficient? YES (existing error handling)

**Versioning**:
- Version number assigned? N/A (feature extension)
- BUILD increments on every change? YES (follows existing)
- Breaking changes handled? YES (additive-only, backward compatible)

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

**Structure Decision**: [DEFAULT to Option 1 unless Technical Context indicates web/mobile app]

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
- Generate tasks from Phase 1 design docs (data-model.md, contracts/, quickstart.md)
- Each interface (HalalAnalysis, ProteinScoring, SatietyIntelligence) → contract test task [P]
- Each scoring function → implementation task after tests
- Pipeline integration tasks to append new scoring objects
- Statistics integration for personalHealthStats

**Ordering Strategy**:
- TDD order: Contract tests → Unit tests → Implementation
- Dependency order: Core functions → Pipeline integration → Statistics
- Mark [P] for parallel execution (independent files)
- Extend existing Product interface (backward compatible)

**Estimated Tasks**:
1. **Setup** (2 tasks): Extend Product interface, create new scoring types
2. **Contract Tests** (3 tasks): halal-compliance, protein-optimization, satiety-analysis [P]
3. **Unit Tests** (3 tasks): Core function testing [P]
4. **Implementation** (3 tasks): Core scoring functions [P]
5. **Integration** (2 tasks): Pipeline enhancement, statistics extension
6. **Validation** (1 task): Quickstart scenarios

**Total**: ~14 tasks leveraging existing infrastructure

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
- [ ] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
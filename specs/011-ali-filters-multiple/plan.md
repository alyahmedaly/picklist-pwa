
# Implementation Plan: Ali Filters + Multiple Outputs

**Branch**: `011-ali-filters-multiple` | **Date**: 2025-01-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-ali-filters-multiple/spec.md`

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
Core filtering system enabling Ali (CrossFit athlete) to quickly find products matching his specific nutritional needs: halal compliance, protein optimization (170g daily target), post-workout recovery, fat-loss compatibility, and budget optimization. System extends existing body recomposition scoring pipeline to generate filtered JSONL outputs while maintaining <10s performance for 30,498 products.

## Technical Context
**Language/Version**: TypeScript + Node.js (ES modules)
**Primary Dependencies**: React 19.1.1, Vite, @std/csv, cac (CLI parsing)
**Storage**: File-based (CSV input → JSONL output), existing transform pipeline
**Testing**: Vitest with contract/unit/integration test structure
**Target Platform**: Node.js CLI + React frontend (hybrid project)
**Project Type**: Hybrid (CLI transform pipeline + web frontend)
**Performance Goals**: <10 second processing for 30,498 products
**Constraints**: Maintain backward compatibility with existing transform pipeline
**Scale/Scope**: 30,498 products, 5+ filter combinations, 19,127 halal analyzed products

**User-Provided Context**: Ali is a 165cm, 83kg CrossFit athlete targeting 72kg, training 4-5x/week, requiring halal compliance, 170g protein daily, alternating training days (2000 kcal, 220g carbs) and rest days (1750 kcal, 120g carbs). Prefers tuna+potato over tuna+rice combinations.

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Build on Existing Systems**: ✅ PASS - Extends existing body recomposition scoring pipeline rather than creating new system
**Maintain Performance**: ✅ PASS - Leverages existing <10s processing baseline for 30,498 products
**Backward Compatibility**: ✅ PASS - Adds filtering capability without modifying core transform logic
**Test-First Approach**: ✅ PASS - Will follow existing TDD patterns with contract/unit/integration tests
**CLI Integration**: ✅ PASS - Extends existing CLI interface with filter flags

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

**Structure Decision**: Option 1 (Single project) - Existing transform pipeline with React frontend, no separate web/mobile structure needed

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
1. **Contract Tests** (from `/contracts/` directory):
   - `filter-engine.ts` → Contract test for filtering functions [P]
   - `output-generator.ts` → Contract test for output generation [P]
   - `cli-integration.ts` → Contract test for CLI parsing [P]

2. **Core Implementation Tasks**:
   - Filter engine implementation using existing scoring data
   - Output generator leveraging existing JSONL patterns
   - CLI extension adding filter flags to existing transform script
   - Ali-specific filter profiles and defaults

3. **Integration Tasks**:
   - Integration with existing `enhanceScoringPipeline.ts`
   - Performance validation maintaining <10s baseline
   - Compatibility testing with existing output formats

4. **User Story Validation**:
   - Each acceptance scenario from spec → integration test
   - Ali's specific use cases (halal+protein, post-workout, etc.)
   - Real data validation with 30,498 product dataset

**Ordering Strategy**:
- **Phase A**: Contract tests (all [P] - parallel execution)
- **Phase B**: Core models and types extending existing interfaces
- **Phase C**: Filter engine implementation
- **Phase D**: Output generation and CLI integration
- **Phase E**: Integration tests and performance validation
- **Phase F**: Ali-specific customizations and quickstart validation

**Dependencies Identified**:
- All tasks depend on existing scoring pipeline (Feature 010)
- CLI tasks depend on existing `transform-data.ts` structure
- Output tasks depend on existing writer utilities
- Performance tasks require access to full product dataset

**Estimated Output**:
- 12-15 contract/unit test tasks [P]
- 8-10 implementation tasks (sequential)
- 5-7 integration test tasks
- 3-4 validation/documentation tasks
- **Total**: ~30 numbered, ordered tasks in tasks.md

**TDD Focus**:
- All tests written before implementation (red-green-refactor)
- Contract tests ensure interface compatibility
- Integration tests validate real-world Ali scenarios
- Performance tests maintain existing baseline

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
- [x] Post-Design Constitution Check: PASS (extends existing patterns, maintains performance)
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none required)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*

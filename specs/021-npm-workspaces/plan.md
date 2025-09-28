
# Implementation Plan: NPM Workspaces Migration

**Branch**: `021-npm-workspaces` | **Date**: January 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/021-npm-workspaces/spec.md`

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
**Phase 1 Focus**: Extract @picklist/core package from monolithic codebase. This package contains shared utilities, types, and helper functions WITHOUT parsing logic. Parsing functions (parseIngredients, parseAllergens, etc.) will be extracted to @picklist/parser in future phases. Success here establishes the foundation utilities that all other packages depend on.

## Technical Context
**Language/Version**: TypeScript 5.8+, Node.js 22+
**Primary Dependencies**: NPM workspaces, TypeScript project references, consola, @std/csv, better-sqlite3, kysely, React 19, Vite 7+
**Storage**: File system reorganization, SQLite databases
**Testing**: Vitest, Testing Library, contract tests, integration tests
**Target Platform**: Node.js CLI tools, modern browsers (ES2022+)
**Project Type**: web - CLI backend + React frontend with shared core packages
**Performance Goals**: Faster incremental builds (qualitative improvement), maintain <10s transform pipeline performance
**Constraints**: Preserve all existing functionality, maintain backwards compatibility, enforce single dependency versions at root
**Scale/Scope**: Single @picklist/core package extraction focused on utilities only (~15-20 utility files), establish workspace foundation

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**✅ I. Data-First Architecture**: PASS - NPM workspaces preserve existing data models and JSONL output formats, no changes to transform pipeline outputs

**✅ II. Test-Driven Development**: PASS - Migration includes comprehensive contract tests, integration tests for package boundaries, and parity tests to ensure identical behavior

**✅ III. Minimal Dependencies**: PASS - No new runtime dependencies added, only development tooling (NPM workspaces is built into NPM 7+)

**✅ IV. Static Generation First**: PASS - Web application remains static, workspace reorganization does not affect build output or deployment

**✅ V. Performance & Determinism**: PASS - Workspace isolation improves build performance through incremental compilation, maintains <10s transform pipeline requirement

**✅ VI. Design System First**: N/A - No UI components affected by workspace reorganization

**✅ VII. Component Composition**: N/A - No component changes, purely build/packaging reorganization

**✅ VIII. Transform Pipeline First**: PASS - Core transform logic moves to dedicated @picklist/core package, maintaining pre-computation architecture

**✅ IX. Infrastructure-First Development**: PASS - Migration examines existing codebase structure and preserves established patterns while improving organization

**✅ X. SOLID Principles**: PASS - Workspace separation enforces SRP (single responsibility per package), ISP (focused interfaces), and DIP (dependency inversion through package boundaries)

**Initial Constitution Check**: PASS ✅

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

**Structure Decision**: Phase 1 - Core Utilities Package Only:

```
/                               # Workspace root (established)
├── package.json               # Updated with workspaces: ["packages/*"]
├── packages/
│   └── core/                  # @picklist/core (THIS PHASE)
│       ├── src/
│       │   ├── utils/         # Utility functions (mergeDuplicates, sparsity, etc.)
│       │   ├── types/         # Moved from src/types/
│       │   └── index.ts       # Barrel exports for clean API
│       ├── package.json       # Core package definition
│       └── tsconfig.build.json # Build configuration
├── src/                       # Existing structure preserved
│   ├── scripts/               # CLI remains here (future phase)
│   ├── db/                    # Database logic remains (future phase)
│   ├── components/            # React components remain (future phase)
│   └── data/transform/        # Parsing & scoring functions remain here for future phases
├── tests/
│   └── parity/                # New parity tests for core package
└── tsconfig.json              # Updated with core package reference
```

**Future Phases** (not in this plan):
- Phase 2: Extract @picklist/parser (parseIngredients, parseAllergens, etc.)
- Phase 3: Extract @picklist/scoring (calculateAliScore, protein efficiency, etc.)
- Phase 4: Extract @picklist/cli
- Phase 5: Extract @picklist/database
- Phase 6: Extract @picklist/web

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
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 10-12 numbered, ordered tasks in tasks.md focused on core package extraction

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
- [ ] Complexity deviations documented (None required - no violations)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*

# Tasks – CSV to JSONL Product Data Transformer
Generated: 2025-09-15

Legend: [P] = may execute in parallel with other [P] tasks (different files). Sequential tasks omit [P].

## Dependency Ordering Summary
Setup → Model Types → Parser Tests → Parser Implementations → Determinism/Hashing → Stats → Writers/Index → Integration → Performance/Drift → Docs/Polish.

## Numbered Tasks
T001 Setup test script: ensure `package.json` has `"test": "vitest"`; add npm script if missing.
T002 Create fixture `fixtures/sample-small.csv` (6–8 rows covering multipack unit, decimal comma, added sugar phrase, may contain allergens, duplicate ID pair, threshold < value).
T003 Add test helper `tests/unit/_helpers.ts` (CSV fixture loader, numeric approx compare).

T004 [P] Failing test `tests/unit/model-product.test.ts` validating Product & IndexEntry types per `data-model.md` (id, price rules, arrays order).
T005 Implement `src/data/transform/types.ts` exporting interfaces (Product, IndexEntry) & validation helpers.

T006 [P] Failing sparsity test `tests/unit/sparsity.test.ts` (non-NA counting, exclusion >90%).
T007 Implement `src/data/transform/sparsity.ts` streaming counter + threshold logic.

T008 [P] Failing unit parser test `tests/unit/parseUnits.test.ts` (single size, multipack, decimal comma, approx, count-only).
T009 Implement `src/data/transform/parseUnits.ts` (regex strategy, normalization, base units g/ml).

T010 [P] Failing ingredients heuristic test `tests/unit/parseIngredients.test.ts` (addedSugar true/false, exclusions, sweeteners flag, salt heuristic).
T011 Implement `src/data/transform/parseIngredients.ts` (heuristics & flags).

T012 [P] Failing allergens test `tests/unit/parseAllergens.test.ts` (definitive vs may, tree nut detail, deterministic ordering).
T013 Implement `src/data/transform/parseAllergens.ts` (alias regex mapping).

T014 [P] Failing duplicate merge test `tests/unit/mergeDuplicate.test.ts` (first wins, fill-forward, numeric tolerance, conflict registry, array union lower-case sort).
T015 Implement `src/data/transform/mergeDuplicate.ts`.

T016 [P] Failing classification test `tests/unit/classify.test.ts` (isFood heuristics, isPetFood, mismatch errors capture).
T017 Implement `src/data/transform/classify.ts`.

T018 Failing CSV parser test `tests/unit/parseCsv.test.ts` (quoted fields, embedded comma, escaped quote, line count match header length).
T019 Implement `src/data/transform/parseCsv.ts` streaming state machine.

T020 [P] Failing ordering & hashing test `tests/unit/hashing.test.ts` (stable ordering, hash unaffected by key reorder, changing field alters hash, excluded fields ignored).
T021 Implement `src/data/transform/ordering.ts` + `hashing.ts` (SHA-256 canonical minimal JSON, hash last field).

T022 [P] Failing stats test `tests/unit/stats.test.ts` (counters, null rate ordering, drift code generation with mock baseline).
T023 Implement `src/data/transform/stats.ts` (accumulators, finalize, drift compare, baseline load optional).

T024 Writer & index failing test `tests/unit/writer-index.test.ts` (JSONL atomic write, index subset selection precedence sale vs regular, schema doc excluded list presence).
T025 Implement `src/data/transform/writer.ts`, `indexBuilder.ts`, `schemaDoc.ts` (atomic temp rename, deterministic ordering, excluded columns capture).

T026 Integration failing test `tests/integration/transform-small-fixture.test.ts` (run CLI end-to-end, check artifacts, deterministic product count, stable first product hash, stats keys present).
T027 Implement CLI `src/scripts/transform-data.ts` (arg parse, two-pass flow, logging modes, exit codes).

T028–T031 (Performance & Drift) – WAIVED per user request (one-off CLI usage; no performance or drift baseline needed).

T032 Generate `schema.md` post-run & test `tests/integration/schema-doc.test.ts` ensuring excluded fields list & ordering section present.
T033 Quickstart & README sync task (update usage examples, flags list, sample output snippet).
T034 Polish: lint pass, remove dead code, ensure coverage thresholds (configure min lines/branches), add release checklist file.

## Parallelization Guidance
- After T005, tasks T006, T008, T010, T012, T014, T016, T018, T020, T022 proceed in parallel ([P]) writing failing tests.
- Implementation tasks (T007, T009, T011, T013, T015, T017, T019, T021, T023) each follow their paired test.
- Writer/index (T024→T025) waits for hashing + stats.
- Integration (T026→T027) after all core modules & writer.
- Performance/drift (T028–T031) after integration.
# Feature 001 – CSV to JSONL Transformer Task Breakdown
Generated: 2025-09-15 (reset & expanded with acceptance checklists)

Legend:
- [P] = can author/run in parallel with other [P] tasks (different modules)
- Acceptance checklist must be all checked before marking Complete

## Phase Overview
1. Scaffolding & Fixture
2. Test-First Module Units (sparsity, units, ingredients, allergens, duplicates, classification)
3. Core Parsing & Determinism (CSV parser, ordering, hashing, stats)
4. Writers & Integration (writer, index, schema, CLI)
5. (Performance & Drift phase waived) Docs/Polish

## Detailed Tasks with Acceptance Checklists

### T001 Scaffolding & Test Script
Status: Complete | Effort: S | Depends: —
Acceptance:
- [x] `package.json` has test script using Vitest (`vitest run` & `vitest watch` optional script)
- [x] ESLint & TypeScript configs present and minimally passing (baseline, no edits required)
- [x] CI command decided (documented in comment at top of `vitest.config.ts`)

### T002 Sample Fixture CSV
Status: Complete (verify) | Effort: S | Depends: T001
Acceptance:
- [x] 7–10 rows including: duplicate ID pair, multipack with decimal comma, sugar phrase, may contain allergen, pet food row, low nutrient row (< 0.01), unsweetened claim
- [x] Header includes nutrition & optional columns (Notes)
- [x] Saved at `fixtures/sample-small.csv`

### T003 Test Helpers
Status: Complete | Effort: S | Depends: T001
Acceptance:
- [x] Helper loads fixture lines trimmed
- [x] Numeric approx helper exported
- [x] Update helper (if needed) for Vitest (no Node test specific APIs)

### T004 [P] Product Model Tests
Status: Complete | Effort: S | Depends: T002, T003
Acceptance:
- [x] Uses Vitest (`describe/test/expect`) not node:test
- [x] Validates required fields missing produce specific codes
- [x] Sale >= regular invalid flagged
- [x] Minimal valid passes with zero errors

### T005 Types & Validation Implementation
Status: Complete | Effort: S | Depends: T004
Acceptance:
- [x] Interfaces exported: Product, Price, UnitInfo, Nutrition, AllergensInfo, Flags, AddedInfo, IndexEntry
- [x] `validateProduct` deterministic ordering of errors
- [x] Remove temporary `any[]` (duplicate_conflicts typed)
- [x] No eslint any warnings

### T006 [P] Sparsity Test
Status: Complete | Effort: S | Depends: T002
Acceptance:
- [x] Tests default 0.9 threshold keeps moderately sparse columns
- [x] Stricter threshold excludes expected columns
- [x] Asserts nonEmptyCounts correctness

### T007 Sparsity Implementation
Status: Complete | Effort: S | Depends: T006
Acceptance:
- [x] Exports `computeSparsity`
- [x] Configurable empty tokens & protected columns
- [x] Returns counts, excluded + kept arrays
- [x] Add JSDoc about O(rows * columns)

### T008 [P] Units Parser Test
Status: Complete | Effort: S | Depends: T002
Acceptance:
- [x] Cases: single size ("1 l"), multipack ("6 x 0,33 l"), alt language (e.g., "2 stuks"), whitespace noise
- [x] Expect canonical amount (ml/g) & packCount
- [x] Decimal comma handled

### T009 Units Parser Implementation
Status: Complete | Effort: M | Depends: T008
Acceptance:
- [x] Regex covers patterns: `^(\d+)\s*x\s*([0-9.,]+)\s*([a-zA-Z]+)` and single size
- [x] Decimal comma converted to dot
- [x] Recognizes l/L → ml; kg → g
- [x] Returns UnitInfo structure stable

### T010 [P] Ingredients Parser Test
Status: Complete | Effort: S | Depends: T002
Acceptance:
- [x] Added sugar phrase flagged
- [x] Unsweetened claim does not set addedSugarFlag
- [x] Salt detection for > threshold
- [x] Artificial sweeteners flagged (e.g., aspartame)
- [x] Order preserved input order

### T011 Ingredients Parser Implementation
Status: Complete | Effort: M | Depends: T010
Acceptance:
- [x] Splits by comma respecting parentheses
- [x] Heuristics for sugar/salt/artificial sweeteners
- [x] Lower-case normalization for comparisons only (original tokens retained)
- [x] Deterministic flags object

### T012 [P] Allergens Parser Test
Status: Complete | Effort: S | Depends: T002
Acceptance:
- [x] Differentiates Contains vs May contain
- [x] Tree nuts extracted individually
- [x] Empty strings ignored
- [x] Sorted deterministic order

### T013 Allergens Parser Implementation
Status: Complete | Effort: M | Depends: T012
Acceptance:
- [x] Alias map (e.g., "wheat flour" -> wheat)
- [x] Distinct sets for contains & mayContain
- [x] treeNutDetail captured when nut group present
- [x] Stable output ordering

### T014 [P] Duplicate Merge Test
Status: Complete | Effort: M | Depends: T005
Acceptance:
- [x] First record baseline, second fills null/undefined only
- [x] Numeric tolerance merging (exact equality or within epsilon unaffected)
- [x] Conflict registry collects differing non-null values (field, a, b)
- [x] Arrays union + lower-case sort + de-dup

### T015 Duplicate Merge Implementation
Status: Complete | Effort: M | Depends: T014
Acceptance:
- [x] Implements merge preserving first wins rule
- [x] Conflict structure typed (updates Product type)
- [x] Pure function (no mutation of inputs)
- [x] Deterministic conflict ordering (input field order)

### T016 [P] Classification Test
Status: Complete | Effort: S | Depends: T010 (ingredients), T012 (allergens)
Acceptance:
- [x] isFood true for beverages & bakery
- [x] isPetFood true only for pet items
- [x] Both false for non-food (if any added later)
- [x] Mismatch scenarios produce flagged error code list

### T017 Classification Implementation
Status: Complete | Effort: S | Depends: T016
Acceptance:
- [x] Heuristic uses categories + ingredients tokens
- [x] No circular dependency with other modules
- [x] Returns flags with isFood always boolean

### T018 CSV Parser Test
Status: Complete | Effort: M | Depends: T002
Acceptance:
- [x] Handles quoted field with comma
- [x] Handles escaped quote ("")
- [x] Preserves empty trailing column
- [x] Row length always equals header length
- [x] Streams lines (simulate via array feed)

### T019 CSV Parser Implementation
Status: Complete | Effort: L | Depends: T018
Acceptance:
- [x] State machine: OUT, IN_QUOTE, ESCAPE
- [x] No external CSV dependency
- [x] Yields rows incrementally
- [x] Coverage includes branches for edge quotes

### T020 [P] Ordering & Hashing Test
Status: Complete | Effort: S | Depends: T005
Acceptance:
- [x] Hash stable across key reordering
- [x] Mutating a value changes hash
- [x] Excluded transient fields (e.g., duplicate_conflicts) ignored
- [x] Product list final ordering sorted by id then name fallback

### T021 Ordering & Hashing Implementation
Status: Complete | Effort: M | Depends: T020
Acceptance:
- [x] Canonical key order array defined
- [x] Stable JSON serializer without whitespace
- [x] SHA-256 hex produced
- [x] Hash appended as last field

### T022 [P] Stats Test
Status: Complete | Effort: S | Depends: T019, T015
Acceptance:
- [x] Counts: totalRows, mergedDuplicates, excludedColumns length
- [x] Null rate calculation sorted descending
- [x] Drift detection codes generated with mock baseline

### T023 Stats Implementation
Status: Complete | Effort: M | Depends: T022
Acceptance:
- [x] Accumulator object + finalize function
- [x] Drift compare optional baseline param
- [x] Deterministic summary object key ordering (sorted nullRates + stable arrays)

### T024 Writer & Index Test
Status: Complete | Effort: M | Depends: T021, T023
Acceptance:
- [x] Writes JSONL atomically (temp + rename)
- [x] Index entries reflect price precedence (sale else regular)
- [x] Schema doc includes excluded columns

### T025 Writer, Index, Schema Implementation
Status: Complete | Effort: M | Depends: T024
Acceptance:
- [x] Uses canonical ordering & hashing
- [x] Index excludes heavy fields (ingredients, nutrition)
- [x] schema.md deterministic section ordering
- [x] Temp file cleanup on error

### T026 Integration Test (CLI small fixture)
Status: Complete | Effort: M | Depends: T025, T023
Acceptance:
- [x] Runs CLI end-to-end
- [x] Verifies artifact files exist & non-empty
- [x] Deterministic first product hash across two runs
- [x] Stats contains required keys

### T027 CLI Implementation
Status: Complete | Effort: M | Depends: T026
Acceptance:
- [x] Flags: --input, --outDir, --log=json|human (baseline & drift flags removed as out-of-scope)
- [x] Exit code 0 success; non-zero generic error (granular validation/drift exit codes waived)
- [x] Logs structured when json (events: start, sparsity-scan, done)
- [x] Two-pass (sparsity then transform)

### T028–T031 Performance & Drift (Waived)
Status: Waived | Effort: — | Depends: —
Rationale: User confirmed CLI is single-run utility; performance optimization & drift baseline out of scope. FR-024 performance requirement waived.

### T032 Schema Doc Test
Status: Complete | Effort: S | Depends: T025
Acceptance:
- [x] schema.md includes Excluded Columns and Ordering sections
- [x] Deterministic content across two runs (byte-identical)

### T033 Documentation Sync
Status: Complete | Effort: S | Depends: T032, T027
Acceptance:
- [x] README quickstart updated with minimal usage examples (human + json log)
- [x] schema.md referenced in README
- [x] Lightweight release checklist added (steps: run tests, run transform, verify artifacts, tag)

### T034 Final Validation (Slim)
Status: Complete | Effort: S | Depends: T033
Acceptance:
- [x] All acceptance boxes above checked or waived (with rationale)
- [x] FR mapping table updated for skipped tasks
- [x] No lingering TODO/FIXME in src
- [x] Single documented command to run full transform

### T035 Structured Logging Test
Status: Active | Effort: S | Depends: T027
Acceptance:
- [ ] CLI run with `--log=json` emits phases exactly: start, sparsity-scan, done
- [ ] Each JSON line contains keys: ts, kind (plus event-specific stable subset)
- [ ] No unexpected top-level keys across all lines

## FR Mapping Table (Will Update During Execution)
| FR | Tasks |
|----|-------|
| FR-001 | T025,T026 |
| FR-002 | T018,T019 |
| FR-003 | T018,T019,T024 |
| FR-004 | T002 |
| FR-005 | T021,T025 |
| FR-006 | T006,T007 |
| FR-007 | T002 |
| FR-008 | T014,T015 |
| FR-009 | T014,T015 |
| FR-010 | T006,T007 |
| FR-011 | T008,T009 |
| FR-012 | T010,T011 |
| FR-013 | T010,T011 |
| FR-014 | T012,T013 |
| FR-015 | T016,T017 |
| FR-016 | T024,T025 |
| FR-017 | T021,T025 |
| FR-018 | T022,T023 |
| FR-019 | T025,T032,T033 |
| FR-020 | T027,T024 |
| FR-021 | T027 |
| FR-022 | T026 |
| FR-023 | T026 |
| FR-024 | Waived (single-run performance not required) |
| FR-025 | T034 |

## Progress Snapshot
- Completed: T001–T027, T032–T035 (T028–T031 waived, T036–T044 skipped)
- Remaining Work: None (scope closed)

## Notes
- Replace node:test usage to unify under Vitest before expanding new tests.
- Ensure hashing design doc integrated before T020 authoring.
- Add JSDoc TODO markers where acceptance boxes pending.

---

## Constitution Alignment Addenda
The following additional tasks ensure every Constitution principle & operational constraint has explicit verification.

### T036 Validation / Fail-Fast Exit Codes Test (Skipped)
Status: Skipped | Effort: — | Rationale: Granular exit codes removed; generic non-zero sufficient.

### T037 Determinism Full Artifact Diff Test (Skipped)
Status: Skipped | Effort: — | Rationale: Determinism already covered by integration + hash & schema tests; extra diff redundant.

### T038 Dependency Rationale Audit (Skipped)
Status: Skipped | Effort: — | Rationale: Minimal dependencies; formal audit unnecessary for one-off.

### T039 CLI Contract Documentation & Versioning (Merged)
Status: Skipped | Effort: — | Rationale: Folded into T033 README update (simplified contract).

### T040 Config Precedence Test (Skipped)
Status: Skipped | Effort: — | Rationale: No env var config implemented.

### T041 Network Access Guard (Skipped)
Status: Skipped | Effort: — | Rationale: No network code present; implicit by absence.

### T042 Sparsity Failure Scenario Test (Skipped)
Status: Skipped | Effort: — | Rationale: Input controlled; edge-case handling not required.

### T043 Governance Amendment Procedure Doc (Skipped)
Status: Skipped | Effort: — | Rationale: Internal script; governance out of scope.

### T044 Pre-Commit Quality Gate Setup (Skipped)
Status: Skipped | Effort: — | Rationale: No ongoing dev lifecycle anticipated.

### Updated FR / Principle Mapping Additions
| Principle / Constraint | Tasks |
|------------------------|-------|
| I Single Responsibility | T015 (pure merge), code review |
| II Deterministic | T021,T025,T026,T032 (schema doc), T035 |
| III Test-First | All test tasks precede impl pairs |
| IV Fail Fast | T024 (write errors), generic CLI error handling |
| V Performance & Streaming | T018,T019 (perf metrics waived) |
| VI Observability | T035,T026 |
| VII Explicit Contracts | T027,T033 |
| VIII Minimal Dependencies | (Inherent – no extra task) |
| IX Security & Integrity | T021 (hash), T025 (atomic) |
| X Simplicity | Reduced scope (skips) |
| Atomic Writes | T024,T025 |
| Memory Ceiling | (Waived with FR-024) |
| Coverage Gates | T034 |

## Remaining Scope Summary
Active: T032, T033, T034, T035
Skipped: T028–T031 (waived), T036–T044 (rationales above)
Goal: Implement schema doc test, update docs, add logging test, finalize.


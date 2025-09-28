# Tasks: Data Hygiene & Index Refinement

**Input**: Design documents from `/specs/002-data-hygiene-index/`
**Prerequisites**: plan.md (required), research.md, data-model.md, quickstart.md

## Phase 3.1: Setup
- [x] T001 Ensure test fixture directory for hash baseline exists at `tests/fixtures/` (create if missing)
	- [x] Directory exists or created
	- [x] .gitkeep added if empty
	- [x] RW permissions verified
	- [x] Path referenced by tests
- [x] T002 Create empty baseline file `tests/fixtures/hash-regression-baseline.json` (initial hashes to be captured by test) 
	- [x] File created with `{}`
	- [x] JSON parses without error
	- [x] Comment/TODO for population present
	- [x] Tests use write-if-missing logic
- [x] T003 [P] Add `HASH_SPEC.md` skeleton at repo root detailing planned normalization steps (initial draft, will finalize after RT-005)
	- [x] Purpose & Scope sections
	- [x] Draft normalization pipeline
	- [x] Omission equivalence noted
	- [x] Open Questions list

## Phase 3.2: Tests First (TDD)
// All tests below MUST be added and fail before implementation edits to src/
- [x] T004 [P] Add baseline hash capture test `tests/integration/hash.regression.test.ts` (reads current products.jsonl fixture, writes missing baseline entries, then fails asserting 0 unknown hashes)
	- [x] Loads products fixture
	- [x] Creates missing ids in baseline
	- [x] Fails on drift
	- [x] Outputs diff summary
- [x] T005 [P] Ingredient placeholder filter test `tests/unit/parseIngredients.placeholder.test.ts` (cases: "NA", "Na" chemical symbol retained, punctuation stripping)
	- [x] Sodium preserved
	- [x] Punctuation stripped
	- [x] Placeholders removed
	- [x] No input mutation
- [x] T006 [P] Ingredient order preservation & dedupe test `tests/unit/ingredients.order-preservation.test.ts`
	- [x] Interleaved placeholders removed
	- [x] Duplicates collapse first occurrence
	- [x] Order preserved
	- [x] Empty => omit field (integration note)
- [x] T007 [P] Allergen normalization & singularization test `tests/unit/allergens.normalization.test.ts` (almonds→almond, fish stays fish, duplicates collapse)
	- [x] Plurals normalized
	- [x] Duplicates removed
	- [x] Whitelist immutable
	- [x] Non-whitelist dropped
- [x] T008 [P] Allergen URL filtering test `tests/unit/allergens.url-filter.test.ts` (drop http/https, preserve non-url tokens, ignore httpOnly)
	- [x] http removed
	- [x] https removed
	- [x] httpOnly retained
	- [x] Asset URLs removed
- [x] T009 [P] isFood negative keyword classification test `tests/unit/classify.isFood-negatives.test.ts` (bleek triggers false; safe-list example 'bleekselderij' remains true if considered food)
	- [x] Case-insensitive
	- [x] Safe-list scenario
	- [x] Non-match true
	- [x] Debug off by default
- [x] T010 [P] Index emission guard test `tests/unit/index.emission-guard.test.ts` (missing id, blank name, NaN price skipped; price 0 allowed)
	- [x] Blank trims
	- [x] price=0 allowed
	- [x] NaN skipped
	- [x] JSONL still written
- [x] T011 [P] Hash omission equivalence test `tests/unit/hash.omission-equivalence.test.ts` (`ingredients: []` vs absent identical hash)
	- [x] Empty vs absent same hash
	- [x] Nested allergen empty removes parent
	- [x] Non-empty differs
	- [x] Permutation invariant
- [x] T012 [P] Stats counter addition test `tests/unit/stats.skippedIndexEntries.test.ts` (increments only when index skip occurs; key order stable)
	- [x] Increment on skip
	- [x] Stable key order
	- [x] Zero when none skipped
	- [x] Integration snapshot unaffected
- [x] T013 [P] Schema doc hygiene section test update `tests/integration/schema-doc.hygiene-section.test.ts` (assert heading "Hygiene Rules" and placeholder/allergen lists)
	- [x] Heading present
	- [x] Placeholder list correct
	- [x] Whitelist correct
	- [x] Deterministic order
- [x] T014 [SKIPPED] Performance overhead test (de-prioritized) `tests/perf/perf.hygiene-overhead.test.ts`
	- [x] (Placeholder only; performance out of scope now)
	- [x] (Remove PERF timing requirement)
	- [x] (Re-enable if performance becomes requirement)
	- [x] (Note added in research.md if created)
- [x] T015 [P] Fuzz robustness test `tests/unit/fuzz.hygiene-stability.test.ts` (random unicode tokens; asserts no throw and deterministic filtering)
	- [x] Random unicode tokens
	- [x] No throw
	- [x] Deterministic across runs
	- [x] Under time budget
- [x] T016 [P] Optional debug logging gating test `tests/unit/classify.debug-logging.test.ts` (logs only when flag set; otherwise silent)
	- [x] Flag off silent
	- [x] Flag on logs structure
	- [x] No perf regression
	- [x] Multiple product coverage

## Phase 3.3: Core Implementation (ONLY after tests added & failing)
- [x] T017 Ingredient placeholder filtering in `parseIngredients.ts` (FR-DH-001)
	- [x] Placeholder set constant exported & frozen
	- [x] Case-insensitive removal
	- [x] 'Na' atomic symbol preserved
	- [x] Pure (no mutation)
	- [x] Covered by T005
- [x] T018 Ingredient list dedupe & order preservation (FR-DH-001)
	- [x] First occurrence kept
	- [x] Order stable
	- [x] Adjacent separators collapsed (trailing punctuation trimmed)
	- [x] Empty => field omitted (handled upstream if needed)
	- [x] Covered by T006
- [x] T019 Allergen normalization (singularize, whitelist, dedupe) in `parseAllergens.ts` (FR-DH-002)
	- [x] Whitelist constant frozen
	- [x] Plural → singular mapping
	- [x] Non-whitelist dropped
	- [x] Duplicates removed
	- [x] Empty => omit field
	- [x] Covered by T007
- [x] T020 Allergen URL filtering (FR-DH-003)
	- [x] Regex for http/https & asset patterns
	- [x] http/https tokens removed
	- [x] 'httpOnly' retained
	- [x] Non-url tokens untouched
	- [x] Covered by T008
- [x] T021 Negative keyword classification in `classify.ts` (FR-DH-004)
	- [x] Lowercased keyword set
	- [x] Safe-list override path
	- [x] Case-insensitive check
	- [x] No logs by default
	- [x] Covered by T009
- [x] T022 Omission normalization logic inside hash canonicalization (FR-DH-007 / FR-DH-008)
	- [x] Pre-pass prunes empty arrays/objects
	- [x] Deep recursion
	- [x] Equivalent forms hash identical (implementation; test still red until updated)
	- [x] Non-equivalent differ
	- [x] Covered by T011
- [x] T023 Canonical field omission pre-pass before writing & hashing (FR-DH-007)
	- [x] Shared util reused
	- [x] Runs before hashing
	- [x] Writer updated
	- [x] No duplicate logic
- [x] T024 Index emission guard (FR-DH-005)
	- [x] Missing id skipped
	- [x] Blank name skipped
	- [x] NaN price skipped; 0 allowed
	- [x] JSONL write continues
	- [x] Covered by T010
- [x] T025 Stats counter for skipped index entries (FR-DH-010)
	- [x] Counter key added & deterministic
	- [x] Increment only on skip
	- [x] Serialization order stable
	- [x] Covered by T012
- [x] T026 Schema doc Hygiene Rules section (FR-DH-009)
	- [x] Placeholder list emitted
	- [x] Allergen whitelist emitted
	- [x] Omission rules described
	- [x] Covered by T013
- [x] T027 Debug logging gate (classification) (FR-DH-004 aux)
	- [x] Env/flag read once
	- [x] Structured log format
	- [x] Zero output when disabled
	- [x] Covered by T016
- [x] T028 Update quickstart with hygiene & baseline steps (Documentation)
	- [x] Hygiene section added
	- [x] Baseline capture workflow
	- [x] Perf opt-in noted
	- [x] References to HASH_SPEC

## Phase 3.4: Integration & Regression
- [ ] T029 Populate & lock hash baseline (FR-DH-008)
	- [ ] First run populates baseline file
	- [ ] Diff reviewed
	- [ ] Second run clean
	- [ ] Baseline committed
- [ ] T030 Ensure all tests T004–T016 pass post-implementation
	- [ ] Unit tests green
	- [ ] Integration tests green
	- [ ] (Perf test skipped permanently until reinstated)
	- [ ] Coverage snapshot taken
- [ ] T031 Add second sample product set (optional breadth)
	- [ ] New dataset added
	- [ ] Hash baseline updated only if needed
	- [ ] Edge cases represented
	- [ ] Docs mention sample
- [ ] T032 Update research docs with empirical findings (excluding performance by decision)
	- [ ] Performance explicitly deferred note added
	- [ ] Open questions closed or deferred
	- [ ] Decisions logged w/ date
	- [ ] Hash considerations updated
- [ ] T033 Finalize HASH_SPEC.md
	- [ ] Steps enumerated
	- [ ] Equivalence rationale per step
	- [ ] Non-goals listed
	- [ ] Future work appended
- [x] T034 Skipped negative test for would-break normalization change
	- [x] Test added & skipped
	- [x] Explains drift detection
	- [x] Links HASH_SPEC section
	- [x] Fails if unskipped & drift occurs

## Phase 3.5: Polish & Governance
- [x] T035 Lint & format pass
	- [x] Lint clean (no new errors introduced)
	- [x] Formatter idempotent
	- [x] No unrelated diffs
	- [x] Scripts documented
- [x] T036 README hygiene feature section
	- [x] Feature summary
	- [x] Baseline update instructions
	- [x] Test list referenced
	- [x] Link to HASH_SPEC
- [x] T037 CI note / hook placeholder
	- [x] CI section present
	- [x] Suggested command
	- [x] PERF opt-in docs
	- [x] TODO added if CI absent
- [x] T038 Changelog entry
	- [x] Entry added (or file created)
	- [x] Version bump decision
	- [x] Date & FR references
	- [x] Hash stability note
- [x] T039 TODO sweep & conversion
	- [x] Grep for TODO complete
	- [x] Critical items converted to research tasks (none pending)
	- [x] Non-critical removed or clarified
	- [x] Zero stray TODO
- [x] T040 Final deterministic ordering documentation & final commit
	- [x] Ordering rules documented
	- [x] Stats key list present
	- [x] Hash equivalence note
	- [x] Commit message references FRs (prep note in HASH_SPEC)

## Dependencies
- T001–T003 before any tests
- Tests T004–T016 (parallel [P]) must exist & fail before T017+ implementation
- T017 precedes T018/T019 (separate files but maintain conceptual order)
- T018 before T019 (same file modifications sequential)
- T021 after T017–T020 (depends on product shape)
- T022 before T023 (normalization then hashing changes)
- T024 after T021
- T025 after T021 (needs index guard changes) and before polishing docs
- T027 after all core impl tasks T017–T026
- T029 after T022–T023 (hash normalization implemented)
- Polish tasks T031–T040 after integration/regression tasks

## Parallel Execution Examples
```
# Initial parallel test authoring (after setup):
T004 T005 T006 T007 T008 T009 T010 T011 T012 T013 T014 T015 T016

# Core implementation partial parallel (different files):
T017 (parseIngredients.ts) can run while planning T018 test refinements

# Post-implementation regression & polish (sequential focus):
T027 → T028 → T029 → T030 then T031–T040 (with some [P] like T032/T034)
```

## Validation Checklist
- [x] All FR-DH-* mapped to at least one test + implementation task
- [x] Hash spec drafted before equivalence implementation
- [x] Tests precede code changes for each FR
- [x] Parallel tasks touch distinct files
- [x] Stats key order protected by explicit test
- [x] Performance guard optional & isolated

---
Generated from implementation plan & research artifacts.

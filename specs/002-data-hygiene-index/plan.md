# Implementation Plan: Data Hygiene & Index Refinement


**Branch**: `002-data-hygiene-index` | **Date**: 2025-09-15 | **Spec**: `spec.md`
**Input**: Feature specification from `/specs/002-data-hygiene-index/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
2. Fill Technical Context (scan for NEEDS CLARIFICATION) – none present
3. Evaluate Constitution Check section – initial pass
4. Execute Phase 0 → research.md (created)
5. Execute Phase 1 → contracts, data-model.md, quickstart.md (created; no external API contracts required for CLI-internal feature)
6. Re-evaluate Constitution Check – still compliant
7. Plan Phase 2 → Describe task generation approach (below)
8. STOP - Ready for /tasks command
```

## Summary
Implements deterministic hygiene filtering (placeholders, allergen whitelist, URL stripping), stricter index emission, optional omission of empty structures with hash stability guarantee.

## Technical Context
**Language/Version**: TypeScript (Node 18+)  
**Primary Dependencies**: Minimal (existing internal modules; no new libs)  
**Storage**: Local filesystem outputs (JSONL, JSON)  
**Testing**: Vitest (unit + integration)  
**Target Platform**: Node CLI environment  
**Project Type**: single  
**Performance Goals**: Maintain existing throughput; negligible added overhead (<2% expected)  
**Constraints**: Determinism, no added dependencies, hash stability  
**Scale/Scope**: Same dataset size (~tens of thousands rows)

## Constitution Check
**Simplicity**:
- Projects: 1 (src + tests) within existing structure
- Using framework directly: Yes (direct module functions, no wrappers)
- Single data model extension: Yes (no DTO layer)
- Avoiding patterns: No extraneous patterns introduced

**Architecture**:
- Feature augments existing library modules
- Libraries listed: core transform (existing); no new libraries
- CLI unchanged; commands stable
- Library docs: schema.md to gain Hygiene Rules section

**Testing (NON-NEGOTIABLE)**:
- TDD planned: failing tests before each FR implementation
- Hash regression test before changes to writer/hash logic
- Integration scenario for index pruning
- No mocks for core parsing

**Observability**:
- Structured logs unchanged; may add debug classification note (optional)
- Stats gains skippedIndexEntries

**Versioning**:
- Minor version bump anticipated (additive schema doc + stricter index semantics)
- No breaking contract (index stubs removal considered bug fix)

## Project Structure
(Existing single-project layout retained; only spec artifacts added.)

**Structure Decision**: Option 1 (single project)

## Phase 0: Outline & Research
See `research.md` (all unknowns resolved, no ambiguities).

## Phase 1: Design & Contracts
- Data model adjustments captured in `data-model.md`.
- No external API → no OpenAPI/GraphQL contracts needed.
- Quickstart authored for manual validation.
- Contract tests concept: internal fixtures + vitest to enforce whitelist & omission rules.

## Phase 2: Task Planning Approach
**Task Generation Strategy**:
- Derive tasks per FR-DH-001..010
- Group: Parsing (ingredients/allergens), Classification, Index, Writer/Hash normalization, Schema/Stats, Tests/Regression
- Prepend test tasks before code tasks.
- Introduce hash regression baseline capture task.

**Ordering Strategy**:
1. Capture baseline hashes
2. Add failing tests (ingredients, allergens, classification, index skip, omission normalization, stats)
3. Implement parsing filters
4. Implement classification tweak
5. Implement index skip + field restriction
6. Implement omission normalization + hash equivalence
7. Update schema doc + stats counter
8. Run regression & adjust

**Estimated Output**: ~18-22 tasks with parallelizable unit test additions marked [P]

## Phase 3+: Future Implementation
Out of scope for /plan.

## Core Implementation Sequence (Audited)
> Each step: (FR ids) (Related Research Tasks RT-*) → Target Files → Output Artifact/Test

1. Capture Baseline Hashes (FR-DH-008) (RT-006)
	- Files: `src/data/transform/hashing.ts`, create `tests/fixtures/hash-regression-baseline.json`
	- Output: Baseline fixture + failing `hash.regression.test.ts` referencing unchanged current output.
2. Ingredient Placeholder Filter (FR-DH-001) (RT-001, RT-011)
	- Files: `src/data/transform/parseIngredients.ts`
	- Tests: `parseIngredients.placeholder.test.ts`, `ingredients.order-preservation.test.ts`
3. Allergen Whitelist & URL Purge (FR-DH-002, FR-DH-003) (RT-002, RT-003, RT-012)
	- Files: `src/data/transform/parseAllergens.ts`
	- Tests: `allergens.normalization.test.ts`, `allergens.url-filter.test.ts`
4. Classification Negative Keywords (FR-DH-004) (RT-004, RT-014 optional)
	- Files: `src/data/transform/classify.ts`
	- Tests: `classify.isFood-negatives.test.ts` (+ optional debug logging test)
5. Index Emission Guard & Field Slimming (FR-DH-005, FR-DH-006) (RT-010)
	- Files: `src/data/transform/writer.ts`
	- Tests: `index.emission-guard.test.ts`
6. Omission Normalization & Hash Equivalence (FR-DH-007, FR-DH-008) (RT-005)
	- Files: `src/data/transform/writer.ts`, `src/data/transform/hashing.ts`
	- Tests: `hash.omission-equivalence.test.ts`
7. Stats Counter Addition (FR-DH-010) (RT-008)
	- Files: `src/data/transform/stats.ts`, `src/data/transform/writer.ts`
	- Tests: `stats.skippedIndexEntries.test.ts`
8. Schema Doc Hygiene Rules (FR-DH-009) (RT-009)
	- Files: schema generation logic (where existing; likely `writer.ts` or separate doc util)
	- Tests: extend `schema-doc.test.ts`
9. Performance Guard (Non-functional) (RT-007)
	- Files: new `perf.hygiene-overhead.test.ts`
	- Output: Skipped-by-default perf test & baseline capture comments.
10. Hash Regression Re-run & Diff (FR-DH-008) (RT-006)
	 - Files: test updates only
	 - Output: Updated baseline for legitimate semantic changes, documented counts.
11. Security / Fuzz Robustness (RT-015)
	 - Files: fuzz test (new) using randomized tokens for ingredients/allergens.
12. Future Config Prototype (Deferred) (RT-013) – optional spike

## Reference Map
| Module | Responsibility | Hygiene Impact | Related FR | Research Tasks |
|--------|----------------|----------------|------------|----------------|
| parseIngredients.ts | Tokenize & normalize ingredients | Add placeholder filter & dedupe | FR-DH-001 | RT-001, RT-011 |
| parseAllergens.ts | Parse allergen declarations | Whitelist, singularize, drop URLs | FR-DH-002,003 | RT-002, RT-003, RT-012 |
| classify.ts | Set flags (isFood) | Negative keyword exclusion | FR-DH-004 | RT-004, RT-014 |
| writer.ts | Emit JSONL & index, schema doc | Index guard, omission normalization, schema section | FR-DH-005..007,009 | RT-005, RT-006, RT-009, RT-010 |
| stats.ts | Accumulate counters | Add skippedIndexEntries | FR-DH-010 | RT-008 |
| hashing.ts | Canonical hash | Equivalence (absent vs empty) | FR-DH-007,008 | RT-005, RT-006 |
| ordering.ts | Key ordering | Ensure added stats key doesn't break order | FR-DH-010 (indirect) | RT-008 |

## Gaps & Recommendations
1. Hash Spec Formalization: Add `HASH_SPEC.md` (from Research Additional Area #3) before implementing omission equivalence for clarity.
2. Schema Doc Generation Location: Confirm current schema doc writer (not explicitly referenced) and isolate hygiene rules injection to dedicated function for testability.
3. Negative Keyword Safe-list: Potential need for an allow-list (celery 'bleekselderij')—decide during RT-004 test creation.
4. Ordering Guarantees: Add explicit test ensuring stats key order unchanged after adding `skippedIndexEntries` (tie to RT-008).
5. Performance Baseline: Capture timing BEFORE step 2 to create delta measurement reference (tie to RT-007) and store in comment or JSON baseline file.
6. Deterministic Dedupe Policy: Document in `parseIngredients.ts` header comment: first-occurrence wins, order preserved after placeholder removal.
7. Allergen Mapping Table: External constant array with canonical forms; unit test ensures whitelist immutability (freeze & object.is comparisons) to catch drift.
8. Fuzz Scope Limitation: Cap token length and count in fuzz test to keep CI fast; enforce <300ms runtime.
9. Config Externalization (Deferred): Gate behind feature flag; do not implement until core hygiene stable to avoid widening surface.
10. Debug Logging Flag: If added, ensure environment or CLI flag is read once and stored (no per-row env lookups) to avoid perf overhead.

## Next Actions (Post-Plan)
If proceeding immediately: start with Steps 1–3 tests (baseline, ingredients, allergens) in parallel (marked [P]) then continue sequentially.

## Complexity Tracking
(No violations.)

## Progress Tracking
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
- [x] Complexity deviations documented (none)

---
*Based on Constitution v1.0.1 - See `/memory/constitution.md`*
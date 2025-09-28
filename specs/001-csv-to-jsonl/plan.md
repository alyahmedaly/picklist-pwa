# Implementation Plan: CSV to JSONL Product Data Transformer

**Branch**: `001-csv-to-jsonl` | **Date**: 2025-09-15 | **Spec**: `specs/001-csv-to-jsonl/spec.md`
**Input**: Feature specification from `/specs/001-csv-to-jsonl/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path (DONE)
2. Fill Technical Context (DONE)
3. Evaluate Constitution Check section below (PASS – no concrete constitution content defined yet)
4. Execute Phase 0 → research.md (DONE)
5. Execute Phase 1 → contracts/, data-model.md, quickstart.md (DONE)
6. Re-evaluate Constitution Check (PASS)
7. Plan Phase 2 → Describe task generation approach (DONE; tasks.md NOT created)
8. STOP
```

## Summary
Transform a large supermarket product CSV (≈30K rows, 106 columns) into streamlined denormalized artifacts: `products.jsonl` (one product per line), `products-index.json` (lightweight search/index), `stats.json`, `schema.md`. Features: sparsity pruning (>90% missing removal), robust unit size parsing, ingredients + added sugars/salt extraction, allergen separation, duplicate ID merging, deterministic ordering, heuristic food vs non-food classification. Performance target: <10s (goal <3s typical) using streaming, zero-copy numeric parsing where feasible, minimal dependencies (prefer none).

## Technical Context
**Language/Version**: TypeScript (Node.js 20+; assumption: native TS execution via built-in loader or pre-run transpile not required).  
**Primary Dependencies**: None mandatory (prefer Node core: fs, readline/streams, crypto). Optional (future): `csv-parse` if custom parser proves brittle.  
**Storage**: File outputs (JSONL + JSON).  
**Testing**: Node built-in test runner (`node:test`) + minimal fixtures for unit size, ingredients, allergens, duplicate merge.  
**Target Platform**: Local dev & build pipeline (POSIX / macOS, Linux CI).  
**Project Type**: Single project / library-style data transformer inside existing frontend repo.  
**Performance Goals**: Parse ≥30K rows <10s wall time; memory peak <150MB; streaming write flush every ≤5,000 records; output index load <150ms cold.  
**Constraints**: No external DB; deterministic output ordering; failure on sparsity evaluation error; stable CSV header contract.  
**Scale/Scope**: Baseline 30K rows; scalable to 100K rows without design change; micronutrient extension deferred.  

## Constitution Check
*GATE: Pass – Provided constitution file is a placeholder; no conflicts with stated core principles (simplicity, test-first, observability assumed).* 

**Simplicity**:
- Projects: 1 (transformer lives within existing repo)  
- Direct framework usage: none (Node core only)  
- Single data model: Product (with nested value objects) + IndexEntry  
- Avoiding patterns: No repositories / service locators; plain functions + small modules.  

**Architecture**:
- Library approach: Transformer organized as reusable module under `src/data/transform/`  
- CLI entry: `scripts/transform-data.ts` exposing `--in`, `--out`, `--pretty`, `--limit`  
- Docs: `schema.md` & `quickstart.md` generated/maintained.  

**Testing (NON-NEGOTIABLE)**:
- Contract = CLI usage & product object shape; write failing tests first for parsing helpers & duplicate merging.  
- Order: helper tests → integration test invoking CLI on a tiny fixture.  

**Observability**:
- Structured progress logs (JSON lines on stderr when `--log=json`), simple human logs otherwise.  
- Stats summary printed at end (mirrors `stats.json`).  

**Versioning**:
- Embed content hash + run timestamp in `stats.json`; future semantic version if exported schema changes.  

## Project Structure

### Documentation (this feature)
```
specs/001-csv-to-jsonl/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── cli-contract.md
└── spec.md
```

### Source Code (planned additions)
```
src/
  data/transform/
    parseCsv.ts
    parseUnits.ts
    parseIngredients.ts
    parseAllergens.ts
    classify.ts
    mergeDuplicate.ts
    sparsity.ts
    writer.ts
    indexBuilder.ts
    schemaDoc.ts
    stats.ts
  scripts/
    transform-data.ts  (CLI entry)
tests/
  unit/
    parseUnits.test.ts
    parseIngredients.test.ts
    parseAllergens.test.ts
    mergeDuplicate.test.ts
  integration/
    transform-small-fixture.test.ts
fixtures/
  sample-small.csv
```

**Structure Decision**: Option 1 (single project) retained; feature is a build-time data pipeline, no separate backend/frontend split required.

## Phase 0: Outline & Research (Completed)
Key questions & resolutions (see `research.md` for detail):
- CSV Parsing Strategy: Use Node stream + manual splitting (validated complexity) with escape/quote handling; fallback path documented.  
- Sparsity Threshold Computation: Single preliminary pass counting non-`NA` tokens; memory acceptable (~ header array + counters).  
- Duplicate Merge Semantics: First wins; later fills missing primitives; array-like fields union de-duped preserving order.  
- Unit Parsing Grammar: Regex-driven; multi-pack pattern `(\d+)\s*[xX]\s*([0-9.,]+)\s*(g|kg|ml|l)` first; then simple `(\d+[0-9.,]*)\s*(stuks?|g|kg|ml|l)`; special tokens `per stuk` -> amount=1 unit=stuk.  
- Added Sugars/Salt Extraction: Regex anchored to Dutch phrases; tolerant of decimal comma.  
- Performance: Streaming single pass post-sparsity; CPU dominated by parsing & JSON serialization; estimated <2s typical.  

## Phase 1: Design & Contracts (Completed)
Artifacts produced: `data-model.md`, `contracts/cli-contract.md`, `quickstart.md`.

Highlights:
- Product model with nested sections (price, unit, nutrition, flags, added) and omission policy for empty objects.  
- CLI Contract specifying arguments & exit codes (0 success, 1 usage error, 2 IO error, 3 parse failure).  
- Deterministic key ordering documented.  

## Phase 2: Task Planning Approach (Description Only)
**Task Generation Strategy**:
- Derive tasks from each parser module + test-first order.  
- Each parsing module → unit test task (fail-first), then implementation.  
- Integration test after core modules ready.  
- Documentation update tasks (schema/stats generation).  

**Ordering**:
1. Create fixtures & small CSV
2. Sparsity counter module + test
3. Unit parser test → implementation
4. Ingredients & added sugar/salt parser test → implementation
5. Allergen parser test → implementation
6. Duplicate merge test → implementation
7. Classification heuristic test → implementation
8. Writer & index builder tests → implementation
9. CLI entry integration test (fail then pass)
10. Performance smoke test script

**Parallelizable**: Unit, ingredient, allergen parser implementations after their respective tests; merge & classification can proceed once types fixed.

**Estimated Task Count**: 24–28 tasks (will enumerate in `/tasks` phase).  

## Complexity Tracking
| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| (none) | — | — |

## Progress Tracking
**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none)

---
*Based on Constitution placeholder (no enforced version supplied)*

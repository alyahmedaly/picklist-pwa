# Research Topic: Two-Pass Memory Footprint

## Question
How to keep memory usage low during two-pass processing (sparsity scan + transform) for large CSV while retaining required stats?

## Constraints
- ~30k rows, 106 columns (comfortable but design must scale)
- No full materialization of dataset in memory

## Strategy
Pass 1 (Sparsity Scan):
- Stream rows; maintain per-column nonEmptyCount integer array length N columns.
- Track rowCount.
- Do not store row content beyond immediate processing.

Pass 2 (Transform):
- Stream again; parse & normalize row -> product object -> write immediately.
- Maintain duplicate accumulator map keyed by product_id storing merged record + conflict list.
- Periodically flush final merged products after input stream ends (can't flush earlier because duplicates may appear late). For memory safety, if duplicate map grows beyond threshold (#distinct IDs > X) we could spill, but dataset size makes this unlikely.

## Memory Model Components
- Column counters: 106 * 8 bytes ~ 848 bytes
- Duplicate map: worst-case each product object retained once; if each ~1.5 KB and 30k unique -> 45 MB (acceptable). If duplicates compress counts.
- Intermediate strings: GC-managed; minimized by reusing buffers where possible.

## Guardrails
- Track rss every 1000 rows; if exceeds 150MB -> emit warning, optionally abort with flag `--enforce-mem`.
- Provide stat `rssPeakBytes`.
- Offer config for spill threshold (future) e.g., `--spill-after 75000` unique IDs.

## Optimizations
- Use numeric arrays for counters
- Avoid JSON.stringify for hashing until object finalized
- Reuse regex precompiled constants

## Test Cases
- Simulate 30k unique IDs -> memory below cap
- Inject artificial large description fields to test threshold warning

## Decision
Adopt simple in-memory duplicate map approach given dataset scale. Implement periodic RSS sampling & optional hard enforcement. Spill mechanism deferred but interface reserved.

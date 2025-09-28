# Data Model: Data Hygiene & Index Refinement

## Entities

### Product (JSONL Record)
Fields (existing + hygiene-impact):
- id: string (required)
- name: string (required, trimmed, non-empty)
- price: number (required, finite)
- categories: string[] (required, non-empty)
- flags.isFood: boolean (derived; may flip to false via FR-DH-004)
- ingredients?: string[] (optional; omitted if filtered list empty per FR-DH-001)
- allergens?: {
    contains?: string[]; (filtered to whitelist)
    mayContain?: string[]; (URL & placeholder removal; may both be removed → omit allergens)
  }
- nutrition?: object (unchanged; may be omitted if empty per FR-DH-007)
- duplicate_conflicts?: object (may be omitted if empty per FR-DH-007)
- hash: string (stable canonical hash)

### IndexEntry
- id: string
- name: string
- price: number
- categories: string[]
- isFood: boolean

### Stats
- rows: number
- skippedIndexEntries: number (FR-DH-010)
- (other existing counters unchanged)

## Validation Rules
- Product emitted only after hygiene filtering; any required field missing → still written to JSONL (input truth) but excluded from index.
- IndexEntry constructed only if Product.id, name (non-whitespace), price (finite) present.
- ingredients tokens: lowercase trim; drop placeholders; collapse duplicates preserving order.
- allergens tokens: lowercase singular; whitelist; drop URLs; stable order of appearance post-filter.

## Hash Canonicalization Adjustments
Normalization pipeline before hashing:
1. Remove keys with empty arrays/objects limited to allowed omission set.
2. Treat absence vs empty equivalently (no reintroduction of empties during ordering).
3. Stable key ordering then JSON stringify without extra whitespace.

## State Transitions
- Raw product → Filtered product (ingredients/allergens cleaned) → Hashed product → (conditional) IndexEntry emission.

## Derived Fields
- flags.isFood recalculated with negative keyword exclusion.

## Invariants
- Hash uniqueness: Same semantic product (post-filter) yields identical hash across runs.
- Index completeness: Every index record is valid and minimal.

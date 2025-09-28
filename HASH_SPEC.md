# HASH_SPEC (Draft)

## Purpose
Provide deterministic, stable hashing of product records while allowing semantically equivalent representations (notably omission of empty structural fields) to produce identical hashes.

## Scope
Covers canonical ordering, omission normalization, and equivalence rules for empty arrays/objects during hash computation. Excludes performance optimizations and distributed/hash collision mitigation (out of scope).

## Draft Normalization Pipeline
1. Input: Raw product object post-parsing.
2. Deep clone (if needed) to avoid mutating caller data.
3. Omission pre-pass: remove keys whose values are strictly empty arrays `[]` or empty plain objects `{}` (recursively) provided removal does not eliminate required identity fields (id, name, price remain untouched even if empty—though upstream guards prevent empties).
4. Canonical field ordering: sort remaining keys lexicographically; for nested objects repeat recursively. Arrays preserve original order (except that empty arrays already pruned in step 3).
5. String normalization: current implementation (none added here) — future: trim & collapse internal whitespace (OPEN QUESTION).
6. Serialization: JSON stringify with no spacing to a canonical string.
7. Hash: SHA-256 of the canonical string, hex lower-case.

## Omission Equivalence
Two product objects are equivalent for hashing if, after the omission pre-pass, their pruned forms are deeply equal by structural comparison with ordered keys.

Examples:
- `{ ingredients: [] }` ≡ `{}`
- `{ meta: { tags: [] } }` ≡ `{ meta: {} }` ≡ `{}` (assuming `meta` becomes empty)
- `{ allergens: [] }` ≡ `{}`

Non-equivalence examples:
- `{ ingredients: ["salt"] }` ≠ `{}`
- `{ meta: { tags: ["a"] } }` ≠ `{ meta: {} }`

## Required Identity Fields
`id`, `name`, `price` must be present prior to hashing; omission pass must NOT remove them even if falsy. Upstream validation ensures they are not empty or invalid.

## Open Questions
- Should string normalization (trim, unicode NFC) be enforced pre-hash? (pending research RT-009)
- Should numeric formatting (e.g., fixed decimals) be canonicalized? (not needed now; prices appear consistent)
- Should we collapse empty string values to key omission? (currently NO; could introduce unintended equivalence)

## Future Work (Deferred)
- Performance benchmark to validate omission pre-pass overhead (<2% target originally; user deprioritized performance so measurement optional).
- Collision monitoring & reporting.
- Configurable equivalence rules externalized via JSON.

## Status
Draft; finalize after implementation of omission pass & hash tests (Tasks T022–T023) are green.

## Deterministic Ordering Addendum
- Product list ordering prior to hashing: ascending id (numeric if both sides numeric-like, else lexicographic) then name ascending.
- Product key emission order (hash input): `id,name,price,categories,unit,nutrition,ingredients,allergens,images,flags,added` (hash appended after computation, not part of input string).
- Nested object keys sorted lexicographically (stableSerialize implementation detail).
- Arrays preserve original encounter order (no sorting) to retain semantic sequence.

## Stats & Hygiene Keys
- Hygiene/stat keys (currently `skippedIndexEntries`) serialized with deterministic key ordering by stable JSON serialization.
- Addition of new stats keys must preserve stable order; recommend alphabetical insertion or explicit ordered serializer.

## Equivalence Rationale (Summary)
- Empty structural containers pruned makes presence vs absence equivalent.
- Hash drift only occurs when semantic content changes (non-empty additions/removals or value modifications).

## Non-Goals Clarification
- No attempt to normalize empty strings → omission (could mask data quality issues).
- No locale-specific collation beyond default JS string comparison for id fallback and name tiebreaker.

## Finalization Criteria (T040)
- All ordering and equivalence rules captured here.
- Regression tests (including T011 & skipped T034) reflect these rules.

# Research Topic: Hashing Strategy

## Question
How to compute stable per-record and manifest hashes ensuring determinism while avoiding accidental PII leakage?

## Requirements
- Stable across runs (field order fixed)
- Resistant to collisions (SHA-256 acceptable)
- Exclude volatile / derived fields from content hash (e.g., processing timestamps)
- Provide top-level manifest hash aggregating record hashes

## Field Inclusion Policy
Include only canonical business fields: identity, descriptive, normalized nutrition, size, classification flags, allergen flags.
Exclude: internal counters, conflict logs, performance stats.

## Algorithm
1. Define ordered key list (see JSON ordering research) – iterate in that order building JSON string without whitespace (minimal form) to hash.
2. Use Node crypto: `createHash('sha256').update(serialized, 'utf8').digest('hex')`.
3. Record-level hash stored as `hash` field (last key to keep ordering stable but not part of its own hash input) -> hash input excludes the `hash` field.
4. Manifest hash: streaming combine by updating hash with each record hash in sorted product_id order plus newline separator.

## Determinism Safeguards
- Enforce numeric formatting (no trailing zeros trimming differences) before serialization.
- Sort arrays deterministically (alphabetical) prior to serialization.
- Validate serialization by re-parsing first record and re-hashing to assert consistency in tests.

## Test Cases
- Same record object re-serialized → identical hash.
- Reordered object keys (unsorted internal object) still produce same hash because we control order externally.
- Changing a single nutrition value changes hash.
- Adding a non-included field does not change hash.

## Collision Handling
SHA-256 collision risk negligible for dataset size; no secondary hash required.

## Decision
Use SHA-256 over canonical minimal JSON (no spaces) excluding `hash` field. Append hex hash as final key. Manifest hash built from ordered list of record hashes with newline separator for clarity.

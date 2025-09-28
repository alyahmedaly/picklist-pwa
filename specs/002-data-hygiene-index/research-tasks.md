# Targeted Research Tasks: Data Hygiene & Index Refinement

> Purpose: De-risk ambiguous or potentially error-prone implementation steps with focused, parallelizable research tasks. Each item yields a concrete artifact (test stub, spec note, benchmark snippet, or config draft).

## Index of Research Tasks
1. RT-001 Placeholder Token Boundary Accuracy
2. RT-002 Allergen Whitelist Normalization & Singularization Rules
3. RT-003 URL Token Filtering Robustness
4. RT-004 Negative isFood Keyword List Precision
5. RT-005 Hash Equivalence (Empty vs Omitted) Canonicalization
6. RT-006 Hash Regression Fixture Strategy
7. RT-007 Performance Overhead Measurement Method
8. RT-008 Stats Counter Extension Pattern (`skippedIndexEntries`)
9. RT-009 Schema Doc Hygiene Rules Section Format
10. RT-010 Index Emission Guard (Minimum Field Set) Edge Cases
11. RT-011 Ingredient Deduplication Ordering Guarantees
12. RT-012 Allergen Singular vs Plural Mapping Collisions
13. RT-013 Future Config Externalization Safe Determinism
14. RT-014 Classification Debug Logging Strategy (Optional)
15. RT-015 Fuzz Input Safety (Unicode / URLs / Control chars)

---

## RT-001 Placeholder Token Boundary Accuracy
- Implementation Dependency: FR-DH-001
- Problem: Distinguish real short tokens (e.g., "Na" chemical symbol) from placeholder "NA".
- Questions:
  1. Case sensitivity: treat "Na" (sodium) as valid while "NA" placeholder? Is dataset uppercase for placeholders?
  2. Should trailing punctuation ("NA,") strip before evaluation?
- Approach: Sample dataset scan (regex for \bNA[,]?\b vs \bNa\b); create unit test with sodium edge case.
- Deliverable: Test file `parseIngredients.placeholder.test.ts` with explicit sodium case retained.
- Timebox: 25m

## RT-002 Allergen Whitelist Normalization & Singularization Rules
- Implementation Dependency: FR-DH-002
- Problem: Ensuring singularization does not incorrectly alter already singular forms or irregular plurals ("fish" → stays "fish").
- Questions:
  1. Are any whitelist tokens plural by default ("tree nuts")? Need mapping list.
  2. How to handle "almonds" vs "almond" ordering & duplicates?
- Approach: Construct mapping table; unit tests for each plural variant collapse.
- Deliverable: `allergens.normalization.test.ts`
- Timebox: 30m

## RT-003 URL Token Filtering Robustness
- Implementation Dependency: FR-DH-003
- Problem: Detect and remove URLs without false positives on tokens like "httpOnly".
- Questions:
  1. Regex anchor sufficiency: ^https?:// vs schema-less //?
  2. Should we also drop tokens containing .jpg/.png query assets?
- Approach: Define conservative regex; add blacklist extension test.
- Deliverable: `allergens.url-filter.test.ts`
- Timebox: 20m

## RT-004 Negative isFood Keyword List Precision
- Implementation Dependency: FR-DH-004
- Problem: Avoid misclassifying ambiguous categories (e.g. "bleekselderij" (celery) contains substring "bleek").
- Questions:
  1. Token boundaries: split by non-alphanum and compare whole tokens?
  2. Add safe-list exceptions?
- Approach: Gather sample category set; test tokenization; add negative keyword test with false-positive guard.
- Deliverable: `classify.isFood-negatives.test.ts`
- Timebox: 35m

## RT-005 Hash Equivalence (Empty vs Omitted) Canonicalization
- Implementation Dependency: FR-DH-007/008
- Problem: Guarantee that `{ingredients: []}` and absence of `ingredients` yield identical hash.
- Questions:
  1. Normalization order: omit before ordering or after?
  2. Do we treat nested empty allergen arrays the same (omit parent)?
- Approach: Write pure normalization function test-first; property test over permutations.
- Deliverable: `hash.omission-equivalence.test.ts`
- Timebox: 40m

## RT-006 Hash Regression Fixture Strategy
- Implementation Dependency: FR-DH-008
- Problem: Track which products changed hash legitimately (due to real semantic clean) vs unexpected drift.
- Questions:
  1. Store baseline in JSON mapping id→hash?  
  2. Annotate reasons? (placeholder removal / allergen purge)
- Approach: Create `fixtures/hash-regression-baseline.json`; test compares new run; build diff reporter.
- Deliverable: Baseline file + `hash.regression.test.ts`
- Timebox: 30m

## RT-007 Performance Overhead Measurement Method
- Implementation Dependency: Non-functional guard
- Problem: Validate overhead <2% w/o full perf harness bloat.
- Questions:
  1. Use process.hrtime.bigint around transform for a synthetic dataset?
  2. Warm-up needed? single vs multi run median?
- Approach: Add optional perf test behind env flag; capture pre & post metrics.
- Deliverable: `perf.hygiene-overhead.test.ts` (skipped unless PERF=1)
- Timebox: 45m

## RT-008 Stats Counter Extension Pattern (`skippedIndexEntries`)
- Implementation Dependency: FR-DH-010
- Problem: Ensure adding counter doesn't reorder existing stats keys (determinism risk).
- Questions:
  1. Where in JSON key order is stats serialized? rely on stable ordering map?
  2. Should counter increment only when JSONL record written but index skipped?
- Approach: Inspect ordering module; add unit test for stable stats key order.
- Deliverable: `stats.skippedIndexEntries.test.ts`
- Timebox: 20m

## RT-009 Schema Doc Hygiene Rules Section Format
- Implementation Dependency: FR-DH-009
- Problem: Decide presentation (table vs bullet) without breaking existing schema doc test.
- Questions:
  1. Existing test checks snapshot or sections?  
  2. Need anchor heading id?
- Approach: Read `schema-doc.test.ts`; define format; add failing test for new heading.
- Deliverable: Updated schema doc test + format decision note.
- Timebox: 15m

## RT-010 Index Emission Guard (Minimum Field Set) Edge Cases
- Implementation Dependency: FR-DH-005/006
- Problem: Distinguish zero price vs missing price; treat whitespace-only name as missing.
- Questions:
  1. Accept price = 0? (Yes if numeric)  
  2. Trim name then check length?
- Approach: Tests covering null, undefined, empty string, whitespace, zero price.
- Deliverable: `index.emission-guard.test.ts`
- Timebox: 25m

## RT-011 Ingredient Deduplication Ordering Guarantees
- Implementation Dependency: FR-DH-001
- Problem: Removing placeholders may shift positions; ensure remaining order preserved.
- Questions:
  1. Should duplicate valid tokens collapse or preserve duplicates? (Assume collapse preserving first occurrence.)
- Approach: Test list with placeholders interleaved; assert relative order of valid tokens.
- Deliverable: `ingredients.order-preservation.test.ts`
- Timebox: 20m

## RT-012 Allergen Singular vs Plural Mapping Collisions
- Implementation Dependency: FR-DH-002
- Problem: Words like "fish" singular/plural identical; ensure no duplicate after normalization.
- Questions:
  1. Are we de-duping after normalization?  
  2. Order preservation vs set semantics?
- Approach: Build normalization test with ['Fish', 'fish', 'Fishes?'] Determine policy: treat 'fishes' -> 'fish'.
- Deliverable: Extend `allergens.normalization.test.ts`.
- Timebox: 15m

## RT-013 Future Config Externalization Safe Determinism
- Implementation Dependency: Potential future (pluggable rules)
- Problem: Allow external JSON config without nondeterministic ordering.
- Questions:
  1. Sort arrays before freeze?  
  2. Hash config file path into global manifest?
- Approach: Prototype load-normalize-freeze function test.
- Deliverable: `hygiene.config-normalization.test.ts`
- Timebox: 30m

## RT-014 Classification Debug Logging Strategy (Optional)
- Implementation Dependency: Observability enhancement
- Problem: Provide trace of why isFood flipped without cluttering default logs.
- Questions:
  1. Use env flag or CLI flag?  
  2. Log structure: {productId, reason:"negative-keyword", keyword:"bleek"}
- Approach: Decide gating; write unit test verifying no logs unless flag set.
- Deliverable: `classify.debug-logging.test.ts`
- Timebox: 20m

## RT-015 Fuzz Input Safety (Unicode / URLs / Control chars)
- Implementation Dependency: Robustness
- Problem: Ensure parser & hygiene filters stable under odd unicode / control chars.
- Questions:
  1. Limit length?  
  2. Should control chars be stripped or left?
- Approach: Property test generating random tokens including edge unicode; assert no throw and deterministic filtering.
- Deliverable: `fuzz.hygiene-stability.test.ts`
- Timebox: 45m

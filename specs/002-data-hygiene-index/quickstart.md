# Quickstart: Hygiene & Index Refinement

## Goal
Validate hygiene filtering, index pruning, and hash stability locally.

## Steps
1. Prepare sample CSV with rows covering:
   - Placeholder-only ingredients ("NA")
   - Mixed ingredients ("Water, NA, Salt")
   - Allergen line containing URL
   - Household cleaning category product
   - Product missing name (blank)
    - Product with empty ingredient/allergen arrays (to test omission normalization)
2. Run transform:
   `node --loader ts-node/esm src/scripts/transform-data.ts --input sample.csv --outDir out --log human`
3. Inspect `out/products.jsonl`:
   - Placeholder-only row: no `ingredients` key.
   - Mixed row: ingredients excludes placeholders.
    - Empty arrays/objects omitted (hash equivalence with absent fields).
4. Inspect `out/products-index.json`:
   - No stub entries (every object has id, name, price, categories, isFood).
   - Cleaning product has `isFood: false`.
5. Compare hash stability:
   - Re-run transform; diff hashes for unchanged rows (should match).
6. Check stats file for `skippedIndexEntries` > 0 when invalid rows included.
7. Open schema doc to see "Hygiene Rules" section.
 8. (Optional) Enable classification debug: `CLASSIFY_DEBUG=1 node --loader ts-node/esm src/scripts/transform-data.ts ...` to emit `classify_debug` logs.

## Expected Artifacts
- products.jsonl (cleaned)
- products-index.json (pruned)
- stats.json (with skippedIndexEntries)
- schema.md updated
- Hash equivalence across omission-normalized variants

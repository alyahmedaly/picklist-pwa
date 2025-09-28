# Quickstart: Dutch Localization Feature

## Goal
Validate Dutch parsing additions with minimal steps.

## Steps
1. Place sample Dutch CSV at `data/sample-nl.csv` (include allergens: "BEVAT: MELK, TARWE" and decimal comma values).
2. Run build transform script (`npm run transform` or equivalent) producing outputs.
3. Open `out-test/stats.json` and verify keys: `dutchAllergenProducts`, `decimalCommaNormalizedCount`.
4. Inspect a product line in `out-test/products.jsonl` ensuring `allergens.contains` includes `melk` & `tarwe`.
5. Confirm `schema.md` contains "Localization" section listing Dutch tokens.

## Expected Results
- Stats counters present
- Dutch allergens parsed
- Decimal comma normalization applied
- No regression in existing English allergen outputs

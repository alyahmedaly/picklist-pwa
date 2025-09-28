# Quickstart: Food Additive & E-Number Analysis

**Feature**: 006-food-additive-e
**Date**: 2025-01-16

## Quick Test

```bash
# Run transformation with additive analysis on real dataset
node src/scripts/transform-data.ts --input data/2024-10-23.csv --outDir out

# Verify additive detection in output
grep -o '"additiveInfo"' out/products.jsonl | wc -l

# Check most common E-numbers from real data
grep "E330\|E202\|E300\|E250" out/products.jsonl | head -5

# Performance test - should complete in <10s for 30,499 products
time node src/scripts/transform-data.ts --input data/2024-10-23.csv --outDir out
```

## Expected Results

### Sample Input (Real Dutch CSV - data/2024-10-23.csv)
```
id,name,ingredients
73,"AH Franse baguettes","tarwebloem, water, gist, antioxidant (ascorbinezuur [E300])"
257,"AH Roomkaas met kruiden","melk, room, zuurteregelaar (melkzuur [E270], citroenzuur [E330]), antioxidant (natriumdisulfiet [E223])"
732,"AH Pizzabroodjes salami","...antioxidant (natriumerythorbaat [E316]), conserveermiddel (natriumnitriet [E250])"
```

### Expected Output (Enhanced JSONL)
```json
{
  "id": "73",
  "name": "AH Franse baguettes",
  "ingredients": ["tarwebloem", "water", "gist", "antioxidant (ascorbinezuur [E300])"],
  "additiveInfo": {
    "eNumbers": ["E300"],
    "dutchCategories": ["antioxidant"],
    "functionalCategories": ["Antioxidant"],
    "totalAdditives": 1,
    "naturalAdditives": ["E300"],
    "syntheticAdditives": []
  },
  "additiveFlags": {
    "hasPreservatives": false,
    "hasArtificialColors": false,
    "allNaturalAdditives": true,
    "requiresChildWarning": false,
    "containsAllergenicAdditives": false
  }
}
```

### Real Performance Expectations
- **Processing time**: <10s for 30,499 products (constitutional requirement)
- **E-number detection**: ~8,000+ E-number instances across dataset
- **Most common hits**: E330 (1,726×), E202 (1,156×), E300 (1,053×)

## Validation Steps

1. **E-Number Detection**: Verify E300, E330, E202, E250 are properly extracted from real data
2. **Dutch Category Mapping**: Confirm "antioxidant" → "Antioxidant", "conserveermiddel" → "Conserveermiddel"
3. **Safety Flags**: Check E250 (sodium nitrite) triggers appropriate preservative flags
4. **Performance**: Ensure processing completes <10s for 30,499 products
5. **Deterministic Output**: Multiple runs produce identical results
6. **Real Data Coverage**: Validate against actual AH product ingredient patterns

## Common Issues

- **Missing E-numbers**: Check regex patterns match Dutch formatting
- **Category mismatch**: Verify Dutch terms map to correct FunctionalCategory
- **Performance**: Large datasets may require streaming optimization
- **Encoding**: Ensure UTF-8 handling for Dutch characters (ë, ï, etc.)
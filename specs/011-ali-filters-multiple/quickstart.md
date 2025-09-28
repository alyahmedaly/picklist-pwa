# Quickstart: Ali Filters + Multiple Outputs

**Ready to test**: After implementation complete
**Prerequisites**: Node.js, existing CSV product data
**Test Duration**: ~2 minutes

## Quick Start Commands

### 1. Ali's Daily Protein Hunt (Halal + High Protein)
```bash
# Find halal protein sources for 170g daily target
node src/scripts/transform-data.ts \
  --input data/2024-10-23.csv \
  --outDir out \
  --filters halal,protein \
  --halal-strict \
  --protein-min 20 \
  --protein-target 170
```

**Expected Output**:
- `out/filtered-halal-protein.jsonl` (~431 products from high-protein + ~14,814 halal intersection)
- `out/filtered-halal-protein-index.json` (searchable subset)
- `out/filtered-halal-protein-stats.json` (coverage: protein 15,447, halal 19,127)

### 2. Post-CrossFit Recovery (Halal + Optimal Carb:Protein)
```bash
# Post-workout fuel with 2:1-4:1 carb:protein ratio
node src/scripts/transform-data.ts \
  --input data/2024-10-23.csv \
  --outDir out \
  --filters halal,postworkout \
  --halal-strict \
  --post-workout-min-ratio 2.0 \
  --post-workout-max-ratio 4.0 \
  --post-workout-high-gi
```

**Expected Output**:
- Filtered products from ~13,145 post-workout analyzed + ~14,814 halal
- Focus on rice, dates, halal protein sources with optimal ratios
- Products ranked by post-workout optimization score

### 3. Cutting Phase (Halal + Fat Loss Compatible)
```bash
# High satiety, low calorie density for cutting
node src/scripts/transform-data.ts \
  --input data/2024-10-23.csv \
  --outDir out \
  --filters halal,fatloss \
  --halal-strict \
  --fat-loss-max-calories 125 \
  --fat-loss-high-volume
```

**Expected Output**:
- Products from ~10,440 fat-loss compatible + ~14,814 halal intersection
- <125 kcal/100g products with high satiety scores
- Volume advantage calculations for portion planning

### 4. Budget Protein Optimization
```bash
# Best protein per euro, halal compliant
node src/scripts/transform-data.ts \
  --input data/2024-10-23.csv \
  --outDir out \
  --filters halal,protein,budget \
  --halal-strict \
  --protein-min 15 \
  --budget-optimize-protein \
  --budget-max-price 2.00
```

**Expected Output**:
- Chicken breast, kwark, tuna, eggs prioritized by protein/euro efficiency
- Under €2/100g price threshold
- Portion calculations for 170g daily protein target

### 5. Training Day vs Rest Day Context
```bash
# Training day (2000 kcal, 220g carbs)
node src/scripts/transform-data.ts \
  --input data/2024-10-23.csv \
  --outDir out \
  --filters halal,protein \
  --training-day \
  --protein-target 170

# Rest day (1750 kcal, 120g carbs)
node src/scripts/transform-data.ts \
  --input data/2024-10-23.csv \
  --outDir out \
  --filters halal,fatloss \
  --protein-target 170
```

### 6. All Ali Filter Combinations
```bash
# Generate all predefined combinations at once
node src/scripts/transform-data.ts \
  --input data/2024-10-23.csv \
  --outDir out \
  --filters halal,protein,postworkout,fatloss,budget \
  --halal-strict \
  --protein-target 170 \
  --avoid-combinations "tuna+rice,honey" \
  --generate-filtered-outputs
```

**Expected Outputs**:
- `filtered-halal-protein.jsonl` + index + stats
- `filtered-halal-postworkout.jsonl` + index + stats
- `filtered-halal-fatloss.jsonl` + index + stats
- `filtered-halal-budget.jsonl` + index + stats
- `filtered-complete.jsonl` (products matching ALL criteria)

## Validation Steps

### Test 1: Halal Protein Coverage
```bash
# Check coverage statistics
cat out/filtered-halal-protein-stats.json | jq '.filterSpecific'
```
**Expected**: `halalCoverage: 19127, proteinCoverage: 15447`

### Test 2: Performance Baseline
```bash
# Time the full processing
time node src/scripts/transform-data.ts --input data/2024-10-23.csv --outDir out --filters halal,protein,postworkout,fatloss
```
**Expected**: Processing completes in <10 seconds

### Test 3: Product Quality Check
```bash
# Verify filtered products have required fields
head -5 out/filtered-halal-protein.jsonl | jq '.halalAnalysis.status, .proteinOptimization.proteinDensityScore'
```
**Expected**: All products show `"halal"` status and protein scores >0

### Test 4: Ali-Specific Preferences
```bash
# Check tuna products avoid rice combinations
grep -i "tuna" out/filtered-halal-protein.jsonl | jq -r '.name' | head -5
```
**Expected**: No "tuna+rice" or similar combinations in recommended products

## Sample Expected Results

### Halal High-Protein Products (Top 5)
Based on existing scoring data:
1. **Chicken Breast** - 31g protein/100g, protein efficiency score ~85
2. **Kwark 0% Fat** - 12g protein/100g, excellent protein/calorie ratio
3. **Tuna in Water** - 25g protein/100g, budget-friendly protein source
4. **Halal Greek Yogurt** - 10g protein/100g, good for post-workout with fruit
5. **Halal Whey Protein** - 80g protein/100g, pre/post workout supplement

### Post-Workout Products (Top 3)
1. **White Rice** - GI=90, 3:1 carb:protein ratio, postWorkoutScore=82
2. **Dates + Halal Whey** - Fast carbs + protein combination
3. **Banana + Kwark** - Natural sugars + protein for recovery

### Fat-Loss Compatible (Top 3)
1. **Zucchini** - 20 kcal/100g, high volume, fiber content
2. **Cucumber** - 16 kcal/100g, high water content
3. **Lean Chicken** - High protein, moderate calories, excellent satiety

## Troubleshooting

### No Products Returned
- Check halal coverage: `jq '.personalHealthExtensions.halalAnalysisComputed' out/stats.json`
- Verify protein thresholds not too restrictive
- Confirm input CSV has complete nutrition data

### Performance Issues
- Monitor processing time with `time` command
- Check memory usage for large datasets
- Verify no infinite loops in filter logic

### Incorrect Results
- Validate filter criteria with `--filter-stats` flag
- Check exclusion reasons in stats files
- Verify existing scoring data is complete

This quickstart enables Ali to immediately find products matching his specific needs across all major use cases: daily protein hunting, post-workout recovery, cutting phase nutrition, and budget optimization.
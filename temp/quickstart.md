# Quickstart: Personal Health Extensions (Halal & Protein)

**Branch**: `008-let-s-write` | **Feature**: Personal health optimization layers

## Prerequisites
- Node.js 18+
- Existing hybrid scoring system (nutriScore, globalHealthScore, categoryHealthScore)
- CSV data with nutrition and ingredient information
- Ali's personal targets: 170g protein daily, halal compliance, calorie deficit support

## Quick Validation (5 minutes)

### 1. Verify Enhanced Product Structure
```bash
# Transform sample data with new scoring
node src/scripts/transform-data.ts --input tests/fixtures/sample-small.csv --outDir out-test --log human

# Check for new scoring fields in output
grep -E '"halalAnalysis"|"proteinScoring"|"satietyIntelligence"' out-test/products.jsonl | head -3
```

**Expected Output**:
```json
{
  "id": 1,
  "name": "Sample Product",
  "halalAnalysis": {
    "isHalal": true,
    "halalScore": 95,
    "confidence": "high",
    "flags": ["certified_halal"],
    "warnings": [],
    "additiveAnalysis": { "halalCompliantAdditives": ["E300"], "questionableAdditives": [] }
  },
  "proteinScoring": {
    "proteinPer100g": 12.5,
    "proteinDensity": 8.7,
    "dailyTargetContribution": 7.4,
    "servingOptimization": "good",
    "mealContext": "post_workout"
  },
  "satietyIntelligence": {
    "satietyIndex": 154,
    "satietyGrade": "high",
    "calorieEfficiency": 78,
    "hungerSatisfaction": "excellent",
    "weightLossCompatibility": true
  }
}
```

### 2. Verify Statistics Integration
```bash
# Check stats include new scoring data
jq '.personalHealthStats' out-test/stats.json
```

**Expected Output**:
```json
{
  "halalCompliance": {
    "totalAnalyzed": 245,
    "halalProducts": 198,
    "questionableProducts": 32,
    "nonHalalProducts": 15,
    "complianceRate": 80.8
  },
  "proteinOptimization": {
    "highProteinProducts": 67,
    "averageProteinDensity": 6.2,
    "dailyTargetAchievable": 89.4
  },
  "satietyIntelligence": {
    "averageSatietyIndex": 142,
    "highSatietyProducts": 78,
    "weightLossCompatible": 156
  }
}
```

### 3. Performance Validation
```bash
# Test with larger dataset (performance requirement: <10s for 30k products)
time node src/scripts/transform-data.ts --input data/2024-10-23.csv --outDir out-perf --log json
```

**Expected**: Completion in <10 seconds with memory <150MB RSS.

### 4. Backward Compatibility Check
```bash
# Verify existing scoring fields still present
jq 'select(.nutriScore != null) | {nutriScore, globalHealthScore, globalHealthGrade, categoryHealthScore, categoryHealthGrade}' out-test/products.jsonl | head -5
```

**Expected**: All existing hybrid scoring fields remain unchanged.

## Integration Scenarios

### Scenario 1: Halal Compliance Detection
**Test Product**: Contains E120 (cochineal, non-halal)
```bash
# Find products with halal warnings
jq 'select(.halalAnalysis.warnings | length > 0) | {name, halalAnalysis}' out-test/products.jsonl
```

### Scenario 2: Protein Target Optimization
**Context**: Ali's 170g daily protein target
```bash
# Find high protein density products for meal planning
jq 'select(.proteinScoring.dailyTargetContribution > 10) | {name, proteinScoring}' out-test/products.jsonl
```

### Scenario 3: Satiety for Weight Loss
**Context**: 1800-2000 kcal calorie deficit
```bash
# Find products with high satiety and low calories
jq 'select(.satietyIntelligence.weightLossCompatibility == true and .satietyIntelligence.satietyIndex > 150) | {name, nutrition.kcal, satietyIntelligence}' out-test/products.jsonl
```

## Testing Validation

### Run Full Test Suite
```bash
# All tests must pass (TDD requirement)
npm test

# Specific personal health tests
npm test -- --grep "halal|protein|satiety"
```

**Expected**: 100% test pass rate with new scoring coverage.

### Contract Test Validation
```bash
# Verify contract tests are enforcing correct signatures
vitest run tests/contract/halal-compliance.contract.test.ts
vitest run tests/contract/protein-optimization.contract.test.ts
vitest run tests/contract/satiety-analysis.contract.test.ts
```

## Performance Benchmarks

### Memory Usage Monitoring
```bash
# Monitor RSS memory during large dataset processing
node --max-old-space-size=200 src/scripts/transform-data.ts --input data/2024-10-23.csv --outDir out-memory-test --log json
```

### Processing Speed Validation
```bash
# Constitutional requirement: <10s for 30k products
time node src/scripts/transform-data.ts --input data/2024-10-23.csv --outDir out-speed-test >/dev/null
```

## Troubleshooting

### Common Issues

**Issue**: `halalAnalysis` field missing from output
**Solution**: Check that product has `additiveInfo` data for E-number analysis
```bash
jq 'select(.additiveInfo == null) | .name' out-test/products.jsonl
```

**Issue**: `proteinScoring` shows undefined values
**Solution**: Verify nutrition data has `protein` field
```bash
jq 'select(.nutrition.protein == null) | {name, nutrition}' out-test/products.jsonl
```

**Issue**: `satietyIntelligence` not calculated
**Solution**: Check if product category maps to Satiety Index database
```bash
jq '.satietyIntelligence.satietyIndex // "unmapped"' out-test/products.jsonl | sort | uniq -c
```

### Performance Issues

**Slow Processing**: Check if E-number regex patterns are compiled efficiently
**High Memory**: Verify streaming pipeline processes products in batches

### Data Quality Validation

**Halal Confidence Low**: Review additive detection accuracy
**Protein Density Outliers**: Validate nutrition data parsing
**Satiety Index Mismatches**: Check category mapping logic

## Success Criteria

✅ **Functionality**: All new scoring fields present in output
✅ **Performance**: <10s processing, <150MB memory
✅ **Compatibility**: Existing scoring fields unchanged
✅ **Quality**: 100% test pass rate
✅ **Evidence-Based**: Satiety Index scientifically validated
✅ **Personal Optimization**: Halal compliance + protein targeting working

## Next Steps

After validation success:
1. **UI Integration**: Update frontend to display new scoring data
2. **Meal Planning**: Create recipes optimized for protein targets
3. **Shopping Lists**: Generate halal-compliant, high-satiety recommendations
4. **Progress Tracking**: Monitor daily protein achievement vs 170g target
5. **Dietary Analytics**: Track satiety effectiveness for weight loss goals

---
*Feature complete when all validation scenarios pass and performance requirements met.*
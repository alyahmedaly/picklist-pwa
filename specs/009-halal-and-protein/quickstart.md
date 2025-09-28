# Quickstart: Halal Compliance & Protein Optimization

**Feature**: 009-halal-and-protein
**Purpose**: Validate implementation against user stories
**Prerequisites**: Existing product transformation pipeline running

## User Story Validation

### Story 1: Halal Product Identification

**As a Muslim user, I need automatic Halal/Haram detection**

```bash
# Transform sample with known Halal/Haram products
node src/scripts/transform-data.ts \
  --input tests/fixtures/halal-sample.csv \
  --outDir out-quickstart \
  --log human

# Verify Halal analysis in output
grep -A 10 "halalCheck" out-quickstart/products.jsonl | head -20
```

✅ **Expected Results**:
- Products with pork ingredients: `status: 'haram'`
- Products with questionable E-numbers: `status: 'questionable'`
- Clean products: `status: 'halal'`
- Confidence levels: 'high' for clear cases, 'low' for incomplete data

### Story 2: Protein Optimization for Body Recomposition

**As a fitness-focused user, I need protein density scoring**

```bash
# Check protein optimization scores
jq '.proteinOptimization' out-quickstart/products.jsonl | head -10

# Find top protein sources
jq 'select(.proteinOptimization.proteinDensityScore > 80)' \
  out-quickstart/products.jsonl | jq '.name, .proteinOptimization'
```

✅ **Expected Results**:
- High-protein products: `proteinDensityScore > 70`
- Target contribution shows realistic serving impact
- Protein per 100g matches nutritional data

### Story 3: Satiety Intelligence for Calorie Deficit

**As a user managing calorie intake, I need satiety scoring**

```bash
# Examine satiety analysis
jq '.satietyAnalysis' out-quickstart/products.jsonl | head -10

# Find most satiating products per calorie
jq 'select(.satietyAnalysis.satietyScore > 75)' \
  out-quickstart/products.jsonl | jq '.name, .satietyAnalysis.satietyScore'
```

✅ **Expected Results**:
- High-protein, high-fiber products: `satietyScore > 70`
- Processing penalty lower for whole foods
- Duration estimates reasonable (120-250 minutes)

## Integration Validation

### Pipeline Integration

**Verify backward compatibility and performance**

```bash
# Run full pipeline with timing
time node src/scripts/transform-data.ts \
  --input tests/fixtures/sample-large.csv \
  --outDir out-integration \
  --log json > integration.log

```

✅ **Expected Results**:
- All existing fields preserved
- No breaking changes to schema

### Schema Compatibility

**Verify existing functionality unchanged**

```bash
# Compare schemas before and after
diff out-baseline/schema.md out-integration/schema.md
# Should show only additive new optional fields

# Verify existing scores preserved
jq 'select(.globalHealthScore) | {name, globalHealthScore}' \
  out-integration/products.jsonl | head -5
```

✅ **Expected Results**:
- Existing health scores unchanged
- Schema documentation updated with new fields
- All existing tests still pass

## Feature-Specific Tests

### Halal Analysis Edge Cases

```bash
# Test products with alcohol content
jq 'select(.halalCheck.flags.hasAlcohol == true)' \
  out-quickstart/products.jsonl | jq '.halalCheck'

# Test products with questionable E-numbers
jq 'select(.halalCheck.status == "questionable")' \
  out-quickstart/products.jsonl | jq '.halalCheck.eNumberConcerns'
```

### Protein Scoring Edge Cases

```bash
# Test products with missing protein data
jq 'select(.proteinOptimization == null)' \
  out-quickstart/products.jsonl | jq '.name, .nutrition.protein'

# Test high-protein products
jq 'select(.proteinOptimization.targetContribution > 15)' \
  out-quickstart/products.jsonl | jq '.name, .proteinOptimization'
```

### Satiety Analysis Edge Cases

```bash
# Test highly processed products
jq 'select(.satietyAnalysis.satietyFactors.processingPenalty < 50)' \
  out-quickstart/products.jsonl | jq '.name, .additiveInfo.totalAdditives'

# Test whole food products
jq 'select(.satietyAnalysis.satietyFactors.processingPenalty > 85)' \
  out-quickstart/products.jsonl | jq '.name, .satietyAnalysis.satietyFactors'
```

## Test Data Requirements

### Sample CSV Structure

```csv
id,name,ingredients,eiwit,koolhydraten,vezels,calorieen,category,unit
1,"Kipfilet","kipfilet, zout",23.0,0.0,0.0,165,"vlees","100g"
2,"Volkoren brood","volkoren tarwemeel, gist, zout",8.5,43.0,7.0,247,"brood","30g"
3,"Varkensspek","varkensvlees, zout, rookaroma",25.0,0.0,0.0,365,"vlees","100g"
4,"Alcoholvrije bier","water, hop, mout, E300",0.5,4.0,0.0,25,"dranken","330ml"
```

### Expected Analysis Results

**Kipfilet (Chicken breast)**:
- Halal: `status: 'halal'`, `confidence: 'high'`
- Protein: `proteinDensityScore: ~85`, `targetContribution: ~13.5%`
- Satiety: `satietyScore: ~75`, high protein factor

**Varkensspek (Pork bacon)**:
- Halal: `status: 'haram'`, `flags.hasPork: true`
- Protein: High density but Halal violation
- Satiety: High but not recommended

**Volkoren brood (Whole grain bread)**:
- Halal: `status: 'halal'`
- Protein: Moderate density for serving size
- Satiety: High fiber factor, good processing penalty

## Success Criteria

### Functional Requirements Met

- [x] FR-001: Pork detection working
- [x] FR-002: Alcohol content classification
- [x] FR-003: E-number Halal analysis
- [x] FR-004: Protein density scoring
- [x] FR-005: Daily target contribution
- [x] FR-006: Evidence-based satiety scoring
- [x] FR-007: Confidence level reporting
- [x] FR-008: Detailed ingredient concerns
- [x] FR-009: Backward compatibility preserved
- [x] FR-010: Halal filtering capability
- [x] FR-011: Protein ranking capability
- [x] FR-012: Graceful missing data handling

### Performance Requirements Met

- [x] Processing time < 10s for 30k products
- [x] Memory usage < 150MB
- [x] Deterministic output (byte-identical)
- [x] No external dependencies added

### Quality Requirements Met

- [x] All contract tests pass
- [x] Integration tests validate user stories
- [x] Edge cases handled gracefully
- [x] Error messages clear and actionable

## Troubleshooting

### Common Issues

**Issue**: Halal analysis shows 'unknown' status for all products
**Solution**: Check ingredient parsing and E-number detection
```bash
jq '.halalCheck.details.problematicIngredients | length' out-quickstart/products.jsonl | sort | uniq -c
```

**Issue**: Protein scores all zero
**Solution**: Verify nutritional data mapping
```bash
jq 'select(.nutrition.protein > 0) | .proteinOptimization' out-quickstart/products.jsonl | head -5
```

**Issue**: Satiety scores unrealistic
**Solution**: Check coefficient application and factor calculation
```bash
jq '.satietyAnalysis.satietyFactors' out-quickstart/products.jsonl | head -5
```

## Manual Verification

### Spot Check Products

1. Pick 5 products with known Halal status
2. Verify ingredient analysis matches Islamic guidelines
3. Check protein calculations against nutrition labels
4. Validate satiety scores against research coefficients

### Performance Monitoring

1. Run with `--log json` and monitor timing
2. Check memory usage during processing
3. Verify deterministic output with repeat runs
4. Validate no regression in existing functionality
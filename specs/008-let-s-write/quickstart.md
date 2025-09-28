# Quickstart: Hybrid Nutrition Score

## Prerequisites
- Node.js 18+
- Existing transform pipeline setup
- CSV data with nutrition information

## Quick Validation (5 minutes)

### 1. Verify Current Pipeline
```bash
# Ensure existing pipeline works
npm test
npm run lint

# Test with sample data
node src/scripts/transform-data.ts --input tests/fixtures/sample-small.csv --outDir out --log human
```

### 2. Check Sample Output Before Enhancement
```bash
# Examine current product structure
head -1 out/products.jsonl | jq '.'

# Should see existing fields but NO scoring fields yet:
# - No nutriScore
# - No globalHealthScore/globalHealthGrade
# - No categoryHealthScore/categoryHealthGrade
```

### 3. Run Tests to Verify RED Phase
```bash
# These tests MUST fail initially (RED phase requirement)
npm test -- --grep "hybrid.*score"
npm test -- --grep "nutri.*score"
npm test -- --grep "health.*grade"

# Expected: All scoring tests should fail (no implementation yet)
```

## Implementation Verification (After Development)

### 1. Unit Test Validation
```bash
# Test individual scoring functions
npm test tests/unit/computeNutriScore.test.ts
npm test tests/unit/computePercentileRank.test.ts
npm test tests/unit/computeHealthGrade.test.ts

# Expected: All unit tests pass
```

### 2. Integration Test Validation
```bash
# Test full pipeline with scoring
npm test tests/integration/dual-scoring.integration.test.ts

# Expected: Products with nutrition data get scoring fields
```

### 3. Sample Data Validation
```bash
# Transform sample data with scoring
node src/scripts/transform-data.ts --input tests/fixtures/sample-small.csv --outDir out --log human

# Verify enhanced output
head -1 out/products.jsonl | jq '.'
```

Expected enhanced product structure:
```json
{
  "id": "123",
  "name": "Campina Halfvolle yoghurt vanillesmaak",
  "nutrition": {
    "kcal": 78,
    "satFat": 1.1,
    "sugars": 11,
    "salt": 0.11,
    "fiber": 0,
    "protein": 3.1
  },
  "nutriScore": -1,
  "globalHealthScore": 85.0,
  "globalHealthGrade": "A",
  "categoryHealthScore": 65.0,
  "categoryHealthGrade": "C"
}
```

### 4. Statistics Validation
```bash
# Check stats include scoring information
cat out/stats.json | jq '.scoringStats'
```

Expected stats structure:
```json
{
  "totalProducts": 4,
  "productsWithScores": 3,
  "scoringCoverage": 75.0,
  "globalGradeDistribution": {
    "A": 1, "B": 0, "C": 1, "D": 1, "E": 0
  }
}
```

## Grade Distribution Validation

### 1. Check Grade Balance
```bash
# Extract all grades from output
cat out/products.jsonl | jq -r '.globalHealthGrade' | sort | uniq -c

# Expected: Roughly balanced distribution across A-E grades
```

### 2. Verify Dual Scoring Logic
```bash
# Find products where global and category grades differ
cat out/products.jsonl | jq 'select(.globalHealthGrade != .categoryHealthGrade) | {name, globalHealthGrade, categoryHealthGrade}'

# Expected: Some products show different global vs category grades
```

## Common Issues & Troubleshooting

### Issue: No Scoring Fields in Output
**Symptom**: Products missing nutriScore, healthScore fields
**Cause**: Products lack sufficient nutrition data
**Solution**:
```bash
# Check nutrition coverage
cat out/products.jsonl | jq 'select(.nutrition) | .name' | wc -l
cat out/products.jsonl | jq 'select(.nutriScore) | .name' | wc -l
```

### Issue: Unbalanced Grade Distribution
**Symptom**: Grade distribution not approximately 20% each
**Cause**: Small dataset or identical scores
**Solution**:
```bash
# Check dataset size and score variety
cat out/products.jsonl | jq '.nutriScore' | sort | uniq -c
```

### Issue: Non-Deterministic Output
**Symptom**: Same input produces different scores
**Cause**: Floating-point precision or unstable sorting
**Solution**:
```bash
# Run twice and compare
node src/scripts/transform-data.ts --input test.csv --outDir out1
node src/scripts/transform-data.ts --input test.csv --outDir out2
diff out1/products.jsonl out2/products.jsonl
```

## Validation Checklist

### Development Complete When:
- [ ] All unit tests pass (RED→GREEN cycle followed)
- [ ] Integration tests pass with real data
- [ ] Performance tests meet <10s/30k products requirement
- [ ] Grade distribution approximately 20% per grade
- [ ] Dual scoring shows meaningful differences
- [ ] Memory usage increase <1MB
- [ ] Deterministic output (identical input → identical output)
- [ ] Backward compatibility maintained (existing fields unchanged)
- [ ] Statistics enhanced with scoring data
- [ ] Constitutional requirements met (TDD, simplicity, determinism)

### Ready for Production When:
- [ ] Full test suite passes
- [ ] Performance validation on real datasets
- [ ] Documentation updated (README, CLAUDE.md)
- [ ] Code review passed constitutional checklist
- [ ] Regression testing with existing pipelines

## Next Steps After Quickstart
1. Review full implementation in `src/data/transform/scoring/`
2. Examine test coverage reports
3. Performance profiling with real datasets
4. Frontend integration planning (using dual scores)
5. Monitoring and alerting setup for scoring pipeline
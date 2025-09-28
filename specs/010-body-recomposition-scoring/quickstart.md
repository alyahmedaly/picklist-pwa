# Quickstart: Body Recomposition Scoring Enhancement

**Branch**: `010-body-recomposition-scoring` | **Feature**: Contextual scoring for body recomposition goals

## Prerequisites
- Node.js 18+
- Existing hybrid scoring system (nutriScore, globalHealthScore, protein optimization, satiety analysis)
- CSV data with nutrition and ingredient information
- Ali's body recomposition targets: muscle building + fat loss with contextual meal timing

## Quick Validation (5 minutes)

### 1. Verify Enhanced Product Structure
```bash
# Transform sample data with new body recomposition scoring
node src/scripts/transform-data.ts --input tests/fixtures/sample-small.csv --outDir out-test --log human

# Check for new scoring fields in output
grep -E '"postWorkoutOptimization"|"fatLossCompatibility"|"enhancedCalorieEfficiency"|"bodyCompositionContext"' out-test/products.jsonl | head -3
```

**Expected Output**:
```json
{
  "id": 1,
  "name": "Sample Product",
  "postWorkoutOptimization": {
    "postWorkoutScore": 78,
    "carbProteinRatio": 3.2,
    "glycemicBoost": 1.3,
    "recoveryWindow": "immediate",
    "confidence": "high"
  },
  "fatLossCompatibility": {
    "fatLossScore": 82,
    "calorieDensity": 95,
    "calorieDensityClass": "low",
    "satietyEfficiency": 4.2,
    "volumeAdvantage": true,
    "confidence": "high"
  },
  "enhancedCalorieEfficiency": {
    "efficiencyScore": 76,
    "proteinEfficiency": 85,
    "satietyEfficiency": 82,
    "micronutrientDensity": 65,
    "thermicEffect": 12,
    "processingPenalty": 5,
    "confidence": "high"
  },
  "bodyCompositionContext": {
    "bodyCompositionPhase": "recomposition",
    "mealTiming": "general",
    "contextMultipliers": {
      "proteinScoreMultiplier": 1.2,
      "satietyScoreMultiplier": 1.1,
      "postWorkoutMultiplier": 1.0,
      "fatLossMultiplier": 1.3,
      "efficiencyMultiplier": 1.1
    },
    "recommendationPriority": "efficiency",
    "conflictResolution": "balanced"
  }
}
```

### 2. Verify Statistics Integration
```bash
# Check stats include new body recomposition data
jq '.bodyRecompositionStats' out-test/stats.json
```

**Expected Output**:
```json
{
  "postWorkoutScoringComputed": 189,
  "fatLossCompatibilityComputed": 245,
  "enhancedCalorieEfficiencyComputed": 234,
  "bodyCompositionContextApplied": 245,
  "averagePostWorkoutScore": 42.7,
  "averageFatLossScore": 58.3,
  "averageEfficiencyScore": 51.8,
  "highPostWorkoutProducts": 67,
  "highFatLossProducts": 89,
  "highEfficiencyProducts": 78,
  "contextDistribution": {
    "cutting": 0,
    "bulking": 0,
    "maintenance": 0,
    "recomposition": 245
  },
  "timingDistribution": {
    "pre_workout": 0,
    "post_workout": 0,
    "general": 245
  }
}
```

### 3. ~~Performance Validation (Skip)~~

### 4. Backward Compatibility Check
```bash
# Verify existing scoring fields still present and unchanged
jq 'select(.proteinOptimization != null and .satietyAnalysis != null) | {proteinOptimization, satietyAnalysis, halalCheck}' out-test/products.jsonl | head -5
```

**Expected**: All existing scoring fields remain unchanged with same values as before enhancement.

## Integration Scenarios

### Scenario 1: Post-Workout Recovery Optimization
**Test Product**: High-carb + protein food with fast-absorbing carbs
```bash
# Find products optimized for post-workout recovery
jq 'select(.postWorkoutOptimization.postWorkoutScore > 70 and .postWorkoutOptimization.recoveryWindow == "immediate") | {name, postWorkoutOptimization}' out-test/products.jsonl
```

**Expected Results**:
- Products with carb:protein ratios 2:1 to 4:1
- High glycemic index carb sources get boost (glycemicBoost > 1.2)
- Recovery window classified as "immediate" for optimal timing

### Scenario 2: Fat Loss Compatibility Analysis
**Context**: Ali's cutting phase with calorie deficit goals
```bash
# Find products with high satiety and low calorie density
jq 'select(.fatLossCompatibility.fatLossScore > 75 and .fatLossCompatibility.calorieDensityClass == "low") | {name, fatLossCompatibility}' out-test/products.jsonl
```

**Expected Results**:
- Calorie density <125 kcal/100g classified as "low"
- High satiety efficiency (existing satiety score / calorie density)
- Volume advantage true for high-fiber, low-calorie foods

### Scenario 3: Enhanced Calorie Efficiency Scoring
**Context**: Multi-dimensional nutritional optimization
```bash
# Find products with superior calorie efficiency across all dimensions
jq 'select(.enhancedCalorieEfficiency.efficiencyScore > 80) | {name, enhancedCalorieEfficiency}' out-test/products.jsonl
```

**Expected Results**:
- High protein efficiency (protein per calorie optimization)
- High satiety efficiency (satiety per calorie optimization)
- Good micronutrient density estimation
- Reasonable thermic effect based on macronutrient composition
- Low processing penalty for whole foods

### Scenario 4: Body Composition Context Awareness
**Context**: Different phases and meal timing contexts
```bash
# Simulate cutting phase context (would require implementation)
echo "Future: Apply cutting phase multipliers to boost fat loss scores"
echo "Future: Apply post-workout timing to boost recovery scores"
```

**Expected Behavior**:
- Cutting phase: Boost fat loss and efficiency multipliers
- Post-workout timing: Boost recovery and protein multipliers
- Conflicts resolved using specified strategy (balanced, prioritize_goal, context_specific)

## Testing Validation

### Run Full Test Suite
```bash
# All tests must pass (TDD requirement)
npm test

# Specific body recomposition tests
npm test -- --grep "body.recomposition|post.workout|fat.loss|calorie.efficiency"
```

**Expected**: 100% test pass rate with new scoring coverage.

### Contract Test Validation
```bash
# Verify contract tests enforce correct interfaces
vitest run tests/contract/body-recomposition-scoring.contract.test.ts
vitest run tests/contract/post-workout-optimization.contract.test.ts
vitest run tests/contract/fat-loss-compatibility.contract.test.ts
vitest run tests/contract/calorie-efficiency.contract.test.ts
```

**Expected**: All contract tests pass, validating type safety and interface compliance.

### Integration Test Validation
```bash
# Body recomposition scoring integration tests
vitest run tests/integration/bodyRecompositionScoring.test.ts
```

**Expected**: Integration tests validate end-to-end scoring pipeline with real data.

## Performance Benchmarks

### Memory Usage Monitoring
```bash
# Monitor RSS memory during large dataset processing
node --max-old-space-size=200 src/scripts/transform-data.ts --input data/2024-10-23.csv --outDir out-memory-test --log json
```

**Expected**: Memory usage remains <150MB RSS including new scoring calculations.

### Processing Speed Validation
```bash
# Constitutional requirement: <10s for 30k products
time node src/scripts/transform-data.ts --input data/2024-10-23.csv --outDir out-speed-test >/dev/null
```

**Expected**: Processing time remains <10 seconds including all new body recomposition scoring features.

## Troubleshooting

### Common Issues

**Issue**: `postWorkoutOptimization` field missing from output
**Solution**: Check that product has both carbohydrate and protein data
```bash
jq 'select(.nutrition.carbs == null or .nutrition.protein == null) | .name' out-test/products.jsonl
```

**Issue**: `fatLossCompatibility` shows undefined values
**Solution**: Verify nutrition data has calories and existing satiety analysis
```bash
jq 'select(.nutrition.kcal == null or .satietyAnalysis == null) | {name, nutrition, satietyAnalysis}' out-test/products.jsonl
```

**Issue**: `enhancedCalorieEfficiency` not calculated
**Solution**: Check if product has sufficient data for multi-dimensional analysis
```bash
jq 'select(.enhancedCalorieEfficiency == null) | {name, nutrition, proteinOptimization, satietyAnalysis}' out-test/products.jsonl
```

**Issue**: `bodyCompositionContext` defaults not applied
**Solution**: Verify context application logic and multiplier validation
```bash
jq '.bodyCompositionContext.bodyCompositionPhase // "missing"' out-test/products.jsonl | sort | uniq -c
```

### Performance Issues

**Slow Processing**: Check if new scoring calculations are optimized (O(1) per product)
**High Memory**: Verify no data accumulation in scoring functions
**Inconsistent Results**: Ensure deterministic calculations and fixed random seeds

### Data Quality Validation

**Low Confidence Scores**: Review input data completeness for nutrition and ingredients
**Outlier Efficiency Scores**: Validate calculation bounds and clipping logic
**Context Mismatches**: Check multiplier application and conflict resolution logic

## Success Criteria

✅ **Functionality**: All new body recomposition scoring fields present in output
✅ **Compatibility**: Existing scoring fields unchanged and fully functional
✅ **Quality**: 100% test pass rate including new TDD-developed scoring features
✅ **Evidence-Based**: Post-workout ratios, fat loss thresholds, efficiency metrics scientifically validated
✅ **Personal Optimization**: Body recomposition context awareness working for Ali's goals

## Next Steps

After validation success:
1. **Context API**: Implement CLI flags for body composition phase and meal timing
2. **Frontend Integration**: Update React components to display contextual scoring
3. **Meal Planning**: Create recommendations optimized for specific body composition phases
4. **Progress Tracking**: Monitor effectiveness of contextual recommendations
5. **Advanced Context**: User preference learning and automatic context detection

---
*Feature complete when all validation scenarios pass and performance requirements met with full TDD coverage.*
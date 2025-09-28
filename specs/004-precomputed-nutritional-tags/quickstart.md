# Quickstart: Nutritional Tags Implementation

## Prerequisites
- Existing AH Netherlands CSV data transformer working
- Dutch localization features (T014-T023) implemented
- Vitest test framework configured
- Node.js TypeScript environment ready

## Development Workflow

### 1. Verify Current State
```bash
# Run existing tests to ensure baseline
npm test

# Transform Dutch fixture to see current output
node src/scripts/transform-data.ts --input tests/fixtures/sample-nl.csv --outDir out-test
```

### 2. Test-First Development (RED Phase)

#### Unit Tests
```bash
# Create failing unit tests
touch tests/unit/nutritional-tags.test.ts
touch tests/unit/parse-nutrition.test.ts

# Write failing tests for:
# - Net carbs calculation
# - Dutch ingredient classification
# - Macro-nutrient bucketing
# - Edge cases (missing data, invalid values)

npm test tests/unit/nutritional-tags.test.ts
# Should FAIL (red phase)
```

#### Integration Tests
```bash
# Create failing integration tests
touch tests/integration/nutritional-tags-end-to-end.test.ts

# Test full pipeline with Dutch fixture data
# Verify tags appear in products.jsonl output
# Check statistics tracking

npm test tests/integration/nutritional-tags-end-to-end.test.ts
# Should FAIL (red phase)
```

### 3. Implementation (GREEN Phase)

#### Type Definitions
```bash
# Extend Product interface
# File: src/data/transform/types.ts
# Add NutritionalTags interface and nutritionalTags field
```

#### Core Modules
```bash
# Create nutrition parsing module
touch src/data/transform/parseNutrition.ts

# Create nutritional tags computation module
touch src/data/transform/compute/computeNutritionalTags.ts

# Implement Dutch/EU standards and thresholds
# Implement dietary classification logic
```

#### Pipeline Integration
```bash
# Update transform-data.ts
# Add nutrition parsing after line 87
# Add tags computation before product finalization
# Include tags in output flow
```

### 4. Verification (GREEN Confirmation)
```bash
# Run tests - should now PASS
npm test

# Transform Dutch fixture with new features
node src/scripts/transform-data.ts --input tests/fixtures/sample-nl.csv --outDir out-test

# Verify output contains nutritional tags
cat out-test/products.jsonl | head -1 | jq '.nutritionalTags'

# Check statistics include new counters
cat out-test/stats.json | jq '.nutritionalTagsComputed'
```

### 5. Refactoring (REFACTOR Phase)
```bash
# Optimize performance
# Clean up code structure
# Add error handling
# Update documentation

# Re-run tests to ensure behavior preserved
npm test
```

## Expected Outputs

### Sample Product with Tags
```json
{
  "id": "123",
  "name": "Campina Halfvolle yoghurt vanillesmaak",
  "nutrition": {
    "kcal": 78,
    "carbs": 12.2,
    "fiber": 0,
    "protein": 3.1
  },
  "nutritionalTags": {
    "netCarbs": 12.2,
    "netCarbsBucket": "moderate",
    "lowCarb": false,
    "highProtein": false,
    "highFiber": false,
    "proteinDensity": "low",
    "lactoseFree": false,
    "glutenFree": true,
    "vegan": false,
    "vegetarian": true
  }
}
```

### Updated Statistics
```json
{
  "nutritionalTagsComputed": 847,
  "highProteinProducts": 23,
  "veganProducts": 156,
  "glutenFreeProducts": 342,
  "netCarbsDistribution": {
    "very_low": 45,
    "low": 123,
    "moderate": 234,
    "high": 287,
    "very_high": 158
  }
}
```

## Validation Steps

### 1. Functional Validation
- [ ] Net carbs calculated correctly (carbs - fiber)
- [ ] Dutch ingredient recognition working
- [ ] EU standards applied (6g fiber, 20g protein thresholds)
- [ ] Dietary classifications accurate
- [ ] Tags only on food products

### 2. Performance Validation
- [ ] Transform time increase <5%
- [ ] Memory usage within 150MB ceiling
- [ ] No performance regression on existing pipeline

### 3. Data Quality Validation
- [ ] Deterministic output (same input → same output)
- [ ] Missing data handled gracefully
- [ ] Edge cases covered (threshold boundaries)
- [ ] Dutch decimal comma notation supported

### 4. Integration Validation
- [ ] All existing tests still pass
- [ ] Schema documentation updated
- [ ] Statistics tracking working
- [ ] Output format backward compatible

## Troubleshooting

### Common Issues
1. **Tests failing**: Ensure RED-GREEN-Refactor cycle followed
2. **Performance regression**: Profile nutritional computation functions
3. **Incorrect Dutch classification**: Verify ingredient pattern matching
4. **Determinism issues**: Check decimal precision and rounding consistency

### Debug Commands
```bash
# Enable detailed logging
CLASSIFY_DEBUG=1 node src/scripts/transform-data.ts --input tests/fixtures/sample-nl.csv --outDir out-test --log json

# Run specific test with verbose output
npx vitest run tests/unit/nutritional-tags.test.ts --reporter=verbose

# Check memory usage
NODE_OPTIONS="--max-old-space-size=4096" node src/scripts/transform-data.ts --input tests/fixtures/sample-nl.csv --outDir out-test
```

## Success Criteria
✅ All 18 functional requirements from spec.md satisfied
✅ TDD methodology followed (RED-GREEN-Refactor)
✅ Performance impact <5%
✅ Dutch/EU standards compliance verified
✅ Backward compatibility maintained
✅ Constitutional principles upheld
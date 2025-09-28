# Test Contracts: Hybrid Nutrition Score

## Unit Test Contracts

### Nutri-Score Calculation Tests

```typescript
describe('computeNutriScore', () => {
  // Positive test cases
  it('should calculate correct score for typical product', () => {
    const nutrition = { kcal: 150, satFat: 2, sugars: 10, salt: 0.5, fiber: 3, protein: 8 };
    const result = computeNutriScore(nutrition, 'general');
    expect(result).toBe(-1); // Expected based on FSA algorithm
  });

  // Boundary conditions
  it('should handle minimum values correctly', () => {
    const nutrition = { kcal: 0, satFat: 0, sugars: 0, salt: 0, fiber: 0, protein: 0 };
    const result = computeNutriScore(nutrition, 'general');
    expect(result).toBe(0); // No negative or positive points
  });

  it('should handle maximum negative points', () => {
    const nutrition = { kcal: 4000, satFat: 15, sugars: 50, salt: 3, fiber: 0, protein: 0 };
    const result = computeNutriScore(nutrition, 'general');
    expect(result).toBe(40); // Maximum negative points, no positive
  });

  // Category-specific thresholds
  it('should apply beverage thresholds correctly', () => {
    const nutrition = { kcal: 100, satFat: 0, sugars: 20, salt: 0.1, fiber: 0, protein: 0 };
    const general = computeNutriScore(nutrition, 'general');
    const beverage = computeNutriScore(nutrition, 'beverages');
    expect(beverage).toBeLessThan(general); // Beverages have stricter energy thresholds
  });

  // Error conditions
  it('should return undefined for insufficient data', () => {
    const nutrition = { kcal: 150 }; // Missing required fields
    const result = computeNutriScore(nutrition, 'general');
    expect(result).toBeUndefined();
  });

  it('should handle negative nutrition values', () => {
    const nutrition = { kcal: -100, satFat: 2, sugars: 10, salt: 0.5 };
    const result = computeNutriScore(nutrition, 'general');
    expect(result).toBeUndefined(); // Invalid input
  });
});
```

### Percentile Ranking Tests

```typescript
describe('computePercentileRank', () => {
  it('should calculate correct percentile for sorted array', () => {
    const scores = [-5, -2, 0, 3, 8, 12, 15]; // 7 products
    expect(computePercentileRank(12, scores)).toBeCloseTo(0.857); // 6th out of 7
    expect(computePercentileRank(-5, scores)).toBeCloseTo(0.071); // 1st out of 7
    expect(computePercentileRank(8, scores)).toBeCloseTo(0.714); // 5th out of 7
  });

  it('should handle duplicate scores consistently', () => {
    const scores = [0, 0, 0, 5, 5, 10]; // 6 products with duplicates
    const rank1 = computePercentileRank(0, scores);
    const rank2 = computePercentileRank(0, scores);
    expect(rank1).toBe(rank2); // Deterministic
  });

  it('should handle edge cases', () => {
    const singleScore = [5];
    expect(computePercentileRank(5, singleScore)).toBe(0.5); // Single item

    const emptyArray: number[] = [];
    expect(() => computePercentileRank(5, emptyArray)).toThrow(); // Invalid input
  });
});
```

### Grade Assignment Tests

```typescript
describe('computeHealthGrade', () => {
  it('should assign grades correctly for 20% buckets', () => {
    expect(computeHealthGrade(0.9)).toBe('A'); // Top 10% -> A
    expect(computeHealthGrade(0.8)).toBe('A'); // 80th percentile (boundary)
    expect(computeHealthGrade(0.79)).toBe('B'); // Just below A threshold
    expect(computeHealthGrade(0.6)).toBe('B'); // 60th percentile (boundary)
    expect(computeHealthGrade(0.59)).toBe('C'); // Just below B threshold
    expect(computeHealthGrade(0.4)).toBe('C'); // 40th percentile (boundary)
    expect(computeHealthGrade(0.39)).toBe('D'); // Just below C threshold
    expect(computeHealthGrade(0.2)).toBe('D'); // 20th percentile (boundary)
    expect(computeHealthGrade(0.19)).toBe('E'); // Just below D threshold
    expect(computeHealthGrade(0.05)).toBe('E'); // Bottom 5%
  });

  it('should handle boundary conditions', () => {
    expect(computeHealthGrade(1.0)).toBe('A'); // Perfect score
    expect(computeHealthGrade(0.0)).toBe('E'); // Worst score
  });
});
```

## Integration Test Contracts

### Full Pipeline Tests

```typescript
describe('Hybrid Scoring Pipeline Integration', () => {
  it('should process complete dataset with dual scoring', async () => {
    const products = await loadFixture('sample-nutrition-data.csv');
    const scored = enhanceWithDualScoring(products);

    // Verify all products with nutrition get scores
    const nutritionProducts = products.filter(p => p.nutrition);
    const scoredProducts = scored.filter(p => p.nutriScore !== undefined);
    expect(scoredProducts.length).toBe(nutritionProducts.length);

    // Verify dual scoring consistency
    scoredProducts.forEach(product => {
      expect(product.globalHealthScore).toBeDefined();
      expect(product.globalHealthGrade).toBeDefined();
      if (product.categories?.length) {
        expect(product.categoryHealthScore).toBeDefined();
        expect(product.categoryHealthGrade).toBeDefined();
      }
    });
  });

  it('should maintain grade distribution within tolerance', async () => {
    const products = await loadFixture('large-dataset.csv'); // 1000+ products
    const scored = enhanceWithDualScoring(products);

    const grades = scored.map(p => p.globalHealthGrade).filter(Boolean);
    const distribution = {
      A: grades.filter(g => g === 'A').length / grades.length,
      B: grades.filter(g => g === 'B').length / grades.length,
      C: grades.filter(g => g === 'C').length / grades.length,
      D: grades.filter(g => g === 'D').length / grades.length,
      E: grades.filter(g => g === 'E').length / grades.length,
    };

    // Each grade should be approximately 20% (±2% tolerance)
    Object.values(distribution).forEach(percentage => {
      expect(percentage).toBeCloseTo(0.2, 1); // Within 10% relative error
    });
  });

  it('should handle category-relative scoring correctly', async () => {
    const products = await loadFixture('mixed-categories.csv');
    const scored = enhanceWithDualScoring(products);

    // Find products in same category with different global grades
    const yogurts = scored.filter(p =>
      p.categories?.includes('Yoghurt') && p.globalHealthGrade && p.categoryHealthGrade
    );

    // Verify category grades provide better differentiation
    const hasGradeDifference = yogurts.some(p =>
      p.globalHealthGrade !== p.categoryHealthGrade
    );
    expect(hasGradeDifference).toBe(true);
  });
});
```


### Constitutional Design Principles

**Determinism Guaranteed by Design** (No separate testing needed):
- Use integer arithmetic for Nutri-Score calculations (per FSA specification)
- Implement stable sorting with consistent tie-breaking (by product ID)
- Fixed decimal precision for health scores (1 decimal place maximum)
- Consistent JSON serialization with canonical field ordering

**Implementation Requirements**:
```typescript
// Built-in determinism through design
function computeNutriScore(nutrition: Nutrition): number {
  // FSA algorithm uses integer points only - no floating-point issues
  const negativePoints = Math.floor(energyPoints + satFatPoints + sugarPoints + sodiumPoints);
  const positivePoints = Math.floor(fiberPoints + proteinPoints + fruitsVegPoints);
  return negativePoints - positivePoints; // Always integer result
}

function rankProducts(products: Product[]): Product[] {
  // Stable sort with deterministic tie-breaking
  return products.sort((a, b) => {
    if (a.nutriScore !== b.nutriScore) return a.nutriScore - b.nutriScore;
    return String(a.id).localeCompare(String(b.id)); // Consistent tie-breaker
  });
}
```

## Contract Test Structure

### Test File Organization
```
tests/
├── contract/
│   ├── scoring-pipeline.contract.test.ts    # Full pipeline contracts
│   ├── nutri-score.contract.test.ts         # EU algorithm contracts
│   └── percentile-ranking.contract.test.ts  # Ranking contracts
├── integration/
│   ├── dual-scoring.integration.test.ts     # End-to-end scoring
│   └── grade-distribution.integration.test.ts # Grade balance validation
└── unit/
    ├── computeNutriScore.test.ts            # Individual function tests
    ├── computePercentileRank.test.ts        # Percentile calculations
    └── computeHealthGrade.test.ts           # Grade assignments
```

### Test Data Requirements
- **Minimal Dataset**: 10 products with varied nutrition profiles
- **Medium Dataset**: 100 products covering all categories
- **Large Dataset**: 1000+ products for distribution testing
- **Edge Cases**: Missing data, extreme values, identical scores
- **Real Data**: Subset of actual CSV for integration validation

### Failure Conditions
- **Test MUST fail initially** (RED phase of TDD)
- **All tests MUST pass** before implementation complete (GREEN phase)
- **Grade distribution MUST be approximately 20% per grade** (±2% tolerance)
- **Constitutional principles MUST be built into design** (not tested separately)
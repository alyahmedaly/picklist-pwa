# Scoring Pipeline Contract

## Function Signatures

### Core Scoring Functions

```typescript
/**
 * Calculate EU Nutri-Score using FSA nutrient profiling model
 * @param nutrition - Nutrition data per 100g
 * @param category - Product category for threshold adjustments
 * @returns Nutri-Score (-15 to +40) or undefined if insufficient data
 */
function computeNutriScore(
  nutrition: Nutrition,
  category?: string
): number | undefined;

/**
 * Calculate percentile rank within dataset
 * @param score - Individual product's Nutri-Score
 * @param allScores - Sorted array of all Nutri-Scores in dataset
 * @returns Percentile rank (0-1 scale)
 */
function computePercentileRank(
  score: number,
  allScores: number[]
): number;

/**
 * Convert percentile rank to health grade
 * @param percentile - Percentile rank (0-1 scale)
 * @returns Health grade (A-E) using equal 20% distribution
 */
function computeHealthGrade(percentile: number): HealthGrade;

/**
 * Convert percentile rank to health score
 * @param percentile - Percentile rank (0-1 scale)
 * @returns Health score (0-100 scale) with 1 decimal precision
 */
function computeHealthScore(percentile: number): number;
```

### Pipeline Integration Functions

```typescript
/**
 * Enhance products with dual scoring (global + category)
 * @param products - Array of products with nutrition data
 * @returns Products enhanced with scoring fields
 */
function enhanceWithDualScoring(products: Product[]): Product[];

/**
 * Two-pass scoring pipeline
 * Pass 1: Calculate Nutri-Scores, Pass 2: Apply percentile ranking
 */
interface ScoringPipeline {
  /**
   * Pass 1: Calculate all Nutri-Scores and collect for percentile computation
   * @param products - Products with nutrition data
   * @returns Products with nutriScore field populated
   */
  calculateNutriScores(products: Product[]): Product[];

  /**
   * Pass 2: Apply percentile ranking and grade assignment
   * @param products - Products with nutriScore field
   * @returns Products with full scoring fields
   */
  applyPercentileRanking(products: Product[]): Product[];
}
```

## Input/Output Contracts

### Input Requirements

```typescript
// Minimum required nutrition data for scoring
interface RequiredNutrition {
  kcal?: number;      // Energy (required for Nutri-Score)
  satFat?: number;    // Saturated fat (required)
  sugars?: number;    // Sugars (required)
  salt?: number;      // Salt (required, converted to sodium)
  fiber?: number;     // Fiber (optional, improves score)
  protein?: number;   // Protein (optional, improves score)
}

// Category mapping for Nutri-Score thresholds
type NutriScoreCategory = 'general' | 'beverages' | 'cheese' | 'fats';
```

### Output Guarantees

```typescript
// Product output with scoring (all fields optional for graceful degradation)
interface ScoredProduct extends Product {
  // EU base score
  nutriScore?: number;              // Range: -15 to +40, integer

  // Global ranking (against all products)
  globalHealthScore?: number;       // Range: 0-100, max 1 decimal
  globalHealthGrade?: HealthGrade;  // 'A' | 'B' | 'C' | 'D' | 'E'

  // Category ranking (against same category)
  categoryHealthScore?: number;     // Range: 0-100, max 1 decimal
  categoryHealthGrade?: HealthGrade;// 'A' | 'B' | 'C' | 'D' | 'E'
}

// Statistics output enhancement
interface ScoringStats {
  // Scoring coverage
  totalProducts: number;
  productsWithScores: number;
  scoringCoverage: number;          // Percentage with scores

  // Global distribution
  globalGradeDistribution: {
    A: number; B: number; C: number; D: number; E: number;
  };

  // Category distributions
  categoryGradeDistributions: Map<string, {
    A: number; B: number; C: number; D: number; E: number;
  }>;

  // Score ranges
  nutriScoreRange: { min: number; max: number };
  healthScoreRange: { min: number; max: number };
}
```

## Error Handling Contract

### Graceful Degradation Rules

```typescript
// Missing nutrition data
if (!nutrition || insufficient data) {
  // Skip scoring fields entirely (undefined)
  // Product still processed for other fields
  // No error thrown
}

// Invalid nutrition values
if (nutrition.kcal < 0 || nutrition.satFat < 0) {
  // Skip scoring for this product
  // Log warning in structured format
  // Continue processing other products
}

// Empty dataset
if (products.length === 0) {
  // Return empty array
  // No percentile calculations performed
  // Stats show zero coverage
}
```

### Validation Requirements

```typescript
// Pre-condition validation
function validateScoringInput(products: Product[]): ValidationResult {
  return {
    hasNutrition: number;       // Count of products with nutrition
    hasCategories: number;          // Count with category data
    canCalculateScores: number;     // Count with sufficient data
    warnings: string[];             // Non-fatal issues
    errors: string[];               // Fatal issues
  };
}

// Post-condition validation
function validateScoringOutput(products: ScoredProduct[]): ValidationResult {
  return {
    scoringConsistency: boolean;    // All scores have matching grades
    gradeDistribution: boolean;     // Approximately 20% per grade
    deterministicOutput: boolean;   // Identical input produces identical output
  };
}
```

## Performance Contract

### Determinism Requirements
- **Identical Input**: Same CSV + flags → byte-identical scoring output
- **Stable Sorting**: Products with identical nutriScores get consistent ranking
- **Precision**: Fixed decimal places prevent floating-point variations

## Integration Contract

### CLI Extension
```bash
# Existing CLI remains unchanged
node src/scripts/transform-data.ts --input data.csv --outDir out

# Scoring is automatically applied when nutrition data available
# No new flags required (constitutional simplicity)
```

### Output File Extensions
```jsonl
// products.jsonl (enhanced with scoring fields)
{"id":"123","name":"Yogurt",...,"nutriScore":-2,"globalHealthScore":85.0,"globalHealthGrade":"A","categoryHealthScore":65.0,"categoryHealthGrade":"C"}
```

```json
// stats.json (enhanced with scoring statistics)
{
  "rows": 30000,
  "scoringStats": {
    "totalProducts": 30000,
    "productsWithScores": 28500,
    "scoringCoverage": 95.0,
    "globalGradeDistribution": {"A": 6000, "B": 6000, "C": 6000, "D": 5700, "E": 4800}
  }
}
```

### Backward Compatibility
- **Existing Fields**: No changes to existing Product interface fields
- **Optional Fields**: All scoring fields optional, existing consumers unaffected
- **File Formats**: Same JSONL structure, enhanced with additional fields
- **CLI Interface**: No breaking changes to command-line interface
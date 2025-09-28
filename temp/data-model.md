# Data Model: Personal Health Extensions

**Feature**: Extensions to hybrid nutrition scoring system
**Date**: 2025-09-18
**Context**: New scoring objects appended to existing Product interface

## Entity Extensions

### 1. HalalAnalysis Interface

**Purpose**: Structured Halal compliance detection and confidence assessment

```typescript
interface HalalAnalysis {
  /** Overall Halal compliance status */
  status: 'halal' | 'haram' | 'questionable' | 'unknown';
  
  /** Specific compliance flags */
  flags: {
    /** Contains animal-derived gelatin (E441, etc.) */
    hasAnimalGelatine: boolean;
    /** Contains alcohol or alcohol-derived ingredients */
    hasAlcohol: boolean;
    /** Contains pork or pork-derived ingredients */
    hasPork: boolean;
    /** Contains non-Halal meat sources */
    hasNonHalalMeat: boolean;
    /** Contains E-numbers with doubtful Halal status */
    hasDoubtfulAdditives: boolean;
  };
  
  /** Detailed analysis results */
  details: {
    /** Specific ingredients flagged as problematic */
    problematicIngredients: string[];
    /** E-numbers with Halal concerns */
    eNumberConcerns: string[];
    /** Alcohol percentage if detected */
    alcoholContent?: number;
  };
  
  /** Confidence level in the analysis */
  confidence: 'high' | 'medium' | 'low';
}
```

**Validation Rules**:
- `status` must be one of the four defined values
- `flags` all required as boolean values
- `problematicIngredients` and `eNumberConcerns` are arrays (can be empty)
- `alcoholContent` only present when `hasAlcohol` is true
- `confidence` based on ingredient parsing completeness and E-number database coverage

**State Transitions**:
- `unknown` → `halal`/`haram`/`questionable` based on analysis results
- Confidence degrades with incomplete ingredient information
- E-number detection increases confidence when present

### 2. ProteinScoring Interface

**Purpose**: Protein density optimization for Ali's 170g daily target

```typescript
interface ProteinScoring {
  /** Protein optimization score (0-100, higher = better for protein goals) */
  proteinDensityScore: number;
  
  /** Protein content per 100g */
  proteinContribution: number;
  
  /** Percentage of daily 170g target per typical serving */
  targetContribution: number;
}
```

**Validation Rules**:
- `proteinDensityScore`: 0-100 range, 1 decimal precision max
- `proteinContribution`: Direct from nutrition.protein field (grams per 100g)
- `targetContribution`: 0-100 percentage, based on realistic serving sizes

**Calculation Logic**:
- `proteinDensityScore` = protein per calorie ratio, scaled 0-100 against dataset
- `targetContribution` = (serving_protein / 170g) × 100
- Serving size estimation from existing unit parsing or category defaults

### 3. SatietyIntelligence Interface

**Purpose**: Evidence-based satiety scoring using Satiety Index research

```typescript
interface SatietyIntelligence {
  /** Overall satiety score (0-100, higher = more satiating per calorie) */
  satietyScore: number;
  
  /** Breakdown of satiety contributing factors */
  satietyFactors: {
    /** Protein contribution to satiety (0-100) */
    proteinFactor: number;
    /** Fiber contribution to satiety (0-100) */
    fiberFactor: number;
    /** Food volume/water contribution (0-100) */
    volumeFactor: number;
    /** Processing level penalty (0-100, lower = more processed) */
    processingPenalty: number;
  };
  
  /** Expected satiety duration in minutes per 100kcal */
  expectedSatietyDuration: number;
  
  /** Calorie efficiency for satiety (lower = more efficient) */
  caloriePerSatietyRatio: number;
}
```

**Validation Rules**:
- All scores: 0-100 range, 1 decimal precision max
- `expectedSatietyDuration`: positive integer, minutes
- `caloriePerSatietyRatio`: positive number, calculated metric

**Calculation Methodology**:
- Based on Holt et al. (1995) Satiety Index research
- `proteinFactor` = protein content × protein satiety coefficient
- `fiberFactor` = fiber content × fiber satiety coefficient  
- `volumeFactor` = estimated from food category and water content
- `processingPenalty` = based on NOVA-like classification from ingredient analysis
- `satietyScore` = weighted combination of factors minus processing penalty

## Product Interface Extensions

### Updated Product Interface

```typescript
interface Product {
  // ... existing fields preserved exactly ...
  
  // Hybrid Nutrition Scoring (existing)
  nutriScore?: number;
  globalHealthScore?: number;
  globalHealthGrade?: HealthGrade;
  categoryHealthScore?: number;
  categoryHealthGrade?: HealthGrade;
  
  // Personal Health Extensions (new)
  halalCheck?: HalalAnalysis;
  proteinOptimization?: ProteinScoring;
  satietyAnalysis?: SatietyIntelligence;
}
```

**Backward Compatibility**:
- All new fields are optional (`?`)
- Existing field order and types unchanged
- No modification to existing scoring logic
- New fields only populated when sufficient data available

## Data Relationships

### Dependencies

**HalalAnalysis depends on**:
- `ingredients` field (Dutch ingredient parsing)
- `additiveInfo.eNumbers` (existing E-number detection)
- Category classification for context-specific rules

**ProteinScoring depends on**:
- `nutrition.protein` (required for calculation)
- `unit` field (for serving size estimation)
- Product category (for serving defaults)

**SatietyIntelligence depends on**:
- `nutrition.protein` and `nutrition.fiber` (satiety factors)
- `nutrition.kcal` (efficiency calculations)
- `additiveInfo.totalAdditives` (processing level estimation)
- Ingredient complexity (from `ingredientInfo.total`)

### Cross-Field Interactions

**Protein optimization ↔ Satiety analysis**:
- Both use protein content but for different purposes
- High protein typically correlates with higher satiety scores
- Protein density score may influence satiety protein factor

**Halal analysis ↔ Existing additive flags**:
- Leverages existing `additiveFlags.hasAnimalDerivedAdditives`
- Cross-references with `additiveInfo.eNumbers` database
- May influence confidence levels based on additive detection quality

## Performance Considerations

### Calculation Complexity

**Per Product**:
- HalalAnalysis: O(1) - leverages existing E-number analysis
- ProteinScoring: O(1) - simple calculations on nutritional data
- SatietyIntelligence: O(1) - weighted formula application

**Dataset Level**:
- No percentile ranking needed (unlike hybrid nutrition scoring)
- No cross-product dependencies
- Can be calculated independently per product

### Memory Impact

**Additional Memory Per Product**:
- HalalAnalysis: ~200-400 bytes (strings + flags)
- ProteinScoring: ~50 bytes (3 numbers)
- SatietyIntelligence: ~150 bytes (nested numbers)
- Total: ~400-600 bytes per product additional

**For 30k Products**: ~12-18MB additional memory (well within 150MB constitutional limit)

## Error Handling

### Missing Data Scenarios

**Insufficient nutritional data**:
- `proteinOptimization` and `satietyAnalysis` → undefined
- Graceful degradation, product still processed
- Stats tracking for coverage reporting

**Incomplete ingredient data**:
- `halalCheck.confidence` → 'low'
- `halalCheck.status` may be 'unknown'
- Documented in details for transparency

**Invalid data ranges**:
- Negative protein values → skip scoring
- Extreme outliers → log warnings, cap values
- Maintain data integrity

### Validation Rules

**Field Constraints**:
- All scores: 0-100 range enforcement
- Confidence levels: enum validation
- Required fields within interfaces: strict typing
- Array fields: never null, empty arrays allowed

**Business Rules**:
- Halal status logic: strict adherence to Islamic dietary guidelines
- Protein targets: realistic serving size assumptions
- Satiety factors: evidence-based coefficient application

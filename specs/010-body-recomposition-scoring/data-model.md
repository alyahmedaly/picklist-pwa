# Data Model: Body Recomposition Scoring Enhancement

**Phase 1**: Design & Contracts | **Date**: 2025-09-19

## Entity Extensions

The body recomposition scoring feature extends the existing `Product` interface with four new optional scoring entities, maintaining full backward compatibility.

### PostWorkoutScore

Measures product suitability for post-workout recovery nutrition.

**Fields**:
- `postWorkoutScore: number` - Overall post-workout suitability (0-100 scale)
- `carbProteinRatio: number` - Carbs to protein ratio (optimal: 2:1 to 4:1)
- `glycemicBoost: number` - Multiplier for high-GI carbs (1.0-1.5)
- `recoveryWindow: 'immediate' | 'delayed' | 'general'` - Timing suitability
- `confidence: 'high' | 'medium' | 'low'` - Data quality indicator

**Validation Rules**:
- `postWorkoutScore` range: 0-100
- `carbProteinRatio` minimum: 0 (products without carbs/protein get 0)
- `glycemicBoost` range: 1.0-1.5
- `recoveryWindow` required if score > 0
- `confidence` required if score > 0

**State Transitions**:
- Products with both carbs and protein → calculate ratio and GI boost
- Products missing macronutrient data → low confidence, general window
- Products with high protein but no carbs → delayed recovery scoring

### FatLossScore

Evaluates product alignment with fat loss goals through satiation efficiency.

**Fields**:
- `fatLossScore: number` - Fat loss compatibility (0-100 scale)
- `calorieDensity: number` - kcal per 100g
- `calorieDensityClass: 'low' | 'moderate' | 'high'` - Density classification
- `satietyEfficiency: number` - Satiety per calorie ratio
- `volumeAdvantage: boolean` - High volume, low calorie benefit
- `confidence: 'high' | 'medium' | 'low'` - Data quality indicator

**Validation Rules**:
- `fatLossScore` range: 0-100
- `calorieDensity` minimum: 0
- `calorieDensityClass` thresholds: low (<125), moderate (125-225), high (>225)
- `satietyEfficiency` minimum: 0
- `volumeAdvantage` true if calories <100 kcal/100g and high fiber/water
- `confidence` required

**State Transitions**:
- Products with nutrition data → calculate density class and efficiency
- Products with high satiety + low calories → volume advantage true
- Products missing satiety data → use category-based estimates

### CalorieEfficiencyScore

Multi-dimensional nutritional efficiency beyond basic calorie-to-nutrient ratios.

**Fields**:
- `efficiencyScore: number` - Overall efficiency (0-100 scale)
- `proteinEfficiency: number` - Protein per calorie optimization (0-100)
- `satietyEfficiency: number` - Satiety per calorie optimization (0-100)
- `micronutrientDensity: number` - Estimated micronutrient richness (0-100)
- `thermicEffect: number` - Metabolic cost bonus (0-20)
- `processingPenalty: number` - NOVA-based processing penalty (0-30)
- `confidence: 'high' | 'medium' | 'low'` - Data quality indicator

**Validation Rules**:
- All score fields range: 0-100 (except thermicEffect: 0-20, processingPenalty: 0-30)
- `efficiencyScore` = weighted combination of sub-scores
- `micronutrientDensity` estimated from ingredient complexity and food category
- `thermicEffect` based on macronutrient composition (protein highest)
- `processingPenalty` from existing NOVA classification if available
- `confidence` based on data completeness

**State Transitions**:
- Products with complete nutrition → high confidence, full calculation
- Products with partial data → medium confidence, estimated values
- Highly processed products (NOVA 4) → maximum processing penalty

### BodyCompositionContext

Context-aware scoring adjustments based on body composition goals and meal timing.

**Fields**:
- `bodyCompositionPhase: 'cutting' | 'bulking' | 'maintenance' | 'recomposition'` - User goal
- `mealTiming: 'pre_workout' | 'post_workout' | 'general'` - Temporal context
- `contextMultipliers: ContextMultipliers` - Applied scoring adjustments
- `recommendationPriority: 'protein' | 'satiety' | 'efficiency' | 'recovery'` - Primary focus
- `conflictResolution: 'prioritize_goal' | 'balanced' | 'context_specific'` - Conflict handling

**ContextMultipliers Sub-entity**:
- `proteinScoreMultiplier: number` - Protein score adjustment (0.5-2.0)
- `satietyScoreMultiplier: number` - Satiety score adjustment (0.5-2.0)
- `postWorkoutMultiplier: number` - Post-workout score adjustment (0.5-2.0)
- `fatLossMultiplier: number` - Fat loss score adjustment (0.5-2.0)
- `efficiencyMultiplier: number` - Efficiency score adjustment (0.5-2.0)

**Validation Rules**:
- All phases supported: cutting, bulking, maintenance, recomposition
- All timing contexts supported: pre_workout, post_workout, general
- Multiplier range: 0.5-2.0 (50% reduction to 200% boost)
- Default context: recomposition + general for backward compatibility
- Context combinations must be logically consistent

**State Transitions**:
- Cutting phase → boost fat loss and efficiency multipliers

## Status Semantics

**Purpose**: Define when scores are undefined vs present, and distinguish between computed vs estimated values

### Score Availability States

**MISSING_DATA**: Score field is `undefined`
- **Cause**: Insufficient nutrition data or ingredient information
- **Behavior**: Field completely omitted from Product interface
- **Examples**:
  - `postWorkoutOptimization` undefined when carbs or protein missing
  - `fatLossCompatibility` undefined when calories missing
  - `enhancedCalorieEfficiency` undefined when no macronutrient data

**ESTIMATED**: Score present but marked as estimated
- **Cause**: Score computed using category-based estimates or incomplete data
- **Behavior**: Score present with confidence < 70%
- **Examples**:
  - Glycemic index estimated from food category instead of ingredient analysis
  - Micronutrient density estimated from category (fruits=high) vs actual analysis
  - Thermic effect estimated from macro ratios when detailed protein quality unknown

**COMPUTED**: Score present with high confidence
- **Cause**: Score calculated from complete, directly measured data
- **Behavior**: Score present with confidence ≥ 70%
- **Examples**:
  - Post-workout score calculated from actual carb:protein ratios
  - Fat loss score calculated from actual calorie density measurements
  - Efficiency score calculated from complete nutritional profile

### Data Completeness Rules

**Minimum Data Requirements**:
```typescript
// PostWorkoutScore - requires both macros
const hasMinData = product.nutrition?.carbs !== undefined &&
                   product.nutrition?.protein !== undefined;

// FatLossScore - requires calories and existing satiety
const hasMinData = product.nutrition?.kcal !== undefined &&
                   product.satietyAnalysis?.satietyScore !== undefined;

// CalorieEfficiencyScore - requires calories and protein
const hasMinData = product.nutrition?.kcal !== undefined &&
                   product.nutrition?.protein !== undefined;

// BodyCompositionContext - always computable (uses defaults)
const hasMinData = true; // Never undefined
```

**Data Quality Tiers**:
1. **Complete Data** (confidence 90-100%): All nutrition fields + ingredient analysis
2. **Good Data** (confidence 70-89%): Core nutrition + partial ingredients
3. **Partial Data** (confidence 50-69%): Basic macros + category estimates
4. **Insufficient Data** (confidence <50%): Score marked as MISSING_DATA

### Confidence Calculation Formula

**Base Confidence**:
```typescript
baseConfidence = (availableFields / requiredFields) × 100;
```

**Quality Penalties**:
- Missing ingredients list: -10 points
- Category-based estimates: -15 points
- Incomplete macronutrient profile: -20 points
- No fiber data (for satiety): -5 points
- NOVA classification unknown: -5 points

**Quality Bonuses**:
- Complete ingredient analysis available: +5 points
- Multiple data sources corroborate: +5 points
- Recent/verified nutritional data: +3 points

**Final Confidence**:
```typescript
finalConfidence = Math.max(0, Math.min(100,
  baseConfidence + qualityBonuses - qualityPenalties
));
```

### Error Handling Standards

**Graceful Degradation**:
- Individual score failures don't prevent other scores from computing
- Scores degrade to estimates before becoming undefined
- Context multipliers always computed (using safe defaults)

**Data Sanity Validation Rules**:

*Macro-Calorie Reconciliation*:
```typescript
// Rule 1: Calorie consistency check (±10% tolerance)
const macroCalories = (protein × 4) + (carbs × 4) + (fat × 9);
const tolerance = 0.10;
const isValid = Math.abs(macroCalories - statedCalories) <= (statedCalories × tolerance);

// Rule 2: Individual macro bounds
const proteinValid = protein × 4 <= statedCalories × 1.1; // Max protein calories + tolerance
const carbsValid = carbs × 4 <= statedCalories × 1.1;     // Max carb calories + tolerance
const fatValid = fat × 9 <= statedCalories × 1.1;        // Max fat calories + tolerance

// Rule 3: Macro coverage (macros should explain most calories)
const macroAccounting = macroCalories / statedCalories;
const coverageValid = macroAccounting >= 0.80 && macroAccounting <= 1.20;
```

*Nutritional Logic Validation*:
```typescript
// Rule 4: Protein density bounds (physiological limits)
const proteinDensity = (protein / 100) × 100; // g per 100g
const proteinDensityValid = proteinDensity >= 0 && proteinDensity <= 95; // Max ~95g/100g

// Rule 5: Calorie density physics (theoretical maximum ~900 kcal/100g for pure fat)
const calorieDensity = (kcal / 100) × 100; // kcal per 100g
const densityValid = calorieDensity >= 0 && calorieDensity <= 900;

// Rule 6: Fiber bound checks (cannot exceed total carbs)
const fiberValid = !fiber || (fiber <= (carbs || Infinity));
```

*Scoring Dependency Validation*:
```typescript
// Rule 7: Required scores for dependent calculations
const satietyRequired = product.satietyAnalysis?.satietyScore !== undefined &&
                       product.satietyAnalysis.satietyScore >= 0 &&
                       product.satietyAnalysis.satietyScore <= 100;

// Rule 8: Context multiplier bounds
const multipliersValid = Object.values(contextMultipliers).every(m =>
  m >= 0.5 && m <= 2.0
);

// Rule 9: Confidence score validity
const confidenceValid = confidence >= 0 && confidence <= 100;
```

*Data Quality Flags*:
```typescript
// Applied when validation fails but score still computable
type QualityFlag =
  | 'ESTIMATED_CALORIES'      // Calories estimated from macros due to mismatch
  | 'CAPPED_PROTEIN'          // Protein capped at physiological maximum
  | 'INCOMPLETE_MACROS'       // Missing fat data, estimated from remaining calories
  | 'CATEGORY_FALLBACK'       // Used food category for missing ingredient data
  | 'LOW_CONFIDENCE'          // Confidence below 50%, treat as estimate
  | 'DEPENDENCY_MISSING'      // Required score (e.g., satiety) not available
```

**Validation Error Types**:
```typescript
type ValidationError =
  | 'MACRO_CALORIE_MISMATCH'     // Macros don't add up to stated calories
  | 'IMPOSSIBLE_NUTRITION'       // Protein > total calories, etc.
  | 'MISSING_DEPENDENCY'         // Need satiety score for fat loss
  | 'CATEGORY_UNKNOWN'           // Required for glycemic index estimation
  | 'CALCULATION_OVERFLOW'       // Mathematical bounds exceeded
```

**Recovery Strategies**:
- **MACRO_CALORIE_MISMATCH**: Use stated calories, estimate missing macro
- **IMPOSSIBLE_NUTRITION**: Cap impossible values at theoretical maximums
- **MISSING_DEPENDENCY**: Return undefined for dependent score
- **CATEGORY_UNKNOWN**: Use neutral category assumptions
- **CALCULATION_OVERFLOW**: Apply algorithm bounds and continue
- Bulking phase → boost protein and recovery multipliers
- Post-workout timing → boost recovery and protein multipliers
- Conflicting optimizations → apply resolution strategy

## Product Interface Extensions

### Enhanced Product Interface

```typescript
export interface Product {
  // ... existing fields (id, name, price, nutrition, etc.)

  // Existing scoring (already implemented)
  proteinOptimization?: ProteinScoring;
  satietyAnalysis?: SatietyIntelligence;
  halalCheck?: HalalAnalysis;

  // New body recomposition scoring (this feature)
  postWorkoutOptimization?: PostWorkoutScore;
  fatLossCompatibility?: FatLossScore;
  enhancedCalorieEfficiency?: CalorieEfficiencyScore;
  bodyCompositionContext?: BodyCompositionContext;
}
```

### Backward Compatibility Guarantees

**Existing Products**: All existing products continue to function without new fields (optional fields)

**Existing Tests**: All existing tests pass without modification

**Existing Output**: Products without sufficient data for new scoring remain unchanged

**API Stability**: No breaking changes to existing JSON schema or CLI interface

## Relationships and Dependencies

### Data Dependencies

**PostWorkoutScore** depends on:
- `nutrition.carbs` - Carbohydrate content
- `nutrition.protein` - Protein content
- `ingredients` - For glycemic index estimation
- `categories` - For food type classification

**FatLossScore** depends on:
- `nutrition.kcal` - Calorie density calculation
- `satietyAnalysis.satietyScore` - Existing satiety analysis
- `nutrition.fiber` - Volume advantage calculation
- `ingredients` - Water content estimation

**CalorieEfficiencyScore** depends on:
- `proteinOptimization` - Existing protein efficiency
- `satietyAnalysis` - Existing satiety efficiency
- `additiveInfo.totalAdditives` - Processing penalty via NOVA
- `ingredients` - Natural ingredient complexity
- `categories` - Micronutrient density estimation

**BodyCompositionContext** depends on:
- User preference (defaults to recomposition + general)
- Meal timing context (API or user input)
- All other scoring results for multiplier application

### Calculation Order Dependencies

1. **Base Scoring** (existing): protein optimization, satiety analysis
2. **Enhanced Scoring** (new): post-workout, fat loss, calorie efficiency
3. **Context Application** (new): body composition multipliers applied to all scores
4. **Final Integration**: Updated statistics and summary generation

### Error Handling and Graceful Degradation

**Missing Nutrition Data**:
- Post-workout scoring: Skip products without carbs or protein
- Fat loss scoring: Use category-based calorie estimates if available
- Efficiency scoring: Reduce confidence, use partial calculations

**Missing Ingredient Data**:
- Post-workout scoring: Use category-based GI estimates
- Fat loss scoring: Skip volume advantage calculation
- Efficiency scoring: Reduce micronutrient density estimation

**Invalid Context Data**:
- Body composition context: Fall back to recomposition + general defaults
- Multiplier validation: Clamp to valid ranges (0.5-2.0)
- Conflict resolution: Default to balanced approach

## Performance Characteristics

### Memory Usage
- Each new scoring entity adds ~200 bytes per product
- Total overhead: ~800 bytes × 30k products = ~24MB additional memory
- Well within 150MB constitutional limit

### Processing Time
- Each scoring calculation: O(1) per product
- No additional data loading or external lookups required
- Estimated additional processing: ~1-2 seconds for 30k products
- Well within 10-second constitutional limit

### Data Quality Impact
- Products with complete nutrition data: High confidence scoring
- Products with partial data: Medium confidence with estimates
- Products with minimal data: Low confidence or skip scoring
- No products become unusable due to missing data

## Integration Points

### Statistics Integration
- Add body recomposition scoring stats to existing stats accumulator
- Track scoring coverage, confidence distribution, context usage
- Maintain existing stats format for backward compatibility

### Output Format Integration
- Add new fields to existing JSONL output format
- Maintain deterministic field ordering
- Add new fields to products-index.json for frontend consumption
- Update schema.md documentation automatically

### CLI Integration
- No new CLI flags required (integrated into existing transform pipeline)
- Optional future enhancement: context flags (--cutting, --post-workout)
- Maintain existing --log and --format options

### Frontend Integration
- New scoring fields available in React components
- Context-aware product recommendations
- Enhanced sorting and filtering options
- Progressive enhancement (works without new fields)
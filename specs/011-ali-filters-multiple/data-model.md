# Data Model: Ali Filters + Multiple Outputs

**Phase**: 1 | **Date**: 2025-01-19 | **Status**: Complete

## Core Entities

### FilterCriteria
Configuration object defining filter parameters and thresholds.

**Fields**:
- `halal?: HalalFilterCriteria` - Halal compliance requirements
- `protein?: ProteinFilterCriteria` - Protein optimization parameters
- `postWorkout?: PostWorkoutFilterCriteria` - Post-workout nutrition requirements
- `fatLoss?: FatLossFilterCriteria` - Fat loss compatibility parameters
- `budget?: BudgetFilterCriteria` - Budget optimization constraints
- `context?: ContextFilterCriteria` - Training vs rest day context

**Validation Rules**:
- At least one filter criterion must be specified
- Numeric thresholds must be positive values
- Budget constraints must have realistic euro amounts

### HalalFilterCriteria
**Fields**:
- `strict: boolean` - Require confirmed halal vs allow questionable
- `excludeAlcohol: boolean` - Exclude products with alcohol content
- `excludeGelatine: boolean` - Exclude products with animal gelatine
- `additiveWhitelist?: string[]` - Allowed E-numbers for less strict filtering

**Validation Rules**:
- `strict` defaults to `true` for Ali's requirements
- E-numbers in whitelist must be valid format (E followed by digits)

### ProteinFilterCriteria
**Fields**:
- `minProteinPer100g: number` - Minimum protein content (default: 20g)
- `minEfficiencyScore?: number` - Minimum protein efficiency score (0-100)
- `targetDailyAmount: number` - Daily protein target (default: 170g for Ali)
- `preferredSources?: string[]` - Preferred protein source categories

**Validation Rules**:
- `minProteinPer100g` must be > 0 and < 100
- `minEfficiencyScore` must be 0-100 if specified
- `targetDailyAmount` must be > 0

### PostWorkoutFilterCriteria
**Fields**:
- `maxCarbProteinRatio: number` - Maximum carb:protein ratio (default: 4.0)
- `minCarbProteinRatio: number` - Minimum carb:protein ratio (default: 2.0)
- `preferHighGI: boolean` - Prefer high glycemic index foods
- `recoveryWindow: 'immediate' | 'moderate' | 'extended'` - Recovery timing

**Validation Rules**:
- `maxCarbProteinRatio` > `minCarbProteinRatio`
- Both ratios must be > 0

### FatLossFilterCriteria
**Fields**:
- `maxCaloriesPer100g: number` - Maximum calorie density (default: 125)
- `minSatietyScore?: number` - Minimum satiety score (0-100)
- `preferHighVolume: boolean` - Prefer foods with volume advantage
- `targetDeficit?: number` - Target calorie deficit for portion calculations

**Validation Rules**:
- `maxCaloriesPer100g` must be > 0
- `minSatietyScore` must be 0-100 if specified

### BudgetFilterCriteria
**Fields**:
- `maxPricePerUnit?: number` - Maximum price per 100g/100ml (euros)
- `optimizeProteinPerEuro: boolean` - Optimize for protein efficiency per euro
- `maxTotalBudget?: number` - Maximum total budget for daily protein
- `preferredStores?: string[]` - Preferred store chains (AH, Jumbo)

**Validation Rules**:
- Price values must be > 0 if specified
- Store names must be valid Dutch supermarket chains

### ContextFilterCriteria
**Fields**:
- `isTrainingDay: boolean` - Training vs rest day context
- `targetCalories: number` - Daily calorie target (2000 training, 1750 rest)
- `targetCarbs: number` - Daily carb target (220g training, 120g rest)
- `mealTiming?: 'pre_workout' | 'post_workout' | 'general'` - Meal context
- `avoidCombinations?: string[]` - Avoided food combinations (e.g., "tuna+rice")

**Validation Rules**:
- Calorie and carb targets must align with Ali's documented preferences
- Training day values: 2000 kcal, 220g carbs
- Rest day values: 1750 kcal, 120g carbs

## Output Entities

### FilteredProduct
Standard Product object with additional filtering metadata.

**Fields**:
- `...Product` - All existing product fields maintained
- `filterMatch: FilterMatchIndicators` - Which filters matched
- `filterScore?: number` - Relevance score for ranking (0-100)
- `portionRecommendation?: PortionInfo` - Realistic serving size info

**Relationships**:
- Extends existing `Product` interface
- Contains all existing scoring fields (halal, protein, postWorkout, fatLoss, etc.)

### FilterMatchIndicators
**Fields**:
- `halal?: boolean` - Matched halal criteria
- `protein?: boolean` - Matched protein criteria
- `postWorkout?: boolean` - Matched post-workout criteria
- `fatLoss?: boolean` - Matched fat-loss criteria
- `budget?: boolean` - Matched budget criteria
- `context?: boolean` - Matched context criteria

### PortionInfo
**Fields**:
- `servingSize: number` - Realistic serving size (grams/ml)
- `servingUnit: string` - Unit description ("200g bowl", "150g portion")
- `macrosPerServing: MacroInfo` - Nutrition per realistic serving
- `costPerServing?: number` - Price per serving if available

### FilterStatistics
Metrics for filter performance and data coverage.

**Fields**:
- `totalProducts: number` - Total products processed
- `filteredProducts: number` - Products matching all criteria
- `coveragePercentage: number` - Percentage of total matched
- `excludedReasons: Record<string, number>` - Reason → count mapping
- `dataQuality: DataQualityMetrics` - Completeness metrics
- `filterSpecific: FilterSpecificStats` - Per-filter statistics

### DataQualityMetrics
**Fields**:
- `completeNutrition: number` - Products with complete nutrition data
- `completePricing: number` - Products with pricing data
- `completeIngredients: number` - Products with ingredient data
- `completeScoring: number` - Products with all scoring fields

### FilterSpecificStats
**Fields**:
- `halalCoverage?: number` - Products with halal analysis
- `proteinCoverage?: number` - Products with protein scoring
- `postWorkoutCoverage?: number` - Products with post-workout scoring
- `fatLossCoverage?: number` - Products with fat-loss scoring

## State Transitions

### Filter Processing Flow
1. **Input Validation**: Validate FilterCriteria against rules
2. **Product Loading**: Load products with existing scoring data
3. **Filter Application**: Apply each criterion with boolean AND logic
4. **Statistics Generation**: Count matches and exclusions
5. **Output Generation**: Stream filtered products to JSONL files

### Error States
- **Invalid Criteria**: Validation errors in filter parameters
- **Insufficient Data**: No products meet all criteria
- **Performance Timeout**: Processing exceeds 10-second limit

## Integration Points

### Existing Scoring Systems
- **Halal Analysis**: `halalAnalysis` field (19,127 products covered)
- **Protein Optimization**: `proteinOptimization` field (15,447 products)
- **Post-Workout**: `postWorkoutOptimization` field (13,145 products)
- **Fat Loss**: `fatLossCompatibility` field (10,440 products)
- **Calorie Efficiency**: `enhancedCalorieEfficiency` field (13,861 products)

### CLI Integration
- Filter criteria mapped from CLI flags: `--halal-strict`, `--protein-min`, `--budget-max`
- Context parameters: `--training-day`, `--rest-day`
- Output control: `--filters halal,protein,postworkout`

### File Output Structure
- `filtered-{combination}.jsonl` - Filtered products
- `filtered-{combination}-index.json` - Searchable index
- `filtered-{combination}-stats.json` - Filter statistics

This data model supports all functional requirements while maintaining compatibility with the existing scoring pipeline and output formats.
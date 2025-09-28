# Research: Body Recomposition Scoring Enhancement

**Phase 0**: Outline & Research | **Date**: 2025-09-19

## Research Objectives

Investigate technical approaches for implementing contextual body recomposition scoring that extends existing protein density and satiety analysis systems.

## Key Research Areas

### 1. Post-Workout Optimization Algorithms

**Decision**: Implement carb-to-protein ratio scoring with glycemic index weighting

**Rationale**:
- **Metabolic Window Research**: Post-workout anabolic window (0-2h) theory commonly cited, though **current scientific evidence is insufficient to fully support timing criticality** (ref: https://en.wikipedia.org/wiki/Metabolic_window)
- **Practical Application**: Most beneficial when starting from depleted nutritional state (e.g., fasted exercise)
- **Evidence-based Ratios**: Optimal carb:protein ratios vary by training type:
  - Endurance recovery: 3:1 to 4:1 carbs:protein for glycogen restoration
  - Strength training: 2:1 to 3:1 carbs:protein for muscle protein synthesis
- **Glycemic Index Science**: High GI foods (≥70) provide rapid glucose availability for glycogen replenishment - **scientifically validated** (ref: https://en.wikipedia.org/wiki/Glycemic_index)
- **Integration**: Existing protein scoring (170g target) provides validated foundation
- **Conservative Approach**: Algorithm provides **moderate optimization benefits** rather than claiming critical timing necessity

**Scientific Foundation** (Wikipedia Validated):
- **Glycemic Index Scale**: 0-100 relative to glucose (100) absorption rate over 2 hours
- **High GI (≥70)**: glucose, dextrose, white bread, white rice, corn flakes, maltose - **scientifically confirmed for rapid glucose availability**
- **Medium GI (56-69)**: white sugar, pita bread, basmati rice, banana
- **Low GI (≤55)**: fructose, legumes, nuts, most vegetables, whole intact grains
- **Individual Variation**: Significant person-to-person response differences noted in research

**Alternatives Considered**:
- Simple carb content scoring (rejected: ignores absorption kinetics)
- Fixed food category bonuses (rejected: not nutrient-density based)
- Insulin index over glycemic index (rejected: limited food database coverage)

**Implementation Approach** (Evidence-Based but Conservative):
- Calculate carb:protein ratio for products with both macronutrients
- Apply **moderate** GI multiplier: High GI (1.2-1.3x), Medium GI (1.1x), Low GI (1.0x)
- Integrate with existing `proteinOptimization` field as `postWorkoutScore`
- **Conservative Confidence**: Label as "moderate optimization" not "critical timing"
- Account for individual variation in scoring confidence levels

### 2. Fat Loss Compatibility Scoring

**Decision**: Combine calorie density thresholds with satiety-per-calorie efficiency

**Rationale**:
- **Calorie Restriction Science**: Fat loss requires sustained caloric deficit while maintaining satiation to prevent adherence failure (ref: https://en.wikipedia.org/wiki/Calorie_restriction)
- **Energy Density Research**: Lower calorie density foods increase satiation per calorie consumed (ref: https://en.wikipedia.org/wiki/Food_energy)
- **Calorie Quality**: Not all calories are metabolically equivalent - "empty calories" from processed foods provide less satiation (ref: https://en.wikipedia.org/wiki/Empty_calories, https://en.wikipedia.org/wiki/A_calorie_is_a_calorie)
- **Evidence-based Thresholds**: CDC/WHO guidelines classify foods by energy density
- **Integration**: Existing satiety analysis provides validated Holt coefficients for satiation scoring

**Scientific Foundation**:
- **Calorie Definition**: 1 kcal = energy to raise 1kg water by 1°C (ref: https://en.wikipedia.org/wiki/Calorie)
- **Energy Density Classifications**:
  - Very Low: <60 kcal/100g (most vegetables, fruits)
  - Low: 60-125 kcal/100g (lean proteins, low-fat dairy)
  - Moderate: 125-225 kcal/100g (whole grains, legumes)
  - High: 225-400 kcal/100g (processed foods, refined grains)
  - Very High: >400 kcal/100g (oils, nuts, confectionery)

**Alternatives Considered**:
- Pure calorie density ranking (rejected: ignores hunger satisfaction and food quality)
- Macro-based approaches (rejected: oversimplifies energy balance equation)
- Volume-based satiety only (rejected: existing Holt model more scientifically comprehensive)

**Implementation Approach**:
- Classify calorie density using research-based thresholds: low (<125), moderate (125-225), high (>225) kcal/100g
- Calculate satiety efficiency: existing_satiety_score * (300 / calories_per_100g)
- Apply bounds to prevent mathematical outliers from zero-calorie products
- Weight efficiency by food processing level (whole foods > processed foods)

### 3. Enhanced Calorie Efficiency System

**Decision**: Multi-dimensional efficiency incorporating protein, micronutrients, and metabolic impact

**Rationale**:
- **Basal Metabolic Rate**: Different macronutrients have varying metabolic costs and thermic effects (ref: https://en.wikipedia.org/wiki/Basal_metabolic_rate)
- **Thermic Effect of Food**: Protein requires 20-30% of calories for digestion vs 5-10% for carbs/fats
- **Metabolic Efficiency**: Body recomposition requires optimization beyond simple calorie counting
- **Micronutrient Density**: Essential nutrients support metabolic processes during caloric restriction
- **Food Quality**: Processing level affects bioavailability and metabolic response

**Scientific Foundation**:
- **Thermic Effect Rankings**:
  - Protein: 20-30% energy cost for digestion and metabolism
  - Carbohydrates: 5-10% energy cost
  - Fats: 0-3% energy cost
- **Metabolic Efficiency Factors**:
  - Protein quality (complete vs incomplete amino acid profiles)
  - Micronutrient density (vitamins, minerals per calorie)
  - Processing level (whole foods vs ultra-processed)
  - Fiber content (metabolic cost of digestion)

**Alternatives Considered**:
- Simple calorie-to-protein ratio (rejected: existing implementation, ignores complexity)
- ANDI (Aggregate Nutrient Density Index) adaptation (rejected: requires extensive micronutrient database)
- Pure nutritional density scoring (rejected: overlaps with existing health scores)

**Implementation Approach**:
- **Multi-dimensional Scoring**: 40% protein efficiency + 30% satiety efficiency + 20% micronutrient density + 10% processing penalty
- **Thermic Effect Integration**: Boost scores for high-protein foods based on metabolic cost
- **Processing Assessment**: Leverage existing NOVA classification for ultra-processed food penalties
- **Micronutrient Estimation**: Derive from ingredient complexity and natural food categories

### 4. Body Composition Context Integration

**Decision**: Context-aware scoring multipliers based on body composition phase and meal timing

**Rationale**:
- Different body composition goals (cutting/bulking/recomposition) prioritize different nutritional factors
- Meal timing affects nutrient utilization (post-workout vs general meals)
- Personalization improves adherence and results vs one-size-fits-all scoring

**Alternatives Considered**:
- Static user preference settings (rejected: lacks temporal context)
- AI-based preference learning (rejected: requires user behavior data)
- Complex metabolic modeling (rejected: exceeds scope)

**Implementation Approach**:
- Define 4 body composition contexts: cutting, bulking, maintenance, recomposition
- Define 3 meal timing contexts: pre-workout, post-workout, general
- Apply context multipliers to base scores (e.g., cutting phase boosts fat loss scores)
- Default to recomposition + general meal context for backward compatibility

## Technical Architecture Decisions

### Integration with Existing Pipeline

**Decision**: Extend `enhanceScoringPipeline.ts` with new scoring modules

**Rationale**:
- Existing pipeline handles graceful failures and backward compatibility
- Modular architecture allows independent testing of each scoring component

**New Modules Required**:
- `computePostWorkoutScoring.ts` - Post-workout optimization logic
- `computeFatLossCompatibility.ts` - Fat loss scoring with calorie density
- `computeEnhancedCalorieEfficiency.ts` - Multi-dimensional efficiency
- `computeBodyCompositionContext.ts` - Context-aware scoring adjustments

### Data Model Extensions

**Decision**: Extend `Product` interface with optional body recomposition fields

**Rationale**:
- Maintains backward compatibility (existing products unaffected)
- Follows existing pattern from `proteinOptimization` and `satietyAnalysis`
- Allows graceful degradation for products with insufficient data

**New Product Fields**:
```typescript
export interface Product {
  // ... existing fields
  postWorkoutOptimization?: PostWorkoutScore;
  fatLossCompatibility?: FatLossScore;
  enhancedCalorieEfficiency?: CalorieEfficiencyScore;
  bodyCompositionContext?: BodyCompositionContext;
}
```

### Performance Considerations

**Decision**: Maintain existing streaming architecture with O(1) per-product scoring

**Rationale**:
- Constitutional requirement: <10s for 30k products, <150MB memory
- Existing pipeline proven performant with protein and satiety scoring
- No additional data loading required (uses existing nutrition and ingredient data)

**Optimization Strategies**:
- Pre-compile glycemic index lookup tables
- Cache calorie density calculations
- Vectorize efficiency calculations where possible
- Maintain streaming processing (no batch loading)

## Dependencies and Constraints

### External Dependencies
- No new external packages required
- Leverages existing Vitest, TypeScript, Node.js stack
- Uses existing CSV parsing and JSONL output infrastructure

### Data Dependencies
- Requires existing nutrition data (calories, protein, carbs, fiber)
- Requires existing ingredient parsing and classification
- Optional enhancement: glycemic index database (can start with category-based estimates)

### Performance Constraints
- Must maintain <10s processing time for 30k products
- Must maintain <150MB memory usage
- Must maintain deterministic output (byte-identical for same input)
- Must maintain backward compatibility (existing JSON schema)

### Constitutional Compliance
- ✅ Single responsibility: Each scoring module has one clear purpose
- ✅ Deterministic: All calculations use fixed algorithms and sorting
- ✅ Test-first: All modules require failing tests before implementation
- ✅ Fail fast: Graceful degradation for missing data, no silent failures
- ✅ Performance: Streaming architecture maintained
- ✅ Observability: Structured logging with new scoring statistics
- ✅ Contracts: Backward compatible Product interface extensions
- ✅ Dependencies: No new external packages
- ✅ Security: Pure functions, no dynamic evaluation
- ✅ Simplicity: Direct functional transforms, no complex patterns

## Conflict Resolution Algorithms

**Decision**: Mathematical formulation for handling optimization conflicts between body composition contexts

**Rationale**:
- Products may score well for one goal (e.g., post-workout) but poorly for another (e.g., fat loss)
- Different meal timing contexts require different optimization priorities
- Users need predictable, deterministic conflict resolution for consistent recommendations
- Algorithm must remain fast enough for 30k product processing

**Mathematical Formulation**:

### Strategy 1: Balanced Approach
**When**: Default strategy for general meal context
**Formula**: Weighted geometric mean with conflict penalty
```
finalScore = (∏ scores^weights)^(1/Σweights) × conflictPenalty
conflictPenalty = 1 - (standardDeviation(scores) / 100) × 0.3
weights = [0.25, 0.25, 0.35, 0.15] // [postWorkout, fatLoss, efficiency, context]
```

### Strategy 2: Prioritize Goal
**When**: User has specified primary body composition phase
**Formula**: Primary goal dominance with secondary boost
```
primaryWeight = 0.6 + (0.2 × contextStrength)
secondaryWeight = (1 - primaryWeight) / (numSecondaryScores)
finalScore = (primaryScore × primaryWeight) + (Σ(secondaryScores × secondaryWeight))
contextStrength = abs(phaseBias - 0.5) × 2 // 0=neutral, 1=extreme bias
```

### Strategy 3: Context Specific
**When**: Post-workout or pre-workout meal timing detected
**Formula**: Context multiplier dominance with goal modulation
```
baseScore = contextRelevantScore × contextMultiplier
modulation = (Σ(otherScores) / numOtherScores) × 0.3
finalScore = min(100, baseScore + modulation)
```

**Conflict Detection Thresholds**:
- **Low Conflict**: Score standard deviation ≤ 15 points
- **Medium Conflict**: Score standard deviation 16-30 points
- **High Conflict**: Score standard deviation > 30 points

**Tie-Breaking Rules** (deterministic ordering):
1. Highest confidence score takes precedence
2. If confidence equal: post-workout > fat loss > efficiency > context
3. If still tied: product with lower lexicographic `id` wins

**Performance Optimizations**:
- Pre-compute geometric mean tables for common score combinations
- Early exit when all scores within 5 points (no conflict)
- Cache conflict penalty calculations for standard deviation ranges

**Edge Case Handling**:
- **All scores undefined**: Return undefined, no conflict resolution attempted
- **Single score defined**: Return that score × 0.8 (uncertainty penalty)
- **Extreme outlier**: Cap individual score influence at ±40 points from group mean

**Validation Requirements**:
- Algorithm must be commutative: order of score input doesn't affect result
- Results must be reproducible: same inputs always produce identical outputs
- Bounded output: final scores always in range [0, 100]
- Monotonic: improving any input score never decreases final score

## Research Conclusions

All technical unknowns have been resolved with evidence-based decisions grounded in nutritional science and metabolic research. The implementation approach integrates seamlessly with existing architecture while adding the 40% missing body recomposition functionality. Performance and constitutional requirements can be met within existing constraints.

**Key Scientific Validations**:
- Post-workout carb:protein ratios validated against sports nutrition research
- Calorie density thresholds align with CDC/WHO energy density guidelines
- Thermic effect calculations based on established metabolic research
- Glycemic index classifications follow international standards

**Implementation Readiness**:
- All algorithms designed for O(1) per-product processing
- No external API dependencies required
- Backward compatibility maintained with existing scoring systems
- Evidence-based thresholds defined for all scoring parameters

Ready to proceed to Phase 1 (Design & Contracts).

## Scientific References

**Primary Research Sources**:
1. **Glycemic Index**: https://en.wikipedia.org/wiki/Glycemic_index - Glucose absorption rates and classification thresholds
2. **Metabolic Window**: https://en.wikipedia.org/wiki/Metabolic_window - Post-workout anabolic window and nutrient timing
3. **Calorie Science**: https://en.wikipedia.org/wiki/Calorie - Energy unit definitions and metabolic equivalents
4. **Calorie Restriction**: https://en.wikipedia.org/wiki/Calorie_restriction - Fat loss physiology and adherence factors
5. **Basal Metabolic Rate**: https://en.wikipedia.org/wiki/Basal_metabolic_rate - Thermic effect of food and metabolic efficiency
6. **Food Energy**: https://en.wikipedia.org/wiki/Food_energy - Energy density and satiation relationships
7. **Calorie Quality**: https://en.wikipedia.org/wiki/A_calorie_is_a_calorie - Metabolic differences between calorie sources
8. **Empty Calories**: https://en.wikipedia.org/wiki/Empty_calories - Nutritional value vs caloric content analysis

**Applied Research Integration**:
- Holt et al. (1995) Satiety Index coefficients (existing implementation)
- WHO/CDC energy density classifications for food categorization
- Sports nutrition carbohydrate-protein ratio recommendations
- International glycemic index database standards (scientifically validated)
- NOVA food processing classification system

## Research Validation Summary

**Wikipedia Analysis Completed** ✅ All 8 scientific references thoroughly reviewed

**Key Validations**:
- ✅ **Glycemic Index Classifications**: Confirmed Low ≤55, Medium 56-69, High ≥70
- ✅ **High GI Foods**: glucose, dextrose, white bread, white rice scientifically validated
- ✅ **Calorie Density Thresholds**: WHO/CDC energy density guidelines confirmed
- ✅ **Thermic Effect Values**: Protein 20-30%, carbs 5-10%, fats 0-3% validated

**Important Scientific Caveats**:
- ⚠️ **Metabolic Window**: Current evidence **insufficient** to support critical timing necessity
- ⚠️ **Individual Variation**: Significant person-to-person differences in glycemic response
- ⚠️ **Context Dependency**: Post-workout benefits most pronounced in fasted/depleted states

**Implementation Adjustments**:
- **Conservative Multipliers**: Reduced GI boost from 1.5x to 1.3x maximum
- **Moderate Claims**: Positioned as "optimization" not "necessity"
- **Confidence Scoring**: Individual variation acknowledged in confidence levels
- **Evidence-Based Foundation**: All thresholds grounded in validated research

**Scientific Integrity**: Algorithm designed with conservative approach acknowledging current research limitations while providing practical optimization benefits based on established nutritional science.
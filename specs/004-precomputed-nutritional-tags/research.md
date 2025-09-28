# Research: Nutritional Tags Implementation

## Dutch/EU Nutritional Standards

### Decision: Use EU High Fiber Standard (≥6g per 100g)
**Rationale**: EU Commission Regulation No 1924/2006 defines "high fibre" as containing at least 6g of fibre per 100g. This is the legal standard for AH Netherlands products.
**Alternatives considered**:
- US FDA standard (2.5g per serving) - rejected as not applicable to Dutch market
- Generic 3g per 100g threshold - rejected as not legally compliant

### Decision: Dutch High Protein Standard (≥20g per 100g)
**Rationale**: Common threshold used in Dutch fitness/nutrition community and consistent with EU protein claim regulations. Aligns with existing Dutch dietary guidelines.
**Alternatives considered**:
- 12g per 100g (lower threshold) - rejected as too permissive for "high protein" claim
- 25g per 100g - rejected as too restrictive for diverse product categories

### Decision: Low Carb Threshold (<10g net carbs per 100g)
**Rationale**: Standard ketogenic diet threshold widely recognized in Dutch health community. Net carbs (total carbs - fiber) is the relevant metric for dietary impact.
**Alternatives considered**:
- <5g net carbs - rejected as too restrictive for broader low-carb category
- <20g total carbs - rejected as doesn't account for fiber offset

## Dutch Ingredient Recognition Patterns

### Decision: Comprehensive Dutch Dietary Terms Dictionary
**Rationale**: Accurate dietary classification requires recognizing Dutch ingredient terminology. Leverages existing ingredient parsing infrastructure.
**Implementation approach**:
- Vegan exclusions: melk, ei, boter, kaas, vis, vlees, honing, gelatine, room, roomboter
- Vegetarian exclusions: vis, vlees, kip, rund, varken, lam (allow dairy/eggs)
- Lactose sources: melk, room, boter, kaas, lactose, wei
- Gluten sources: tarwe, rogge, gerst, haver, gluten

### Decision: Leverage Existing Allergen Parsing
**Rationale**: Current allergen parsing already handles Dutch allergen declarations (BEVAT:, KAN SPOREN BEVATTEN VAN). Can reuse this logic for dietary classification.
**Alternatives considered**:
- Separate ingredient analysis - rejected as duplicates existing work
- English-only analysis - rejected as inaccurate for Dutch products

## Performance Optimization

### Decision: Lazy Tag Computation
**Rationale**: Only compute tags for food products (not household items) to minimize overhead. Skip computation entirely if no nutritional data available.
**Performance target**: <5% overhead on existing transform pipeline
**Alternatives considered**:
- Compute all tags for all products - rejected due to unnecessary overhead
- Separate batch processing - rejected as adds complexity

### Decision: Reuse Existing Decimal Comma Normalization
**Rationale**: Existing `normalizeDecimalComma()` function already handles Dutch decimal notation correctly and tracks statistics.
**Implementation**: Extend nutrition parsing to use existing helper
**Alternatives considered**:
- New decimal parsing logic - rejected as duplicates existing functionality

## Integration Strategy

### Decision: Extend Existing Transform Pipeline
**Rationale**: Minimal disruption to existing architecture. Add nutritional parsing after line 87 in transform-data.ts where `nutrition: {}` is currently set.
**Approach**:
1. Parse Dutch nutritional columns from CSV
2. Compute nutritional tags using parsed values
3. Include tags in existing product output flow

### Decision: Follow Dutch Localization Pattern (T014-T023)
**Rationale**: Proven TDD approach with comprehensive test coverage. Established pattern for extending transform pipeline with Dutch-specific functionality.
**Implementation pattern**:
- Unit tests for computation functions
- Integration tests with Dutch fixture data
- Schema documentation updates
- Statistics tracking integration

## Data Model Extensions

### Decision: Optional NutritionalTags Interface
**Rationale**: Additive change to existing Product interface. Tags only included when applicable, maintaining backward compatibility.
**Structure**:
```typescript
interface NutritionalTags {
  netCarbs?: number;
  netCarbsBucket?: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  lowCarb?: boolean;
  highProtein?: boolean;
  highFiber?: boolean;
  proteinDensity?: 'low' | 'moderate' | 'high';
  proteinDensityBucket?: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  lactoseFree?: boolean;
  glutenFree?: boolean;
  vegan?: boolean;
  vegetarian?: boolean;
  plantBased?: boolean;
}
```

### Decision: Preserve Deterministic Output
**Rationale**: Constitution requires byte-identical output for same input. Nutritional computations must be deterministic.
**Implementation**: Use consistent rounding, stable sorting, fixed precision for decimal calculations

## Testing Strategy

### Decision: Follow TDD with Failing Tests First
**Rationale**: Constitutional requirement. Must follow RED-GREEN-Refactor cycle strictly.
**Test hierarchy**:
1. Unit tests for computation functions (edge cases, Dutch ingredient recognition)
2. Integration tests with AH fixture data (end-to-end tag assignment)
3. Performance regression tests (overhead measurement)

### Decision: Use Existing Dutch Fixture Data
**Rationale**: `tests/fixtures/sample-nl.csv` contains real AH product data with complete nutritional information perfect for testing tag accuracy.
**Validation approach**: Verify tags against known product characteristics from fixture data
# Research: Hybrid Nutrition Score Implementation

## Research Objectives
1. EU Nutri-Score algorithm implementation details
2. Percentile ranking calculations for large datasets
3. Grade distribution strategies
4. Integration with existing transform pipeline

## EU Nutri-Score Algorithm Research

### Decision: Official FSA Nutrient Profiling Model
**Rationale**: Use the validated FSA (Food Standards Agency) nutrient profiling model that underpins Nutri-Score for scientific accuracy and regulatory compliance.

**Implementation Details**:
- **Negative Points Calculation**:
  - Energy: 0-10 points based on kJ per 100g (thresholds: 335, 670, 1005, 1340, 1675, 2010, 2345, 2680, 3015, 3350+ kJ)
  - Saturated Fat: 0-10 points based on g per 100g (thresholds: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10+ g)
  - Sugars: 0-10 points based on g per 100g (thresholds: 4.5, 9, 13.5, 18, 22.5, 27, 31, 36, 40, 45+ g)
  - Sodium: 0-10 points based on mg per 100g (thresholds: 90, 180, 270, 360, 450, 540, 630, 720, 810, 900+ mg)

- **Positive Points Calculation**:
  - Fiber: 0-5 points based on g per 100g (thresholds: 0.9, 1.9, 2.8, 3.7, 4.7+ g)
  - Protein: 0-5 points based on g per 100g (thresholds: 1.6, 3.2, 4.8, 6.4, 8.0+ g)
  - Fruits/Vegetables: 0-5 points (estimation required from categories)

- **Category-Specific Rules**:
  - Beverages: Different thresholds (energy: 0, 30, 60, 90, 120, 150+ kJ)
  - Cheese: Protein points always awarded if negative points ≤ 11
  - Added Fats: Special scoring rules for oils and spreads

**Alternatives Considered**:
- Custom nutritional scoring: Rejected due to lack of scientific validation
- Simplified point system: Rejected as it loses regulatory compliance

### Decision: Percentile-Based Ranking Enhancement
**Rationale**: Convert absolute Nutri-Scores to dataset-relative percentiles to solve clustering problem and enable meaningful product differentiation.

**Implementation Details**:
- Calculate percentile rank of each product's Nutri-Score within dataset
- Support both global (all products) and category-relative percentiles
- Blend Nutri-Score foundation with percentile intelligence
- Apply tie-breaking using nutritional density ratios

**Alternatives Considered**:
- Z-score normalization: Rejected due to assumption violations in skewed distributions
- Fixed thresholds: Rejected as they don't adapt to dataset composition

### Decision: Equal 20% Grade Distribution
**Rationale**: Predictable, balanced distribution ensures each grade tier represents exactly 20% of products for consistent user experience.

**Implementation Details**:
- A grade: 80-100th percentile (top 20%)
- B grade: 60-80th percentile (next 20%)
- C grade: 40-60th percentile (middle 20%)
- D grade: 20-40th percentile (next 20%)
- E grade: 0-20th percentile (bottom 20%)

**Alternatives Considered**:
- Weighted distribution (10%/20%/40%/20%/10%): Rejected as it's less intuitive
- Nutri-Score letter mapping: Rejected due to clustering issues

## Performance Optimization Research

### Decision: Two-Pass Processing Architecture
**Rationale**: Enables percentile calculation while maintaining streaming processing and memory constraints.

**Implementation Details**:
- Pass 1: Calculate Nutri-Scores and collect for percentile computation
- Pass 2: Apply percentile ranking and grade assignment
- Maintain O(headers + active row) memory usage per constitutional requirements

**Alternatives Considered**:
- Single-pass approximation: Rejected due to accuracy requirements
- External sorting: Rejected due to complexity and determinism concerns

### Decision: In-Memory Percentile Calculation
**Rationale**: 30k products × 8 bytes per score = 240KB fits well within 150MB memory constraint.

**Implementation Details**:
- Store scores in sorted arrays for efficient percentile lookup
- Use binary search for percentile rank calculation
- Separate arrays for global and category-relative calculations

**Alternatives Considered**:
- Streaming percentiles: Rejected due to accuracy requirements for grade boundaries
- Database-backed calculations: Rejected per constitutional no-database constraint

## Integration Strategy Research

### Decision: Extend Existing Product Interface
**Rationale**: Additive changes maintain backward compatibility while providing new scoring capabilities.

**Implementation Details**:
```typescript
interface Product {
  // Existing fields...
  nutriScore?: number;              // EU Nutri-Score (-15 to +40)
  globalHealthScore?: number;       // Global percentile ranking (0-100)
  globalHealthGrade?: 'A'|'B'|'C'|'D'|'E';
  categoryHealthScore?: number;     // Category percentile ranking (0-100)
  categoryHealthGrade?: 'A'|'B'|'C'|'D'|'E';
}
```

**Alternatives Considered**:
- Separate scoring interface: Rejected as it complicates data flow
- Nested scoring object: Rejected for JSONL output simplicity

### Decision: Modular Scoring Functions
**Rationale**: Pure functions enable testing, reuse, and maintain constitutional simplicity principles.

**Implementation Details**:
- `computeNutriScore(nutrition, category): number`
- `computePercentileRank(score, scores): number`
- `computeHealthGrade(percentile): 'A'|'B'|'C'|'D'|'E'`
- `enhanceWithDualScoring(products): Product[]`

**Alternatives Considered**:
- Class-based scoring service: Rejected per constitutional "no wrapper classes"
- Monolithic scoring function: Rejected for testability concerns

## Testing Strategy Research

### Decision: Comprehensive TDD Approach
**Rationale**: Constitutional requirement for RED-GREEN-REFACTOR cycle with comprehensive coverage.

**Test Coverage Plan**:
1. **Unit Tests**: Individual scoring functions with edge cases
2. **Integration Tests**: Full pipeline with dual scoring output
3. **Contract Tests**: Product interface schema validation

**Test Data Strategy**:
- Use existing CSV fixtures for integration tests
- Create specific nutrition edge cases for unit tests
- Validate deterministic output with snapshots

**Alternatives Considered**:
- Mock-based testing: Rejected per constitutional "real dependencies" requirement
- Property-based testing: Considered complementary, not replacement

## Implementation Risks & Mitigations

### Risk: Grade Distribution Accuracy
**Mitigation**: Comprehensive integration tests with known distributions

### Risk: Nutri-Score Implementation Errors
**Mitigation**: Validate against official FSA documentation and reference implementations

### Risk: Memory Usage Exceeding Constraints
**Mitigation**: Monitor RSS during development, optimize data structures if needed

## Next Phase Dependencies
- All NEEDS CLARIFICATION resolved ✓
- Algorithm implementation details documented ✓
- Integration strategy defined ✓
- Testing approach planned ✓

Ready for Phase 1: Design & Contracts
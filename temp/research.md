# Research: Personal Health Extensions (Halal & Protein)

**Feature**: Extensions to hybrid nutrition scoring system
**Date**: 2025-09-18
**Context**: Adding personal health optimization layers for Ali's specific needs

## Core Technical Decisions

### 1. Halal Compliance Detection

**Decision**: Build upon existing E-number additive analysis system in `additiveFlags.ts`

**Rationale**:
- Existing system already detects and classifies E-numbers with functional categories
- Many Halal/Haram determinations depend on E-number analysis (animal-derived additives)
- Can leverage existing Dutch ingredient parsing infrastructure
- Reuses established regex patterns and caching mechanisms

**Alternatives considered**:
- Separate standalone Halal detection system → Rejected: Would duplicate ingredient parsing logic
- Third-party Halal API integration → Rejected: Against constitutional principle (no network access during transform)
- Simple keyword matching → Rejected: Too simplistic, misses nuanced cases

**Implementation approach**:
- Extend existing `additiveInfo` analysis with Halal-specific flags
- Create structured `halalCheck` object with confidence levels
- Leverage existing E-number database for animal-derived additive detection

### 2. Protein Density Optimization

**Decision**: Create dedicated scoring module using existing nutrition data infrastructure

**Rationale**:
- Ali's specific goal: 170g protein daily target
- Existing `nutrition` field provides all necessary protein content
- Can calculate protein-per-calorie ratios for optimization
- Fits existing pure function architecture pattern

**Alternatives considered**:
- Modify existing health scores → Rejected: Would break backward compatibility
- Use generic "high protein" tags → Rejected: Not specific enough for 170g target
- Complex meal planning algorithm → Rejected: Over-engineering, violates simplicity principle

**Implementation approach**:
- Pure function: `computeProteinOptimization(nutrition, servingSize?)`
- Output protein density score (0-100), target contribution percentage
- No cost analysis initially (can be added later as requested)

### 3. Satiety Intelligence Integration

**Decision**: Implement evidence-based Satiety Index methodology from research literature

**Rationale**:
- Ali referenced https://en.wikipedia.org/wiki/Satiety_value - evidence-based approach
- Holt et al. (1995) Satiety Index provides peer-reviewed foundation
- Factors: protein content, fiber content, food volume, processing level
- Directly supports Ali's calorie deficit goals (1800-2000 kcal range)

**Research findings**:
- Satiety Index correlates with protein (r=0.37), fiber content, and food volume
- Ultra-processed foods have lower satiety per calorie
- Formula: Base satiety × protein factor × fiber factor × volume factor - processing penalty

**Alternatives considered**:
- Simple fiber + protein scoring → Rejected: Ignores volume and processing factors
- Glycemic index integration → Rejected: Different purpose, more complex
- Machine learning approach → Rejected: Insufficient training data, over-engineering

**Implementation approach**:
- Pure function: `computeSatietyAnalysis(nutrition, processingLevel)`
- Use existing NOVA-like processing detection from ingredient analysis
- Output expected satiety duration and calorie-per-satiety ratios

## Architecture Integration

### Backward Compatibility Strategy

**Decision**: Append new scoring objects to Product interface, preserve all existing fields

**Rationale**:
- Constitutional requirement: No breaking changes
- Ali's specific request: "keep the current scoring as is but append to it"
- Allows UI to filter/compare different scoring perspectives
- Future-proofs for additional scoring layers

**Structure**:
```typescript
// Existing fields preserved
nutriScore?: number;
globalHealthScore?: number;
globalHealthGrade?: HealthGrade;
categoryHealthScore?: number;
categoryHealthGrade?: HealthGrade;

// New additions
halalCheck?: HalalAnalysis;
proteinOptimization?: ProteinScoring;
satietyAnalysis?: SatietyIntelligence;
```

### Performance Considerations

**Decision**: Maintain existing <10s processing time for 30k products

**Rationale**:
- Constitutional constraint must be preserved
- New calculations are O(1) per product (no complex algorithms)
- Leverage existing caching mechanisms from additive analysis
- Pure functions enable easy optimization if needed

**Validation approach**:
- Add performance tests alongside existing test suite
- Monitor memory usage (constitutional <150MB RSS limit)
- Use existing streaming-compatible architecture

## Dependencies and Constraints

### Technical Dependencies

**Confirmed**:
- TypeScript/Node.js 18+ (existing)
- Vitest testing framework (constitutional requirement)
- Existing transform pipeline modules (reuse)

**New dependencies**: None required

### Data Dependencies

**Available**:
- Dutch ingredient lists (existing parsing)
- E-number database with 300+ additives (existing)
- Nutritional data per 100g (existing)
- Product categories (existing)

**Assumptions**:
- Dutch ingredient text contains sufficient information for Halal detection
- Existing nutritional data completeness (48.1% coverage) is acceptable
- Serving size estimation methods can be developed from existing unit parsing

## Validation Strategy

### Evidence Base

**Halal compliance**:
- Cross-reference with known problematic E-numbers (E120, E441, etc.)
- Validate against Islamic dietary guidelines
- Test with actual Dutch product ingredient lists

**Protein optimization**:
- Validate against Ali's 170g daily target (realistic serving contributions)  
- Compare with established high-protein food rankings
- Test edge cases (supplements, protein powders)

**Satiety scoring**:
- Validate against published Satiety Index values where available
- Test correlation with fiber + protein content
- Verify processing penalty logic with ultra-processed examples

### Integration Testing

**Pipeline integration**:
- Ensure new fields appear in products.jsonl output
- Verify stats.json includes new scoring statistics
- Confirm deterministic output (identical inputs → identical results)
- Validate performance with existing 30k product dataset

## Open Research Questions

### Resolved
- ✅ Halal detection methodology: Leverage existing E-number analysis
- ✅ Protein scoring approach: Density per calorie + target contribution
- ✅ Satiety calculation basis: Holt et al. Satiety Index research
- ✅ Backward compatibility: Append-only strategy confirmed

### For Implementation Phase
- Serving size estimation accuracy (can use existing unit parsing as baseline)
- Confidence level calculation for Halal determinations
- Satiety Index formula calibration with available nutritional data

## Success Metrics

**Functional**:
- All existing tests continue passing
- New scoring fields populate for products with sufficient data
- Performance remains <10s for 30k products
- Memory usage stays <150MB RSS

**Quality**:
- >90% test coverage on new modules (constitutional requirement)
- TDD approach: RED-GREEN-REFACTOR strictly followed
- No breaking changes to existing API/output format

**Business Value**:
- Ali can filter products by Halal compliance status
- Ali can optimize protein target achievement (170g daily)
- Ali can identify most satiating foods for calorie deficit goals

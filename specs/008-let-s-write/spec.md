# Feature Specification: Hybrid Nutrition Score

**Feature Branch**: `008-let-s-write`
**Created**: 2025-09-17
**Status**: Draft
**Input**: User description: "let's write spec for Hybrid nutrition score"

## Execution Flow (main)
```
1. Parse user description from Input
   � Feature: Hybrid nutrition scoring system combining Nutri-Score + AliScoreV2
2. Extract key concepts from description
   � Actors: Transform pipeline, Product health assessment
   � Actions: Calculate health scores, Assign grades, Rank products
   � Data: Nutrition facts, Product categories, Score rankings
   � Constraints: EU standards compliance, Dataset-relative ranking
3. For each unclear aspect:
   � [NEEDS CLARIFICATION: Scoring mode defaults - global vs category-relative?]
   � [NEEDS CLARIFICATION: Grade distribution percentiles - equal 20% buckets or weighted?]
4. Fill User Scenarios & Testing section
   � Primary: Product receives health score and grade during transformation
5. Generate Functional Requirements
   � Each requirement focuses on scoring capabilities and outputs
6. Identify Key Entities
   � HealthScore, HealthGrade, ScoreContext entities
7. Run Review Checklist
   � WARN "Spec has uncertainties about scoring defaults"
8. Return: SUCCESS (spec ready for planning)
```

---

## � Quick Guidelines
-  Focus on WHAT users need and WHY
- L Avoid HOW to implement (no tech stack, APIs, code structure)
- =e Written for business stakeholders, not developers

---

## Algorithm Overview *(mandatory)*

### Phase 1: EU Nutri-Score Foundation
The Nutri-Score is an official front-of-pack nutrition labelling system adopted by France, Belgium, Germany, Netherlands, Luxembourg, and Spain. It uses the FSA (Food Standards Agency) nutrient profiling model to assess nutritional quality.

**Nutri-Score Calculation Method:**
- **Negative Points (0-40)**: Energy (kJ), saturated fat (g), sugars (g), and sodium (mg) per 100g
- **Positive Points (0-15)**: Fiber (g), protein (g), and fruits/vegetables/nuts percentage per 100g
- **Final Score**: Negative points minus positive points (range -15 to +40)
- **Category Adjustments**: Different thresholds for beverages, cheese, and added fats
- **Scientific Basis**: Validated against mortality and chronic disease outcomes in large epidemiological studies

**Nutri-Score Strengths:**
- Regulatory approval across multiple EU countries
- Evidence-based correlation with health outcomes
- Category-specific thresholds prevent misleading comparisons
- Standardized calculation methodology

### Phase 2: AliScore Percentile Enhancement
AliScore solves critical Nutri-Score limitations by adding dataset-relative ranking and enhanced differentiation for real-world product comparison.

**Key Problems AliScore Solves:**

1. **Nutri-Score Clustering Problem**: Most products cluster around similar Nutri-Score values (e.g., many breakfast cereals score 8-12), making it hard to rank "good" vs "better" options within acceptable ranges.

2. **Dataset Independence**: Nutri-Score is absolute - a score of 5 means the same thing whether your dataset has 100 or 10,000 products. But for recommendation systems, you need to know "this is the best option available in your store."

3. **Category Context Missing**: Nutri-Score treats chocolate bars and vegetables equally. AliScore allows category-relative ranking - "best chocolate bar available" vs impossible comparison to vegetables.

4. **Tie-Breaking for Identical Scores**: When multiple products have identical Nutri-Scores, AliScore provides sophisticated differentiation using nutritional density ratios.

**AliScore Enhancement Value:**
- **Converts clusters to rankings**: Transforms Nutri-Score clusters into clear 0-100 rankings for better user differentiation
- **Dataset-aware recommendations**: "Top 20% of available products" vs absolute thresholds that may exclude all realistic options
- **Category intelligence**: Compare yogurts to yogurts, not yogurts to vegetables
- **Enhanced precision**: Breaks ties between identical Nutri-Scores using multi-factor nutritional analysis
- **UI-friendly scaling**: 0-100 scale with A-E grades provides intuitive user interface vs -15 to +40 Nutri-Score range

**Example**: 50 breakfast cereals might have Nutri-Scores between 6-14. AliScore spreads these across 0-100 scale, making the "healthiest available cereal" clearly identifiable as 95/A grade vs "moderately healthy" 65/C grade.

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a health-conscious user browsing products, I need reliable health scores and grades (A-E) for each product so I can quickly identify healthier options and make informed food choices based on scientifically-validated nutritional assessment using a two-phase approach: first EU Nutri-Score foundation, then AliScore percentile enhancement.

### Acceptance Scenarios
1. **Given** a product with complete nutrition data, **When** the transform pipeline processes it, **Then** the system first calculates EU Nutri-Score (-15 to +40), then applies AliScore percentile ranking to produce final health score (0-100) and letter grade (A-E)
2. **Given** products in the same category, **When** scoring is applied, **Then** products are ranked relative to their category peers for meaningful comparisons within food types
3. **Given** a beverage product, **When** scoring is calculated, **Then** the system applies beverage-specific thresholds and weights different from solid food products
4. **Given** products with identical Nutri-Score base values, **When** final scoring is applied, **Then** tie-breaking logic using fiber/protein/sugar ratios provides meaningful ranking differentiation

### Edge Cases
- What happens when nutrition data is incomplete or missing key values?
- How does the system handle products that don't fit standard food categories?
- What occurs when a product has extreme nutritional values outside normal ranges?

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST implement two-phase scoring: Phase 1 calculates EU Nutri-Score (-15 to +40) using official FSA nutrient profiling algorithm, Phase 2 applies AliScore percentile ranking enhancement to produce final 0-100 health score
- **FR-002**: System MUST assign letter grades (A-E) based on final score percentiles where A represents the healthiest products
- **FR-003**: System MUST calculate BOTH global ranking (all products) and category-relative ranking (within food categories) simultaneously - each product receives both scores
- **FR-004**: System MUST apply different scoring weights and thresholds for beverages versus solid food products
- **FR-005**: System MUST include tie-breaking logic for products with identical base scores using nutritional density ratios
- **FR-006**: System MUST output score context metadata indicating whether global or category-relative ranking was used
- **FR-007**: System MUST handle missing nutrition data gracefully without penalizing products for incomplete information in both Nutri-Score and AliScore phases
- **FR-008**: System MUST generate deterministic scores - identical nutrition input produces identical Nutri-Score base and final score output
- **FR-009**: Transform pipeline MUST add healthScore (final 0-100), healthGrade (A-E), nutriScore (base -15 to +40), globalHealthScore, globalHealthGrade, categoryHealthScore, categoryHealthGrade fields to product JSONL output
- **FR-010**: System MUST provide dual scoring - no need to choose between global or category modes since both are calculated simultaneously
- **FR-011**: Grade distribution MUST use equal 20% percentile buckets (A=top 20%, B=next 20%, C=middle 20%, D=next 20%, E=bottom 20%) for both global and category grading

### Key Entities *(include if feature involves data)*
- **NutriScore**: Phase 1 base score (-15 to +40) calculated using official EU Nutri-Score FSA nutrient profiling algorithm
- **GlobalHealthScore**: Phase 2 final score (0-100 scale) ranking product against ALL products in dataset, with 100 being healthiest globally
- **CategoryHealthScore**: Phase 2 final score (0-100 scale) ranking product against products in SAME category only, with 100 being healthiest in category
- **GlobalHealthGrade**: Letter classification (A, B, C, D, E) derived from global health score percentiles for cross-category comparison
- **CategoryHealthGrade**: Letter classification (A, B, C, D, E) derived from category health score percentiles for within-category comparison
- **ScoreWeights**: Nutritional factor weights differing between food categories (beverages vs solid foods) applied in both scoring phases

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed (pending clarifications)

---
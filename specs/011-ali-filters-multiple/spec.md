# Feature Specification: Ali Filters + Multiple Outputs

**Feature Branch**: `011-ali-filters-multiple`
**Created**: 2025-01-19
**Status**: Draft
**Input**: User description: "Core filtering system with automatic multiple output generation for halal compliance, protein optimization, post-workout fuel, fat-loss compatibility, and budget-friendly protein sources"

## Execution Flow (main)
```
1. Parse user description from Input
   → COMPLETE: Extracted Ali's specific filtering needs
2. Extract key concepts from description
   → Identified: Ali (CrossFit athlete), halal compliance, protein optimization, post-workout, fat-loss, budget
3. For each unclear aspect:
   → RESOLVED: Integration approach will leverage existing body recomposition scoring fields (postWorkoutOptimization, fatLossCompatibility, enhancedCalorieEfficiency, bodyCompositionContext) from Feature 010
   → RESOLVED: Ali prefers tuna+potato combinations over tuna+rice - filtering will accommodate this preference
4. Fill User Scenarios & Testing section
   → COMPLETE: Clear user flow for pre-shopping, post-workout, and meal planning
5. Generate Functional Requirements
   → COMPLETE: All requirements testable
6. Identify Key Entities (if data involved)
   → COMPLETE: FilterCriteria, FilteredProduct, FilterStatistics, FilterOutput
7. Run Review Checklist
   → WARN: "Spec has uncertainties marked above"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
Ali is a 165cm, 83kg CrossFit athlete (target: 72kg) training 4-5x/week at Dutch gyms, shopping at AH/Jumbo. He follows strict halal dietary restrictions, targets 170g protein daily, and alternates between training days (2000 kcal, 220g carbs) and rest days (1750 kcal, 120g carbs). He batch cooks every 2-3 days using an Instant Pot, prefers simple meal templates (2 meals + 1 shake), and needs pre-WOD fuel (whey + banana) and post-WOD recovery nutrition. His current successful foods include chicken breast, kwark/skyr, tuna, rice, eggs, and he optimizes for protein per euro while avoiding honey and maintaining fiber intake 25-35g/day.

### Acceptance Scenarios
1. **Given** Ali wants halal protein sources under €2/100g, **When** he applies halal+protein filter, **Then** system filters from 14,814 halal products and 15,447 protein-analyzed products showing matches sorted by efficiency
2. **Given** Ali finished CrossFit training, **When** he applies post-workout filter, **Then** system leverages existing 13,145 post-workout analyzed products to show optimal carb:protein ratios
3. **Given** Ali is in cutting phase, **When** he applies fat-loss filter, **Then** system uses existing 10,440 fat-loss compatible products to show high-satiety, low-calorie options
4. **Given** Ali has €15 budget and needs 170g protein daily, **When** he applies budget filter, **Then** system shows halal protein sources optimized for protein per euro (chicken breast, kwark, tuna, eggs) with portion calculations
5. **Given** Ali runs CLI with multiple filters, **When** transform executes, **Then** system generates separate JSONL files for each filter combination with statistics

### Edge Cases
- What happens when products have incomplete nutrition data for protein filtering?
- How does system handle products with questionable halal status (unclear ingredients like gelatin sources)?
- What happens when no halal products meet protein efficiency thresholds for post-workout needs?
- How does system handle Ali's specific dislikes (honey sensitivity, tuna+rice combinations)?
- What happens when batch cooking requirements (2-3 day storage) conflict with fresh food preferences?

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST provide filtering capability that accepts multiple criteria and returns products matching ALL conditions
- **FR-002**: System MUST extend existing halal analysis system (currently covering 19,127 products with 14,814 halal classifications) to support advanced filtering
- **FR-003**: System MUST leverage existing protein optimization scoring (15,447 products analyzed) for protein filtering with configurable thresholds
- **FR-004**: System MUST filter using existing postWorkoutOptimization fields (13,145 products computed) for carb:protein ratio optimization and recovery window assignment
- **FR-005**: System MUST filter using existing fatLossCompatibility fields (10,440 products computed) for calorie density classification and satiety efficiency
- **FR-006**: System MUST generate separate output files automatically for each filter combination (halal-protein.jsonl, halal-postworkout.jsonl, etc.)
- **FR-007**: System MUST maintain original product data structure in filtered outputs for compatibility
- **FR-008**: System MUST generate statistics files showing product counts, coverage percentages, and exclusion reasons for each filter
- **FR-009**: System MUST create searchable index files for each filtered output for fast frontend loading
- **FR-010**: System MUST extend existing CLI interface (supporting --format ui) to include filter specification flags
- **FR-011**: System MUST allow custom filter parameters via CLI integration with existing argument parsing system
- **FR-012**: System MUST provide detailed filtering statistics and data quality metrics
- **FR-013**: System MUST process 30,498 products and generate all filtered outputs maintaining existing <10 second performance baseline
- **FR-014**: System MUST preserve backward compatibility with existing transform pipeline without modifying core processing
- **FR-015**: System MUST handle incomplete product data gracefully, excluding products from relevant filters with proper logging
- **FR-016**: System MUST support training vs rest day context filtering (2000 kcal/220g carbs vs 1750 kcal/120g carbs targets)
- **FR-017**: System MUST enable portion-aware filtering using realistic serving sizes (200g kwark, 150g chicken, 15g nuts) rather than per-100g abstractions
- **FR-018**: System MUST accommodate Ali's food combination preferences (tuna+potato preferred over tuna+rice) in meal context filtering

### Key Entities *(include if feature involves data)*
- **FilterCriteria**: Configuration object leveraging existing scoring thresholds and halal classification systems
- **FilteredProduct**: Standard Product object from existing pipeline with filtering match indicators
- **FilterStatistics**: Metrics extending existing stats.json structure with filter-specific coverage data
- **FilterOutput**: JSONL output maintaining compatibility with existing products.jsonl and products-index.json structure

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
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
- [x] Review checklist passed

---
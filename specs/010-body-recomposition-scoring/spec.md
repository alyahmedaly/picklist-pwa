# Feature Specification: Body Recomposition Scoring Enhancement

**Feature Branch**: `010-body-recomposition-scoring`
**Created**: 2025-09-19
**Status**: Draft
**Input**: User description: "Part 2 - Body Recomposition Scoring: Post-workout optimization (fast carbs + protein scoring for recovery), Fat loss friendly (lower calorie density with high satiation), Enhanced calorie efficiency system, Body composition context integration with meal timing awareness"

## Execution Flow (main)
```
1. Parse user description from Input
   � Identified: body recomposition, post-workout nutrition, fat loss optimization, calorie efficiency, meal timing
2. Extract key concepts from description
   � Actors: users with body composition goals (cutting, bulking, recomposition)
   � Actions: scoring products for workout recovery, fat loss support, efficiency optimization
   � Data: nutrition profiles, meal timing context, body composition goals
   � Constraints: existing protein (170g target) and satiety scoring systems
3. For each unclear aspect:
   � Calorie density thresholds: <125 kcal/100g (low), 125-225 kcal/100g (moderate), >225 kcal/100g (high)
   � Fast carbs defined as: high glycemic index foods (GI >70) including glucose, dextrose, white rice, white bread, dates, watermelon
   � Meal timing windows: Pre-workout (1-3h before), Post-workout (0-2h after), General meals (>3h from workout)
4. Fill User Scenarios & Testing section
   � Primary flow: user seeking optimized food choices for body recomposition goals
5. Generate Functional Requirements
   � Each requirement targets specific scoring enhancement
6. Identify Key Entities
   � Body composition contexts, meal timing windows, efficiency metrics
7. Run Review Checklist
   � Resolved: calorie density, fast carb, and meal timing definitions clarified using evidence-based thresholds
8. Return: SUCCESS (spec ready for planning with clarifications needed)
```

---

## � Quick Guidelines
-  Focus on WHAT users need and WHY
- L Avoid HOW to implement (no tech stack, APIs, code structure)
- =e Written for business stakeholders, not developers

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
Ali is following a body recomposition program (building muscle while losing fat) and needs intelligent food scoring that adapts to his training schedule and body composition goals. When planning meals, he needs products scored for post-workout recovery (fast carbs + protein), fat loss compatibility (high satiation with lower calories), and overall calorie efficiency. The system should understand meal timing context to provide relevant recommendations.

### Acceptance Scenarios

**Scenario 1: Post-Workout Recovery Optimization**
- **Given** Ali just finished a workout and white rice (GI=90, 3:1 carb:protein ratio)
- **When** he searches for recovery foods in post-workout context
- **Then** white rice receives postWorkoutScore=82 (base 70 × 1.17 GI multiplier) with confidence=85%
- **And** recovery window shows "optimal 0-2h post-workout"

**Scenario 2: Fat Loss Phase Prioritization**
- **Given** Ali is cutting (fat loss phase) and Greek yogurt (120 kcal/100g, satiety=65)
- **When** he browses food options in cutting context
- **Then** Greek yogurt receives fatLossScore=78 (density=low × satiety efficiency 1.45)
- **And** calorieDensityClass="low" with confidence=90%

**Scenario 3: Context-Aware Meal Timing**
- **Given** Ali plans breakfast with oatmeal (medium GI, 15g protein/100g)
- **When** he views recommendations in general meal context vs post-workout
- **Then** general context: efficiencyScore=71, postWorkoutScore=58
- **And** post-workout context: efficiencyScore=71, postWorkoutScore=68 (1.17× boost)

**Scenario 4: Enhanced Calorie Efficiency Comparison**
- **Given** Ali compares chicken breast (165 kcal, 31g protein) vs processed protein bar (380 kcal, 20g protein)
- **When** he evaluates calorie efficiency
- **Then** chicken breast: efficiencyScore=89 (high protein density + minimal processing)
- **And** protein bar: efficiencyScore=54 (lower protein density + NOVA 4 penalty)

**Scenario 5: Conflict Resolution**
- **Given** Product X scores postWorkout=85, fatLoss=32, efficiency=78 (high conflict, σ=27)
- **When** Ali uses "balanced" conflict resolution in general context
- **Then** finalScore=67 with conflictPenalty=0.92 and recommendationPriority="recovery"
- **And** conflict warning displayed: "Mixed optimization - better for post-workout than fat loss"

### Edge Cases
- What happens when a product scores high for post-workout but low for fat loss goals?
- How does the system handle products with missing carbohydrate data for fast-carb analysis?
- What occurs when meal timing context conflicts with body composition goal recommendations?

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST score products for post-workout recovery optimization based on fast carb and protein content ratios
- **FR-002**: System MUST identify and boost scoring for products with high glycemic index carbs (GI >70): glucose, dextrose, white rice, white bread, dates, watermelon
- **FR-003**: System MUST calculate fat loss compatibility scores prioritizing high satiation with lower calorie density
- **FR-004**: System MUST define calorie density thresholds for "fat loss friendly" classification: low (<125 kcal/100g), moderate (125-225 kcal/100g), high (>225 kcal/100g)
- **FR-005**: System MUST provide enhanced calorie efficiency scoring beyond basic nutrient-to-calorie ratios
- **FR-006**: System MUST integrate body composition context awareness (cutting, bulking, maintenance, recomposition)
- **FR-007**: System MUST support meal timing context integration: Pre-workout (1-3h before), Post-workout (0-2h after), General meals (>3h from workout)
- **FR-008**: System MUST maintain backward compatibility with existing protein density (170g target) and satiety scoring
- **FR-009**: System MUST provide contextual scoring recommendations that adapt to user's current body composition phase
- **FR-010**: System MUST handle scoring conflicts when product optimization varies between contexts (e.g., good for post-workout but poor for fat loss)

### Key Entities *(include if feature involves data)*
- **Body Composition Context**: Represents user's current phase (cutting/bulking/recomposition) with associated scoring priorities
- **Meal Timing Window**: Defines temporal contexts (pre-workout, post-workout, general meals) with specific nutritional emphasis
- **Recovery Optimization Score**: Measures product suitability for post-workout nutrition based on carb-to-protein ratios and absorption speed
- **Fat Loss Compatibility Score**: Evaluates product's alignment with fat loss goals through satiation-to-calorie efficiency
- **Enhanced Calorie Efficiency Metric**: Multi-dimensional efficiency scoring incorporating micronutrient density, satiation, and metabolic impact

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
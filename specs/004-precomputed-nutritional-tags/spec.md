# Feature Specification: Precomputed Nutritional Tags for AH Netherlands Products

**Feature Branch**: `004-precomputed-nutritional-tags`
**Created**: 2025-01-16
**Status**: Draft
**Input**: User description: "Add computed nutritional tags to products based on Dutch/EU dietary standards including netCarbs, lowCarb, highProtein, lactoseFree, glutenFree, vegan, vegetarian, plantBased with proper thresholds and dietary analysis"

## Execution Flow (main)
```
1. Parse user description from Input
   ’ Feature clear: nutritional tags for AH Netherlands products
2. Extract key concepts from description
   ’ Actors: AH customers seeking dietary-specific products
   ’ Actions: compute tags, classify products, apply thresholds
   ’ Data: nutritional values, ingredients, Dutch dietary standards
   ’ Constraints: EU regulations, Dutch food labeling standards
3. For each unclear aspect:
   ’ All aspects sufficiently clear from context
4. Fill User Scenarios & Testing section
   ’ Clear user flows for dietary product discovery
5. Generate Functional Requirements
   ’ 18 testable requirements covering all tag types
6. Identify Key Entities
   ’ NutritionalTags, Dutch dietary standards, ingredient patterns
7. Run Review Checklist
   ’ No ambiguities remain, business-focused requirements
8. Return: SUCCESS (spec ready for planning)
```

---

## ¡ Quick Guidelines
-  Focus on WHAT users need and WHY
- L Avoid HOW to implement (no tech stack, APIs, code structure)
- =e Written for business stakeholders, not developers

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As an AH Netherlands customer with specific dietary needs, I want to quickly identify products that match my dietary requirements (low-carb, high-protein, vegan, gluten-free, etc.) without having to manually read and calculate nutritional information and ingredient lists for every product.

### Acceptance Scenarios
1. **Given** a customer searching for low-carb products, **When** they browse the product catalog, **Then** products with less than 10g net carbs per 100g are clearly tagged as "lowCarb"
2. **Given** a customer looking for high-protein foods, **When** they view product details, **Then** products with 20g or more protein per 100g display "highProtein" tag
3. **Given** a vegan customer shopping, **When** they filter products, **Then** only products free from all animal-derived ingredients show "vegan" tag
4. **Given** a customer with lactose intolerance, **When** they search for dairy-free options, **Then** products without milk allergens and lactose ingredients show "lactoseFree" tag
5. **Given** a customer tracking net carbs, **When** they view nutritional information, **Then** calculated net carbs value (total carbs minus fiber) is displayed
6. **Given** a customer comparing protein density, **When** they browse products, **Then** products are categorized as low/moderate/high protein density
7. **Given** a customer seeking high-fiber foods, **When** they view products, **Then** items with 6g or more fiber per 100g show "highFiber" tag (EU standard)

### Edge Cases
- What happens when nutritional data is incomplete or missing?
- How does system handle products at threshold boundaries (exactly 10g net carbs)?
- How are multi-ingredient products with mixed dietary compliance classified?
- What happens when Dutch ingredient terminology is ambiguous?
- How does system handle products with "may contain" allergen warnings?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-NT-001**: System MUST calculate net carbs as total carbohydrates minus dietary fiber for all products with complete nutritional data
- **FR-NT-002**: System MUST categorize net carbs into buckets: very_low (<2g), low (2-5g), moderate (5-10g), high (10-20g), very_high (>20g) per 100g
- **FR-NT-003**: System MUST tag products as "lowCarb" when net carbs are less than 10g per 100g
- **FR-NT-004**: System MUST tag products as "highProtein" when protein content is 20g or greater per 100g (Dutch fitness standard)
- **FR-NT-005**: System MUST tag products as "highFiber" when fiber content is 6g or greater per 100g (EU high fiber regulation)
- **FR-NT-006**: System MUST categorize protein density as low (<10g), moderate (10-20g), or high (e20g) per 100g
- **FR-NT-007**: System MUST provide protein density buckets: very_low (<5g), low (5-10g), moderate (10-20g), high (20-30g), very_high (>30g) per 100g
- **FR-NT-008**: System MUST identify lactose-free products by checking absence of milk allergens AND lactose-containing ingredients
- **FR-NT-009**: System MUST identify gluten-free products by checking absence of wheat, rye, barley, and oat allergens
- **FR-NT-010**: System MUST identify vegan products by analyzing ingredients for absence of all animal-derived components
- **FR-NT-011**: System MUST identify vegetarian products by analyzing ingredients for absence of meat and fish while allowing dairy and eggs
- **FR-NT-012**: System MUST identify plant-based products where plant ingredients comprise more than 80% of the ingredient list
- **FR-NT-013**: System MUST recognize Dutch ingredient terminology for accurate dietary classification (melk, ei, vis, vlees, etc.)
- **FR-NT-014**: System MUST handle decimal comma notation in Dutch nutritional data (12,5g ’ 12.5g)
- **FR-NT-015**: System MUST only compute nutritional tags for products classified as food (not household items)
- **FR-NT-016**: System MUST provide fallback behavior when nutritional data is incomplete (omit affected tags)
- **FR-NT-017**: System MUST respect EU food labeling regulations for threshold-based claims
- **FR-NT-018**: System MUST track statistics on tag distribution across the product catalog

### Key Entities *(include if feature involves data)*

- **NutritionalTags**: Contains computed dietary and nutritional classifications including net carbs value, carb/protein buckets, and boolean dietary flags (vegan, gluten-free, etc.)
- **Dutch Dietary Standards**: Reference thresholds and ingredient patterns specific to Netherlands market including EU regulations and local dietary preferences
- **Ingredient Analysis Patterns**: Dutch language patterns for identifying animal products, allergens, and dietary restrictions in ingredient lists
- **Nutritional Thresholds**: Specific values defining high/low classifications based on per-100g serving sizes according to EU and Dutch standards

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
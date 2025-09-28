# Contract: Localization Schema Additions

## Scope
Document additive stats counters and documentation subsection; no API endpoints (CLI pipeline).

## Acceptance
- Stats JSON must include numeric keys: `dutchAllergenProducts`, `decimalCommaNormalizedCount` when >0; MUST still include key with 0 if none encountered for determinism.
- Schema doc (`schema.md`) must gain a "Localization" subsection enumerating Dutch tokens (allergens, placeholders, sweeteners).

## Tests (Contract Level)
1. Generate transform on fixture containing Dutch-only allergen; assert stats.dutchAllergenProducts = 1.
2. Numeric with decimal comma present; assert stats.decimalCommaNormalizedCount increments.
3. Schema doc regeneration includes Localization heading.

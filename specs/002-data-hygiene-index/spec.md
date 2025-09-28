# Feature Specification: Data Hygiene & Index Refinement

**Feature Branch**: `002-data-hygiene-index`  
**Created**: 2025-09-15  
**Status**: Draft  
**Input**: User description: "Data hygiene & index refinement: filter placeholder tokens, refine isFood classification, allergen whitelist & URL filtering, skip incomplete products in index, optional omission of empty fields while preserving deterministic hashing."

## User Scenarios & Testing

### Primary User Story
As a consumer of the JSONL + index artifacts, I need cleaner, semantically accurate lightweight index entries and product records so downstream search & analytics aren’t polluted by placeholder values, misclassified household items, or spurious allergen data.

### Acceptance Scenarios
1. Given a CSV row with ingredients field = "NA", When the transform runs, Then the product `ingredients` array is omitted (or empty) and not literally `["NA"]` in JSONL.
2. Given a household cleaning product category, When the transform runs, Then `flags.isFood` is false in the JSONL and index.
3. Given an allergen string containing URLs (e.g., `"Contains: https://static/foo"`), When parsed, Then the URL token is discarded and not included in `allergens.contains` or `mayContain`.
4. Given a product missing `id` or `name`, When building the index, Then the product is skipped (no `{ "isFood": true }` stub entries appear).
5. Given two consecutive runs on identical input, When empty-field omission logic is enabled, Then product hashes remain stable (deterministic canonical ordering & serialization preserved).

### Edge Cases
- All tokens in ingredients are placeholders ("NA", "n/a", "None"): output omits the field entirely.
- Mixed valid + placeholder tokens: only valid tokens retained; if none remain field omitted.
- Allergen line with both valid allergen and URL: valid allergen kept, URL dropped.
- Product with only whitespace name → treated as missing name → excluded from index entry.
- Omitted optional fields must not cause hash collision changes except via canonical omission rule; regression test ensures identical hashes pre/post feature for unchanged semantics.

## Requirements

### Functional Requirements
- **FR-DH-001**: Transformer MUST strip placeholder tokens (case-insensitive: `NA`, `N/A`, `NONE`, `NULL`, `-`) from ingredients; if resulting list empty, omit `ingredients` key.
- **FR-DH-002**: Transformer MUST apply an allergen whitelist (`milk, lactose, egg, soy, wheat, gluten, barley, rye, oats, fish, shellfish, crustacean, mollusk, peanut, tree nut variants (almond, walnut, cashew, hazelnut, pecan, pistachio, macadamia, brazil), sesame, celery, mustard, sulfite, lupin`) and drop non-whitelisted tokens from `allergens.contains` while preserving order normalized to lowercase singular forms.
- **FR-DH-003**: Allergen parser MUST drop URL-like tokens matching `^https?://` from both contains/mayContain.
- **FR-DH-004**: Classification MUST set `flags.isFood = false` when primary category path includes any household / cleaning / paper / tissue / bleach keywords (`huishouden`, `schoonmaak`, `bleek`, `tissues`, `servetten`, `afwas`, `vuilnis`, `zakken`).
- **FR-DH-005**: Index builder MUST skip products missing any of (`id`, `name`, numeric price) and MUST NOT output stub objects.
- **FR-DH-006**: Index entries MUST include only fields: `id`, `name`, `price`, `categories`, `isFood` (omit `image` until real data present).
- **FR-DH-007**: JSONL writer MAY omit keys for empty objects/arrays among (`nutrition`, `duplicate_conflicts`, `ingredients`, `allergens.contains` / `allergens.mayContain` if both empty → omit `allergens`) provided hashing canonicalization ignores absent vs empty equivalence OR hash spec updated & tests adapted.
- **FR-DH-008**: Deterministic hashing MUST remain stable for unchanged semantic products; regression test comparing previous and new hashes for a fixture must pass (except where omission removes previously placeholder-only content — document changed hashes count).
- **FR-DH-009**: Schema doc MUST add a section "Hygiene Rules" listing placeholder tokens and allergen whitelist.
- **FR-DH-010**: Stats MUST count how many products were skipped from index due to incompleteness (`skippedIndexEntries`).

### Key Entities
- **Product (JSONL)**: Adds conditional omission rules; semantics unchanged for meaningful data.
- **IndexEntry**: Now stricter; excludes incomplete or non-food-only entries; field set narrowed.
- **Stats Extension**: Adds integer `skippedIndexEntries`.

## Review & Acceptance Checklist

### Content Quality
// Review performed 2025-09-15
- [x] No implementation details (algorithm specifics minimal; tech cited only where naming unavoidable)
- [x] User-value focused
- [x] Mandatory sections completed

### Requirement Completeness
- [x] All FR-DH-* testable
- [x] Ambiguities resolved (none marked)
- [x] Canonical hashing impact assessed
- [x] Dependencies (existing transform pipeline) identified

## Execution Status
- [ ] User description parsed
- [ ] Key concepts extracted
- [ ] Ambiguities marked (none)
- [ ] User scenarios defined
- [ ] Requirements generated
- [ ] Entities identified
- [ ] Review checklist passed

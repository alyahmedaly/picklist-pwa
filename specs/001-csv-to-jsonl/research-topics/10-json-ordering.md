# Research Topic: JSON Key Ordering

## Question
How to define and enforce canonical key order for product JSON objects to guarantee deterministic serialization & hashing?

## Constraints
- Hash excludes `hash` field but ordering must still place it last.
- Readability secondary to stability.

## Ordering Strategy
1. Identity & provenance first
2. Core descriptive fields
3. Nutrition block (grouped logically)
4. Derived flags & classifications
5. Arrays / categories
6. Size & quantity
7. Allergen info
8. Stats / meta (if any retained) then hash

## Proposed Order (flat keys)
```
product_id
gtin
brand
name
description
category_primary
categories
size_count
size_per_item_base
size_per_item_unit
size_total_base
size_total_unit
energy_kcal
energy_kj
fat_total
fat_saturated
carbohydrates_total
sugars_total
fiber
protein
salt
sodium
added_sugar_flag
added_salt_flag
artificial_sweeteners_flag
allergens_definitive
allergens_may
allergens_tree_nut_detail
duplicate_conflicts
hash
```

## Notes
- Numeric nutrition keys grouped and ordered by label importance
- `duplicate_conflicts` included only if non-empty; still has slot to stabilize ordering (absent fields simply omitted but order of present keys must follow list)
- Arrays serialized as JSON arrays with deterministic element ordering prior to hash

## Enforcement Mechanism
serializeProduct(obj):
1. Iterate ORDER array; for each key if key in obj and value not undefined -> push `"key":serializedValue` to buffer.
2. After loop, if hash not yet computed -> compute on joined buffer without trailing hash, then append hash field.
3. Join with commas, wrap with `{}` (no spaces) for minimal form.

## Test Cases
- Product missing optional fields still maintains order of those present.
- Adding a new optional key outside defined list requires updating ordering spec test to fail until added.
- Reordering internal object before serialization does not affect output.

## Decision
Adopt explicit ordering array constant with tests that fail on divergence. Place `hash` last. Omitted optional keys simply skipped without affecting relative order of remaining keys.

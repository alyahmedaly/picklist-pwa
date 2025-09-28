# Research Topic: Duplicate Conflict Heuristics

## Question
How to deterministically merge duplicate product rows (same product ID) while detecting and reporting conflicting data?

## Data Needed
- Fields eligible for fill-forward vs conflict
- Policy for arrays, numeric discrepancies, textual variations

## Principles
- First occurrence is authoritative baseline
- Later rows may fill null/empty fields only
- Conflicting non-empty differing values produce conflict log & counter

## Field Categories
1. Immutable identity: product_id, gtin, brand (if brand differs -> conflict)
2. Descriptive text: name, description -> fill if baseline empty else conflict if different (case-insensitive compare after trim)
3. Numeric nutrition: prefer first; if later value present and baseline missing -> use; if both present and differ beyond tolerance -> conflict
4. Flags / derived booleans: recomputed from final merged raw fields (not individually merged)
5. Arrays (e.g., categories, tags): union (order deterministic sorted) but if overlapping with different capitalization normalize lower before union
6. Units / size: if baseline empty and later provides parseable size -> adopt else if both parse & differ -> conflict

## Tolerances
- Numeric tolerance absolute 0 for now (exact match) except rounding differences: treat difference < 0.005 as same for values with <=2 decimals.

## Algorithm
merge(a,b): // a is accumulator
For each field:
- If a[field] is null/empty and b[field] non-empty -> a[field]=b[field]
- Else if both non-empty and different -> record conflict { field, first:a[field], other:b[field] }
Special cases:
- Arrays: norm tokens -> set = set(a) ∪ set(b); a[field] = sorted(list)
- Numeric: if diff <= tolerance -> skip conflict
Return a plus appended conflict list.

## Conflict Reporting
- Maintain per-field conflict counts
- Global duplicateGroups count
- Provide top N conflicting fields summary in stats

## Determinism
- Input order stable ensures consistent winner
- Sorting of arrays alphabetically
- Stable key order in conflict records

## Test Cases
- Row1 name="Apple Juice" Row2 name="Apple juice" (case diff) -> no conflict (case-insensitive same)
- Row1 energy_kcal=50 Row2 energy_kcal=50 -> no conflict
- Row1 energy_kcal=50 Row2 energy_kcal=51 -> conflict
- Row1 categories=["Drinks"] Row2 categories=["drinks","Organic"] -> merged ["drinks","Organic"] (normalized lower then capital policy? choose lower-case output for categories)
- Row1 size empty Row2 size parsed -> adopt

## Decision
Implement deterministic merge with first-row precedence, tolerance for near-identical numeric rounding, case-insensitive compare for text. Provide conflict registry for stats & optional logging. Arrays normalized to lower-case then sorted; output may apply case policy (choose lower-case). No late override of existing non-empty fields.

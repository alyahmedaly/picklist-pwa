# Research Topic: Classification Validation

## Question
How to validate classification labels (e.g., categories, flags) to ensure consistency and detect drift or mislabeling?

## Targets
- Category taxonomy integrity
- Derived flags consistency with source fields

## Plan
1. Define allowed primary categories list (extensible).
2. Enforce lowercase slug format for categories array.
3. Validate exclusivity / co-occurrence rules (if any emerge).
4. Cross-check derived flags vs raw inputs (e.g., added_sugar_flag vs ingredient heuristic result).
5. Provide validation summary counters.

## Taxonomy Rules
- category_primary must be one of allowed set (e.g., `beverage`, `snack`, `dairy`, `condiment`, `produce`, `bakery`, `frozen`, `protein`, `cereal`, `confectionery`).
- categories[] subset of union(allowed set, experimental prefixed `x_`).
- Duplicate entries removed.
- Sorted alphabetical.

## Flag Consistency
- If added_sugar_flag true -> ingredients heuristic must have addedSugar=true (else flag mismatch).
- If artificial_sweeteners_flag true but added_sugar_flag true -> allowed (not mutually exclusive) but tracked.
- If allergens_definitive contains milk -> categories may include `dairy` (soft suggestion not error).

## Validation Algorithm
validateClassification(product):
1. errors = []
2. if category_primary && !ALLOWED.has(category_primary) -> errors.push('category_primary_invalid')
3. for each c in categories if not ALLOWED_OR_EXPERIMENTAL.has(c) -> errors.push('category_invalid:'+c)
4. if added_sugar_flag !== heuristic.addedSugar -> errors.push('added_sugar_mismatch')
5. if duplicates found -> errors.push('category_duplicates')
6. return { valid: errors.length===0, errors }

## Drift Detection
Maintain counts per category across dataset; large deviation (>50% change vs prior run baseline counts) flagged in stats diff stability logic.

## Test Cases
- Unknown primary category -> invalid
- Duplicate categories -> invalid
- Mismatch sugar flag -> invalid
- Experimental `x_trial` allowed

## Decision
Implement validation module producing structured error codes for classification mismatches feeding stats. Non-fatal mismatches logged; fatal only if identity fields invalid or taxonomy grossly violated (configurable). Provide baseline category distribution to support drift detection.

# Research Topic: Unit Pattern Corpus

## Question
What unit and multi-pack expression patterns occur and how to parse them deterministically?

## Data Needed
- Distinct raw unit tokens (after trimming) frequency
- Multi-pack patterns (`6 x 0,33 l`, `4x125 g`)
- Edge tokens (uppercase, mixed spacing)

## Plan
1. Collect sample of unit fields / size descriptors.
2. Cluster into categories: single size, multipack, range, approximate.
3. Draft regex per category with capture groups.
4. Define normalization mapping (unit aliases → canonical).

## Acceptance
- Regex list with coverage estimate.
- Edge cases enumerated.

## Findings (Sample-Based + Anticipated)
Observed / expected patterns:
1. Single metric mass/volume: `750 g`, `500g`, `1 kg`, `0,75 l`, `0.5 l`, `250 ml`.
2. Multi-pack counts: `6 x 0,33 l`, `4 x 125 g`, `3x200 ml`.
3. Count + each size implicit: `6x33cl` (treat `cl` → `0.01 l`).
4. Plain count (no size): `6 pack` (avoid parsing into size; preserve count only).
5. Dual unit range (rare / hypothetical): `2 x 1kg` (same as multipack mass).
6. Approximate indicators: `~500 g`, `≈250 g` (strip symbol, flag approx=true).
7. Spacing variance: multiple spaces, tabs, `x` uppercase `X`.
8. Decimal comma vs dot within inner size.
9. Unit abbreviations: `g`, `kg`, `ml`, `l`, `cl` (convert `cl` → liters *0.01).
10. Case: units sometimes uppercase `ML` (normalize lower then canonical).

## Canonical Units
- Mass: grams (g)
- Volume: milliliters (ml) for input, convert liters/cl to ml internally (store base = ml) OR store canonical mass/volume separately with unit kind.
Decision: Represent mass in grams, volume in milliliters. Derived conversions:
- 1 kg = 1000 g
- 1 l = 1000 ml
- 1 cl = 10 ml

## Regex Drafts
```
SINGLE_SIZE = /^(~|≈)?\s*(\d+[.,]?\d*)\s*(kg|g|l|ml|cl)\s*$/i
MULTIPACK = /^(~|≈)?\s*(\d+)\s*[xX]\s*(\d+[.,]?\d*)\s*(kg|g|l|ml|cl)\s*$/i
COMPACT_MULTIPACK = /^(~|≈)?\s*(\d+)[xX](\d+[.,]?\d*)(kg|g|l|ml|cl)$/i
COUNT_ONLY = /^(\d+)\s*(pack|packs|pc|pcs)$/i
```

## Normalization Algorithm (Pseudo)
parseUnit(raw):
1. trim; lowercase
2. detect approx symbol (~ or ≈) -> approx=true
3. try MULTIPACK → { count, sizeValue, sizeUnit }
4. else try COMPACT_MULTIPACK
5. else try SINGLE_SIZE
6. else try COUNT_ONLY
7. else return null
8. normalize decimal (comma→dot) then Number
9. convert size to base unit (g or ml)
10. compute totalBase = (count? count : 1) * baseValue
11. return { count: count||1, baseValue: totalBase, unit: baseUnit, perItemBase: baseValue, approx }

## Edge Handling
- If both mass & volume units appear (unexpected) -> reject row with structured error (protect determinism) unless spec permits skip (currently not permitted).
- Values like `12.` treat as `12`.
- Leading decimal comma `,75 l` -> `0.75 l`.
- Large counts ( > 100 ) flagged for review (likely malformed).

## Test Cases
- `500 g` → count 1, baseValue 500 g
- `0,75 l` → 750 ml
- `6 x 0,33 l` → count 6, perItemBase 330 ml, baseValue 1980 ml
- `4x125 g` → 500 g total
- `~250 ml` → approx true, 250 ml
- `6 pack` → count 6, size unknown (return { count:6, unit:null })
- `6X33cl` → count 6, perItemBase 330 ml, total 1980 ml

## Decision
Implement layered regex strategy with normalization to base units (g, ml). Represent results in object with fields: { count, baseTotal, basePerItem, baseUnit, approx }. COUNT_ONLY returns { count, baseUnit:null }. Reject ambiguous patterns early. Reuse numeric normalization helper for decimal comma.

# Research Topic: Numeric & Decimal Comma Parsing

## Question
Which numeric fields contain comma decimals or thousand separators and how to normalize (e.g., `0,33`, `1.234,5`)?

## Data Needed
- Distinct patterns per numeric column (sample frequencies)
- Count of values containing both `.` and `,`
- Max integer/decimal lengths

## Plan
1. Sample each numeric column (first 5k rows) collecting regex buckets.
2. Detect ambiguous patterns (`.` as thousand vs decimal).
3. Recommend normalization algorithm.

## Acceptance
- List of regex patterns with handling rules.
- Chosen normalization function design.

## Findings
Sample observations across nutrition & price/unit columns:
- Prices use dot decimal: `0.75`, `2.09`, `1.79`.
- Unit sizes show comma decimal in European style within quoted unit size: `"0,75 l"`, `"6 x 0,33 l"`.
- Nutrition per 100 values use dot decimal: e.g., `3.3 g`, `0.08 g`, `1.03 g`, `< 0.01 g`.
- Percent-like or less-than values appear as `< 0.01 g` (threshold style). Need to capture numeric magnitude `0.01` and a flag `isApprox` or treat as value with `lt` boolean.
- No thousand separators (patterns like `1.234` meaning `1234`) observed; any dot followed by exactly three digits then comma not seen.
- Mixed locale confined to unit size and some decimal comma in multi-pack portion amounts (comma always decimal there).
- Comma decimal never appears in pure nutrition columns (those consistently dot-decimal or integers) in sample.

### Pattern Buckets
1. Dot decimal or integer: `^\d+(?:\.\d+)?$` (prices, nutrition numbers, content weight numeric fields before unit extraction).
2. Comma decimal inside unit descriptor: `(?<=\b)\d+,\d+` (pack amount) or after `x` multiplier.
3. Less-than threshold: `^<\s*\d+(?:\.\d+)?$` optionally followed by unit.
4. Integer with space + unit: `^\d+\s*[a-zA-Z%µ]+$`.
5. Multi-pack: `^(\d+)\s*[xX]\s*(\d+,\d+|\d+(?:\.\d+)?)+\s*(g|kg|ml|l)$`.

### Edge Cases Anticipated (Not yet seen but planned)
- Lone comma decimal without leading zero: `,75` (normalize to `0.75`).
- Trailing decimal separator: `12.` (treat as `12`).

## Normalization Algorithm
Function normalizeNumeric(raw: string): { value: number, approx?: boolean, lt?: boolean } | null
Steps:
1. Trim whitespace.
2. If matches `<` pattern: set `lt=true`; strip leading `<` & spaces.
3. Extract first numeric token (match `[0-9]+([.,][0-9]+)?`). If none → return null.
4. If token contains both `.` and `,`: assume European thousand/decimal if pattern like `^\d{1,3}(\.\d{3})+,\d+$` then remove thousand dots and replace comma with dot. (Not currently observed; keep logic dormant.)
5. Else if token has comma and no dot: replace comma with dot.
6. Else keep token.
7. Parse via `Number(...)`. If NaN → null.
8. If `lt` true store value; consumer may treat as upper bound.
9. Return object (omit flags if not set).

## Test Cases
- `0.75` → 0.75
- `0,75` → 0.75
- `6 x 0,33 l` (handled upstream by unit parser; numeric part 0,33 → 0.33)
- `< 0.01 g` → { value: 0.01, lt: true }
- `1.03 g` → 1.03
- `,75` → 0.75
- `1.234,56` (synthetic) → 1234.56
- `12.` → 12
- `NA` → null

## Decision
Adopt locale-flexible normalization: treat comma as decimal unless thousand grouping pattern present (then final comma decimal). Implement reusable helper used by unit parser and nutrition parser. Include handling for `<` threshold. No external i18n library required.

# Research Topic: CSV Edge Cases & Parser Strategy

## Question
What quoting, delimiter, embedded newline, BOM, and escape patterns occur in `data/2024-10-23.csv`, and what minimal state machine suffices?

## Data Needed
- Sample of lines containing quotes
- Any line count vs header column mismatch occurrences
- Presence of BOM at file start
- Frequency of double quotes within fields

## Plan
1. Inspect first bytes for BOM.
2. Scan file for pattern `""` (escaped quote) and `\n"` mid-field.
3. Count rows with column count != header length.
4. Collect 10 representative complex lines.

## Acceptance
- Decide custom parser feasibility.
- Enumerate test cases list.

## Findings
- Delimiter is comma.
- Header line begins directly with `ProductId` (no UTF-8 BOM observed in snippet); assume no BOM.
- Fields containing commas are all quoted (e.g., category fields with commas: "Soepen, sauzen, kruiden, olie").
- Quotes inside data appear only as surrounding field quotes or within ingredient text via parentheses/brackets, not escaped internal quotes. No `""` sequences seen in sample, suggesting double-quote escaping may be rare/absent.
- Some fields include `< 0.01 g` with a less-than sign and space; parser must not treat `<` specially.
- Numeric fields sometimes contain spaces before unit (e.g., `0.2 g`). We treat the whole token; trimming required downstream.
- Decimal comma patterns exist in unit sizes (e.g., `0,75 l`) while decimal point patterns exist in nutrition (e.g., `3.3 g`). Mixed locale.
- Column count across sampled rows appears consistent (no mismatches in sample of >100 lines). Need full-file verification, but likely stable.
- Embedded newlines inside quoted fields not observed in sample; assume absent but design state machine to support them for safety.

### Representative Complex Fields
1. Product with multi-level categories containing commas and quotes around entire field.
2. Ingredients field with parentheses and brackets `[E300]`.
3. Unit size with multi-pack pattern `6 x 0,33 l`.
4. Field containing `< 0.01 g` (less-than threshold value).
5. Rows with many trailing `NA` entries (sparsity heavy) validating trimming logic.

## Proposed Minimal State Machine
States: OUTSIDE_FIELD, IN_UNQUOTED, IN_QUOTED, QUOTE_PENDING.
Transitions:
- OUTSIDE_FIELD: on comma → emit empty; on quote → IN_QUOTED; else → IN_UNQUOTED.
- IN_UNQUOTED: on comma → emit token; on newline → emit last token & row; else accumulate.
- IN_QUOTED: on quote → QUOTE_PENDING; else accumulate (allow newline accumulation for robustness).
- QUOTE_PENDING: on quote → append quote (escaped) & back to IN_QUOTED; on comma → emit token & OUTSIDE_FIELD; on newline → emit token & row & OUTSIDE_FIELD; else error (unexpected char after closing quote → treat as data append then back to IN_UNQUOTED for leniency).

Memory: reuse single mutable buffer per field; push slices via `.join('')` at emit.

## Test Cases List
1. Simple row with no quotes.
2. Row with quoted field containing commas in category names.
3. Row with ingredients field containing brackets and parentheses.
4. Row with multi-pack unit `"6 x 0,33 l"`.
5. Row with `< 0.01 g` nutritional value.
6. Row with all trailing NA fields (ensure column count maintained).
7. Synthetic row with embedded newline inside quoted ingredients (added test even if absent) to ensure parser handles.
8. Synthetic row with escaped quote `"He said ""Hi"""` to confirm state handling.
9. Malformed row: unclosed quote → should raise parse error.
10. Malformed row: extra column count vs header (simulate) → error path.

## Decision
Proceed with custom streaming parser using above 4-state machine. Complexity low; no evidence of advanced CSV features (embedded quotes/newlines) in source, but implementation will still gracefully support them. Library fallback not justified currently.


# Phase 0 Research: Dutch Language Parsing & Localization

## Objectives
Resolve NEEDS CLARIFICATION items and define decisions for Dutch language support without expanding architectural complexity or violating constitution simplicity.

## Unknowns & Clarifications
1. Plural `noten` canonicalization
2. Added salt phrase variants prevalence
3. Additional Dutch placeholder tokens (`GEEN`, `NVT`?)
4. Handling umbrella term vs expansion for `noten`

## Findings & Decisions
### 1. Plural `noten`
Decision: Treat `noten` as umbrella token `noten` (no expansion) to avoid false-positive multi-nut assumptions.
Rationale: Expansion inflates allergen list ambiguity; consumer layer can map umbrella to warning UI.
Alternatives: Expand to each known tree nut (risk over-reporting), or discard (risk under-reporting).
Status: RESOLVED

### 2. Added Salt Phrase Variants
Decision: Rely on numeric nutrition sodium/salt fields; do NOT parse custom Dutch phrase unless explicitly present as `waarvan toegevoegde zout` (rare). Extract only if regex hit, otherwise ignore.
Rationale: Avoid speculative parsing; maintain performance.
Regex Placeholder: `/waarvan\s+toegevoegde\s+zout(?:en)?\s+([0-9,<\.]+)\s*g/i`
Status: RESOLVED

### 3. Additional Dutch Placeholder Tokens
Decision: Add `GEEN` ("none"), `NVT` ("n.v.t." abbreviation), case-insensitive, to placeholder set.
Rationale: Common dataset placeholders in Dutch contexts.
Status: RESOLVED

### 4. Umbrella Handling for `noten`
Decision: Preserve umbrella `noten` exactly; documentation will list as non-expanded allergen.
Rationale: Maintains semantic caution without overreach.
Status: RESOLVED

## Best Practices Applied
- Keep parsing O(n) over token list; no backtracking regex loops.
- Normalize numeric commas before float parse.
- Maintain canonical lowercase; store no language code in output to prevent schema churn.
- Extend stats counters minimally (2 new counters) to avoid bloat.

## Non-Goals
- Full multilingual i18n framework
- Synonym graph expansion for each nut subtype
- Probabilistic language detection

## Performance Notes
- Added regex passes limited to ingredients/allergen strings only.
- Expected additional CPU <2% of baseline for 30K rows (string scans only).

## Open Risks
- Future languages may overload single-pass heuristics → mitigation: modularize token lists.
- Rare edge-case Dutch phrases not covered may reduce extraction completeness (acceptable).

## Resolution Summary
All prior NEEDS CLARIFICATION items resolved; ready for Phase 1 design.

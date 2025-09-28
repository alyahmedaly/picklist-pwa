# Changelog

## Unreleased
- Initial hygiene & index refinement (FR-DH-001..010)
- Deterministic hashing with omission normalization (FR-DH-007/008)
- Index emission guard & skippedIndexEntries stat (FR-DH-005/010)
- Schema doc hygiene rules section (FR-DH-009)
- Dutch language localization support (T014-T023)
  - Dutch allergen parsing with prefixes (BEVAT:, KAN SPOREN BEVATTEN VAN)
  - Decimal comma normalization (12,5 → 12.5)
  - Added sugar/salt phrase extraction from Dutch text
  - Dutch ingredient placeholder filtering (GEEN, NVT)
  - Dutch artificial sweetener detection (steviolglycosiden, zoetstof)
  - Multilingual food classification (bakkerij, huishouden, zuivel)
  - Inequality numeric parsing (< 0,01 g, ≤ 1,5 g)
  - Localization statistics counters (dutchAllergenProducts, decimalCommaNormalizedCount)

## 0.1.0 (2025-09-15)
### Added
- CSV → JSONL pipeline with canonical ordering & SHA-256 hash
- Ingredient & allergen hygiene normalization
- Negative keyword classification + debug gate
- Omission-based hash equivalence
- Baseline regression test harness

### Notes
Hash baseline locked post Phase 3.4; changes to hashing require intentional baseline update review.

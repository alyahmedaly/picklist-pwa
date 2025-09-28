# Data Model Extension: Dutch Localization Support

## Overview
No new top-level product fields; additive logic inside existing `Product` shape plus stats counters.

## Entities
### Product (existing)
No schema changes. Behavior modifications:
- `ingredients`: Added Dutch placeholder filtering (`geen`, `nvt`) and decimal comma normalization inside detection routines.
- `allergens.contains` / `allergens.mayContain`: Accept Dutch tokens; umbrella `noten` retained.
- `flags.isFood`: Now determined via multilingual heuristic.
- `added.addedSugarsPer100g`: Populated from Dutch phrase if present.

### Stats (existing object in stats.json)
Add fields:
- `dutchAllergenProducts: number` – count of products with at least one allergen sourced only from Dutch list.
- `decimalCommaNormalizedCount: number` – count of numeric values converted from comma to dot.

## Field Rules
| Field | Type | Rule |
|-------|------|------|
| ingredients | string[] | Filter placeholders (english + dutch); preserve order; no dedupe except placeholder removal |
| allergens.contains | string[] | Lowercase; pass whitelist (EN + NL); umbrella `noten` allowed |
| allergens.mayContain | string[] | Same normalization; advisory prefixes mapped |
| flags.isFood | boolean | Derived from categories matching EN or NL food keywords and absence of strong household negatives |
| added.addedSugarsPer100g | number? | Extract from Dutch regex if decimal comma/inequality; else unchanged |
| stats.dutchAllergenProducts | number | Increment if contains Dutch-only token (not present in English list) |
| stats.decimalCommaNormalizedCount | number | Increment per numeric conversion |

## Validation Impacts
`validateProduct` unchanged; new counters validated in stats aggregation logic tests.

## Non-Goals
- No language code field per token
- No per-allergen provenance metadata in output

## Backward Compatibility
Existing consumers unaffected: arrays may include Dutch strings but schema unchanged.

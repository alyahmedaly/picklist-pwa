# Heuristics Bundle

Bundle Date: 2025-09-19
Versions: GI: gi-v1, Micronutrient: micro-v1
Scope: Interim heuristic maps supporting body recomposition scoring (FORMULAE.md)

## Files
- `glycemic-index-map.json` – Representative GI medians + multiplier mapping
- `micronutrient-density-map.json` – Category baseline + ingredient bonuses + processing penalties

## Determinism Guarantees
1. Inputs normalized (lowercase, trim, remove accents) before lookup.
2. Highest GI override wins when multiple matches.
3. Ingredient bonuses summed then capped (30) to prevent inflation.
4. Diversity bonus uses distinct natural ingredients (exclude: additive codes, colorants, E-numbers, artificial sweeteners, generic fillers like "flavor").
5. All results clamped per file `clamp` definitions.

## Versioning Policy
- Increment minor (v1 -> v1.1) for additive changes (new ingredients) preserving previous outputs (except added coverage). 
- Increment major (v1 -> v2) for value changes affecting existing products.
- Stats should emit: `{ heuristics: { giVersion: "gi-v1", micronutrientVersion: "micro-v1" } }`.

## Integration Steps
1. Load JSON maps once at process start (no dynamic network I/O).
2. Build normalized lookup structures:
   - GI: `ingredientOverrides` prioritized, fallback `categoryDefaults`, else `defaultGI`.
   - Micronutrients: category -> base (fallback 40), scan ingredients -> bonuses, classify processing (prefer explicit NOVA else heuristic keyword detection).
3. Pass resolved GI value into GI->bucket->multiplier mapping in scoring function.
4. Pass micronutrient final score directly to efficiency formula.

## Processing Heuristic (If NOVA Absent)
- If ingredient list contains ≥3 of: `emulsifier`, `stabilizer`, `artificial`, `flavoring`, `color`, `sweetener`, assign provisional NOVA4 penalty (25).
- If contains `concentrate`, `isolate`, but minimal whole-food terms (<3), use NOVA3 (12).
- Else if whole-food dominant (≥5 recognized plant/animal items) -> NOVA2 (5) unless single-ingredient whole food -> NOVA1 (0).

## Confidence Interaction
- Micronutrient score absence -> efficiency confidence downgrade (see FORMULAE.md `confidenceComposite`).
- Emit diagnostic log when heuristic fallback triggered (`heuristic=fallback_base`).

## Extensibility Hooks
- Add `customOverrides` (user-provided) merged after default maps.
- Provide `--dump-heuristics` CLI flag to output active tables for audit.

## QA Checklist
- [ ] No duplicate keys in JSON
- [ ] All numeric fields finite
- [ ] Threshold logic matches FORMULAE.md definitions
- [ ] Versions exported in stats

## Migration Plan
When nutrient database integrated:
1. Keep heuristic as fallback behind `micronutrientDensityExact` field.
2. Compare distributions (KS test) to ensure monotonic mapping alignment.
3. Phase out bonus caps gradually (feature flag `MICRO_HEURISTIC_MODE=false`).

---
End README

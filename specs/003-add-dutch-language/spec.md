# Feature Specification: Dutch Language Parsing & Localization Enablement

**Feature Branch**: `003-add-dutch-language`  
**Created**: 2025-09-15  
**Status**: Draft  
**Input**: User description: "Extend transformer to robustly parse Dutch (NL) product data: ingredients, allergens, units, added sugar/salt statements, category classification, and numeric normalization (decimal commas) while preserving backward compatibility with existing English-focused heuristics and tests."

## User Scenarios & Testing *(mandatory)*

### Primary User Story
A data platform maintainer ingests a large Dutch supermarket CSV and needs the transformer to correctly interpret Dutch linguistic patterns (allergens, ingredients, units, numeric formats, category terms) so downstream applications receive consistent, language‑agnostic structured data without manual pre‑cleaning.

### Acceptance Scenarios
1. **Given** an ingredients string containing Dutch allergen indicators (e.g., "BEVAT: MELK, TARWE" or mixed case), **When** parsed, **Then** `allergens.contains` includes `melk`, `tarwe` normalized (lowercase singular) and excludes duplicates.
2. **Given** an allergen advisory like "KAN SPOREN BEVATTEN VAN EI EN NOTEN", **When** parsed, **Then** tokens `ei`, `noten` appear in `allergens.mayContain` (singularized to `ei`, `noot` where unambiguous) and are not placed in `contains`.
3. **Given** an ingredients paragraph with a Dutch added sugar clause (e.g., "Waarvan toegevoegde suikers 5 g per 100 g"), **When** processed, **Then** `added.addedSugarsPer100g` is extracted as numeric 5.
4. **Given** decimal comma nutritional values ("koolhydraten 12,5 g"), **When** parsed, **Then** the numeric field is stored as 12.5 (float) without parsing error.
5. **Given** a unit size string using Dutch forms ("6 x 0,33 l" or "per stuk" or "2 stuks"), **When** parsed, **Then** structured unit fields reflect packCount=6, amount=0.33, unit="l" or correctly capture count for "stuks"; ambiguous words like "per stuk" do not break parsing.
6. **Given** a category path containing Dutch non‑food household terms ("huishouden", "schoonmaak"), **When** classification runs, **Then** `flags.isFood` is false.
7. **Given** a food category expressed only in Dutch (e.g., "zuivel"), **When** classification runs, **Then** `flags.isFood` is true (no fallback to forced true logic required).
8. **Given** ingredients containing Dutch sweetener names ("zoetstof", "steviolglycosiden"), **When** parsed, **Then** `flags.added.artificialSweeteners` (or equivalent field) is true while preserving existing English detection.
9. **Given** allergen tokens mixed Dutch + English ("melk", "egg", "sesam"), **When** parsed, **Then** each is normalized and retained if in the combined multilingual whitelist.
10. **Given** a product row with only English allergens (legacy), **When** parsed after feature, **Then** legacy outputs remain unchanged (no regressions in existing tests).
11. **Given** ingredients list containing placeholder tokens and Dutch stop words, **When** parsed, **Then** placeholders are still removed but valid Dutch ingredients preserved (e.g., "water", "suiker", "havermout").
12. **Given** duplicate Dutch synonyms for same allergen across contains/mayContain (e.g., `pinda`, `aardnoot`), **When** parsed, **Then** canonical token chosen (TBD) and duplicates not repeated.
13. **Given** nutritional micronutrients with '<' inequality strings ("< 0,01 g"), **When** parsed, **Then** numeric value is stored as 0.01 and a flag (optional) or note is deferred (not in scope unless mandated) – no parse failure.
14. **Given** mixed-case allergen prefixes ("Bevat", "KAn BeVaTten"), **When** parsed, **Then** detection logic still splits correctly.
15. **Given** product rows processed in both EN and NL contexts, **When** hashing/ordering executes, **Then** canonical JSON ordering and omission rules produce stable deterministic hashes (except where new fields legitimately appear).

### Edge Cases
- Allergen strings containing both Dutch and English words separated by punctuation or slashes ("Bevat: melk/egg/soja") → all valid tokens retained distinctly.
- Ingredients paragraphs lacking explicit "Ingrediënten:" prefix but containing commas/semicolons → still tokenized using existing heuristics.
- Tokens with diacritics (if any appear) normalized to NFC and lowercased; no duplication due to unicode forms.
- Ambiguous plural forms ("noten") where singular mapping could be multiple tree nuts → kept as `noten` unless mapping curated; flagged as [NEEDS CLARIFICATION] if canonicalization required.
- Unexpected uppercase with numbers ("MELK2") → numeric-suffixed tokens ignored unless alphanumeric part matches whitelist.
- Decimal comma plus inequality ("<0,5") with no space → still normalized.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-NL-001**: System MUST support Dutch allergen whitelist additions (initial set: melk, ei, tarwe, gluten, soja, pinda, noten, hazelnoot, amandel, walnoot, cashew, pecannoot, pistache, macadamia, selderij, mosterd, sesam, vis, schaaldier, weekdier, lupine, sulfiet, gerst, rogge, haver) alongside existing English list; tokens normalized to lowercase.
- **FR-NL-002**: Allergen parser MUST recognize Dutch section prefixes (`bevat`, `kan sporen bevatten van`, `kan bevatten`, `allergenen:`) case-insensitive, and classify tokens into contains vs mayContain accordingly.
- **FR-NL-003**: Allergen parser MUST singularize or canonicalize common Dutch plural forms (e.g., "noten" → [NEEDS CLARIFICATION: choose canonical `noten` vs mapping to multiple tree-nut tokens]) without losing semantic meaning; unresolved mapping decisions MUST be explicitly marked or deferred.
- **FR-NL-004**: Ingredient parser MUST normalize decimal commas in numeric fragments before numeric extraction for sugar/salt detection and unit parsing.
- **FR-NL-005**: Ingredient parser MUST detect Dutch added sugar phrases: regex covering `waarvan toegevoegde suikers\s+([0-9,<\.]+)\s*g` capturing decimal comma/point and inequality; extracted numeric uses max precision of source.
- **FR-NL-006**: Ingredient parser MUST detect Dutch added salt phrases similarly: `waarvan toegevoegde zout(en)?` or standard nutritional field if present; [NEEDS CLARIFICATION] on actual label variant frequency.
- **FR-NL-007**: Parser MUST treat `stuks`, `stuk`, `per stuk`, `x` patterns as valid unit multiplicative tokens and parse formats like `6 x 0,33 l` → packCount=6, amount=0.33, unit="l".
- **FR-NL-008**: Classification MUST incorporate Dutch positive food category hints (`zuivel`, `brood`, `groente`, `fruit`, `vlees`, `vis`, `kruiden`, `koffie`, `thee`, `dranken`, `snacks`, `conserven`) and negative non-food hints (`huishouden`, `schoonmaak`, `bleek`, `tissues`, `servetten`, `afwas`, `vuilnis`, `zakken`) without removing existing English heuristics.
- **FR-NL-009**: Classification MUST no longer force `isFood=true` unconditionally; decision derives from multilingual heuristic; existing tests updated to reflect dynamic logic.
- **FR-NL-010**: Artificial sweetener detection MUST include Dutch terms (`zoetstof`, `zoetstoffen`, `steviolglycosiden`, `aspartaam`, `sucralose`, `acesulfaam k`) augmenting current patterns; case-insensitive.
- **FR-NL-011**: System MUST normalize decimal comma numbers across nutrition fields prior to numeric casting (e.g., `12,5` → 12.5) retaining failure resilience for malformed values.
- **FR-NL-012**: Hashing / canonical ordering MUST remain deterministic; addition of Dutch tokens MUST NOT reorder existing keys or introduce locale-dependent sort differences.
- **FR-NL-013**: Stats MUST record count of products with Dutch-only allergen detection (i.e., contained at least one allergen found exclusively via new Dutch list) as `dutchAllergenProducts` for monitoring.
- **FR-NL-014**: Stats MUST record number of numeric values converted due to decimal comma normalization as `decimalCommaNormalizedCount`.
- **FR-NL-015**: Backward compatibility: Existing English-only fixture tests MUST pass unchanged except where explicitly updated for classification logic (list changed tests in changelog).
- **FR-NL-016**: New test fixtures MUST cover: mixed-language allergens, decimal comma nutrition, Dutch added sugar phrase, Dutch unit pattern, Dutch sweetener detection, classification negative household category, classification positive Dutch food category.
- **FR-NL-017**: Documentation (schema or hygiene section) MUST add subsection "Localization" enumerating added Dutch tokens and detection rules.
- **FR-NL-018**: System SHOULD allow future addition of other languages without refactoring core parsing modules (design note or abstraction placeholder acceptable – no full i18n framework required now).
- **FR-NL-019**: Unknown or ambiguous Dutch allergen plurals (e.g., generic `noten`) MUST either (a) remain as-is with a note in docs or (b) expand to multiple canonical nuts; choice MUST be documented in spec resolution before Status leaves Draft.
- **FR-NL-020**: Performance MUST remain within previous runtime target (≤ prior 10s budget for 30K rows); added detection passes MUST be O(n) over tokens with negligible additional memory overhead.
- **FR-NL-021**: URL filtering logic for allergens MUST continue to function with Dutch lines (no regressions) and MUST ignore case/prefix differences.
- **FR-NL-022**: Ingredient placeholder removal MUST still operate for Dutch lines; placeholders list extended only if new Dutch placeholder tokens identified (e.g., `GEEN`, `NVT` [NEEDS CLARIFICATION]).
- **FR-NL-023**: Inequality numeric strings ("< 0,01") MUST parse to numeric value while optionally capturing original string if later analytic differentiation is desired (out of scope for now – note only).
- **FR-NL-024**: Logging or debug output (if classification debug mode used) SHOULD include language token match origin (EN vs NL) to aid regression debugging.
- **FR-NL-025**: Index builder MUST remain language-agnostic; no additional localized fields introduced (avoid index bloat).

### Ambiguities & Clarifications
- Canonical handling of plural `noten`: [NEEDS CLARIFICATION] – treat as umbrella vs expansion.
- Salt added phrase prevalence vs using regular nutrition sodium/salt column: [NEEDS CLARIFICATION].
- Dutch placeholder tokens beyond existing English list: need sample data mining. [NEEDS CLARIFICATION].
- Whether to expand tree nut synonyms vs keep as given for `noten`: decision impacts allergen filtering semantics and consumer expectations.

### Key Entities
- **LocalizedAllergenToken**: A normalized allergen term derived from Dutch or English input; includes origin language flag (optional internal only).
- **LocalizedIngredientParse**: Ingredient tokenization artifact with decimal and clause normalization applied pre-flagging.
- **ClassificationHeuristic**: Combined multilingual rule set evaluating categories and possibly nutrition presence to set `isFood`.
- **LocalizationStats**: Subset of stats capturing new counters (`dutchAllergenProducts`, `decimalCommaNormalizedCount`).

## Review & Acceptance Checklist

### Content Quality
- [ ] No implementation details beyond necessary functional scope
- [ ] User-value focused
- [ ] Mandatory sections completed

### Requirement Completeness
- [ ] All FR-NL-* testable or marked [NEEDS CLARIFICATION]
- [ ] Ambiguities explicitly listed
- [ ] Backward compatibility impact described
- [ ] Performance budget reaffirmed

## Execution Status
- [ ] User description parsed
- [ ] Key concepts extracted
- [ ] Ambiguities marked
- [ ] User scenarios defined
- [ ] Requirements generated
- [ ] Entities identified
- [ ] Review checklist passed

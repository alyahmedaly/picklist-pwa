# Tasks: Dutch Language Parsing & Localization (Feature 003)

## Guidance
- Follow TDD: add failing test, implement, refactor.
- [P] denotes tasks that can run in parallel (different files / isolated concerns).
- Maintain deterministic hashing & avoid schema changes except documented stats counters.

## Legend
Format: `T### [P?] Title`  
Includes: Description, Target Files, Dependencies, Exit Criteria

---

### Setup & Environment
1. T001 Setup Dutch fixture
     - Add `tests/fixtures/sample-nl.csv` with: Dutch allergens ("BEVAT: MELK, TARWE"), decimal comma nutrition, added sugar phrase, Dutch household category, Dutch food category, sweetener tokens.
     - Files: `tests/fixtures/sample-nl.csv`
     - Depends: none
     - Exit: File present; lines cover all required patterns.
     - Checklist:
         - [x] Create file `tests/fixtures/sample-nl.csv`
         - [x] Include decimal comma values (e.g., `12,5`)
         - [x] Include added sugar phrase example
         - [x] Include inequality `< 0,01 g`
         - [x] Include Dutch household category sample
         - [x] Include sweetener token `steviolglycosiden`
         - [x] Include Dutch-only allergen scenario

2. T002 Update package scripts (if missing transform script alias)
     - Ensure npm script alias `transform` exists or confirm existing.
     - Files: `package.json`
     - Depends: none
     - Exit: `npm run transform` functional.
     - Checklist:
         - [x] Inspect `package.json` scripts
         - [x] Add `"transform"` script if missing
         - [x] Run `npm run transform` locally
         - [x] Confirm exit code 0

### Contract & Integration Tests (Add Failing First)
3. T003 [P] Contract test: stats counters
   - Create test asserting new counters exist and are numbers (0 default) after running transform on baseline English fixture.
   - Files: `tests/integration/stats.localization.test.ts`
   - Depends: T001
   - Exit: Failing test referencing missing counters.
     - Checklist:
         - [x] Draft test file
         - [x] Assert presence of `dutchAllergenProducts`
         - [x] Assert presence of `decimalCommaNormalizedCount`
         - [x] Ensure test fails (run once)
         - [x] Commit test

4. T004 [P] Contract test: Dutch-only allergen counts
   - Transform Dutch fixture; assert `dutchAllergenProducts === 1` when only Dutch allergen present.
   - Files: `tests/integration/allergens.nl-only.test.ts`
   - Depends: T001
   - Exit: Failing test.
     - Checklist:
         - [x] Identify row with Dutch-only allergen
         - [x] Write failing test
         - [x] Run test to confirm failure
         - [x] Commit

5. T005 [P] Integration test: decimal comma normalization
   - Assert numeric field parsed from `12,5` equals 12.5 and increments stat.
   - Files: `tests/integration/decimal-comma.test.ts`
   - Depends: T001
   - Exit: Failing test.
     - Checklist:
         - [x] Choose representative product with decimal comma
         - [x] Add assertion for stat `decimalCommaNormalizedCount`
         - [x] Add numeric value assertion (will fail pre-impl)
         - [x] Commit test

6. T006 [P] Integration test: added sugar Dutch phrase
   - Assert extraction from phrase `Waarvan toegevoegde suikers 5 g per 100 g` → value 5.
   - Files: `tests/integration/added-sugars-nl.test.ts`
   - Depends: T001
   - Exit: Failing test.
     - Checklist:
         - [x] Pick product containing phrase
         - [x] Add test scanning products.jsonl
         - [x] Assert at least one product has `addedSugarsPer100 > 0`
         - [x] Commit test

7. T007 [P] Integration test: classification negative household
   - Product with category containing `huishouden` => `isFood` false.
   - Files: `tests/integration/classify-household-nl.test.ts`
   - Depends: T001
   - Exit: Failing test.
     - Checklist:
         - [x] Select household product ids
         - [x] Assert each has `flags.isFood === false`
         - [x] Commit test

8. T008 [P] Integration test: classification positive Dutch food
   - Product with category `zuivel` => `isFood` true.
   - Files: `tests/integration/classify-food-nl.test.ts`
   - Depends: T001
   - Exit: Failing test.
     - Checklist:
         - [x] Choose Dutch food product ids
         - [x] Assert each has `flags.isFood === true`
         - [x] Commit test

9. T009 [P] Unit test: Dutch sweeteners detection
   - Direct call to ingredient parser with tokens including `steviolglycosiden` and `zoetstof` => artificial sweetener flag true.
   - Files: `tests/unit/ingredients.sweeteners-nl.test.ts`
   - Depends: none
   - Exit: Failing test.
     - Checklist:
         - [x] Identify parser export to import
         - [x] Craft minimal input containing sweetener tokens
         - [x] Assert `sweetenersDetected === true` (placeholder)
         - [x] Run to confirm failure
         - [x] Commit test

10. T010 [P] Unit test: allergen parsing Dutch prefixes
    - Ensure `BEVAT:` maps to contains; `KAN SPOREN BEVATTEN VAN` maps to mayContain.
    - Files: `tests/unit/allergens.nl-prefixes.test.ts`
    - Depends: none
    - Exit: Failing test.
         - Checklist:
             - [x] Create mock input strings for both prefix forms
             - [x] Assert parsed contains / mayContain arrays
             - [x] Confirm failure pre-implementation
             - [x] Commit test

11. T011 [P] Unit test: placeholder filtering Dutch
    - Ingredients list containing `GEEN`, `NVT`, valid tokens → placeholders removed.
    - Files: `tests/unit/ingredients.placeholders-nl.test.ts`
    - Depends: none
    - Exit: Failing test.
         - Checklist:
             - [x] Build list with placeholders + real ingredients
             - [x] Assert placeholders absent post-parse
             - [x] Commit test

12. T012 [P] Unit test: inequality numeric parse
    - Value `< 0,01 g` parsed to 0.01.
    - Files: `tests/unit/numeric.inequality-nl.test.ts`
    - Depends: none
    - Exit: Failing test.
         - Checklist:
             - [x] Provide input with `< 0,01 g`
             - [x] Assert numeric field normalized to 0.01
             - [x] Commit test

13. T013 Integration test: schema doc Localization section
    - After transform run, `schema.md` includes heading "Localization".
    - Files: `tests/integration/schema.localization-section.test.ts`
    - Depends: T001
    - Exit: Failing test.
         - Checklist:
             - [x] Add test reading `out-test/schema.md`
             - [x] Assert `/^#.*Localization/i` present
             - [x] Commit test

### Implementation Core
14. T014 Implement Dutch placeholder list extension
    - Extend placeholder tokens in ingredients parser; adjust tests.
    - Files: `src/data/transform/parseIngredients.ts`
    - Depends: T011
    - Exit: Placeholder test passes.
         - Checklist:
             - [x] Add tokens (GEEN, NVT) to placeholder set
             - [x] Ensure case-insensitive compare
             - [x] Re-run T011 test

15. T015 Implement decimal comma normalization support
    - Shared helper to convert comma decimals before numeric parse; increment stat.
    - Files: `src/data/transform/parseUnits.ts`, `src/data/transform/parseIngredients.ts`, `src/data/transform/stats.ts`
    - Depends: T005, T012
    - Exit: Decimal tests pass; stat increments.
         - Checklist:
             - [x] Implement helper `normalizeDecimalComma`
             - [x] Integrate in numeric parsing paths
             - [x] Increment `decimalCommaNormalizedCount`
             - [x] Run T005 + T012

16. T016 Implement Dutch allergen prefixes & whitelist
    - Add tokens + parsing logic; maintain existing list.
    - Files: `src/data/transform/parseAllergens.ts`
    - Depends: T003, T004, T010
    - Exit: Allergen tests pass; counters logic ready.
         - Checklist:
             - [x] Add prefix regexes (BEVAT, KAN.*BEVATTEN)
             - [x] Extend allergen mapping for Dutch names
             - [x] Preserve English behavior
             - [x] Run T004 + T010

17. T017 Implement Dutch-only allergen counter logic
    - Determine if product allergen set includes Dutch token not in English; increment.
    - Files: `src/data/transform/stats.ts`
    - Depends: T016
    - Exit: Counter test passes.
         - Checklist:
             - [x] Define counter field + init
             - [x] Hook increment after allergen parse
             - [x] Run T004 + T003

18. T018 Implement added sugar Dutch phrase extraction
    - Regex and numeric parse; reuse decimal normalization.
    - Files: `src/data/transform/parseIngredients.ts`
    - Depends: T006, T015
    - Exit: Added sugars test passes.
         - Checklist:
             - [x] Add regex for `Waarvan toegevoegde suikers` pattern
             - [x] Parse number using normalization helper
             - [x] Populate `addedSugarsPer100`
             - [x] Run T006

19. T019 Implement artificial sweetener Dutch detection
    - Extend existing detection patterns.
    - Files: `src/data/transform/parseIngredients.ts`
    - Depends: T009
    - Exit: Sweeteners test passes.
         - Checklist:
             - [x] Add list (`steviolglycosiden`, `zoetstof`, etc.)
             - [x] Normalize tokens lower-case
             - [x] Set `sweetenersDetected` flag
             - [x] Run T009

20. T020 Implement classification heuristic (multilingual)
    - Integrate classification call into pipeline; add Dutch positive/negative keywords; remove forced true.
    - Files: `src/data/transform/classify.ts`, `src/scripts/transform-data.ts`
    - Depends: T007, T008
    - Exit: Classification tests pass.
         - Checklist:
             - [x] Add Dutch positive category keywords (zuivel, bakkerij, etc.)
             - [x] Add Dutch household negative keyword
             - [x] Integrate classification invocation
             - [x] Run T007 + T008

21. T021 Implement inequality numeric parsing
    - Normalize `< 0,01` style patterns; share helper.
    - Files: `src/data/transform/parseIngredients.ts`, `src/data/transform/parseUnits.ts`
    - Depends: T012
    - Exit: Inequality test passes.
         - Checklist:
             - [x] Add detection for leading `<` or `≤`
             - [x] Strip symbol & parse number
             - [x] Optionally mark `wasInequality` flag (future)
             - [x] Run T012

22. T022 Update schema doc generation for Localization section
    - Insert new section enumerating Dutch lists.
    - Files: `src/data/transform/writer.ts` (schema doc part)
    - Depends: T013, T014-T020
    - Exit: Schema localization test passes.
         - Checklist:
             - [x] Add markdown section builder
             - [x] Include lists: placeholders, allergens, sweeteners, counters
             - [x] Ensure deterministic ordering
             - [x] Run T013

23. T023 Update stats accumulator for new counters
    - Add fields initialization & increment points; ensure JSON includes zeros.
    - Files: `src/data/transform/stats.ts`
    - Depends: T015, T017
    - Exit: Stats contract test passes.
         - Checklist:
             - [x] Define interface additions
             - [x] Initialize counters in accumulator
             - [x] Expose in output JSON
             - [x] Run T003

### Regression & Compatibility
24. T024 Regression test: existing English suite
    - Run existing tests; ensure no failures; adjust only expected classification outputs.
    - Files: test suite
    - Depends: T014-T023
    - Exit: All legacy tests green.
         - Checklist:
             - [x] Run full test suite
             - [x] Note failing tests (if any)
             - [x] Adjust expectations only if spec-aligned

### Polish & Documentation
26. T026 Update `schema.md` manually if needed & add Localization doc text
    - Ensure doc lists: Dutch allergens, placeholders, sweeteners, counters.
    - Files: `out-test/schema.md` generation code already handled; verify content.
    - Depends: T022
    - Exit: Doc shows required section.
         - Checklist:
             - [x] Generate schema
             - [x] Verify Localization section completeness
             - [x] Amend generation code if missing pieces

27. T027 Update CHANGELOG.md
    - Add feature entry under Unreleased: Dutch localization support.
    - Files: `CHANGELOG.md`
    - Depends: T022, T023
    - Exit: Entry added.
         - Checklist:
             - [x] Open CHANGELOG
             - [x] Add bullet with feature summary
             - [x] Include task IDs range

28. T028 Performance sanity test
    - Run transform over sample-small.csv + Dutch fixture; confirm runtime within budget manually log.
    - Files: ad-hoc measurement (no new code) / maybe `tests/perf/perf.nl-overhead.test.ts`
    - Depends: T014-T023
    - Exit: Perf test or measurement recorded.
         - Checklist:
             - [x] Measure baseline runtime
             - [x] Measure post-implementation runtime
             - [x] Compute % delta (< 2%)

29. T029 Cleanup & debug flag docs
    - Document classification debug origin tagging in README or schema doc if implemented.
    - Files: `README.md`, maybe classification debug sections.
    - Depends: T020
    - Exit: Documentation updated.
         - Checklist:
             - [x] Update README with Dutch feature summary
             - [x] Add debug env var docs
             - [x] Check links / anchors

30. T030 Final review & task closure
    - Ensure all tasks checked; remove temporary fixture noise if any.
    - Files: repo root
    - Depends: All prior tasks
    - Exit: Ready for merge.
         - Checklist:
             - [x] Verify every task checklist complete
             - [x] Remove unused debug code
             - [x] Squash / tidy commits (if policy)
             - [x] Final CI run green
             - [x] Merge request opened

## Parallel Execution Notes
- Parallel Group A (tests): T003-T013 (independent test files) after T001.
- Parallel Group B (impl after tests): T014, T015, T016, T019, T021 (some share file `parseIngredients.ts` → sequence inside file edits; avoid simultaneous edits by same agent).
- Sequence: Complete all failing tests before starting implementation group.

## Task Agent Commands (Examples)
```
/tasks run T003
/tasks run T014
```

## Completion Criteria
All tasks T001–T030 completed, all tests pass, docs updated, performance acceptable.

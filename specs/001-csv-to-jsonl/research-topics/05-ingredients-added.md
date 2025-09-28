# Research Topic: Ingredients Added Sugars / Salt Heuristics

## Question
How to heuristically flag presence of added sugars or added salt from free-text ingredients list reliably with low false positives?

## Data Needed
- Common ingredient phrases containing sugar derivatives / syrups / concentrates
- Salt inclusion patterns (iodized, sea salt, brine) vs naturally occurring sodium sources
- Exclusion phrases (e.g., "contains naturally occurring sugars")

## Plan
1. Compile lexicon buckets (sugars, syrups, concentrates, sweeteners, salt forms).
2. Create regex with word boundaries & case insensitivity.
3. Define precedence: explicit exclusions override positives.
4. Return tri-state: { addedSugar: true|false|null, addedSalt: true|false|null } where null = insufficient data.

## Lexicon Buckets
Sugar core: sugar, sucrose, dextrose, glucose, fructose, lactose, maltose
Syrups: syrup, glucose-fructose syrup, corn syrup, agave syrup, maple syrup, rice syrup
Sweeteners natural: honey, molasses, date paste, fruit juice concentrate, apple concentrate
Sweeteners artificial (exclude for addedSugar flag? decide): aspartame, sucralose, acesulfame k, saccharin, stevia, erythritol, xylitol
Concentrate indicators: "juice concentrate", "fruit concentrate"
Salt: salt, sea salt, iodized salt, rock salt, brine

## Heuristic Rules
1. Positive sugar if any sugar core term OR syrup term present unless preceded by "naturally occurring" within 3 tokens.
2. Fruit juice concentrate counts as added sugar unless accompanied by "no added sugar" within ingredient statement.
3. Artificial sweeteners do not set addedSugar=true (they indicate sweetness without sugar) but set a separate flag sweeteners=true.
4. Positive salt if `salt` term present not within phrase `low salt` / `reduced salt` / `no added salt`.
5. If both exclusion (`no added sugar`) and sugar term found, set addedSugar=false, conflictLogged=true.

## Regex Components (case-insensitive)
```
SUGAR_CORE = /(sucrose|dextrose|glucose|fructose|lactose|maltose|sugar)\b/i
SYRUP = /([a-z-]+\s)?syrup\b/i
CONCENTRATE = /juice concentrate|fruit concentrate/i
NO_ADDED_SUGAR = /no added sugar|without added sugar/i
NAT_OCCUR = /naturally occurring sugars?/i
ARTIFICIAL = /aspartame|sucralose|acesulfame\s?k|saccharin|stevia|erythritol|xylitol/i
SALT = /\b(salt|sea salt|iodized salt|rock salt|brine)\b/i
REDUCED_SALT = /no added salt|reduced salt|low salt/i
```

## Algorithm
analyzeIngredients(text):
1. lower = text.toLowerCase()
2. sugarHit = SUGAR_CORE|SYRUP|CONCENTRATE test
3. if sugarHit:
   a. if NO_ADDED_SUGAR present -> addedSugar=false, note conflict if other hits
   b. else if NAT_OCCUR present and only sugarHit is generic sugar -> addedSugar=false
   c. else addedSugar=true
4. sweeteners = ARTIFICIAL test
5. saltHit = SALT test
6. if saltHit:
   a. if REDUCED_SALT present -> addedSalt=false
   b. else addedSalt=true
7. Return { addedSugar, addedSalt, sweeteners, conflict }

## Edge Cases
- Mixed languages (out of scope; treat unrecognized as no flag)
- Compound words (e.g., sugarssomething) avoided via word boundaries
- Duplicate listing treated idempotently
- Empty or null ingredients -> all null

## Test Cases
- "Ingredients: milk, sugar, cocoa" -> addedSugar=true
- "Ingredients: milk, naturally occurring sugars from fruit" -> addedSugar=false
- "Ingredients: oats, apple juice concentrate" -> addedSugar=true
- "Ingredients: oats, apple juice concentrate, no added sugar" -> addedSugar=false (conflict noted)
- "Ingredients: water, sea salt" -> addedSalt=true
- "Ingredients: water, salt, reduced salt recipe" -> addedSalt=false
- "Ingredients: water, stevia" -> addedSugar=false, sweeteners=true

## Decision
Adopt lexical heuristic with explicit exclusions precedence. Provide conflict flag when exclusion and inclusion coexist for auditing. Keep artificial sweeteners separate; do not mark as added sugar. Return null flags only on missing text.

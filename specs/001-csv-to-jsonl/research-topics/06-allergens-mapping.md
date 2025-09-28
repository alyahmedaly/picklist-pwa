# Research Topic: Allergens Mapping

## Question
How to normalize varied allergen mentions to a canonical controlled vocabulary with boolean flags while handling absence vs unknown?

## Data Needed
- Canonical allergen set (EU + common extras): gluten(cereals), crustaceans, eggs, fish, peanuts, soy, milk, nuts(tree nuts), celery, mustard, sesame, sulphites, lupin, molluscs. Optional: sesame (already), sulfites synonyms, shellfish grouping.
- Typical label variations & language noise (capitalization, pluralization, brackets).

## Plan
1. Define canonical keys snake_case.
2. Build alias regex per allergen capturing variants & groupings.
3. Provide parser producing object { allergenKey: true } only for positives; absence = not present; unknown (free-text missing) -> null at aggregate level.
4. Support explicit negative phrases ("may contain" separate from definite contains).

## Canonical Keys
```
['gluten','crustaceans','eggs','fish','peanuts','soy','milk','tree_nuts','celery','mustard','sesame','sulphites','lupin','molluscs']
```
Tree nuts are aggregated; optionally store a subfield list if detected (almond, hazelnut, walnut, cashew, pistachio, pecan, brazil, macadamia).

## Phrase Categories
- CONTAINS definite: "contains", "enthält" (if multilingual appears), colon-separated listing.
- MAY_CONTAIN: "may contain", "can contain", "kann spuren von" (traces of) -> mark as `mayContains` list separate from definite flags.

## Alias Patterns (simplified)
```
GLUTEN = /gluten|weizen|wheat|gerste|barley|roggen|rye|hafer|oats/i
CRUSTACEANS = /crustaceans?|krebstiere|shrimp|prawn|krabben|crab|langoustine|lobster/i
EGGS = /eggs?|eier|ovalbumin/i
FISH = /fish|fisch|lachs|salmon|tuna|thunfisch|cod|kabeljau/i
PEANUTS = /peanuts?|erdnuss|erdnüsse/i
SOY = /soya?|soy|sojabohne|soja/i
MILK = /milk|milch|butter|käse|cheese|lactose|whey/i
TREE_NUTS = /almond|mandel|hazelnut|haselnuss|walnut|walnuss|cashew|pistachio|pecan|brazil nut|macadamia/i
CELERY = /celery|sellerie/i
MUSTARD = /mustard|senf/i
SESAME = /sesame|sesam/i
SULPHITES = /sulphites?|sulfites?|so2|e220|e221|e222|e223|e224|e226|e227|e228/i
LUPIN = /lupin|lupine/i
MOLLUSCS = /molluscs?|muscheln|clam|clams|oyster|auster|scallop|muschel/i
MAY_CONTAIN = /may contain|can contain|kann spuren von|may contain traces of|spuren von/i
```

## Algorithm
parseAllergens(text):
1. if !text -> return { definitive: {}, may: [] }
2. lower = text.toLowerCase()
3. For each canonical regex if match -> definitive[key]=true (TREE_NUTS: also collect matched nut types)
4. Collect `may` list if MAY_CONTAIN phrase; then scan after the phrase for listed allergens (reuse patterns) -> may[] (exclude those already definitive)
5. Deduplicate arrays; ensure deterministic alphabetical ordering of keys.
6. Return { definitive, may, treeNutDetail? }

## Ambiguities
- Term like "butter" implies milk (explicit mapping accepted)
- Lactose-free milk mention still indicates potential milk allergen; do not exclude
- "Contains traces of" -> treat as MAY not definitive

## Test Cases
- "Contains: milk, wheat, soy" -> definitive: milk, gluten, soy
- "May contain traces of nuts and sesame" -> may: tree_nuts, sesame
- "Almond, hazelnut" -> definitive: tree_nuts (treeNutDetail: ['almond','hazelnut'])
- "Lactose-free milk" -> definitive: milk
- "Butter (milk), eggs" -> definitive: milk, eggs

## Decision
Implement regex-based extraction with deterministic ordering. Store tree nuts aggregated plus optional detail list. Keep may vs definitive separate for downstream risk labeling. No negative assertions (absence means not declared). Provide stable output object shape.

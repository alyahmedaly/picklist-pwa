# Product Schema

## Ordering
Canonical ordering: id_then_name

## Excluded Columns
- PriceSale
- Category6
- Vitamine C
- Kalium/Potassium
- waarvan enkelvoudig onverzadigd
- waarvan meervoudig onverzadigd
- Alcohol
- Calcium
- Vitamine B2 / Riboflavine
- Vitamine B12 / Cyano-Cobalamine
- Fosfor
- Ijzer
- Vitamine A
- Vitamine D
- Vitamine B11 / Foliumzuur
- Jodium
- Vitamine E
- Linolzuur
- Alfa-Linoleenzuur
- Vitamine B3 / Niacine
- Magnesium
- Zink
- Omega 3 Vetzuren
- Vitamine B6 / Pyridoxine
- Vitamine B1 / Thiamine
- Vitamine K
- Vitamine B5 / Pantotheenzuur
- Koper
- Natrium
- waarvan polyolen
- Seleen
- Vitamine H / Biotine
- waarvan toegevoegde suikers
- Omega 6 Vetzuren
- Folaat
- Mangaan
- Chloride
- Sulfaat
- Nitraten
- Bicarbonaat
- Siliciumdioxide (Sio2)
- Ash
- Lactose
- Glucose
- Maltodextrine
- Vitamin D2
- Vitamine B7 / Inositol
- Molybdeen
- Seleen (Organisch)
- Eicosapentaeenzuur
- Docosahexaeenzuur
- waarvan zetmeel
- Cholesterol
- Transvet
- Organic Acids, Total
- Ph, Hydrogen Ion Concentration
- Fluoride
- Carnitine
- Choline
- Taurine
- Nucleotide
- Arachidonzuur
- Wei-Eiwit
- Caseïne
- Palmitinezuur
- Galactose In Voedingsvezel
- Fructose In Voedingsvezel
- Chroom
- Tafelzout Gemengd Met Een Kleine Hoeveelheid Van Verschillende Jodiumbevattende Zouten
- Betaglucanen
- Vitamin A; Calculated By Summation Of The Vitamin A Activities Of Retinol And The Active Carotenoids
- Niacine Equivalent
- Vitamine D3
- Galactooligosaccharides (Gos)
- Vita K-1
- Safranal
- Omega 9 Vetzuren
- Collageen hydrolysaten
- Plantaardige Eiwitten
- Oligomere proanthocyanidinen (OPC)

## Localization
This schema supports Dutch language localization with the following features:

### Dutch Allergen Support
- Supports Dutch allergen prefixes: "bevat", "kan sporen bevatten van"
- Includes Dutch allergen terms: melk, ei, soja, tarwe, pinda, noten, etc.
- Automatic Dutch-to-English allergen mapping

### Dutch Phrase Extraction
- Added sugar extraction from "Waarvan toegevoegde suikers X.Xg per 100 gram"
- Added salt extraction from "Waarvan toegevoegd zout X.Xg per 100 gram"
- Decimal comma normalization (e.g., "1,5" → 1.5)

### Dutch Ingredient Processing
- Dutch placeholder filtering: GEEN, NVT
- Dutch artificial sweetener detection: aspartaam, steviolglycosiden, zoetstof
- Dutch food classification: bakkerij, huishouden, zuivel, etc.

### Inequality Parsing
- Supports inequality symbols: < 0,01 g, ≤ 1,5 g
- Multipack with inequalities: 6 x < 0,33 l

## Nutritional Tags
Precomputed nutritional tags for food products following EU/Dutch standards:

### Nutritional Computation
- **Net Carbs**: Total carbs minus fiber (minimum 0)
- **Net Carbs Buckets**: very_low (<2g), low (2-5g), moderate (5-10g), high (10-20g), very_high (>20g)
- **Low Carb**: <10g net carbs per 100g (ketogenic threshold)

### EU/Dutch Standards
- **High Fiber**: ≥6g per 100g (EU Commission Regulation No 1924/2006)
- **High Protein**: ≥20g per 100g (Dutch fitness standard)
- **Protein Density**: low (<10g), moderate (10-20g), high (≥20g)

### Dietary Classifications
- **Vegan**: Excludes melk, ei, boter, kaas, vis, vlees, honing
- **Vegetarian**: Excludes vis, vlees, kip, rund, varken (allows dairy)
- **Lactose-Free**: Excludes melk, room, boter, kaas, lactose
- **Gluten-Free**: Excludes tarwe, rogge, gerst, haver
- **Plant-Based**: >80% plant ingredients by count

### Tags Only for Food Products
- Nutritional tags computed only for products classified as food
- Non-food products (household, pet, etc.) do not receive nutritional tags
- Requires either nutrition data or ingredients for computation

## Hygiene Rules
### Ingredient Placeholders (filtered)
- -
- --
- GEEN
- N.A.
- N/A
- NA
- NVT

### Allergen Whitelist (normalized)
- almond
- almonds
- amandel
- cashew
- cashew
- cashews
- corn
- crab
- egg
- eggs
- ei
- fish
- gerst
- gluten
- haver
- hazelnoot
- hazelnut
- hazelnuts
- lobster
- lupine
- macadamia
- macadamia
- macadamias
- melk
- milk
- mosterd
- mustard
- noten
- peanut
- peanuts
- pecan
- pecannoot
- pecans
- pinda
- pistache
- pistachio
- pistachios
- rogge
- schaaldier
- sesam
- sesame
- shellfish
- shrimp
- soja
- soy
- soybean
- soybeans
- sulfiet
- sulfite
- tarwe
- tree nuts
- vis
- walnoot
- walnut
- walnuts
- weekdier
- wheat

### Omission Normalization
- Empty arrays removed (treated as absent)
- Empty objects removed (treated as absent)
- Hashing occurs after omission normalization for equivalence

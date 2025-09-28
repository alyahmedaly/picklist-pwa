# Data Model: Nutritional Tags

## Core Entities

### NutritionalTags
**Purpose**: Contains computed dietary and nutritional classifications for AH Netherlands products
**Context**: Extends existing Product interface with optional nutritional intelligence

#### Fields
- `netCarbs?: number` - Calculated net carbs (total carbs - fiber) per 100g
- `netCarbsBucket?: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'` - Categorized net carb level
- `lowCarb?: boolean` - True if net carbs < 10g per 100g (keto-friendly threshold)
- `highProtein?: boolean` - True if protein ≥ 20g per 100g (Dutch fitness standard)
- `highFiber?: boolean` - True if fiber ≥ 6g per 100g (EU regulation standard)
- `proteinDensity?: 'low' | 'moderate' | 'high'` - Protein content classification
- `proteinDensityBucket?: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'` - Granular protein categorization
- `lactoseFree?: boolean` - True if no dairy allergens AND no lactose ingredients
- `glutenFree?: boolean` - True if no wheat/rye/barley/oat allergens
- `vegan?: boolean` - True if no animal-derived ingredients
- `vegetarian?: boolean` - True if no meat/fish (allows dairy/eggs)
- `plantBased?: boolean` - True if >80% plant ingredients

#### Validation Rules
- All fields optional (tags only present when applicable)
- Numeric fields use consistent precision (1 decimal place)
- Boolean fields only true when criteria definitively met
- Bucket fields follow established thresholds from research.md

#### State Transitions
- Static computed values (no state changes after calculation)
- Recomputed only when source nutritional data changes
- Deterministic output for same input (constitutional requirement)

### DutchNutritionalStandards
**Purpose**: Reference constants for Dutch/EU dietary thresholds
**Context**: Immutable configuration used by computation functions

#### Thresholds
- High Fiber: ≥6g per 100g (EU Commission Regulation No 1924/2006)
- High Protein: ≥20g per 100g (Dutch fitness standard)
- Low Carb: <10g net carbs per 100g (ketogenic threshold)
- Net Carb Buckets: very_low (<2g), low (2-5g), moderate (5-10g), high (10-20g), very_high (>20g)
- Protein Buckets: very_low (<5g), low (5-10g), moderate (10-20g), high (20-30g), very_high (>30g)

### DutchIngredientPatterns
**Purpose**: Dutch language patterns for dietary classification
**Context**: Used by ingredient analysis functions

#### Vegan Exclusions
- Animal products: melk, ei, boter, kaas, vis, vlees, honing, gelatine, room, roomboter
- Validation: Ingredient list checked against exclusion patterns

#### Vegetarian Exclusions
- Meat/fish only: vis, vlees, kip, rund, varken, lam
- Allows: dairy products, eggs

#### Lactose Sources
- Dairy ingredients: melk, room, boter, kaas, lactose, wei
- Combined with allergen analysis for accurate classification

#### Gluten Sources
- Gluten grains: tarwe, rogge, gerst, haver, gluten
- Cross-referenced with allergen declarations

## Relationships

### Product → NutritionalTags (1:0..1)
- Product may have nutritional tags if it's food with sufficient nutritional data
- Tags computed from Product.nutrition and Product.ingredients
- Tags included in Product.nutritionalTags field

### NutritionalTags → DutchNutritionalStandards (uses)
- Tag computation functions reference standard thresholds
- Ensures compliance with Dutch/EU regulations

### Product.ingredients → DutchIngredientPatterns (analyzed by)
- Ingredient list analyzed using Dutch language patterns
- Results feed into dietary classification flags

## Data Flow

1. **Input**: CSV row with Dutch nutritional columns
2. **Parse**: Extract nutrition values using decimal comma normalization
3. **Compute**: Apply Dutch/EU standards to calculate tags
4. **Classify**: Analyze ingredients for dietary restrictions
5. **Output**: Include tags in Product.nutritionalTags field

## Validation & Constraints

### Data Quality
- Missing nutritional data → skip affected tags
- Invalid ingredient lists → conservative classification (exclude from dietary flags)
- Threshold boundaries → consistent rounding rules

### Performance
- Tags only computed for food products (not household items)
- Lazy evaluation (skip if no nutritional data)
- Reuse existing parsing infrastructure (decimal comma, allergen analysis)

### Determinism
- Same input → identical output (constitutional requirement)
- Fixed precision arithmetic
- Stable classification rules
- Consistent bucket assignment
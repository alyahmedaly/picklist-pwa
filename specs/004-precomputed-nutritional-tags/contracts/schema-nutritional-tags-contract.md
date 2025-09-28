# Contract: Nutritional Tags Schema Extension

## Input Contract: CSV Nutritional Columns
Expected Dutch nutritional columns from AH Netherlands CSV:
- `Energie (kcal)` - Energy in kilocalories
- `Vet` - Total fat content
- `Koolhydraten` - Total carbohydrates
- `Voedingsvezel` - Dietary fiber
- `Eiwitten` - Protein content
- `Zout` - Salt content
- `Ingredients` - Dutch ingredient list

## Output Contract: Extended Product Schema

### NutritionalTags Interface
```typescript
interface NutritionalTags {
  // Net carbs calculation
  netCarbs?: number;                    // carbs - fiber, 1 decimal precision
  netCarbsBucket?: NetCarbsBucket;      // categorized level

  // Macro classifications
  lowCarb?: boolean;                    // < 10g net carbs per 100g
  highProtein?: boolean;                // ≥ 20g protein per 100g
  highFiber?: boolean;                  // ≥ 6g fiber per 100g (EU standard)

  // Protein analysis
  proteinDensity?: ProteinDensity;      // low/moderate/high
  proteinDensityBucket?: ProteinBucket; // granular classification

  // Dietary restrictions
  lactoseFree?: boolean;                // no dairy allergens + no lactose ingredients
  glutenFree?: boolean;                 // no gluten allergens
  vegan?: boolean;                      // no animal ingredients
  vegetarian?: boolean;                 // no meat/fish, allows dairy/eggs
  plantBased?: boolean;                 // >80% plant ingredients
}

type NetCarbsBucket = 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
type ProteinDensity = 'low' | 'moderate' | 'high';
type ProteinBucket = 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
```

### Extended Product Interface
```typescript
interface Product {
  // ... existing fields
  nutritionalTags?: NutritionalTags;    // NEW: optional nutritional tags
}
```

## Transformation Contract

### Function Signatures
```typescript
// Core computation function
function computeNutritionalTags(
  nutrition: Nutrition,
  ingredients: string[],
  allergens: AllergensInfo
): NutritionalTags | undefined;

// Nutrition parsing from Dutch CSV
function parseNutrition(record: Record<string, string>): Nutrition;

// Net carbs calculation
function computeNetCarbs(carbs?: number, fiber?: number): number | undefined;

// Dietary classification
function classifyDietary(
  ingredients: string[],
  allergens: AllergensInfo
): DietaryFlags;
```

## Validation Contract

### Input Validation
- Decimal comma values (12,5) normalized to dot notation (12.5)
- Missing nutritional data handled gracefully (skip affected tags)
- Invalid ingredient lists result in conservative dietary classification

### Output Validation
- All tag values deterministic for same input
- Numeric precision consistent (1 decimal place)
- Boolean flags only true when criteria definitively met
- Optional fields omitted when not applicable

## Error Handling Contract

### Non-Fatal Errors (continue processing)
- Missing nutritional columns → skip nutritional tags
- Incomplete ingredient data → skip dietary flags
- Invalid numeric values → skip affected calculations

### Fatal Errors (halt processing)
- Malformed CSV structure
- Memory constraints exceeded
- Invalid decimal comma patterns causing NaN

## Performance Contract

### Throughput
- <5% overhead on existing transform pipeline
- Process 30k products within existing 10s budget
- Memory usage within 150MB ceiling

### Determinism
- Identical input produces byte-identical output
- Stable sorting and key ordering maintained
- Consistent rounding and precision rules

## Statistics Contract

### New Statistics Fields
```typescript
interface TransformStats {
  // ... existing fields
  nutritionalTagsComputed: number;      // products with tags calculated
  highProteinProducts: number;          // count of high-protein items
  veganProducts: number;               // count of vegan items
  glutenFreeProducts: number;          // count of gluten-free items
  netCarbsDistribution: {              // distribution of net carb buckets
    very_low: number;
    low: number;
    moderate: number;
    high: number;
    very_high: number;
  };
}
```

## Backward Compatibility Contract

### Non-Breaking Changes
- `nutritionalTags` field is optional
- Existing Product fields unchanged
- Existing transform pipeline behavior preserved
- Existing test suite continues to pass

### Schema Evolution
- New fields added additively only
- No modification of existing field semantics
- Version compatibility maintained
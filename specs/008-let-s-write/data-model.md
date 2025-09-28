# Data Model: Hybrid Nutrition Score

## Core Entities

### Extended Product Interface

```typescript
interface Product {
  // Existing fields (unchanged)
  id: number | string;
  name: string;
  price: Price;
  categories?: string[];
  unit?: UnitInfo;
  nutrition?: Nutrition;
  ingredients?: string[];
  allergens?: AllergensInfo;
  images?: { low?: string; med?: string; high?: string; primary: string };
  flags?: Flags;
  added?: AddedInfo;
  nutritionalTags?: NutritionalTags;
  additiveInfo?: AdditiveInfo;
  additiveFlags?: AdditiveFlags;
  duplicate_conflicts?: DuplicateConflict[];
  categoryTree?: CategoryTree;
  ingredientInfo?: IngredientInfo;
  additivesSummary?: AdditivesSummary;
  nutrition?: Nutrition;
  warnings?: string[];

  // NEW: Hybrid Nutrition Score fields
  nutriScore?: number;              // EU Nutri-Score (-15 to +40)
  globalHealthScore?: number;       // Global percentile ranking (0-100)
  globalHealthGrade?: HealthGrade;  // Global grade (A-E)
  categoryHealthScore?: number;     // Category percentile ranking (0-100)
  categoryHealthGrade?: HealthGrade;// Category grade (A-E)
}
```

### New Type Definitions

```typescript
type HealthGrade = 'A' | 'B' | 'C' | 'D' | 'E';

interface NutriScoreComponents {
  negativePoints: number;    // 0-40 (energy + satFat + sugars + sodium)
  positivePoints: number;    // 0-15 (fiber + protein + fruitsVeg)
  finalScore: number;        // negativePoints - positivePoints (-15 to +40)
  category: 'general' | 'beverages' | 'cheese' | 'fats';
}

interface ScoringContext {
  totalProducts: number;
  categoryProducts: number;
  globalPercentile: number;  // 0-1 scale
  categoryPercentile: number; // 0-1 scale
}

interface ScoreDistribution {
  gradeA: { min: number; max: number; count: number };
  gradeB: { min: number; max: number; count: number };
  gradeC: { min: number; max: number; count: number };
  gradeD: { min: number; max: number; count: number };
  gradeE: { min: number; max: number; count: number };
}
```

## Entity Relationships

### Product → Nutrition → Scores
```
Product
├── nutrition: Nutrition (existing)
├── categories: string[] (existing)
└── scoring: {
    ├── nutriScore: number (Phase 1: EU algorithm)
    ├── globalHealthScore: number (Phase 2: Global percentile)
    ├── globalHealthGrade: HealthGrade (Phase 2: Global grade)
    ├── categoryHealthScore: number (Phase 2: Category percentile)
    └── categoryHealthGrade: HealthGrade (Phase 2: Category grade)
}
```

### Dataset → Score Distribution
```
Dataset (all products)
├── globalScores: number[] (sorted Nutri-Scores)
├── categoryScores: Map<string, number[]> (per-category sorted scores)
└── distributions: {
    ├── global: ScoreDistribution
    └── perCategory: Map<string, ScoreDistribution>
}
```

## Validation Rules

### NutriScore Validation
- **Range**: Must be between -15 and +40 (inclusive)
- **Precision**: Integer values only (per FSA specification)
- **Calculation**: negativePoints - positivePoints where:
  - negativePoints: 0-40 (sum of energy + satFat + sugars + sodium points)
  - positivePoints: 0-15 (sum of fiber + protein + fruitsVeg points)

### HealthScore Validation
- **Range**: Must be between 0 and 100 (inclusive)
- **Precision**: 1 decimal place maximum
- **Relationship**: Higher score = healthier product
- **Derivation**: Based on percentile rank of nutriScore within dataset

### HealthGrade Validation
- **Values**: Exactly one of: 'A', 'B', 'C', 'D', 'E'
- **Distribution**: Each grade represents exactly 20% of products
- **Relationship**: A = healthiest (top 20%), E = least healthy (bottom 20%)

### Data Consistency Rules
- If `nutriScore` exists, `globalHealthScore` and `globalHealthGrade` must exist
- If `categories` exists and has entries, `categoryHealthScore` and `categoryHealthGrade` must exist
- Global and category grades may differ (e.g., A globally, C in category)
- All scoring fields are optional (graceful degradation for missing nutrition data)

## State Transitions

### Scoring Pipeline States
```
1. RAW → Has nutrition data but no scores
2. NUTRI_SCORED → Has nutriScore calculated
3. GLOBALLY_RANKED → Has globalHealthScore + globalHealthGrade
4. CATEGORY_RANKED → Has categoryHealthScore + categoryHealthGrade (final state)
```

### Grade Boundary Calculation
```
For dataset of N products with sorted nutriScores:
- Grade A: products[N*0.8 : N] (top 20%)
- Grade B: products[N*0.6 : N*0.8] (next 20%)
- Grade C: products[N*0.4 : N*0.6] (middle 20%)
- Grade D: products[N*0.2 : N*0.4] (next 20%)
- Grade E: products[0 : N*0.2] (bottom 20%)
```

## Integration Points

### Existing Pipeline Integration
- Extends `parseProduct()` function in transform pipeline
- Adds scoring step after nutrition parsing but before JSONL output
- Maintains backward compatibility (all new fields optional)

### Statistics Integration
- Extends `stats.json` with score distribution data
- Adds counters for products with/without scores
- Includes grade distribution percentages

### Schema Documentation
- Updates `schema.md` with new field descriptions
- Documents scoring methodology and grade meanings
- Includes examples of dual scoring scenarios
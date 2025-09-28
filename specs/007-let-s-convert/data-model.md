# Data Model: UI-Optimized JSON Output Format

## Enhanced Product Interface

### Core Product Structure
Extends existing `Product` interface with UI-optimized fields while preserving all original data.

```typescript
interface UIOptimizedProduct extends Product {
  // Enhanced Category Structure (FR-001)
  categories: CategoryTree;

  // Enhanced Ingredient Structure (FR-003)
  ingredients: IngredientInfo;

  // Simplified Additive Structure (FR-004)
  additives: AdditivesSummary;

  // Enhanced Nutrition Structure (FR-005)
  nutrition: Nutrition;

  // Fixed Price Structure (FR-002)
  price: FixedPrice;

  // Consolidated Warnings (FR-007)
  warnings: string[];
}
```

## CategoryTree (FR-001)
Hierarchical category structure with navigation helpers.

```typescript
interface CategoryTree {
  tree: string[];               // Original hierarchy: ["Bakkerij", "Afbakbrood", "Stokbrood"]
  primary: string;              // First/main category: "Bakkerij"
  breadcrumbs: string;          // Display string: "Bakkerij > Afbakbrood > Stokbrood"
  depth: number;                // Hierarchy depth for UI rendering
}
```

**Validation Rules**:
- `tree` array must not be empty
- `primary` must equal `tree[0]`
- `breadcrumbs` must join `tree` with " > " separator
- `depth` must equal `tree.length`

**State Transitions**: Immutable - computed from original category array

## FixedPrice (FR-002)
Price structure with correct currency for Dutch products.

```typescript
interface FixedPrice {
  regular: number;
  sale?: number;
  currency: string;             // EUR for Dutch products, configurable
}
```

**Validation Rules**:
- `currency` defaults to "EUR" for Dutch products
- `sale` price must be less than `regular` if present
- Frontend handles all formatting based on locale preferences

## IngredientInfo (FR-003)
Separated ingredient types for targeted UI rendering.

```typescript
interface IngredientInfo {
  core: string[];               // Basic ingredients: ["tarwebloem", "water", "gist"]
  additives: string[];          // E-numbers and additives: ["antioxidant (ascorbinezuur [E300])"]
  nutritionalStatement?: string; // Added sugars/salt statements
  allergenStatement?: string;   // Allergen declarations
  total: number;                // Total ingredient count for UI
}
```

**Validation Rules**:
- `core` and `additives` arrays must not overlap
- `total` must equal `core.length + additives.length`
- `nutritionalStatement` parsed from "Waarvan toegevoegde" patterns
- `allergenStatement` parsed from "BEVAT:" or "KAN SPOREN BEVATTEN" patterns

## AdditivesSummary (FR-004)
Simplified additive information for consumer display.

```typescript
interface AdditivesSummary {
  eNumbers: string[];           // ["E300", "E330"]
  summary: string;              // "2 additives (1 natural antioxidant, 1 preservative)"
  warnings: string[];           // ["May affect activity in children"]
  dietary: {
    vegan: boolean;
    vegetarian: boolean;
    organic: boolean;
    natural: boolean;
  };
  categories: string[];         // ["Antioxidant", "Preservative"]
}
```

**Validation Rules**:
- `eNumbers` must be valid E-number format
- `summary` must describe count and types in consumer-friendly language
- `warnings` must include all mandatory EU warnings
- `dietary` flags computed from E-number database
- `categories` must map to EU functional categories

## Nutrition (FR-005)
Enhanced nutrition information with explicit unit context.

```typescript
interface Nutrition {
  // Energy values
  kcal?: number;
  kJ?: number;

  // Macronutrients (all in grams per 100g)
  fat?: number;
  satFat?: number;
  carbs?: number;
  sugars?: number;
  fiber?: number;
  protein?: number;
  salt?: number;

  // Unit context for all values
  unit: "per 100g";
}
```

**Validation Rules**:
- All values must be non-negative numbers
- `unit` field clarifies that all values are per 100g
- Energy values in kcal/kJ, nutrients in grams
- Values must maintain precision from original data
- Frontend can convert to per-serving if needed


## Data Relationships

### Product → CategoryTree
- One-to-one relationship
- CategoryTree computed from Product.categories array
- Immutable transformation preserves original hierarchy

### Product → IngredientInfo
- One-to-one relationship
- IngredientInfo parsed from Product.ingredients array
- Classification based on E-number patterns and Dutch terms

### Product → AdditivesSummary
- One-to-one relationship
- Derived from existing additiveInfo and additiveFlags
- Simplified for consumer understanding

### Product → Nutrition
- One-to-one relationship
- Enhanced from existing nutrition data
- Adds explicit unit context

## Transformation Rules

### Input Validation
- All transformations must preserve original data integrity
- Invalid or missing data must be handled gracefully
- Transformations must be deterministic (same input → same output)

### Error Handling
- Malformed category arrays → use available categories, flag incomplete
- Missing nutritional data → omit optional fields, preserve available data
- Invalid E-numbers → exclude from eNumbers array, log warning
- Missing ingredient data → return empty arrays, maintain structure

### Performance Constraints
- All transformations must be O(1) or O(n) where n is field count
- No database lookups or external API calls
- Memory usage must remain O(current product + helpers)
- Must maintain <10s processing time for 30k products
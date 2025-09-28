# Data Model: Homepage Entities

**Feature**: Homepage for Ali's Product Visualization
**Date**: 2025-09-20
**Status**: Phase 1 - Design

## Core Entities

### 1. FilterCategory

Represents one of Ali's 6 filter profiles with metadata and coverage statistics.

```typescript
interface FilterCategory {
  id: string;                    // e.g., 'daily-protein', 'post-workout'
  name: string;                  // Display name: "Daily Protein", "Post-Workout"
  description: string;           // Brief description for UI
  targetUse: string;             // e.g., "170g protein hunting", "CrossFit recovery"
  coverage: {
    totalProducts: number;       // e.g., 11379 for daily protein
    coveragePercentage: number;  // e.g., 37.3% of total dataset
    lastUpdated: string;         // ISO date string
  };
  dataFiles: {
    jsonl: string;              // Path to filtered JSONL file
    index: string;              // Path to index JSON file
    stats: string;              // Path to stats JSON file
  };
  isDefault: boolean;           // True for daily-protein (landing view)
  priority: number;             // Display order (1-6)
}
```

**Validation Rules**:
- `id` must match filename pattern: `filtered-ali-{id}.jsonl`
- `coverage.totalProducts` must be > 0
- `isDefault` must be true for exactly one category
- `priority` must be unique per category (1-6)

**State Transitions**:
- Loading → Loaded → Active
- Active → Loading (when switching filters)

### 2. FilteredProduct

Product entity optimized for Ali's filtering system with nutrition scoring.

```typescript
interface FilteredProduct {
  id: string;                   // Unique product identifier
  name: string;                 // Product display name
  category: string;             // Food category for grouping

  // Pricing (Dutch market)
  price: {
    regular: number;            // Price per 100g in euros
    currency: 'EUR';
    pricePerServing?: number;   // Calculated from portion data
  };

  // Ali-specific nutritional optimization
  proteinOptimization: {
    proteinContent: number;           // Protein per 100g
    proteinContribution: number;      // Contribution to 170g daily target
    proteinDensityScore: number;      // 0-100 scoring
    proteinEfficiency: number;        // Protein per euro efficiency
  };

  // Halal compliance (strict for Ali)
  halalCheck: {
    status: 'halal' | 'questionable' | 'haram';
    confidence: number;               // 0-100 confidence score
    reasons: string[];               // Validation reasoning
  };

  // Context-specific scoring
  postWorkoutOptimization?: {
    carbProteinRatio: number;         // Optimal 2.0-4.0 for CrossFit
    postWorkoutScore: number;         // 0-100 recovery optimization
    glycemicBoost: number;           // GI factor for glycogen replenishment
    recoveryWindow: 'immediate' | 'moderate' | 'extended';
  };

  fatLossCompatibility?: {
    calorieDensity: number;          // kcal per 100g
    satietyEfficiency: number;       // Satiety per calorie score
    volumeAdvantage: number;         // Volume per calorie for fullness
  };

  // Global health scores
  globalHealthScore: number;         // 0-100 percentile ranking
  globalHealthGrade: 'A' | 'B' | 'C' | 'D' | 'E';
  categoryHealthScore: number;       // Within-category ranking
  categoryHealthGrade: 'A' | 'B' | 'C' | 'D' | 'E';
}
```

**Validation Rules**:
- `proteinOptimization.proteinContent` must be ≥ 0
- `price.regular` must be > 0
- `halalCheck.status` must be 'halal' for Ali's filtered outputs
- Health scores must be 0-100 range
- Health grades must be A-E only

### 3. ProductDisplay

UI-optimized product view for homepage scanning and comparison.

```typescript
interface ProductDisplay {
  id: string;
  name: string;
  category: string;

  // Essential Ali metrics for quick scanning
  proteinPer100g: number;
  pricePerEuro: number;
  dailyTargetContribution: string;    // e.g., "12% of 170g target"

  // Quick visual indicators
  halalStatus: 'confirmed' | 'check-needed';
  healthGrade: 'A' | 'B' | 'C' | 'D' | 'E';

  // Context-specific highlights
  contextScore?: number;              // Current filter's optimization score
  contextLabel?: string;              // e.g., "Post-workout ready", "Budget-friendly"

  // UI optimization
  imageUrl?: string;                  // Lazy-loaded product image
  isHighlighted: boolean;             // Featured/recommended flag
}
```

**Validation Rules**:
- Must be derived from FilteredProduct entity
- `contextScore` only present when relevant to current filter
- `dailyTargetContribution` must be calculated from proteinOptimization data

### 4. HomepageState

Client-side state management for filter navigation and product display.

```typescript
interface HomepageState {
  // Current filter selection
  activeFilter: FilterCategory;
  availableFilters: FilterCategory[];

  // Product data
  products: FilteredProduct[];
  displayProducts: ProductDisplay[];

  // UI state
  loading: boolean;
  error: string | null;

  // Performance optimization
  virtualScrollOffset: number;
  visibleRange: { start: number; end: number };

  // Search/filtering (client-side)
  searchQuery: string;
  sortBy: 'protein' | 'price' | 'health-score' | 'relevance';
  sortDirection: 'asc' | 'desc';
}
```

**State Transitions**:
```
Initial → Loading → Ready
Ready → FilterSwitching → Ready
Ready → Searching → Ready
Ready → Sorting → Ready
```

## Entity Relationships

```
FilterCategory (1) ←→ (many) FilteredProduct
FilteredProduct (1) → (1) ProductDisplay
HomepageState (1) ←→ (1) FilterCategory
HomepageState (1) ←→ (many) ProductDisplay
```

## Data Flow

1. **Initialization**: Load FilterCategory metadata
2. **Filter Selection**: Load FilteredProducts for selected category
3. **Display Optimization**: Transform to ProductDisplay entities
4. **Client Filtering**: Apply search/sort without server round-trips
5. **Virtual Scrolling**: Render visible ProductDisplay items only

## Performance Constraints

- **Memory**: Max 100MB for 11k products
- **Rendering**: Virtual scrolling for >100 items
- **Load Time**: <2s initial filter load on 3G
- **Search**: <100ms client-side filtering response

**Data Model Complete**: Ready for contract generation and component design.
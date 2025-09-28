# Data Model: Category Index Page

## Core Entities

### CategoryWithMetrics
Extends existing CategoryNode with Ali-specific metrics for index display.

```typescript
interface CategoryWithMetrics extends CategoryNode {
  // Existing CategoryNode fields
  name: string;
  path: string[];
  breadcrumbs: string;
  depth: number;
  productCount: number;
  children: CategoryNode[];

  // Ali-specific metrics (pre-computed in transform pipeline)
  aliMetrics: {
    halalCompliance: number;        // 0-100% ratio of halal products
    averageProtein: number;         // g/100g average protein density
    priceEfficiency: number;        // protein-per-euro score
    recommendedFor: AliContext[];   // nutrition context recommendations
  };

  // UI state
  isExpanded: boolean;
  isSelected: boolean;
  isVisible: boolean;
}
```

### AliContext
Nutrition context recommendations for categories.

```typescript
type AliContext =
  | 'daily-protein'     // High protein for 170g target
  | 'post-workout'      // Recovery nutrition
  | 'cutting'           // Fat loss compatible
  | 'budget'            // Cost-efficient protein
  | 'training-day'      // High carb for training
  | 'rest-day';         // Lower carb for rest
```

### CategoryIndexState
Client-side state management for the index page.

```typescript
interface CategoryIndexState {
  // Data
  categories: CategoryWithMetrics[];
  filteredCategories: CategoryWithMetrics[];
  selectedCategory: CategoryWithMetrics | null;

  // UI state
  loading: boolean;
  error: string | null;
  searchQuery: string;
  sortBy: CategorySortOption;
  activeFilters: AliFilterCriteria;

  // Performance
  virtualScrolling: boolean;
  visibleRange: { start: number; end: number };
}
```

### CategorySortOption
Available sorting options for category display.

```typescript
type CategorySortOption =
  | 'product-count-desc'    // Most products first
  | 'product-count-asc'     // Fewest products first
  | 'name-asc'              // Alphabetical A-Z
  | 'name-desc'             // Alphabetical Z-A
  | 'protein-desc'          // Highest protein first
  | 'halal-compliance-desc' // Highest halal % first
  | 'price-efficiency-desc'; // Best value first
```

### AliFilterCriteria
Filter criteria for Ali-specific category filtering.

```typescript
interface AliFilterCriteria {
  minHalalCompliance?: number;    // 0-100% minimum halal ratio
  minProtein?: number;            // g/100g minimum protein density
  maxPricePerProtein?: number;    // maximum price per protein gram
  contexts?: AliContext[];        // recommended nutrition contexts
  minProductCount?: number;       // minimum products in category
}
```

## Data Relationships

### Category Hierarchy
```
CategoryWithMetrics (root)
├── aliMetrics (computed)
├── children[] (CategoryNode[])
│   ├── child.aliMetrics (computed)
│   └── child.children[] (recursive)
└── parent? (CategoryNode)
```

### Ali Metrics Calculation
Pre-computed in transform pipeline from product data:

```typescript
// Transform pipeline calculation (not client-side)
function calculateAliMetrics(
  products: FilteredProduct[],
  category: CategoryNode
): AliMetrics {
  const categoryProducts = products.filter(p =>
    p.categoryTree.breadcrumbs.includes(category.name)
  );

  return {
    halalCompliance: calculateHalalRatio(categoryProducts),
    averageProtein: calculateProteinAverage(categoryProducts),
    priceEfficiency: calculatePriceEfficiency(categoryProducts),
    recommendedFor: determineRecommendations(categoryProducts)
  };
}
```

## State Transitions

### Loading States
```
INITIAL → LOADING → LOADED → READY
         ↓
         ERROR → RETRY → LOADING
```

### Search/Filter Flow
```
USER_INPUT → DEBOUNCE(300ms) → FILTER_CATEGORIES → UPDATE_DISPLAY
```

### Navigation Flow
```
CATEGORY_CLICK → PRESERVE_FILTERS → NAVIGATE_TO_PRODUCTS
```

## Validation Rules

### Category Data
- `name`: Required, non-empty string
- `productCount`: Required, non-negative integer
- `aliMetrics.halalCompliance`: 0-100 range
- `aliMetrics.averageProtein`: Non-negative number
- `aliMetrics.priceEfficiency`: Positive number

### Search Input
- `searchQuery`: Max 100 characters, trimmed
- Case-insensitive matching
- Dutch language character support

### Filter Criteria
- `minHalalCompliance`: 0-100 range if specified
- `minProtein`: Non-negative if specified
- `contexts`: Valid AliContext values only

## Performance Considerations

### Virtual Scrolling
- Render only visible categories (window size ~50 items)
- Buffer 10 items above/below visible range
- Track scroll position for smooth experience

### Client-side Filtering
- Debounced search input (300ms delay)
- Memoized filter results
- Index-based category lookup for O(1) access

### Memory Management
- Lazy load Ali metrics display
- Cleanup event listeners on unmount
- Efficient category tree traversal

## Data Sources

### Static Assets
- `/public/category-tree.json` - Categories with pre-computed Ali metrics
- No runtime API calls (Static Generation First)

### Client State
- React useState for UI state
- useMemo for computed values
- useCallback for event handlers

## Error Handling

### Data Loading Errors
- Network failures → Retry with exponential backoff
- Invalid JSON → Show error message with fallback
- Missing metrics → Display categories without Ali data

### User Input Errors
- Invalid search → Clear and show message
- Filter conflicts → Reset to safe defaults

### Navigation Errors
- Invalid category → Redirect to index root
- Missing product page → Show placeholder message
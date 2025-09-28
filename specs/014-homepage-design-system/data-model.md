# Data Model: Homepage Design System Components

**Feature**: 014-homepage-design-system
**Date**: 2025-09-20
**Status**: Complete

## Core Entities

### FilterCategory
Represents one of Ali's 6 nutrition filter profiles with metadata and coverage statistics.

**Fields**:
- `id: string` - Unique identifier matching filename pattern (e.g., 'daily-protein', 'post-workout')
- `name: string` - Human-readable display name (e.g., 'Daily Protein', 'Post-Workout')
- `description: string` - Brief explanation of the filter's purpose
- `targetUse: string` - Target use case for Ali's nutrition goals
- `coverage: CoverageStats` - Statistics about this filter's product coverage
- `dataFiles: DataFilePaths` - File paths for static data consumption
- `isDefault: boolean` - True for Ali's daily protein filter (homepage default)
- `priority: number` - Display order priority (1-6)

**Relationships**:
- Has many FilteredProduct (via JSONL file)
- Referenced by HomepageState.activeFilter

**Validation Rules**:
- `id` must match regex pattern `^[a-z-]+$`
- `priority` must be unique integer 1-6
- `dataFiles.jsonl` path must exist and be readable
- Only one FilterCategory can have `isDefault: true`

### ProductDisplay
UI-optimized product display entity for homepage consumption.

**Fields**:
- `id: string` - Unique product identifier
- `name: string` - Product display name
- `category: string` - Product category classification
- `proteinPer100g: number` - Protein content per 100g
- `pricePerEuro: number` - Price in euros per 100g
- `dailyTargetContribution: string` - Formatted percentage (e.g., "12% of 170g target")
- `halalStatus: 'confirmed' | 'check-needed'` - Islamic dietary compliance
- `healthGrade: 'A' | 'B' | 'C' | 'D' | 'E'` - EU Nutri-Score inspired grade
- `contextScore?: number` - Filter-specific optimization score (0-100)
- `contextLabel?: string` - Human-readable context description
- `imageUrl?: string` - Optional product image URL
- `isHighlighted: boolean` - UI flag for emphasized display

**Relationships**:
- Transformed from FilteredProduct (source data)
- Referenced by ProductList component
- Consumed by ProductCard component

**Validation Rules**:
- `proteinPer100g` must be >= 0
- `pricePerEuro` must be > 0
- `contextScore` must be 0-100 if present
- `halalStatus` must be validated enum value
- `healthGrade` must be A-E character

### HomepageState
Application state management entity for homepage component.

**Fields**:
- `activeFilter: FilterCategory` - Currently selected filter
- `availableFilters: FilterCategory[]` - All 6 filter categories
- `products: FilteredProduct[]` - Raw product data from JSONL
- `displayProducts: ProductDisplay[]` - UI-optimized product list
- `loading: boolean` - Data loading state
- `error: string | null` - Error message or null
- `virtualScrollOffset: number` - Virtual scrolling position
- `visibleRange: { start: number; end: number }` - Currently rendered items
- `searchQuery: string` - Current search filter
- `sortBy: SortOption` - Active sort column
- `sortDirection: 'asc' | 'desc'` - Sort direction

**State Transitions**:
- `loading: true` → Load filter data → `loading: false, products: loaded`
- Filter change → `loading: true` → Load new products → Update `displayProducts`
- Search input → Update `searchQuery` → Filter `displayProducts`
- Sort change → Update `sortBy/sortDirection` → Reorder `displayProducts`

**Validation Rules**:
- `activeFilter` must exist in `availableFilters`
- `visibleRange.start` must be <= `visibleRange.end`
- `visibleRange.end` must be <= `displayProducts.length`
- `searchQuery` length must be <= 100 characters

## Supporting Types

### CoverageStats
Statistics about filter coverage and freshness.

**Fields**:
- `totalProducts: number` - Number of products matching filter
- `coveragePercentage: number` - Percentage of total dataset (0-100)
- `lastUpdated: string` - ISO date string of last data update

### DataFilePaths
File paths for static data consumption.

**Fields**:
- `jsonl: string` - Path to filtered JSONL file
- `index: string` - Path to searchable index JSON file
- `stats: string` - Path to statistics JSON file

### VirtualScrollConfig
Configuration for virtual scrolling optimization.

**Fields**:
- `itemHeight: number` - Fixed height of each product card in pixels
- `containerHeight: number` - Viewport height for visible calculations
- `overscan?: number` - Additional items to render outside viewport (default: 5)

### SortOption
Available sorting options for product lists.

**Values**: `'protein' | 'price' | 'health-score' | 'relevance'`

## Data Flow

### Filter Navigation Flow
1. User taps FilterCard → HomepageState updates `activeFilter`
2. Component triggers data loading for new filter category
3. ProductTransformer converts FilteredProduct[] to ProductDisplay[]
4. ProductList re-renders with new virtual scrolling calculations

### Search & Sort Flow
1. User types in SearchControls → `searchQuery` updates
2. Client-side filtering applies to `displayProducts`
3. Virtual scrolling recalculates visible range
4. ProductList re-renders filtered subset

### Virtual Scrolling Flow
1. User scrolls ProductList → `virtualScrollOffset` updates
2. Calculate new `visibleRange` based on viewport and item height
3. Render only visible ProductCard components + overscan buffer
4. Update scroll position and total height for native scrollbar

## Performance Characteristics

- **Memory Usage**: O(1) regardless of product count (virtual scrolling)
- **Search Performance**: O(m) where m = query length (trie-based indexing)
- **Filter Switch**: O(n) where n = number of products in new filter
- **Sort Performance**: O(n log n) where n = filtered product count
- **Render Performance**: O(k) where k = visible items + overscan buffer

---

**Data Model Status**: ✅ Complete - All entities defined with validation rules and relationships
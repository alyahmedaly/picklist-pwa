# Feature 015: Category Index Navigation System

## Overview

Transform the category tree visualization into a comprehensive category index for product discovery and navigation. Users should be able to browse all categories and subcategories in a clear, organized layout and click any category to navigate to a filtered product list page.

## User Story

**As Ali (CrossFit athlete with specific dietary needs),**
**I want to browse food categories in an organized index format**
**So that I can quickly find products that meet my halal compliance, protein targets (170g), and budget constraints (¬50/week)**

## Requirements

### Functional Requirements

#### FR-015-001: Category Index Display
- Display all 3,195 categories from `/public/category-tree.json` in an organized grid/card layout
- Show category hierarchy with clear parent-child relationships
- Display product counts for each category
- Show Ali-specific metrics: halal compliance %, average protein per 100g, price efficiency

#### FR-015-002: Category Navigation
- Each category/subcategory must be clickable
- Clicking navigates to a product list page filtered by that category
- Preserve Ali's filter preferences (halal-strict, protein optimization) in navigation
- Show breadcrumb navigation for deep category paths

#### FR-015-003: Ali-Optimized Category Insights
- Display halal compliance percentage per category
- Show average protein density (g/100g) for protein-rich categories
- Highlight budget-friendly categories with price-per-protein efficiency
- Mark categories suitable for post-workout, cutting, or training day contexts

#### FR-015-004: Search and Filtering
- Search categories by name or Dutch terms
- Filter categories by Ali-specific criteria (>50% halal products, >15g protein average)
- Sort by product count, protein density, or price efficiency

### Non-Functional Requirements

#### NFR-015-001: Performance
- Load category index in <2s on 3G connection
- Virtual scrolling for categories if >1000 visible
- Client-side search response <100ms

#### NFR-015-002: Accessibility
- WCAG 2.1 AA compliance for category navigation
- Keyboard navigation between category cards
- Screen reader support for category metrics

#### NFR-015-003: Mobile Responsiveness
- Touch-friendly category cards (44px minimum)
- Responsive grid layout (1 column mobile, 2-3 tablet, 4+ desktop)
- Swipe gestures for category browsing

## Technical Design

### Data Model

#### Category Index Structure
```typescript
interface CategoryIndexItem {
  name: string;
  path: string[];
  breadcrumbs: string;
  depth: number;
  productCount: number;

  // Ali-specific metrics
  halalCompliance: number; // 0-100%
  averageProtein: number; // g/100g
  priceEfficiency: number; // protein-per-euro score
  recommendedFor: ('daily' | 'post-workout' | 'cutting' | 'budget')[];

  // Navigation
  categoryUrl: string; // /products?category=path
  parentCategory?: string;
  subcategories: string[];
}
```

#### Ali Filter Integration
```typescript
interface AliCategoryMetrics {
  halalProductCount: number;
  totalProductCount: number;
  avgProteinPer100g: number;
  avgPricePerProteinGram: number;
  topProducts: {
    bestProtein: ProductSummary;
    bestValue: ProductSummary;
    bestPostWorkout: ProductSummary;
  };
}
```

### Component Architecture

#### CategoryIndexPage Component
- Main page component following constitutional Component Composition
- Early returns for loading, error, and empty states
- Grid layout with responsive breakpoints

#### CategoryCard Component
- Individual category display with Ali metrics
- Click handler for navigation to product list
- Hover state showing quick product preview
- Badge system for Ali recommendations

#### CategorySearch Component
- Real-time search with Dutch language support
- Filter toggles for Ali criteria
- Sort options (product count, protein, efficiency)

### Navigation Flow

1. **Category Index** (`/categories`) - Browse all categories
2. **Category Detail** (`/products?category={path}`) - Filtered product list
3. **Product Detail** (`/product/{id}`) - Individual product view

### Ali Integration Points

#### Halal Compliance Calculation
- Count products with `halalInfo.isHalal: true` per category
- Display percentage with visual indicator (>80% = green, 50-80% = yellow, <50% = red)

#### Protein Optimization
- Calculate average protein per 100g for category
- Highlight categories exceeding 15g/100g threshold
- Show contribution to 170g daily target

#### Budget Optimization
- Calculate price-per-protein efficiency scores
- Rank categories by value for money
- Integrate with ¬50/week budget tracking

## Implementation Plan

### Phase 1: Core Navigation (Week 1)
- [ ] Update CategoryTreePage to category index layout
- [ ] Create CategoryCard component with basic metrics
- [ ] Implement category click navigation to product list
- [ ] Add breadcrumb navigation

### Phase 2: Ali Metrics Integration (Week 2)
- [ ] Calculate halal compliance percentages
- [ ] Add protein density calculations
- [ ] Implement price efficiency scoring
- [ ] Create Ali recommendation badges

### Phase 3: Search and Filtering (Week 3)
- [ ] Build CategorySearch component
- [ ] Add real-time Dutch language search
- [ ] Implement Ali-specific filters
- [ ] Add sorting options

### Phase 4: Performance Optimization (Week 4)
- [ ] Virtual scrolling for large category lists
- [ ] Client-side caching of category metrics
- [ ] Optimize mobile touch interactions
- [ ] Accessibility testing and refinement

## Testing Strategy

### Unit Tests
- CategoryCard component rendering with Ali metrics
- Navigation URL generation
- Halal compliance calculations
- Price efficiency scoring

### Integration Tests
- Category index loading from JSON data
- Navigation flow to product list pages
- Search and filtering functionality
- Ali filter preservation across navigation

### Accessibility Tests
- Keyboard navigation between categories
- Screen reader compatibility
- Color contrast for Ali metric indicators
- Touch target sizing on mobile

## Acceptance Criteria

### AC-015-001: Category Display
- [ ] All 3,195 categories display in organized grid layout
- [ ] Each category shows product count and Ali metrics
- [ ] Hierarchy is visually clear with proper indentation/grouping
- [ ] Loading states and error handling work correctly

### AC-015-002: Navigation Functionality
- [ ] Clicking any category navigates to filtered product list
- [ ] URL includes category path for bookmarking
- [ ] Breadcrumb navigation shows current location
- [ ] Back button returns to category index

### AC-015-003: Ali Optimization
- [ ] Halal compliance percentage displays accurately
- [ ] Protein density highlights protein-rich categories
- [ ] Budget efficiency scores help identify value categories
- [ ] Recommendations match Ali's dietary requirements

### AC-015-004: Search and Performance
- [ ] Search finds categories by Dutch and English names
- [ ] Filtering by Ali criteria works correctly
- [ ] Page loads in <2s on 3G connection
- [ ] Mobile experience is touch-friendly and responsive

## Definition of Done

- [ ] Feature implemented according to constitutional principles
- [ ] All unit and integration tests pass
- [ ] Accessibility testing complete (WCAG 2.1 AA)
- [ ] Mobile responsiveness verified on multiple devices
- [ ] Performance benchmarks met (<2s load, <100ms search)
- [ ] Documentation updated in README.md
- [ ] Storybook stories created for new components
- [ ] Code review completed
- [ ] Ali user testing validated the shopping workflow

## Dependencies

- Existing `/public/category-tree.json` data structure
- Product list page implementation (may need creation)
- Ali filter system integration
- Design system components (Card, Badge, Button)
- Navigation routing setup in App.tsx

## Risks and Mitigations

### Risk: Large Dataset Performance
- **Mitigation**: Virtual scrolling and client-side caching
- **Fallback**: Server-side pagination if needed

### Risk: Complex Ali Metrics Calculations
- **Mitigation**: Pre-compute metrics in transform pipeline
- **Fallback**: Basic category display without advanced metrics

### Risk: Mobile UX Complexity
- **Mitigation**: Progressive enhancement approach
- **Fallback**: Simplified mobile layout if advanced features don't work
# Quickstart: Homepage Implementation

**Feature**: Homepage for Ali's Product Visualization
**Date**: 2025-09-20
**Prerequisites**: research.md, data-model.md, contracts/ complete

## Quick Start Guide

### 1. Development Environment Setup

```bash
# Ensure project dependencies are installed
npm install

# Start development server
npm run dev

# Run tests in watch mode
npm run test:watch

# Check TypeScript compilation
npm run build
```

### 2. Data Preparation Verification

```bash
# Verify Ali's filtered outputs exist
ls public/filtered-ali-*.jsonl
# Expected files:
# - filtered-ali-daily-protein.jsonl (11,379 products)
# - filtered-ali-post-workout.jsonl
# - filtered-ali-cutting.jsonl
# - filtered-ali-budget.jsonl
# - filtered-ali-training-day.jsonl
# - filtered-ali-rest-day.jsonl

# Verify index and stats files exist
ls public/filtered-ali-*-index.json
ls public/filtered-ali-*-stats.json
```

### 3. Component Development Flow

#### 3.1 Create Type Definitions

```bash
# Create type definitions from contracts
cp specs/012-homepage/contracts/*.ts src/data/types/
```

#### 3.2 Implement Data Loading

```typescript
// src/data/loadFilters.ts
export const loadFilterCategories = async (): Promise<FilterCategory[]> => {
  // Load metadata for Ali's 6 filter profiles
  return [
    {
      id: 'daily-protein',
      name: 'Daily Protein',
      description: 'Halal protein sources for 170g daily target',
      targetUse: '170g protein hunting',
      coverage: { totalProducts: 11379, coveragePercentage: 37.3, lastUpdated: '2025-09-20' },
      dataFiles: {
        jsonl: '/filtered-ali-daily-protein.jsonl',
        index: '/filtered-ali-daily-protein-index.json',
        stats: '/filtered-ali-daily-protein-stats.json'
      },
      isDefault: true,
      priority: 1
    },
    // ... other categories
  ];
};
```

#### 3.3 Component Implementation Order

1. **FilterCard.tsx** - Individual filter navigation cards
2. **ProductCard.tsx** - Individual product display cards
3. **ProductList.tsx** - Virtual scrolling product list
4. **Homepage.tsx** - Main homepage component

### 4. User Story Validation

#### Story 1: Ali lands on daily protein view

```typescript
// Test scenario
describe('Homepage Default View', () => {
  test('displays daily protein filter by default', async () => {
    render(<Homepage />);

    // Should show Ali's Daily Protein as active filter
    expect(screen.getByText('Daily Protein')).toBeInTheDocument();
    expect(screen.getByText('11,379 products')).toBeInTheDocument();

    // Should load and display products
    await waitFor(() => {
      expect(screen.getByText(/protein/i)).toBeInTheDocument();
    });
  });
});
```

#### Story 2: Ali switches between filter tabs

```typescript
// Test scenario
describe('Filter Navigation', () => {
  test('switches to post-workout filter', async () => {
    render(<Homepage />);

    // Click post-workout filter card
    fireEvent.click(screen.getByText('Post-Workout'));

    // Should update active filter and load new products
    await waitFor(() => {
      expect(screen.getByText('Post-Workout')).toHaveClass('active');
    });
  });
});
```

#### Story 3: Mobile responsive behavior

```typescript
// Test scenario
describe('Mobile Responsiveness', () => {
  test('displays mobile-optimized layout', () => {
    // Set mobile viewport
    Object.defineProperty(window, 'innerWidth', { value: 375 });

    render(<Homepage />);

    // Filter cards should stack vertically on mobile
    const filterGrid = screen.getByTestId('filter-grid');
    expect(filterGrid).toHaveClass('grid-cols-1');

    // Product cards should be compact
    const productCards = screen.getAllByTestId('product-card');
    productCards.forEach(card => {
      expect(card).toHaveClass('compact');
    });
  });
});
```

### 5. Performance Validation

#### Load Time Testing

```bash
# Build for production
npm run build

# Serve production build
npm run preview

# Test with browser dev tools:
# 1. Set network to "Slow 3G"
# 2. Load homepage
# 3. Verify <2s initial load
# 4. Switch filters and verify smooth transitions
```

#### Memory Usage Monitoring

```typescript
// Add to component for development monitoring
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    const memoryInfo = (performance as any).memory;
    console.log(`Memory usage: ${memoryInfo?.usedJSHeapSize / 1024 / 1024}MB`);
  }
}, [products]);
```

### 6. Constitutional Compliance Check

- ✅ **Data-First**: Consumes pre-generated JSONL files
- ✅ **TDD**: Tests written before implementation
- ✅ **Minimal Dependencies**: Only React + Vite + TailwindCSS
- ✅ **Static Generation**: SSG build produces CDN-ready files
- ✅ **Performance**: <2s load, <1MB bundle, <100MB memory

### 7. Ready for Implementation

**Prerequisites Met**:
- [x] Research complete (technical decisions made)
- [x] Data model defined (entities and relationships)
- [x] Contracts specified (component interfaces)
- [x] User stories validated (test scenarios defined)
- [x] Performance targets set (<2s load, <1MB bundle)

**Next Steps**:
1. Run `/tasks` command to generate numbered implementation tasks
2. Execute tasks in TDD order (tests → implementation)
3. Validate against user stories and performance targets

**Development Ready**: All Phase 1 artifacts complete, ready for task generation.
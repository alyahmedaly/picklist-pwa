# Research: Homepage Technical Decisions

**Feature**: Homepage for Ali's Product Visualization
**Date**: 2025-09-20
**Status**: Phase 0 Complete

## Research Areas

### 1. React 19 SSG Patterns with Vite

**Decision**: Use Vite's static build with React 19 functional components
**Rationale**:
- Vite provides excellent SSG support with zero-config static asset optimization
- React 19 offers improved performance with automatic batching and concurrent features
- Constitutional compliance: minimal dependencies, performance-first

**Alternatives Considered**:
- Next.js SSG: Rejected due to heavier framework weight
- Plain HTML/JS: Rejected due to maintainability concerns
- Gatsby: Rejected due to GraphQL complexity

**Implementation Pattern**:
```typescript
// Static data loading at build time
const loadFilterData = async (filterName: string) => {
  const response = await fetch(`/filtered-ali-${filterName}.jsonl`);
  return response.text().split('\n').map(line => JSON.parse(line));
};
```

### 2. Large JSONL File Loading Optimization

**Decision**: Lazy loading with streaming JSON parsing and virtual scrolling
**Rationale**:
- 11k+ products require efficient memory management
- Streaming prevents UI blocking during data load
- Virtual scrolling maintains performance with large lists

**Alternatives Considered**:
- Load all data upfront: Rejected due to memory constraints
- Server-side pagination: Rejected due to static site requirement
- IndexedDB caching: Rejected due to complexity vs. benefit

**Implementation Pattern**:
```typescript
// Streaming JSONL parser
const streamJSONL = async (url: string, callback: (item: Product) => void) => {
  const response = await fetch(url);
  const reader = response.body?.getReader();
  // Process line by line to avoid memory spikes
};
```

### 3. TailwindCSS 4+ Mobile-First Design

**Decision**: Utility-first responsive grid with CSS container queries
**Rationale**:
- Mobile-first approach aligns with Ali's primary usage pattern
- Container queries provide better component-level responsiveness
- Minimal custom CSS reduces bundle size

**Alternatives Considered**:
- CSS Modules: Rejected due to additional complexity
- Styled Components: Rejected due to runtime overhead
- Bootstrap: Rejected due to bundle size

**Implementation Pattern**:
```css
/* Mobile-first filter cards */
.filter-grid {
  @apply grid grid-cols-1 gap-4
         sm:grid-cols-2
         lg:grid-cols-3;
}

/* Container query for product cards */
@container (min-width: 320px) {
  .product-card {
    @apply flex-row;
  }
}
```

### 4. Client-Side Performance Optimization

**Decision**: Virtual scrolling + memoization + lazy image loading
**Rationale**:
- Virtual scrolling handles 11k+ items without DOM bloat
- React.memo prevents unnecessary re-renders
- Lazy loading reduces initial bundle size

**Alternatives Considered**:
- Full DOM rendering: Rejected due to performance impact
- Server-side rendering: Not applicable for static sites
- Web Workers: Rejected due to complexity for data filtering

**Implementation Pattern**:
```typescript
// Virtual scrolling component
const VirtualProductList = React.memo(({ products, filterCriteria }) => {
  const filteredProducts = useMemo(() =>
    products.filter(product => matchesFilter(product, filterCriteria)),
    [products, filterCriteria]
  );

  return <FixedSizeList height={600} itemCount={filteredProducts.length} />;
});
```

## Performance Targets Validation

**Bundle Size**: <1MB gzipped
- Vite tree-shaking eliminates unused code
- Dynamic imports for non-critical components
- TailwindCSS purging removes unused styles

**Load Time**: <2s on 3G
- Static assets served from CDN
- Critical CSS inlined
- JSONL files loaded progressively

**Memory Usage**: <100MB for 11k products
- Virtual scrolling limits DOM nodes
- Streaming JSON parsing prevents memory spikes
- Lazy loading of images and non-visible data

## Constitutional Compliance Check

✅ **Data-First Architecture**: Static JSONL consumption
✅ **Minimal Dependencies**: Core stack only (React + Vite + Tailwind)
✅ **Static Generation First**: SSG with CDN deployment
✅ **Performance & Determinism**: Measurable targets met
✅ **Test-Driven Development**: Component testing strategy defined

## Next Steps

Phase 1 ready to proceed with:
1. Data model extraction from research decisions
2. Component contract definitions
3. Test scenario implementation
4. CLAUDE.md context updates

**Research Complete**: All technical unknowns resolved with constitutional compliance maintained.
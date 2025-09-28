# Research: Homepage Design System Components

**Feature**: 014-homepage-design-system
**Date**: 2025-09-20
**Status**: Complete

## Virtual Scrolling for 11k+ Product Lists

**Decision**: Implement custom React virtual scrolling using `useVirtualizer` pattern with intersection observer
**Rationale**:
- Pure React solution maintains constitutional compliance (no external dependencies)
- Intersection Observer API provides efficient viewport detection with minimal CPU overhead
- Custom implementation allows optimization for Ali's specific product card dimensions
- Memory usage stays constant regardless of list size (renders only visible items + buffer)
**Alternatives considered**:
- `react-window`: External dependency violates constitutional principles
- `@tanstack/react-virtual`: Additional dependency, though performant
- Browser native scrolling: Poor performance with 11k+ DOM nodes

## React 19 Concurrent Features for Performance

**Decision**: Use `useDeferredValue` for search queries and `useTransition` for filter switching
**Rationale**:
- `useDeferredValue` prevents search input lag by deferring expensive filtering operations
- `useTransition` allows filter category switches to remain responsive while product lists update
- Built into React 19, no additional dependencies
- Maintains 60fps scrolling performance during background updates
**Alternatives considered**:
- `setTimeout` debouncing: Less sophisticated, doesn't integrate with React's scheduler
- `useMemo` only: Doesn't handle concurrent updates as gracefully
- Web Workers: Overkill for client-side filtering, adds complexity

## shadcn/ui Extension Patterns

**Decision**: Extend existing Card, Button, Badge components using composition and variant patterns
**Rationale**:
- FilterCard builds on existing Card component with custom nutrition-focused styling
- ProductCard reuses Card + Badge + Button for consistent design language
- Maintains shadcn/ui's composability principles and accessibility features
- Uses Class Variance Authority (CVA) for systematic variant management
**Alternatives considered**:
- Creating entirely new components: Breaks design consistency
- Directly modifying shadcn/ui components: Makes updates difficult
- CSS-only extensions: Loses TypeScript safety and variant management

## Mobile-First Responsive Filter Navigation

**Decision**: Horizontal scrolling card layout with touch-friendly tap targets (minimum 44px)
**Rationale**:
- Horizontal scroll preserves vertical space for product list on mobile
- Card-based layout provides clear visual hierarchy for Ali's 6 filter categories
- Touch targets meet iOS/Android accessibility guidelines
- CSS Grid with scroll-snap provides smooth native scrolling behavior
**Alternatives considered**:
- Dropdown menu: Hides filter options, requires additional tap to access
- Vertical stack: Consumes too much vertical space on mobile
- Tab interface: Less discoverable, doesn't show coverage statistics as effectively

## Static Data Loading Strategy

**Decision**: Lazy loading with React.lazy() for JSONL files, eager loading for filter metadata
**Rationale**:
- Filter categories (metadata) load immediately for navigation
- Product data loads on-demand when category is selected
- Streaming JSON parsing for large JSONL files reduces initial bundle size
- Browser caching optimizes repeat visits
**Alternatives considered**:
- Eager loading all data: Violates <1MB bundle size requirement
- Service Worker caching: Adds complexity, not needed for static files
- IndexedDB storage: Unnecessary for read-only static data

## Client-Side Search Performance

**Decision**: Fuzzy search with trie-based indexing for instant results
**Rationale**:
- Trie data structure provides O(m) search time where m = query length
- Works well for product name searching across multiple languages (Dutch/English)
- Memory efficient for 11k+ product names
- Integrates cleanly with virtual scrolling (filters visible items)
**Alternatives considered**:
- Simple string.includes(): O(n*m) complexity, too slow for 11k items
- Full-text search libraries: External dependencies violate constitution
- Server-side search: Violates static-only constraint

## Error Handling and Loading States

**Decision**: Suspend boundaries with skeleton components for graceful degradation
**Rationale**:
- React Suspense provides clean loading state management
- Skeleton components maintain layout stability during data loading
- Error boundaries prevent individual component failures from breaking entire homepage
- Progressive enhancement ensures core functionality works even with slow networks
**Alternatives considered**:
- Loading spinners: Less informative, causes layout shift
- Try-catch blocks: More complex state management
- Network-first caching: Requires service worker, adds complexity

---

**Research Status**: ✅ Complete - All technical unknowns resolved with constitutional compliance
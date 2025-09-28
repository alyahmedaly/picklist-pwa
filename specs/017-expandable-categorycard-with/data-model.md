# Data Model: Expandable CategoryCard

**Date**: 2025-09-20
**Feature**: Expandable CategoryCard with Subcategory Tree Display

## Overview

This document defines the data structures and state management for expandable CategoryCard functionality, extending existing CategoryWithMetrics and CategoryIndexState models to support hierarchical tree expansion.

## Enhanced Type Definitions

### 1. Expansion State Management

```typescript
// Expansion state tracking for category tree navigation
interface CategoryExpansionState {
  expandedCategories: Set<string>;        // Category paths that are expanded
  autoExpandedCategories: Set<string>;    // Categories expanded by search (auto-collapse on clear)
  expansionMode: 'manual' | 'search';     // Current expansion trigger mode
  maxAutoDepth: number;                   // Maximum depth for auto-expansion (default: 2)
}

// Expansion configuration options
interface ExpansionConfig {
  maxInitialDepth: number;                // Maximum depth to show initially (default: 2)
  maxChildrenPerLevel: number;            // Maximum children to show before pagination (default: 10)
  enableKeyboardNavigation: boolean;      // Enable ARIA tree keyboard navigation (default: true)
  enableBulkOperations: boolean;          // Enable expand/collapse all buttons (default: true)
  sessionPersistence: boolean;            // Persist expansion state in session (default: true)
}
```

### 2. Enhanced CategoryCard Props

```typescript
// Extended props for CategoryCard with expansion capabilities
interface ExpandableCategoryCardProps extends CategoryCardProps {
  // Expansion state
  isExpanded?: boolean;                   // Whether this category is currently expanded
  expansionState?: CategoryExpansionState; // Global expansion state for hierarchy

  // Expansion controls
  onToggleExpansion?: (categoryPath: string) => void;  // Handle expand/collapse
  onSubcategorySelect?: (category: CategoryWithMetrics) => void; // Handle subcategory selection

  // Display options
  showSubcategoryCount?: boolean;         // Show "N subcategories" indicator
  maxVisibleChildren?: number;            // Limit visible children before "Show more"
  enableKeyboardNav?: boolean;            // Enable keyboard tree navigation

  // Performance options
  virtualScrolling?: boolean;             // Whether parent uses virtual scrolling
  onHeightChange?: (newHeight: number) => void; // Notify parent of height changes
}

// Subcategory tree node component props
interface CategoryTreeNodeProps {
  category: CategoryWithMetrics;          // Category data with children
  level: number;                          // Tree depth level (0 = root)
  isExpanded: boolean;                    // Current expansion state
  isSelected: boolean;                    // Whether this category is selected

  // Interaction handlers
  onToggle: (categoryPath: string) => void; // Handle expand/collapse
  onSelect: (category: CategoryWithMetrics) => void; // Handle category selection

  // Display configuration
  maxChildren: number;                    // Maximum children to show initially
  showMetrics: boolean;                   // Whether to show Ali metrics
  enableKeyboardNav: boolean;             // Enable keyboard navigation

  // Performance props
  onHeightChange?: (height: number) => void; // Height change notification
}
```

### 3. Enhanced CategoryIndexState

```typescript
// Extended state for CategoryIndexPage with expansion support
interface ExpandedCategoryIndexState extends CategoryIndexState {
  // Expansion management
  expansionState: CategoryExpansionState;
  expansionConfig: ExpansionConfig;

  // Performance tracking
  expandedItemHeights: Map<string, number>; // Cache measured heights for virtual scrolling
  lastExpansionUpdate: number;              // Timestamp of last expansion change

  // Search integration
  searchExpandedCategories: string[];       // Categories expanded due to search matches

  // Bulk operations
  bulkExpansionInProgress: boolean;         // Whether bulk expand/collapse is in progress
}
```

### 4. Virtual Scrolling Integration

```typescript
// Enhanced virtual scrolling with dynamic heights
interface DynamicVirtualScrollState {
  itemHeights: Map<string, number>;        // Measured heights for each category
  estimatedItemHeight: number;             // Base height estimate for collapsed items
  expandedItemHeight: number;              // Average height estimate for expanded items
  visibleRange: {
    start: number;
    end: number;
    startOffset: number;                   // Pixel offset to visible start
    endOffset: number;                     // Pixel offset to visible end
  };
  totalHeight: number;                     // Total scrollable height
  needsRemeasurement: boolean;             // Whether heights need recalculation
}

// Height measurement result
interface HeightMeasurement {
  categoryPath: string;                    // Unique identifier
  height: number;                          // Measured height in pixels
  timestamp: number;                       // When measurement was taken
  isExpanded: boolean;                     // Whether measured in expanded state
}
```

## State Transitions

### Expansion State Flow

```
Initial State (All Collapsed)
    ↓ User clicks expand button
Expanding
    ↓ Measure new height
Expanded (showing subcategories)
    ↓ User clicks collapse button OR searches (auto-collapse)
Collapsing
    ↓ Measure collapsed height
Collapsed
```

### Search Integration Flow

```
Normal State
    ↓ User types search query
Search Processing
    ├─ Match found in category name
    │   ↓ Category remains at current expansion state
    │   Display with highlighting
    └─ Match found in subcategory name
        ↓ Auto-expand parent category
        Expanded with child highlighting
    ↓ User clears search
Auto-collapse search-expanded categories
    ↓ Return to manual expansion state
Normal State
```

## Data Validation Rules

### 1. Expansion State Validation

```typescript
// Validation rules for expansion state
const ExpansionStateValidation = {
  categoryPath: {
    required: true,
    pattern: /^[^>]+(?:\s>\s[^>]+)*$/,    // Breadcrumb format validation
    maxLength: 500                        // Prevent extremely long paths
  },
  maxDepth: {
    min: 1,
    max: 6,                               // Match existing category tree depth
    default: 6
  },
  maxChildren: {
    min: 1,
    max: 100,                             // Prevent performance issues
    default: 10
  }
};
```

### 2. Performance Constraints

```typescript
// Performance limits and thresholds
const PerformanceLimits = {
  maxExpandedCategories: 50,              // Limit simultaneous expansions
  maxAutoExpansions: 20,                  // Limit search auto-expansions
  heightMeasurementTimeout: 100,          // Max time for height measurement (ms)
  expansionAnimationDuration: 200,        // CSS transition duration (ms)
  virtualScrollBufferSize: 5,             // Extra items to render outside viewport
  heightCacheExpiry: 300000               // Height cache TTL (5 minutes)
};
```

## Integration with Existing Models

### CategoryWithMetrics Enhancement

```typescript
// No changes to existing CategoryWithMetrics interface
// Expansion data is managed separately to avoid data model changes
// Children property already exists for subcategory access

interface CategoryRenderingInfo {
  category: CategoryWithMetrics;           // Original category data
  renderLevel: number;                     // Display depth (0 = root)
  isVisible: boolean;                      // Whether currently visible in tree
  parentExpanded: boolean;                 // Whether parent is expanded
  hasVisibleChildren: boolean;             // Whether any children are visible
  estimatedHeight: number;                 // Estimated render height
}
```

### CategoryIndexPage State Management

```typescript
// State management patterns for expansion
const useExpansionState = () => {
  const [expansionState, setExpansionState] = useState<CategoryExpansionState>({
    expandedCategories: new Set(),
    autoExpandedCategories: new Set(),
    expansionMode: 'manual',
    maxAutoDepth: 2
  });

  // Expansion operations
  const toggleExpansion = useCallback((categoryPath: string) => {
    setExpansionState(prev => {
      const newExpanded = new Set(prev.expandedCategories);
      if (newExpanded.has(categoryPath)) {
        newExpanded.delete(categoryPath);
      } else {
        newExpanded.add(categoryPath);
      }
      return { ...prev, expandedCategories: newExpanded };
    });
  }, []);

  return { expansionState, toggleExpansion };
};
```

## Error Handling

### Expansion Failures

```typescript
// Error types for expansion operations
type ExpansionError =
  | 'INVALID_CATEGORY_PATH'
  | 'MAX_EXPANSIONS_EXCEEDED'
  | 'PERFORMANCE_LIMIT_REACHED'
  | 'HEIGHT_MEASUREMENT_FAILED'
  | 'VIRTUAL_SCROLL_ERROR';

interface ExpansionErrorState {
  hasError: boolean;
  errorType?: ExpansionError;
  errorMessage?: string;
  failedCategoryPath?: string;
  timestamp: number;
}
```

### Recovery Strategies

1. **Invalid Category Path**: Log error, skip expansion
2. **Max Expansions Exceeded**: Show user notification, prevent new expansions
3. **Height Measurement Failed**: Use estimated height, retry on next render
4. **Virtual Scroll Error**: Fall back to non-virtual rendering

## Performance Considerations

### Memory Management

- **Expansion State**: Use `Set<string>` for O(1) lookup performance
- **Height Cache**: LRU cache with TTL to prevent memory leaks
- **Component Memoization**: Memoize subcategory components to prevent re-renders

### Rendering Optimization

- **Lazy Rendering**: Only render visible subcategories
- **Height Estimation**: Use averages for unmeasured items
- **Batch Updates**: Debounce expansion state updates
- **Virtual Scrolling**: Maintain performance with dynamic heights

## Accessibility Data

### ARIA Attributes

```typescript
// ARIA attributes for tree navigation
interface TreeAriaProps {
  role: 'tree' | 'treeitem' | 'group';
  'aria-expanded'?: boolean;               // For expandable items
  'aria-level'?: number;                   // Tree depth level
  'aria-setsize'?: number;                 // Number of items in group
  'aria-posinset'?: number;                // Position in group
  'aria-label'?: string;                   // Accessible name
  'aria-labelledby'?: string;              // Reference to labeling element
}
```

### Keyboard Navigation State

```typescript
// Keyboard navigation state tracking
interface KeyboardNavigationState {
  focusedPath: string | null;             // Currently focused category path
  navigationMode: 'tree' | 'search';      // Current navigation context
  lastKeyPressed: string | null;          // Last navigation key
  keyboardActive: boolean;                // Whether keyboard navigation is active
}
```

## Migration Strategy

### Backward Compatibility

- Existing CategoryCard props remain unchanged
- New expansion props are optional with sensible defaults
- No breaking changes to CategoryIndexState structure
- Expansion state is additive, not replacing existing state

### Gradual Enhancement

1. **Phase 1**: Add expansion state management without UI changes
2. **Phase 2**: Implement basic expand/collapse functionality
3. **Phase 3**: Add keyboard navigation and accessibility
4. **Phase 4**: Optimize virtual scrolling and performance

This data model provides a foundation for implementing expandable CategoryCard functionality while maintaining compatibility with existing code and following constitutional principles.
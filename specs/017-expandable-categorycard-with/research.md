# Research: Expandable CategoryCard Implementation

**Date**: 2025-09-20
**Feature**: Expandable CategoryCard with Subcategory Tree Display

## Research Questions & Findings

### 1. Virtual Scrolling with Dynamic Heights
**Question**: How to maintain virtual scrolling performance when category cards expand with variable heights?

**Decision**: Use dynamic height calculation with ResizeObserver API
**Rationale**:
- Current virtual scrolling uses fixed item heights (180px)
- Expanded cards need variable heights based on subcategory count
- ResizeObserver provides efficient height change detection
- Maintain performance by calculating visible range based on measured heights

**Alternatives Considered**:
- Fixed height containers with internal scrolling - rejected (poor UX, nested scrolling issues)
- Disable virtual scrolling when expanded - rejected (performance degradation)
- Pre-calculate all heights - rejected (no knowledge of expansion state)

### 2. Expansion State Management
**Question**: Where to manage expansion state for 3,195+ categories efficiently?

**Decision**: Session-scoped Set<string> with category path as key
**Rationale**:
- Efficient lookup/insertion for expansion checks
- Path-based keys ensure uniqueness across hierarchy
- Session scope balances UX and memory usage
- Integrates with existing CategoryIndexState pattern

**Alternatives Considered**:
- localStorage persistence - rejected (unnecessary complexity, privacy concerns)
- Category ID based keys - rejected (path provides better debugging)
- Boolean flags per category - rejected (memory inefficient for large datasets)

### 3. Keyboard Navigation for Tree Structures
**Question**: How to implement ARIA-compliant keyboard navigation for expanded category trees?

**Decision**: ARIA tree roles with arrow key navigation pattern
**Rationale**:
- Standard accessibility pattern for hierarchical data
- Tab moves between tree widgets, arrows navigate within tree
- Focus management with programmatic focus() calls
- Screen reader compatibility with proper role attributes

**Pattern Implementation**:
- Container: `role="tree"` with `aria-label="Categories"`
- Parent items: `role="treeitem"` with `aria-expanded`
- Child items: `role="treeitem"` with `aria-level`
- Arrow keys: Up/Down for navigation, Right/Left for expand/collapse

**Alternatives Considered**:
- Tab-based navigation - rejected (too many tab stops)
- Custom focus management - rejected (accessibility issues)
- No keyboard support - rejected (violates WCAG guidelines)

### 4. Mobile Touch Interaction Patterns
**Question**: How to provide touch-friendly expansion controls without interfering with category selection?

**Decision**: Separate touch targets with 44px minimum size
**Rationale**:
- iOS/Android guidelines require 44px minimum touch targets
- Separate expand button prevents accidental expansion during selection
- Visual separation between expand and select actions
- Swipe gestures considered but rejected for complexity

**Implementation**:
- Expand button: 44px minimum with clear visual separation
- Category selection: Remaining card area for navigation
- Touch feedback: Visual press states for both actions

**Alternatives Considered**:
- Long press to expand - rejected (not discoverable)
- Double tap expansion - rejected (conflicts with zoom)
- Swipe gestures - rejected (complexity, accessibility issues)

### 5. Performance with Large Hierarchies
**Question**: How to render subcategory trees efficiently for categories with many children?

**Decision**: Lazy loading with depth limits and pagination
**Rationale**:
- Some categories have 50+ direct children
- Render first 10 subcategories, "Show more" for rest
- Limit initial expansion depth to 2 levels
- Reduce DOM nodes and improve scrolling performance

**Implementation Strategy**:
- Initial render: First 10 subcategories
- Pagination: "Show 10 more" button
- Depth limit: Expand 2 levels maximum initially
- Virtual scrolling maintenance with dynamic calculations

**Alternatives Considered**:
- Render all subcategories - rejected (DOM performance issues)
- Fixed pagination size - rejected (varying category sizes)
- No depth limits - rejected (overwhelming UI)

### 6. Search Integration with Tree Expansion
**Question**: How to handle search highlighting and auto-expansion for matching subcategories?

**Decision**: Path-based matching with ancestor expansion
**Rationale**:
- Search should match both parent and child categories
- Auto-expand parents when children match search terms
- Highlight matching terms in both levels
- Maintain expansion state during search operations

**Implementation**:
- Search matches trigger expansion of parent categories
- Highlight matching text in both parent and child names
- Preserve manual expansion state during search
- Clear auto-expansions when search is cleared

**Alternatives Considered**:
- Flatten results during search - rejected (loses hierarchy context)
- No auto-expansion - rejected (poor discoverability)
- Expand all during search - rejected (performance impact)

## Technology Decisions

### React Patterns
- **Component Structure**: Enhance existing CategoryCard with expansion capability
- **State Management**: Built-in React hooks (useState, useCallback, useMemo)
- **Event Handling**: Debounced expansion state updates
- **Performance**: Memoization with React.memo for subcategory components

### TailwindCSS Integration
- **Animations**: CSS transitions for expansion with `transition-all duration-200`
- **Responsive Design**: Mobile-first with touch-friendly targets
- **Tree Visualization**: Indentation with `ml-4` for hierarchy levels
- **Interactive States**: Hover, focus, and active states for accessibility

### Accessibility Implementation
- **ARIA Roles**: `tree`, `treeitem`, `group` for proper structure
- **Keyboard Support**: Arrow keys, Enter, Space, Escape handling
- **Screen Reader**: Live regions for expansion state announcements
- **Focus Management**: Programmatic focus movement through tree

## Integration Points

### Existing CategoryIndexPage
- **State Enhancement**: Add expansion tracking to CategoryIndexState
- **Virtual Scrolling**: Modify height calculations for dynamic content
- **Search Integration**: Update Dutch search to handle subcategory matching
- **Filter Preservation**: Maintain expansion state during filter operations

### CategoryCard Component
- **Props Extension**: Add expansion-related props without breaking changes
- **Composition**: Use early returns for collapsed/expanded states
- **Event Handling**: Separate expand and select click handlers
- **Styling**: Maintain existing visual design with expansion indicators

### Performance Monitoring
- **Metrics**: Track expansion operations, rendering time, memory usage
- **Thresholds**: Maintain <100ms expansion response time
- **Memory**: Monitor expansion state memory footprint
- **Virtual Scrolling**: Ensure smooth scrolling with expanded items

## Risk Mitigation

### Performance Risks
- **Large Hierarchies**: Pagination and depth limits
- **Memory Usage**: Session-scoped state with cleanup
- **Scroll Performance**: Efficient height calculations with caching

### Accessibility Risks
- **Keyboard Navigation**: Comprehensive testing with screen readers
- **Focus Management**: Proper focus trapping and restoration
- **Mobile Access**: Touch target validation on devices

### UX Risks
- **Complexity**: Progressive disclosure with clear visual hierarchy
- **Discoverability**: Visual cues for expandable categories
- **State Confusion**: Clear indicators for expansion status

## Next Steps

1. **Phase 1**: Design data models for expansion state and enhanced CategoryCard props
2. **Contract Definition**: API contracts for expansion/collapse operations
3. **Test Strategy**: TDD approach with failing tests for expansion behaviors
4. **Implementation Planning**: Task breakdown for component enhancement

## References

- [ARIA Tree View Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)
- [React Virtual Scrolling Best Practices](https://web.dev/virtualize-long-lists-react-window/)
- [Mobile Touch Target Guidelines](https://developer.apple.com/design/human-interface-guidelines/layout/)
- [Performance Monitoring in React](https://react.dev/reference/react/Profiler)
# Quickstart: Expandable CategoryCard Feature

**Date**: 2025-09-20
**Feature**: Expandable CategoryCard with Subcategory Tree Display
**Estimated Time**: 20 minutes

## Overview

This quickstart guide validates the expandable CategoryCard functionality by walking through the complete user journey from viewing categories to expanding subcategories and navigating to specific products while preserving search and filter state.

## Prerequisites

- Development server running (`npm run dev`)
- Category index page accessible at `/category-index`
- Sample category data loaded from `category-tree.json`
- Ali metrics computed for categories

## Test Scenario Walkthrough

### 1. Initial Category Index View

**Goal**: Verify basic category display with expansion indicators

**Steps**:
1. Navigate to the category index page
2. Observe category cards in grid layout
3. Verify each card shows:
   - Category name and product count
   - Ali metrics (halal compliance, protein density, price efficiency)
   - Expansion indicator for categories with subcategories
   - "N subcategories" count where applicable

**Expected Results**:
- Categories display in responsive grid (1-4 columns based on screen size)
- Cards show clear visual hierarchy with consistent spacing
- Expansion buttons are visible and accessible (44px minimum touch target)
- Ali metrics badges use appropriate colors (green/yellow/red for halal compliance)

**Validation Commands**:
```bash
# Verify category data is loaded
curl http://localhost:5175/category-tree.json | jq '.categoryTree | length'

# Check console for any loading errors
# Open DevTools → Console → Look for CategoryIndexPage logs
```

### 2. Category Expansion

**Goal**: Test expanding a category to show subcategories

**Steps**:
1. Find a category with subcategories (e.g., "Drogisterij")
2. Click the expand button (▶ icon)
3. Observe smooth expansion animation
4. Verify subcategories appear with proper indentation
5. Check that Ali metrics are shown for subcategories
6. Verify expansion state indicator changes (▶ becomes ▼)

**Expected Results**:
- Card expands smoothly with CSS transition (200ms duration)
- Subcategories render with proper tree indentation
- Each subcategory shows Ali metrics if available
- Expansion button changes visual state
- Virtual scrolling maintains smooth performance

**Validation Steps**:
```javascript
// Browser DevTools Console - Check expansion state
const expandedCards = document.querySelectorAll('[data-expanded="true"]');
console.log(`Expanded categories: ${expandedCards.length}`);

// Verify ARIA attributes
const treeItems = document.querySelectorAll('[role="treeitem"]');
console.log(`Tree items found: ${treeItems.length}`);
```

### 3. Subcategory Navigation

**Goal**: Test selecting a subcategory and preserving state

**Steps**:
1. With a category expanded, click on a subcategory
2. Verify navigation to the subcategory's product list
3. Check URL parameters preserve current search/filter state
4. Return to category index using browser back button
5. Verify expansion state is maintained

**Expected Results**:
- Navigation occurs to subcategory product page
- URL includes current filters and search terms
- Expansion state persists across navigation
- No performance degradation during navigation

**Validation**:
```javascript
// Check URL parameter preservation
const urlParams = new URLSearchParams(window.location.search);
console.log('Preserved parameters:', Object.fromEntries(urlParams));

// Verify expansion state persistence
const expansionState = JSON.parse(sessionStorage.getItem('categoryExpansionState') || '{}');
console.log('Expansion state:', expansionState);
```

### 4. Search Integration

**Goal**: Test search-driven expansion of matching categories

**Steps**:
1. Enter search term that matches subcategories (e.g., "deodorant")
2. Observe automatic expansion of parent categories
3. Verify search highlighting in both parent and child names
4. Clear search and check auto-expanded categories collapse
5. Verify manually expanded categories remain expanded

**Expected Results**:
- Parent categories auto-expand when children match search
- Search terms highlighted in yellow/amber
- Auto-expansions clear when search is cleared
- Manual expansions persist through search operations

**Validation**:
```javascript
// Check search highlighting
const highlighted = document.querySelectorAll('mark, .search-highlight');
console.log(`Highlighted terms: ${highlighted.length}`);

// Verify expansion tracking
const autoExpanded = document.querySelectorAll('[data-auto-expanded="true"]');
console.log(`Auto-expanded categories: ${autoExpanded.length}`);
```

### 5. Keyboard Navigation

**Goal**: Test ARIA tree navigation with keyboard

**Steps**:
1. Focus on category index page
2. Tab to first category card
3. Use arrow keys to navigate between categories
4. Press Right arrow on expandable category
5. Use Down arrow to navigate through subcategories
6. Press Enter to select a subcategory

**Expected Results**:
- Tab navigation moves between category cards
- Arrow keys navigate within expanded trees
- Focus is clearly visible with outline/highlight
- Screen reader announces expansion state changes
- Enter key activates selection

**Validation**:
```javascript
// Check ARIA compliance
const ariaElements = document.querySelectorAll('[role="tree"], [role="treeitem"]');
console.log(`ARIA tree elements: ${ariaElements.length}`);

// Verify focus management
document.addEventListener('focusin', (e) => {
  console.log('Focus moved to:', e.target.getAttribute('aria-label'));
});
```

### 6. Mobile Responsiveness

**Goal**: Test touch interaction and responsive design

**Steps**:
1. Resize browser to mobile viewport (375px width)
2. Verify cards stack in single column
3. Test touch expansion on category cards
4. Verify touch targets meet 44px minimum requirement
5. Test scrolling performance with expanded categories

**Expected Results**:
- Layout adapts to mobile viewport
- Touch targets are adequately sized
- Expansion works smoothly on touch devices
- Virtual scrolling maintains performance
- No horizontal scrolling required

**Validation**:
```javascript
// Check responsive layout
const cardWidth = document.querySelector('.category-card').offsetWidth;
const touchTargets = document.querySelectorAll('.expand-button');
const minTouchTarget = Math.min(...Array.from(touchTargets).map(t => t.offsetHeight));
console.log(`Card width: ${cardWidth}px, Min touch target: ${minTouchTarget}px`);
```

### 7. Performance Validation

**Goal**: Ensure performance meets constitutional requirements

**Steps**:
1. Load category index with 3,195+ categories
2. Expand 10+ categories simultaneously
3. Perform search operations
4. Monitor memory usage and frame rate
5. Test virtual scrolling with large datasets

**Expected Results**:
- Page loads in <2 seconds on 3G connection
- Search responses in <100ms
- Smooth 60fps scrolling maintained
- Memory usage remains reasonable (<50MB)
- No memory leaks during expansion operations

**Validation**:
```javascript
// Performance monitoring
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration}ms`);
  }
});
observer.observe({ entryTypes: ['measure', 'navigation'] });

// Memory usage
console.log('Memory usage:', performance.memory);
```

### 8. Bulk Operations

**Goal**: Test expand/collapse all functionality

**Steps**:
1. Use "Expand All" button to expand multiple categories
2. Verify performance remains smooth during bulk operation
3. Use "Collapse All" to collapse all categories
4. Test selective expansion after bulk collapse

**Expected Results**:
- Bulk operations complete within 500ms
- Performance remains stable during bulk operations
- UI remains responsive throughout operation
- Individual expansion still works after bulk operations

**Validation**:
```javascript
// Monitor bulk operation performance
const startTime = performance.now();
// Trigger bulk expand
document.querySelector('.expand-all-btn').click();
setTimeout(() => {
  const endTime = performance.now();
  console.log(`Bulk operation took: ${endTime - startTime}ms`);
}, 100);
```

## Success Criteria

### Functional Requirements ✓
- [x] **FR-001**: Categories expand to show hierarchical subcategories (up to 6 levels)
- [x] **FR-002**: Ali metrics display for both parent and subcategories
- [x] **FR-003**: Navigation preserves search query and active filters
- [x] **FR-004**: Expansion state maintained during search/filter operations
- [x] **FR-005**: Visual indicators show expandable categories and current state
- [x] **FR-006**: Keyboard navigation with ARIA tree roles
- [x] **FR-007**: Virtual scrolling optimized for expanded categories
- [x] **FR-008**: Touch-friendly interaction targets (≥44px)
- [x] **FR-009**: Subcategory count indicators on parent categories
- [x] **FR-010**: Bulk expand/collapse operations available

### Performance Requirements ✓
- [x] Page load time <2 seconds on 3G
- [x] Search response time <100ms
- [x] Expansion animation 200ms
- [x] Virtual scrolling maintains 60fps
- [x] Memory usage <50MB for typical usage

### Accessibility Requirements ✓
- [x] ARIA tree navigation implemented
- [x] Keyboard navigation fully functional
- [x] Screen reader compatibility
- [x] Touch targets meet minimum 44px requirement
- [x] Focus management works correctly

## Troubleshooting

### Common Issues

**Expansion buttons not responding**:
- Check console for JavaScript errors
- Verify event handlers are properly attached
- Ensure touch targets have adequate size

**Performance degradation with many expansions**:
- Check if virtual scrolling is enabled
- Monitor memory usage in DevTools
- Verify height measurements are cached

**Search highlighting not working**:
- Verify search integration is properly implemented
- Check if Dutch language support is active
- Ensure highlighting elements have proper CSS

**Keyboard navigation broken**:
- Verify ARIA attributes are present
- Check focus management implementation
- Test with screen reader software

### Debug Commands

```bash
# Check category data structure
curl http://localhost:5175/category-tree.json | jq '.categoryTree[0]'

# Monitor network requests
# DevTools → Network → Filter by Fetch/XHR

# Check React component tree
# React DevTools → Components → CategoryIndexPage

# Performance profiling
# DevTools → Performance → Record session during expansion
```

## Next Steps

After successful quickstart validation:

1. **Run Full Test Suite**: Execute all contract tests and integration tests
2. **Performance Testing**: Run performance benchmarks on various devices
3. **Accessibility Audit**: Complete WCAG compliance testing
4. **Cross-browser Testing**: Validate on major browsers and versions
5. **User Acceptance Testing**: Gather feedback from target users

## Support

If issues arise during quickstart:
- Check existing category index implementation
- Review contract specifications in `/contracts/`
- Consult research findings in `research.md`
- Validate data model assumptions in `data-model.md`

**Estimated completion time**: 20 minutes for full quickstart validation
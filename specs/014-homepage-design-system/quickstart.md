# Quickstart: Homepage Design System Components

**Feature**: 014-homepage-design-system
**Date**: 2025-09-20
**Purpose**: Validate homepage components with Ali's 6 filter categories and 11k+ product browsing

## Prerequisites

- Node.js 18+ installed
- Repository cloned and dependencies installed (`npm install`)
- Existing design system components available (`src/components/ui/`)
- Pre-generated filter data files in `public/` directory

## Quick Test Scenarios

### 1. Filter Navigation Test (2 minutes)
```bash
# Start development server
npm run dev

# Open browser to localhost:3000
# Verify homepage shows 6 filter category cards:
# - Daily Protein (default, active state)
# - Post-Workout
# - Cutting
# - Budget
# - Training Day
# - Rest Day

# Tap each filter card
# Verify active state styling changes
# Verify coverage statistics display (e.g., "11,379 products")
```

**Expected Results**:
- ✅ All 6 filter cards render with proper styling
- ✅ Daily Protein card shows active state by default
- ✅ Tapping cards updates active state immediately
- ✅ Coverage statistics display correctly

### 2. Product List Performance Test (3 minutes)
```bash
# On homepage with Daily Protein filter active
# Verify product list renders without delay
# Scroll through product list rapidly
# Monitor browser performance tab for memory usage

# Test virtual scrolling:
# - Scroll to middle of 11k+ products
# - Verify smooth scrolling performance
# - Check DOM only renders ~20-30 visible items
# - Verify scroll position maintains when switching filters
```

**Expected Results**:
- ✅ Initial product list loads in <2 seconds
- ✅ Scrolling maintains 60fps on mobile device
- ✅ Memory usage stays constant (virtual scrolling working)
- ✅ DOM contains only visible items + buffer

### 3. Search and Sort Test (2 minutes)
```bash
# In search input, type "chicken"
# Verify instant filtering without page reload
# Verify results update as you type (debounced)

# Test sorting:
# - Sort by Protein Content (descending)
# - Sort by Price (ascending)
# - Sort by Health Grade (A-E)
# - Verify results reorder correctly
```

**Expected Results**:
- ✅ Search filters products instantly
- ✅ Search results highlight matching text
- ✅ Sort options work correctly with proper ordering
- ✅ Combined search + sort functions properly

### 4. Mobile Responsiveness Test (2 minutes)
```bash
# Open browser dev tools
# Switch to mobile viewport (iPhone/Android)
# Test touch interactions:
# - Tap filter cards
# - Scroll product list
# - Use search input
# - Tap sort dropdown

# Verify responsive layout:
# - Filter cards scroll horizontally on mobile
# - Product cards stack properly
# - Touch targets are minimum 44px
```

**Expected Results**:
- ✅ All interactions work with touch
- ✅ Layout adapts to mobile screen sizes
- ✅ Filter navigation scrolls horizontally
- ✅ Product cards remain readable on small screens

### 5. Error Handling Test (1 minute)
```bash
# Simulate network error (disable network in dev tools)
# Refresh page
# Verify error states display gracefully
# Re-enable network
# Verify recovery functionality
```

**Expected Results**:
- ✅ Loading states display during data fetching
- ✅ Error messages are user-friendly
- ✅ Retry functionality works when network restored
- ✅ Fallback content prevents blank page

## Performance Validation

### Bundle Size Check
```bash
npm run build
# Verify dist/ output is <1MB gzipped
du -sh dist/
```

**Target**: <1MB total bundle size

### Load Time Check
```bash
# Open browser dev tools Network tab
# Refresh homepage
# Verify initial page load <2s on 3G connection
# Check Core Web Vitals:
# - LCP (Largest Contentful Paint) <2.5s
# - FID (First Input Delay) <100ms
# - CLS (Cumulative Layout Shift) <0.1
```

**Target**: <2s load time on 3G, good Core Web Vitals

### Memory Usage Check
```bash
# Open browser dev tools Memory tab
# Take heap snapshot on homepage load
# Switch between all 6 filters
# Take another heap snapshot
# Verify memory usage stays constant (no leaks)
```

**Target**: Constant memory usage regardless of filter switches

## Integration Validation

### Component Integration
```bash
# Verify all homepage components use existing design system
# Check FilterCard extends Card component
# Check ProductCard uses Badge + Button components
# Check SearchControls uses Input component
# Verify consistent styling and theming
```

### Data Integration
```bash
# Verify static JSONL files load correctly
# Check filtered-ali-daily-protein.jsonl loads
# Check products-index.json provides search capability
# Verify stats.json shows correct coverage numbers
```

## Accessibility Validation

### Keyboard Navigation
```bash
# Tab through all interactive elements
# Verify logical tab order
# Test Enter/Space key activation
# Test Escape key to close dropdowns
```

### Screen Reader Testing
```bash
# Enable screen reader (macOS VoiceOver / Windows NVDA)
# Navigate through filter cards
# Verify product information is announced clearly
# Check aria-labels and roles are appropriate
```

## Success Criteria

**Homepage loads and displays properly**:
- [x] 6 filter category cards render with statistics
- [x] Daily Protein filter active by default
- [x] Product list shows contextual products

**Performance meets requirements**:
- [x] <2s initial load time on 3G
- [x] <1MB gzipped bundle size
- [x] Smooth virtual scrolling for 11k+ products
- [x] Constant memory usage

**User interactions function correctly**:
- [x] Filter navigation switches product lists
- [x] Search filters products instantly
- [x] Sort options reorder products correctly
- [x] Mobile touch interactions work properly

**Error handling is robust**:
- [x] Loading states during data fetching
- [x] Error messages for failed requests
- [x] Graceful degradation with missing data
- [x] Recovery functionality when network restored

---

**Quickstart Status**: ✅ Ready for execution - All test scenarios defined with clear success criteria
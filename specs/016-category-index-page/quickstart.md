# Quickstart: Category Index Page

## User Story Validation

This quickstart validates the primary user story:
> As Ali, a CrossFit athlete following halal dietary requirements with a 170g daily protein target and €50/week budget, I want to browse food categories in an organized index format so that I can quickly discover products that meet my specific nutritional and compliance needs.

## Prerequisites

### Data Requirements
- [ ] `/public/category-tree.json` exists with 3,195+ categories
- [ ] Categories include pre-computed Ali metrics (halal compliance, protein density, price efficiency)
- [ ] Transform pipeline has generated category tree with product counts

### Development Environment
- [ ] Node.js 18+ installed
- [ ] Repository cloned and dependencies installed (`npm ci`)
- [ ] Development server can start (`npm run dev`)
- [ ] Tests can run (`npm test`)

## Step-by-Step Validation

### 1. Page Loading and Display (FR-001, FR-002)
```bash
# Start development server
npm run dev

# Navigate to category index page
# Expected: Page loads in <2s, shows grid layout with all categories
# Expected: Each category shows product count
```

**Validation Checklist:**
- [ ] Page loads without errors
- [ ] All categories display in grid/card layout
- [ ] Product counts visible on each category card
- [ ] Loading states handle gracefully
- [ ] Error states display appropriately

### 2. Ali Metrics Display (FR-005, FR-006, FR-007)
```typescript
// Check category card displays Ali metrics
const categoryCard = screen.getByRole('button', { name: /Zuivel, eieren, boter/ });

// Expected: Halal compliance percentage visible
expect(categoryCard).toHaveTextContent(/\d+% Halal/);

// Expected: Protein density displayed
expect(categoryCard).toHaveTextContent(/\d+g protein/);

// Expected: Price efficiency indicator
expect(categoryCard).toHaveTextContent(/€\d+\.\d+\/g/);
```

**Validation Checklist:**
- [ ] Halal compliance percentage displays correctly
- [ ] Protein density shows for relevant categories
- [ ] Price efficiency indicators are accurate
- [ ] Badge colors match thresholds (green >80%, yellow 50-80%, red <50%)

### 3. Search Functionality (FR-008)
```typescript
// Test Dutch language search
const searchInput = screen.getByPlaceholderText('Search categories...');

// Search for Dutch term
fireEvent.change(searchInput, { target: { value: 'zuivel' } });

// Expected: Categories filtered to match search
// Expected: Search results update within 100ms (after debounce)
```

**Validation Checklist:**
- [ ] Search input accepts Dutch characters (ë, ï, ô, etc.)
- [ ] Search results update after 300ms debounce
- [ ] Both category names and breadcrumbs are searchable
- [ ] Empty search shows all categories
- [ ] Clear search button works

### 4. Ali-Specific Filtering (FR-009)
```typescript
// Test halal compliance filter
const halalFilter = screen.getByLabelText('Minimum Halal Compliance');
fireEvent.change(halalFilter, { target: { value: '80' } });

// Expected: Only categories with >80% halal products show
```

**Validation Checklist:**
- [ ] Halal compliance filter works correctly
- [ ] Protein density filter shows high-protein categories
- [ ] Price efficiency filter identifies good value categories
- [ ] Multiple filters combine with AND logic
- [ ] Filter reset button clears all filters

### 5. Sorting Options (FR-010)
```typescript
// Test sorting by product count
const sortButton = screen.getByRole('button', { name: 'By Products' });
fireEvent.click(sortButton);

// Expected: Categories reorder by product count (descending)
```

**Validation Checklist:**
- [ ] Sort by product count (most to least)
- [ ] Sort by name (alphabetical A-Z)
- [ ] Sort by protein density (highest first)
- [ ] Sort by halal compliance (highest first)
- [ ] Sort by price efficiency (best value first)

### 6. Category Navigation (FR-003, FR-011)
```typescript
// Test category click navigation
const categoryCard = screen.getByRole('button', { name: /Zuivel, eieren, boter/ });
fireEvent.click(categoryCard);

// Expected: Navigation to product list page with category filter
// Expected: URL includes category path parameter
```

**Validation Checklist:**
- [ ] Category click triggers navigation
- [ ] URL includes category path for bookmarking
- [ ] Ali filter preferences preserved in navigation
- [ ] Placeholder link shown for future product list page

### 7. Responsive Design (FR-012)
```bash
# Test mobile viewport
# Resize browser to 375px width
```

**Validation Checklist:**
- [ ] Grid adjusts to single column on mobile
- [ ] Touch targets are minimum 44px
- [ ] Search and filter controls remain accessible
- [ ] Category cards remain readable and interactive
- [ ] Horizontal scrolling is avoided

### 8. Performance Validation
```bash
# Test with large dataset
# Navigate to category index with 3,195+ categories
```

**Validation Checklist:**
- [ ] Page loads in <2 seconds on 3G connection
- [ ] Search response in <100ms (after debounce)
- [ ] Virtual scrolling enabled for large lists
- [ ] Memory usage remains stable during interaction

### 9. Error Handling
```typescript
// Test error states
// Simulate network failure or invalid data
```

**Validation Checklist:**
- [ ] Loading errors show retry option
- [ ] Invalid search queries handled gracefully
- [ ] Missing category data shows fallback
- [ ] Navigation errors redirect to safe state

### 10. Accessibility Validation
```bash
# Test keyboard navigation
# Use Tab, Enter, Arrow keys to navigate
```

**Validation Checklist:**
- [ ] All interactive elements keyboard accessible
- [ ] Screen reader announces category information
- [ ] Color contrast meets WCAG 2.1 AA standards
- [ ] Focus indicators visible and appropriate

## Acceptance Criteria Verification

### Primary Acceptance Scenarios
1. **Given** I'm on the category index page, **When** I view the page, **Then** I see all 3,195 categories displayed in a clear grid/card layout with product counts and Ali-specific metrics
   - [ ] ✅ PASS / ❌ FAIL

2. **Given** I see a category that interests me, **When** I click on it, **Then** I navigate to a product list page filtered by that category with my Ali preferences preserved
   - [ ] ✅ PASS / ❌ FAIL

3. **Given** I'm looking for protein-rich foods, **When** I search for "protein" or filter by high-protein categories, **Then** I see categories with average protein content >15g/100g highlighted
   - [ ] ✅ PASS / ❌ FAIL

4. **Given** I need halal-compliant options, **When** I view category cards, **Then** I see halal compliance percentages for each category to guide my selection
   - [ ] ✅ PASS / ❌ FAIL

5. **Given** I'm budget-conscious, **When** I browse categories, **Then** I see price efficiency indicators showing protein-per-euro value for each category
   - [ ] ✅ PASS / ❌ FAIL

### Edge Cases Verification
- [ ] Categories with zero halal products still display (no filtering out)
- [ ] Categories with few products (<5) show metrics normally
- [ ] Empty search results show "No categories found" with clear search option

## Success Metrics

### Performance Metrics
- [ ] Page load time: <2 seconds on 3G
- [ ] Search response time: <100ms (post-debounce)
- [ ] Bundle size: <1MB gzipped
- [ ] Memory usage: Stable during extended use

### User Experience Metrics
- [ ] All functional requirements met
- [ ] Responsive design works across devices
- [ ] Accessibility compliance verified
- [ ] Error states handle gracefully

### Ali-Specific Metrics
- [ ] Halal compliance percentages accurate
- [ ] Protein density calculations correct
- [ ] Price efficiency scores meaningful
- [ ] Context recommendations relevant

## Troubleshooting

### Common Issues
1. **Categories not loading**: Check `/public/category-tree.json` exists and is valid
2. **Ali metrics missing**: Verify transform pipeline has generated extended data
3. **Search not working**: Check debounce implementation and Dutch character support
4. **Performance issues**: Verify virtual scrolling enabled for large lists
5. **Navigation failing**: Check routing configuration and URL generation

### Debug Commands
```bash
# Check category data structure
curl http://localhost:5173/category-tree.json | jq '.categoryTree[0]'

# Run specific component tests
npm test -- CategoryIndexPage

# Check bundle size
npm run build && ls -la dist/

# Performance profiling
npm run dev && open http://localhost:5173 (use browser dev tools)
```

## Completion Criteria

This quickstart is complete when:
- [ ] All validation checklists pass
- [ ] All acceptance scenarios verified
- [ ] Performance metrics met
- [ ] Error handling validated
- [ ] Accessibility compliance confirmed

The category index page is ready for production deployment when all items above are checked off.
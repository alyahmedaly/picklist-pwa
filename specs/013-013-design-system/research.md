# Research: Design System Technical Decisions

**Feature**: Design System for Ali's Product Visualization
**Date**: 2025-09-20
**Status**: Phase 0 Complete

## Research Areas

### 1. shadcn/ui Component Architecture

**Decision**: Use shadcn/ui copy-paste model with Ali-specific customizations
**Rationale**:
- Constitutional compliance: Copy-paste maintains zero runtime dependencies
- Customizable base components built on Radix primitives ensure accessibility
- TailwindCSS foundation aligns with existing stack
- Tree-shakeable by design for minimal bundle impact

**Alternatives Considered**:
- Full UI library (Material-UI, Ant Design): Rejected due to bundle size and dependency weight
- Pure custom components: Rejected due to accessibility complexity
- Headless UI: Rejected due to additional styling overhead

**Implementation Pattern**:
```typescript
// shadcn/ui base with Ali customizations
import { Button as BaseButton } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const ProteinButton = ({ proteinValue, ...props }) => (
  <BaseButton variant="nutrition" {...props}>
    {proteinValue}g protein
  </BaseButton>
)
```

### 2. TailwindCSS Design Tokens for Nutrition Data

**Decision**: Custom design token system with nutrition-focused semantic colors
**Rationale**:
- Semantic color naming improves maintainability (protein-high vs green-500)
- Consistent spacing scale for nutrition data density
- Mobile-first breakpoints for Ali's primary usage patterns

**Alternatives Considered**:
- Default Tailwind palette: Rejected due to lack of nutrition context
- CSS custom properties only: Rejected due to TypeScript integration benefits
- Design token tools (Style Dictionary): Rejected due to complexity overhead

**Implementation Pattern**:
```typescript
// Design tokens for nutrition context
export const nutritionColors = {
  protein: {
    low: '#fef3c7',     // <10g per 100g
    moderate: '#fbbf24', // 10-20g per 100g
    high: '#16a34a',    // >20g per 100g
  },
  halal: {
    confirmed: '#16a34a',
    questionable: '#f59e0b',
    prohibited: '#dc2626',
  },
  health: {
    A: '#16a34a', B: '#65a30d', C: '#f59e0b', D: '#ea580c', E: '#dc2626'
  }
};
```

### 3. Accessibility Patterns for Health Information

**Decision**: Multi-modal accessibility with color + text + icons
**Rationale**:
- Color-blind users need non-color indicators for health scores
- Screen readers need meaningful ARIA labels for nutrition data
- High contrast ratios required for mobile usage in bright light

**Alternatives Considered**:
- Color-only indicators: Rejected due to accessibility failures
- Text-only indicators: Rejected due to scanning efficiency loss
- Icon-only indicators: Rejected due to semantic clarity issues

**Implementation Pattern**:
```typescript
// Multi-modal health grade component
<HealthGrade
  grade="A"
  aria-label="Health grade A - Excellent nutritional value"
  className="text-health-A bg-health-A/10"
>
  <CheckIcon className="w-4 h-4" />
  <span className="sr-only">Excellent</span>
  A
</HealthGrade>
```

### 4. Component Testing Strategy

**Decision**: Vitest + Testing Library + Storybook for comprehensive testing
**Rationale**:
- Vitest aligns with existing project testing framework
- Testing Library ensures accessibility-focused testing
- Storybook provides visual regression testing for design consistency

**Alternatives Considered**:
- Jest + Enzyme: Rejected due to Vitest constitutional preference
- Cypress component testing: Rejected due to setup complexity
- Chromatic: Rejected due to external service dependency

**Implementation Pattern**:
```typescript
// Component test with accessibility focus
test('ProteinMeter announces current progress', () => {
  render(<ProteinMeter current={85} target={170} />);

  expect(screen.getByRole('progressbar')).toHaveAttribute(
    'aria-valuenow', '85'
  );
  expect(screen.getByText('50% of daily target')).toBeInTheDocument();
});
```

## Component Architecture Decisions

### Base Component Strategy
- **Button**: 4 variants (primary, secondary, nutrition, halal)
- **Card**: Nutrition-optimized with header/content/footer patterns
- **Badge**: Health grades (A-E) and status indicators (halal/questionable)
- **Input**: Search and filter inputs with nutrition-focused styling

### Ali-Specific Components
- **ProteinMeter**: Circular progress toward 170g daily target
- **NutritionCard**: Standardized nutrition facts display
- **HealthGrade**: A-E scoring with accessibility indicators
- **HalalBadge**: Status with cultural sensitivity

### Layout System
- **Container**: Mobile-first max-widths (sm: 640px, lg: 1024px)
- **Stack**: Vertical spacing with nutrition data density optimization
- **Grid**: Responsive product grids (1 col mobile → 3 col desktop)

## Performance Validation

**Bundle Impact**: Tree-shakeable components, estimated <50KB gzipped
**Rendering Performance**: Memoized components for large product lists
**Accessibility Score**: Target WCAG 2.1 AA compliance
**Mobile Performance**: Touch targets ≥44px, fast tap response

## Constitutional Compliance Check

✅ **Data-First Architecture**: Components standardize nutrition data presentation
✅ **Minimal Dependencies**: shadcn/ui copy-paste model maintains zero runtime deps
✅ **Static Generation First**: All components support SSG compilation
✅ **Performance & Determinism**: Consistent rendering with measurable targets
✅ **Test-Driven Development**: Component testing strategy established

## Next Steps

Phase 1 ready to proceed with:
1. Component data model extraction from research decisions
2. TypeScript interface contracts for all components
3. Test scenario implementation from user stories
4. CLAUDE.md context updates for design system development

**Research Complete**: All technical unknowns resolved with constitutional compliance maintained.
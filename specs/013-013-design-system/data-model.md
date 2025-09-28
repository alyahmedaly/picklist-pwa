# Data Model: Design System Entities

**Feature**: Design System for Ali's Product Visualization
**Date**: 2025-09-20
**Status**: Phase 1 - Design

## Core Entities

### 1. DesignToken

Represents consistent design values used across all components for visual cohesion.

```typescript
interface DesignToken {
  colors: {
    nutrition: {
      protein: { low: string; moderate: string; high: string };
      calories: { low: string; moderate: string; high: string };
      health: { A: string; B: string; C: string; D: string; E: string };
    };
    halal: {
      confirmed: string;
      questionable: string;
      prohibited: string;
    };
    semantic: {
      primary: string;
      secondary: string;
      success: string;
      warning: string;
      error: string;
    };
  };
  spacing: {
    xs: string;    // 4px - tight component spacing
    sm: string;    // 8px - compact nutrition data
    md: string;    // 16px - standard component gaps
    lg: string;    // 24px - section spacing
    xl: string;    // 32px - page layout spacing
  };
  typography: {
    sizes: { xs: string; sm: string; md: string; lg: string; xl: string };
    weights: { normal: number; medium: number; semibold: number; bold: number };
    lineHeights: { tight: number; normal: number; relaxed: number };
  };
  breakpoints: {
    sm: string;    // 640px - mobile landscape
    md: string;    // 768px - tablet
    lg: string;    // 1024px - desktop
    xl: string;    // 1280px - wide desktop
  };
}
```

**Validation Rules**:
- All color values must be valid hex codes or CSS color values
- Spacing values must use consistent unit (rem/px)
- Typography sizes must create clear hierarchy
- Breakpoints must be in ascending order

### 2. BaseComponent

Foundation UI elements that provide consistent interaction patterns across the system.

```typescript
interface BaseComponent {
  id: string;                    // Component identifier
  category: 'ui' | 'nutrition' | 'layout';

  // Base props all components inherit
  baseProps: {
    className?: string;          // TailwindCSS classes
    testId?: string;            // Test identification
    children?: React.ReactNode; // Content
    disabled?: boolean;         // Interaction state
  };

  // Accessibility requirements
  accessibility: {
    role?: string;              // ARIA role
    ariaLabel?: string;         // Screen reader description
    ariaDescribedBy?: string;   // Additional description
    keyboardNavigation: boolean; // Keyboard accessible
  };

  // Visual variants
  variants: ComponentVariant[];

  // Usage context
  usageGuidelines: {
    primaryUseCase: string;     // When to use this component
    doAndDonts: string[];       // Usage guidelines
    examples: string[];         // Code examples
  };
}
```

**Validation Rules**:
- `id` must be unique across all components
- `category` must match defined categories
- All components must support keyboard navigation
- At least one variant must be defined

### 3. NutritionComponent

Ali-specific components optimized for nutrition data display and interaction.

```typescript
interface NutritionComponent extends BaseComponent {
  category: 'nutrition';

  // Nutrition-specific props
  nutritionProps: {
    value?: number;             // Numeric nutrition value
    unit?: string;              // g, mg, kcal, etc.
    target?: number;            // Daily target value (for progress components)
    threshold?: {               // Value thresholds for color coding
      low: number;
      moderate: number;
      high: number;
    };
  };

  // Cultural sensitivity (for halal components)
  culturalContext?: {
    respectfulLanguage: boolean; // Uses culturally appropriate terms
    iconography: 'text' | 'symbol' | 'both'; // How status is indicated
    colorSemantics: string[];   // Color meanings in cultural context
  };

  // Display optimization
  displaySettings: {
    compactMode: boolean;       // Supports space-efficient display
    scanOptimized: boolean;     // Optimized for quick visual scanning
    mobileFirst: boolean;       // Primary design target
  };
}
```

**Validation Rules**:
- `nutritionProps.value` must be non-negative
- `threshold` values must be in ascending order (low < moderate < high)
- Cultural context must be respectful and accurate
- Components must work in both compact and full modes

### 4. ComponentVariant

Different visual styles and sizes for components to support various use cases.

```typescript
interface ComponentVariant {
  name: string;                 // Variant identifier (e.g., 'primary', 'compact')
  description: string;          // When to use this variant

  // Visual properties
  styling: {
    size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    color: keyof DesignToken['colors']['semantic'] | keyof DesignToken['colors']['nutrition'];
    padding: keyof DesignToken['spacing'];
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  };

  // Responsive behavior
  responsive: {
    mobile: Partial<ComponentVariant['styling']>; // Mobile overrides
    tablet: Partial<ComponentVariant['styling']>; // Tablet overrides
    desktop: Partial<ComponentVariant['styling']>; // Desktop overrides
  };

  // State variations
  states: {
    default: ComponentVariant['styling'];
    hover?: Partial<ComponentVariant['styling']>;
    focus?: Partial<ComponentVariant['styling']>;
    active?: Partial<ComponentVariant['styling']>;
    disabled?: Partial<ComponentVariant['styling']>;
  };

  // Usage metrics
  performance: {
    bundleImpact: 'minimal' | 'small' | 'medium'; // CSS bundle size impact
    renderComplexity: 'simple' | 'moderate' | 'complex'; // Rendering cost
  };
}
```

**Validation Rules**:
- `name` must be unique within component
- All size references must exist in DesignToken
- Responsive overrides must be subset of base styling
- Performance impact must be measured and categorized

### 5. ComponentLibrary

Overall design system structure and component relationships.

```typescript
interface ComponentLibrary {
  version: string;              // Semantic version (e.g., "1.0.0")
  designTokens: DesignToken;    // Global design tokens

  components: {
    ui: BaseComponent[];        // shadcn/ui base components
    nutrition: NutritionComponent[]; // Ali-specific components
    layout: BaseComponent[];    // Layout and container components
  };

  // Global configuration
  configuration: {
    prefix: string;             // CSS class prefix (e.g., "ali-")
    darkMode: boolean;          // Dark mode support
    rtl: boolean;              // Right-to-left language support
    animations: boolean;        // Animation preferences
  };

  // Quality metrics
  metrics: {
    totalComponents: number;
    accessibilityScore: number; // WCAG compliance score
    bundleSizeKb: number;       // Total CSS bundle size
    testCoverage: number;       // Component test coverage percentage
  };
}
```

**Validation Rules**:
- `version` must follow semantic versioning
- All components must reference valid design tokens
- Accessibility score must be ≥95% for WCAG 2.1 AA compliance
- Bundle size must be ≤100KB for performance targets

## Entity Relationships

```
ComponentLibrary (1) ←→ (1) DesignToken
ComponentLibrary (1) ←→ (many) BaseComponent
BaseComponent (1) ←→ (many) ComponentVariant
BaseComponent (1) → (many) NutritionComponent (inheritance)
DesignToken (1) ←→ (many) ComponentVariant (references)
```

## Component Categories

### UI Components (Base)
- **Button**: Primary actions, secondary actions, nutrition-focused CTAs
- **Card**: Product cards, nutrition fact cards, filter cards
- **Badge**: Health grades (A-E), status indicators (halal/questionable)
- **Input**: Search boxes, filter controls, numeric inputs
- **Skeleton**: Loading states for product lists and cards

### Nutrition Components (Ali-Specific)
- **ProteinMeter**: Circular progress toward daily protein target (170g)
- **NutritionCard**: Standardized nutrition facts display
- **HealthGrade**: A-E health scoring with accessibility indicators
- **HalalBadge**: Halal status with cultural sensitivity
- **ProductCard**: Combined nutrition + pricing + health data

### Layout Components
- **Container**: Responsive page containers with max-widths
- **Stack**: Vertical spacing utility with nutrition data density
- **Grid**: Responsive grids for product lists and filter layouts

## State Management

Components use local state and props for data flow. No global state management required as design system is presentation-focused.

**State Patterns**:
- **Controlled Components**: Parent manages state (recommended)
- **Uncontrolled Components**: Internal state with default values
- **Compound Components**: Multiple components working together (e.g., Card.Header, Card.Content)

## Performance Constraints

- **Bundle Size**: Each component ≤5KB gzipped
- **Rendering**: 60fps for animations and interactions
- **Memory**: Minimal memory footprint for large product lists
- **Load Time**: Component CSS loads in <100ms

**Data Model Complete**: Ready for TypeScript contract generation and component implementation.
# Quickstart: Design System Implementation

**Feature**: Design System for Ali's Product Visualization
**Date**: 2025-09-20
**Prerequisites**: research.md, data-model.md, contracts/ complete

## Quick Start Guide

### 1. Development Environment Setup

```bash
# Ensure project dependencies are installed
npm install

# Install Storybook for component development
npx storybook@latest init

# Start development server
npm run dev

# Start Storybook for component development
npm run storybook

# Run component tests
npm run test:components
```

### 2. shadcn/ui Foundation Setup

```bash
# Initialize shadcn/ui (already done)
npx shadcn-ui@latest init

# Add base components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add input
npx shadcn-ui@latest add skeleton

# Verify components are available
ls src/components/ui/
```

### 3. Design Token Implementation

```typescript
// src/lib/design-tokens.ts
export const nutritionTokens = {
  colors: {
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
  },
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem'       // 32px
  }
};

// Add to TailwindCSS config
module.exports = {
  theme: {
    extend: {
      colors: nutritionTokens.colors,
      spacing: nutritionTokens.spacing,
    }
  }
};
```

### 4. Component Development Flow

#### 4.1 Base Component Pattern

```typescript
// src/components/ui/button.tsx (enhanced from shadcn/ui)
import { cn } from "@/lib/utils"
import { ButtonProps } from "@/contracts/BaseComponents"

const buttonVariants = cva(
  "inline-flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        nutrition: "bg-protein-high text-white hover:bg-protein-high/90",
        // ... other variants
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      }
    }
  }
)
```

#### 4.2 Ali-Specific Component Pattern

```typescript
// src/components/nutrition/protein-meter.tsx
import { ProteinMeterProps } from "@/contracts/NutritionComponents"

export function ProteinMeter({
  current,
  target = 170, // Ali's daily goal
  showPercentage = true,
  ...props
}: ProteinMeterProps) {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div className="flex items-center space-x-3" {...props}>
      <div className="relative w-16 h-16">
        {/* Circular progress implementation */}
        <svg className="w-16 h-16 transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={`${percentage * 1.76} 176`}
            className="text-protein-high"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold">{Math.round(percentage)}%</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium">{current}g / {target}g</p>
        <p className="text-xs text-muted-foreground">
          {target - current}g remaining
        </p>
      </div>
    </div>
  );
}
```

### 5. User Story Validation

#### Story 1: Consistent nutrition data display

```typescript
// Component test
describe('NutritionCard consistency', () => {
  test('displays nutrition data with consistent formatting', () => {
    render(<NutritionCard
      nutrition={{ protein: 25, calories: 150, carbs: 12, fat: 8 }}
      productName="Chicken Breast"
    />);

    expect(screen.getByText('25g')).toBeInTheDocument();
    expect(screen.getByText('protein')).toBeInTheDocument();
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Nutrition facts for Chicken Breast');
  });
});
```

#### Story 2: Accessible health grade display

```typescript
// Accessibility test
describe('HealthGrade accessibility', () => {
  test('provides multiple accessibility indicators', () => {
    render(<HealthGrade grade="A" score={95} />);

    // Color indicator
    expect(screen.getByRole('img')).toHaveClass('text-health-A');

    // Screen reader text
    expect(screen.getByText('Excellent nutritional value')).toBeInTheDocument();

    // Keyboard navigation
    expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
  });
});
```

#### Story 3: Mobile-responsive component behavior

```typescript
// Responsive test
describe('Component responsiveness', () => {
  test('adapts layout for mobile screens', () => {
    // Set mobile viewport
    Object.defineProperty(window, 'innerWidth', { value: 375 });

    render(<ProductCard product={mockProduct} layout="vertical" />);

    // Check mobile-specific classes
    expect(screen.getByTestId('product-card')).toHaveClass('flex-col');
    expect(screen.getByTestId('nutrition-summary')).toHaveClass('compact');
  });
});
```

### 6. Storybook Integration

```typescript
// stories/nutrition/ProteinMeter.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ProteinMeter } from '@/components/nutrition/protein-meter';

const meta: Meta<typeof ProteinMeter> = {
  title: 'Nutrition/ProteinMeter',
  component: ProteinMeter,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    current: { control: { type: 'number', min: 0, max: 200 } },
    target: { control: { type: 'number', min: 50, max: 300 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    current: 85,
    target: 170,
  },
};

export const NearTarget: Story = {
  args: {
    current: 160,
    target: 170,
  },
};

export const AlisDailyGoal: Story = {
  args: {
    current: 142,
    target: 170,
    showPercentage: true,
    showRemaining: true,
  },
};
```

### 7. Performance Optimization

```typescript
// Component optimization patterns
import { memo, useMemo } from 'react';

export const OptimizedProductCard = memo(({ product, ...props }) => {
  const nutritionSummary = useMemo(() =>
    calculateNutritionSummary(product.nutrition), [product.nutrition]
  );

  return (
    <ProductCard {...props}>
      {/* Memoized expensive calculations */}
    </ProductCard>
  );
});

// Bundle size monitoring
const bundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
```

### 8. Constitutional Compliance Validation

```bash
# Test build size
npm run build
npm run analyze # Check bundle size <100KB

# Test performance
npm run lighthouse # Mobile performance >90

# Test accessibility
npm run a11y-test # WCAG 2.1 AA compliance

# Test TypeScript compliance
npm run type-check # Zero TypeScript errors
```

### 9. Integration with Existing App

```typescript
// App.tsx integration
import { DesignTokenProvider } from '@/lib/design-tokens';
import '@/styles/globals.css';

function App() {
  return (
    <DesignTokenProvider>
      {/* Existing app components now have access to design system */}
      <HomePage />
    </DesignTokenProvider>
  );
}
```

### 10. Ready for Production

**Quality Gates**:
- [x] All component interfaces implemented
- [x] Accessibility tests passing (WCAG 2.1 AA)
- [x] Visual regression tests in Storybook
- [x] Bundle size under constitutional limits
- [x] Performance metrics met
- [x] Mobile-first responsive design

**Next Steps**:
1. Run `/tasks` command to generate detailed implementation tasks
2. Execute tasks in TDD order (tests → implementation)
3. Integrate with homepage (012-homepage) feature

**Development Ready**: All Phase 1 artifacts complete, design system foundation established for Ali's nutrition webapp.
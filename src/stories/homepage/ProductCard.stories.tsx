/**
 * Homepage ProductCard Storybook Stories
 *
 * Stories for product cards in the homepage context
 * Demonstrates compact/detailed variants, search highlighting, and virtual scrolling optimization
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
// Actions are now handled by argTypes - using simple functions instead
import { ProductCard } from '../../components/homepage/ProductCard';
import type { ProductDisplay } from '../../types/homepage';

// Sample product data for stories
const sampleProducts: ProductDisplay[] = [
  {
    id: 'chicken-breast-1',
    name: 'Organic Chicken Breast',
    brand: 'Farm Fresh',
    price: 8.99,
    currency: '€',
    protein: 31.2,
    carbs: 0,
    fat: 3.6,
    calories: 165,
    healthGrade: 'A',
    healthScore: 92,
    isHalal: true,
    contextScore: 85.7,
    contextLabel: 'High Protein',
    targetContribution: '18.4% of daily target',
    displayHeight: 120,
    isVisible: true
  },
  {
    id: 'greek-yogurt-1',
    name: 'Greek Yogurt Natural',
    brand: 'Chobani',
    price: 4.29,
    currency: '€',
    protein: 10.3,
    carbs: 4.0,
    fat: 0.4,
    calories: 59,
    healthGrade: 'B',
    healthScore: 78,
    isHalal: true,
    contextScore: 72.1,
    contextLabel: 'Good Protein',
    targetContribution: '6.1% of daily target',
    displayHeight: 120,
    isVisible: true
  },
  {
    id: 'whey-protein-1',
    name: 'Whey Protein Isolate Vanilla',
    brand: 'Optimum Nutrition',
    price: 45.99,
    currency: '€',
    protein: 90.0,
    carbs: 1.0,
    fat: 1.0,
    calories: 380,
    healthGrade: 'B',
    healthScore: 81,
    isHalal: false,
    contextScore: 95.2,
    contextLabel: 'Very High Protein',
    targetContribution: '53.0% of daily target',
    displayHeight: 120,
    isVisible: true,
    isHighlighted: false
  },
  {
    id: 'salmon-fillet-1',
    name: 'Atlantic Salmon Fillet',
    brand: 'Ocean Fresh',
    price: 12.49,
    currency: '€',
    protein: 25.4,
    carbs: 0,
    fat: 13.4,
    calories: 208,
    healthGrade: 'A',
    healthScore: 89,
    isHalal: true,
    contextScore: 78.9,
    contextLabel: 'High Protein',
    targetContribution: '15.0% of daily target',
    displayHeight: 120,
    isVisible: true
  },
  {
    id: 'quinoa-1',
    name: 'Organic Red Quinoa',
    brand: 'Ancient Harvest',
    price: 6.79,
    currency: '€',
    protein: 14.1,
    carbs: 64.2,
    fat: 6.1,
    calories: 368,
    healthGrade: 'C',
    healthScore: 65,
    isHalal: true,
    contextScore: 58.4,
    contextLabel: 'Moderate Protein',
    targetContribution: '8.3% of daily target',
    displayHeight: 120,
    isVisible: true
  }
];

// Product with search highlighting
const highlightedProduct: ProductDisplay = {
  ...sampleProducts[0],
  isHighlighted: true,
  matchedTerms: ['chicken', 'organic']
};

const meta: Meta<typeof ProductCard> = {
  title: 'Homepage/ProductCard',
  component: ProductCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Product cards optimized for the homepage virtual scrolling list. Features:
- Compact and detailed variants for different use cases
- Search term highlighting with visual indicators
- Context-specific scoring and labels
- Health grade badges with color coding
- Halal certification indicators
- Target contribution calculations
- Mobile-optimized touch interactions

**Performance Optimizations:**
- React.memo for efficient re-rendering
- Fixed height for virtual scrolling
- Optimized for 11k+ product lists
- Touch-friendly interactions
        `
      }
    }
  },
  argTypes: {
    product: {
      description: 'Product data to display',
      control: { type: 'object' }
    },
    variant: {
      description: 'Card display variant',
      control: { type: 'select', options: ['compact', 'detailed'] }
    },
    onSelect: {
      description: 'Callback when product is selected',
      action: 'product-selected'
    },
    className: {
      description: 'Additional CSS classes',
      control: { type: 'text' }
    }
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof ProductCard>;

// Default compact variant
export const Default: Story = {
  args: {
    product: sampleProducts[0],
    variant: 'compact',
    onSelect: () => {}
  }
};

// Detailed variant
export const Detailed: Story = {
  args: {
    product: sampleProducts[0],
    variant: 'detailed',
    onSelect: () => {}
  },
  parameters: {
    docs: {
      description: {
        story: 'Detailed variant with more information and larger layout.'
      }
    }
  }
};

// Search highlighting
export const SearchHighlighted: Story = {
  args: {
    product: highlightedProduct,
    variant: 'compact',
    onSelect: () => {}
  },
  parameters: {
    docs: {
      description: {
        story: 'Product card with search term highlighting showing matched terms in yellow.'
      }
    }
  }
};

// Different health grades
export const HealthGrades: Story = {
  render: () => (
    <div className="space-y-4">
      {(['A', 'B', 'C', 'D', 'E'] as const).map((grade, index) => {
        const product = {
          ...sampleProducts[index] || sampleProducts[0],
          healthGrade: grade,
          healthScore: [95, 82, 68, 45, 28][index],
          name: `${grade} Grade Product Example`
        };

        return (
          <ProductCard
            key={grade}
            product={product}
            variant="compact"
            onSelect={() => {}}
          />
        );
      })}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Product cards showing all health grades from A (best) to E (worst) with appropriate colors.'
      }
    }
  }
};

// High protein products
export const HighProtein: Story = {
  args: {
    product: sampleProducts[2], // Whey protein
    variant: 'compact',
    onSelect: () => {}
  },
  parameters: {
    docs: {
      description: {
        story: 'High protein product showing very high protein content and contribution percentage.'
      }
    }
  }
};

// Budget-friendly option
export const BudgetFriendly: Story = {
  args: {
    product: sampleProducts[1], // Greek yogurt
    variant: 'compact',
    onSelect: () => {}
  },
  parameters: {
    docs: {
      description: {
        story: 'Budget-friendly protein source with good value proposition.'
      }
    }
  }
};

// Non-halal product
export const NonHalal: Story = {
  args: {
    product: sampleProducts[2], // Whey protein (marked as non-halal)
    variant: 'compact',
    onSelect: () => {}
  },
  parameters: {
    docs: {
      description: {
        story: 'Product that is not halal certified (no halal indicator shown).'
      }
    }
  }
};

// Product comparison
export const ProductComparison: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h3 className="font-semibold mb-2">Chicken Breast (Whole Food)</h3>
        <ProductCard
          product={sampleProducts[0]}
          variant="detailed"
          onSelect={() => {}}
        />
      </div>
      <div>
        <h3 className="font-semibold mb-2">Whey Protein (Supplement)</h3>
        <ProductCard
          product={sampleProducts[2]}
          variant="detailed"
          onSelect={() => {}}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of whole food vs supplement protein sources.'
      }
    }
  }
};

// Virtual scrolling list simulation
export const VirtualScrollingList: Story = {
  render: () => (
    <div className="h-64 overflow-y-auto space-y-1 border rounded-lg p-2">
      {sampleProducts.map((product, index) => (
        <ProductCard
          key={product.id}
          product={{
            ...product,
            isHighlighted: index === 1 // Highlight second item
          }}
          variant="compact"
          onSelect={() => {}}
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Simulation of virtual scrolling list with multiple product cards.'
      }
    }
  }
};

// Context-specific labels
export const ContextLabels: Story = {
  render: () => (
    <div className="space-y-4">
      {[
        { ...sampleProducts[0], contextLabel: 'High Protein', contextScore: 85.7 },
        { ...sampleProducts[1], contextLabel: 'Good Value', contextScore: 72.1 },
        { ...sampleProducts[2], contextLabel: 'Fast Recovery', contextScore: 95.2 },
        { ...sampleProducts[3], contextLabel: 'Premium Choice', contextScore: 78.9 },
        { ...sampleProducts[4], contextLabel: 'Low Cal', contextScore: 58.4 }
      ].map((product, index) => (
        <ProductCard
          key={index}
          product={product}
          variant="compact"
          onSelect={() => {}}
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different context-specific labels based on filter category (High Protein, Good Value, etc.).'
      }
    }
  }
};

// Mobile viewport
export const MobileViewport: Story = {
  args: {
    product: sampleProducts[0],
    variant: 'compact',
    onSelect: () => {}
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    },
    docs: {
      description: {
        story: 'Product card optimized for mobile viewport with touch-friendly interactions.'
      }
    }
  }
};

// Interactive state
export const Interactive: Story = {
  args: {
    product: sampleProducts[0],
    variant: 'compact',
    onSelect: () => {}
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive product card - click to see selection feedback. Hover to see hover effects.'
      }
    }
  }
};

// Loading placeholder (for virtual scrolling)
export const LoadingPlaceholder: Story = {
  args: {
    product: {
      id: 'loading-placeholder',
      name: 'Loading...',
      brand: '...',
      price: 0,
      currency: '€',
      protein: 0,
      carbs: 0,
      fat: 0,
      calories: 0,
      healthGrade: 'E' as const,
      healthScore: 0,
      isHalal: false,
      displayHeight: 120,
      isVisible: true
    },
    variant: 'compact',
    onSelect: () => {}
  },
  parameters: {
    docs: {
      description: {
        story: 'Placeholder state used during virtual scrolling loading.'
      }
    }
  }
};

// Custom styling
export const CustomStyling: Story = {
  args: {
    product: sampleProducts[3], // Salmon
    variant: 'compact',
    onSelect: () => {},
    className: 'border-2 border-blue-500 shadow-lg hover:shadow-blue-200'
  },
  parameters: {
    docs: {
      description: {
        story: 'Product card with custom styling applied via className prop.'
      }
    }
  }
};

// Accessibility demonstration
export const Accessibility: Story = {
  args: {
    product: sampleProducts[0],
    variant: 'detailed',
    onSelect: () => {}
  },
  parameters: {
    docs: {
      description: {
        story: `
Accessibility features demonstrated:
- Comprehensive ARIA labels with all product information
- Keyboard navigation support
- Focus-visible indicators
- Screen reader friendly content structure
- Semantic HTML with proper roles

Try navigating with keyboard or screen reader to test accessibility.
        `
      }
    }
  }
};
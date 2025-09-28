/**
 * ProductList Storybook Stories
 *
 * Stories for virtual scrolling product list with performance optimization
 * Demonstrates different list states, virtual scrolling behavior, and loading states
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
// Actions are now handled by argTypes - using simple functions instead
import React from 'react';
import { ProductList } from '../../components/homepage/ProductList';
import type { ProductDisplay } from '../../types/homepage';

// Generate sample product data for different scenarios
const generateSampleProducts = (count: number): ProductDisplay[] => {
  const brands = ['Farm Fresh', 'Chobani', 'Optimum Nutrition', 'Ocean Fresh', 'Ancient Harvest', 'Protein World', 'Muscle Tech', 'Quest Nutrition', 'Premier Protein', 'Pure Protein'];
  const productTypes = ['Chicken Breast', 'Greek Yogurt', 'Whey Protein', 'Salmon Fillet', 'Quinoa', 'Protein Bar', 'Cottage Cheese', 'Tuna', 'Eggs', 'Almonds'];
  const healthGrades: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];

  return Array.from({ length: count }, (_, index) => ({
    id: `product-${index + 1}`,
    name: `${productTypes[index % productTypes.length]} ${Math.floor(index / productTypes.length) + 1}`,
    brand: brands[index % brands.length],
    price: Number((Math.random() * 30 + 2).toFixed(2)),
    currency: '€',
    protein: Number((Math.random() * 40 + 5).toFixed(1)),
    carbs: Number((Math.random() * 20).toFixed(1)),
    fat: Number((Math.random() * 15).toFixed(1)),
    calories: Math.floor(Math.random() * 200 + 50),
    healthGrade: healthGrades[Math.floor(Math.random() * healthGrades.length)],
    healthScore: Math.floor(Math.random() * 40 + 60),
    isHalal: Math.random() > 0.3,
    contextScore: Number((Math.random() * 40 + 60).toFixed(1)),
    contextLabel: ['High Protein', 'Good Value', 'Fast Recovery', 'Premium Choice', 'Low Cal'][Math.floor(Math.random() * 5)],
    targetContribution: `${Number((Math.random() * 30 + 5).toFixed(1))}% of daily target`,
    displayHeight: 120,
    isVisible: true,
    isHighlighted: index < 3 ? Math.random() > 0.8 : false, // Some highlighted items
    matchedTerms: index < 3 && Math.random() > 0.8 ? ['protein'] : undefined
  }));
};

// Small dataset for basic demos
const smallProductList = generateSampleProducts(12);

// Medium dataset for virtual scrolling demo
const mediumProductList = generateSampleProducts(150);

// Large dataset for performance demo
const largeProductList = generateSampleProducts(1000);

const meta: Meta<typeof ProductList> = {
  title: 'Homepage/ProductList',
  component: ProductList,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Virtual scrolling product list optimized for 11k+ products. Features:
- Custom virtual scrolling implementation with Intersection Observer
- Configurable item height and overscan buffer
- Automatic virtual scrolling for lists > 50 items
- Loading states and empty states
- Performance monitoring integration
- Mobile-optimized touch interactions

**Performance Optimizations:**
- Only renders visible items + overscan buffer
- Smooth scrolling with 60fps target
- Memory-efficient for large datasets
- Intersection Observer for visibility detection
- Configurable container height and item sizing
        `
      }
    }
  },
  argTypes: {
    products: {
      description: 'Array of products to display',
      control: { type: 'object' }
    },
    loading: {
      description: 'Whether the list is in loading state',
      control: { type: 'boolean' }
    },
    onLoadMore: {
      description: 'Callback for infinite scrolling (optional)',
      action: 'load-more'
    },
    virtualScrolling: {
      description: 'Enable virtual scrolling (auto-enabled for >50 items)',
      control: { type: 'boolean' }
    },
    className: {
      description: 'Additional CSS classes',
      control: { type: 'text' }
    }
  }
};

export default meta;
type Story = StoryObj<typeof ProductList>;

// Small list without virtual scrolling
export const SmallList: Story = {
  args: {
    products: smallProductList,
    loading: false,
    virtualScrolling: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Small product list (12 items) without virtual scrolling enabled.'
      }
    }
  }
};

// Medium list with virtual scrolling
export const VirtualScrolling: Story = {
  args: {
    products: mediumProductList,
    loading: false,
    virtualScrolling: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Medium product list (150 items) with virtual scrolling enabled. Scroll to see performance benefits.'
      }
    }
  }
};

// Large list for performance testing
export const LargeList: Story = {
  args: {
    products: largeProductList,
    loading: false,
    virtualScrolling: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Large product list (1000 items) demonstrating virtual scrolling performance with large datasets.'
      }
    }
  }
};

// Loading state
export const Loading: Story = {
  args: {
    products: [],
    loading: true,
    virtualScrolling: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state showing spinner and loading message.'
      }
    }
  }
};

// Empty state
export const Empty: Story = {
  args: {
    products: [],
    loading: false,
    virtualScrolling: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state when no products match the current filter or search.'
      }
    }
  }
};

// Loading more (infinite scroll)
export const LoadingMore: Story = {
  args: {
    products: mediumProductList,
    loading: true,
    onLoadMore: () => {},
    virtualScrolling: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading more products state for infinite scrolling. Scroll to bottom to trigger load more.'
      }
    }
  }
};

// Search results with highlighting
export const SearchResults: Story = {
  args: {
    products: smallProductList.map((product, index) => ({
      ...product,
      isHighlighted: index < 4,
      matchedTerms: index < 4 ? ['protein', 'chicken'] : undefined
    })),
    loading: false,
    virtualScrolling: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Search results showing highlighted products that match search terms.'
      }
    }
  }
};

// Single product result
export const SingleResult: Story = {
  args: {
    products: [smallProductList[0]],
    loading: false,
    virtualScrolling: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Single product result from a specific search or filter.'
      }
    }
  }
};

// Mobile viewport
export const MobileViewport: Story = {
  args: {
    products: mediumProductList,
    loading: false,
    virtualScrolling: true
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    },
    docs: {
      description: {
        story: 'Product list optimized for mobile viewport with touch-friendly scrolling.'
      }
    }
  }
};

// Performance monitoring demo
export const PerformanceMonitoring: Story = {
  args: {
    products: largeProductList,
    loading: false,
    virtualScrolling: true
  },
  decorators: [
    (Story) => (
      <div>
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Performance Monitoring Demo</h3>
          <p className="text-sm text-blue-700">
            This large list (1000 items) demonstrates virtual scrolling performance.
            Check browser dev tools Performance tab for rendering metrics.
          </p>
        </div>
        <Story />
      </div>
    )
  ],
  parameters: {
    docs: {
      description: {
        story: 'Large dataset for performance monitoring and virtual scrolling optimization testing.'
      }
    }
  }
};

// Auto virtual scrolling threshold
export const AutoVirtualScrolling: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Below Threshold (40 items) - No Virtual Scrolling</h3>
        <ProductList
          products={generateSampleProducts(40)}
          loading={false}
          virtualScrolling={undefined} // Auto-detect
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Above Threshold (60 items) - Virtual Scrolling Enabled</h3>
        <ProductList
          products={generateSampleProducts(60)}
          loading={false}
          virtualScrolling={undefined} // Auto-detect
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of automatic virtual scrolling activation when product count exceeds 50 items.'
      }
    }
  }
};

// Infinite scrolling simulation
export const InfiniteScrolling: Story = {
  render: function InfiniteScrollDemo() {
    const [products, setProducts] = React.useState(generateSampleProducts(50));
    const [loading, setLoading] = React.useState(false);

    const handleLoadMore = () => {
      if (loading) return;

      setLoading(true);
      // Mock function call

      // Simulate API delay
      setTimeout(() => {
        const newProducts = generateSampleProducts(25).map((product, index) => ({
          ...product,
          id: `batch-${products.length + index + 1}-${product.id}`
        }));

        setProducts(prev => [...prev, ...newProducts]);
        setLoading(false);
      }, 1500);
    };

    return (
      <div>
        <div className="mb-4 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">Infinite Scrolling Demo</h3>
          <p className="text-sm text-green-700">
            Scroll to bottom to load more products. Currently showing {products.length} products.
          </p>
        </div>

        <ProductList
          products={products}
          loading={loading}
          onLoadMore={handleLoadMore}
          virtualScrolling={true}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive infinite scrolling demonstration. Scroll to bottom to load more products.'
      }
    }
  }
};

// Different container heights
export const ContainerHeights: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Compact Container (300px)</h3>
        <div className="h-[300px] border rounded-lg">
          <ProductList
            products={mediumProductList}
            loading={false}
            virtualScrolling={true}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Default Container (600px)</h3>
        <ProductList
          products={mediumProductList}
          loading={false}
          virtualScrolling={true}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Product lists with different container heights showing virtual scrolling adaptation.'
      }
    }
  }
};

// Error state simulation
export const ErrorState: Story = {
  render: () => (
    <div>
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-semibold text-red-900 mb-2">Simulated Error State</h3>
        <p className="text-sm text-red-700">
          This represents how the list would appear when there's an error loading products.
        </p>
      </div>

      <ProductList
        products={[]}
        loading={false}
        virtualScrolling={false}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Error state simulation showing empty list with context information.'
      }
    }
  }
};

// Custom styling
export const CustomStyling: Story = {
  args: {
    products: smallProductList,
    loading: false,
    virtualScrolling: false,
    className: 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl'
  },
  parameters: {
    docs: {
      description: {
        story: 'Product list with custom styling applied via className prop.'
      }
    }
  }
};
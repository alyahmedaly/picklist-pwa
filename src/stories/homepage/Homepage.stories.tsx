/**
 * Homepage Integration Storybook Stories
 *
 * Stories for the complete homepage with all integrated components
 * Demonstrates filter navigation, search, virtual scrolling, and state management
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
// Actions are now handled by argTypes - using simple functions instead
import React from 'react';
import { Homepage } from '../../components/homepage/Homepage';
import type { FilterCategory, ProductDisplay } from '../../types/homepage';

// Mock filter categories
const mockFilterCategories: FilterCategory[] = [
  {
    id: 'daily-protein',
    name: 'Daily Protein',
    description: 'High-protein foods for daily nutrition goals',
    coverage: 11379,
    dataFile: '/filtered-ali-daily-protein.jsonl',
    targetProtein: 150,
    context: 'daily',
    isActive: true
  },
  {
    id: 'post-workout',
    name: 'Post-Workout',
    description: 'Fast carbs + protein for recovery',
    coverage: 3247,
    dataFile: '/filtered-ali-post-workout.jsonl',
    targetProtein: 30,
    context: 'post-workout'
  },
  {
    id: 'cutting',
    name: 'Cutting',
    description: 'High satiety, low calorie density foods',
    coverage: 2156,
    dataFile: '/filtered-ali-cutting.jsonl',
    context: 'fat-loss'
  },
  {
    id: 'budget',
    name: 'Budget',
    description: 'Cost-effective protein sources',
    coverage: 8942,
    dataFile: '/filtered-ali-budget.jsonl',
    context: 'budget'
  },
  {
    id: 'training-day',
    name: 'Training Day',
    description: 'Carb-enhanced foods for training days',
    coverage: 5678,
    dataFile: '/filtered-ali-training-day.jsonl',
    context: 'training'
  },
  {
    id: 'rest-day',
    name: 'Rest Day',
    description: 'Lower carb options for rest days',
    coverage: 4321,
    dataFile: '/filtered-ali-rest-day.jsonl',
    context: 'rest'
  }
];

// Mock data manager for Storybook
const mockDataManager = {
  loadCategoryProducts: async (categoryId: string): Promise<ProductDisplay[]> => {
    // Mock function call

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate different product sets based on category
    const baseProducts = generateMockProducts(categoryId);
    return baseProducts;
  },

  searchAndSortProducts: async (
    categoryId: string,
    searchQuery: string,
    sortBy: string,
    sortDirection: 'asc' | 'desc'
  ): Promise<ProductDisplay[]> => {
    // Mock function call

    const products = await mockDataManager.loadCategoryProducts(categoryId);

    // Apply search filter
    let filtered = products;
    if (searchQuery.trim()) {
      filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      ).map(product => ({
        ...product,
        isHighlighted: true,
        matchedTerms: [searchQuery.toLowerCase()]
      }));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const multiplier = sortDirection === 'desc' ? -1 : 1;
      switch (sortBy) {
        case 'protein-desc':
        case 'protein-asc':
          return (b.protein - a.protein) * multiplier;
        case 'price-asc':
        case 'price-desc':
          return (a.price - b.price) * multiplier;
        case 'name':
          return a.name.localeCompare(b.name) * multiplier;
        default:
          return 0;
      }
    });

    return filtered;
  },

  clearCache: () => {
    // Mock function call
  }
};

// Mock performance monitor
const mockPerformanceMonitor = {
  getMetrics: () => ({
    filterLoadTime: 234,
    searchTime: 45,
    renderTime: 12,
    memoryUsage: 25 * 1024 * 1024,
    scrollFps: 58,
    cacheHitRate: 87.5,
    cacheSize: 4,
    totalCacheHits: 23,
    totalCacheMisses: 3
  }),

  getInsights: () => ({
    bottlenecks: ['Memory usage approaching limit'],
    recommendations: ['Consider implementing data pagination', 'Add virtual scrolling optimization'],
    score: 87
  })
};

// Replace imports with mocks for Storybook
React.useEffect(() => {
  // Mock the data manager and performance monitor modules
  if (typeof window !== 'undefined') {
    (window as unknown as { __mockDataManager: typeof mockDataManager; __mockPerformanceMonitor: typeof mockPerformanceMonitor }).__mockDataManager = mockDataManager;
    (window as unknown as { __mockDataManager: typeof mockDataManager; __mockPerformanceMonitor: typeof mockPerformanceMonitor }).__mockPerformanceMonitor = mockPerformanceMonitor;
  }
}, []);

// Generate mock products for different categories
function generateMockProducts(categoryId: string): ProductDisplay[] {
  const productConfigs = {
    'daily-protein': {
      count: 85,
      baseProtein: 25,
      productTypes: ['Chicken Breast', 'Greek Yogurt', 'Salmon', 'Eggs', 'Cottage Cheese']
    },
    'post-workout': {
      count: 32,
      baseProtein: 30,
      productTypes: ['Whey Protein', 'Protein Shake', 'Chocolate Milk', 'Banana', 'Recovery Bar']
    },
    'cutting': {
      count: 28,
      baseProtein: 20,
      productTypes: ['Lean Turkey', 'White Fish', 'Protein Bar', 'Egg Whites', 'Tuna']
    },
    'budget': {
      count: 76,
      baseProtein: 18,
      productTypes: ['Canned Tuna', 'Dried Beans', 'Ground Turkey', 'Milk', 'Peanut Butter']
    },
    'training-day': {
      count: 58,
      baseProtein: 22,
      productTypes: ['Oats with Protein', 'Sweet Potato', 'Rice Cakes', 'Pasta', 'Energy Bar']
    },
    'rest-day': {
      count: 41,
      baseProtein: 28,
      productTypes: ['Avocado', 'Nuts', 'Olive Oil', 'Salmon', 'Leafy Greens']
    }
  };

  const config = productConfigs[categoryId as keyof typeof productConfigs] || productConfigs['daily-protein'];
  const brands = ['Farm Fresh', 'Chobani', 'Optimum Nutrition', 'Ocean Fresh', 'Ancient Harvest'];
  const healthGrades: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];

  return Array.from({ length: config.count }, (_, index) => ({
    id: `${categoryId}-product-${index + 1}`,
    name: `${config.productTypes[index % config.productTypes.length]} Premium ${index + 1}`,
    brand: brands[index % brands.length],
    price: Number((Math.random() * 25 + 3).toFixed(2)),
    currency: '€',
    protein: Number((config.baseProtein + Math.random() * 15).toFixed(1)),
    carbs: Number((Math.random() * 30).toFixed(1)),
    fat: Number((Math.random() * 12).toFixed(1)),
    calories: Math.floor(Math.random() * 150 + 100),
    healthGrade: healthGrades[Math.floor(Math.random() * healthGrades.length)],
    healthScore: Math.floor(Math.random() * 30 + 70),
    isHalal: Math.random() > 0.25,
    contextScore: Number((Math.random() * 30 + 70).toFixed(1)),
    contextLabel: getContextLabel(categoryId),
    targetContribution: `${Number((Math.random() * 25 + 8).toFixed(1))}% of daily target`,
    displayHeight: 120,
    isVisible: true
  }));
}

function getContextLabel(categoryId: string): string {
  const labels = {
    'daily-protein': 'High Protein',
    'post-workout': 'Fast Recovery',
    'cutting': 'Low Cal',
    'budget': 'Great Value',
    'training-day': 'High Carb',
    'rest-day': 'Low Carb'
  };
  return labels[categoryId as keyof typeof labels] || 'Quality Choice';
}

const meta: Meta<typeof Homepage> = {
  title: 'Homepage/Homepage Integration',
  component: Homepage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Complete homepage integration showcasing all components working together:

**Components Integrated:**
- FilterCard navigation (6 categories)
- SearchControls with debounced search and sorting
- ProductList with virtual scrolling for 11k+ products
- DataManager for coordinated loading and caching
- PerformanceMonitor for real-time optimization insights

**Key Features:**
- React 19 concurrent features (Suspense, useTransition, useDeferredValue)
- Mobile-first responsive design
- Comprehensive performance monitoring
- Real-time search with highlighting
- Virtual scrolling optimization
- Context-aware product scoring

**Architecture:**
- State management with useReducer
- Data layer with intelligent caching
- Performance monitoring integration
- Accessibility compliance throughout
        `
      }
    }
  },
  argTypes: {
    initialCategories: {
      description: 'Available filter categories',
      control: { type: 'object' }
    },
    defaultCategory: {
      description: 'Initial active category',
      control: { type: 'object' }
    },
    className: {
      description: 'Additional CSS classes',
      control: { type: 'text' }
    }
  }
};

export default meta;
type Story = StoryObj<typeof Homepage>;

// Default homepage state
export const Default: Story = {
  args: {
    initialCategories: mockFilterCategories,
    defaultCategory: mockFilterCategories[0]
  }
};

// Different initial category
export const PostWorkoutFocus: Story = {
  args: {
    initialCategories: mockFilterCategories,
    defaultCategory: mockFilterCategories[1] // Post-Workout
  },
  parameters: {
    docs: {
      description: {
        story: 'Homepage initialized with Post-Workout filter active, showing recovery-focused products.'
      }
    }
  }
};

// Budget category focus
export const BudgetFocus: Story = {
  args: {
    initialCategories: mockFilterCategories,
    defaultCategory: mockFilterCategories[3] // Budget
  },
  parameters: {
    docs: {
      description: {
        story: 'Homepage focused on budget-friendly protein sources with cost-effective options.'
      }
    }
  }
};

// Mobile viewport
export const MobileViewport: Story = {
  args: {
    initialCategories: mockFilterCategories,
    defaultCategory: mockFilterCategories[0]
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    },
    docs: {
      description: {
        story: 'Complete homepage experience optimized for mobile devices with touch-friendly interactions.'
      }
    }
  }
};

// Tablet viewport
export const TabletViewport: Story = {
  args: {
    initialCategories: mockFilterCategories,
    defaultCategory: mockFilterCategories[0]
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet'
    },
    docs: {
      description: {
        story: 'Homepage layout optimized for tablet viewport showing the responsive grid adaptation.'
      }
    }
  }
};

// Dark mode
export const DarkMode: Story = {
  args: {
    initialCategories: mockFilterCategories,
    defaultCategory: mockFilterCategories[0]
  },
  decorators: [
    (Story) => (
      <div className="dark bg-gray-900 min-h-screen">
        <Story />
      </div>
    )
  ],
  parameters: {
    docs: {
      description: {
        story: 'Homepage with dark mode styling showing the complete design system in dark theme.'
      }
    }
  }
};

// Performance demonstration
export const PerformanceDemo: Story = {
  args: {
    initialCategories: mockFilterCategories,
    defaultCategory: mockFilterCategories[0]
  },
  decorators: [
    (Story) => (
      <div>
        <div className="p-4 bg-blue-50 border-b">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Performance Monitoring Demo</h2>
          <p className="text-sm text-blue-700">
            This demo shows real-time performance metrics in development mode.
            Check the debug panel at the bottom for live performance insights.
          </p>
        </div>
        <Story />
      </div>
    )
  ],
  parameters: {
    docs: {
      description: {
        story: 'Homepage with performance monitoring enabled, showing real-time metrics and optimization insights.'
      }
    }
  }
};

// Interactive feature tour
export const FeatureTour: Story = {
  args: {
    initialCategories: mockFilterCategories,
    defaultCategory: mockFilterCategories[0]
  },
  decorators: [
    (Story) => (
      <div>
        <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-b">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🏠 Ali's Nutrition Hub - Feature Tour</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <h3 className="font-semibold text-purple-900 mb-1">🎯 Filter Categories</h3>
              <p className="text-gray-700">Click filter cards to explore Ali's 6 specialized categories</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <h3 className="font-semibold text-blue-900 mb-1">🔍 Smart Search</h3>
              <p className="text-gray-700">Debounced search with highlighting and result count</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <h3 className="font-semibold text-green-900 mb-1">📊 Virtual Scrolling</h3>
              <p className="text-gray-700">Smooth performance with 11k+ products</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <h3 className="font-semibold text-orange-900 mb-1">⚡ React 19</h3>
              <p className="text-gray-700">Concurrent features for optimal UX</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <h3 className="font-semibold text-red-900 mb-1">📱 Mobile First</h3>
              <p className="text-gray-700">Touch-optimized responsive design</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <h3 className="font-semibold text-indigo-900 mb-1">🎪 Performance</h3>
              <p className="text-gray-700">Real-time monitoring and optimization</p>
            </div>
          </div>
        </div>
        <Story />
      </div>
    )
  ],
  parameters: {
    docs: {
      description: {
        story: 'Interactive tour highlighting all key features of the homepage design system.'
      }
    }
  }
};

// Accessibility showcase
export const AccessibilityShowcase: Story = {
  args: {
    initialCategories: mockFilterCategories,
    defaultCategory: mockFilterCategories[0]
  },
  decorators: [
    (Story) => (
      <div>
        <div className="p-4 bg-green-50 border-b border-green-200">
          <h2 className="text-lg font-semibold text-green-900 mb-2">♿ Accessibility Features</h2>
          <div className="text-sm text-green-800 space-y-1">
            <p>• Full keyboard navigation support (Tab, Enter, Space)</p>
            <p>• Screen reader optimized with comprehensive ARIA labels</p>
            <p>• High contrast focus indicators and color schemes</p>
            <p>• Live regions for dynamic content updates</p>
            <p>• Semantic HTML structure throughout</p>
          </div>
        </div>
        <Story />
      </div>
    )
  ],
  parameters: {
    docs: {
      description: {
        story: 'Homepage demonstrating comprehensive accessibility features. Try navigating with keyboard or screen reader.'
      }
    }
  }
};

// Error state simulation
export const ErrorState: Story = {
  args: {
    initialCategories: mockFilterCategories,
    defaultCategory: mockFilterCategories[0]
  },
  decorators: [
    (Story) => {
      // Mock error state by overriding the data manager
      React.useEffect(() => {
        if (typeof window !== 'undefined') {
          (window as unknown as { __mockDataManager: typeof mockDataManager }).__mockDataManager = {
            ...mockDataManager,
            loadCategoryProducts: async () => {
              throw new Error('Failed to load products - network error');
            }
          };
        }
      }, []);

      return <Story />;
    }
  ],
  parameters: {
    docs: {
      description: {
        story: 'Homepage error state handling when data loading fails.'
      }
    }
  }
};

// Custom styling
export const CustomStyling: Story = {
  args: {
    initialCategories: mockFilterCategories,
    defaultCategory: mockFilterCategories[0],
    className: 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
  },
  parameters: {
    docs: {
      description: {
        story: 'Homepage with custom gradient background styling.'
      }
    }
  }
};

// Development mode
export const DevelopmentMode: Story = {
  args: {
    initialCategories: mockFilterCategories,
    defaultCategory: mockFilterCategories[0]
  },
  parameters: {
    docs: {
      description: {
        story: 'Homepage in development mode showing debug information and performance metrics at the bottom.'
      }
    }
  }
};
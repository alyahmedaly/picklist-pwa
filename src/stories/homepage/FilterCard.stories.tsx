/**
 * FilterCard Storybook Stories
 *
 * Stories for Ali's filter category navigation cards
 * Demonstrates different states, categories, and mobile interactions
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
// Actions are now handled by argTypes - using simple functions instead
import { FilterCard } from '../../components/homepage/FilterCard';
import type { FilterCategory } from '../../types/homepage';

// Sample filter categories data
const sampleCategories: FilterCategory[] = [
  {
    id: 'daily-protein',
    name: 'Daily Protein',
    description: 'High-protein foods for daily nutrition goals',
    coverage: 11379,
    dataFile: '/filtered-ali-daily-protein.jsonl',
    targetProtein: 150,
    context: 'daily'
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

const meta: Meta<typeof FilterCard> = {
  title: 'Homepage/FilterCard',
  component: FilterCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Filter navigation cards for Ali's 6 filter categories. Each card shows:
- Category name with context icon
- Description and coverage statistics
- Target protein information (when applicable)
- Active/inactive states with proper styling
- Mobile-optimized touch targets and interactions

**Features:**
- Mobile-first responsive design
- Touch-optimized interactions
- Accessibility support with ARIA labels
- Context-specific icons and badges
- Smooth hover and active state transitions
        `
      }
    }
  },
  argTypes: {
    category: {
      description: 'Filter category data with coverage statistics',
      control: { type: 'object' }
    },
    isActive: {
      description: 'Whether this filter is currently active',
      control: { type: 'boolean' }
    },
    onClick: {
      description: 'Callback when filter card is clicked',
      action: 'clicked'
    },
    className: {
      description: 'Additional CSS classes',
      control: { type: 'text' }
    }
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof FilterCard>;

// Default story - Daily Protein (most common)
export const Default: Story = {
  args: {
    category: sampleCategories[0],
    isActive: false,
    onClick: () => {}
  }
};

// Active state
export const Active: Story = {
  args: {
    category: sampleCategories[0],
    isActive: true,
    onClick: () => {}
  }
};

// All category types in a grid
export const AllCategories: Story = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
      {sampleCategories.map((category, index) => (
        <FilterCard
          key={category.id}
          category={category}
          isActive={index === 0} // First one active
          onClick={() => {}}
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All 6 filter categories showing different contexts, coverage numbers, and one active state.'
      }
    }
  }
};

// Post-Workout category (with recovery context)
export const PostWorkout: Story = {
  args: {
    category: sampleCategories[1],
    isActive: false,
    onClick: () => {}
  },
  parameters: {
    docs: {
      description: {
        story: 'Post-workout recovery filter with lightning icon and protein target.'
      }
    }
  }
};

// Budget category (cost-effective options)
export const Budget: Story = {
  args: {
    category: sampleCategories[3],
    isActive: true,
    onClick: () => {}
  },
  parameters: {
    docs: {
      description: {
        story: 'Budget-friendly protein sources with money icon and high coverage.'
      }
    }
  }
};

// Low coverage category
export const LowCoverage: Story = {
  args: {
    category: {
      id: 'specialized',
      name: 'Specialized',
      description: 'Highly specific nutritional requirements',
      coverage: 47,
      dataFile: '/filtered-ali-specialized.jsonl',
      context: 'specialized'
    },
    isActive: false,
    onClick: () => {}
  },
  parameters: {
    docs: {
      description: {
        story: 'Category with low product coverage (under 100 products).'
      }
    }
  }
};

// High coverage category
export const HighCoverage: Story = {
  args: {
    category: {
      id: 'comprehensive',
      name: 'Comprehensive',
      description: 'Broad selection covering all nutrition needs',
      coverage: 25847,
      dataFile: '/filtered-ali-comprehensive.jsonl',
      targetProtein: 200,
      context: 'comprehensive'
    },
    isActive: false,
    onClick: () => {}
  },
  parameters: {
    docs: {
      description: {
        story: 'Category with very high product coverage (25k+ products).'
      }
    }
  }
};

// Mobile viewport demonstration
export const MobileViewport: Story = {
  args: {
    category: sampleCategories[0],
    isActive: true,
    onClick: () => {}
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    },
    docs: {
      description: {
        story: 'Filter card optimized for mobile viewports with touch-friendly targets.'
      }
    }
  }
};

// Interactive states demonstration
export const InteractiveStates: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Inactive State</h3>
        <FilterCard
          category={sampleCategories[0]}
          isActive={false}
          onClick={() => {}}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Active State</h3>
        <FilterCard
          category={sampleCategories[0]}
          isActive={true}
          onClick={() => {}}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Hover State</h3>
        <p className="text-sm text-gray-600 mb-2">Hover over the card to see the hover effect</p>
        <FilterCard
          category={sampleCategories[1]}
          isActive={false}
          onClick={() => {}}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of different interactive states: inactive, active, and hover effects.'
      }
    }
  }
};

// Accessibility demonstration
export const Accessibility: Story = {
  args: {
    category: sampleCategories[0],
    isActive: true,
    onClick: () => {}
  },
  parameters: {
    docs: {
      description: {
        story: `
Accessibility features demonstrated:
- Proper ARIA labels with full context
- Keyboard navigation support (Tab, Enter, Space)
- Focus-visible indicators
- Screen reader friendly descriptions
- Semantic HTML structure

Try navigating with keyboard or screen reader to test accessibility.
        `
      }
    }
  }
};

// Custom styling
export const CustomStyling: Story = {
  args: {
    category: sampleCategories[2],
    isActive: false,
    onClick: () => {},
    className: 'border-2 border-purple-500 shadow-lg hover:shadow-purple-200'
  },
  parameters: {
    docs: {
      description: {
        story: 'Filter card with custom styling applied via className prop.'
      }
    }
  }
};

// Responsive grid layout
export const ResponsiveGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {sampleCategories.map((category, index) => (
        <FilterCard
          key={category.id}
          category={category}
          isActive={index === 2} // Third one active
          onClick={() => {}}
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Responsive grid layout showing how cards adapt to different screen sizes (resize browser to see effect).'
      }
    }
  }
};
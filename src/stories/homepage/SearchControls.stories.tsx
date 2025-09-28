/**
 * SearchControls Storybook Stories
 *
 * Stories for search and sort controls with debounced search functionality
 * Demonstrates mobile-optimized layout and accessibility features
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
// Actions are now handled by argTypes - using simple functions instead
import { useState } from 'react';
import { SearchControls } from '../../components/homepage/SearchControls';

const meta: Meta<typeof SearchControls> = {
  title: 'Homepage/SearchControls',
  component: SearchControls,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Search and sort controls for the homepage product list. Features:
- Debounced search input with 300ms delay
- Sort dropdown with multiple options
- Real-time result count display
- Mobile-first responsive layout
- Clear search functionality
- Accessibility support with ARIA labels

**Mobile Optimizations:**
- Full-width inputs on mobile
- Touch-friendly minimum 44px targets
- Stacked layout on small screens
- Optimized spacing and typography
        `
      }
    }
  },
  argTypes: {
    searchQuery: {
      description: 'Current search query value',
      control: { type: 'text' }
    },
    onSearchChange: {
      description: 'Callback when search query changes',
      action: 'search-changed'
    },
    sortBy: {
      description: 'Current sort option',
      control: {
        type: 'select',
        options: [
          'protein-desc',
          'protein-asc',
          'price-asc',
          'price-desc',
          'health-grade',
          'calories-asc',
          'calories-desc',
          'name'
        ]
      }
    },
    sortDirection: {
      description: 'Current sort direction',
      control: { type: 'select', options: ['asc', 'desc'] }
    },
    onSortChange: {
      description: 'Callback when sort option changes',
      action: 'sort-changed'
    },
    resultCount: {
      description: 'Number of results to display (-1 for loading)',
      control: { type: 'number', min: -1, max: 50000 }
    },
    className: {
      description: 'Additional CSS classes',
      control: { type: 'text' }
    }
  }
};

export default meta;
type Story = StoryObj<typeof SearchControls>;

// Default state
export const Default: Story = {
  args: {
    searchQuery: '',
    onSearchChange: () => {},
    sortBy: 'protein-desc',
    sortDirection: 'desc',
    onSortChange: () => {},
    resultCount: 11379
  }
};

// With search query
export const WithSearch: Story = {
  args: {
    searchQuery: 'chicken breast',
    onSearchChange: () => {},
    sortBy: 'protein-desc',
    sortDirection: 'desc',
    onSortChange: () => {},
    resultCount: 234
  },
  parameters: {
    docs: {
      description: {
        story: 'Search controls with an active search query showing the clear button.'
      }
    }
  }
};

// Loading state
export const Loading: Story = {
  args: {
    searchQuery: 'protein powder',
    onSearchChange: () => {},
    sortBy: 'price-asc',
    sortDirection: 'asc',
    onSortChange: () => {},
    resultCount: -1 // -1 indicates loading
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state showing "Searching..." instead of result count.'
      }
    }
  }
};

// No results
export const NoResults: Story = {
  args: {
    searchQuery: 'unicorn protein',
    onSearchChange: () => {},
    sortBy: 'name',
    sortDirection: 'asc',
    onSortChange: () => {},
    resultCount: 0
  },
  parameters: {
    docs: {
      description: {
        story: 'State when search returns no results.'
      }
    }
  }
};

// Different sort options
export const SortByPrice: Story = {
  args: {
    searchQuery: '',
    onSearchChange: () => {},
    sortBy: 'price-asc',
    sortDirection: 'asc',
    onSortChange: () => {},
    resultCount: 8942
  },
  parameters: {
    docs: {
      description: {
        story: 'Sorted by price (ascending) - useful for budget-conscious users.'
      }
    }
  }
};

export const SortByHealthGrade: Story = {
  args: {
    searchQuery: '',
    onSearchChange: () => {},
    sortBy: 'health-grade',
    sortDirection: 'desc',
    onSortChange: () => {},
    resultCount: 7456
  },
  parameters: {
    docs: {
      description: {
        story: 'Sorted by health grade - showing healthiest products first.'
      }
    }
  }
};

// Interactive state management
export const Interactive: Story = {
  render: function InteractiveSearchControls() {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<string>('protein-desc');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [resultCount, setResultCount] = useState(11379);

    const handleSearchChange = (query: string) => {
      setSearchQuery(query);
      // Mock function call

      // Simulate result count changes
      if (query === '') {
        setResultCount(11379);
      } else if (query.length > 10) {
        setResultCount(0);
      } else {
        setResultCount(Math.floor(Math.random() * 1000) + 50);
      }
    };

    const handleSortChange = (newSortBy: string, newDirection: 'asc' | 'desc') => {
      setSortBy(newSortBy);
      setSortDirection(newDirection);
      // Mock function call
    };

    return (
      <SearchControls
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        resultCount={resultCount}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Fully interactive search controls. Try typing different search terms and changing sort options.'
      }
    }
  }
};

// Mobile viewport
export const MobileViewport: Story = {
  args: {
    searchQuery: 'whey protein',
    onSearchChange: () => {},
    sortBy: 'protein-desc',
    sortDirection: 'desc',
    onSortChange: () => {},
    resultCount: 1247
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    },
    docs: {
      description: {
        story: 'Search controls optimized for mobile viewport with stacked layout.'
      }
    }
  }
};

// Tablet viewport
export const TabletViewport: Story = {
  args: {
    searchQuery: 'greek yogurt',
    onSearchChange: () => {},
    sortBy: 'calories-asc',
    sortDirection: 'asc',
    onSortChange: () => {},
    resultCount: 456
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet'
    },
    docs: {
      description: {
        story: 'Search controls on tablet viewport showing the transition to horizontal layout.'
      }
    }
  }
};

// Large result count
export const LargeResultCount: Story = {
  args: {
    searchQuery: 'protein',
    onSearchChange: () => {},
    sortBy: 'protein-desc',
    sortDirection: 'desc',
    onSortChange: () => {},
    resultCount: 25847
  },
  parameters: {
    docs: {
      description: {
        story: 'Handling large result counts with proper number formatting.'
      }
    }
  }
};

// Custom styling
export const CustomStyling: Story = {
  args: {
    searchQuery: 'salmon',
    onSearchChange: () => {},
    sortBy: 'health-grade',
    sortDirection: 'desc',
    onSortChange: () => {},
    resultCount: 89,
    className: 'bg-blue-50 p-4 rounded-lg border-2 border-blue-200'
  },
  parameters: {
    docs: {
      description: {
        story: 'Search controls with custom styling applied via className prop.'
      }
    }
  }
};

// Accessibility demonstration
export const Accessibility: Story = {
  args: {
    searchQuery: 'egg whites',
    onSearchChange: () => {},
    sortBy: 'protein-desc',
    sortDirection: 'desc',
    onSortChange: () => {},
    resultCount: 167
  },
  parameters: {
    docs: {
      description: {
        story: `
Accessibility features demonstrated:
- Proper ARIA labels and descriptions
- Live region for result count updates
- Keyboard navigation support
- Screen reader friendly form controls
- Focus management and visual indicators

Try navigating with keyboard or screen reader to test accessibility.
        `
      }
    }
  }
};

// Debounced search demonstration
export const DebouncedSearch: Story = {
  render: function DebouncedSearchDemo() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [resultCount, setResultCount] = useState(11379);

    const handleSearchChange = (query: string) => {
      setSearchQuery(query);
      setIsSearching(true);

      // Simulate debounced search
      setTimeout(() => {
        setIsSearching(false);
        setResultCount(query ? Math.floor(Math.random() * 500) + 10 : 11379);
        // Mock function call
      }, 300);
    };

    return (
      <div className="space-y-4">
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Debounced Search Demo</h3>
          <p className="text-sm text-yellow-700">
            Type quickly to see the debounced search in action. The search executes 300ms after you stop typing.
          </p>
        </div>

        <SearchControls
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={() => {}}
          resultCount={isSearching ? -1 : resultCount}
        />

        <div className="text-sm text-gray-600">
          Status: {isSearching ? 'Searching...' : 'Ready'}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of the debounced search functionality with visual feedback.'
      }
    }
  }
};
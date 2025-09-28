/**
 * CategoryTree Storybook Stories
 *
 * Interactive documentation for the CategoryTree component
 * Following constitutional principles for component composition
 */

import type { Meta, StoryObj } from '@storybook/react';
import { CategoryTree } from '../../components/category-tree/CategoryTree';
import type { CategoryNode } from '../../types/category-tree';

// Sample category tree data for Storybook stories
const sampleCategoryTree: CategoryNode[] = [
  {
    name: 'Bakkerij',
    path: ['Bakkerij'],
    breadcrumbs: 'Bakkerij',
    depth: 1,
    productCount: 156,
    isExpanded: false,
    isSelected: false,
    isVisible: true,
    children: [
      {
        name: 'Afbakbrood',
        path: ['Bakkerij', 'Afbakbrood'],
        breadcrumbs: 'Bakkerij > Afbakbrood',
        depth: 2,
        productCount: 89,
        isExpanded: false,
        isSelected: false,
        isVisible: true,
        children: [
          {
            name: 'Stokbrood en ciabatta',
            path: ['Bakkerij', 'Afbakbrood', 'Stokbrood en ciabatta'],
            breadcrumbs: 'Bakkerij > Afbakbrood > Stokbrood en ciabatta',
            depth: 3,
            productCount: 23,
            isExpanded: false,
            isSelected: false,
            isVisible: true,
            children: [],
          },
          {
            name: 'Croissants',
            path: ['Bakkerij', 'Afbakbrood', 'Croissants'],
            breadcrumbs: 'Bakkerij > Afbakbrood > Croissants',
            depth: 3,
            productCount: 18,
            isExpanded: false,
            isSelected: false,
            isVisible: true,
            children: [],
          },
        ],
      },
      {
        name: 'Brood',
        path: ['Bakkerij', 'Brood'],
        breadcrumbs: 'Bakkerij > Brood',
        depth: 2,
        productCount: 67,
        isExpanded: false,
        isSelected: false,
        isVisible: true,
        children: [
          {
            name: 'Volkoren brood',
            path: ['Bakkerij', 'Brood', 'Volkoren brood'],
            breadcrumbs: 'Bakkerij > Brood > Volkoren brood',
            depth: 3,
            productCount: 34,
            isExpanded: false,
            isSelected: false,
            isVisible: true,
            children: [],
          },
        ],
      },
    ],
  },
  {
    name: 'Zuivel, eieren, boter',
    path: ['Zuivel, eieren, boter'],
    breadcrumbs: 'Zuivel, eieren, boter',
    depth: 1,
    productCount: 234,
    isExpanded: false,
    isSelected: false,
    isVisible: true,
    children: [
      {
        name: 'Yoghurt en kwark',
        path: ['Zuivel, eieren, boter', 'Yoghurt en kwark'],
        breadcrumbs: 'Zuivel, eieren, boter > Yoghurt en kwark',
        depth: 2,
        productCount: 128,
        isExpanded: false,
        isSelected: false,
        isVisible: true,
        children: [
          {
            name: 'Yoghurt',
            path: ['Zuivel, eieren, boter', 'Yoghurt en kwark', 'Yoghurt'],
            breadcrumbs: 'Zuivel, eieren, boter > Yoghurt en kwark > Yoghurt',
            depth: 3,
            productCount: 89,
            isExpanded: false,
            isSelected: false,
            isVisible: true,
            children: [
              {
                name: 'Yoghurt met smaak',
                path: ['Zuivel, eieren, boter', 'Yoghurt en kwark', 'Yoghurt', 'Yoghurt met smaak'],
                breadcrumbs: 'Zuivel, eieren, boter > Yoghurt en kwark > Yoghurt > Yoghurt met smaak',
                depth: 4,
                productCount: 45,
                isExpanded: false,
                isSelected: false,
                isVisible: true,
                children: [],
              },
              {
                name: 'Griekse yoghurt',
                path: ['Zuivel, eieren, boter', 'Yoghurt en kwark', 'Yoghurt', 'Griekse yoghurt'],
                breadcrumbs: 'Zuivel, eieren, boter > Yoghurt en kwark > Yoghurt > Griekse yoghurt',
                depth: 4,
                productCount: 32,
                isExpanded: false,
                isSelected: false,
                isVisible: true,
                children: [],
              },
            ],
          },
        ],
      },
      {
        name: 'Eieren',
        path: ['Zuivel, eieren, boter', 'Eieren'],
        breadcrumbs: 'Zuivel, eieren, boter > Eieren',
        depth: 2,
        productCount: 45,
        isExpanded: false,
        isSelected: false,
        isVisible: true,
        children: [],
      },
    ],
  },
  {
    name: 'Diepvries',
    path: ['Diepvries'],
    breadcrumbs: 'Diepvries',
    depth: 1,
    productCount: 187,
    isExpanded: false,
    isSelected: false,
    isVisible: true,
    children: [
      {
        name: 'Diepvries aardappelproducten',
        path: ['Diepvries', 'Diepvries aardappelproducten'],
        breadcrumbs: 'Diepvries > Diepvries aardappelproducten',
        depth: 2,
        productCount: 67,
        isExpanded: false,
        isSelected: false,
        isVisible: true,
        children: [
          {
            name: 'Friet',
            path: ['Diepvries', 'Diepvries aardappelproducten', 'Friet'],
            breadcrumbs: 'Diepvries > Diepvries aardappelproducten > Friet',
            depth: 3,
            productCount: 34,
            isExpanded: false,
            isSelected: false,
            isVisible: true,
            children: [],
          },
          {
            name: 'Aardappelballetjes',
            path: ['Diepvries', 'Diepvries aardappelproducten', 'Aardappelballetjes'],
            breadcrumbs: 'Diepvries > Diepvries aardappelproducten > Aardappelballetjes',
            depth: 3,
            productCount: 23,
            isExpanded: false,
            isSelected: false,
            isVisible: true,
            children: [],
          },
        ],
      },
    ],
  },
];

const meta: Meta<typeof CategoryTree> = {
  title: 'Category Tree/CategoryTree',
  component: CategoryTree,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# CategoryTree Component

Interactive hierarchical category navigation based on Dutch supermarket product data.

## Features
- **Tree View**: Hierarchical navigation with expand/collapse
- **List View**: Flat list with full category paths
- **Search**: Filter categories by name or path
- **Sorting**: Multiple sort options (name, product count, depth)
- **Product Counts**: Display number of products per category
- **Responsive**: Mobile-first design with proper accessibility
- **Virtual Scrolling**: Performance optimization for large datasets

## Usage
Built from product categoryTree data using the buildCategoryTree utility.
        `,
      },
    },
  },
  argTypes: {
    view: {
      control: 'radio',
      options: ['tree', 'list'],
      description: 'Display mode for the category tree',
    },
    sortBy: {
      control: 'select',
      options: [
        'name-asc',
        'name-desc',
        'product-count-desc',
        'product-count-asc',
        'depth-asc',
        'depth-desc',
      ],
      description: 'Sort categories by the specified criteria',
    },
    showProductCounts: {
      control: 'boolean',
      description: 'Show product count badges next to category names',
    },
    showEmptyCategories: {
      control: 'boolean',
      description: 'Include categories with zero products',
    },
    collapsedByDefault: {
      control: 'boolean',
      description: 'Start with all nodes collapsed',
    },
    virtualScrolling: {
      control: 'boolean',
      description: 'Enable virtual scrolling for performance',
    },
  },
  args: {
    categories: sampleCategoryTree,
    onCategorySelect: (category) => {
      console.log('Category selected:', category);
    },
    view: 'tree',
    sortBy: 'product-count-desc',
    showProductCounts: true,
    showEmptyCategories: true,
    collapsedByDefault: false,
    virtualScrolling: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default tree view story
export const Default: Story = {
  name: 'Default Tree View',
  args: {},
};

// List view story
export const ListView: Story = {
  name: 'List View',
  args: {
    view: 'list',
  },
};

// Collapsed by default
export const CollapsedByDefault: Story = {
  name: 'Collapsed by Default',
  args: {
    collapsedByDefault: true,
  },
};

// Hide product counts
export const WithoutProductCounts: Story = {
  name: 'Without Product Counts',
  args: {
    showProductCounts: false,
  },
};

// Hide empty categories
export const WithoutEmptyCategories: Story = {
  name: 'Without Empty Categories',
  args: {
    showEmptyCategories: false,
  },
};

// Sort by name alphabetically
export const SortedByName: Story = {
  name: 'Sorted by Name (A-Z)',
  args: {
    sortBy: 'name-asc',
  },
};

// Virtual scrolling enabled
export const WithVirtualScrolling: Story = {
  name: 'With Virtual Scrolling',
  args: {
    virtualScrolling: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Enables virtual scrolling for better performance with large category trees.',
      },
    },
  },
};

// Minimal configuration
export const Minimal: Story = {
  name: 'Minimal Configuration',
  args: {
    showProductCounts: false,
    showEmptyCategories: false,
    collapsedByDefault: true,
    view: 'list',
    sortBy: 'name-asc',
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal configuration with list view, no counts, and alphabetical sorting.',
      },
    },
  },
};

// Empty state (no categories)
export const EmptyState: Story = {
  name: 'Empty State',
  args: {
    categories: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows loading skeleton when no categories are available.',
      },
    },
  },
};
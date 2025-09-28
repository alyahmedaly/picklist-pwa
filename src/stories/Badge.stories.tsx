import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../components/ui/badge';

const meta: Meta<typeof Badge> = {
  title: 'Design System/UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'secondary',
        'destructive',
        'outline',
        'protein-high',
        'protein-medium',
        'protein-low',
        'health-A',
        'health-B',
        'health-C',
        'health-D',
        'health-E',
        'halal-confirmed',
        'halal-questionable',
        'halal-prohibited'
      ],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    shape: {
      control: 'select',
      options: ['default', 'rounded', 'pill'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants
export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Error',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

// Protein variants
export const ProteinHigh: Story = {
  args: {
    variant: 'protein-high',
    children: '25g+',
  },
};

export const ProteinMedium: Story = {
  args: {
    variant: 'protein-medium',
    children: '15-25g',
  },
};

export const ProteinLow: Story = {
  args: {
    variant: 'protein-low',
    children: '<15g',
  },
};

// Health grade variants
export const HealthGradeA: Story = {
  args: {
    variant: 'health-A',
    children: 'A',
  },
};

export const HealthGradeB: Story = {
  args: {
    variant: 'health-B',
    children: 'B',
  },
};

export const HealthGradeC: Story = {
  args: {
    variant: 'health-C',
    children: 'C',
  },
};

export const HealthGradeD: Story = {
  args: {
    variant: 'health-D',
    children: 'D',
  },
};

export const HealthGradeE: Story = {
  args: {
    variant: 'health-E',
    children: 'E',
  },
};

// Halal status variants
export const HalalConfirmed: Story = {
  args: {
    variant: 'halal-confirmed',
    children: 'Halal ✓',
  },
};

export const HalalQuestionable: Story = {
  args: {
    variant: 'halal-questionable',
    children: 'Check ?',
  },
};

export const HalalProhibited: Story = {
  args: {
    variant: 'halal-prohibited',
    children: 'Haram ✗',
  },
};

// Size variants
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    children: 'Medium',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
};

// Shape variants
export const Rounded: Story = {
  args: {
    shape: 'rounded',
    children: 'Rounded',
  },
};

export const Pill: Story = {
  args: {
    shape: 'pill',
    children: 'Pill Shape',
  },
};

// Real-world examples
export const NutritionLabels: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="protein-high">High Protein</Badge>
      <Badge variant="health-A">Grade A</Badge>
      <Badge variant="halal-confirmed">Halal</Badge>
      <Badge variant="outline">Low Carb</Badge>
      <Badge variant="secondary">Organic</Badge>
    </div>
  ),
};

export const ProductStatus: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Product Quality</h4>
        <div className="flex gap-2">
          <Badge variant="health-A">Excellent</Badge>
          <Badge variant="health-B">Very Good</Badge>
          <Badge variant="health-C">Good</Badge>
          <Badge variant="health-D">Fair</Badge>
          <Badge variant="health-E">Poor</Badge>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Dietary Information</h4>
        <div className="flex gap-2">
          <Badge variant="halal-confirmed" shape="pill">Halal Certified</Badge>
          <Badge variant="outline" shape="pill">Kosher</Badge>
          <Badge variant="secondary" shape="pill">Vegetarian</Badge>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Nutritional Highlights</h4>
        <div className="flex gap-2">
          <Badge variant="protein-high" size="sm">25g Protein</Badge>
          <Badge variant="outline" size="sm">Low Sugar</Badge>
          <Badge variant="secondary" size="sm">High Fiber</Badge>
          <Badge variant="destructive" size="sm">High Sodium</Badge>
        </div>
      </div>
    </div>
  ),
};

export const SizeComparison: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge size="sm">Small</Badge>
        <Badge size="md">Medium</Badge>
        <Badge size="lg">Large</Badge>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="protein-high" size="sm">25g</Badge>
        <Badge variant="protein-high" size="md">25g Protein</Badge>
        <Badge variant="protein-high" size="lg">25g High Protein</Badge>
      </div>
    </div>
  ),
};

export const ShapeComparison: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge shape="default">Default</Badge>
        <Badge shape="rounded">Rounded</Badge>
        <Badge shape="pill">Pill Shape</Badge>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="halal-confirmed" shape="default">Halal</Badge>
        <Badge variant="halal-confirmed" shape="rounded">Halal</Badge>
        <Badge variant="halal-confirmed" shape="pill">Halal Certified</Badge>
      </div>
    </div>
  ),
};

// Complete showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Basic Variants</h3>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Protein Levels</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="protein-high">High (25g+)</Badge>
          <Badge variant="protein-medium">Medium (15-25g)</Badge>
          <Badge variant="protein-low">Low (&lt;15g)</Badge>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Health Grades</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="health-A">Grade A</Badge>
          <Badge variant="health-B">Grade B</Badge>
          <Badge variant="health-C">Grade C</Badge>
          <Badge variant="health-D">Grade D</Badge>
          <Badge variant="health-E">Grade E</Badge>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Halal Status</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="halal-confirmed">Confirmed</Badge>
          <Badge variant="halal-questionable">Questionable</Badge>
          <Badge variant="halal-prohibited">Prohibited</Badge>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Sizes & Shapes</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge size="sm">Small</Badge>
            <Badge size="md">Medium</Badge>
            <Badge size="lg">Large</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge shape="default">Default</Badge>
            <Badge shape="rounded">Rounded</Badge>
            <Badge shape="pill">Pill</Badge>
          </div>
        </div>
      </div>
    </div>
  ),
};
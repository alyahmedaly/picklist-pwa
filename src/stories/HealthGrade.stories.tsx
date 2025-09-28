import type { Meta, StoryObj } from '@storybook/react-vite';
import { HealthGrade } from '../components/nutrition/health-grade';

const meta: Meta<typeof HealthGrade> = {
  title: 'Design System/Nutrition/HealthGrade',
  component: HealthGrade,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    grade: {
      control: 'select',
      options: ['A', 'B', 'C', 'D', 'E'],
    },
    score: {
      control: { type: 'number', min: 0, max: 100 },
    },
    variant: {
      control: 'select',
      options: ['default', 'compact', 'detailed'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    showScore: {
      control: 'boolean',
    },
    showComparison: {
      control: 'boolean',
    },
    showTrend: {
      control: 'boolean',
    },
    animated: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Grade variants
export const GradeA: Story = {
  args: {
    grade: 'A',
    score: 92,
  },
};

export const GradeB: Story = {
  args: {
    grade: 'B',
    score: 78,
  },
};

export const GradeC: Story = {
  args: {
    grade: 'C',
    score: 65,
  },
};

export const GradeD: Story = {
  args: {
    grade: 'D',
    score: 45,
  },
};

export const GradeE: Story = {
  args: {
    grade: 'E',
    score: 25,
  },
};

// Variants
export const Default: Story = {
  args: {
    grade: 'A',
    score: 88,
    variant: 'default',
  },
};

export const Compact: Story = {
  args: {
    grade: 'B',
    score: 74,
    variant: 'compact',
  },
};

export const Detailed: Story = {
  args: {
    grade: 'A',
    score: 91,
    variant: 'detailed',
    showScore: true,
    showComparison: true,
  },
};

// Sizes
export const Small: Story = {
  args: {
    grade: 'A',
    score: 85,
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    grade: 'B',
    score: 72,
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    grade: 'A',
    score: 89,
    size: 'lg',
  },
};

// Features
export const WithScore: Story = {
  args: {
    grade: 'A',
    score: 87,
    showScore: true,
  },
};

export const WithComparison: Story = {
  args: {
    grade: 'B',
    score: 76,
    showComparison: true,
    comparisonText: 'Better than 80% of products',
  },
};

export const WithTrend: Story = {
  args: {
    grade: 'A',
    score: 85,
    showTrend: true,
    trend: 'up',
    trendValue: '+3 points',
  },
};

export const Animated: Story = {
  args: {
    grade: 'A',
    score: 92,
    animated: true,
    showScore: true,
  },
};

// Loading state
export const Loading: Story = {
  args: {
    loading: true,
  },
};

// Real-world examples
export const ExcellentProduct: Story = {
  args: {
    grade: 'A',
    score: 94,
    variant: 'detailed',
    showScore: true,
    showComparison: true,
    comparisonText: 'Top 5% of all products',
    animated: true,
  },
  render: (args) => (
    <div className="space-y-2 text-center">
      <h3 className="text-sm font-medium">Organic Chicken Breast</h3>
      <HealthGrade {...args} />
    </div>
  ),
};

export const GoodChoiceProduct: Story = {
  args: {
    grade: 'B',
    score: 78,
    variant: 'detailed',
    showScore: true,
    showComparison: true,
    comparisonText: 'Better than 70% of products',
  },
  render: (args) => (
    <div className="space-y-2 text-center">
      <h3 className="text-sm font-medium">Greek Yogurt</h3>
      <HealthGrade {...args} />
    </div>
  ),
};

export const AverageProduct: Story = {
  args: {
    grade: 'C',
    score: 58,
    variant: 'detailed',
    showScore: true,
    showComparison: true,
    comparisonText: 'Average nutritional quality',
  },
  render: (args) => (
    <div className="space-y-2 text-center">
      <h3 className="text-sm font-medium">Whole Wheat Bread</h3>
      <HealthGrade {...args} />
    </div>
  ),
};

export const PoorChoiceProduct: Story = {
  args: {
    grade: 'D',
    score: 32,
    variant: 'detailed',
    showScore: true,
    showComparison: true,
    comparisonText: 'Below 30% of products',
  },
  render: (args) => (
    <div className="space-y-2 text-center">
      <h3 className="text-sm font-medium">Processed Snack</h3>
      <HealthGrade {...args} />
    </div>
  ),
};

export const AvoidProduct: Story = {
  args: {
    grade: 'E',
    score: 18,
    variant: 'detailed',
    showScore: true,
    showComparison: true,
    comparisonText: 'Bottom 10% - Consider alternatives',
  },
  render: (args) => (
    <div className="space-y-2 text-center">
      <h3 className="text-sm font-medium">Ultra-Processed Drink</h3>
      <HealthGrade {...args} />
    </div>
  ),
};

// Grade distribution showcase
export const GradeDistribution: Story = {
  render: () => (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <h3 className="text-base font-medium">Health Grade Distribution</h3>
        <p className="text-sm text-muted-foreground">
          Based on nutritional quality score (0-100)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="space-y-3 text-center">
          <HealthGrade grade="A" score={92} size="lg" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Excellent</p>
            <p className="text-xs text-muted-foreground">80-100 points</p>
            <p className="text-xs text-muted-foreground">Top 20%</p>
          </div>
        </div>

        <div className="space-y-3 text-center">
          <HealthGrade grade="B" score={75} size="lg" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Very Good</p>
            <p className="text-xs text-muted-foreground">60-79 points</p>
            <p className="text-xs text-muted-foreground">Next 20%</p>
          </div>
        </div>

        <div className="space-y-3 text-center">
          <HealthGrade grade="C" score={55} size="lg" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Good</p>
            <p className="text-xs text-muted-foreground">40-59 points</p>
            <p className="text-xs text-muted-foreground">Middle 20%</p>
          </div>
        </div>

        <div className="space-y-3 text-center">
          <HealthGrade grade="D" score={35} size="lg" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Fair</p>
            <p className="text-xs text-muted-foreground">20-39 points</p>
            <p className="text-xs text-muted-foreground">Next 20%</p>
          </div>
        </div>

        <div className="space-y-3 text-center">
          <HealthGrade grade="E" score={15} size="lg" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Poor</p>
            <p className="text-xs text-muted-foreground">0-19 points</p>
            <p className="text-xs text-muted-foreground">Bottom 20%</p>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Product comparison
export const ProductComparison: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <h3 className="text-base font-medium">Product Comparison</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2 p-3 border rounded-lg">
          <h4 className="text-sm font-medium">Wild Salmon</h4>
          <HealthGrade
            grade="A"
            score={96}
            variant="detailed"
            showScore={true}
            showComparison={true}
            comparisonText="Exceptional quality"
          />
        </div>

        <div className="space-y-2 p-3 border rounded-lg">
          <h4 className="text-sm font-medium">Quinoa</h4>
          <HealthGrade
            grade="B"
            score={82}
            variant="detailed"
            showScore={true}
            showComparison={true}
            comparisonText="Very nutritious"
          />
        </div>

        <div className="space-y-2 p-3 border rounded-lg">
          <h4 className="text-sm font-medium">White Rice</h4>
          <HealthGrade
            grade="C"
            score={48}
            variant="detailed"
            showScore={true}
            showComparison={true}
            comparisonText="Moderate quality"
          />
        </div>

        <div className="space-y-2 p-3 border rounded-lg">
          <h4 className="text-sm font-medium">Soda</h4>
          <HealthGrade
            grade="E"
            score={12}
            variant="detailed"
            showScore={true}
            showComparison={true}
            comparisonText="Avoid regularly"
          />
        </div>
      </div>
    </div>
  ),
};

// Interactive examples
export const InteractiveExamples: Story = {
  render: () => (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <h3 className="text-base font-medium">Interactive Health Grades</h3>
        <p className="text-sm text-muted-foreground">
          Click to see detailed breakdown
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Protein Bar</h4>
            <HealthGrade grade="B" score={71} showScore={true} />
            <p className="text-xs text-muted-foreground">Tap for details</p>
          </div>
        </button>

        <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Almonds</h4>
            <HealthGrade grade="A" score={88} showScore={true} />
            <p className="text-xs text-muted-foreground">Tap for details</p>
          </div>
        </button>

        <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Energy Drink</h4>
            <HealthGrade grade="D" score={28} showScore={true} />
            <p className="text-xs text-muted-foreground">Tap for details</p>
          </div>
        </button>
      </div>
    </div>
  ),
};

// Size comparison
export const SizeComparison: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <h3 className="text-base font-medium">Size Variants</h3>
      <div className="flex items-center justify-center gap-8">
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">Small</p>
          <HealthGrade grade="A" score={85} size="sm" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">Medium</p>
          <HealthGrade grade="A" score={85} size="md" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">Large</p>
          <HealthGrade grade="A" score={85} size="lg" />
        </div>
      </div>
    </div>
  ),
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <h3 className="text-base font-medium">All Grade Variants</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="w-16 text-sm">Basic:</span>
          <div className="flex gap-2">
            <HealthGrade grade="A" score={92} />
            <HealthGrade grade="B" score={78} />
            <HealthGrade grade="C" score={55} />
            <HealthGrade grade="D" score={35} />
            <HealthGrade grade="E" score={18} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="w-16 text-sm">Compact:</span>
          <div className="flex gap-2">
            <HealthGrade grade="A" score={92} variant="compact" />
            <HealthGrade grade="B" score={78} variant="compact" />
            <HealthGrade grade="C" score={55} variant="compact" />
            <HealthGrade grade="D" score={35} variant="compact" />
            <HealthGrade grade="E" score={18} variant="compact" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="w-16 text-sm">With Score:</span>
          <div className="flex gap-2">
            <HealthGrade grade="A" score={92} showScore={true} />
            <HealthGrade grade="B" score={78} showScore={true} />
            <HealthGrade grade="C" score={55} showScore={true} />
            <HealthGrade grade="D" score={35} showScore={true} />
            <HealthGrade grade="E" score={18} showScore={true} />
          </div>
        </div>
      </div>
    </div>
  ),
};
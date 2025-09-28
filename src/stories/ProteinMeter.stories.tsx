import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProteinMeter } from '../components/nutrition/protein-meter';

const meta: Meta<typeof ProteinMeter> = {
  title: 'Design System/Nutrition/ProteinMeter',
  component: ProteinMeter,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['default', 'daily-progress', 'per-100g'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: 'select',
      options: ['default', 'compact', 'detailed'],
    },
    protein: {
      control: { type: 'number', min: 0, max: 100 },
    },
    servingSize: {
      control: { type: 'number', min: 1, max: 500 },
    },
    target: {
      control: { type: 'number', min: 100, max: 300 },
    },
    showLevel: {
      control: 'boolean',
    },
    showTarget: {
      control: 'boolean',
    },
    showEfficiency: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic protein levels
export const HighProtein: Story = {
  args: {
    protein: 28,
    servingSize: 100,
  },
};

export const MediumProtein: Story = {
  args: {
    protein: 18,
    servingSize: 100,
  },
};

export const LowProtein: Story = {
  args: {
    protein: 8,
    servingSize: 100,
  },
};

// Modes
export const DefaultMode: Story = {
  args: {
    protein: 25,
    servingSize: 100,
    mode: 'default',
  },
};

export const DailyProgressMode: Story = {
  args: {
    protein: 35,
    servingSize: 150,
    mode: 'daily-progress',
    target: 170,
  },
};

export const Per100gMode: Story = {
  args: {
    protein: 40,
    servingSize: 200,
    mode: 'per-100g',
  },
};

// Variants
export const Compact: Story = {
  args: {
    protein: 22,
    servingSize: 100,
    variant: 'compact',
  },
};

export const Detailed: Story = {
  args: {
    protein: 26,
    servingSize: 120,
    variant: 'default',
    showLevel: true,
    showTarget: true,
    showEfficiency: true,
  },
};

// Sizes
export const Small: Story = {
  args: {
    protein: 20,
    servingSize: 100,
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    protein: 24,
    servingSize: 100,
    size: 'lg',
  },
};

// Features
export const WithLevel: Story = {
  args: {
    protein: 28,
    servingSize: 100,
    showLevel: true,
  },
};

export const WithTarget: Story = {
  args: {
    protein: 30,
    servingSize: 150,
    showTarget: true,
    target: 170,
  },
};

export const WithEfficiency: Story = {
  args: {
    protein: 22,
    servingSize: 100,
    showEfficiency: true,
    calories: 150,
  },
};

// Loading state
export const Loading: Story = {
  args: {
    loading: true,
  },
};

// Real-world examples
export const ChickenBreast: Story = {
  args: {
    protein: 31,
    servingSize: 100,
    calories: 165,
    showLevel: true,
    showEfficiency: true,
    variant: 'default',
  },
  render: (args) => (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-center">Chicken Breast (100g)</h3>
      <ProteinMeter {...args} />
    </div>
  ),
};

export const GreekYogurt: Story = {
  args: {
    protein: 10,
    servingSize: 150,
    calories: 100,
    mode: 'daily-progress',
    target: 170,
    showTarget: true,
    variant: 'default',
  },
  render: (args) => (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-center">Greek Yogurt (150g serving)</h3>
      <ProteinMeter {...args} />
    </div>
  ),
};

export const ProteinPowder: Story = {
  args: {
    protein: 25,
    servingSize: 30,
    calories: 120,
    mode: 'per-100g',
    showLevel: true,
    showEfficiency: true,
    variant: 'default',
  },
  render: (args) => (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-center">Protein Powder (30g scoop)</h3>
      <ProteinMeter {...args} />
    </div>
  ),
};

export const Almonds: Story = {
  args: {
    protein: 6,
    servingSize: 30,
    calories: 160,
    variant: 'compact',
    showLevel: true,
  },
  render: (args) => (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-center">Almonds (30g serving)</h3>
      <ProteinMeter {...args} />
    </div>
  ),
};

// Daily progress examples
export const DailyProgressExamples: Story = {
  render: () => (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <h3 className="text-base font-medium">Daily Progress Tracking (170g target)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm text-muted-foreground">Breakfast: Eggs (2 large)</h4>
            <ProteinMeter
              protein={12}
              servingSize={100}
              mode="daily-progress"
              target={170}
              showTarget={true}
            />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm text-muted-foreground">Lunch: Chicken Salad</h4>
            <ProteinMeter
              protein={35}
              servingSize={150}
              mode="daily-progress"
              target={170}
              showTarget={true}
            />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm text-muted-foreground">Snack: Greek Yogurt</h4>
            <ProteinMeter
              protein={15}
              servingSize={150}
              mode="daily-progress"
              target={170}
              showTarget={true}
            />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm text-muted-foreground">Dinner: Salmon</h4>
            <ProteinMeter
              protein={40}
              servingSize={150}
              mode="daily-progress"
              target={170}
              showTarget={true}
            />
          </div>
        </div>
      </div>
    </div>
  ),
};

// Protein level comparison
export const ProteinLevelComparison: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <h3 className="text-base font-medium">Protein Level Comparison (per 100g)</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-protein-high">High Protein (&gt;20g)</h4>
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Chicken Breast</p>
              <ProteinMeter protein={31} servingSize={100} showLevel={true} />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Tuna</p>
              <ProteinMeter protein={28} servingSize={100} showLevel={true} />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Lean Beef</p>
              <ProteinMeter protein={26} servingSize={100} showLevel={true} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-protein-medium">Medium Protein (10-20g)</h4>
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Greek Yogurt</p>
              <ProteinMeter protein={15} servingSize={100} showLevel={true} />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Quinoa</p>
              <ProteinMeter protein={14} servingSize={100} showLevel={true} />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Lentils</p>
              <ProteinMeter protein={18} servingSize={100} showLevel={true} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-protein-low">Low Protein (&lt;10g)</h4>
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Brown Rice</p>
              <ProteinMeter protein={3} servingSize={100} showLevel={true} />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Banana</p>
              <ProteinMeter protein={1} servingSize={100} showLevel={true} />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Spinach</p>
              <ProteinMeter protein={3} servingSize={100} showLevel={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Size comparison
export const SizeComparison: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <h3 className="text-base font-medium">Size Comparison</h3>
      <div className="flex items-center gap-6">
        <div className="space-y-2 text-center">
          <p className="text-xs text-muted-foreground">Small</p>
          <ProteinMeter protein={25} servingSize={100} size="sm" />
        </div>
        <div className="space-y-2 text-center">
          <p className="text-xs text-muted-foreground">Medium</p>
          <ProteinMeter protein={25} servingSize={100} size="md" />
        </div>
        <div className="space-y-2 text-center">
          <p className="text-xs text-muted-foreground">Large</p>
          <ProteinMeter protein={25} servingSize={100} size="lg" />
        </div>
      </div>
    </div>
  ),
};

// All features showcase
export const AllFeatures: Story = {
  render: () => (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <h3 className="text-base font-medium">All Features Showcase</h3>
        <ProteinMeter
          protein={28}
          servingSize={150}
          calories={180}
          target={170}
          mode="daily-progress"
          variant="detailed"
          size="lg"
          showLevel={true}
          showProgress={true}
          showEfficiency={true}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ProteinMeter protein={31} servingSize={100} variant="compact" />
        <ProteinMeter protein={15} servingSize={150} mode="daily-progress" target={170} />
        <ProteinMeter protein={22} servingSize={100} mode="per-100g" showLevel={true} />
      </div>
    </div>
  ),
};
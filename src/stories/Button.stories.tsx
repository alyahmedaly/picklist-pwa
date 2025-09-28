import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Button } from '../components/ui/button';

const meta: Meta<typeof Button> = {
  title: 'Design System/UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
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
      options: ['default', 'sm', 'lg', 'icon'],
    },
    asChild: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
  args: {
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants
export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Button',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link Button',
  },
};

// Nutrition-themed variants
export const ProteinHigh: Story = {
  args: {
    variant: 'protein-high',
    children: 'High Protein (25g+)',
  },
};

export const ProteinMedium: Story = {
  args: {
    variant: 'protein-medium',
    children: 'Good Protein (15-25g)',
  },
};

export const ProteinLow: Story = {
  args: {
    variant: 'protein-low',
    children: 'Low Protein (<15g)',
  },
};

// Health grade variants
export const HealthGradeA: Story = {
  args: {
    variant: 'health-A',
    children: 'Grade A',
  },
};

export const HealthGradeB: Story = {
  args: {
    variant: 'health-B',
    children: 'Grade B',
  },
};

export const HealthGradeC: Story = {
  args: {
    variant: 'health-C',
    children: 'Grade C',
  },
};

export const HealthGradeD: Story = {
  args: {
    variant: 'health-D',
    children: 'Grade D',
  },
};

export const HealthGradeE: Story = {
  args: {
    variant: 'health-E',
    children: 'Grade E',
  },
};

// Halal status variants
export const HalalConfirmed: Story = {
  args: {
    variant: 'halal-confirmed',
    children: '✓ Halal',
  },
};

export const HalalQuestionable: Story = {
  args: {
    variant: 'halal-questionable',
    children: '? Questionable',
  },
};

export const HalalProhibited: Story = {
  args: {
    variant: 'halal-prohibited',
    children: '✗ Haram',
  },
};

// Size variants
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

export const Icon: Story = {
  args: {
    size: 'icon',
    children: '❤️',
  },
};

// States
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

export const DisabledProtein: Story = {
  args: {
    variant: 'protein-high',
    disabled: true,
    children: 'Disabled Protein',
  },
};

// Comprehensive showcase
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 p-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Basic Variants</h3>
        <div className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Protein Variants</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="protein-high">High</Button>
          <Button variant="protein-medium">Medium</Button>
          <Button variant="protein-low">Low</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Health Grades</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="health-A">A</Button>
          <Button variant="health-B">B</Button>
          <Button variant="health-C">C</Button>
          <Button variant="health-D">D</Button>
          <Button variant="health-E">E</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Halal Status</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="halal-confirmed">Confirmed</Button>
          <Button variant="halal-questionable">Questionable</Button>
          <Button variant="halal-prohibited">Prohibited</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Sizes</h3>
        <div className="flex items-center gap-2">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">💪</Button>
        </div>
      </div>
    </div>
  ),
};
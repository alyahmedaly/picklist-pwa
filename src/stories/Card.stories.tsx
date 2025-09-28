import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '../components/ui/card';
import { Button } from '../components/ui/button';

const meta: Meta<typeof Card> = {
  title: 'Design System/UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'nutrition', 'product', 'interactive'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    elevated: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic card variants
export const Default: Story = {
  render: (args) => (
    <Card {...args} className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the card content area where you can put any information.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const Nutrition: Story = {
  args: {
    variant: 'nutrition',
  },
  render: (args) => (
    <Card {...args} className="w-[350px]">
      <CardHeader>
        <CardTitle>Protein Greek Yogurt</CardTitle>
        <CardDescription>High-protein dairy product</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-protein-high">23g</div>
            <div className="text-sm text-muted-foreground">Protein</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">150</div>
            <div className="text-sm text-muted-foreground">Calories</div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="protein-high" className="w-full">Add to Meal</Button>
      </CardFooter>
    </Card>
  ),
};

export const Product: Story = {
  args: {
    variant: 'product',
  },
  render: (args) => (
    <Card {...args} className="w-[350px]">
      <CardHeader>
        <CardTitle>Chicken Breast</CardTitle>
        <CardDescription>Premium lean protein source</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Health Grade</span>
            <Button variant="health-A" size="sm">A</Button>
          </div>
          <div className="flex justify-between">
            <span>Halal Status</span>
            <Button variant="halal-confirmed" size="sm">✓ Confirmed</Button>
          </div>
          <div className="flex justify-between">
            <span>Price</span>
            <span className="font-medium">€2.50/100g</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1">Compare</Button>
        <Button variant="default" className="flex-1">Select</Button>
      </CardFooter>
    </Card>
  ),
};

export const Interactive: Story = {
  args: {
    variant: 'interactive',
  },
  render: (args) => (
    <Card {...args} className="w-[350px] cursor-pointer transition-all hover:scale-105">
      <CardHeader>
        <CardTitle>Daily Protein Target</CardTitle>
        <CardDescription>Track your 170g protein goal</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>120g / 170g</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-protein-high h-2 rounded-full transition-all"
              style={{ width: '70%' }}
            />
          </div>
          <p className="text-xs text-muted-foreground">50g remaining for today</p>
        </div>
      </CardContent>
    </Card>
  ),
};

// Size variants
export const Small: Story = {
  args: {
    size: 'sm',
  },
  render: (args) => (
    <Card {...args} className="w-[280px]">
      <CardHeader>
        <CardTitle className="text-base">Small Card</CardTitle>
        <CardDescription className="text-xs">Compact layout</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Small card content with reduced spacing.</p>
      </CardContent>
    </Card>
  ),
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
  render: (args) => (
    <Card {...args} className="w-[450px]">
      <CardHeader>
        <CardTitle className="text-xl">Large Card</CardTitle>
        <CardDescription>Spacious layout for detailed content</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Large card with extra padding and spacing for comprehensive information display.</p>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold">85</div>
            <div className="text-xs text-muted-foreground">Score</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">25g</div>
            <div className="text-xs text-muted-foreground">Protein</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">€1.20</div>
            <div className="text-xs text-muted-foreground">Price</div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button size="lg" className="w-full">Large Action</Button>
      </CardFooter>
    </Card>
  ),
};

// Elevated variant
export const Elevated: Story = {
  args: {
    elevated: true,
  },
  render: (args) => (
    <Card {...args} className="w-[350px]">
      <CardHeader>
        <CardTitle>Elevated Card</CardTitle>
        <CardDescription>Card with enhanced shadow</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card has elevated styling with enhanced shadow and depth.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

// Complex example
export const ComplexNutritionCard: Story = {
  render: () => (
    <Card variant="nutrition" className="w-[400px]">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Greek Yogurt with Berries</CardTitle>
            <CardDescription>High-protein breakfast option</CardDescription>
          </div>
          <Button variant="halal-confirmed" size="sm">Halal</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-protein-high">23g</div>
              <div className="text-xs text-muted-foreground">Protein</div>
            </div>
            <div>
              <div className="text-xl font-bold">180</div>
              <div className="text-xs text-muted-foreground">Calories</div>
            </div>
            <div>
              <div className="text-xl font-bold">12g</div>
              <div className="text-xs text-muted-foreground">Carbs</div>
            </div>
            <div>
              <div className="text-xl font-bold">8g</div>
              <div className="text-xs text-muted-foreground">Fat</div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">Health Grade</span>
            <Button variant="health-A" size="sm">A</Button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Daily Protein</span>
              <span>14% (23g/170g)</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-1.5">
              <div className="bg-protein-high h-1.5 rounded-full" style={{ width: '14%' }} />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1">Details</Button>
        <Button variant="protein-high" className="flex-1">Add to Meal</Button>
      </CardFooter>
    </Card>
  ),
};

// Showcase all variants
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Default</CardTitle>
        </CardHeader>
        <CardContent>Default card variant</CardContent>
      </Card>

      <Card variant="nutrition" className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Nutrition</CardTitle>
        </CardHeader>
        <CardContent>Nutrition-focused styling</CardContent>
      </Card>

      <Card variant="product" className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Product</CardTitle>
        </CardHeader>
        <CardContent>Product display card</CardContent>
      </Card>

      <Card variant="interactive" className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Interactive</CardTitle>
        </CardHeader>
        <CardContent>Hover and click effects</CardContent>
      </Card>

      <Card size="sm" className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-base">Small</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">Compact size</CardContent>
      </Card>

      <Card elevated className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Elevated</CardTitle>
        </CardHeader>
        <CardContent>Enhanced shadow</CardContent>
      </Card>
    </div>
  ),
};
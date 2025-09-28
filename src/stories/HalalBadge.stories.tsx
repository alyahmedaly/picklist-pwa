import type { Meta, StoryObj } from '@storybook/react-vite';
import { HalalBadge } from '../components/nutrition/halal-badge';

const meta: Meta<typeof HalalBadge> = {
  title: 'Design System/Nutrition/HalalBadge',
  component: HalalBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['confirmed', 'questionable', 'prohibited', 'unknown'],
    },
    variant: {
      control: 'select',
      options: ['default', 'compact', 'minimal', 'icon'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
    },
    responsive: {
      control: 'boolean',
    },
    confidence: {
      control: { type: 'number', min: 0, max: 100 },
    },
    source: {
      control: 'select',
      options: ['ingredient-analysis', 'certification', 'manual-review', 'database'],
    },
    showConfidence: {
      control: 'boolean',
    },
    showSource: {
      control: 'boolean',
    },
    showFlags: {
      control: 'boolean',
    },
    showTimestamp: {
      control: 'boolean',
    },
    locale: {
      control: 'select',
      options: ['en', 'nl', 'ar'],
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

// Status variants
export const Confirmed: Story = {
  args: {
    status: 'confirmed',
    confidence: 95,
  },
};

export const Questionable: Story = {
  args: {
    status: 'questionable',
    confidence: 60,
    flags: ['gelatine', 'alcohol'],
  },
};

export const Prohibited: Story = {
  args: {
    status: 'prohibited',
    confidence: 98,
    flags: ['pork', 'alcohol'],
  },
};

export const Unknown: Story = {
  args: {
    status: 'unknown',
  },
};

// Variants
export const Default: Story = {
  args: {
    status: 'confirmed',
    confidence: 92,
    variant: 'default',
  },
};

export const Compact: Story = {
  args: {
    status: 'confirmed',
    confidence: 87,
    variant: 'compact',
  },
};

export const Minimal: Story = {
  args: {
    status: 'confirmed',
    variant: 'minimal',
  },
};

export const Icon: Story = {
  args: {
    status: 'confirmed',
    variant: 'icon',
  },
};

// Sizes
export const ExtraSmall: Story = {
  args: {
    status: 'confirmed',
    size: 'xs',
  },
};

export const Small: Story = {
  args: {
    status: 'confirmed',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    status: 'confirmed',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    status: 'confirmed',
    size: 'lg',
  },
};

// Features
export const WithConfidence: Story = {
  args: {
    status: 'confirmed',
    confidence: 89,
    showConfidence: true,
  },
};

export const WithSource: Story = {
  args: {
    status: 'confirmed',
    confidence: 94,
    source: 'certification',
    showSource: true,
  },
};

export const WithFlags: Story = {
  args: {
    status: 'questionable',
    confidence: 45,
    flags: ['gelatine', 'emulsifiers'],
    showFlags: true,
  },
};

export const WithTimestamp: Story = {
  args: {
    status: 'confirmed',
    confidence: 91,
    lastVerified: new Date('2024-01-15'),
    showTimestamp: true,
  },
};

export const Responsive: Story = {
  args: {
    status: 'confirmed',
    responsive: true,
  },
};

// Locales
export const English: Story = {
  args: {
    status: 'confirmed',
    confidence: 95,
    locale: 'en',
    showConfidence: true,
  },
};

export const Dutch: Story = {
  args: {
    status: 'confirmed',
    confidence: 95,
    locale: 'nl',
    showConfidence: true,
  },
};

export const Arabic: Story = {
  args: {
    status: 'confirmed',
    confidence: 95,
    locale: 'ar',
    showConfidence: true,
  },
};

// Interactive
export const Clickable: Story = {
  args: {
    status: 'confirmed',
    confidence: 88,
    onClick: () => alert('Badge clicked!'),
  },
};

export const Animated: Story = {
  args: {
    status: 'confirmed',
    confidence: 93,
    animated: true,
  },
};

// Loading state
export const Loading: Story = {
  args: {
    loading: true,
  },
};

// Real-world examples
export const CertifiedProduct: Story = {
  args: {
    status: 'confirmed',
    confidence: 98,
    source: 'certification',
    showConfidence: true,
    showSource: true,
    lastVerified: new Date('2024-01-20'),
    animated: true,
  },
  render: (args) => (
    <div className="space-y-2 text-center">
      <h3 className="text-sm font-medium">Halal Certified Chicken</h3>
      <HalalBadge {...args} />
    </div>
  ),
};

export const QuestionableIngredients: Story = {
  args: {
    status: 'questionable',
    confidence: 35,
    source: 'ingredient-analysis',
    flags: ['gelatine', 'emulsifiers', 'flavoring'],
    showFlags: true,
    showConfidence: true,
    showSource: true,
  },
  render: (args) => (
    <div className="space-y-2 text-center">
      <h3 className="text-sm font-medium">Yogurt with Additives</h3>
      <HalalBadge {...args} />
    </div>
  ),
};

export const ProhibitedProduct: Story = {
  args: {
    status: 'prohibited',
    confidence: 99,
    source: 'ingredient-analysis',
    flags: ['pork gelatine'],
    showFlags: true,
    showConfidence: true,
  },
  render: (args) => (
    <div className="space-y-2 text-center">
      <h3 className="text-sm font-medium">Gummy Bears</h3>
      <HalalBadge {...args} />
    </div>
  ),
};

export const UnknownProduct: Story = {
  args: {
    status: 'unknown',
    source: 'database',
    showSource: true,
  },
  render: (args) => (
    <div className="space-y-2 text-center">
      <h3 className="text-sm font-medium">New Product - Analysis Pending</h3>
      <HalalBadge {...args} />
    </div>
  ),
};

// Status showcase
export const StatusShowcase: Story = {
  render: () => (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <h3 className="text-base font-medium">Halal Status Indicators</h3>
        <p className="text-sm text-muted-foreground">
          Different confidence levels and sources
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-3 p-4 border rounded-lg">
          <h4 className="text-sm font-medium text-center">Confirmed</h4>
          <div className="space-y-2">
            <HalalBadge
              status="confirmed"
              confidence={98}
              source="certification"
              showConfidence={true}
            />
            <p className="text-xs text-muted-foreground text-center">
              Halal certified product
            </p>
          </div>
        </div>

        <div className="space-y-3 p-4 border rounded-lg">
          <h4 className="text-sm font-medium text-center">Questionable</h4>
          <div className="space-y-2">
            <HalalBadge
              status="questionable"
              confidence={45}
              flags={['emulsifiers']}
              showConfidence={true}
            />
            <p className="text-xs text-muted-foreground text-center">
              Needs verification
            </p>
          </div>
        </div>

        <div className="space-y-3 p-4 border rounded-lg">
          <h4 className="text-sm font-medium text-center">Prohibited</h4>
          <div className="space-y-2">
            <HalalBadge
              status="prohibited"
              confidence={99}
              flags={['pork']}
              showConfidence={true}
            />
            <p className="text-xs text-muted-foreground text-center">
              Contains haram ingredients
            </p>
          </div>
        </div>

        <div className="space-y-3 p-4 border rounded-lg">
          <h4 className="text-sm font-medium text-center">Unknown</h4>
          <div className="space-y-2">
            <HalalBadge status="unknown" />
            <p className="text-xs text-muted-foreground text-center">
              Analysis pending
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Source indicators
export const SourceIndicators: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <h3 className="text-base font-medium">Verification Sources</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">High Confidence Sources</h4>
          <div className="space-y-2">
            <HalalBadge
              status="confirmed"
              confidence={98}
              source="certification"
              showSource={true}
              showConfidence={true}
            />
            <HalalBadge
              status="confirmed"
              confidence={92}
              source="manual-review"
              showSource={true}
              showConfidence={true}
            />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Automated Analysis</h4>
          <div className="space-y-2">
            <HalalBadge
              status="questionable"
              confidence={65}
              source="ingredient-analysis"
              showSource={true}
              showConfidence={true}
            />
            <HalalBadge
              status="unknown"
              source="database"
              showSource={true}
            />
          </div>
        </div>
      </div>
    </div>
  ),
};

// Multi-language support
export const MultiLanguage: Story = {
  render: () => (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <h3 className="text-base font-medium">Multi-Language Support</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-center">English</h4>
          <div className="space-y-2">
            <HalalBadge status="confirmed" locale="en" />
            <HalalBadge status="questionable" locale="en" />
            <HalalBadge status="prohibited" locale="en" />
            <HalalBadge status="unknown" locale="en" />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-center">Nederlands</h4>
          <div className="space-y-2">
            <HalalBadge status="confirmed" locale="nl" />
            <HalalBadge status="questionable" locale="nl" />
            <HalalBadge status="prohibited" locale="nl" />
            <HalalBadge status="unknown" locale="nl" />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-center">العربية</h4>
          <div className="space-y-2">
            <HalalBadge status="confirmed" locale="ar" />
            <HalalBadge status="questionable" locale="ar" />
            <HalalBadge status="prohibited" locale="ar" />
            <HalalBadge status="unknown" locale="ar" />
          </div>
        </div>
      </div>
    </div>
  ),
};

// Size and variant combinations
export const SizeVariantMatrix: Story = {
  render: () => (
    <div className="space-y-6 p-4">
      <h3 className="text-base font-medium">Size & Variant Combinations</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Default Variant</h4>
          <div className="flex items-center gap-4">
            <HalalBadge status="confirmed" size="xs" />
            <HalalBadge status="confirmed" size="sm" />
            <HalalBadge status="confirmed" size="md" />
            <HalalBadge status="confirmed" size="lg" />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Compact Variant</h4>
          <div className="flex items-center gap-4">
            <HalalBadge status="confirmed" variant="compact" size="xs" />
            <HalalBadge status="confirmed" variant="compact" size="sm" />
            <HalalBadge status="confirmed" variant="compact" size="md" />
            <HalalBadge status="confirmed" variant="compact" size="lg" />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Minimal Variant</h4>
          <div className="flex items-center gap-4">
            <HalalBadge status="confirmed" variant="minimal" size="xs" />
            <HalalBadge status="confirmed" variant="minimal" size="sm" />
            <HalalBadge status="confirmed" variant="minimal" size="md" />
            <HalalBadge status="confirmed" variant="minimal" size="lg" />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Icon Variant</h4>
          <div className="flex items-center gap-4">
            <HalalBadge status="confirmed" variant="icon" size="xs" />
            <HalalBadge status="confirmed" variant="icon" size="sm" />
            <HalalBadge status="confirmed" variant="icon" size="md" />
            <HalalBadge status="confirmed" variant="icon" size="lg" />
          </div>
        </div>
      </div>
    </div>
  ),
};

// Complete feature showcase
export const CompleteShowcase: Story = {
  render: () => (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <h3 className="text-base font-medium">Complete Feature Showcase</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium">High Confidence Products</h4>
          <div className="space-y-3">
            <HalalBadge
              status="confirmed"
              confidence={98}
              source="certification"
              showConfidence={true}
              showSource={true}
              lastVerified={new Date('2024-01-20')}
              animated={true}
            />
            <HalalBadge
              status="confirmed"
              confidence={94}
              source="manual-review"
              showConfidence={true}
              showSource={true}
              variant="detailed"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Products Needing Attention</h4>
          <div className="space-y-3">
            <HalalBadge
              status="questionable"
              confidence={42}
              source="ingredient-analysis"
              flags={['gelatine', 'emulsifiers']}
              showFlags={true}
              showConfidence={true}
              showSource={true}
            />
            <HalalBadge
              status="prohibited"
              confidence={99}
              source="ingredient-analysis"
              flags={['pork gelatine']}
              showFlags={true}
              showConfidence={true}
            />
          </div>
        </div>
      </div>
    </div>
  ),
};
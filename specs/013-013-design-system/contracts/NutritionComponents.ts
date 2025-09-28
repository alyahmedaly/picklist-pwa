/**
 * Nutrition Component Interface Contracts
 *
 * Defines Ali-specific components optimized for nutrition data display
 * and dietary requirement tracking (halal, protein goals, health scoring).
 */

import React from 'react';
import { BaseComponentProps, AccessibilityProps } from './BaseComponents';

/**
 * Nutrition data structure
 */
export interface Nutrition {
  /** Protein content in grams per 100g */
  protein: number;

  /** Calorie content per 100g */
  calories: number;

  /** Carbohydrate content in grams per 100g */
  carbs: number;

  /** Fat content in grams per 100g */
  fat: number;

  /** Fiber content in grams per 100g (optional) */
  fiber?: number;

  /** Sodium content in mg per 100g (optional) */
  sodium?: number;
}

/**
 * Protein meter component for tracking daily protein target
 */
export interface ProteinMeterProps extends BaseComponentProps, AccessibilityProps {
  /** Current protein intake in grams */
  current: number;

  /** Daily protein target in grams (default: 170g for Ali) */
  target: number;

  /** Show percentage alongside grams */
  showPercentage?: boolean;

  /** Show remaining amount */
  showRemaining?: boolean;

  /** Size variant */
  size?: 'sm' | 'md' | 'lg';

  /** Color theme */
  theme?: 'default' | 'success' | 'warning' | 'minimal';

  /** Animation enabled */
  animated?: boolean;

  /** Custom label */
  label?: string;
}

/**
 * Nutrition card component for displaying comprehensive nutrition data
 */
export interface NutritionCardProps extends BaseComponentProps {
  /** Nutrition data to display */
  nutrition: Nutrition;

  /** Product name */
  productName: string;

  /** Serving size information */
  servingSize?: {
    amount: number;
    unit: string; // 'g', 'ml', 'piece', etc.
  };

  /** Highlight specific nutrients */
  highlights?: Array<keyof Nutrition>;

  /** Compact display mode */
  compact?: boolean;

  /** Show per serving calculations */
  showPerServing?: boolean;

  /** Additional nutrition facts */
  additionalFacts?: Record<string, { value: number; unit: string }>;
}

/**
 * Health grade component for A-E scoring display
 */
export interface HealthGradeProps extends BaseComponentProps, AccessibilityProps {
  /** Health grade (A-E) */
  grade: 'A' | 'B' | 'C' | 'D' | 'E';

  /** Numeric score (0-100) */
  score?: number;

  /** Grade explanation */
  explanation?: string;

  /** Size variant */
  size?: 'sm' | 'md' | 'lg';

  /** Show full explanation on hover/click */
  expandable?: boolean;

  /** Color coding disabled (for accessibility) */
  colorBlind?: boolean;

  /** Icon variant */
  iconType?: 'letter' | 'symbol' | 'both';
}

/**
 * Halal badge component with cultural sensitivity
 */
export interface HalalBadgeProps extends BaseComponentProps, AccessibilityProps {
  /** Halal status */
  status: 'confirmed' | 'questionable' | 'prohibited';

  /** Confidence level (0-100) */
  confidence?: number;

  /** Certification details */
  certification?: {
    authority: string;
    certificateNumber?: string;
    expiryDate?: string;
  };

  /** Size variant */
  size?: 'sm' | 'md' | 'lg';

  /** Display style */
  variant?: 'badge' | 'card' | 'minimal';

  /** Show confidence score */
  showConfidence?: boolean;

  /** Cultural context (language/region) */
  locale?: 'en' | 'ar' | 'nl';
}

/**
 * Product card component combining nutrition + pricing + health data
 */
export interface ProductCardProps extends BaseComponentProps {
  /** Product basic information */
  product: {
    id: string;
    name: string;
    category: string;
    imageUrl?: string;
  };

  /** Nutrition information */
  nutrition: Nutrition;

  /** Pricing information */
  pricing: {
    pricePerUnit: number;
    unit: string; // '100g', 'kg', 'piece'
    currency: string;
    discounted?: boolean;
    originalPrice?: number;
  };

  /** Health scoring */
  healthScore: {
    grade: 'A' | 'B' | 'C' | 'D' | 'E';
    score: number;
  };

  /** Halal status */
  halalStatus: 'confirmed' | 'questionable' | 'prohibited';

  /** Card interaction handlers */
  onCardClick?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  onFavorite?: (productId: string) => void;

  /** Display preferences */
  layout?: 'vertical' | 'horizontal' | 'compact';
  showNutritionSummary?: boolean;
  showPriceComparison?: boolean;
  highlightProtein?: boolean;

  /** Context for Ali's specific needs */
  aliContext?: {
    proteinContribution: number; // Contribution to 170g daily target
    fitsTrainingDay: boolean;
    fitsRestDay: boolean;
    budgetFriendly: boolean;
  };
}

/**
 * Nutrition comparison component for side-by-side product analysis
 */
export interface NutritionComparisonProps extends BaseComponentProps {
  /** Products to compare (max 3) */
  products: Array<{
    id: string;
    name: string;
    nutrition: Nutrition;
    healthGrade: 'A' | 'B' | 'C' | 'D' | 'E';
  }>;

  /** Nutrients to compare */
  compareNutrients?: Array<keyof Nutrition>;

  /** Highlight best values */
  highlightBest?: boolean;

  /** Show per serving vs per 100g */
  servingMode?: 'per100g' | 'perServing';

  /** Serving sizes for each product */
  servingSizes?: Array<{ amount: number; unit: string }>;
}

/**
 * Dietary restrictions filter component
 */
export interface DietaryFilterProps extends BaseComponentProps {
  /** Available dietary options */
  options: Array<{
    id: string;
    label: string;
    description: string;
    icon?: React.ReactNode;
  }>;

  /** Selected dietary restrictions */
  selected: string[];

  /** Change handler */
  onChange: (selected: string[]) => void;

  /** Layout style */
  layout?: 'grid' | 'list' | 'chips';

  /** Allow multiple selections */
  multiple?: boolean;

  /** Show descriptions */
  showDescriptions?: boolean;
}
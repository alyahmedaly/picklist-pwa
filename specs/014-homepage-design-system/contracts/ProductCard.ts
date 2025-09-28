/**
 * ProductCard Component Contract
 *
 * Individual product display component with nutrition metrics, pricing, and
 * Ali-specific optimization scores. Supports compact and detailed variants.
 */

import { ProductDisplay } from './ProductList';

export interface ProductCardProps {
  product: ProductDisplay;
  onClick?: (product: ProductDisplay) => void;
  variant?: 'compact' | 'detailed';
  showContextInfo?: boolean;
  showImage?: boolean;
  loading?: boolean;
  className?: string;
}

// Component layout variants
export interface ProductCardVariants {
  compact: {
    height: number; // 80px
    showImage: false;
    showContextScore: boolean;
    maxNameLength: number; // 40 chars
  };
  detailed: {
    height: number; // 120px
    showImage: boolean;
    showContextScore: boolean;
    showNutritionBreakdown: boolean;
    maxNameLength: number; // 60 chars
  };
}

// Component behavior contracts
export interface ProductCardBehavior {
  // Visual states
  renderCompactLayout(): React.ReactElement;
  renderDetailedLayout(): React.ReactElement;
  renderLoadingState(): React.ReactElement;

  // Content formatting
  formatProteinContent(protein: number): string;
  formatPriceDisplay(price: number): string;
  formatDailyContribution(contribution: string): string;
  truncateProductName(name: string, maxLength: number): string;

  // Interactive states
  handleClick(): void;
  handleKeyPress(event: React.KeyboardEvent): void;
  renderHoverEffects(): void;

  // Accessibility
  getAriaLabel(): string;
  getTabIndex(): number;
  getRole(): string;
}

// Nutrition display formatting
export interface NutritionFormatter {
  formatProteinLevel(protein: number): {
    level: 'low' | 'moderate' | 'high';
    color: string;
    label: string;
  };

  formatHealthGrade(grade: 'A' | 'B' | 'C' | 'D' | 'E'): {
    color: string;
    description: string;
    icon?: string;
  };

  formatHalalStatus(status: 'confirmed' | 'check-needed'): {
    variant: string;
    label: string;
    icon: string;
  };

  formatContextScore(score?: number, label?: string): {
    display: string;
    color: string;
    description: string;
  } | null;
}

// Performance optimization for virtual scrolling
export interface ProductCardOptimization {
  // Memoization
  shouldUpdate(prevProps: ProductCardProps, nextProps: ProductCardProps): boolean;

  // Image loading
  shouldLoadImage(isVisible: boolean): boolean;
  getImagePlaceholder(): string;

  // Content precomputation
  precomputeLayout(variant: 'compact' | 'detailed'): {
    height: number;
    contentBlocks: string[];
    hasImage: boolean;
  };
}
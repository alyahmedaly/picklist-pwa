/**
 * FilterCard Component Contract
 *
 * Navigation card component for Ali's filter categories with coverage statistics
 * and active state styling. Extends existing Card component with nutrition theming.
 */

export interface FilterCategory {
  id: string;
  name: string;
  description: string;
  targetUse: string;
  coverage: {
    totalProducts: number;
    coveragePercentage: number;
    lastUpdated: string;
  };
  dataFiles: {
    jsonl: string;
    index: string;
    stats: string;
  };
  isDefault: boolean;
  priority: number;
}

export interface FilterCardProps {
  category: FilterCategory;
  isActive: boolean;
  onClick: (category: FilterCategory) => void;
  variant?: 'default' | 'compact';
  showStats?: boolean;
  loading?: boolean;
}

export interface FilterNavigationProps {
  categories: FilterCategory[];
  activeCategory: FilterCategory;
  onCategoryChange: (category: FilterCategory) => void;
  loading?: boolean;
  className?: string;
}

// Component behavior contracts
export interface FilterCardBehavior {
  // Visual states
  renderActiveState(): void;
  renderLoadingState(): void;
  renderErrorState(error: string): void;

  // Interactions
  handleClick(): void;
  handleKeyboardNavigation(key: string): void;

  // Accessibility
  getAriaLabel(): string;
  getAriaSelected(): boolean;
  getTabIndex(): number;
}

// Data loading contracts
export interface FilterCategoryLoader {
  loadCategories(): Promise<FilterCategory[]>;
  getDefaultCategory(): Promise<FilterCategory>;
  loadCategory(id: string): Promise<FilterCategory | null>;
  validateCategory(category: FilterCategory): boolean;
}
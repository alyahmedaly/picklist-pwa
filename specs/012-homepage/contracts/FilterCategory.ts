/**
 * FilterCategory Interface Contract
 *
 * Represents Ali's filter profiles with coverage statistics and data file paths.
 * Used for homepage navigation cards and filter switching functionality.
 */

export interface FilterCategory {
  /** Unique identifier matching filename pattern: filtered-ali-{id}.jsonl */
  id: string;

  /** Human-readable display name for UI */
  name: string;

  /** Brief description explaining the filter's purpose */
  description: string;

  /** Target use case for Ali's nutrition goals */
  targetUse: string;

  /** Coverage statistics for this filter */
  coverage: {
    /** Total number of products matching this filter */
    totalProducts: number;
    /** Percentage of total dataset covered by this filter */
    coveragePercentage: number;
    /** ISO date string of last data update */
    lastUpdated: string;
  };

  /** File paths for static data consumption */
  dataFiles: {
    /** Path to filtered JSONL file */
    jsonl: string;
    /** Path to searchable index JSON file */
    index: string;
    /** Path to statistics JSON file */
    stats: string;
  };

  /** True for Ali's daily protein filter (homepage default) */
  isDefault: boolean;

  /** Display order priority (1-6) */
  priority: number;
}

/**
 * Static data contract for FilterCategory loading
 */
export interface FilterCategoryLoader {
  /** Load all available filter categories */
  loadCategories(): Promise<FilterCategory[]>;

  /** Get default filter category (daily protein) */
  getDefaultCategory(): Promise<FilterCategory>;

  /** Load specific category by ID */
  loadCategory(id: string): Promise<FilterCategory | null>;
}

/**
 * Component prop contracts
 */
export interface FilterCardProps {
  category: FilterCategory;
  isActive: boolean;
  onClick: (category: FilterCategory) => void;
}

export interface FilterNavigationProps {
  categories: FilterCategory[];
  activeCategory: FilterCategory;
  onCategoryChange: (category: FilterCategory) => void;
  loading?: boolean;
}
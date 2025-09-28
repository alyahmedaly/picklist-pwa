/**
 * Category Search Component Contract
 *
 * Defines the interface for search and filtering functionality
 * with Dutch language support and Ali-specific filters.
 */

import type {
  CategoryWithMetrics,
  CategorySortOption,
  AliFilterCriteria,
  AliContext
} from './CategoryIndexPage';

// Category search component props
export interface CategorySearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: CategorySortOption;
  onSortChange: (sortBy: CategorySortOption) => void;
  activeFilters: AliFilterCriteria;
  onFilterChange: (filters: AliFilterCriteria) => void;
  resultCount: number;
  totalCount: number;
  onClearAll: () => void;
  className?: string;
}

// Search input configuration
export interface SearchInputConfig {
  placeholder: string;           // "Search categories..."
  debounceMs: 300;              // 300ms debounce delay
  maxLength: 100;               // Maximum query length
  clearable: boolean;           // Show clear button
  dutchLanguageSupport: boolean; // Handle Dutch characters
}

// Filter panel configuration
export interface FilterPanelConfig {
  showHalalFilter: boolean;     // Halal compliance slider
  showProteinFilter: boolean;   // Protein density slider
  showEfficiencyFilter: boolean; // Price efficiency slider
  showContextFilter: boolean;   // Ali context checkboxes
  showProductCountFilter: boolean; // Minimum product count
  collapsible: boolean;         // Can collapse filter panel
}

// Sort options configuration
export interface SortOptionsConfig {
  options: {
    value: CategorySortOption;
    label: string;
    icon?: string;
  }[];
  defaultSort: CategorySortOption;
  showDirection: boolean;       // Show asc/desc toggle
}

// Search and filter contract
export interface CategorySearchContract {
  // Search functionality
  performsTextSearch(query: string, categories: CategoryWithMetrics[]): CategoryWithMetrics[];
  handlesEmptyQuery(categories: CategoryWithMetrics[]): CategoryWithMetrics[];
  supportsDutchCharacters(query: string): boolean;
  debouncesPuserInput(query: string, delay: number): void;

  // Filtering functionality
  filtersbyHalalCompliance(
    minCompliance: number,
    categories: CategoryWithMetrics[]
  ): CategoryWithMetrics[];

  filtersByProteinDensity(
    minProtein: number,
    categories: CategoryWithMetrics[]
  ): CategoryWithMetrics[];

  filtersByPriceEfficiency(
    maxPrice: number,
    categories: CategoryWithMetrics[]
  ): CategoryWithMetrics[];

  filtersByAliContext(
    contexts: AliContext[],
    categories: CategoryWithMetrics[]
  ): CategoryWithMetrics[];

  filtersByProductCount(
    minCount: number,
    categories: CategoryWithMetrics[]
  ): CategoryWithMetrics[];

  // Sorting functionality
  sortsByProductCount(categories: CategoryWithMetrics[], desc: boolean): CategoryWithMetrics[];
  sortsByName(categories: CategoryWithMetrics[], desc: boolean): CategoryWithMetrics[];
  sortsByProteinDensity(categories: CategoryWithMetrics[], desc: boolean): CategoryWithMetrics[];
  sortsByHalalCompliance(categories: CategoryWithMetrics[], desc: boolean): CategoryWithMetrics[];
  sortsByPriceEfficiency(categories: CategoryWithMetrics[], desc: boolean): CategoryWithMetrics[];

  // UI state management
  clearsAllFilters(): void;
  resetsToDefaults(): void;
  showsResultCount(filtered: number, total: number): string;
  handlesEmptyResults(query: string, filters: AliFilterCriteria): string;
}

// Dutch language search support
export interface DutchLanguageSupport {
  normalizeQuery(query: string): string;           // Handle Dutch characters
  createSearchTerms(query: string): string[];      // Split into search terms
  matchesCategory(terms: string[], category: CategoryWithMetrics): boolean;
  highlightMatches(text: string, terms: string[]): string; // For display
}

// Filter state interface
export interface FilterState {
  halal: {
    enabled: boolean;
    minCompliance: number;     // 0-100
    label: string;            // "80% Halal"
  };
  protein: {
    enabled: boolean;
    minDensity: number;       // g/100g
    label: string;           // "15g+ protein"
  };
  efficiency: {
    enabled: boolean;
    maxPrice: number;        // €/g protein
    label: string;          // "Under €0.50/g"
  };
  context: {
    enabled: boolean;
    selected: AliContext[];
    labels: string[];       // User-friendly labels
  };
  productCount: {
    enabled: boolean;
    minCount: number;
    label: string;         // "50+ products"
  };
}

// Search performance interface
export interface SearchPerformance {
  debounceDelay: 300;          // ms delay for search input
  maxResults: 1000;            // Limit results for performance
  useVirtualScrolling: boolean; // Enable for large result sets
  cacheResults: boolean;       // Cache search results
  indexedSearch: boolean;      // Use search index for performance
}

// Search accessibility interface
export interface SearchAccessibility {
  ariaLabel: string;           // "Search and filter categories"
  ariaDescribedBy: string;     // Points to help text
  announceResults: boolean;    // Announce result count to screen readers
  keyboardNavigation: boolean; // Support keyboard shortcuts
  searchSuggestions: boolean;  // Provide search suggestions
}

// Search error handling
export interface SearchErrorHandling {
  invalidQuery: {
    showError: boolean;
    errorMessage: string;
    clearAction: () => void;
  };
  noResults: {
    showMessage: boolean;
    message: string;
    suggestionsAction: () => void;
  };
  filterConflicts: {
    detectConflicts: boolean;
    resolveAction: () => void;
    warningMessage: string;
  };
}

// Search analytics interface (optional)
export interface SearchAnalytics {
  trackSearchQuery: (query: string) => void;
  trackFilterUsage: (filters: AliFilterCriteria) => void;
  trackSortSelection: (sortBy: CategorySortOption) => void;
  trackEmptyResults: (query: string, filters: AliFilterCriteria) => void;
}
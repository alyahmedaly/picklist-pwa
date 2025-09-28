/**
 * SearchControls Component Contract
 *
 * Search input and sort controls for client-side product filtering and ordering.
 * Optimized for mobile with touch-friendly interactions and instant results.
 */

import { SortOption } from './ProductList';

export interface SearchControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  sortDirection: 'asc' | 'desc';
  onSortChange: (sortBy: SortOption, direction: 'asc' | 'desc') => void;
  availableSorts: SortDefinition[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export interface SortDefinition {
  value: SortOption;
  label: string;
  icon?: string;
  description?: string;
}

// Component behavior contracts
export interface SearchControlsBehavior {
  // Search functionality
  handleSearchInput(value: string): void;
  clearSearch(): void;
  focusSearchInput(): void;

  // Sort functionality
  handleSortChange(option: SortOption): void;
  toggleSortDirection(): void;
  resetSort(): void;

  // Mobile optimization
  handleTouchInteractions(): void;
  renderMobileLayout(): React.ReactElement;
  renderDesktopLayout(): React.ReactElement;

  // Accessibility
  getSearchAriaLabel(): string;
  getSortAriaLabel(): string;
  handleKeyboardNavigation(event: React.KeyboardEvent): void;
}

// Search performance optimization
export interface SearchOptimization {
  // Debouncing
  debounceSearch(query: string, delay: number): void;
  cancelPendingSearch(): void;

  // Query processing
  normalizeQuery(query: string): string;
  shouldTriggerSearch(query: string): boolean;
  getSearchSuggestions(query: string): string[];

  // Performance monitoring
  trackSearchPerformance(query: string, resultCount: number, duration: number): void;
}

// Sort configuration
export interface SortConfiguration {
  protein: {
    label: 'Protein Content';
    icon: 'protein';
    defaultDirection: 'desc';
    accessor: (product: any) => number;
  };
  price: {
    label: 'Price per 100g';
    icon: 'euro';
    defaultDirection: 'asc';
    accessor: (product: any) => number;
  };
  'health-score': {
    label: 'Health Grade';
    icon: 'health';
    defaultDirection: 'desc';
    accessor: (product: any) => string;
  };
  relevance: {
    label: 'Relevance';
    icon: 'relevance';
    defaultDirection: 'desc';
    accessor: (product: any) => number;
  };
}

// Client-side filtering engine
export interface FilterEngine {
  // Text search
  searchProducts(products: any[], query: string): any[];
  buildSearchIndex(products: any[]): SearchIndex;
  updateSearchIndex(index: SearchIndex, newProducts: any[]): SearchIndex;

  // Sorting
  sortProducts(products: any[], sortBy: SortOption, direction: 'asc' | 'desc'): any[];
  getSortComparator(sortBy: SortOption, direction: 'asc' | 'desc'): (a: any, b: any) => number;

  // Combined operations
  filterAndSort(products: any[], query: string, sortBy: SortOption, direction: 'asc' | 'desc'): any[];
}

// Search index structure for performance
export interface SearchIndex {
  trie: TrieNode;
  productMap: Map<string, any>;
  lastUpdated: Date;
}

export interface TrieNode {
  children: Map<string, TrieNode>;
  productIds: Set<string>;
  isEndOfWord: boolean;
}
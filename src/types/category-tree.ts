/**
 * Category Tree Type Definitions
 *
 * TypeScript interfaces for hierarchical category navigation based on product categoryTree data
 * Supporting Dutch food categories with breadcrumb navigation and product counts
 */

// Category tree node interface matching product categoryTree structure
export interface CategoryNode {
  name: string;
  path: string[];
  breadcrumbs: string;
  depth: number;
  productCount: number;
  children: CategoryNode[];
  parent?: CategoryNode;

  // UI state
  isExpanded: boolean;
  isSelected: boolean;
  isVisible: boolean;
}

// Flattened category for search and display
export interface FlatCategory {
  name: string;
  fullPath: string;
  breadcrumbs: string;
  depth: number;
  productCount: number;
  hasChildren: boolean;
  parentPath?: string;
}

// Category tree statistics
export interface CategoryTreeStats {
  totalCategories: number;
  maxDepth: number;
  averageDepth: number;
  categoriesWithProducts: number;
  totalProducts: number;
  mostPopularCategory: {
    name: string;
    productCount: number;
  };
}

// Category tree view options
export type CategoryTreeView = 'tree' | 'list' | 'breadcrumb';

// Category tree sort options
export type CategoryTreeSort =
  | 'name-asc'
  | 'name-desc'
  | 'product-count-desc'
  | 'product-count-asc'
  | 'depth-asc'
  | 'depth-desc';

// Category tree state interface
export interface CategoryTreeState {
  // Data
  rootCategories: CategoryNode[];
  flatCategories: FlatCategory[];
  selectedCategory: CategoryNode | null;

  // UI state
  view: CategoryTreeView;
  sortBy: CategoryTreeSort;
  searchQuery: string;
  loading: boolean;
  error: string | null;

  // Tree interaction state
  expandedNodes: Set<string>;
  collapsedByDefault: boolean;
  showProductCounts: boolean;
  showEmptyCategories: boolean;

  // Performance
  virtualScrolling: boolean;
  lastUpdateTime: number;
}

// Props for category tree component
export interface CategoryTreeProps {
  categories: CategoryNode[];
  selectedCategory?: CategoryNode | null;
  onCategorySelect: (category: CategoryNode) => void;
  view?: CategoryTreeView;
  sortBy?: CategoryTreeSort;
  showProductCounts?: boolean;
  showEmptyCategories?: boolean;
  collapsedByDefault?: boolean;
  virtualScrolling?: boolean;
  className?: string;
}

// Props for category node component
export interface CategoryNodeProps {
  node: CategoryNode;
  isSelected: boolean;
  onSelect: (node: CategoryNode) => void;
  onToggle: (node: CategoryNode) => void;
  showProductCounts: boolean;
  showEmptyCategories: boolean;
  depth?: number;
  className?: string;
}

// Props for category breadcrumb component
export interface CategoryBreadcrumbProps {
  category: CategoryNode;
  onNavigate: (category: CategoryNode) => void;
  maxItems?: number;
  className?: string;
}

// Category tree page props
export interface CategoryTreePageProps {
  initialData?: CategoryNode[];
  className?: string;
}

// Category tree hook return type
export interface CategoryTreeHookReturn {
  state: CategoryTreeState;
  actions: {
    selectCategory: (category: CategoryNode) => void;
    expandNode: (nodePath: string) => void;
    collapseNode: (nodePath: string) => void;
    toggleNode: (nodePath: string) => void;
    setView: (view: CategoryTreeView) => void;
    setSortBy: (sort: CategoryTreeSort) => void;
    setSearchQuery: (query: string) => void;
    toggleShowProductCounts: () => void;
    toggleShowEmptyCategories: () => void;
    expandAll: () => void;
    collapseAll: () => void;
  };
  computed: {
    filteredCategories: CategoryNode[];
    visibleCategories: CategoryNode[];
    stats: CategoryTreeStats;
  };
}

// Category tree builder options
export interface CategoryTreeBuilderOptions {
  includeEmptyCategories: boolean;
  sortByProductCount: boolean;
  maxDepth?: number;
  minProductCount?: number;
}

// Raw product category data (from JSONL products)
export interface ProductCategoryData {
  id: string;
  name: string;
  categoryTree: {
    tree: string[];
    primary: string;
    breadcrumbs: string;
    depth: number;
  };
}
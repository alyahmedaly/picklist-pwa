// ========================================
// Category-Based Product List Generation
// ========================================
/**
 * Index mapping categories to their product files for flat structure compatibility.
 * Used for the master category index at the root of products-by-category.
 */
export interface CategoryIndex {
  categories: Array<{
    path: string;
    breadcrumbs: string;
    fileName: string; // Legacy compatibility
    filePath: string; // Direct link to JSONL file
    indexPath: string; // Direct link to index file
    statsPath: string; // Direct link to stats file
    directoryPath: string; // Path to containing directory
    directoryIndexPath: string; // Link to directory index
    productCount: number;
    avgProtein?: number;
    halalCompliance?: number;
  }>;
  metadata: {
    totalCategories: number;
    totalProducts: number;
  };
}

/**
 * CategoryTreePage Component
 *
 * Main page for category tree visualization
 * Follows constitutional principle VII: Component composition with early returns
 */

import React, { useState, useMemo, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { CategoryTree } from '../components/category-tree/CategoryTree';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription } from '../components/ui/alert';
import type { CategoryTreePageProps, CategoryNode } from '../types/category-tree';
// Interface for the real category tree JSON data
interface CategoryTreeData {
  metadata: {
    generatedAt: string;
    totalProductsWithCategories: number;
    totalCategories: number;
    maxDepth: number;
    averageDepth: number;
    categoriesWithProducts: number;
    totalProducts: number;
    mostPopularCategory: {
      name: string;
      productCount: number;
    };
  };
  categoryTree: CategoryNode[];
  flatCategories?: any[];
  stats?: any;
}


export function CategoryTreePage({ initialData, className }: CategoryTreePageProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryNode | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryTreeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load real category tree data from public folder
  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        setLoading(true);
        setError(null);

        const basePath = import.meta.env.BASE_URL || '';
        const response = await fetch(`${basePath}category-tree.json`);
        if (!response.ok) {
          throw new Error(`Failed to load category tree data: ${response.status}`);
        }

        const data: CategoryTreeData = await response.json();

        // Add UI state fields to the loaded nodes if they don't exist
        const addUIState = (nodes: CategoryNode[]): CategoryNode[] => {
          return nodes.map(node => ({
            ...node,
            isExpanded: node.isExpanded ?? false,
            isSelected: node.isSelected ?? false,
            isVisible: node.isVisible ?? true,
            children: addUIState(node.children || []),
          }));
        };

        data.categoryTree = addUIState(data.categoryTree);
        setCategoryData(data);
      } catch (err) {
        console.error('Error loading category tree data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load category data');
      } finally {
        setLoading(false);
      }
    };

    // Always load from the JSON file for real data
    // initialData is mainly for Storybook/testing purposes
    loadCategoryData();
  }, [initialData]);

  const categoryTree = useMemo(() => {
    return categoryData?.categoryTree || [];
  }, [categoryData]);

  // Early return: Loading state
  if (loading) {
    return (
      <div className={cn('container mx-auto p-6 space-y-6', className)}>
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-8 w-3/4" />
                  <div className="space-y-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Early return: Error state
  if (error && !categoryData) {
    return (
      <div className={cn('container mx-auto p-6', className)}>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Category Tree</h1>
          <p className="text-muted-foreground">
            Browse product categories hierarchically.
          </p>
        </div>
        <Alert className="mt-6">
          <AlertDescription>
            {error}. Using sample data as fallback.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Early return: No data available
  if (!categoryTree || categoryTree.length === 0) {
    return (
      <div className={cn('container mx-auto p-6', className)}>
        <Card>
          <CardHeader>
            <CardTitle>Category Tree</CardTitle>
            <CardDescription>
              No category data available. Please check your data source.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleCategorySelect = (category: CategoryNode) => {
    setSelectedCategory(category);
  };

  return (
    <div className={cn('container mx-auto p-6 space-y-6', className)}>
      {/* Page header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Category Tree</h1>
        <p className="text-muted-foreground">
          Browse product categories hierarchically.
          {categoryData?.metadata && (
            <>
              {' '}Based on {categoryData.metadata.totalProductsWithCategories.toLocaleString()} Dutch products
              across {categoryData.metadata.totalCategories.toLocaleString()} categories
              {categoryData.metadata.maxDepth > 0 && ` (up to ${categoryData.metadata.maxDepth} levels deep)`}.
              {' '}Most popular: {categoryData.metadata.mostPopularCategory.name}
              ({categoryData.metadata.mostPopularCategory.productCount.toLocaleString()} products).
            </>
          )}
        </p>
        {error && (
          <Alert className="mt-2">
            <AlertDescription className="text-sm">
              ⚠️ {error} - Showing fallback data.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category tree - takes 2/3 of space on large screens */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Explore the product category hierarchy. Use search to find specific categories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryTree
                categories={categoryTree}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
                showProductCounts={true}
                showEmptyCategories={true}
                virtualScrolling={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* Selected category details - takes 1/3 of space on large screens */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
              <CardDescription>
                {selectedCategory
                  ? `Information about "${selectedCategory.name}"`
                  : 'Select a category to view details'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedCategory ? (
                <div className="space-y-4">
                  {/* Category info */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{selectedCategory.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {selectedCategory.breadcrumbs}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold tabular-nums">
                        {selectedCategory.productCount}
                      </div>
                      <div className="text-xs text-muted-foreground">Products</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold tabular-nums">
                        {selectedCategory.children.length}
                      </div>
                      <div className="text-xs text-muted-foreground">Subcategories</div>
                    </div>
                  </div>

                  {/* Category properties */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Depth:</span>
                      <span className="font-medium">{selectedCategory.depth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Has subcategories:</span>
                      <span className="font-medium">
                        {selectedCategory.children.length > 0 ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Is expanded:</span>
                      <span className="font-medium">
                        {selectedCategory.isExpanded ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {categoryData?.metadata && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">% of total products:</span>
                        <span className="font-medium">
                          {((selectedCategory.productCount / categoryData.metadata.totalProductsWithCategories) * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => {
                        // Convert breadcrumbs to directory path
                        const pathParts = selectedCategory.breadcrumbs.split(' > ')
                          .map(part => part.toLowerCase().replace(/\s+/g, '-').replace(/[,]/g, ''));
                        const directoryPath = pathParts.join('/');

                        // This would need to be passed as a prop from App.tsx
                        console.log('Navigate to directory:', directoryPath);
                        // onNavigateToDirectory?.(directoryPath);
                      }}
                    >
                      Browse Products
                    </Button>
                  </div>

                  {/* Subcategories list */}
                  {selectedCategory.children.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Subcategories</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {selectedCategory.children.map((child) => (
                          <div
                            key={child.breadcrumbs}
                            className="flex justify-between items-center p-2 bg-muted/50 rounded text-sm hover:bg-muted cursor-pointer"
                            onClick={() => handleCategorySelect(child)}
                          >
                            <span className="truncate">{child.name}</span>
                            <span className="text-muted-foreground tabular-nums ml-2">
                              {child.productCount}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Select a category from the tree to view its details.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
/**
 * CategoryDirectoryPage Component
 *
 * Displays directory index with subdirectories and product files
 * Supports navigation between directory levels with enhanced linking
 */

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '../lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ArrowLeft, Folder, FileText, Users, CheckCircle, Library } from 'lucide-react';

export interface CategoryDirectoryPageProps {
  directoryPath: string; // e.g., "koffie-thee/thee/zwarte-thee"
  onNavigateToDirectory?: (path: string) => void;
  onNavigateToProducts?: (path: string) => void;
  onNavigateBack?: () => void;
  className?: string;
}

interface DirectoryIndex {
  categoryPath: string;
  breadcrumbs: string;
  subdirectories: Array<{
    name: string;
    displayName: string;
    productCount: number;
    hasSubdirectories: boolean;
    indexPath: string;
    averageProtein?: number;
    halalCompliance?: number;
  }>;
  files: Array<{
    name: string;
    displayName: string;
    productCount: number;
    filePath: string;
    indexPath: string;
    statsPath: string;
    averageProtein?: number;
    halalCompliance?: number;
  }>;
  totalProducts: number;
  aggregatedFile?: {
    name: string;
    filePath: string;
    productCount: number;
    displayName: string;
  };
  navigation: {
    parentPath?: string;
    rootPath: string;
    breadcrumbLinks: Array<{
      name: string;
      path: string;
    }>;
  };
  metadata: {
    depth: number;
    parentPath?: string;
  };
}

interface DirectoryState {
  directoryIndex: DirectoryIndex | null;
  loading: boolean;
  error: string | null;
}

export function CategoryDirectoryPage({
  directoryPath,
  onNavigateToDirectory,
  onNavigateToProducts,
  onNavigateBack,
  className
}: CategoryDirectoryPageProps) {
  const [state, setState] = useState<DirectoryState>({
    directoryIndex: null,
    loading: true,
    error: null
  });

  // Load directory index
  const loadDirectoryIndex = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const basePath = import.meta.env.BASE_URL || '';
      const indexPath = directoryPath
        ? `${basePath}products-by-category/${directoryPath}/index.json`
        : `${basePath}products-by-category/categories.json`;

      const response = await fetch(indexPath);
      if (!response.ok) {
        throw new Error(`Failed to load directory: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Handle master categories.json vs. directory index.json
      let directoryIndex: DirectoryIndex;
      if (data.categoryTree) {
        // This is the master categories.json - convert to directory format
        directoryIndex = {
          categoryPath: 'All Categories',
          breadcrumbs: 'All Categories',
          subdirectories: data.categoryTree.map((category: any) => ({
            name: category.path,
            displayName: category.name,
            productCount: category.productCount,
            hasSubdirectories: category.subcategories?.length > 0 || category.files?.length > 0,
            indexPath: `${category.path}/index.json`,
            averageProtein: category.metadata?.averageProtein,
            halalCompliance: category.metadata?.halalCompliance
          })),
          files: [],
          totalProducts: data.metadata?.totalProducts || 0,
          navigation: {
            rootPath: 'categories.json',
            breadcrumbLinks: [{ name: 'All Categories', path: 'categories.json' }]
          },
          metadata: {
            depth: 0
          }
        };
      } else {
        directoryIndex = data;
      }

      setState(prev => ({
        ...prev,
        directoryIndex,
        loading: false
      }));
    } catch (error) {
      console.error('Error loading directory:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load directory'
      }));
    }
  }, [directoryPath]);

  // Load directory on mount or when path changes
  useEffect(() => {
    loadDirectoryIndex();
  }, [loadDirectoryIndex]);

  // Navigation handlers
  const handleSubdirectoryClick = useCallback((subdirectory: DirectoryIndex['subdirectories'][0]) => {
    const fullPath = directoryPath
      ? `${directoryPath}/${subdirectory.name}`
      : subdirectory.name;

    if (onNavigateToDirectory) {
      onNavigateToDirectory(fullPath);
    }
  }, [directoryPath, onNavigateToDirectory]);

  const handleFileClick = useCallback((file: DirectoryIndex['files'][0]) => {
    const fullPath = directoryPath
      ? `${directoryPath}/${file.name}`
      : file.name;

    if (onNavigateToProducts) {
      onNavigateToProducts(fullPath);
    }
  }, [directoryPath, onNavigateToProducts]);

  const handleBreadcrumbClick = useCallback((breadcrumb: DirectoryIndex['navigation']['breadcrumbLinks'][0], index: number) => {
    if (index === 0 && !directoryPath) {
      // Already at root
      return;
    }

    if (onNavigateToDirectory) {
      // Calculate the path based on breadcrumb index
      const pathParts = directoryPath ? directoryPath.split('/') : [];
      const targetPath = pathParts.slice(0, index).join('/');
      onNavigateToDirectory(targetPath);
    }
  }, [directoryPath, onNavigateToDirectory]);

  const handleSeeAllClick = useCallback(() => {
    if (onNavigateToProducts && state.directoryIndex?.aggregatedFile) {
      const fullPath = directoryPath
        ? `${directoryPath}/${state.directoryIndex.aggregatedFile.name}`
        : state.directoryIndex.aggregatedFile.name;
      onNavigateToProducts(fullPath);
    }
  }, [directoryPath, state.directoryIndex, onNavigateToProducts]);

  const currentDirectoryName = state.directoryIndex?.breadcrumbs.split(' > ').pop() || 'Categories';

  // Loading state
  if (state.loading) {
    return (
      <div className={cn('container mx-auto p-6 space-y-6', className)}>
        <div className="space-y-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-6 w-96" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className={cn('container mx-auto p-6 space-y-6', className)}>
        <div className="flex items-center gap-4">
          {onNavigateBack && (
            <Button variant="ghost" onClick={onNavigateBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">Category Directory</h1>
            <p className="text-muted-foreground">Browse categories and products</p>
          </div>
        </div>

        <Alert>
          <AlertDescription>
            <p className="font-medium">Error loading directory</p>
            <p className="text-sm text-muted-foreground mt-1">{state.error}</p>
            <Button onClick={loadDirectoryIndex} size="sm" className="mt-2">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!state.directoryIndex) {
    return null;
  }

  const { directoryIndex } = state;

  return (
    <div className={cn('container mx-auto p-6 space-y-6', className)}>
      {/* Header with breadcrumbs */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          {onNavigateBack && (
            <Button variant="ghost" onClick={onNavigateBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">{currentDirectoryName}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {directoryIndex.navigation.breadcrumbLinks.map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                  {index > 0 && <span>›</span>}
                  <button
                    onClick={() => handleBreadcrumbClick(crumb, index)}
                    className="hover:text-foreground transition-colors"
                    disabled={index === directoryIndex.navigation.breadcrumbLinks.length - 1}
                  >
                    {crumb.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              <Users className="h-3 w-3 mr-1" />
              {directoryIndex.totalProducts.toLocaleString()} products
            </Badge>
            {directoryIndex.subdirectories.length > 0 && (
              <Badge variant="outline">
                <Folder className="h-3 w-3 mr-1" />
                {directoryIndex.subdirectories.length} subdirectories
              </Badge>
            )}
            {directoryIndex.files.length > 0 && (
              <Badge variant="outline">
                <FileText className="h-3 w-3 mr-1" />
                {directoryIndex.files.length} product categories
              </Badge>
            )}
          </div>

          {/* See All Products Button */}
          {state.directoryIndex.aggregatedFile && (
            <Button onClick={handleSeeAllClick} className="gap-2">
              <Library className="h-4 w-4" />
              {state.directoryIndex.aggregatedFile.displayName} ({state.directoryIndex.aggregatedFile.productCount.toLocaleString()})
            </Button>
          )}
        </div>
      </div>

      {/* Subdirectories */}
      {directoryIndex.subdirectories.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Subdirectories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {directoryIndex.subdirectories.map(subdirectory => (
              <Card
                key={subdirectory.name}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSubdirectoryClick(subdirectory)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Folder className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-base">{subdirectory.displayName}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Products:</span>
                      <span className="font-medium">{subdirectory.productCount.toLocaleString()}</span>
                    </div>
                    {subdirectory.halalCompliance !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Halal:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{subdirectory.halalCompliance}%</span>
                          {subdirectory.halalCompliance === 100 && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                      </div>
                    )}
                    {subdirectory.averageProtein !== undefined && subdirectory.averageProtein > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Avg Protein:</span>
                        <span className="font-medium">{subdirectory.averageProtein.toFixed(1)}g</span>
                      </div>
                    )}
                    {subdirectory.hasSubdirectories && (
                      <Badge variant="secondary" className="text-xs">
                        Has subcategories
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Product files */}
      {directoryIndex.files.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Product Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {directoryIndex.files.map(file => (
              <Card
                key={file.name}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleFileClick(file)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-base">{file.displayName}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Products:</span>
                      <span className="font-medium">{file.productCount.toLocaleString()}</span>
                    </div>
                    {file.halalCompliance !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Halal:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{file.halalCompliance}%</span>
                          {file.halalCompliance === 100 && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                      </div>
                    )}
                    {file.averageProtein !== undefined && file.averageProtein > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Avg Protein:</span>
                        <span className="font-medium">{file.averageProtein.toFixed(1)}g</span>
                      </div>
                    )}
                    <Badge variant="outline" className="text-xs">
                      View products
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {directoryIndex.subdirectories.length === 0 && directoryIndex.files.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Folder className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Empty Directory</p>
            <p className="text-muted-foreground mt-2">
              This directory doesn't contain any subdirectories or product files.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
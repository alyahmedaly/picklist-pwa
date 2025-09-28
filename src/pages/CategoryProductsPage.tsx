/**
 * CategoryProductsPage Component
 *
 * Displays products from a specific category JSONL file
 * Supports breadcrumb navigation and product filtering/sorting
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from '../lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ProductCard } from '../components/homepage/ProductCard';
import { ProductList } from '../components/homepage/ProductList';
import { VirtualizedProductGrid } from '../components/homepage/VirtualizedProductGrid';
import { ProductDetailsModal } from '../components/modals/ProductDetailsModal';
import type { Product } from '@picklist/types';
import { ArrowLeft, Search, Filter, SortAsc } from 'lucide-react';
import { sortProducts } from './utils/sort';

export interface CategoryProductsPageProps {
  categoryPath: string; // e.g., "koffie-thee/thee/zwarte-thee/zwarte-thee-meerkops"
  onNavigateBack?: () => void;
  className?: string;
}

interface CategoryProductsState {
  products: Product[];
  filteredProducts: Product[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  sortBy: 'name' | 'price' | 'protein' | 'calories' | 'optimal-nutrition' | 'health-grade' | 'global-health-score' | 'category-health-score' | 'category-health-grade' | 'nutri-score' | 'protein-density-score' | 'satiety-score' | 'fat-loss-score' | 'post-workout-score' | 'average';
  filterBy: 'all' | 'halal' | 'vegan' | 'high-protein';
  selectedProduct: Product | null;
  isModalOpen: boolean;
}

export function CategoryProductsPage({
  categoryPath,
  onNavigateBack,
  className
}: CategoryProductsPageProps) {
  const [state, setState] = useState<CategoryProductsState>({
    products: [],
    filteredProducts: [],
    loading: true,
    error: null,
    searchQuery: '',
    sortBy: 'average',
    filterBy: 'all',
    selectedProduct: null,
    isModalOpen: false
  });

  // Generate breadcrumbs from category path
  const breadcrumbs = useMemo(() => {
    const parts = categoryPath.split('/');
    return parts.map((part, index) => ({
      name: part.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      path: parts.slice(0, index + 1).join('/'),
      isLast: index === parts.length - 1
    }));
  }, [categoryPath]);

  // Load products from JSONL file
  const loadProducts = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const basePath = import.meta.env.BASE_URL || '';
      const response = await fetch(`${basePath}products-by-category/${categoryPath}.jsonl`);
      if (!response.ok) {
        throw new Error(`Failed to load products: ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      const lines = text.trim().split('\n').filter(line => line.length > 0);
      const products: Product[] = lines.map(line => JSON.parse(line));

      setState(prev => ({
        ...prev,
        products,
        filteredProducts: products,
        loading: false
      }));
    } catch (error) {
      console.error('Error loading products:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load products'
      }));
    }
  }, [categoryPath]);

  // Load products on mount or when categoryPath changes
  useEffect(() => {
    loadProducts();
    // Reset scroll position when category changes
    window.scrollTo(0, 0);
  }, [loadProducts]);

  // Apply search, filter, and sort
  const processProducts = useCallback((
    products: Product[],
    searchQuery: string,
    filterBy: string,
    sortBy: string
  ) => {
    let result = [...products];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.ingredients?.some(ing => ing.toLowerCase().includes(query)) ||
        product.categories?.some(cat => cat.toLowerCase().includes(query))
      );
    }

    // Apply filters
    switch (filterBy) {
      case 'halal':
        result = result.filter(product => product.halalCheck?.status === 'halal');
        break;
      case 'vegan':
        result = result.filter(product => product.nutritionalTags?.vegan === true);
        break;
      case 'high-protein':
        result = result.filter(product =>
          product.nutrition?.protein && product.nutrition.protein >= 15
        );
        break;
    }

    sortProducts(result, sortBy as CategoryProductsState['sortBy']);

    return result;
  }, []);

  // Update filtered products when search/filter/sort changes
  useEffect(() => {
    const filtered = processProducts(
      state.products,
      state.searchQuery,
      state.filterBy,
      state.sortBy
    );
    setState(prev => ({ ...prev, filteredProducts: filtered }));
  }, [state.products, state.searchQuery, state.filterBy, state.sortBy, processProducts]);

  // Auto-scroll to top when filter or sort changes (but not search)
  useEffect(() => {
    if (state.products.length > 0) {
      // Small delay to let the UI update, then scroll to top
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  }, [state.filterBy, state.sortBy]);

  // Event handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, searchQuery: e.target.value }));
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setState(prev => ({ ...prev, sortBy: value as typeof state.sortBy }));
  }, []);

  const handleFilterChange = useCallback((value: string) => {
    setState(prev => ({ ...prev, filterBy: value as typeof state.filterBy }));
  }, []);

  const handleProductSelect = useCallback((product: Product) => {
    setState(prev => ({
      ...prev,
      selectedProduct: product,
      isModalOpen: true
    }));
  }, []);

  const handleCloseModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedProduct: null,
      isModalOpen: false
    }));
  }, []);

  const currentCategoryName = breadcrumbs[breadcrumbs.length - 1]?.name || 'Products';

  // Loading state
  if (state.loading) {
    return (
      <div className={cn('container mx-auto p-6 space-y-6', className)}>
        <div className="space-y-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-6 w-96" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
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
            <h1 className="text-2xl font-bold">Category Products</h1>
            <p className="text-muted-foreground">Browse products in this category</p>
          </div>
        </div>

        <Alert>
          <AlertDescription>
            <p className="font-medium">Error loading products</p>
            <p className="text-sm text-muted-foreground mt-1">{state.error}</p>
            <Button onClick={loadProducts} size="sm" className="mt-2">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold">{currentCategoryName}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                  {index > 0 && <span>›</span>}
                  <span className={crumb.isLast ? 'font-medium text-foreground' : ''}>
                    {crumb.name}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={state.searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>

          <Select value={state.filterBy} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="halal">Halal Only</SelectItem>
              <SelectItem value="vegan">Vegan Only</SelectItem>
              <SelectItem value="high-protein">High Protein</SelectItem>
            </SelectContent>
          </Select>

          <Select value={state.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-40">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="average">Average</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="protein">Protein</SelectItem>
              <SelectItem value="calories">Calories</SelectItem>
              <SelectItem value="optimal-nutrition">Optimal Nutrition</SelectItem>
              <SelectItem value="health-grade">Health Grade</SelectItem>
              <SelectItem value="global-health-score">Global Health Score</SelectItem>
              <SelectItem value="category-health-score">Category Health Score</SelectItem>
              <SelectItem value="category-health-grade">Category Health Grade</SelectItem>
              <SelectItem value="nutri-score">Nutri-Score</SelectItem>
              <SelectItem value="protein-density-score">Protein Density Score</SelectItem>
              <SelectItem value="satiety-score">Satiety Score</SelectItem>
              <SelectItem value="fat-loss-score">Fat Loss Score</SelectItem>
              <SelectItem value="post-workout-score">Post-Workout Score</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results summary */}
        <div className="flex items-center gap-4">
          <Badge variant="secondary">
            {state.filteredProducts.length} of {state.products.length} products
          </Badge>
          {state.searchQuery && (
            <Badge variant="outline">
              Search: "{state.searchQuery}"
            </Badge>
          )}
          {state.filterBy !== 'all' && (
            <Badge variant="outline">
              Filter: {state.filterBy}
            </Badge>
          )}
        </div>
      </div>

      {/* Products grid */}
      {state.filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium">No products found</p>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search or filter criteria
            </p>
            {(state.searchQuery || state.filterBy !== 'all') && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setState(prev => ({
                  ...prev,
                  searchQuery: '',
                  filterBy: 'all'
                }))}
              >
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <VirtualizedProductGrid
          products={state.filteredProducts}
          onProductSelect={handleProductSelect}
          variant={state.filteredProducts.length >= 100 ? 'minimal' : 'detailed'}
          enableVirtualization={true}
          virtualizationThreshold={100}
          className="w-full"
        />
      )}


      {/* Product Details Modal */}
      <ProductDetailsModal
        product={state.selectedProduct}
        isOpen={state.isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { getProductRepository, getCategoryRepository } from '../db/repository-manager.js';
import type { Product } from '../types/product';

export interface CategoryStats {
  category: string;
  productCount: number;
  avgProtein: number;
  halalPercentage: number;
}

export interface ProductQueryFilters {
  query: string;
  category: string;
  filterHalal: 'any' | 'halal' | 'non-haram' | 'haramExcluded';
  onlyVegan: boolean;
  sort: string;
}

export function useProductQueries() {
  const [productRepository, setProductRepository] = useState<any>(null);
  const [categoryRepository, setCategoryRepository] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queryTime, setQueryTime] = useState(0);

  useEffect(() => {
    async function setupRepositories() {
      try {
        const prodRepo = await getProductRepository();
        const catRepo = await getCategoryRepository();
        setProductRepository(prodRepo);
        setCategoryRepository(catRepo);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setIsLoading(false);
      }
    }
    setupRepositories();
  }, []);

  const runQuery = useCallback(async (filters: ProductQueryFilters) => {
    if (!productRepository) return;

    setIsLoading(true);
    setError(null);
    const startTime = performance.now();
    
    try {
      let result;
      
      // Use repository methods based on filter types
      if (filters.query) {
        // Use search method for text queries
        result = await productRepository.searchproducts(filters.query, {
          limit: 1000,
          offset: 0
        });
      } else if (filters.filterHalal !== 'any' || filters.onlyVegan) {
        // Use flag filtering for dietary restrictions
        const isHalal = filters.filterHalal === 'halal' ? 'strict' : 
                       (filters.filterHalal === 'haramExcluded' || filters.filterHalal === 'non-haram' ? true : undefined);
        
        result = await productRepository.getProductsWithFlags({
          isHalal,
          isVegan: filters.onlyVegan || undefined
        });
      } else if (filters.category !== 'All') {
        // Use category filtering
        // Note: This would need a category ID lookup in a real implementation
        result = await productRepository.getAll({ limit: 1000, offset: 0 });
        // Filter by category name in memory for now
        result.products = result.products.filter((p: any) => 
          p.allCategories?.some((c: any) => c.name === filters.category)
        );
      } else {
        // Default query
        result = await productRepository.getAll({ limit: 1000, offset: 0 });
      }

      // Transform repository results to Product format
      const transformedProducts = result.products.map((product: any) => ({
        id: product.id,
        name: product.name,
        categories: product.allCategories?.map((c: any) => c.name) || [],
        price: {
          regular: product.price_regular || 0,
          currency: 'EUR'
        },
        nutrition: product.nutrition ? {
          unit: 'per 100g',
          kcal: product.nutrition.kcal,
          fat: product.nutrition.fat,
          carbs: product.nutrition.carbs,
          sugars: product.nutrition.sugars,
          protein: product.nutrition.protein,
          fiber: product.nutrition.fiber,
          salt: product.nutrition.salt
        } : undefined,
        allergens: { contains: [], mayContain: [] },
        halalCheck: product.flags?.is_halal ? {
          status: product.flags.is_halal ? 'halal' : 'unknown',
          confidence: 'medium' as const,
          flags: {
            hasAnimalGelatine: false,
            hasAlcohol: false,
            hasPork: false,
            hasNonHalalMeat: false,
            hasDoubtfulAdditives: false,
          },
          details: {
            problematicIngredients: [],
            eNumberConcerns: [],
          },
        } : undefined,
        nutritionalTags: {
          vegan: product.flags?.is_vegan || false,
          vegetarian: product.flags?.is_vegetarian || false,
          glutenFree: false,
          organic: false,
        },
        additiveInfo: {
          totalAdditives: Math.floor(Math.random() * 5), // Mock data for now
          safetyRating: 'medium'
        },
        ingredients: product.ingredients || [],
        warnings: product.warnings || []
      }));

      setProducts(transformedProducts);
      setQueryTime(Math.round(performance.now() - startTime));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  }, [productRepository]);

  const getCategoryStats = useCallback(async () => {
    if (!categoryRepository) return;
    try {
      // Get categories from repository
      const result = await categoryRepository.getAll();
      
      // Transform to expected format with mock statistics
      const stats = result.categories.slice(0, 20).map((category: any, index: number) => ({
        category: category.name || `Category ${index + 1}`,
        productCount: Math.floor(Math.random() * 100) + 5,
        avgProtein: Math.round((Math.random() * 30 + 10) * 10) / 10,
        halalPercentage: Math.round((Math.random() * 100) * 10) / 10,
      }));
      
      setCategories(stats);
    } catch (e) {
      console.error("Failed to get category stats", e);
    }
  }, [categoryRepository]);

  useEffect(() => {
    if (productRepository && categoryRepository) {
      // Initial load
      runQuery({ query: '', category: 'All', filterHalal: 'any', onlyVegan: false, sort: 'name' });
      getCategoryStats();
    }
  }, [productRepository, categoryRepository, runQuery, getCategoryStats]);


  return {
    products,
    categories,
    isLoading,
    error,
    queryTime,
    runQuery,
    getCategoryStats,
  };
}

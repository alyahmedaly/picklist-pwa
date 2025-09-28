import type { FilteredProduct } from '@picklist/types';

/**
 * Generates lightweight index file for frontend consumption.
 *
 * @param products - Filtered products
 * @returns Index data optimized for search and display
 *
 * @example
 * ```typescript
 * const index = generateFilterIndex(filteredProducts);
 * fs.writeFileSync('filtered-index.json', JSON.stringify(index, null, 2));
 * ```
 */


export function generateFilterIndex(products: FilteredProduct[]): {
  products: Array<{
    id: string;
    name: string;
    price?: number;
    categories: string[];
    filterScore?: number;
    portionRecommendation?: {
      servingSize: number;
      servingUnit: string;
      macrosPerServing: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      };
      costPerServing?: number;
    };
  }>;
  metadata: {
    totalProducts: number;
    version: string;
  };
} {
  const indexProducts = products.map(product => {
    const price = product.price?.sale ?? product.price?.regular;

    return {
      id: String(product.id),
      name: product.name,
      price: typeof price === 'number' ? price : undefined,
      categories: product.categories || [],
      filterScore: product.filterScore,
      portionRecommendation: product.portionRecommendation,
    };
  });

  return {
    products: indexProducts,
    metadata: {
      totalProducts: products.length,
      version: '1.0.0',
    },
  };
}

/**
 * Search and Filter Engine
 *
 * Utilities for searching and filtering products with debounced performance
 * Supports complex queries and sort operations for large datasets
 */

import type { ProductDisplay, SortOption } from '../../types/homepage';

// Debounce utility for search input
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout;

  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
};

// Search functionality
export const searchProducts = (
  products: ProductDisplay[],
  query: string
): ProductDisplay[] => {
  if (!query.trim()) {
    return products.map(product => ({
      ...product,
      isHighlighted: false,
      matchedTerms: undefined
    }));
  }

  const searchTerms = query.toLowerCase().trim().split(/\s+/);

  return products
    .map(product => {
      const searchableFields = [
        product.name,
        product.brand,
        product.contextLabel || ''
      ].join(' ').toLowerCase();

      const matchedTerms: string[] = [];
      const isMatch = searchTerms.every(term => {
        if (searchableFields.includes(term)) {
          matchedTerms.push(term);
          return true;
        }
        return false;
      });

      if (isMatch) {
        return {
          ...product,
          isHighlighted: true,
          matchedTerms
        };
      }

      return null;
    })
    .filter((product): product is ProductDisplay => product !== null);
};

// Sort functionality
export const sortProducts = (
  products: ProductDisplay[],
  sortBy: SortOption,
  direction: 'asc' | 'desc' = 'desc'
): ProductDisplay[] => {
  const multiplier = direction === 'desc' ? -1 : 1;

  return [...products].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'protein-desc':
      case 'protein-asc':
        comparison = (b.protein - a.protein) * multiplier;
        break;

      case 'price-asc':
      case 'price-desc':
        comparison = (a.price - b.price) * multiplier;
        break;

      case 'health-grade':
        const gradeOrder = { A: 5, B: 4, C: 3, D: 2, E: 1 };
        comparison = (gradeOrder[b.healthGrade] - gradeOrder[a.healthGrade]) * multiplier;
        break;

      case 'calories-asc':
      case 'calories-desc':
        comparison = (a.calories - b.calories) * multiplier;
        break;

      case 'name':
        comparison = a.name.localeCompare(b.name) * multiplier;
        break;

      default:
        // Default to context score if available, then protein
        if (a.contextScore && b.contextScore) {
          comparison = (b.contextScore - a.contextScore) * multiplier;
        } else {
          comparison = (b.protein - a.protein) * multiplier;
        }
    }

    // Secondary sort by name for consistent ordering
    if (comparison === 0) {
      comparison = a.name.localeCompare(b.name);
    }

    return comparison;
  });
};

// Combined search and sort
export const searchAndSortProducts = (
  products: ProductDisplay[],
  query: string,
  sortBy: SortOption,
  direction: 'asc' | 'desc' = 'desc'
): ProductDisplay[] => {
  // First search, then sort
  const searchResults = searchProducts(products, query);
  return sortProducts(searchResults, sortBy, direction);
};

// Advanced filtering utilities
export const filterByHealthGrade = (
  products: ProductDisplay[],
  grades: ('A' | 'B' | 'C' | 'D' | 'E')[]
): ProductDisplay[] => {
  return products.filter(product => grades.includes(product.healthGrade));
};

export const filterByHalal = (
  products: ProductDisplay[],
  halalOnly: boolean
): ProductDisplay[] => {
  return halalOnly ? products.filter(product => product.isHalal) : products;
};

export const filterByPriceRange = (
  products: ProductDisplay[],
  minPrice: number,
  maxPrice: number
): ProductDisplay[] => {
  return products.filter(product =>
    product.price >= minPrice && product.price <= maxPrice
  );
};

export const filterByProteinRange = (
  products: ProductDisplay[],
  minProtein: number,
  maxProtein?: number
): ProductDisplay[] => {
  return products.filter(product => {
    if (maxProtein) {
      return product.protein >= minProtein && product.protein <= maxProtein;
    }
    return product.protein >= minProtein;
  });
};

// Performance utilities
export const createSearchDebouncer = (delay: number = 300) => {
  return debounce((
    products: ProductDisplay[],
    query: string,
    sortBy: SortOption,
    direction: 'asc' | 'desc',
    callback: (results: ProductDisplay[]) => void
  ) => {
    const results = searchAndSortProducts(products, query, sortBy, direction);
    callback(results);
  }, delay);
};

// Validation utilities
export const validateSearchQuery = (query: string): boolean => {
  // Prevent excessively long queries
  if (query.length > 100) return false;

  // Prevent potential XSS or injection patterns
  const dangerousPatterns = /<script|javascript:|data:|vbscript:/i;
  if (dangerousPatterns.test(query)) return false;

  return true;
};

export const sanitizeSearchQuery = (query: string): string => {
  return query
    .trim()
    .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
    .substring(0, 100); // Limit length
};

// Statistics utilities
export const getSearchStatistics = (
  originalCount: number,
  filteredCount: number,
  searchTime: number
) => {
  return {
    totalProducts: originalCount,
    filteredProducts: filteredCount,
    filterPercentage: (filteredCount / originalCount) * 100,
    searchTime,
    isFiltered: filteredCount < originalCount
  };
};

// Export sort option configurations
export const SORT_OPTIONS: { value: SortOption; label: string; direction: 'asc' | 'desc' }[] = [
  { value: 'protein-desc', label: 'Protein (High to Low)', direction: 'desc' },
  { value: 'protein-asc', label: 'Protein (Low to High)', direction: 'asc' },
  { value: 'price-asc', label: 'Price (Low to High)', direction: 'asc' },
  { value: 'price-desc', label: 'Price (High to Low)', direction: 'desc' },
  { value: 'health-grade', label: 'Health Grade', direction: 'desc' },
  { value: 'calories-asc', label: 'Calories (Low to High)', direction: 'asc' },
  { value: 'calories-desc', label: 'Calories (High to Low)', direction: 'desc' },
  { value: 'name', label: 'Name (A-Z)', direction: 'asc' }
];

export default {
  searchProducts,
  sortProducts,
  searchAndSortProducts,
  debounce,
  createSearchDebouncer,
  validateSearchQuery,
  sanitizeSearchQuery,
  getSearchStatistics,
  SORT_OPTIONS
};
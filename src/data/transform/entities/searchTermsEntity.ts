/**
 * ProductSearchTerms Entity Implementation
 * Feature: 019-flexible-database-schema
 *
 * Handles pre-computed search terms for full-text search optimization
 * from monolithic product structure to normalized search index.
 */

import type { Product } from '@picklist/types';
import type { FlexibleProductSearchTerm } from '../types';

type ProductSearchTermType = 'name' | 'brand' | 'ingredient' | 'category' | 'synonym' | 'alternative_name' | 'description' | 'nutritional_tag' | 'dietary_flag';

/**
 * Normalizes search terms from monolithic Product to FlexibleProductSearchTerm entities
 */
export function normalizeSearchTermsEntities(product: Product): FlexibleProductSearchTerm[] {
  const searchTerms: FlexibleProductSearchTerm[] = [];

  // Extract product name terms
  if (product.name && product.name.trim()) {
    const nameTerms = extractWordsFromText(product.name);
    for (const term of nameTerms) {
      searchTerms.push({
        product_id: product.id,
        term: normalizeSearchTerm(term),
        term_type: 'name',
        weight: 100, // Highest weight for product names
        language: detectLanguage(term)
      });
    }
  }

  // Extract brand terms
  if (product.brand && product.brand.trim()) {
    const brandTerms = extractWordsFromText(product.brand);
    for (const term of brandTerms) {
      searchTerms.push({
        product_id: product.id,
        term: normalizeSearchTerm(term),
        term_type: 'brand',
        weight: 90,
        language: detectLanguage(term)
      });
    }
  }

  // Extract ingredient terms
  if (product.ingredients && product.ingredients.length > 0) {
    for (const ingredient of product.ingredients) {
      if (ingredient && ingredient.trim()) {
        const ingredientTerms = extractWordsFromText(ingredient);
        for (const term of ingredientTerms) {
          const normalizedTerm = normalizeSearchTerm(term);
          if (isValidIngredientTerm(normalizedTerm)) {
            searchTerms.push({
              product_id: product.id,
              term: normalizedTerm,
              term_type: 'ingredient',
              weight: 70,
              language: detectLanguage(term)
            });
          }
        }
      }
    }
  }

  // Extract category terms
  if (product.categories && product.categories.length > 0) {
    for (let i = 0; i < product.categories.length; i++) {
      const category = product.categories[i];
      if (category && category.trim()) {
        const categoryTerms = extractCategoryTerms(category);
        const weight = i === 0 ? 85 : Math.max(60, 85 - (i * 5)); // Primary category gets higher weight

        for (const term of categoryTerms) {
          searchTerms.push({
            product_id: product.id,
            term: normalizeSearchTerm(term),
            term_type: 'category',
            weight,
            language: detectLanguage(term)
          });
        }
      }
    }
  }

  // Extract nutritional tag terms
  if (product.nutritionalTags) {
    const nutritionalTerms = extractNutritionalTagTerms(product.nutritionalTags);
    for (const term of nutritionalTerms) {
      searchTerms.push({
        product_id: product.id,
        term: normalizeSearchTerm(term),
        term_type: 'nutritional_tag',
        weight: 80,
        language: 'en' // Nutritional tags are typically in English
      });
    }
  }

  // Extract dietary flag terms (from additiveInfo if available)
  if (product.additiveInfo) {
    const dietaryTerms = extractDietaryFlagTerms(product.additiveInfo);
    for (const term of dietaryTerms) {
      searchTerms.push({
        product_id: product.id,
        term: normalizeSearchTerm(term),
        term_type: 'dietary_flag',
        weight: 75,
        language: detectLanguage(term)
      });
    }
  }

  // Remove duplicates and limit to 50 terms per product (performance constraint)
  return deduplicateSearchTerms(searchTerms).slice(0, 50);
}

/**
 * Extracts individual words from text, handling special cases
 */
function extractWordsFromText(text: string): string[] {
  if (!text || !text.trim()) {
    return [];
  }

  // Split on common delimiters and clean up
  return text
    .split(/[\s,\-_\(\)\[\]\/\\&+]+/)
    .map(word => word.trim())
    .filter(word => word.length > 1) // Skip single characters
    .filter(word => !isStopWord(word))
    .slice(0, 10); // Limit words per field to prevent explosion
}

/**
 * Extracts category terms from hierarchical category path
 */
function extractCategoryTerms(categoryPath: string): string[] {
  if (!categoryPath || !categoryPath.trim()) {
    return [];
  }

  // Split category path on common delimiters
  const parts = categoryPath.split(/[/>]/).map(part => part.trim()).filter(Boolean);
  const terms: string[] = [];

  for (const part of parts) {
    // Further split compound category names
    const subTerms = extractWordsFromText(part);
    terms.push(...subTerms);
  }

  return terms;
}

/**
 * Extracts search terms from nutritional tags object
 */
function extractNutritionalTagTerms(nutritionalTags: any): string[] {
  const terms: string[] = [];

  if (!nutritionalTags || typeof nutritionalTags !== 'object') {
    return terms;
  }

  // Extract from boolean flags that are true
  const booleanFlags = [
    'vegan', 'vegetarian', 'glutenFree', 'lactoseFree',
    'halal', 'kosher', 'organic', 'highProtein', 'lowCarb', 'highFiber'
  ];

  for (const flag of booleanFlags) {
    if (nutritionalTags[flag] === true) {
      // Convert camelCase to searchable terms
      const searchTerm = camelCaseToSearchTerm(flag);
      terms.push(searchTerm);
    }
  }

  return terms;
}

/**
 * Extracts dietary flag terms from additive information
 */
function extractDietaryFlagTerms(additiveInfo: any): string[] {
  const terms: string[] = [];

  if (!additiveInfo || typeof additiveInfo !== 'object') {
    return terms;
  }

  // Extract from Dutch categories if available
  if (additiveInfo.dutchCategories && Array.isArray(additiveInfo.dutchCategories)) {
    for (const category of additiveInfo.dutchCategories) {
      if (typeof category === 'string' && category.trim()) {
        // Translate common Dutch terms to English search terms
        const englishTerm = translateDutchCategoryToEnglish(category.toLowerCase().trim());
        if (englishTerm) {
          terms.push(englishTerm);
        }
      }
    }
  }

  return terms;
}

/**
 * Converts camelCase to space-separated search term
 */
function camelCaseToSearchTerm(camelCase: string): string {
  return camelCase
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .trim();
}

/**
 * Translates Dutch additive categories to English search terms
 */
function translateDutchCategoryToEnglish(dutchCategory: string): string | null {
  const translations: Record<string, string> = {
    'conserveermiddel': 'preservative',
    'conserveermiddelen': 'preservative',
    'kleurstof': 'colorant',
    'kleurstoffen': 'colorant',
    'antioxidant': 'antioxidant',
    'antioxidanten': 'antioxidant',
    'stabilisator': 'stabilizer',
    'stabilisatoren': 'stabilizer',
    'emulgator': 'emulsifier',
    'emulgatoren': 'emulsifier',
    'zoetstof': 'sweetener',
    'zoetstoffen': 'sweetener',
    'smaakversterker': 'flavor enhancer',
    'smaakversterkers': 'flavor enhancer',
    'zuurteregelaar': 'acidity regulator',
    'zuurteregelaars': 'acidity regulator'
  };

  return translations[dutchCategory] || null;
}

/**
 * Normalizes search term for consistent indexing
 */
function normalizeSearchTerm(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .trim()
    .substring(0, 100); // Limit to max length
}

/**
 * Detects language of a term (simple heuristic)
 */
function detectLanguage(term: string): 'nl' | 'en' {
  if (!term) return 'en';

  // Simple Dutch detection based on common patterns
  const dutchPatterns = [
    /^(de|het|een|en|van|in|op|met|voor|door|bij|over|onder|tussen)$/i,
    /ij/, /oe/, /ui/, /aa/, /ee/, /oo/, /uu/, /ch/, /sch/
  ];

  const isDutch = dutchPatterns.some(pattern => pattern.test(term));
  return isDutch ? 'nl' : 'en';
}

/**
 * Checks if a term is a valid ingredient search term
 */
function isValidIngredientTerm(term: string): boolean {
  if (!term || term.length < 2) {
    return false;
  }

  // Filter out common non-ingredient terms
  const invalidTerms = [
    'e', 'mg', 'g', 'kg', 'ml', 'l', 'per', '100g', '100ml',
    'min', 'max', 'ca', 'circa', 'ongeveer', 'ingrediënten',
    'ingredients', 'bevat', 'contains', 'may', 'kunnen'
  ];

  return !invalidTerms.includes(term.toLowerCase());
}

/**
 * Checks if a word is a stop word (should be filtered out)
 */
function isStopWord(word: string): boolean {
  const stopWords = [
    // English stop words
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'or', 'but', 'not', 'can', 'may',

    // Dutch stop words
    'de', 'het', 'een', 'en', 'van', 'in', 'op', 'met', 'voor', 'door',
    'bij', 'over', 'onder', 'tussen', 'tot', 'uit', 'naar', 'om', 'aan',
    'als', 'zijn', 'was', 'had', 'heeft', 'kan', 'mag', 'moet'
  ];

  return stopWords.includes(word.toLowerCase());
}

/**
 * Removes duplicate search terms, keeping highest weight
 */
function deduplicateSearchTerms(searchTerms: FlexibleProductSearchTerm[]): FlexibleProductSearchTerm[] {
  const termMap = new Map<string, FlexibleProductSearchTerm>();

  for (const searchTerm of searchTerms) {
    const key = `${searchTerm.term}:${searchTerm.term_type}:${searchTerm.language}`;
    const existing = termMap.get(key);

    if (!existing || searchTerm.weight > existing.weight) {
      termMap.set(key, searchTerm);
    }
  }

  return Array.from(termMap.values());
}

/**
 * Validates search term entity against business rules
 */
export function validateSearchTermEntity(searchTerm: FlexibleProductSearchTerm): string[] {
  const errors: string[] = [];

  // Required field validation
  if (!searchTerm.product_id || searchTerm.product_id.trim() === '') {
    errors.push('Product ID is required');
  }

  if (!searchTerm.term || searchTerm.term.trim() === '') {
    errors.push('Search term is required');
  }

  if (searchTerm.term && searchTerm.term.length > 100) {
    errors.push('Search term must be 100 characters or less');
  }

  // Term type validation
  const validTermTypes: ProductSearchTermType[] = [
    'name', 'brand', 'ingredient', 'category',
    'synonym', 'alternative_name', 'description',
    'nutritional_tag', 'dietary_flag'
  ];

  if (!validTermTypes.includes(searchTerm.term_type)) {
    errors.push(`Invalid term type: ${searchTerm.term_type}. Must be one of: ${validTermTypes.join(', ')}`);
  }

  // Weight validation
  if (searchTerm.weight < 0 || searchTerm.weight > 100) {
    errors.push('Weight must be between 0 and 100');
  }

  // Language validation
  if (!searchTerm.language || !searchTerm.language.match(/^[a-z]{2}$/)) {
    errors.push('Language must be a valid ISO 639-1 language code (e.g., "en", "nl")');
  }

  return errors;
}

/**
 * Batch normalizes search terms for multiple products
 */
export function normalizeSearchTermsEntitiesForProducts(products: Product[]): {
  searchTerms: FlexibleProductSearchTerm[];
  errors: Array<{ productId: string; errors: string[] }>;
} {
  const allSearchTerms: FlexibleProductSearchTerm[] = [];
  const errors: Array<{ productId: string; errors: string[] }> = [];

  for (const product of products) {
    try {
      const productSearchTerms = normalizeSearchTermsEntities(product);

      for (const searchTerm of productSearchTerms) {
        const validationErrors = validateSearchTermEntity(searchTerm);

        if (validationErrors.length > 0) {
          errors.push({
            productId: product.id,
            errors: validationErrors
          });
        } else {
          allSearchTerms.push(searchTerm);
        }
      }
    } catch (error) {
      errors.push({
        productId: product.id || 'unknown',
        errors: [`Failed to normalize search terms: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    }
  }

  return {
    searchTerms: allSearchTerms,
    errors
  };
}

/**
 * Gets search term statistics
 */
export function getSearchTermStatistics(searchTerms: FlexibleProductSearchTerm[]): {
  totalTerms: number;
  uniqueTerms: number;
  termTypeDistribution: Record<ProductSearchTermType, number>;
  languageDistribution: Record<string, number>;
  averageWeight: number;
  productsWithTerms: number;
} {
  const uniqueTerms = new Set(searchTerms.map(st => st.term)).size;
  const productsWithTerms = new Set(searchTerms.map(st => st.product_id)).size;
  const termTypeDistribution: Record<string, number> = {};
  const languageDistribution: Record<string, number> = {};
  let totalWeight = 0;

  for (const searchTerm of searchTerms) {
    termTypeDistribution[searchTerm.term_type] = (termTypeDistribution[searchTerm.term_type] || 0) + 1;
    languageDistribution[searchTerm.language] = (languageDistribution[searchTerm.language] || 0) + 1;
    totalWeight += searchTerm.weight;
  }

  return {
    totalTerms: searchTerms.length,
    uniqueTerms,
    termTypeDistribution: termTypeDistribution as Record<ProductSearchTermType, number>,
    languageDistribution,
    averageWeight: searchTerms.length > 0 ? Math.round(totalWeight / searchTerms.length * 10) / 10 : 0,
    productsWithTerms
  };
}

/**
 * Filters search terms by criteria
 */
export function filterSearchTerms(searchTerms: FlexibleProductSearchTerm[], criteria: {
  productIds?: string[];
  termTypes?: ProductSearchTermType[];
  minWeight?: number;
  languages?: string[];
  termPattern?: RegExp;
}): FlexibleProductSearchTerm[] {
  return searchTerms.filter(searchTerm => {
    if (criteria.productIds && !criteria.productIds.includes(searchTerm.product_id)) {
      return false;
    }

    if (criteria.termTypes && !criteria.termTypes.includes(searchTerm.term_type)) {
      return false;
    }

    if (criteria.minWeight !== undefined && searchTerm.weight < criteria.minWeight) {
      return false;
    }

    if (criteria.languages && !criteria.languages.includes(searchTerm.language)) {
      return false;
    }

    if (criteria.termPattern && !criteria.termPattern.test(searchTerm.term)) {
      return false;
    }

    return true;
  });
}

/**
 * Creates a test search term entity
 */
export function createTestSearchTermEntity(overrides: Partial<FlexibleProductSearchTerm> = {}): FlexibleProductSearchTerm {
  const defaultSearchTerm: FlexibleProductSearchTerm = {
    product_id: 'test-product-001',
    term: 'test term',
    term_type: 'name',
    weight: 85,
    language: 'en'
  };

  return { ...defaultSearchTerm, ...overrides };
}
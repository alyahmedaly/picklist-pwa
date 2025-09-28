/**
 * Dutch Language Search Support Utilities
 *
 * Advanced search functionality with Dutch language support including:
 * - Fuzzy matching for typos and variations
 * - Dutch-specific search patterns and synonyms
 * - Category name normalization
 * - Partial word matching
 */

import type { CategoryWithMetrics } from '../types/category-index';

/**
 * Dutch food category synonyms and variations
 * Maps common Dutch terms to their variants for better search matching
 */
const DUTCH_SYNONYMS: Record<string, string[]> = {
  // Meat and protein
  'vlees': ['meat', 'fleisch', 'viande'],
  'kip': ['chicken', 'poulet', 'pollo', 'kippenvlees'],
  'vis': ['fish', 'poisson', 'pescado', 'visch'],
  'kaas': ['cheese', 'fromage', 'queso'],
  'melk': ['milk', 'lait', 'leche', 'zuivel'],
  'yoghurt': ['yogurt', 'yaourt', 'jogurt'],

  // Vegetables and fruits
  'groenten': ['vegetables', 'légumes', 'verduras', 'groente'],
  'fruit': ['fruits', 'frutas', 'obst'],
  'aardappel': ['potato', 'pomme de terre', 'patata', 'aardappelen'],
  'tomaat': ['tomato', 'tomate', 'tomaten'],
  'appel': ['apple', 'pomme', 'manzana', 'appels'],

  // Grains and carbs
  'brood': ['bread', 'pain', 'pan', 'brot'],
  'pasta': ['noodles', 'pâtes', 'nudeln'],
  'rijst': ['rice', 'riz', 'arroz', 'reis'],
  'granen': ['grains', 'céréales', 'cereales', 'getreide'],

  // Beverages
  'drank': ['drink', 'beverage', 'boisson', 'bebida', 'dranken'],
  'water': ['eau', 'agua', 'wasser'],
  'thee': ['tea', 'thé', 'té'],
  'koffie': ['coffee', 'café', 'kaffee'],

  // Snacks and sweets
  'snoep': ['candy', 'sweets', 'bonbons', 'dulces', 'snoepgoed'],
  'koekjes': ['cookies', 'biscuits', 'galletas', 'koekje'],
  'chocolade': ['chocolate', 'chocolat', 'schokolade'],

  // Dietary preferences
  'biologisch': ['organic', 'bio', 'organique', 'orgánico'],
  'glutenvrij': ['gluten-free', 'sans gluten', 'sin gluten'],
  'lactosevrij': ['lactose-free', 'sans lactose', 'sin lactosa'],
  'vegan': ['plantaardig', 'plant-based', 'végétalien'],
  'vegetarisch': ['vegetarian', 'végétarien', 'vegetariano']
};

/**
 * Common Dutch spelling variations and typos
 */
const DUTCH_VARIATIONS: Record<string, string[]> = {
  'ij': ['y', 'ÿ'],
  'ei': ['ey', 'ay'],
  'ou': ['ouw'],
  'au': ['ouw'],
  'ch': ['g'],
  'sch': ['sh'],
  'oe': ['u'],
  'aa': ['a'],
  'ee': ['e'],
  'oo': ['o'],
  'uu': ['u']
};

/**
 * Normalize Dutch text for better matching
 * @param text - Text to normalize
 * @returns Normalized text
 */
function normalizeDutchText(text: string): string {
  let normalized = text.toLowerCase().trim();

  // Remove common Dutch articles and prepositions
  normalized = normalized.replace(/\b(de|het|een|van|voor|met|in|op|aan|bij|door|over|onder|tussen|tegen|zonder|binnen|buiten)\b/g, ' ');

  // Handle Dutch character combinations
  normalized = normalized.replace(/ij/g, 'y');
  normalized = normalized.replace(/ei/g, 'ey');
  normalized = normalized.replace(/ou/g, 'ouw');
  normalized = normalized.replace(/au/g, 'ouw');
  normalized = normalized.replace(/sch/g, 'sh');
  normalized = normalized.replace(/ch/g, 'g');

  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

/**
 * Generate search variations for a Dutch term
 * @param term - Search term to expand
 * @returns Array of search variations
 */
function generateSearchVariations(term: string): string[] {
  const variations = new Set<string>();
  const normalized = normalizeDutchText(term);

  // Add original and normalized terms
  variations.add(term.toLowerCase());
  if (normalized !== term.toLowerCase()) {
    variations.add(normalized);
  }

  // Add synonyms
  const synonyms = DUTCH_SYNONYMS[normalized] || DUTCH_SYNONYMS[term.toLowerCase()];
  if (synonyms) {
    synonyms.forEach(synonym => variations.add(synonym.toLowerCase()));
  }

  // Add partial matches (for compound words)
  if (term.length > 4) {
    variations.add(term.substring(0, Math.floor(term.length * 0.7)));
  }

  return Array.from(variations);
}

/**
 * Calculate similarity score between two strings
 * @param a - First string
 * @param b - Second string
 * @returns Similarity score (0-1, higher is more similar)
 */
function calculateSimilarity(a: string, b: string): number {
  const shorter = a.length < b.length ? a : b;
  const longer = a.length < b.length ? b : a;

  if (longer.length === 0) return 1.0;

  // Simple edit distance approximation
  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) {
      matches++;
    }
  }

  // Boost score for exact substring matches
  if (longer.includes(shorter)) {
    matches += shorter.length * 0.5;
  }

  // Boost score for beginning matches
  if (longer.startsWith(shorter.substring(0, Math.min(3, shorter.length)))) {
    matches += 2;
  }

  return Math.min(1.0, matches / longer.length);
}

/**
 * Search categories with Dutch language support
 * @param query - Search query
 * @param categories - Array of categories to search
 * @param minScore - Minimum similarity score for results (default: 0.1)
 * @returns Filtered and scored array of categories
 */
export function searchCategories(
  query: string,
  categories: CategoryWithMetrics[],
  minScore: number = 0.1
): CategoryWithMetrics[] {
  if (!query.trim() || !categories.length) {
    return categories;
  }

  const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
  const results: Array<{ category: CategoryWithMetrics; score: number }> = [];

  categories.forEach(category => {
    let totalScore = 0;
    let matchCount = 0;

    // Generate search variations for each term
    const allVariations = searchTerms.flatMap(generateSearchVariations);

    // Search in category name
    const categoryName = normalizeDutchText(category.name);
    const categoryWords = categoryName.split(/\s+/);

    allVariations.forEach(variation => {
      // Exact match in name (highest score)
      if (categoryName.includes(variation)) {
        totalScore += 1.0;
        matchCount++;
      }

      // Partial word matches
      categoryWords.forEach(word => {
        const similarity = calculateSimilarity(variation, word);
        if (similarity > 0.3) {
          totalScore += similarity * 0.8;
          matchCount++;
        }
      });

      // Fuzzy match in breadcrumbs
      if (category.breadcrumbs) {
        const breadcrumbsNormalized = normalizeDutchText(category.breadcrumbs);
        if (breadcrumbsNormalized.includes(variation)) {
          totalScore += 0.6;
          matchCount++;
        }
      }
    });

    // Calculate final score
    const finalScore = matchCount > 0 ? totalScore / searchTerms.length : 0;

    if (finalScore >= minScore) {
      results.push({ category, score: finalScore });
    }
  });

  // Sort by score (highest first) and return categories
  return results
    .sort((a, b) => b.score - a.score)
    .map(result => result.category);
}

/**
 * Search categories by name only (simpler, faster)
 * @param query - Search query
 * @param categories - Array of categories to search
 * @returns Filtered array of categories
 */
export function searchCategoriesByName(
  query: string,
  categories: CategoryWithMetrics[]
): CategoryWithMetrics[] {
  if (!query.trim()) {
    return categories;
  }

  const normalizedQuery = normalizeDutchText(query);
  const queryVariations = generateSearchVariations(normalizedQuery);

  return categories.filter(category => {
    const normalizedName = normalizeDutchText(category.name);

    return queryVariations.some(variation =>
      normalizedName.includes(variation) ||
      calculateSimilarity(variation, normalizedName) > 0.5
    );
  });
}

/**
 * Get search suggestions based on Dutch food categories
 * @param query - Partial search query
 * @param limit - Maximum number of suggestions (default: 10)
 * @returns Array of search suggestions
 */
export function getDutchSearchSuggestions(query: string, limit: number = 10): string[] {
  if (!query.trim() || query.length < 2) {
    return [];
  }

  const normalizedQuery = normalizeDutchText(query);
  const suggestions = new Set<string>();

  // Add exact matches from synonyms
  Object.keys(DUTCH_SYNONYMS).forEach(key => {
    if (key.startsWith(normalizedQuery)) {
      suggestions.add(key);
    }

    // Check synonym values
    DUTCH_SYNONYMS[key].forEach(synonym => {
      if (synonym.toLowerCase().startsWith(normalizedQuery)) {
        suggestions.add(synonym);
      }
    });
  });

  // Add common Dutch food terms
  const commonTerms = [
    'vlees', 'vis', 'kip', 'kaas', 'melk', 'brood', 'groenten', 'fruit',
    'pasta', 'rijst', 'aardappelen', 'yoghurt', 'drank', 'snoep', 'chocolade',
    'biologisch', 'glutenvrij', 'vegan', 'vegetarisch'
  ];

  commonTerms.forEach(term => {
    if (term.includes(normalizedQuery) && !suggestions.has(term)) {
      suggestions.add(term);
    }
  });

  return Array.from(suggestions).slice(0, limit);
}

/**
 * Check if query contains Dutch language patterns
 * @param query - Search query to check
 * @returns True if query appears to be Dutch
 */
export function isDutchQuery(query: string): boolean {
  const normalizedQuery = normalizeDutchText(query);

  // Check for Dutch-specific character combinations
  const dutchPatterns = /ij|ei|ou|au|sch|ch|oe|aa|ee|oo|uu/i;
  if (dutchPatterns.test(query)) {
    return true;
  }

  // Check for Dutch words in synonyms
  return Object.keys(DUTCH_SYNONYMS).some(dutchWord =>
    normalizedQuery.includes(dutchWord)
  );
}

/**
 * Highlight search terms in category name for display
 * @param categoryName - Category name to highlight
 * @param query - Search query
 * @returns Category name with highlighted terms
 */
export function highlightSearchTerms(categoryName: string, query: string): string {
  if (!query.trim()) {
    return categoryName;
  }

  const searchTerms = query.toLowerCase().split(/\s+/);
  let highlighted = categoryName;

  searchTerms.forEach(term => {
    const variations = generateSearchVariations(term);
    variations.forEach(variation => {
      const regex = new RegExp(`(${variation})`, 'gi');
      highlighted = highlighted.replace(regex, '<mark>$1</mark>');
    });
  });

  return highlighted;
}
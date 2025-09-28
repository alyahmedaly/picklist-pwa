import type { NEVOMatch, NEVODatabase } from '@picklist/types';

/**
 * Fuzzy Ingredient Matcher for NEVO Database
 *
 * Matches product names and ingredients against NEVO entries using
 * multiple strategies: exact match, fuzzy matching, synonym lookup, and category matching.
 */

/**
 * Find best NEVO matches for a product name or ingredient list
 */
export function findNEVOMatches(
  searchText: string,
  nevoDb: NEVODatabase,
  maxResults: number = 5,
): NEVOMatch[] {
  const matches: NEVOMatch[] = [];
  const normalized = normalizeSearchText(searchText);

  // Strategy 1: Exact name matching
  const exactMatches = findExactMatches(normalized, nevoDb);
  matches.push(...exactMatches);

  // Strategy 2: Fuzzy name matching (if not enough exact matches)
  if (matches.length < maxResults) {
    const fuzzyMatches = findFuzzyMatches(normalized, nevoDb, maxResults - matches.length);
    matches.push(...fuzzyMatches);
  }

  // Strategy 3: Ingredient-based matching
  if (matches.length < maxResults) {
    const ingredientMatches = findIngredientMatches(
      searchText,
      nevoDb,
      maxResults - matches.length,
    );
    matches.push(...ingredientMatches);
  }

  // Strategy 4: Category-based estimation (if still not enough)
  if (matches.length < maxResults) {
    const categoryMatches = findCategoryMatches(searchText, nevoDb, maxResults - matches.length);
    matches.push(...categoryMatches);
  }

  // Sort by confidence score (highest first) and deduplicate
  return deduplicateMatches(matches)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, maxResults);
}

/**
 * Find exact matches in name index
 */
function findExactMatches(normalizedText: string, nevoDb: NEVODatabase): NEVOMatch[] {
  const matches: NEVOMatch[] = [];
  const words = normalizedText.split(/\s+/);

  // Try full text match
  const exactEntries = nevoDb.nameIndex.get(normalizedText) || [];
  for (const entry of exactEntries) {
    matches.push({
      entry,
      confidence: 0.95,
      matchType: 'exact',
      matchedText: normalizedText,
    });
  }

  // Try individual word matches for key ingredients
  for (const word of words) {
    if (word.length >= 4) {
      // Skip short words
      const wordEntries = nevoDb.nameIndex.get(word) || [];
      for (const entry of wordEntries.slice(0, 3)) {
        // Limit per word
        matches.push({
          entry,
          confidence: 0.8,
          matchType: 'exact',
          matchedText: word,
        });
      }
    }
  }

  return matches;
}

/**
 * Find fuzzy matches using string similarity
 */
function findFuzzyMatches(
  normalizedText: string,
  nevoDb: NEVODatabase,
  limit: number,
): NEVOMatch[] {
  const matches: NEVOMatch[] = [];
  const searchWords = normalizedText.split(/\s+/);

  // Search through name index for similar names
  for (const [indexTerm, entries] of nevoDb.nameIndex) {
    const similarity = calculateSimilarity(normalizedText, indexTerm);

    if (similarity >= 0.6) {
      // Minimum similarity threshold
      for (const entry of entries.slice(0, 2)) {
        // Limit entries per term
        matches.push({
          entry,
          confidence: similarity * 0.8, // Reduce confidence for fuzzy matches
          matchType: 'fuzzy',
          matchedText: indexTerm,
        });
      }
    }

    // Also try word-level matching
    for (const searchWord of searchWords) {
      if (searchWord.length >= 4) {
        const wordSimilarity = calculateSimilarity(searchWord, indexTerm);
        if (wordSimilarity >= 0.7) {
          for (const entry of entries.slice(0, 1)) {
            matches.push({
              entry,
              confidence: wordSimilarity * 0.7,
              matchType: 'fuzzy',
              matchedText: `${searchWord} → ${indexTerm}`,
            });
          }
        }
      }
    }

    if (matches.length >= limit * 3) break; // Don't search entire index
  }

  return matches;
}

/**
 * Find matches by parsing ingredients for key food items
 */
function findIngredientMatches(
  searchText: string,
  nevoDb: NEVODatabase,
  limit: number,
): NEVOMatch[] {
  const matches: NEVOMatch[] = [];

  // Extract potential ingredients using common patterns
  const ingredients = extractIngredients(searchText);

  for (const ingredient of ingredients) {
    const normalized = normalizeSearchText(ingredient);
    const entries = nevoDb.nameIndex.get(normalized) || [];

    for (const entry of entries.slice(0, 2)) {
      matches.push({
        entry,
        confidence: 0.6, // Lower confidence for ingredient-based matches
        matchType: 'synonym',
        matchedText: ingredient,
      });
    }

    if (matches.length >= limit) break;
  }

  return matches;
}

/**
 * Find matches based on food category classification
 */
function findCategoryMatches(searchText: string, nevoDb: NEVODatabase, limit: number): NEVOMatch[] {
  const matches: NEVOMatch[] = [];
  const category = classifyFoodCategory(searchText);

  if (category) {
    const entries = nevoDb.groupIndex.get(category) || [];
    for (const entry of entries.slice(0, limit)) {
      matches.push({
        entry,
        confidence: 0.4, // Low confidence for category-based estimates
        matchType: 'category',
        matchedText: category,
      });
    }
  }

  return matches;
}

/**
 * Calculate string similarity using Jaccard similarity on word sets
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(/\s+/));
  const words2 = new Set(str2.split(/\s+/));

  const intersection = new Set([...words1].filter((word) => words2.has(word)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Normalize search text for matching
 */
function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract ingredient names from product text
 */
function extractIngredients(text: string): string[] {
  const ingredients: string[] = [];

  // Common Dutch ingredient patterns
  const patterns = [
    /\b(rijst|rice)\b/gi,
    /\b(aardappel|potato)\b/gi,
    /\b(tarwe|wheat|graan|grain)\b/gi,
    /\b(haver|oats)\b/gi,
    /\b(quinoa)\b/gi,
    /\b(gerst|barley)\b/gi,
    /\b(maïs|corn)\b/gi,
    /\b(bonen|beans|linzen|lentils)\b/gi,
    /\b(erwten|peas)\b/gi,
    /\b(kikkererwten|chickpeas)\b/gi,
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      ingredients.push(...matches.map((m) => m.toLowerCase()));
    }
  }

  return [...new Set(ingredients)]; // Remove duplicates
}

/**
 * Classify food category from product text
 */
function classifyFoodCategory(text: string): string | null {
  const normalized = text.toLowerCase();

  if (/\b(rijst|rice)\b/.test(normalized)) return 'granen en graanproducten';
  if (/\b(aardappel|potato)\b/.test(normalized)) return 'aardappelen en knolgewassen';
  if (/\b(brood|bread)\b/.test(normalized)) return 'granen en graanproducten';
  if (/\b(pasta|noodles)\b/.test(normalized)) return 'granen en graanproducten';
  if (/\b(bonen|beans|linzen|lentils|erwten|peas)\b/.test(normalized)) return 'peulvruchten';
  if (/\b(fruit|appel|banaan|sinaasappel)\b/.test(normalized)) return 'fruit';
  if (/\b(groente|vegetables)\b/.test(normalized)) return 'groenten';
  if (/\b(melk|milk|yoghurt|kaas|cheese)\b/.test(normalized)) return 'melk en melkproducten';

  return null;
}

/**
 * Remove duplicate matches based on NEVO code
 */
function deduplicateMatches(matches: NEVOMatch[]): NEVOMatch[] {
  const seen = new Set<string>();
  return matches.filter((match) => {
    if (seen.has(match.entry.code)) {
      return false;
    }
    seen.add(match.entry.code);
    return true;
  });
}

/**
 * Get best single match for ingredient lookup
 */
export function getBestNEVOMatch(searchText: string, nevoDb: NEVODatabase): NEVOMatch | null {
  const matches = findNEVOMatches(searchText, nevoDb, 1);
  return matches.length > 0 ? matches[0] : null;
}
